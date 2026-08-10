"use client";

import { useState } from "react";

type TokenLogoProps = {
  symbol: string;
  logo?: string;
  size?: "xs" | "sm" | "lg";
};

export function TokenLogo({ symbol, logo, size = "sm" }: TokenLogoProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const imageSrc = logo && failedSrc !== logo ? logo : null;
  const sizeClass =
    size === "lg"
      ? "h-14 w-14"
      : size === "xs"
        ? "h-6 w-6"
        : "h-9 w-9";

  const initials = symbol.trim().slice(0, 3).toUpperCase();

  return (
    <div className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-[radial-gradient(circle_at_30%_25%,rgba(226,190,72,0.28),rgba(25,25,27,0.95)_68%)] ${sizeClass}`}>
      {imageSrc ? (
        <img
          src={imageSrc}
          alt={`${symbol} logo`}
          className="h-full w-full rounded-full object-cover"
          loading="lazy"
          onError={() => setFailedSrc(imageSrc)}
        />
      ) : (
        <span
          aria-label={`${symbol} token`}
          className={`${size === "lg" ? "text-xs" : "text-[8px]"} max-w-full truncate px-1 font-bold tracking-tight text-[rgba(255,222,85,0.92)]`}
        >
          {initials || "?"}
        </span>
      )}
    </div>
  );
}
