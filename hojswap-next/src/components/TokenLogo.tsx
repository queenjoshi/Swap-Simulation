"use client";

import { useState } from "react";

type TokenLogoProps = {
  symbol: string;
  logo?: string;
  size?: "xs" | "sm" | "lg";
};

export function TokenLogo({ symbol, logo, size = "sm" }: TokenLogoProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const preferredSrc = logo ?? "/logo.png";
  const imageSrc = failedSrc === preferredSrc ? "/logo.png" : preferredSrc;
  const sizeClass =
    size === "lg"
      ? "h-14 w-14"
      : size === "xs"
        ? "h-6 w-6"
        : "h-9 w-9";

  return (
    <div className={`relative flex shrink-0 items-center justify-center overflow-hidden ${sizeClass}`}>
      <img
        src={imageSrc}
        alt={`${symbol} logo`}
        className="h-full w-full rounded-full object-contain"
        loading="lazy"
        onError={() => setFailedSrc(imageSrc)}
      />
    </div>
  );
}
