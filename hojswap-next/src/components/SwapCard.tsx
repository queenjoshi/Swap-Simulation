"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
    useAccount,
    useBalance,
    useChainId,
    usePublicClient,
    useSendTransaction,
    useSignTypedData,
    useSwitchChain,
    useWriteContract,
} from "wagmi";
import { parseUnits, maxUint256, formatUnits, concat, numberToHex, size } from "viem";
import { base } from "wagmi/chains";
import { CHAIN_OPTIONS, SWAP_SUPPORTED_CHAIN_IDS, getChainName } from "@/lib/chains";
import { clampToDecimals, formatSwapAmountDisplay, isValidNumberInput } from "@/lib/format";
import { calculateHouseFeeAmount, tokenTo0xParam, type QuoteResponse, type PriceResponse } from "@/lib/quote";
import { erc20Abi } from "@/lib/erc20";
import { defaultBuyForChain, defaultSellForChain, isNative, tokenDecimals, tokensForChain, type Token } from "@/lib/tokens";
import { effectiveSlippageBps, isSameToken, otherToken } from "@/lib/swap-utils";
import { loadSlippageBps } from "@/components/SlippageSettings";
import { SwapShowMore } from "@/components/SwapShowMore";
import { TokenBalance } from "@/components/TokenBalance";
import { TokenSelect } from "@/components/TokenSelect";
import { TransactionsPanel } from "@/components/TransactionsPanel";
import { BridgeTab } from "@/components/BridgeTab";
import { TrendingTokens } from "@/components/TrendingTokens";
import { useToast } from "@/components/Toast";
import { saveTransaction } from "@/lib/transactions";
import { useNativeTokenPrice, getNativeSymbol, formatNetworkFee } from "@/lib/gas";
import { hojswapRouterAbi, tokenToRouterAddress } from "@/lib/hojswap-router";
import { HOUSE_WALLET } from "@/lib/swap-fee";

const DEBOUNCE_MS = 750;
type ActiveTab = "swap" | "bridge" | "transactions";
type ApiKeyError = "api_key_missing" | "api_key_invalid" | null;

