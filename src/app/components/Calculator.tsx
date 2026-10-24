"use client";

import { useState } from "react";

function Slider({ label, value, set, min, max }: { label: string; value: number; set: (n: number) => void; min: number; max: number }) {
  return (
    <label className="block">
      <div className="pl-mono mb-2 flex justify-between text-xs text-white/60"><span>{label}</span><span className="text-white">{value}</span></div>
      <input type="range" min={min} max={max} value={value} onChange={(e) => set(+e.target.value)} className="w-full accent-[#0066ff]" />
    </label>
  );
}

export default function Calculator() {
  const [c, setC] = useState(50);
  const [n, setN] = useState(10);
  const [cap, setCap] = useState(200);
  const [sec, setSec] = useState(1);
  const req = c * n;
  const got = Math.min(req, cap);
  const monthly = Math.round((86400 * 30) / sec);

  return (
    <div className="grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 md:grid-cols-2">
      <div className="space-y-6 bg-[#0a0a0a] p-6">
        <div className="text-white">Per-tick batch</div>
        <Slider label="concurrency" value={c} set={setC} min={1} max={100} />
        <Slider label="n (jobs per worker)" value={n} set={setN} min={1} max={50} />
        <Slider label="maxJobsPerTick" value={cap} set={setCap} min={10} max={2000} />
        <div className="pl-mono text-sm text-white/60">
          {c} × {n} = {req} requested →{" "}
          <span className="text-[#4d94ff]">{got} fetched</span>
          {req > cap && <span className="text-white/40"> (throttled)</span>}
        </div>
      </div>
      <div className="space-y-6 bg-black p-6">
        <div className="text-white">Self-invocation cost</div>
        <Slider label="selfInvocationIntervalSec" value={sec} set={setSec} min={1} max={30} />
        <div className="pl-mono text-4xl text-white">{monthly.toLocaleString()}</div>
        <div className="text-sm text-white/60">invocations per 30-day month while running continuously. Raise the interval to trade pickup latency for fewer invocations.</div>
      </div>
    </div>
  );
}