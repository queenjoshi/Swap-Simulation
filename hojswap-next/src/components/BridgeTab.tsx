"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  useAccount,
  useBalance,
  useChainId,
  usePublicClient,
  useSendTransaction,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { encodeFunctionData, formatUnits, parseUnits, type Hex } from "viem";
import { base, mainnet } from "wagmi/chains";
import { cronos, robinhood, xrp, getChainName } from "@/lib/chains";
import { clampToDecimals, formatCompactNumber, isValidNumberInput } from "@/lib/format";
import { useToast } from "@/components/Toast";
import {
  STARGATE_V2_ABI,
  SIMPLE_TRANSFER_ABI,
  STARGATE_EID,
  getStargatePool,
  getStargateRouteTokens,
  addressToBytes32,
} from "@/lib/stargate";
import {
  getLiFiRouteTokens,
  getLiFiTokenAddress,
  isLiFiNative,
  type LiFiQuote,
} from "@/lib/lifi";
import { apiUrl } from "@/lib/api";
import { HOUSE_WALLET } from "@/lib/tokens";
import { saveTransaction } from "@/lib/transactions";
import { calculateHouseFeeAmount, HOUSE_FEE_BPS } from "@/lib/quote";

const SLIPPAGE_BPS = 50;

const ALL_CHAINS = [
  { id: mainnet.id, name: "Ethereum" },
  { id: base.id, name: "Base" },
  { id: cronos.id, name: "Cronos" },
  { id: robinhood.id, name: "Robinhood Chain" },
  { id: xrp.id, name: "XRP Ledger" },
];

const TOKEN_DECIMALS: Record<string, number> = { USDC: 6, USDT: 6, ETH: 18 };

type BridgeMode = "stargate" | "lifi" | "unsupported";

function getBridgeMode(fromChainId: number, toChainId: number): BridgeMode {
  if (fromChainId === xrp.id || toChainId === xrp.id) return "unsupported";
  const stargate = getStargateRouteTokens(fromChainId, toChainId);
  if (stargate.length > 0) return "stargate";
  const lifi = getLiFiRouteTokens(fromChainId, toChainId);
  if (lifi.length > 0) return "lifi";
  return "unsupported";
}

type BridgeStep =
  | "idle"
  | "approving"
  | "sending_fee"
  | "waiting_fee"
  | "bridging"
  | "waiting_bridge"
  | "waiting_destination"
  | "done";

type BridgeGuardState = {
  status: "idle" | "checking" | "verified" | "failed";
  blockNumber?: bigint;
  message?: string;
};

type DestinationState = {
  status: "idle" | "pending" | "completed" | "partial" | "refunded" | "failed" | "not_verified";
  message?: string;
  received?: string;
};

type LiFiStatusResponse = {
  status?: "NOT_FOUND" | "PENDING" | "DONE" | "FAILED";
  substatus?: string;
  substatusMessage?: string;
  receiving?: {
    amount?: string;
    token?: { symbol?: string; decimals?: number };
  };
  error?: string;
};

