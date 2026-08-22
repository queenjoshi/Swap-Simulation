import { NextResponse } from "next/server";

const REGISTRY_URL = "https://s1.xrplmeta.org/v2/tokens/iou";

type RegistryToken = {
  currency?: string;
  issuer?: string;
  meta?: {
    token?: { name?: string; icon?: string; trust_level?: number };
    issuer?: { name?: string; trust_level?: number; kyc?: boolean };
  };
  metrics?: { holders?: number; volume_24h?: string; exchanges_24h?: string };
};

function displayCurrency(currency: string) {
  if (currency.length !== 40 || !/^[A-Fa-f0-9]{40}$/.test(currency)) return currency;
  try {
    return Buffer.from(currency, "hex").toString("utf8").replace(/\0+$/g, "").trim() || currency.slice(0, 8);
  } catch {
    return currency.slice(0, 8);
  }
}

export async function GET(request: Request) {
  try {
    const params = new URL(request.url).searchParams;
    const offset = Math.max(0, Math.min(160_000, Number.parseInt(params.get("offset") ?? "0", 10) || 0));
    const limit = Math.max(10, Math.min(100, Number.parseInt(params.get("limit") ?? "50", 10) || 50));
    const response = await fetch(`${REGISTRY_URL}?limit=${limit}&offset=${offset}`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(12_000),
    });
    if (!response.ok) throw new Error(`XRPL token registry ${response.status}`);
    const payload = await response.json() as { count?: number; tokens?: RegistryToken[] };
    const rawTokens = payload.tokens ?? [];
    const tokens = rawTokens.flatMap((entry) => {
      if (!entry.currency || !entry.issuer || !/^r[1-9A-HJ-NP-Za-km-z]{24,34}$/.test(entry.issuer)) return [];
      const symbol = displayCurrency(entry.currency).slice(0, 20);
      const trustLevel = Math.max(entry.meta?.token?.trust_level ?? 0, entry.meta?.issuer?.trust_level ?? 0);
      if (trustLevel < 3 || !entry.meta?.issuer?.kyc) return [];
      return [{
        symbol,
        name: (entry.meta?.token?.name ?? entry.meta?.issuer?.name ?? symbol).slice(0, 80),
        currency: entry.currency,
        issuer: entry.issuer,
        logo: entry.meta?.token?.icon ?? "",
        verified: true,
        imported: true,
        holders: Number(entry.metrics?.holders ?? 0),
        volume24h: Number(entry.metrics?.volume_24h ?? 0),
        exchanges24h: Number(entry.metrics?.exchanges_24h ?? 0),
      }];
    });
    const nextOffset = offset + rawTokens.length;
    return NextResponse.json({
      tokens,
      total: Number(payload.count ?? 0),
      offset,
      nextOffset,
      hasMore: rawTokens.length === limit && nextOffset < Number(payload.count ?? 0),
    });
  } catch (error) {
    console.error("[XRPL TOKENS]", error);
    return NextResponse.json({ error: "Unable to load the XRP Ledger token registry" }, { status: 502 });
  }
}
