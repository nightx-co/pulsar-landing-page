"use client";

import { useEffect, useState } from "react";
import { BLUE, HEIGHTS, reduced } from "@/app/constants/pulsarData";

type Slot = { kind: "tick"; h: number; faded?: boolean } | { kind: "gap" };

const SLOTS: Slot[] = [
  ...HEIGHTS.map((h) => ({ kind: "tick", h }) as Slot),
  { kind: "gap" },
  ...HEIGHTS.map((_, i) => ({ kind: "tick", h: HEIGHTS[(i + 4) % 10] }) as Slot),
  { kind: "gap" },
  ...[46, 70, 38, 60].map((h) => ({ kind: "tick", h, faded: true }) as Slot),
];

export default function RunTimeline() {
  const [head, setHead] = useState(0);

  useEffect(() => {
    if (reduced()) { setHead(SLOTS.length); return; }
    const t = setInterval(() => setHead((h) => (h + 1) % (SLOTS.length + 4)), 260);
    return () => clearInterval(t);
  }, []);

  return (
    <div>
      <div className="flex h-36 items-end gap-[3px] md:gap-1.5" aria-hidden>
        {SLOTS.map((s, i) =>
          s.kind === "gap" ? (
            <div key={i} className="flex h-full w-4 shrink-0 flex-col items-center justify-end md:w-8">
              <div className={"h-full w-px border-l border-dashed " + (i < head ? "border-[#0066ff]" : "border-white/20")} />
            </div>
          ) : (
            <div
              key={i}
              className="flex-1 rounded-[2px] transition-colors duration-200"
              style={{
                height: `${s.h}%`,
                background: i === head ? BLUE : i < head ? "rgba(255,255,255,.75)" : "rgba(255,255,255,.12)",
                opacity: s.faded ? 0.5 : 1,
              }}
            />
          )
        )}
      </div>
      <div className="pl-mono mt-4 flex justify-between text-xs text-white/40">
        <span>run 1 · 10 ticks · cycleTickLimit</span>
        <span className="text-[#4d94ff]">self-invoke</span>
        <span className="hidden sm:inline">run 2 · fresh isolate</span>
      </div>
    </div>
  );
}