export function BridgeTab({
  selectedChainId,
  onChainChange,
}: {
  selectedChainId: number;
  onChainChange: (chainId: number) => void;
}) {
  const { showToast } = useToast();
  const chainId = useChainId();
  const { address, isConnected } = useAccount();
  const { switchChainAsync, isPending: isSwitching } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();
  const { sendTransactionAsync } = useSendTransaction();
  const publicClient = usePublicClient({ chainId: selectedChainId });

  const fromChainId = selectedChainId;
  const [toChainId, setToChainId] = useState<number>(
    fromChainId === mainnet.id ? base.id : mainnet.id,
  );
  const [selectedToken, setSelectedToken] = useState<string>("USDC");
  const [amount, setAmount] = useState<string>("");
  const [step, setStep] = useState<BridgeStep>("idle");
  const [bridgeGuard, setBridgeGuard] = useState<BridgeGuardState>({ status: "idle" });
  const [destinationState, setDestinationState] = useState<DestinationState>({ status: "idle" });

  function resetBridgeVerification() {
    setBridgeGuard({ status: "idle" });
    setDestinationState({ status: "idle" });
  }

  // Stargate state
  const [lzNativeFee, setLzNativeFee] = useState<bigint | null>(null);
  const [lzFeeLoading, setLzFeeLoading] = useState(false);
  const [sgAllowance, setSgAllowance] = useState<bigint | null>(null);

  // Li.Fi state
  const [lifiQuote, setLifiQuote] = useState<LiFiQuote | null>(null);
  const [lifiLoading, setLifiLoading] = useState(false);
  const [lifiError, setLifiError] = useState<string | null>(null);
  const [lifiAllowance, setLifiAllowance] = useState<bigint | null>(null);

  // Tx hash tracking
  const [feeTxHash, setFeeTxHash] = useState<`0x${string}` | undefined>();
  const [bridgeTxHash, setBridgeTxHash] = useState<`0x${string}` | undefined>();
  const lifiExecRef = useRef<(() => Promise<void>) | null>(null);

  const { data: feeTxReceipt } = useWaitForTransactionReceipt({ hash: feeTxHash, query: { enabled: !!feeTxHash } });
  const { data: bridgeTxReceipt } = useWaitForTransactionReceipt({ hash: bridgeTxHash, query: { enabled: !!bridgeTxHash } });

  const verifyBridgeCall = useCallback(async ({
    to,
    data,
    value,
  }: {
    to: `0x${string}`;
    data: Hex;
    value: bigint;
  }) => {
    if (!publicClient || !address) throw new Error("House Guard needs a connected wallet and chain client");
    setBridgeGuard({ status: "checking" });
    try {
      const blockNumber = await publicClient.getBlockNumber();
      await publicClient.call({ account: address, to, data, value, blockNumber });
      setBridgeGuard({ status: "verified", blockNumber });
    } catch (error: unknown) {
      const detail = error instanceof Error && error.message
        ? error.message.split("\n")[0].slice(0, 180)
        : "The chain rejected the simulated bridge transaction";
      setBridgeGuard({ status: "failed", message: detail });
      throw new Error(`House Guard blocked this bridge: ${detail}`);
    }
  }, [address, publicClient]);

  const bridgeMode = useMemo(
    () => getBridgeMode(fromChainId, toChainId),
    [fromChainId, toChainId],
  );

  const availableTokens = useMemo(() => {
    if (bridgeMode === "stargate") return getStargateRouteTokens(fromChainId, toChainId);
    if (bridgeMode === "lifi") return getLiFiRouteTokens(fromChainId, toChainId);
    return [];
  }, [bridgeMode, fromChainId, toChainId]);

  const availableDestinations = ALL_CHAINS.filter((c) => c.id !== fromChainId);

  useEffect(() => {
    if (!availableDestinations.some((c) => c.id === toChainId)) {
      const first = availableDestinations[0];
      if (first) setToChainId(first.id);
    }
  }, [fromChainId]);

  useEffect(() => {
    if (availableTokens.length > 0 && !availableTokens.includes(selectedToken)) {
      setSelectedToken(availableTokens[0]!);
    }
    setLifiQuote(null);
    setLifiError(null);
  }, [bridgeMode, availableTokens, selectedToken]);

  const decimals = TOKEN_DECIMALS[selectedToken] ?? 18;
  const isNativeToken = selectedToken === "ETH" && (fromChainId === mainnet.id || fromChainId === base.id);

  const tokenContractAddress = useMemo((): `0x${string}` | undefined => {
    if (isNativeToken) return undefined;
    if (bridgeMode === "stargate") {
      const map: Record<string, Partial<Record<number, `0x${string}`>>> = {
        USDC: { [mainnet.id]: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", [base.id]: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" },
        USDT: { [mainnet.id]: "0xdAC17F958D2ee523a2206206994597C13D831ec7" },
      };
      return map[selectedToken]?.[fromChainId];
    }
    if (bridgeMode === "lifi") {
      const addr = getLiFiTokenAddress(selectedToken, fromChainId);
      if (!addr || isLiFiNative(addr)) return undefined;
      return addr as `0x${string}`;
    }
    return undefined;
  }, [isNativeToken, bridgeMode, selectedToken, fromChainId]);

  const { data: tokenBalance } = useBalance({
    address,
    chainId: fromChainId,
    token: tokenContractAddress,
    query: { enabled: isConnected && !!address && chainId === fromChainId, refetchInterval: 12_000 },
  });

  const amountNum = parseFloat(amount) || 0;
  const houseFee = amountNum * (HOUSE_FEE_BPS / 10000);
  const bridgeAmount = amountNum - houseFee;

  const amountBig = useMemo(() => {
    if (!amount || !isValidNumberInput(amount) || amountNum === 0) return null;
    try { return parseUnits(amount, decimals); } catch { return null; }
  }, [amount, decimals, amountNum]);

  const houseFeeAmountBig = amountBig != null ? calculateHouseFeeAmount(amountBig) : null;
  const bridgeAmountBig = amountBig != null && houseFeeAmountBig != null ? amountBig - houseFeeAmountBig : null;
  const minAmountBig = bridgeAmountBig != null ? (bridgeAmountBig * BigInt(10000 - SLIPPAGE_BPS)) / 10000n : null;

  const sgPoolAddress = bridgeMode === "stargate" ? getStargatePool(selectedToken, fromChainId) : null;
  const dstEid = STARGATE_EID[toChainId];

  // ─── Stargate LZ fee quote ───────────────────────────────────────────────
  useEffect(() => {
    if (bridgeMode !== "stargate" || !bridgeAmountBig || !dstEid || !address || !sgPoolAddress || !publicClient) {
      setLzNativeFee(null);
      return;
    }
    let cancelled = false;
    setLzFeeLoading(true);
    const sendParam = {
      dstEid,
      to: addressToBytes32(address),
      amountLD: bridgeAmountBig,
      minAmountLD: minAmountBig ?? 0n,
      extraOptions: "0x" as `0x${string}`,
      composeMsg: "0x" as `0x${string}`,
      oftCmd: "0x" as `0x${string}`,
    };
    publicClient
      .readContract({ address: sgPoolAddress, abi: STARGATE_V2_ABI, functionName: "quoteSend", args: [sendParam, false] })
      .then((r) => { if (!cancelled) setLzNativeFee((r as any).nativeFee as bigint); })
      .catch(() => { if (!cancelled) setLzNativeFee(null); })
      .finally(() => { if (!cancelled) setLzFeeLoading(false); });
    return () => { cancelled = true; };
  }, [bridgeMode, bridgeAmountBig?.toString(), dstEid, address, sgPoolAddress]);

  // ─── Stargate allowance ───────────────────────────────────────────────────
  useEffect(() => {
    if (bridgeMode !== "stargate" || !address || !tokenContractAddress || !sgPoolAddress || !publicClient || isNativeToken) {
      setSgAllowance(null);
      return;
    }
    publicClient
      .readContract({ address: tokenContractAddress, abi: SIMPLE_TRANSFER_ABI, functionName: "allowance", args: [address, sgPoolAddress] })
      .then((v) => setSgAllowance(v as bigint))
      .catch(() => setSgAllowance(null));
  }, [bridgeMode, address, tokenContractAddress, sgPoolAddress, selectedToken, fromChainId, isNativeToken]);

  // ─── Li.Fi quote ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (bridgeMode !== "lifi" || !bridgeAmountBig || !address) {
      setLifiQuote(null);
      setLifiError(null);
      return;
    }
    const fromTokenAddr = getLiFiTokenAddress(selectedToken, fromChainId);
    const toTokenAddr = getLiFiTokenAddress(selectedToken, toChainId);
    if (!fromTokenAddr || !toTokenAddr) {
      setLifiQuote(null);
      return;
    }
    let cancelled = false;
    const timer = setTimeout(() => {
      setLifiLoading(true);
      setLifiError(null);
      const params = new URLSearchParams({
        fromChain: String(fromChainId),
        toChain: String(toChainId),
        fromToken: fromTokenAddr,
        toToken: toTokenAddr,
        fromAmount: bridgeAmountBig.toString(),
        fromAddress: address,
      });
      fetch(apiUrl(`/api/bridge/quote?${params}`))
        .then((r) => r.json())
        .then((data: any) => {
          if (cancelled) return;
          if (data?.transactionRequest) {
            setLifiQuote(data as LiFiQuote);
          } else {
            setLifiError(data?.message ?? "No route found for this pair");
            setLifiQuote(null);
          }
        })
        .catch(() => {
          if (!cancelled) setLifiError("Failed to fetch bridge quote");
        })
        .finally(() => {
          if (!cancelled) setLifiLoading(false);
        });
    }, 600);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [bridgeMode, bridgeAmountBig?.toString(), selectedToken, fromChainId, toChainId, address]);

  // ─── Li.Fi allowance ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!lifiQuote || !lifiQuote.approvalAddress || !address || !tokenContractAddress || !publicClient || isNativeToken) {
      setLifiAllowance(null);
      return;
    }
    publicClient
      .readContract({ address: tokenContractAddress, abi: SIMPLE_TRANSFER_ABI, functionName: "allowance", args: [address, lifiQuote.approvalAddress] })
      .then((v) => setLifiAllowance(v as bigint))
      .catch(() => setLifiAllowance(null));
  }, [lifiQuote?.approvalAddress, address, tokenContractAddress, isNativeToken]);

  // ─── Tx receipts ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!feeTxReceipt) return;
    if (feeTxReceipt.status === "success") {
      const exec = lifiExecRef.current;
      setStep("bridging");
      if (exec) exec().catch(() => setStep("idle"));
    } else {
      showToast({ kind: "error", title: "Fee transfer failed" });
      setStep("idle");
    }
    setFeeTxHash(undefined);
  }, [feeTxReceipt]);

  useEffect(() => {
    if (!bridgeTxReceipt) return;
    if (bridgeTxReceipt.status === "success") {
      if (bridgeMode === "lifi") {
        setStep("waiting_destination");
        setDestinationState({ status: "pending", message: `Source confirmed. Waiting for ${getChainName(toChainId)} delivery.` });
        showToast({ kind: "info", title: "Source transaction confirmed", message: `House Guard is tracking delivery on ${getChainName(toChainId)}.`, txHash: bridgeTxReceipt.transactionHash, chainId: fromChainId });
      } else {
        setStep("done");
        setDestinationState({
          status: "not_verified",
          message: `Source transaction confirmed. Destination delivery is not independently verified in-app for this Stargate route yet.`,
        });
        showToast({ kind: "info", title: "Bridge source confirmed", message: `Check the destination wallet on ${getChainName(toChainId)} before treating this bridge as complete.`, txHash: bridgeTxReceipt.transactionHash, chainId: fromChainId });
        setBridgeTxHash(undefined);
      }
    } else {
      showToast({ kind: "error", title: "Bridge transaction failed" });
      setDestinationState({ status: "failed", message: "The source-chain bridge transaction reverted." });
      setStep("idle");
      setBridgeTxHash(undefined);
    }
  }, [bridgeMode, bridgeTxReceipt, fromChainId, showToast, toChainId]);

  useEffect(() => {
    if (step !== "waiting_destination" || !bridgeTxHash || bridgeMode !== "lifi") return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const poll = async () => {
      try {
        const params = new URLSearchParams({
          txHash: bridgeTxHash,
          fromChain: String(fromChainId),
          toChain: String(toChainId),
        });
        const response = await fetch(apiUrl(`/api/bridge/status?${params}`), { cache: "no-store" });
        const data = await response.json().catch(() => null) as LiFiStatusResponse | null;
        if (cancelled) return;

        if (response.ok && data?.status === "DONE") {
          const substatus = data.substatus ?? "COMPLETED";
          const tokenDecimals = data.receiving?.token?.decimals ?? decimals;
          const received = data.receiving?.amount
            ? formatCompactNumber(parseFloat(formatUnits(BigInt(data.receiving.amount), tokenDecimals)), 6)
            : undefined;
          if (substatus === "COMPLETED") {
            setDestinationState({ status: "completed", message: data.substatusMessage ?? "Destination delivery verified.", received });
            saveTransaction({ hash: bridgeTxHash, chainId: fromChainId, chain: getChainName(fromChainId), sellToken: selectedToken, buyToken: selectedToken, sellAmount: amount, buyAmount: received ?? formatCompactNumber(bridgeAmount, 6), status: "success", timestamp: Date.now() });
            setAmount("");
            showToast({ kind: "success", title: "Bridge delivered and verified", message: `${received ? `${received} ${selectedToken}` : selectedToken} received on ${getChainName(toChainId)}.` });
          } else if (substatus === "PARTIAL") {
            setDestinationState({ status: "partial", message: data.substatusMessage ?? "Bridge completed with a different destination outcome.", received });
            showToast({ kind: "info", title: "Bridge partially completed", message: "Review the House Guard destination receipt." });
          } else {
            setDestinationState({ status: "refunded", message: data.substatusMessage ?? "Bridge funds were refunded." });
            showToast({ kind: "error", title: "Bridge refunded", message: "Funds were returned; review the destination receipt." });
          }
          setStep("done");
          setBridgeTxHash(undefined);
          return;
        }

        if (response.ok && data?.status === "FAILED") {
          setDestinationState({ status: "failed", message: data.substatusMessage ?? data.error ?? "Destination delivery failed." });
          setStep("done");
          setBridgeTxHash(undefined);
          showToast({ kind: "error", title: "Bridge delivery failed", message: "Review the House Guard status before retrying." });
          return;
        }

        setDestinationState({ status: "pending", message: data?.substatusMessage ?? "Waiting for destination-chain delivery." });
      } catch {
        if (!cancelled) setDestinationState({ status: "pending", message: "Status service is temporarily unavailable; the source transaction remains confirmed." });
      }

      if (!cancelled) timer = setTimeout(() => void poll(), 10_000);
    };

    void poll();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [amount, bridgeAmount, bridgeMode, bridgeTxHash, decimals, fromChainId, selectedToken, showToast, step, toChainId]);

  // ─── Stargate execute ─────────────────────────────────────────────────────
  const executeStargateBridge = useCallback(async () => {
    if (!address || !bridgeAmountBig || !sgPoolAddress || !dstEid || lzNativeFee == null) return;
    const sendParam = { dstEid, to: addressToBytes32(address), amountLD: bridgeAmountBig, minAmountLD: minAmountBig ?? 0n, extraOptions: "0x" as `0x${string}`, composeMsg: "0x" as `0x${string}`, oftCmd: "0x" as `0x${string}` };
    const msgFee = { nativeFee: lzNativeFee, lzTokenFee: 0n };
    const msgValue = isNativeToken ? bridgeAmountBig + lzNativeFee : lzNativeFee;
    try {
      const guardedData = encodeFunctionData({
        abi: STARGATE_V2_ABI,
        functionName: "send",
        args: [sendParam, msgFee, address],
      });
      await verifyBridgeCall({ to: sgPoolAddress, data: guardedData, value: msgValue });
      const hash = await writeContractAsync({ address: sgPoolAddress, abi: STARGATE_V2_ABI, functionName: "send", args: [sendParam, msgFee, address], value: msgValue, chainId: fromChainId });
      setBridgeTxHash(hash);
      setStep("waiting_bridge");
    } catch (e: any) {
      if (!e?.message?.includes("User rejected")) showToast({ kind: "error", title: "Bridge failed", message: e?.shortMessage ?? String(e) });
      setStep("idle");
    }
  }, [address, bridgeAmountBig, sgPoolAddress, dstEid, lzNativeFee, minAmountBig, isNativeToken, fromChainId, verifyBridgeCall, writeContractAsync]);

  // ─── Li.Fi execute ────────────────────────────────────────────────────────
  const executeLiFiBridge = useCallback(async () => {
    if (!lifiQuote || !address) return;
    const { to, data, value, gasLimit } = lifiQuote.transactionRequest;
    const txValue = value ? BigInt(value) : 0n;
    try {
      await verifyBridgeCall({ to, data, value: txValue });
      const hash = await sendTransactionAsync({ to, data, value: txValue, gas: gasLimit ? BigInt(gasLimit) : undefined, chainId: fromChainId });
      setBridgeTxHash(hash);
      setStep("waiting_bridge");
      showToast({ kind: "info", title: "Bridge tx submitted", message: "Confirming on-chain…", txHash: hash, chainId: fromChainId });
    } catch (e: any) {
      if (!e?.message?.includes("User rejected")) showToast({ kind: "error", title: "Bridge failed", message: e?.shortMessage ?? String(e) });
      setStep("idle");
    }
  }, [lifiQuote, address, fromChainId, sendTransactionAsync, verifyBridgeCall]);

  // ─── Handle Approve (both modes) ─────────────────────────────────────────
  const handleApprove = useCallback(async () => {
    if (!tokenContractAddress || !bridgeAmountBig) return;
    const spender = bridgeMode === "lifi" ? lifiQuote?.approvalAddress : sgPoolAddress;
    if (!spender) return;
    setStep("approving");
    try {
      await writeContractAsync({ address: tokenContractAddress, abi: SIMPLE_TRANSFER_ABI, functionName: "approve", args: [spender, bridgeAmountBig], chainId: fromChainId });
      showToast({ kind: "success", title: "Exact approval submitted", message: "Approval is limited to this bridge amount. Now click Bridge to continue." });
      // Refresh allowance
      if (publicClient && address) {
        const val = await publicClient.readContract({ address: tokenContractAddress, abi: SIMPLE_TRANSFER_ABI, functionName: "allowance", args: [address, spender] }) as bigint;
        if (bridgeMode === "stargate") setSgAllowance(val);
        else setLifiAllowance(val);
      }
    } catch (e: any) {
      if (!e?.message?.includes("User rejected")) showToast({ kind: "error", title: "Approval failed", message: e?.shortMessage ?? String(e) });
    } finally {
      setStep("idle");
    }
  }, [tokenContractAddress, bridgeAmountBig, bridgeMode, lifiQuote, sgPoolAddress, fromChainId, writeContractAsync, publicClient, address]);

  // ─── Main bridge handler ──────────────────────────────────────────────────
  const handleBridge = useCallback(async () => {
    if (!address || !bridgeAmountBig || !houseFeeAmountBig) return;
    const execFn = bridgeMode === "stargate" ? executeStargateBridge : executeLiFiBridge;
    lifiExecRef.current = execFn;
    try {
      if (bridgeMode === "stargate") {
        if (!sgPoolAddress || !dstEid || lzNativeFee == null) return;
        const sendParam = { dstEid, to: addressToBytes32(address), amountLD: bridgeAmountBig, minAmountLD: minAmountBig ?? 0n, extraOptions: "0x" as `0x${string}`, composeMsg: "0x" as `0x${string}`, oftCmd: "0x" as `0x${string}` };
        const msgFee = { nativeFee: lzNativeFee, lzTokenFee: 0n };
        const msgValue = isNativeToken ? bridgeAmountBig + lzNativeFee : lzNativeFee;
        const guardedData = encodeFunctionData({ abi: STARGATE_V2_ABI, functionName: "send", args: [sendParam, msgFee, address] });
        await verifyBridgeCall({ to: sgPoolAddress, data: guardedData, value: msgValue });
      } else {
        if (!lifiQuote) return;
        await verifyBridgeCall({
          to: lifiQuote.transactionRequest.to,
          data: lifiQuote.transactionRequest.data,
          value: lifiQuote.transactionRequest.value ? BigInt(lifiQuote.transactionRequest.value) : 0n,
        });
      }

      if (isNativeToken) {
        setStep("sending_fee");
        const feeHash = await sendTransactionAsync({ to: HOUSE_WALLET, value: houseFeeAmountBig, chainId: fromChainId });
        setFeeTxHash(feeHash);
        setStep("waiting_fee");
        showToast({ kind: "info", title: "Step 1/2: Fee sent", message: "Waiting for confirmation…", txHash: feeHash, chainId: fromChainId });
      } else {
        if (!tokenContractAddress) return;
        setStep("sending_fee");
        const feeHash = await writeContractAsync({ address: tokenContractAddress, abi: SIMPLE_TRANSFER_ABI, functionName: "transfer", args: [HOUSE_WALLET, houseFeeAmountBig], chainId: fromChainId });
        setFeeTxHash(feeHash);
        setStep("waiting_fee");
        showToast({ kind: "info", title: "Step 1/2: Fee sent", message: "Waiting for confirmation…", txHash: feeHash, chainId: fromChainId });
      }
    } catch (e: any) {
      if (!e?.message?.includes("User rejected")) showToast({ kind: "error", title: "Fee transfer failed", message: e?.shortMessage ?? String(e) });
      setStep("idle");
    }
  }, [address, bridgeAmountBig, houseFeeAmountBig, bridgeMode, sgPoolAddress, dstEid, lzNativeFee, minAmountBig, isNativeToken, lifiQuote, verifyBridgeCall, tokenContractAddress, fromChainId, executeStargateBridge, executeLiFiBridge, sendTransactionAsync, writeContractAsync]);

  // ─── Derived flags ────────────────────────────────────────────────────────
  const walletOnCorrectChain = chainId === fromChainId;
  const insufficientBalance = amountBig != null && tokenBalance != null && amountBig > tokenBalance.value;

  const needsApproval = useMemo(() => {
    if (isNativeToken || !bridgeAmountBig) return false;
    if (bridgeMode === "stargate") return sgAllowance != null && sgAllowance < bridgeAmountBig;
    if (bridgeMode === "lifi") return !!lifiQuote?.approvalAddress && lifiAllowance != null && lifiAllowance < bridgeAmountBig;
    return false;
  }, [isNativeToken, bridgeAmountBig, bridgeMode, sgAllowance, lifiQuote, lifiAllowance]);

  const isBusy = ["approving", "sending_fee", "bridging", "waiting_fee", "waiting_bridge", "waiting_destination"].includes(step);

  const quoteReady = bridgeMode === "stargate" ? lzNativeFee != null : !!lifiQuote;
  const quoteLoading = bridgeMode === "stargate" ? lzFeeLoading : lifiLoading;

  const canBridge =
    bridgeMode !== "unsupported" &&
    isConnected &&
    walletOnCorrectChain &&
    !!amountBig &&
    !insufficientBalance &&
    quoteReady &&
    !quoteLoading &&
    !isBusy &&
    !needsApproval;

  const lzFeeEth = lzNativeFee != null ? parseFloat(formatUnits(lzNativeFee, 18)).toFixed(5) : null;

  const lifiToAmount = useMemo(() => {
    if (!lifiQuote) return null;
    const { toAmount, toAmountMin } = lifiQuote.estimate;
    const dec = TOKEN_DECIMALS[selectedToken] ?? 18;
    return {
      out: formatCompactNumber(parseFloat(formatUnits(BigInt(toAmount), dec)), 6),
      min: formatCompactNumber(parseFloat(formatUnits(BigInt(toAmountMin), dec)), 6),
    };
  }, [lifiQuote, selectedToken]);

  const lifiTotalFee = useMemo(() => {
    if (!lifiQuote?.estimate.feeCosts) return null;
    const fees = lifiQuote.estimate.feeCosts;
    if (!fees.length) return null;
    return fees.map((f) => `${formatCompactNumber(parseFloat(formatUnits(BigInt(f.amount), f.token.decimals)), 4)} ${f.token.symbol}`).join(" + ");
  }, [lifiQuote]);

  const lifiDuration = lifiQuote ? Math.ceil(lifiQuote.estimate.executionDuration / 60) : null;

  const stepLabel = useMemo(() => {
    if (!isConnected) return "Connect wallet";
    if (!walletOnCorrectChain) return `Switch to ${getChainName(fromChainId)}`;
    if (!amountBig || amountNum === 0) return "Enter amount";
    if (bridgeMode === "unsupported") return "Not available";
    if (insufficientBalance) return "Insufficient balance";
    if (quoteLoading) return "Getting quote…";
    if (bridgeMode === "lifi" && lifiError) return "No route found";
    if (!quoteReady) return "Waiting for quote…";
    if (isBusy) {
      if (step === "approving") return `Approving ${selectedToken}…`;
      if (step === "sending_fee" || step === "waiting_fee") return "Step 1/2: Fee transfer…";
      if (step === "waiting_destination") return "Verifying destination…";
      return "Step 2/2: Bridging…";
    }
    if (needsApproval) return `Approve ${selectedToken}`;
    return `Bridge ${selectedToken} → ${getChainName(toChainId)}`;
  }, [isConnected, walletOnCorrectChain, amountBig, amountNum, bridgeMode, insufficientBalance, quoteLoading, lifiError, quoteReady, isBusy, step, needsApproval, selectedToken, fromChainId, toChainId]);

  return (
    <div className="space-y-3">
      {/* ── Chain selectors ── */}
      <div className="hoj-panel rounded-3xl p-4 space-y-3">
        <div>
          <p className="mb-2 text-[11px] uppercase tracking-[0.18em] text-white/55">From chain</p>
          <div className="flex flex-wrap gap-2">
            {ALL_CHAINS.map((c) => (
              <button key={c.id} type="button" onClick={() => onChainChange(c.id)}
                className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${fromChainId === c.id ? "bg-[rgba(212,175,55,0.95)] text-black" : "bg-white/5 text-white/70 hover:bg-white/10"}`}>
                {c.name}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-px flex-1 bg-white/8" />
          <div className="flex h-7 w-7 items-center justify-center rounded-full border border-[rgba(212,175,55,0.2)] text-[rgba(212,175,55,0.7)] text-sm">↓</div>
          <div className="h-px flex-1 bg-white/8" />
        </div>
        <div>
          <p className="mb-2 text-[11px] uppercase tracking-[0.18em] text-white/55">To chain</p>
          <div className="flex flex-wrap gap-2">
            {availableDestinations.map((c) => (
              <button key={c.id} type="button" onClick={() => { setToChainId(c.id); resetBridgeVerification(); }}
                className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${toChainId === c.id ? "bg-[rgba(212,175,55,0.95)] text-black" : "bg-white/5 text-white/70 hover:bg-white/10"}`}>
                {c.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Unsupported route ── */}
      {bridgeMode === "unsupported" && (
        <div className="hoj-panel rounded-2xl p-5 space-y-2">
          <p className="text-sm font-semibold text-amber-200/90">Bridge not available for this route yet</p>
          <p className="text-[12px] leading-relaxed text-white/55">
            Hojswap does not have an integrated route between {getChainName(fromChainId)} and {getChainName(toChainId)} yet.
            We'll add this route when it is available through one of the app's bridge providers.
          </p>
          <p className="text-[11px] text-white/35">
            Alternatively, you can bridge USDC to Ethereum or Base, then swap.
          </p>
        </div>
      )}

      {/* ── Token + amount ── */}
      {bridgeMode !== "unsupported" && (
        <div className="hoj-panel rounded-3xl p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_11.875rem] sm:items-start">
            <div className="min-w-0 overflow-hidden">
              <div className="text-[11px] uppercase tracking-[0.18em] text-white/55">You bridge</div>
              <input
                inputMode="decimal"
                placeholder="0.0"
                value={amount}
                onChange={(e) => {
                  const v = e.target.value.replaceAll(",", ".");
                  if (!isValidNumberInput(v)) return;
                  setAmount(clampToDecimals(v, decimals));
                  resetBridgeVerification();
                }}
                className="hoj-input mt-2 w-full min-w-0 bg-transparent text-2xl text-white outline-none placeholder:text-white/25"
              />
              {tokenBalance && (
                <div className="mt-1 flex items-center gap-1 text-[11px] text-white/45">
                  <span>Balance: {formatCompactNumber(parseFloat(formatUnits(tokenBalance.value, tokenBalance.decimals)), 6)} {selectedToken}</span>
                  {tokenBalance.value > 0n && (
                    <>{" · "}<button type="button"
                      onClick={() => { setAmount(clampToDecimals(formatUnits(tokenBalance.value, tokenBalance.decimals), decimals)); resetBridgeVerification(); }}
                      className="font-semibold uppercase tracking-wider text-[rgba(212,175,55,0.95)] underline-offset-2 hover:underline">
                      Max
                    </button></>
                  )}
                </div>
              )}
            </div>
            <div className="min-w-0 sm:w-[11.875rem]">
              <div className="text-left text-[11px] uppercase tracking-[0.18em] text-white/55">Token</div>
              <div className="mt-2">
                {availableTokens.length === 0 ? (
                  <p className="text-xs text-white/40">No bridgeable tokens for this route.</p>
                ) : (
                  <div className="relative w-full">
                    <select
                      className="w-full appearance-none rounded-2xl border border-white/10 bg-black/35 px-4 py-3 pr-10 text-sm text-white outline-none hover:border-[rgba(212,175,55,0.25)] focus:border-[rgba(212,175,55,0.45)]"
                      value={selectedToken}
                      onChange={(e) => { setSelectedToken(e.target.value); resetBridgeVerification(); }}
                    >
                      {availableTokens.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-white/60">▾</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Quote breakdown ── */}
      {bridgeMode !== "unsupported" && amountNum > 0 && (
        <div className="hoj-panel rounded-2xl p-4 space-y-2 text-[12px]">
          <div className="flex items-center justify-between">
            <span className="text-white/50">You send</span>
            <span className="text-white/90 font-mono">{amount} {selectedToken}</span>
          </div>
          <div className="flex items-center justify-between text-amber-200/80">
            <span>House fee (1%)</span>
            <span className="font-mono">−{formatCompactNumber(houseFee, 6)} {selectedToken}</span>
          </div>
          <div className="flex items-center justify-between border-t border-white/10 pt-2">
            <span className="text-white/50">Bridged amount</span>
            <span className="font-mono text-white">{formatCompactNumber(bridgeAmount, 6)} {selectedToken}</span>
          </div>

          {/* Stargate quote lines */}
          {bridgeMode === "stargate" && (
            <>
              {lzFeeLoading && <div className="flex items-center justify-between text-white/40"><span>LayerZero fee</span><span>estimating…</span></div>}
              {lzFeeEth && !lzFeeLoading && <div className="flex items-center justify-between text-white/50"><span>LayerZero fee (ETH)</span><span className="font-mono">~{lzFeeEth} ETH</span></div>}
              <div className="flex items-center justify-between text-white/40 text-[11px]"><span>Est. received on {getChainName(toChainId)}</span><span className="font-mono">~{formatCompactNumber(bridgeAmount * 0.999, 6)} {selectedToken}</span></div>
            </>
          )}

          {/* Li.Fi quote lines */}
          {bridgeMode === "lifi" && (
            <>
              {lifiLoading && <div className="flex items-center justify-between text-white/40"><span>Route</span><span>finding best route…</span></div>}
              {lifiError && !lifiLoading && <div className="text-red-300/80 text-[11px] pt-1">{lifiError}</div>}
              {lifiToAmount && !lifiLoading && (
                <>
                  <div className="flex items-center justify-between text-white/70 font-medium"><span>You receive on {getChainName(toChainId)}</span><span className="font-mono">~{lifiToAmount.out} {selectedToken}</span></div>
                  <div className="flex items-center justify-between text-white/40 text-[11px]"><span>Minimum received</span><span className="font-mono">{lifiToAmount.min} {selectedToken}</span></div>
                  {lifiTotalFee && <div className="flex items-center justify-between text-white/40 text-[11px]"><span>Bridge fee</span><span className="font-mono">{lifiTotalFee}</span></div>}
                  {lifiDuration && <div className="flex items-center justify-between text-white/35 text-[11px]"><span>Est. arrival</span><span>~{lifiDuration} min</span></div>}
                  <div className="flex items-center justify-between text-white/30 text-[11px]"><span>Powered by</span><span>Li.Fi (cBridge / Connext)</span></div>
                </>
              )}
            </>
          )}
          <div className="flex items-center justify-between text-white/30 text-[11px]"><span>Slippage tolerance</span><span>0.5%</span></div>
        </div>
      )}

      {bridgeMode !== "unsupported" && (
        <section aria-label="House Guard bridge verification" className="rounded-2xl border border-[rgba(212,175,55,0.2)] bg-[rgba(212,175,55,0.045)] px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="hoj-display text-xs font-semibold text-[rgba(226,190,72,0.96)]">House Guard</p>
              <p className="mt-0.5 text-[10px] uppercase tracking-[0.12em] text-white/35">Bridge verification</p>
            </div>
            <span className={`rounded-full border px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.1em] ${
              bridgeGuard.status === "verified"
                ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-200"
                : bridgeGuard.status === "failed"
                  ? "border-red-400/25 bg-red-400/10 text-red-200"
                  : bridgeGuard.status === "checking"
                    ? "border-amber-300/25 bg-amber-300/10 text-amber-100"
                    : "border-white/10 bg-white/[0.04] text-white/45"
            }`}>
              {bridgeGuard.status === "verified"
                ? `Verified${bridgeGuard.blockNumber != null ? ` · #${bridgeGuard.blockNumber}` : ""}`
                : bridgeGuard.status === "failed"
                  ? "Blocked"
                  : bridgeGuard.status === "checking"
                    ? "Checking…"
                    : "Pending"}
            </span>
          </div>
          <div className="mt-3 space-y-1.5 text-[11px] leading-relaxed text-white/55">
            <p><span className="font-semibold text-white/70">Approval:</span> {isNativeToken ? "No token approval required" : "Limited to this bridge amount"}</p>
            <p><span className="font-semibold text-white/70">Simulation:</span> {bridgeGuard.status === "verified" ? "Exact source transaction passed at the pinned block" : bridgeGuard.status === "failed" ? bridgeGuard.message ?? "Source transaction simulation failed" : "Runs before the bridge wallet signature"}</p>
            <p><span className="font-semibold text-white/70">Destination:</span> {destinationState.status === "idle" ? "Tracked after source confirmation" : destinationState.message ?? destinationState.status}</p>
            {destinationState.received ? <p><span className="font-semibold text-white/70">Received:</span> {destinationState.received} {selectedToken}</p> : null}
          </div>
        </section>
      )}

      {/* ── CTA ── */}
      {bridgeMode !== "unsupported" && (
        <>
          {!isConnected ? (
            <div className="hoj-panel rounded-2xl px-4 py-3 text-sm text-white/70">Connect your wallet to bridge.</div>
          ) : !walletOnCorrectChain ? (
            <button type="button" onClick={() => switchChainAsync({ chainId: fromChainId })} disabled={isSwitching}
              className="w-full rounded-2xl bg-[rgba(212,175,55,0.95)] px-4 py-3 text-sm font-semibold text-black hover:bg-[rgba(212,175,55,0.85)] disabled:opacity-60 transition">
              {isSwitching ? "Switching…" : `Switch to ${getChainName(fromChainId)}`}
            </button>
          ) : needsApproval ? (
            <button type="button" onClick={handleApprove} disabled={isBusy || !amountBig}
              className="w-full rounded-2xl bg-[rgba(212,175,55,0.95)] px-4 py-3 text-sm font-semibold text-black hover:bg-[rgba(212,175,55,0.85)] disabled:opacity-60 transition">
              {step === "approving" ? `Approving ${selectedToken}…` : `Approve exact ${selectedToken} amount`}
            </button>
          ) : (
            <button type="button" onClick={handleBridge} disabled={!canBridge}
              className="w-full rounded-2xl bg-[rgba(255,222,85,0.98)] px-4 py-3 text-sm font-semibold text-black shadow-[0_12px_25px_-12px_rgba(255,222,85,0.9)] hover:bg-[rgba(255,210,65,0.98)] disabled:opacity-60 transition">
              {stepLabel}
            </button>
          )}

          {insufficientBalance && walletOnCorrectChain && (
            <p className="text-center text-xs text-red-300/90">Amount exceeds your {selectedToken} balance.</p>
          )}

          {(step === "waiting_fee" || step === "waiting_bridge" || step === "waiting_destination") && (
            <div className="rounded-2xl border border-[rgba(212,175,55,0.2)] bg-[rgba(212,175,55,0.05)] px-4 py-3 text-xs text-amber-200/80">
              {step === "waiting_fee"
                ? "Step 1/2: Fee confirming — bridge will launch automatically."
                : step === "waiting_destination"
                ? "Source confirmed. House Guard is waiting for destination-chain proof."
                : bridgeMode === "lifi"
                ? "Step 2/2: Bridge submitted to Li.Fi. Tokens arrive in 1–5 minutes."
                : "Step 2/2: Bridge submitted via Stargate. Tokens arrive in 1–3 minutes."}
            </div>
          )}
        </>
      )}

      {/* ── Footer note ── */}
      {bridgeMode === "stargate" && (
        <p className="text-center text-[11px] text-white/35">
          Powered by Stargate V2 (LayerZero) · 1% house fee · Ethereum ↔ Base
        </p>
      )}
      {bridgeMode === "lifi" && (
        <p className="text-center text-[11px] text-white/35">
          Powered by Li.Fi (cBridge / Connext) · 1% house fee · Cronos routes
        </p>
      )}

      {/* ── Community token tip ── */}
      {bridgeMode !== "unsupported" && (
        <div className="hoj-panel rounded-2xl px-4 py-3 text-[11px] text-white/45">
          <strong className="text-white/60">Bridging community tokens (BONE, TREAT, QUEENJOSHI…)?</strong>{" "}
          These don't have bridge pools — use <strong className="text-white/60">Swap</strong> to convert to USDC or ETH first, then bridge.
        </div>
      )}
    </div>
  );
}
