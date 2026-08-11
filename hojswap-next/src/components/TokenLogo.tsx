"use client";

import { useState } from "react";

type TokenLogoProps = {
  symbol: string;
  logo?: string;
  size?: "xs" | "sm" | "lg";
};

export function TokenLogo({ symbol, logo, size = "sm" }: TokenLogoProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const preferredSrc = logo?.trim() || null;
  const imageSrc = preferredSrc && failedSrc !== preferredSrc ? preferredSrc : null;
  const sizeClass =
    size === "lg"
      ? "h-14 w-14"
      : size === "xs"
        ? "h-6 w-6"
        : "h-9 w-9";

  const normalizedSymbol = symbol.trim() || "?";
  const fallbackText = normalizedSymbol.slice(0, 3).toUpperCase();
  const hue = Array.from(normalizedSymbol).reduce(
    (total, character) => (total * 31 + character.charCodeAt(0)) % 360,
    42,
  );

  return (
    <div
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/[0.045] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.2)] ${sizeClass}`}
    >
      {imageSrc ? (
        <img
          src={imageSrc}
          alt={`${symbol} logo`}
          className="h-full w-full rounded-full object-contain"
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setFailedSrc(imageSrc)}
        />
      ) : (
        <span
          aria-label={`${symbol} token symbol`}
          className="flex h-full w-full items-center justify-center rounded-full font-sans text-[9px] font-bold tracking-[-0.04em] text-white/90"
          style={{
            background: `linear-gradient(145deg, hsl(${hue} 52% 38%), hsl(${(hue + 28) % 360} 58% 20%))`,
          }}
        >
          {fallbackText}
        </span>
      )}
    </div>
  );
}
