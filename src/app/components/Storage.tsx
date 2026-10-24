"use client";

import { useState } from "react";
import { STORAGE_OPS } from "@/app/constants/pulsarData";

export default function Storage() {
  const [redis, setRedis] = useState(false);

  return (
    <div className="mt-10">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 p-5">
        <div>
          <div className="text-white">Add a Redis cache driver</div>
          <div className="mt-1 text-sm text-white/50">Optional. Flip it to see where the engine&apos;s hot operations go.</div>
        </div>
        <button
          role="switch"
          aria-checked={redis}
          aria-label="Add a Redis cache driver"
          onClick={() => setRedis((r) => !r)}
          className={"relative h-8 w-14 rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4d94ff] " + (redis ? "bg-[#0066ff]" : "bg-white/20")}
        >
          <span className={"absolute top-1 h-6 w-6 rounded-full bg-white transition-all " + (redis ? "left-7" : "left-1")} />
        </button>
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-[1.2fr_1fr]">
        <div className="rounded-2xl border border-white/10">
          <div className="pl-mono border-b border-white/10 px-5 py-3 text-xs text-white/40">engine operations</div>
          {STORAGE_OPS.map((op) => (
            <div key={op} className="flex items-center justify-between gap-3 border-b border-white/5 px-5 py-3.5 last:border-0">
              <span className="text-sm text-white">{op}</span>
              <span
                className={
                  "pl-mono shrink-0 rounded-full border px-3 py-1 text-xs transition-colors duration-300 " +
                  (redis ? "border-[#0066ff] bg-[#0066ff]/15 text-[#4d94ff]" : "border-white/15 text-white/60")
                }
              >
                {redis ? "Redis" : "Postgres unlogged"}
              </span>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <div className={"flex-1 rounded-2xl p-6 transition-all duration-300 " + (redis ? "border border-[#0066ff] bg-[#0066ff]/10" : "border border-dashed border-white/15")}>
            <div className={"text-lg font-medium " + (redis ? "text-white" : "text-white/40")}>Redis</div>
            <p className={"mt-2 text-sm leading-relaxed " + (redis ? "text-white/70" : "text-white/30")}>
              {redis ? "A TCP driver for persistent servers, or an HTTP driver like Upstash for serverless and edge." : "Not connected. Nothing breaks without it."}
            </p>
          </div>
          <div className="flex-1 rounded-2xl border border-white/10 p-6">
            <div className="text-lg font-medium text-white">PostgreSQL</div>
            <p className="mt-2 text-sm leading-relaxed text-white/60">Always the persistent layer. Handles {redis ? "none" : "all"} of the hot operations on the left.</p>
          </div>
        </div>
      </div>

      <div className="pl-mono mt-3 flex items-center justify-between rounded-2xl border border-white/10 px-5 py-4 text-sm">
        <span className="text-white/60">hot operations on Postgres</span>
        <span className="text-white">
          <span className={redis ? "text-[#4d94ff]" : "text-white"}>{redis ? 0 : STORAGE_OPS.length}</span>
          <span className="text-white/40"> of {STORAGE_OPS.length}</span>
        </span>
      </div>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/50">
        Unlogged tables skip write-ahead logging, so they are truncated after a database crash. That only affects the engine&apos;s operational state, not your PGMQ queues.
      </p>
    </div>
  );
}