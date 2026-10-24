"use client";

import { useEffect, useState } from "react";
import { BLUE, HEIGHTS, reduced, RT } from "@/app/constants/pulsarData";

type Item = { k: "t"; h: number; faded?: boolean } | { k: "hand" } | { k: "wait" };
const ticks = (n: number, off = 0, faded = false): Item[] =>
  Array.from({ length: n }, (_, i) => ({ k: "t", h: HEIGHTS[(i + off) % HEIGHTS.length], faded }) as Item);

const STRIPS: Record<RT["kind"], Item[]> = {
  vm: [...ticks(9), { k: "hand" }, ...ticks(9, 3), { k: "hand" }, ...ticks(5, 6, true)],
  isolate: [...ticks(8), { k: "hand" }, { k: "wait" }, ...ticks(8, 3), { k: "hand" }, { k: "wait" }, ...ticks(3, 7, true)],
  persistent: ticks(30),
};

const STRIP_LABELS: Record<RT["kind"], string[]> = {
  vm: ["run 1", "self-invoke", "run 2, new container"],
  isolate: ["run 1", "pause, isolate recycles", "run 2, fresh isolate"],
  persistent: ["one process", "no restarts", "ticking as long as it lives"],
};

export default function LifeStrip({ kind }: { kind: RT["kind"] }) {
  const items = STRIPS[kind];
  const [head, setHead] = useState(0);

  useEffect(() => {
    if (reduced()) { setHead(items.length); return; }
    setHead(0);
    const t = setInterval(() => setHead((h) => (h + 1) % (items.length + 4)), 200);
    return () => clearInterval(t);
  }, [items.length]);

  const labels = STRIP_LABELS[kind];

  return (
    <div>
      <div className="flex h-28 items-end gap-[3px]" aria-hidden>
        {items.map((it, i) =>
          it.k === "t" ? (
            <div
              key={i}
              className="flex-1 rounded-[2px] transition-colors duration-200"
              style={{
                height: `${it.h}%`,
                background: i === head ? BLUE : i < head ? "rgba(255,255,255,.75)" : "rgba(255,255,255,.12)",
                opacity: it.faded ? 0.5 : 1,
              }}
            />
          ) : it.k === "hand" ? (
            <div key={i} className="flex h-full w-3 shrink-0 justify-center md:w-5">
              <div className={"h-full w-px border-l border-dashed " + (i < head ? "border-[#0066ff]" : "border-white/20")} />
            </div>
          ) : (
            <div key={i} className="h-full w-5 shrink-0 md:w-10">
              <div className={"h-full border-b border-dotted " + (i < head ? "border-[#0066ff]" : "border-white/20")} />
            </div>
          )
        )}
      </div>
      <div className="pl-mono mt-4 flex justify-between gap-3 text-xs text-white/40">
        <span>{labels[0]}</span>
        <span className={kind === "persistent" ? "text-white/40" : "text-[#4d94ff]"}>{labels[1]}</span>
        <span className="hidden text-right sm:inline">{labels[2]}</span>
      </div>
    </div>
  );
}