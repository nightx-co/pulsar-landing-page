"use client";

import { useEffect, useState } from "react";
import { BLUE, BLUE_LT, reduced, TICK_STEPS } from "@/app/constants/pulsarData";

export default function TickLoop() {
  const LIMIT = 10, STEPS = TICK_STEPS.length, HANDOFF = 4;
  const total = LIMIT * STEPS + HANDOFF;
  const [t, setT] = useState(0);

  useEffect(() => {
    if (reduced()) { setT(2 * STEPS + 2); return; }
    const id = setInterval(() => setT((x) => (x + 1) % total), 380);
    return () => clearInterval(id);
  }, [STEPS, total]);

  const handoff = t >= LIMIT * STEPS;
  const tick = handoff ? LIMIT : Math.floor(t / STEPS) + 1;
  const step = handoff ? -1 : t % STEPS;

  const R = 120, C = 2 * Math.PI * R;
  const frac = handoff ? 1 : step / STEPS;
  const pts = TICK_STEPS.map((_, i) => {
    const a = ((-90 + i * (360 / STEPS)) * Math.PI) / 180;
    return [160 + R * Math.cos(a), 160 + R * Math.sin(a)];
  });

  return (
    <div>
      <div className="grid items-center gap-10 md:grid-cols-2">
        <svg viewBox="0 0 320 320" className="mx-auto w-full max-w-[340px]" role="img" aria-label="A tick runs six steps, then repeats until the tick limit is reached">
          <circle cx="160" cy="160" r={R} fill="none" stroke="rgba(255,255,255,.12)" strokeWidth="2" />
          <circle
            cx="160" cy="160" r={R} fill="none" stroke={BLUE} strokeWidth="2.5" strokeLinecap="round"
            strokeDasharray={C} strokeDashoffset={C * (1 - frac)} transform="rotate(-90 160 160)"
            style={{ transition: step === 0 ? "none" : "stroke-dashoffset .3s linear" }}
          />
          {pts.map(([x, y], i) => {
            const active = i === step;
            const done = handoff || i < step;
            return (
              <g key={i}>
                {active && <circle cx={x} cy={y} r="13" fill="none" stroke={BLUE} strokeOpacity=".4" strokeWidth="2" />}
                <circle
                  cx={x} cy={y} r="7"
                  fill={active || handoff ? BLUE : done ? "#fff" : "#000"}
                  stroke={active || handoff ? BLUE : done ? "#fff" : "rgba(255,255,255,.3)"}
                  strokeWidth="2"
                />
              </g>
            );
          })}
          {handoff ? (
            <text x="160" y="166" textAnchor="middle" fill={BLUE_LT} fontSize="15" className="pl-mono">self-invoke</text>
          ) : (
            <>
              <text x="160" y="140" textAnchor="middle" fill="rgba(255,255,255,.4)" fontSize="12" className="pl-mono">tick</text>
              <text x="160" y="184" textAnchor="middle" fill="#fff" fontSize="48" fontWeight="600" className="pl-mono">{tick}</text>
              <text x="160" y="206" textAnchor="middle" fill="rgba(255,255,255,.4)" fontSize="12" className="pl-mono">of {LIMIT}</text>
            </>
          )}
        </svg>

        <ol className="space-y-1">
          {TICK_STEPS.map(([title, desc], i) => {
            const active = i === step;
            return (
              <li
                key={title}
                className={"border-l-2 py-2.5 pl-5 transition-colors duration-300 " + (active ? "border-[#0066ff]" : "border-white/10")}
              >
                <div className={"font-medium transition-colors duration-300 " + (active ? "text-white" : "text-white/40")}>{title}</div>
                <div className={"mt-0.5 text-sm transition-colors duration-300 " + (active ? "text-white/60" : "text-white/25")}>{desc}</div>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="mt-12 rounded-2xl border border-white/10 p-6">
        <div className="pl-mono mb-3 flex justify-between text-xs">
          <span className="text-white/60">tick budget for this run</span>
          <span className={handoff ? "text-[#4d94ff]" : "text-white/40"}>
            {handoff ? "cycleTickLimit reached: fresh run starts" : `${tick} of ${LIMIT} ticks used`}
          </span>
        </div>
        <div className="flex h-3 gap-1.5" aria-hidden>
          {Array.from({ length: LIMIT }, (_, i) => (
            <div
              key={i}
              className="flex-1 rounded-[2px] transition-colors duration-200"
              style={{ background: handoff || i < tick - 1 ? "rgba(255,255,255,.75)" : i === tick - 1 ? BLUE : "rgba(255,255,255,.12)" }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}