"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { TokenLogo } from "./TokenLogo";

type NetworkOption = { id: number; name: string; ticker: string; mode: string; logo?: string };

/** Shared presentation only: each native network retains its own execution flow. */
export function NativeSwapHeader({ networks, activeId, onNetworkChange, disabled = false, onOpen }: {
  networks: NetworkOption[]; activeId: number; onNetworkChange: (id: number) => void; disabled?: boolean; onOpen?: () => void;
}) {
  const selected = networks.find(network => network.id === activeId)!;
  const button = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ top: number; left: number; width: number } | null>(null);
  useEffect(() => {
    if (!position) return;
    function close(event: PointerEvent) {
      if (!button.current?.contains(event.target as Node) && !menu.current?.contains(event.target as Node)) setPosition(null);
    }
    function escape(event: KeyboardEvent) { if (event.key === "Escape") setPosition(null); }
    function hide(event: Event) {
      if (event.target instanceof Node && menu.current?.contains(event.target)) return;
      setPosition(null);
    }
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", escape);
    window.addEventListener("resize", hide);
    window.addEventListener("scroll", hide, true);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", escape);
      window.removeEventListener("resize", hide);
      window.removeEventListener("scroll", hide, true);
    };
  }, [position]);
  return <>
    <div className="relative z-[90] flex items-center justify-between gap-2 px-1 pb-1">
      <div className="min-w-0"><p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/35">Trade</p><p className="truncate text-sm font-semibold text-white/80">{selected.name}</p></div>
      <button ref={button} type="button" disabled={disabled} aria-label="Select network" aria-haspopup="listbox" aria-expanded={Boolean(position)}
        onClick={() => {
          if (position) { setPosition(null); return; }
          onOpen?.();
          const rect = button.current!.getBoundingClientRect();
          const width = Math.min(320, window.innerWidth - 32);
          const height = Math.min(288, window.innerHeight - 32);
          setPosition({ width, left: Math.max(16, Math.min(rect.right - width, window.innerWidth - width - 16)), top: rect.bottom + height + 8 < window.innerHeight ? rect.bottom + 8 : Math.max(16, rect.top - height - 8) });
        }}
        className="flex min-w-[8.25rem] items-center justify-between gap-2 rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-1.5 text-left outline-none transition hover:border-[rgba(212,175,55,0.3)] focus:border-[rgba(212,175,55,0.55)] sm:min-w-[8.75rem] sm:py-2">
        <span className="flex min-w-0 items-center gap-2"><TokenLogo symbol={selected.ticker} logo={selected.logo} size="xs" /><span className="truncate text-xs font-semibold text-white/80">{selected.name}</span></span>
        <span className={`text-xs text-[rgba(212,175,55,0.9)] transition ${position ? "rotate-180" : ""}`}>▾</span>
      </button>
    </div>
    {position && createPortal(<div ref={menu} role="listbox" aria-label="Networks" style={{ ...position, maxHeight: "min(18rem, calc(100vh - 2rem))" }} className="fixed z-[9999] overflow-y-auto rounded-2xl border border-white/10 bg-[#111113] p-1.5 shadow-[0_24px_70px_rgba(0,0,0,0.82)] ring-1 ring-black/50">
      {networks.map(network => <button key={network.id} type="button" role="option" aria-selected={network.id === activeId} onClick={() => { setPosition(null); onNetworkChange(network.id); }}
        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${network.id === activeId ? "bg-[rgba(212,175,55,0.14)] text-white" : "text-white/78 hover:bg-white/[0.06] hover:text-white"}`}>
        <TokenLogo symbol={network.ticker} logo={network.logo} size="sm" /><span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold leading-tight">{network.name}</span><span className="block text-xs text-white/40">{network.ticker}</span></span><span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] font-semibold text-white/40">{network.mode}</span>
      </button>)}
    </div>, document.body)}
    <div className="flex gap-1 rounded-full border border-white/8 bg-black/25 p-1">
      <button type="button" className="min-w-0 flex-1 rounded-full bg-[rgba(212,175,55,0.95)] px-2 py-1.5 text-[12px] font-semibold text-black sm:px-3 sm:py-2">Swap</button>
      <button type="button" disabled title={`${selected.name} bridging is not available in this panel`} className="min-w-0 flex-1 rounded-full px-2 py-1.5 text-[12px] font-semibold text-white/30 sm:px-3 sm:py-2">Bridge</button>
    </div>
  </>;
}

export function NativeSwapGuard({ children }: { children: ReactNode }) {
  return <section aria-label="House Guard verification" className="rounded-2xl border border-[rgba(212,175,55,0.2)] bg-[rgba(212,175,55,0.045)] p-3">
    <div className="flex items-center justify-between gap-2"><span className="hoj-display text-xs font-semibold text-[rgba(212,175,55,0.95)]">House Guard</span><span className="text-[9px] uppercase tracking-[0.16em] text-white/40">Verify before signing</span></div>
    <div className="mt-2 space-y-1 text-[11px] leading-5 text-white/55">{children}</div>
  </section>;
}
