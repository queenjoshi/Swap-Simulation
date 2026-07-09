"use client";

import { useState } from "react";

type TokenLogoProps = {
  symbol: string;
  logo?: string;
  size?: "sm" | "lg";
};

export function TokenLogo({ symbol, logo, size = "sm" }: TokenLogoProps) {
  const [failed, setFailed] = useState(false);
  const sizeClass = size === "lg" ? "h-14 w-14 text-[11px]" : "h-9 w-9 text-[10px]";

  return (
    <div className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-[rgba(212,175,55,0.3)] bg-[rgba(212,175,55,0.08)] font-bold text-[rgba(212,175,55,0.9)] ${sizeClass}`}>
      <span>{symbol.slice(0, 4)}</span>
      {logo && !failed ? (
        <img
          src={logo}
          alt={`${symbol} logo`}
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
          onError={() => setFailed(true)}
        />
      ) : null}
    </div>
  );
}
