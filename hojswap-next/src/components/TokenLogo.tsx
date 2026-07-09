"use client";

import { useState } from "react";

type TokenLogoProps = {
  symbol: string;
  logo?: string;
};

export function TokenLogo({ symbol, logo }: TokenLogoProps) {
  const [failed, setFailed] = useState(false);

  return (
    <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[rgba(212,175,55,0.3)] bg-[rgba(212,175,55,0.08)] text-[10px] font-bold text-[rgba(212,175,55,0.9)]">
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
