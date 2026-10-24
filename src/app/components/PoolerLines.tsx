"use client";

import { useEffect, useState } from "react";
import { BLUE, reduced } from "@/app/constants/pulsarData";

const N = 48;
const IDP_PAT = Array.from({ length: N }, (_, i) => i % 6 === 0);
const EDP_PAT = Array.from({ length: N }, (_, i) => (i >= 9 && i <= 15) || (i >= 33 && i <= 36));

function PoolerRow({ pat, label, note, head }: { pat: boolean[]; label: string; note: string; head: number }) {
    return (
        <div>
            <div className="pl-mono mb-2 flex flex-col gap-1 text-xs sm:flex-row sm:items-center sm:justify-between">
                <span className="font-medium text-white">{label}</span>
                <span className="text-white/40">{note}</span>
            </div>
            <div className="flex h-8 items-end gap-[1px] sm:h-10 sm:gap-[2px]" aria-hidden>
                {pat.map((on, i) => (
                    <div
                        key={i}
                        className="flex-1 rounded-[1px] transition-colors"
                        style={{
                            height: on ? "100%" : "8%",
                            background: on ? (i <= head ? BLUE : "rgba(255,255,255,.2)") : "rgba(255,255,255,.1)"
                        }}
                    />
                ))}
            </div>
        </div>
    )
}

export default function PoolerLines() {
    const [head, setHead] = useState(0);

    useEffect(() => {
        if (reduced()) { setHead(N); return; }
        const t = setInterval(() => setHead((h) => (h + 1) % (N + 6)), 170);
        return () => clearInterval(t);
    }, []);

    return (
        <div className="space-y-6 rounded-xl border border-white/10 p-4 sm:space-y-7 sm:rounded-2xl sm:p-6">
            <PoolerRow head={head} pat={IDP_PAT} label="interval-driven" note="wakes every interval, work or not" />
            <PoolerRow head={head} pat={EDP_PAT} label="event-driven" note="silent until a job is inserted" />
        </div>
    )
}