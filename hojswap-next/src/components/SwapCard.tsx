"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
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
import { concat, decodeEventLog, encodeFunctionData, formatUnits, numberToHex, parseUnits, size, type Hex } from "viem";
import { base } from "wagmi/chains";
import { CHAIN_OPTIONS, SWAP_SUPPORTED_CHAIN_IDS, explorerAddressUrl, getChainName, zora } from "@/lib/chains";
import { clampToDecimals, formatSwapAmountDisplay, isValidNumberInput } from "@/lib/format";
import { calculateHouseFeeAmount, tokenTo0xParam, type QuoteResponse, type PriceResponse } from "@/lib/quote";
import { erc20Abi } from "@/lib/erc20";
import { defaultBuyForChain, defaultSellForChain, isNative, tokenDecimals, tokensForChain, type Token } from "@/lib/tokens";
import { effectiveSlippageBps, isSameToken, otherToken } from "@/lib/swap-utils";
import { loadSlippageBps } from "@/components/SlippageSettings";
import { SwapShowMore } from "@/components/SwapShowMore";
import { TokenBalance } from "@/components/TokenBalance";
import { TokenSelect } from "@/components/TokenSelect";
import { TokenLogo } from "@/components/TokenLogo";
import { BridgeTab } from "@/components/BridgeTab";
import { TrendingTokens } from "@/components/TrendingTokens";
import { SwapCoach } from "@/components/SwapCoach";
import { HouseGuard, type HouseGuardReceiptData, type HouseGuardVerification } from "@/components/HouseGuard";
import { useToast } from "@/components/Toast";
import { saveTransaction } from "@/lib/transactions";
import { useNativeTokenPrice, getNativeSymbol, formatNetworkFee } from "@/lib/gas";
import { hojswapRouterAbi, tokenToRouterAddress } from "@/lib/hojswap-router";
import { HOUSE_WALLET } from "@/lib/swap-fee";
import { NativeXrplSwap } from "@/components/NativeXrplSwap";
import { NativeSolanaSwap } from "@/components/NativeSolanaSwap";

const DEBOUNCE_MS = 750;
const BALANCE_PERCENTAGES = [25, 50, 75, 100] as const;
const XRPL_NATIVE_ID = -1;
const SOLANA_NATIVE_ID = -2;
const CHAIN_LOGOS: Record<number, string> = {
    1: "https://assets.coingecko.com/coins/images/279/standard/ethereum.png",
    10: "https://assets.coingecko.com/coins/images/25244/standard/Optimism.png",
    25: "https://assets.coingecko.com/coins/images/7310/standard/cro_token_logo.png",
    56: "https://assets.coingecko.com/coins/images/825/standard/bnb-icon2_2x.png",
    130: "https://assets.coingecko.com/coins/images/12504/standard/uniswap-logo.png",
    137: "https://assets.coingecko.com/coins/images/32440/standard/polygon.png",
    4663: "https://robinhood.com/favicon.ico",
    8453: "https://assets.coingecko.com/asset_platforms/images/131/small/base.jpeg",
    7777777: "https://zora.co/favicon.ico",
    43114: "https://assets.coingecko.com/coins/images/12559/standard/Avalanche_Circle_RedWhite_Trans.png",
    42161: "https://assets.coingecko.com/coins/images/16547/standard/arb.jpg",
    143: "https://www.monad.xyz/favicon.ico",
    146: "https://www.soniclabs.com/favicon.ico",
    480: "https://world.org/favicon.ico",
    999: "https://hyperfoundation.org/favicon.ico",
    5000: "https://www.mantle.xyz/favicon.ico",
    9745: "https://www.plasma.to/favicon.ico",
    57073: "https://inkonchain.com/favicon.ico",
    59144: "https://linea.build/favicon.ico",
    80094: "https://www.berachain.com/favicon.ico",
    534352: "https://scroll.io/favicon.ico",
};

type ActiveTab = "swap" | "bridge";
type ApiKeyError = "api_key_missing" | "api_key_invalid" | null;

type GuardReceiptLog = {
    address: `0x${string}`;
    data: Hex;
    topics: readonly Hex[];
};

function quoteGuardKey(quote: QuoteResponse | null, chainId: number, sellToken: Token, buyToken: Token) {
    if (!quote?.transaction) return "no-quote";
    return [
        chainId,
        sellToken.address ?? sellToken.symbol,
        buyToken.address ?? buyToken.symbol,
        quote.sellAmount ?? "",
        quote.buyAmount ?? "",
        quote.minBuyAmount ?? "",
        quote.transaction.to,
        quote.transaction.data.slice(-18),
    ].join(":");
}

