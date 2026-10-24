"use client";

import { useState } from "react";
import LifeStrip from "./LifeStrip";
import { RUNTIMES } from "@/app/constants/pulsarData";

export default function Runtimes() {
  const [i, setI] = useState(0);
  const rt = RUNTIMES[i];

  return (
    <>
      <div className="mt-10 inline-flex flex-wrap rounded-full border border-white/15 p-1" role="tablist" aria-label="Runtime">
        {RUNTIMES.map((r, idx) => (
          <button
            key={r.id}
            role="tab"
            aria-selected={i === idx}
            onClick={() => setI(idx)}
            className={
              "rounded-full px-5 py-2 text-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#4d94ff] " +
              (i === idx ? "bg-[#0066ff] text-white" : "text-white/60 hover:text-white")
            }
          >
            {r.label}
          </button>
        ))}
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
        <div className="border-b border-white/10 p-6 md:p-8">
          <LifeStrip key={rt.id} kind={rt.kind} />
        </div>
        <div className="grid md:grid-cols-[1.3fr_1fr]">
          <div className="p-6 md:border-r md:border-white/10 md:p-8">
            <div className="pl-mono text-sm text-[#4d94ff]">{rt.id}</div>
            <p className="mt-3 max-w-md leading-relaxed text-white/70">{rt.blurb}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {rt.hosts.map((h) => (
                <span key={h} className="rounded-full border border-white/15 px-3 py-1 text-xs text-white/70">{h}</span>
              ))}
            </div>
          </div>
          <dl className="border-t border-white/10 md:border-t-0">
            {rt.rows.map(([k, v]) => (
              <div key={k} className="flex items-baseline justify-between gap-4 border-b border-white/5 px-6 py-4 last:border-0 md:px-8">
                <dt className="pl-mono text-xs text-white/40">{k}</dt>
                <dd className="text-right text-sm text-white">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <p className="mt-6 max-w-2xl text-sm leading-relaxed text-white/50">
        Re-invocation uses pg_net by default. Choose manual to trigger the next cycle yourself through something fire-and-forget like QStash or SNS. Never await a request to selfURL, it holds the current instance open.
      </p>
    </>
  );
}