function SwapCardInner() {
    const searchParams = useSearchParams();
    const { showToast } = useToast();
    const chainId = useChainId();
    const { address, isConnected } = useAccount();
    const { switchChainAsync, isPending: isSwitching } = useSwitchChain();

    const [selectedChainId, setSelectedChainId] = useState<number>(base.id);
    const publicClient = usePublicClient({ chainId: selectedChainId });
    const [activeTab, setActiveTab] = useState<ActiveTab>("swap");
    const [apiKeyError, setApiKeyError] = useState<ApiKeyError>(null);

    const availableTokens = useMemo(() => tokensForChain(selectedChainId), [selectedChainId]);

    const [sellToken, setSellToken] = useState<Token>(() => {
        const sellSymbol = searchParams.get("sell");
        const initialTokens = tokensForChain(base.id);
        if (sellSymbol) {
            const token = initialTokens.find(t => t.symbol === sellSymbol);
            if (token) return token;
        }
        return defaultSellForChain(base.id);
    });
    
    const [buyToken, setBuyToken] = useState<Token>(() => {
        const buySymbol = searchParams.get("buy");
        const initialTokens = tokensForChain(base.id);
        if (buySymbol) {
            const token = initialTokens.find(t => t.symbol === buySymbol);
            if (token) return token;
        }
        return defaultBuyForChain(base.id);
    });
    const [slippageBps, setSlippageBps] = useState<number>(loadSlippageBps);
    const [sellAmountInput, setSellAmountInput] = useState<string>("");

    const [quote, setQuote] = useState<QuoteResponse | null>(null);
    const [price, setPrice] = useState<PriceResponse | null>(null);
    const [isQuoting, setIsQuoting] = useState(false);
    const [quoteError, setQuoteError] = useState<string | null>(null);

    const [sellDecimals, setSellDecimals] = useState<number | null>(null);
    const [buyDecimals, setBuyDecimals] = useState<number | null>(null);
    const [txHistoryVersion, setTxHistoryVersion] = useState(0);
    const [swapStep, setSwapStep] = useState<"approve" | "quote" | "fee" | "swap" | null>(null);

    const quoteDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);
    const quoteAbort = useRef<AbortController | null>(null);

    const walletOnSelectedChain = chainId === selectedChainId;
    const needsCorrectChain = isConnected && !walletOnSelectedChain;
    const selectedChainName = getChainName(selectedChainId);

    function pickChain(newChainId: number) {
        setSelectedChainId(newChainId);
        setSellToken(defaultSellForChain(newChainId));
        setBuyToken(defaultBuyForChain(newChainId));
        setSellAmountInput("");
        setQuote(null);
        setPrice(null);
        setQuoteError(null);
    }

    const isSwapSupported = SWAP_SUPPORTED_CHAIN_IDS.includes(selectedChainId);

    // Auto-switch to bridge tab if swap is not supported on the selected chain
    useEffect(() => {
        if (!isSwapSupported && activeTab === "swap") {
            setActiveTab("bridge");
        }
    }, [selectedChainId, isSwapSupported, activeTab]);

    const onSellTokenChange = useCallback(
        (next: Token) => {
            setSellToken(next);
            if (isSameToken(next, buyToken)) setBuyToken(otherToken(next, buyToken, availableTokens));
            setSellAmountInput("");
            setQuote(null);
            setPrice(null);
            setQuoteError(null);
        },
        [buyToken, availableTokens],
    );

    const onBuyTokenChange = useCallback(
        (next: Token) => {
            setBuyToken(next);
            if (isSameToken(next, sellToken)) setSellToken(otherToken(next, sellToken, availableTokens));
            setQuote(null);
            setPrice(null);
            setQuoteError(null);
        },
        [sellToken, availableTokens],
    );

    const onSelectTrendingToken = useCallback(
        (tokenSymbol: string) => {
            const token = availableTokens.find(t => t.symbol === tokenSymbol);
            if (token) {
                // Set as buy token, keep sell token
                setBuyToken(token);
                if (isSameToken(token, sellToken)) {
                    setSellToken(otherToken(token, sellToken, availableTokens));
                }
                setQuote(null);
                setPrice(null);
                setQuoteError(null);
            } else {
                // Token not available on this chain, show toast
                showToast({ 
                    kind: "error", 
                    title: "Token not available", 
                    message: `${tokenSymbol} is not available to swap on this chain` 
                });
            }
        },
        [availableTokens, sellToken, showToast],
    );

    function flipTokens() {
        setSellToken(buyToken);
        setBuyToken(sellToken);
        setSellAmountInput("");
        setQuote(null);
        setPrice(null);
        setQuoteError(null);
    }

    const { data: sellBalanceData } = useBalance({
        address,
        token: isNative(sellToken) ? undefined : sellToken.address,
        chainId: selectedChainId,
        query: { enabled: isConnected && !!address && walletOnSelectedChain, refetchInterval: 12_000 },
    });

    function setMaxAmount() {
        if (!sellBalanceData) return;
        const maxRaw = sellBalanceData.value;
        if (maxRaw === 0n) return;
        const dec = sellBalanceData.decimals;
        const str = (Number(maxRaw) / 10 ** dec).toFixed(dec > 8 ? 8 : dec);
        setSellAmountInput(str);
    }

    const insufficientBalance = useMemo(() => {
        if (!sellAmountInput || !sellBalanceData || !walletOnSelectedChain) return false;
        const dec = sellBalanceData.decimals;
        try {
            const input = parseUnits(sellAmountInput, dec);
            return input > sellBalanceData.value;
        } catch {
            return false;
        }
    }, [sellAmountInput, sellBalanceData, walletOnSelectedChain]);

    const inputSellAmountBig = useMemo(() => {
        if (!sellAmountInput || Number(sellAmountInput) === 0) return null;
        try {
            const dec = sellDecimals ?? tokenDecimals(sellToken);
            return parseUnits(sellAmountInput, dec);
        } catch {
            return null;
        }
    }, [sellAmountInput, sellDecimals, sellToken]);

    async function fetchDecimals(token: Token): Promise<number | null> {
        if (isNative(token)) return 18;
        if (token.decimals != null) return token.decimals;
        try {
            const res = await fetch("/api/token-decimals", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tokenAddress: token.address, chainId: token.chainId }),
            });
            if (!res.ok) return null;
            const data = (await res.json()) as { decimals: number };
            return data.decimals ?? null;
        } catch {
            return null;
        }
    }

    useEffect(() => {
        let cancelled = false;
        fetchDecimals(sellToken).then((d) => { if (!cancelled) setSellDecimals(d); });
        fetchDecimals(buyToken).then((d) => { if (!cancelled) setBuyDecimals(d); });
        return () => { cancelled = true; };
    }, [sellToken, buyToken]);

    const fetchQuoteForTrade = useCallback(
        async (signal?: AbortSignal): Promise<QuoteResponse | null> => {
            if (!sellAmountInput || Number(sellAmountInput) === 0) return null;

            const dec = sellDecimals ?? tokenDecimals(sellToken);
            let sellAmountBig: bigint;
            try {
                sellAmountBig = parseUnits(sellAmountInput, dec);
            } catch {
                setQuoteError("Invalid amount");
                return null;
            }

            const effectiveBps = effectiveSlippageBps(sellToken, buyToken, slippageBps);
            const body = {
                sellToken: tokenTo0xParam(sellToken),
                buyToken: tokenTo0xParam(buyToken),
                sellAmount: sellAmountBig.toString(),
                chainId: selectedChainId,
                slippageBps: effectiveBps,
                taker: isConnected ? address : undefined,
            };

            const fetchOpts = (b: object) => ({
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(b),
                signal,
            });

            if (!isConnected) {
                const priceRes = await fetch("/api/price", fetchOpts(body));
                const priceData = await priceRes.json().catch(() => null) as PriceResponse | null;
                setApiKeyError(null);
                setQuote(null);
                if (priceRes.status === 503) {
                    const err = (priceData as any)?.error as string;
                    if (err === "api_key_missing") setApiKeyError("api_key_missing");
                    else if (err === "api_key_invalid") setApiKeyError("api_key_invalid");
                    setPrice(null);
                } else if (!priceRes.ok || !priceData) {
                    setQuoteError((priceData as any)?.reason ?? (priceData as any)?.error ?? "Failed to fetch price");
                    setPrice(null);
                } else {
                    setQuoteError(null);
                    setPrice(priceData);
                }
                return null;
            }

            const [quoteRes, priceRes] = await Promise.all([
                fetch("/api/quote", fetchOpts(body)),
                fetch("/api/price", fetchOpts(body)),
            ]);

            const [quoteData, priceData] = (await Promise.all([
                quoteRes.json().catch(() => null),
                priceRes.json().catch(() => null),
            ])) as [QuoteResponse & { error?: string; reason?: string } | null, PriceResponse | null];

            if (quoteRes.status === 503) {
                const err = (quoteData as any)?.error as string;
                if (err === "api_key_missing") setApiKeyError("api_key_missing");
                else if (err === "api_key_invalid") setApiKeyError("api_key_invalid");
                setQuoteError(null);
                setQuote(null);
                setPrice(null);
                return null;
            }

            if (!quoteRes.ok) {
                setApiKeyError(null);
                setQuoteError(
                    (quoteData as any)?.reason ?? (quoteData as any)?.error ?? quoteRes.statusText ?? "Failed to fetch quote",
                );
                setQuote(null);
                setPrice(null);
                return null;
            }

            if (!quoteData) {
                setApiKeyError(null);
                setQuoteError("Failed to parse quote response");
                setQuote(null);
                setPrice(null);
                return null;
            }

            setApiKeyError(null);
            setQuote(quoteData);
            setQuoteError(null);
            setPrice(priceRes.ok ? priceData : null);
            return quoteData;
        },
        [sellAmountInput, sellDecimals, sellToken, buyToken, slippageBps, selectedChainId, isConnected, address],
    );

    useEffect(() => {
        if (quoteDebounce.current) clearTimeout(quoteDebounce.current);
        if (!sellAmountInput || Number(sellAmountInput) === 0) {
            setQuote(null);
            setPrice(null);
            setIsQuoting(false);
            setQuoteError(null);
            return;
        }
        setIsQuoting(true);
        quoteDebounce.current = setTimeout(async () => {
            if (quoteAbort.current) quoteAbort.current.abort();
            quoteAbort.current = new AbortController();
            const signal = quoteAbort.current.signal;
            setQuoteError(null);
            setApiKeyError(null);
            try {
                await fetchQuoteForTrade(signal);
            } catch (err: unknown) {
                if (err instanceof Error && err.name === "AbortError") return;
                console.error("Quote fetch error:", err);
                setQuoteError("Network error — please try again");
                setQuote(null);
                setPrice(null);
            } finally {
                setIsQuoting(false);
            }
        }, DEBOUNCE_MS);
        return () => { if (quoteDebounce.current) clearTimeout(quoteDebounce.current); };
    }, [sellAmountInput, fetchQuoteForTrade]);

    const buyAmountRaw = useMemo(() => {
        const raw = quote?.buyAmount ?? price?.buyAmount;
        if (raw == null || raw === "") return null;
        try {
            const decimals = buyDecimals ?? tokenDecimals(buyToken);
            return formatUnits(BigInt(String(raw)), decimals);
        } catch {
            return null;
        }
    }, [quote?.buyAmount, price?.buyAmount, buyToken, buyDecimals]);

    const buyAmountFormatted = useMemo(() => {
        if (buyAmountRaw == null || buyAmountRaw === "") return null;
        try {
            return formatSwapAmountDisplay(buyAmountRaw);
        } catch {
            return buyAmountRaw;
        }
    }, [buyAmountRaw]);

    const minBuyFormatted = useMemo(() => {
        if (!quote?.minBuyAmount) return null;

        try {
            const decimals = buyDecimals ?? tokenDecimals(buyToken);

            const formatted = formatUnits(
                BigInt(String(quote.minBuyAmount)),
                decimals
            );

            return `${formatSwapAmountDisplay(formatted)} ${buyToken.symbol}`;
        } catch (error) {
            console.error("[DEBUG] Failed to format minBuyAmount:", error);
            return null;
        }
    }, [quote?.minBuyAmount, buyToken, buyDecimals]);

    const houseFeeFormatted = useMemo(() => {
        if (!sellAmountInput || Number(sellAmountInput) === 0) return null;
        try {
            const dec = sellDecimals ?? tokenDecimals(sellToken);
            const sellAmountBig = parseUnits(sellAmountInput, dec);
            const fee = calculateHouseFeeAmount(sellAmountBig);
            return `${formatSwapAmountDisplay(formatUnits(fee, dec))} ${sellToken.symbol}`;
        } catch {
            return null;
        }
    }, [sellAmountInput, sellDecimals, sellToken]);

    const routerSwap = quote?.hojswapRouter?.enabled ? quote.hojswapRouter : null;
    const routerAddress = routerSwap?.address;
    const [routerAllowance, setRouterAllowance] = useState<bigint | null>(null);

    useEffect(() => {
        setRouterAllowance(null);
        if (
            !routerAddress ||
            !address ||
            !sellToken.address ||
            isNative(sellToken) ||
            !publicClient ||
            !walletOnSelectedChain
        ) return;

        let cancelled = false;
        publicClient
            .readContract({
                address: sellToken.address,
                abi: erc20Abi,
                functionName: "allowance",
                args: [address, routerAddress],
            })
            .then((allowance) => {
                if (!cancelled) setRouterAllowance(allowance as bigint);
            })
            .catch(() => {
                if (!cancelled) setRouterAllowance(null);
            });

        return () => {
            cancelled = true;
        };
    }, [routerAddress, address, sellToken, publicClient, walletOnSelectedChain]);

    const permit2Spender = quote?.issues?.allowance?.spender;
    const approvalSpender = routerAddress ?? permit2Spender;

    const needsApproval = useMemo(() => {
        if (isNative(sellToken)) return false;
        if (routerAddress) {
            if (!inputSellAmountBig || inputSellAmountBig <= 0n) return false;
            return routerAllowance == null || routerAllowance < inputSellAmountBig;
        }
        return !!quote?.issues?.allowance;
    }, [inputSellAmountBig, quote?.issues?.allowance, routerAddress, routerAllowance, sellToken]);

    const { writeContractAsync: approveAsync } = useWriteContract();
    const { writeContractAsync: writeRouterAsync } = useWriteContract();
    const { writeContractAsync: writeTokenAsync } = useWriteContract();
    const { sendTransactionAsync } = useSendTransaction();
    const { signTypedDataAsync } = useSignTypedData();
    const [swapTxHash, setSwapTxHash] = useState<`0x${string}` | undefined>();
    const [isSwapping, setIsSwapping] = useState(false);
    const [isApproving, setIsApproving] = useState(false);

    async function approveAndSwap() {
        if (!sellToken.address || !approvalSpender) return;
        setIsApproving(true);
        setSwapStep("approve");
        try {
            const hash = await approveAsync({
                address: sellToken.address,
                abi: erc20Abi,
                functionName: "approve",
                args: [approvalSpender, maxUint256],
                chainId: selectedChainId,
            });
            showToast({ kind: "info", title: "Approval submitted", message: "Waiting for confirmation…" });
            await publicClient?.waitForTransactionReceipt({ hash });
            if (routerAddress) setRouterAllowance(maxUint256);
            showToast({ kind: "success", title: "Approval confirmed", message: "Continuing to swap…" });
            setSwapStep("quote");
            const freshQuote = await fetchQuoteForTrade();
            if (freshQuote?.transaction) {
                setIsApproving(false);
                await swap(freshQuote);
            } else {
                showToast({ kind: "error", title: "Swap unavailable", message: "Approval succeeded, but the updated quote is not ready. Try swap again." });
            }
        } catch (e: any) {
            if (!e?.message?.includes("User rejected"))
                showToast({ kind: "error", title: "Approval failed", message: e?.shortMessage ?? e?.message ?? String(e) });
        } finally {
            setIsApproving(false);
            setSwapStep(null);
        }
    }

    async function payManualHouseFee(manualHouseFee: NonNullable<QuoteResponse["manualHouseFee"]>, token: Token) {
        const feeAmount = BigInt(manualHouseFee.amount);
        if (feeAmount <= 0n) return;
        const feeTokenAddress = token.address;
        if (!isNative(token) && !feeTokenAddress) throw new Error("Missing fee token address");

        setSwapStep("fee");
        showToast({
            kind: "info",
            title: "House fee submitted",
            message: "Step 1/2: waiting for fee confirmation…",
        });

        const feeHash = isNative(token)
            ? await sendTransactionAsync({
                to: manualHouseFee.recipient ?? HOUSE_WALLET,
                value: feeAmount,
                chainId: selectedChainId,
            })
            : await writeTokenAsync({
                address: feeTokenAddress as `0x${string}`,
                abi: erc20Abi,
                functionName: "transfer",
                args: [manualHouseFee.recipient ?? HOUSE_WALLET, feeAmount],
                chainId: selectedChainId,
            });

        showToast({
            kind: "info",
            title: "House fee sent",
            message: "Waiting for confirmation before swapping…",
            txHash: feeHash,
            chainId: selectedChainId,
        });

        const feeReceipt = await publicClient?.waitForTransactionReceipt({ hash: feeHash });
        if (feeReceipt?.status !== "success") throw new Error("House fee transaction reverted");

        showToast({
            kind: "success",
            title: "House fee confirmed",
            message: "Step 2/2: continuing to swap…",
            txHash: feeHash,
            chainId: selectedChainId,
        });
    }

    async function swap(quoteToSwap: QuoteResponse = quote as QuoteResponse) {
        if (!quoteToSwap?.transaction) return;
        setIsSwapping(true);

        // Capture before any state changes
        const capturedSellAmount = sellAmountInput;
        const capturedSellToken = sellToken;
        const capturedBuyToken = buyToken;
        const capturedBuyAmount = buyAmountRaw ?? "?";
        try {
            setSwapStep("swap");
            const { to, value, gas } = quoteToSwap.transaction;
            let txData = quoteToSwap.transaction.data;
            const router = quoteToSwap.hojswapRouter?.enabled ? quoteToSwap.hojswapRouter : null;
            const manualHouseFee = !router && quoteToSwap.manualHouseFee?.enabled ? quoteToSwap.manualHouseFee : null;
            let txHash: `0x${string}`;

            if (router) {
                if (!address) throw new Error("Connect your wallet before swapping");
                const sellAmountForRouter = BigInt(router.sellAmount);
                const minBuyAmount = BigInt(quoteToSwap.minBuyAmount ?? quoteToSwap.buyAmount ?? "0");
                const buyTokenForRouter = tokenToRouterAddress(capturedBuyToken);

                if (isNative(capturedSellToken)) {
                    txHash = await writeRouterAsync({
                        address: router.address,
                        abi: hojswapRouterAbi,
                        functionName: "swapExactNative",
                        args: [{
                            swapTarget: to,
                            swapCallData: txData,
                            buyToken: buyTokenForRouter,
                            minBuyAmount,
                            recipient: address,
                        }],
                        value: sellAmountForRouter,
                        chainId: selectedChainId,
                    });
                } else {
                    if (!capturedSellToken.address) throw new Error("Missing sell token address");
                    if (!router.spender || router.spender === "0x0000000000000000000000000000000000000000") {
                        throw new Error("Missing allowance spender in router quote");
                    }
                    txHash = await writeRouterAsync({
                        address: router.address,
                        abi: hojswapRouterAbi,
                        functionName: "swapExactToken",
                        args: [{
                            sellToken: capturedSellToken.address,
                            sellAmount: sellAmountForRouter,
                            spender: router.spender,
                            swapTarget: to,
                            swapCallData: txData,
                            buyToken: buyTokenForRouter,
                            minBuyAmount,
                            recipient: address,
                        }],
                        chainId: selectedChainId,
                    });
                }
            } else {
                if (quoteToSwap.permit2?.eip712) {
                    const { types, domain, message, primaryType } = quoteToSwap.permit2.eip712;
                    const { EIP712Domain: _domain, ...typesWithoutDomain } = types as any;
                    const signature = await signTypedDataAsync({
                        types: typesWithoutDomain,
                        domain: domain as any,
                        message: message as any,
                        primaryType,
                    });
                    const signatureLengthInHex = numberToHex(size(signature), { signed: false, size: 32 });
                    txData = concat([txData, signatureLengthInHex, signature]) as `0x${string}`;
                }

                if (manualHouseFee) {
                    await payManualHouseFee(manualHouseFee, capturedSellToken);
                    setSwapStep("swap");
                }

                txHash = await sendTransactionAsync({
                    to,
                    data: txData,
                    value: value ? BigInt(value) : 0n,
                    gas: gas ? BigInt(gas) : undefined,
                    chainId: selectedChainId,
                });
            }
            setSwapTxHash(txHash);
            showToast({ kind: "info", title: "Swap submitted", message: "Waiting for confirmation…", txHash, chainId: selectedChainId });

            const receipt = await publicClient?.waitForTransactionReceipt({ hash: txHash });
            setSwapTxHash(undefined);

            const swapSuccess = receipt?.status === "success";
            showToast({
                kind: swapSuccess ? "success" : "error",
                title: swapSuccess ? "Swap complete!" : "Swap reverted",
                txHash,
                chainId: selectedChainId,
            });
            saveTransaction({
                hash: txHash,
                chainId: selectedChainId,
                chain: getChainName(selectedChainId),
                sellToken: capturedSellToken.symbol,
                buyToken: capturedBuyToken.symbol,
                sellAmount: capturedSellAmount,
                buyAmount: capturedBuyAmount,
                status: swapSuccess ? "success" : "failed",
                timestamp: Date.now(),
            });

            if (swapSuccess) {
                setTxHistoryVersion((v) => v + 1);
                setSellAmountInput("");
                setQuote(null);
                setPrice(null);
            }
        } catch (e: any) {
            if (!e?.message?.includes("User rejected"))
                showToast({ kind: "error", title: "Swap failed", message: e?.shortMessage ?? e?.message ?? String(e) });
        } finally {
            setIsSwapping(false);
            setSwapStep(null);
        }
    }

    const primaryLabel = useMemo(() => {
        if (!sellAmountInput || Number(sellAmountInput) === 0) return "Enter amount";
        if (isQuoting) return "Getting quote…";
        if (isApproving) {
            if (swapStep === "quote") return "Fetching swap…";
            if (swapStep === "fee") return "Paying House fee…";
            return "Approving…";
        }
        if (isSwapping) {
            if (swapStep === "fee") return "Paying House fee…";
            return "Swapping…";
        }
        if (swapTxHash) return "Confirming swap…";
        if (needsApproval) return `Approve & swap ${sellToken.symbol}`;
        if (!quote?.transaction) return "Enter amount";
        return `Swap ${sellToken.symbol} → ${buyToken.symbol}`;
    }, [sellAmountInput, isQuoting, isApproving, swapStep, isSwapping, swapTxHash, needsApproval, sellToken.symbol, buyToken.symbol, quote?.transaction]);

    const primaryDisabled =
        !sellAmountInput || Number(sellAmountInput) === 0 ||
        isQuoting || isApproving || isSwapping || !!swapTxHash ||
        insufficientBalance || (!needsApproval && !quote?.transaction);

    const nativeUsdPrice = useNativeTokenPrice(selectedChainId);
    const nativeSymbol = getNativeSymbol(selectedChainId);
    const gasDisplay = useMemo(() => formatNetworkFee(
        quote?.totalNetworkFee ?? price?.totalNetworkFee,
        quote?.transaction?.gas,
        quote?.transaction?.gasPrice,
        nativeUsdPrice,
        nativeSymbol,
    ), [quote, price, nativeUsdPrice, nativeSymbol]);

    const CHAINS = CHAIN_OPTIONS.map(({ id, shortLabel }) => ({ id, label: shortLabel }));

    const TABS: { id: ActiveTab; label: string }[] = [
        { id: "swap", label: "Swap" },
        { id: "bridge", label: "Bridge" },
        { id: "transactions", label: "Transactions" },
    ];

    return (
        <div className="w-full max-w-[480px]">
            {apiKeyError && (
                <div className="mb-4 flex items-start gap-3 rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3">
                    <span className="mt-0.5 shrink-0 text-amber-300">⚠</span>
                    <div className="text-xs leading-relaxed text-amber-200/90">
                        {apiKeyError === "api_key_missing" ? (
                            <>
                                <strong className="block text-amber-200">0x API key not configured.</strong>
                                Set the <code className="rounded bg-black/30 px-1">ZEROX_API_KEY</code> environment variable.{" "}
                                <a href="https://dashboard.0x.org" target="_blank" rel="noopener noreferrer" className="underline hover:text-amber-100">
                                    Get a free key →
                                </a>
                            </>
                        ) : (
                            <>
                                <strong className="block text-amber-200">0x API key invalid or quota exceeded.</strong>
                                Check your key at{" "}
                                <a href="https://dashboard.0x.org" target="_blank" rel="noopener noreferrer" className="underline hover:text-amber-100">
                                    dashboard.0x.org
                                </a>
                            </>
                        )}
                    </div>
                </div>
            )}

            <div className="hoj-card space-y-3 rounded-3xl p-3 sm:p-6">
                {/* Chain selector */}
                <div className="-mx-1 flex snap-x flex-nowrap justify-start gap-2 overflow-x-auto px-1 pb-1 sm:mx-0 sm:flex-wrap sm:justify-center sm:overflow-visible sm:px-0 sm:pb-0">
                    {CHAINS.map(({ id, label }) => (
                        <button
                            key={id}
                            type="button"
                            onClick={() => pickChain(id)}
                            className={`shrink-0 snap-start rounded-2xl px-3 py-2 text-[13px] font-semibold transition sm:px-4 sm:text-sm ${selectedChainId === id
                                ? "bg-[rgba(212,175,55,0.95)] text-black"
                                : "bg-white/5 text-white/70 hover:bg-white/10"
                                }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {/* Tab selector */}
                <div className="flex gap-1 rounded-2xl border border-white/10 bg-black/20 p-1 sm:rounded-3xl">
                    {TABS.filter(tab => tab.id !== "swap" || isSwapSupported).map(({ id, label }) => (
                        <button
                            key={id}
                            type="button"
                            onClick={() => setActiveTab(id)}
                            className={`min-w-0 flex-1 rounded-xl px-2 py-2.5 text-[13px] font-semibold capitalize transition sm:rounded-2xl sm:px-3 sm:py-3 sm:text-sm ${activeTab === id
                                ? "bg-[rgba(212,175,55,0.95)] text-black"
                                : "bg-transparent text-white/70 hover:bg-white/5"
                                }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {isSwapSupported && activeTab === "swap" ? (
                    <>
                        {/* Sell panel */}
                        <div className="hoj-panel rounded-3xl p-3 sm:p-4">
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_11.875rem] sm:items-start">
                                <div className="min-w-0 overflow-hidden">
                                    <div className="text-[11px] uppercase tracking-[0.18em] text-white/55">You pay</div>
                                    <input
                                        inputMode="decimal"
                                        placeholder="0.0"
                                        value={sellAmountInput}
                                        onChange={(e) => {
                                            const nextRaw = e.target.value.replaceAll(",", ".");
                                            if (!isValidNumberInput(nextRaw)) return;
                                            const next = sellDecimals != null ? clampToDecimals(nextRaw, sellDecimals) : nextRaw;
                                            setSellAmountInput(next);
                                        }}
                                        className="hoj-input mt-2 w-full min-w-0 bg-transparent text-2xl text-white outline-none placeholder:text-white/25"
                                    />
                                </div>
                                <div className="min-w-0 sm:w-[11.875rem]">
                                    <div className="text-left text-[11px] uppercase tracking-[0.18em] text-white/55">Token</div>
                                    <div className="mt-2">
                                        <TokenSelect tokens={availableTokens} value={sellToken} onChange={onSellTokenChange} />
                                    </div>
                                    <TokenBalance token={sellToken} chainId={selectedChainId} isConnected={isConnected} walletChainId={chainId} onMax={walletOnSelectedChain ? setMaxAmount : undefined} />
                                </div>
                            </div>
                        </div>

                        {/* Flip */}
                        <div className="flex justify-center py-1">
                            <button
                                type="button"
                                onClick={flipTokens}
                                className="flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(212,175,55,0.3)] bg-black/40 text-[rgba(212,175,55,0.9)] hover:border-[rgba(212,175,55,0.6)] hover:bg-black/60 transition shadow-sm text-lg"
                                aria-label="Flip tokens"
                            >
                                ⇅
                            </button>
                        </div>

                        {/* Buy panel */}
                        <div className="hoj-panel rounded-3xl p-3 sm:p-4">
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_11.875rem] sm:items-start">
                                <div className="min-w-0 overflow-hidden">
                                    <div className="text-[11px] uppercase tracking-[0.18em] text-white/55">You receive</div>
                                    <div className="mt-2 truncate text-xl font-medium tabular-nums text-white/90 sm:text-2xl" title={buyAmountRaw ?? undefined}>
                                        {(() => {
                                            if (isQuoting) return "…";
                                            if (!sellAmountInput) return "—";
                                            if (Number(sellAmountInput) === 0) return "0";
                                            if ((quote as any)?.liquidityAvailable === false) return "No liquidity";
                                            return buyAmountFormatted ?? "—";
                                        })()}
                                    </div>
                                    {minBuyFormatted && (
                                        <div className="mt-1 truncate text-xs text-white/45" title={minBuyFormatted}>
                                            Min: {minBuyFormatted}
                                        </div>
                                    )}
                                </div>
                                <div className="min-w-0 sm:w-[11.875rem]">
                                    <div className="text-left text-[11px] uppercase tracking-[0.18em] text-white/55">Token</div>
                                    <div className="mt-2">
                                        <TokenSelect tokens={availableTokens} value={buyToken} onChange={onBuyTokenChange} />
                                    </div>
                                    <TokenBalance token={buyToken} chainId={selectedChainId} isConnected={isConnected} walletChainId={chainId} />
                                </div>
                            </div>
                        </div>

                        {/* Gas estimate row — visible before confirming */}
                        {gasDisplay && (
                            <div className="flex items-center justify-between px-1 text-[11px] text-white/45">
                                <span>Est. network fee</span>
                                <span className="font-mono tabular-nums">
                                    {gasDisplay.usd
                                        ? <>{gasDisplay.usd} <span className="text-white/25">({gasDisplay.eth})</span></>
                                        : gasDisplay.eth}
                                </span>
                            </div>
                        )}

                        {/* House fee row */}
                        {houseFeeFormatted && (
                            <div className="flex items-center justify-between px-1 text-[11px] text-white/45">
                                <span>House fee <span className="text-white/30">(1%)</span></span>
                                <span className="font-mono tabular-nums">{houseFeeFormatted}</span>
                            </div>
                        )}

                        <SwapShowMore
                            slippageBps={slippageBps} onSlippageChange={setSlippageBps}
                            quote={quote} price={price}
                            sellToken={sellToken} buyToken={buyToken}
                            sellDecimals={sellDecimals} buyDecimals={buyDecimals}
                            isQuoting={isQuoting}
                            nativeUsdPrice={nativeUsdPrice}
                            nativeSymbol={nativeSymbol}
                        />

                        {!isConnected ? (
                            <div className="hoj-panel rounded-2xl px-4 py-3 text-sm text-white/70">
                                Connect your wallet to begin.
                            </div>
                        ) : needsCorrectChain ? (
                            <button
                                type="button"
                                onClick={() => switchChainAsync({ chainId: selectedChainId })}
                                disabled={isSwitching}
                                className="w-full rounded-2xl bg-[rgba(212,175,55,0.95)] px-4 py-3 text-sm font-semibold text-black hover:bg-[rgba(212,175,55,0.85)] disabled:opacity-60 transition"
                            >
                                {isSwitching ? "Switching…" : `Switch to ${selectedChainName}`}
                            </button>
                        ) : quoteError ? (
                            <div className="rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                                {quoteError}
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={needsApproval ? approveAndSwap : () => swap()}
                                disabled={primaryDisabled}
                                className="w-full rounded-2xl bg-[rgba(255,222,85,0.98)] px-4 py-3 text-sm font-semibold text-black shadow-[0_12px_25px_-12px_rgba(255,222,85,0.9)] hover:bg-[rgba(255,210,65,0.98)] disabled:opacity-60 transition"
                            >
                                {primaryLabel}
                            </button>
                        )}

                        {insufficientBalance && walletOnSelectedChain && (
                            <div className="text-center text-xs text-red-300/90">
                                Amount exceeds your {sellToken.symbol} balance.
                            </div>
                        )}
                    </>
                ) : activeTab === "bridge" ? (
                    <BridgeTab selectedChainId={selectedChainId} onChainChange={pickChain} />
                ) : (
                    <TransactionsPanel key={txHistoryVersion} walletAddress={address} selectedChainId={selectedChainId} />
                )}
            </div>

            {/* Trending Tokens Section */}
            {isSwapSupported && activeTab === "swap" && (
                <TrendingTokens
                    chainId={selectedChainId}
                    onSelectToken={onSelectTrendingToken}
                    availableTokens={availableTokens.map(t => t.symbol)}
                />
            )}
    </div>
    );
}

export function SwapCard() {
    return <SwapCardInner />;
}