function extractBoughtAmountFromLogs({
    logs,
    routerAddress,
    buyToken,
    recipient,
}: {
    logs: readonly GuardReceiptLog[];
    routerAddress: `0x${string}` | null;
    buyToken: Token;
    recipient: `0x${string}`;
}): bigint | null {
    if (routerAddress) {
        for (const log of logs) {
            if (log.address.toLowerCase() !== routerAddress.toLowerCase() || log.topics.length === 0) continue;
            try {
                const decoded = decodeEventLog({
                    abi: hojswapRouterAbi,
                    eventName: "SwapExecuted",
                    data: log.data,
                    topics: log.topics as [Hex, ...Hex[]],
                });
                if (decoded.args.recipient.toLowerCase() === recipient.toLowerCase()) return decoded.args.buyAmount;
            } catch {
                // A router transaction can emit other events; only SwapExecuted is relevant.
            }
        }
        return null;
    }

    if (!buyToken.address) return null;
    let netReceived = 0n;
    let foundTransfer = false;
    for (const log of logs) {
        if (log.address.toLowerCase() !== buyToken.address.toLowerCase() || log.topics.length === 0) continue;
        try {
            const decoded = decodeEventLog({
                abi: erc20Abi,
                eventName: "Transfer",
                data: log.data,
                topics: log.topics as [Hex, ...Hex[]],
            });
            if (decoded.args.to.toLowerCase() === recipient.toLowerCase()) {
                netReceived += decoded.args.value;
                foundTransfer = true;
            }
            if (decoded.args.from.toLowerCase() === recipient.toLowerCase()) netReceived -= decoded.args.value;
        } catch {
            // Ignore non-standard token logs instead of presenting an unverified amount.
        }
    }
    return foundTransfer && netReceived >= 0n ? netReceived : null;
}

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
    const [chainMenuOpen, setChainMenuOpen] = useState(false);
    const [nativeXrplMode, setNativeXrplMode] = useState(false);
    const [nativeSolanaMode, setNativeSolanaMode] = useState(false);
    const [zoraProfileTokens, setZoraProfileTokens] = useState<Token[]>([]);
    const [trendingTokens, setTrendingTokens] = useState<Token[]>([]);
    const [providerTokens, setProviderTokens] = useState<Token[]>([]);
    const availableTokens = useMemo(() => {
        const staticTokens = tokensForChain(selectedChainId);
        const byAddress = new Map(
            staticTokens
                .filter((token) => token.address)
                .map((token) => [token.address!.toLowerCase(), token]),
        );
        for (const token of zoraProfileTokens.filter((token) => token.chainId === selectedChainId)) {
            if (token.address && !byAddress.has(token.address.toLowerCase())) {
                byAddress.set(token.address.toLowerCase(), token);
            }
        }
        for (const token of trendingTokens.filter((token) => token.chainId === selectedChainId)) {
            if (token.address && !byAddress.has(token.address.toLowerCase())) {
                byAddress.set(token.address.toLowerCase(), token);
            }
        }
        for (const token of providerTokens.filter((token) => token.chainId === selectedChainId)) {
            if (token.address && !byAddress.has(token.address.toLowerCase())) {
                byAddress.set(token.address.toLowerCase(), token);
            }
        }
        return [
            ...staticTokens.filter((token) => !token.address),
            ...byAddress.values(),
        ];
    }, [providerTokens, selectedChainId, trendingTokens, zoraProfileTokens]);

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
    const [swapStep, setSwapStep] = useState<"approve" | "quote" | "fee" | "swap" | null>(null);

    const quoteDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);
    const quoteAbort = useRef<AbortController | null>(null);
    const chainMenuRef = useRef<HTMLDivElement>(null);
    const chainButtonRef = useRef<HTMLButtonElement>(null);
    const chainDropdownRef = useRef<HTMLDivElement>(null);
    const [chainMenuRect, setChainMenuRect] = useState<{ top: number; left: number; width: number } | null>(null);

    const walletOnSelectedChain = chainId === selectedChainId;
    const needsCorrectChain = isConnected && !walletOnSelectedChain;
    const selectedChainName = getChainName(selectedChainId);

    function pickChain(newChainId: number) {
        setChainMenuOpen(false);
        setChainMenuRect(null);
        if (newChainId === XRPL_NATIVE_ID) {
            setNativeXrplMode(true);
            setNativeSolanaMode(false);
            return;
        }
        if (newChainId === SOLANA_NATIVE_ID) {
            setNativeSolanaMode(true);
            setNativeXrplMode(false);
            return;
        }
        setNativeXrplMode(false);
        setNativeSolanaMode(false);
        setSelectedChainId(newChainId);
        setSellToken(defaultSellForChain(newChainId));
        setBuyToken(defaultBuyForChain(newChainId));
        setSellAmountInput("");
        setQuote(null);
        setPrice(null);
        setQuoteError(null);
    }

    const isSwapSupported = SWAP_SUPPORTED_CHAIN_IDS.includes(selectedChainId);
    // Unsupported quote networks still expose their complete token registry in
    // the swap card. This keeps every configured listing discoverable without
    // presenting a swap button that cannot produce a valid route.
    const isTokenCatalog = !isSwapSupported;

    useEffect(() => {
        const controller = new AbortController();
        const loadProfileTokens = async () => {
            for (let attempt = 1; attempt <= 4; attempt += 1) {
                try {
                    const response = await fetch("/api/zora-profile-tokens", {
                        cache: "no-store",
                        signal: controller.signal,
                    });
                    if (!response.ok) throw new Error(`Profile token API ${response.status}`);
                    const tokens = await response.json() as Token[];
                    if (!Array.isArray(tokens) || tokens.length === 0) {
                        throw new Error("Profile token API returned no tokens");
                    }
                    setZoraProfileTokens(tokens);
                    return;
                } catch (error) {
                    if (controller.signal.aborted) return;
                    if (attempt === 4) {
                        console.error("Error loading Zora profile tokens:", error);
                        return;
                    }
                    await new Promise((resolve) => setTimeout(resolve, attempt * 1_000));
                }
            }
        };
        void loadProfileTokens();
        return () => controller.abort();
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        setTrendingTokens([]);
        fetch(`/api/trending-tokens?chainId=${selectedChainId}`, {
            cache: "no-store",
            signal: controller.signal,
        })
            .then(async (response) => response.ok ? await response.json() as Token[] : [])
            .then((tokens) => {
                if (!controller.signal.aborted && Array.isArray(tokens)) setTrendingTokens(tokens);
            })
            .catch((error) => {
                if (!controller.signal.aborted) console.error("Error loading trending tokens:", error);
            });
        return () => controller.abort();
    }, [selectedChainId]);

    useEffect(() => {
        const controller = new AbortController();
        setProviderTokens([]);
        fetch(`/api/token-catalog?chainId=${selectedChainId}`, {
            cache: "no-store",
            signal: controller.signal,
        })
            .then(async (response) => response.ok
                ? await response.json() as { tokens?: Token[] }
                : { tokens: [] })
            .then((payload) => {
                if (!controller.signal.aborted && Array.isArray(payload.tokens)) {
                    setProviderTokens(payload.tokens);
                }
            })
            .catch((error) => {
                if (!controller.signal.aborted) console.error("Error loading provider token catalog:", error);
            });
        return () => controller.abort();
    }, [selectedChainId]);

    // Auto-switch to bridge tab if swap is not supported on the selected chain
    useEffect(() => {
        if (!isSwapSupported && !isTokenCatalog && activeTab === "swap") {
            setActiveTab("bridge");
        }
    }, [selectedChainId, isSwapSupported, isTokenCatalog, activeTab]);

    const updateChainMenuRect = useCallback(() => {
        const rect = chainButtonRef.current?.getBoundingClientRect();
        if (!rect || typeof window === "undefined") return;
        const width = Math.min(288, window.innerWidth - 32);
        const left = Math.min(Math.max(16, rect.right - width), window.innerWidth - width - 16);
        setChainMenuRect({ top: rect.bottom + 8, left, width });
    }, []);

    useEffect(() => {
        if (!chainMenuOpen) return;
        updateChainMenuRect();

        function onPointerDown(event: PointerEvent) {
            const target = event.target as Node;
            if (
                !chainMenuRef.current?.contains(target) &&
                !chainDropdownRef.current?.contains(target)
            ) {
                setChainMenuOpen(false);
            }
        }

        function onKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") setChainMenuOpen(false);
        }

        window.addEventListener("pointerdown", onPointerDown);
        window.addEventListener("keydown", onKeyDown);
        window.addEventListener("resize", updateChainMenuRect);
        window.addEventListener("scroll", updateChainMenuRect, true);
        return () => {
            window.removeEventListener("pointerdown", onPointerDown);
            window.removeEventListener("keydown", onKeyDown);
            window.removeEventListener("resize", updateChainMenuRect);
            window.removeEventListener("scroll", updateChainMenuRect, true);
        };
    }, [chainMenuOpen, updateChainMenuRect]);

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

    const { data: nativeBalanceData } = useBalance({
        address,
        chainId: selectedChainId,
        query: { enabled: isConnected && !!address && walletOnSelectedChain, refetchInterval: 12_000 },
    });

    function amountForBalancePercentage(percent: number) {
        if (!sellBalanceData) return;
        const balance = sellBalanceData.value;
        if (balance === 0n) return;
        const dec = sellBalanceData.decimals;
        let amount = (balance * BigInt(percent)) / 100n;

        // A native-token max must leave enough value to submit the swap. Keep
        // 1% of small balances or up to 0.0005 native tokens as a gas reserve.
        if (percent === 100 && isNative(sellToken)) {
            const gasReserveCap = parseUnits("0.0005", dec);
            const gasReserve = balance / 100n < gasReserveCap ? balance / 100n : gasReserveCap;
            amount = balance > gasReserve ? balance - gasReserve : 0n;
        }

        if (amount === 0n) return;
        setSellAmountInput(formatUnits(amount, dec));
    }

    function setMaxAmount() {
        amountForBalancePercentage(100);
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

    const currentGuardQuoteKey = useMemo(
        () => quoteGuardKey(quote, selectedChainId, sellToken, buyToken),
        [buyToken, quote, selectedChainId, sellToken],
    );
    const guardExpectedReceive = buyAmountFormatted
        ? `${buyAmountFormatted} ${buyToken.symbol}`
        : `Not available`;
    const guardMinimumReceive = minBuyFormatted ?? "Not verified";
    const hasGuardMinimum = useMemo(() => {
        try {
            return !!quote?.minBuyAmount && BigInt(quote.minBuyAmount) > 0n;
        } catch {
            return false;
        }
    }, [quote?.minBuyAmount]);

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

    const approvalScope: HouseGuardReceiptData["approvalScope"] = useMemo(() => {
        if (isNative(sellToken)) return "none";
        if (needsApproval && inputSellAmountBig != null) {
            const requestedApproval = quote?.hojswapRouter?.sellAmount
                ?? quote?.issues?.allowance?.expected
                ?? inputSellAmountBig.toString();
            try {
                return BigInt(requestedApproval) === inputSellAmountBig ? "exact" : "unknown";
            } catch {
                return "unknown";
            }
        }
        if (routerAddress && routerAllowance != null && inputSellAmountBig != null) {
            return routerAllowance === inputSellAmountBig ? "exact" : "unknown";
        }
        return "unknown";
    }, [inputSellAmountBig, needsApproval, quote?.hojswapRouter?.sellAmount, quote?.issues?.allowance?.expected, routerAddress, routerAllowance, sellToken]);

    const { writeContractAsync: approveAsync } = useWriteContract();
    const { writeContractAsync: writeRouterAsync } = useWriteContract();
    const { writeContractAsync: writeTokenAsync } = useWriteContract();
    const { sendTransactionAsync } = useSendTransaction();
    const { signTypedDataAsync } = useSignTypedData();
    const [swapTxHash, setSwapTxHash] = useState<`0x${string}` | undefined>();
    const [isSwapping, setIsSwapping] = useState(false);
    const [isApproving, setIsApproving] = useState(false);
    const [guardVerification, setGuardVerification] = useState<HouseGuardVerification>({
        quoteKey: "no-quote",
        status: "idle",
    });
    const [guardReceipt, setGuardReceipt] = useState<HouseGuardReceiptData | null>(null);

    async function verifyWithHouseGuard({
        quoteKey,
        to,
        data,
        value,
    }: {
        quoteKey: string;
        to: `0x${string}`;
        data: Hex;
        value: bigint;
    }) {
        if (!publicClient || !address) throw new Error("House Guard needs a connected wallet and chain client");
        setGuardVerification({ quoteKey, status: "checking" });
        try {
            // Do not reuse viem's short-lived block-number cache here. Immediately
            // after an ERC-20 approval, a cached pre-approval block produces a false
            // simulation failure even though the subsequent swap is valid.
            const blockNumber = await publicClient.getBlockNumber({ cacheTime: 0 });
            await publicClient.call({
                account: address,
                to,
                data,
                value,
                blockNumber,
            });
            setGuardVerification({ quoteKey, status: "verified", blockNumber });
            return blockNumber;
        } catch (error: unknown) {
            const detail = error instanceof Error && error.message
                ? error.message.split("\n")[0].slice(0, 180)
                : "The chain rejected the simulated transaction";
            setGuardVerification({
                quoteKey,
                status: "failed",
                message: detail,
            });
            throw new Error(`House Guard blocked this swap: ${detail}`);
        }
    }

    async function approveAndSwap() {
        if (!sellToken.address || !approvalSpender) return;
        const approvalAmount =
            routerAddress && quote?.hojswapRouter?.enabled
                ? BigInt(quote.hojswapRouter.sellAmount)
                : quote?.issues?.allowance?.expected
                  ? BigInt(quote.issues.allowance.expected)
                  : inputSellAmountBig;
        if (!approvalAmount || approvalAmount <= 0n) return;
        setIsApproving(true);
        setSwapStep("approve");
        try {
            const hash = await approveAsync({
                address: sellToken.address,
                abi: erc20Abi,
                functionName: "approve",
                args: [approvalSpender, approvalAmount],
                chainId: selectedChainId,
            });
            showToast({ kind: "info", title: "Approval submitted", message: "Waiting for confirmation…" });
            const approvalReceipt = await publicClient?.waitForTransactionReceipt({ hash });
            if (!approvalReceipt || approvalReceipt.status !== "success") {
                throw new Error("Token approval did not confirm successfully");
            }
            if (routerAddress) setRouterAllowance(approvalAmount);
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
        const capturedBuyDecimals = buyDecimals ?? tokenDecimals(capturedBuyToken);
        const capturedBuyAmountRaw = quoteToSwap.buyAmount ?? "0";
        const executionGuardKey = quoteGuardKey(quoteToSwap, selectedChainId, capturedSellToken, capturedBuyToken);
        const capturedApprovalScope = approvalScope;
        let capturedMinBuyAmountRaw: string;
        let capturedBuyAmount: string;
        let capturedMinBuyAmount: string;
        try {
            if (!quoteToSwap.minBuyAmount || BigInt(quoteToSwap.minBuyAmount) <= 0n) throw new Error("missing minimum");
            capturedMinBuyAmountRaw = quoteToSwap.minBuyAmount;
            capturedBuyAmount = formatUnits(BigInt(capturedBuyAmountRaw), capturedBuyDecimals);
            capturedMinBuyAmount = formatUnits(BigInt(capturedMinBuyAmountRaw), capturedBuyDecimals);
        } catch {
            setGuardVerification({
                quoteKey: executionGuardKey,
                status: "failed",
                message: "The route did not provide a valid, enforceable minimum receive amount",
            });
            setIsSwapping(false);
            showToast({ kind: "error", title: "House Guard blocked the swap", message: "The route did not provide a valid minimum receive amount." });
            return;
        }
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
                    const routerParams = {
                        swapTarget: to,
                        swapCallData: txData,
                        buyToken: buyTokenForRouter,
                        minBuyAmount,
                        recipient: address,
                    };
                    const guardedData = encodeFunctionData({
                        abi: hojswapRouterAbi,
                        functionName: "swapExactNative",
                        args: [routerParams],
                    });
                    await verifyWithHouseGuard({
                        quoteKey: executionGuardKey,
                        to: router.address,
                        data: guardedData,
                        value: sellAmountForRouter,
                    });
                    txHash = await writeRouterAsync({
                        address: router.address,
                        abi: hojswapRouterAbi,
                        functionName: "swapExactNative",
                        args: [routerParams],
                        value: sellAmountForRouter,
                        chainId: selectedChainId,
                    });
                } else {
                    if (!capturedSellToken.address) throw new Error("Missing sell token address");
                    if (!router.spender || router.spender === "0x0000000000000000000000000000000000000000") {
                        throw new Error("Missing allowance spender in router quote");
                    }
                    const routerParams = {
                        sellToken: capturedSellToken.address,
                        sellAmount: sellAmountForRouter,
                        spender: router.spender,
                        swapTarget: to,
                        swapCallData: txData,
                        buyToken: buyTokenForRouter,
                        minBuyAmount,
                        recipient: address,
                    };
                    const guardedData = encodeFunctionData({
                        abi: hojswapRouterAbi,
                        functionName: "swapExactToken",
                        args: [routerParams],
                    });
                    await verifyWithHouseGuard({
                        quoteKey: executionGuardKey,
                        to: router.address,
                        data: guardedData,
                        value: 0n,
                    });
                    txHash = await writeRouterAsync({
                        address: router.address,
                        abi: hojswapRouterAbi,
                        functionName: "swapExactToken",
                        args: [routerParams],
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

                await verifyWithHouseGuard({
                    quoteKey: executionGuardKey,
                    to,
                    data: txData,
                    value: value ? BigInt(value) : 0n,
                });

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
            const actualBuyAmountRaw = swapSuccess && receipt && address
                ? extractBoughtAmountFromLogs({
                    logs: receipt.logs as readonly GuardReceiptLog[],
                    routerAddress: router?.address ?? null,
                    buyToken: capturedBuyToken,
                    recipient: address,
                })
                : null;
            const actualBuyAmount = actualBuyAmountRaw != null
                ? formatUnits(actualBuyAmountRaw, capturedBuyDecimals)
                : undefined;
            const outcomeVerified = actualBuyAmountRaw != null && actualBuyAmountRaw >= BigInt(capturedMinBuyAmountRaw);
            const receiptStatus: HouseGuardReceiptData["status"] = !swapSuccess
                ? "failed"
                : outcomeVerified
                    ? "verified"
                    : "not_verified";
            const receiptMessage = !swapSuccess
                ? "The chain confirmed that the transaction reverted. No successful swap outcome is being claimed."
                : outcomeVerified
                    ? "The on-chain received amount met or exceeded the minimum promised before signing."
                    : isNative(capturedBuyToken)
                        ? "The swap succeeded, but this route did not emit a token transfer that House Guard can use to independently prove the native-token output."
                        : "The swap succeeded, but House Guard could not decode a standard on-chain transfer for the output token. The amount is intentionally marked Not verified.";
            if (receipt) {
                setGuardVerification({
                    quoteKey: executionGuardKey,
                    status: swapSuccess ? "verified" : "failed",
                    blockNumber: receipt.blockNumber,
                    message: swapSuccess
                        ? "The mined transaction confirmed successfully on-chain"
                        : "The mined transaction reverted on-chain",
                });
            }
            setGuardReceipt({
                txHash,
                chainId: selectedChainId,
                blockNumber: receipt?.blockNumber,
                status: receiptStatus,
                sellAmount: capturedSellAmount,
                sellToken: capturedSellToken.symbol,
                expectedReceive: formatSwapAmountDisplay(capturedBuyAmount),
                minimumReceive: formatSwapAmountDisplay(capturedMinBuyAmount),
                actualReceive: actualBuyAmount ? formatSwapAmountDisplay(actualBuyAmount) : undefined,
                buyToken: capturedBuyToken.symbol,
                approvalScope: capturedApprovalScope,
                message: receiptMessage,
            });
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
        return `Verify & swap ${sellToken.symbol} → ${buyToken.symbol}`;
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
    const hasNativeGas = !isConnected ? null : nativeBalanceData ? nativeBalanceData.value > 0n : null;

    const CHAINS = [
        {
            id: SOLANA_NATIVE_ID,
            name: "Solana",
            ticker: "SOL",
            mode: "Jupiter",
            logo: "https://assets.coingecko.com/coins/images/4128/standard/solana.png",
        },
        {
            id: XRPL_NATIVE_ID,
            name: "XRP Ledger",
            ticker: "XRP",
            mode: "Native DEX",
            logo: "/tokens/xrp.png",
        },
        ...CHAIN_OPTIONS.map(({ id, label, shortLabel, swap }) => ({
            id,
            name: label,
            ticker: shortLabel,
            mode: swap ? "Swap" : "Catalog",
            logo: CHAIN_LOGOS[id],
        })),
    ];
    const activeChainId = nativeSolanaMode ? SOLANA_NATIVE_ID : nativeXrplMode ? XRPL_NATIVE_ID : selectedChainId;
    const selectedChainOption = CHAINS.find((chain) => chain.id === activeChainId) ?? CHAINS[0];

    const TABS: { id: ActiveTab; label: string }[] = [
        { id: "swap", label: "Swap" },
        { id: "bridge", label: "Bridge" },
    ];

    if (nativeXrplMode) {
        return <NativeXrplSwap onBack={() => setNativeXrplMode(false)} />;
    }

    if (nativeSolanaMode) {
        return <NativeSolanaSwap networks={CHAINS} onNetworkChange={pickChain} />;
    }

    return (
        <div className="w-full max-w-[450px]">
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

            <div className="hoj-card space-y-2 rounded-[24px] p-2 sm:rounded-[26px] sm:p-2.5">
                <div className="relative z-[90] flex items-center justify-between gap-2 px-1 pb-1">
                    <div className="min-w-0">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/35">Trade</p>
                        <p className="truncate text-sm font-semibold text-white/80">{selectedChainName}</p>
                    </div>
                    <div ref={chainMenuRef} className="relative z-[100]">
                        <button
                            ref={chainButtonRef}
                            type="button"
                            onClick={() => {
                                updateChainMenuRect();
                                setChainMenuOpen((next) => !next);
                            }}
                            className="flex min-w-[8.25rem] items-center justify-between gap-2 rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-1.5 text-left outline-none transition hover:border-[rgba(212,175,55,0.3)] focus:border-[rgba(212,175,55,0.55)] sm:min-w-[8.75rem] sm:py-2"
                            aria-haspopup="listbox"
                            aria-expanded={chainMenuOpen}
                            aria-label="Select network"
                        >
                            <span className="flex min-w-0 items-center gap-2">
                                <TokenLogo
                                    symbol={selectedChainOption.ticker}
                                    logo={selectedChainOption.logo}
                                    size="xs"
                                />
                                <span className="truncate text-xs font-semibold text-white/80">
                                    {selectedChainOption.name}
                                </span>
                            </span>
                            <span className={`text-xs text-[rgba(212,175,55,0.9)] transition ${chainMenuOpen ? "rotate-180" : ""}`}>▾</span>
                        </button>
                    </div>
                </div>

                {chainMenuOpen && chainMenuRect && typeof document !== "undefined" && createPortal(
                    <div
                        ref={chainDropdownRef}
                        role="listbox"
                        style={{
                            top: chainMenuRect.top,
                            left: chainMenuRect.left,
                            width: chainMenuRect.width,
                            maxHeight: "min(18rem, calc(100vh - 2rem))",
                        }}
                        className="fixed z-[9999] overflow-y-auto rounded-2xl border border-white/10 bg-[#111113] p-1.5 shadow-[0_24px_70px_rgba(0,0,0,0.82)] ring-1 ring-black/50"
                    >
                        {CHAINS.map((chain) => {
                            const selected = chain.id === activeChainId;
                            return (
                                <button
                                    key={chain.id}
                                    type="button"
                                    role="option"
                                    aria-selected={selected}
                                    onClick={() => pickChain(chain.id)}
                                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${selected
                                        ? "bg-[rgba(212,175,55,0.14)] text-white"
                                        : "text-white/78 hover:bg-white/[0.06] hover:text-white"
                                        }`}
                                >
                                    <TokenLogo symbol={chain.ticker} logo={chain.logo} size="sm" />
                                    <span className="flex min-w-0 flex-1 items-center justify-between gap-3">
                                        <span className="min-w-0">
                                            <span className="block truncate text-sm font-semibold leading-tight">{chain.name}</span>
                                            <span className="block truncate text-xs leading-tight text-white/40">{chain.ticker}</span>
                                        </span>
                                        <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                                            chain.mode === "Swap"
                                                ? "border-[rgba(212,175,55,0.3)] text-[rgba(212,175,55,0.82)]"
                                                : "border-white/10 text-white/40"
                                        }`}>
                                            {chain.mode}
                                        </span>
                                    </span>
                                </button>
                            );
                        })}
                    </div>,
                    document.body,
                )}

                {!isTokenCatalog && <div className="flex gap-1 rounded-full border border-white/8 bg-black/25 p-1">
                    {TABS.filter(tab => tab.id !== "swap" || isSwapSupported).map(({ id, label }) => (
                        <button
                            key={id}
                            type="button"
                            onClick={() => setActiveTab(id)}
                                className={`min-w-0 flex-1 rounded-full px-2 py-1.5 text-[12px] font-semibold capitalize transition sm:px-3 sm:py-2 ${activeTab === id
                                ? "bg-[rgba(212,175,55,0.95)] text-black"
                                : "bg-transparent text-white/70 hover:bg-white/5"
                                }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>}

                {isTokenCatalog ? (
                    <div className="space-y-3">
                        <div className="hoj-panel rounded-[26px] p-4 sm:p-5">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[rgba(212,175,55,0.72)]">
                                {selectedChainName} token catalog
                            </p>
                            <h2 className="mt-2 text-lg font-semibold text-white/90">
                                Tokens available on {selectedChainName}
                            </h2>
                            <p className="mt-2 text-xs leading-6 text-white/50">
                                {selectedChainId === zora.id
                                    ? "Profile tokens reported on Zora Network appear here. Newer Zora creator coins deployed on Base remain in the Base catalog."
                                    : `All ${availableTokens.length} configured ${selectedChainName} tokens are listed here.`}
                            </p>
                        </div>
                        <div className="hoj-panel rounded-[26px] p-4 sm:p-5">
                            <div className="mb-3 flex items-center justify-between gap-3">
                                <div>
                                    <div className="text-[15px] font-semibold text-white/70">Browse token</div>
                                    <div className="mt-1 text-xs text-white/40">{availableTokens.length} available</div>
                                </div>
                                <div className="w-[9.5rem] shrink-0">
                                    <TokenSelect
                                        tokens={availableTokens}
                                        value={buyToken}
                                        onChange={setBuyToken}
                                    />
                                </div>
                            </div>
                            {buyToken.address && (
                                <a
                                    href={explorerAddressUrl(selectedChainId, buyToken.address)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block truncate rounded-xl border border-white/8 bg-black/20 px-3 py-2 font-mono text-[11px] text-white/45 transition hover:text-[rgba(212,175,55,0.9)]"
                                >
                                    {buyToken.address}
                                </a>
                            )}
                        </div>
                        <div className="rounded-2xl border border-amber-400/20 bg-amber-400/[0.07] px-4 py-3 text-xs leading-5 text-amber-100/70">
                            {selectedChainName} is catalog-only for now because the current swap integration does not support this chain. Token listings remain available for discovery and verification.
                        </div>
                    </div>
                ) : isSwapSupported && activeTab === "swap" ? (
                    <>
                        <div className="relative !z-30">
                            <div className="hoj-panel rounded-[22px] p-3.5 sm:rounded-[24px] sm:p-4">
                                <div className="mb-2 flex items-start justify-between gap-3 sm:mb-2.5">
                                    <div className="text-[15px] font-semibold text-white/55">Sell</div>
                                    <div className="w-[8.5rem] shrink-0 sm:w-[9.25rem]">
                                        <TokenSelect
                                            tokens={availableTokens}
                                            value={sellToken}
                                            onChange={onSellTokenChange}
                                        />
                                    </div>
                                </div>
                                <div className="min-w-0 overflow-hidden">
                                    <input
                                        inputMode="decimal"
                                        placeholder="0"
                                        value={sellAmountInput}
                                        onChange={(e) => {
                                            const nextRaw = e.target.value.replaceAll(",", ".");
                                            if (!isValidNumberInput(nextRaw)) return;
                                            const next = sellDecimals != null ? clampToDecimals(nextRaw, sellDecimals) : nextRaw;
                                            setSellAmountInput(next);
                                        }}
                                        className="hoj-input w-full min-w-0 bg-transparent text-[2.65rem] font-semibold leading-none text-white outline-none placeholder:text-white/25 sm:text-5xl"
                                    />
                                </div>
                                <div className="mt-3 grid grid-cols-4 gap-1.5 sm:gap-2" aria-label="Choose percentage of balance to swap">
                                    {BALANCE_PERCENTAGES.map((percent) => (
                                        <button
                                            key={percent}
                                            type="button"
                                            onClick={() => amountForBalancePercentage(percent)}
                                            disabled={!sellBalanceData || sellBalanceData.value === 0n || !walletOnSelectedChain}
                                            className="min-h-9 rounded-xl border border-white/10 bg-white/[0.04] px-1.5 py-1.5 text-[11px] font-semibold tabular-nums text-white/60 transition hover:border-[rgba(212,175,55,0.45)] hover:bg-[rgba(212,175,55,0.1)] hover:text-[rgba(255,222,85,0.95)] disabled:cursor-not-allowed disabled:opacity-30 sm:px-2 sm:text-xs"
                                            aria-label={`Swap ${percent}% of ${sellToken.symbol} balance`}
                                        >
                                            {percent}%
                                        </button>
                                    ))}
                                </div>
                                <TokenBalance token={sellToken} chainId={selectedChainId} isConnected={isConnected} walletChainId={chainId} onMax={walletOnSelectedChain ? setMaxAmount : undefined} />
                            </div>

                            <button
                                type="button"
                                onClick={flipTokens}
                                className="relative z-10 mx-auto -my-2.5 flex h-10 w-10 items-center justify-center rounded-xl border-[3px] border-[#101012] bg-[#19191b] text-xl text-[rgba(212,175,55,0.95)] shadow-[0_12px_24px_rgba(0,0,0,0.45)] transition hover:bg-[#202022] hover:text-[rgba(255,222,85,1)] sm:h-11 sm:w-11 sm:rounded-2xl sm:text-2xl"
                                aria-label="Flip tokens"
                            >
                                ↓
                            </button>

                            <div className="hoj-panel rounded-[22px] p-3.5 pt-6 sm:rounded-[24px] sm:p-4 sm:pt-7">
                                <div className="mb-2 flex items-start justify-between gap-3 sm:mb-2.5">
                                    <div className="text-[15px] font-semibold text-white/55">Buy</div>
                                    <div className="w-[8.5rem] shrink-0 sm:w-[9.25rem]">
                                        <TokenSelect
                                            tokens={availableTokens}
                                            value={buyToken}
                                            onChange={onBuyTokenChange}
                                        />
                                    </div>
                                </div>
                                <div className="min-w-0 overflow-hidden">
                                    <div className="truncate text-[2.25rem] font-semibold leading-none tabular-nums text-white/90 sm:text-[2.65rem]" title={buyAmountRaw ?? undefined}>
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
                                <TokenBalance token={buyToken} chainId={selectedChainId} isConnected={isConnected} walletChainId={chainId} />
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

                        <HouseGuard
                            quoteKey={currentGuardQuoteKey}
                            hasQuote={!!quote?.transaction}
                            isConnected={isConnected}
                            sellAmount={sellAmountInput || "0"}
                            sellToken={sellToken.symbol}
                            expectedReceive={guardExpectedReceive}
                            minimumReceive={guardMinimumReceive}
                            hasMinimumReceive={hasGuardMinimum}
                            approvalScope={approvalScope}
                            verification={guardVerification}
                            receipt={guardReceipt}
                            onDismissReceipt={() => setGuardReceipt(null)}
                        />

                        <SwapCoach
                            quote={quote}
                            price={price}
                            sellToken={sellToken}
                            buyToken={buyToken}
                            selectedChainId={selectedChainId}
                            isConnected={isConnected}
                            isQuoting={isQuoting}
                            gasDisplay={gasDisplay}
                            nativeUsdPrice={nativeUsdPrice}
                            hasNativeGas={hasNativeGas}
                        />

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
                                className="w-full min-h-12 rounded-[20px] bg-[rgba(212,175,55,0.95)] px-4 py-3 text-sm font-semibold text-black transition hover:bg-[rgba(212,175,55,0.85)] disabled:opacity-60 sm:text-base"
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
                                className="w-full min-h-12 rounded-[20px] bg-[rgba(255,222,85,0.98)] px-4 py-3 text-sm font-bold text-black shadow-[0_14px_28px_-18px_rgba(255,222,85,0.9)] transition hover:bg-[rgba(255,210,65,0.98)] disabled:opacity-60 sm:text-base"
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
                ) : (
                    <BridgeTab key={selectedChainId} selectedChainId={selectedChainId} onChainChange={pickChain} />
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
