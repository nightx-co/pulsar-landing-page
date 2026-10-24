"use client";

import { useState } from "react";
import Btn from "./ui/Btn";
import RunTimeline from "./RunTimeline";
import { INSTALL, LINKS } from "@/app/constants/pulsarData";

function CopyCmd() {
    const [ok, setOk] = useState(false);

    const handleCopy = () => {
        navigator.clipboard?.writeText(INSTALL);
        setOk(true);
        setTimeout(() => setOk(false), 1400);
    };

    return (
        <button
            onClick={handleCopy}
            className="pl-mono flex items-center gap-3 rounded-full border border-white/20 px-5 py-3 text-sm text-white/80 hover:border-white/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4d94ff]"
            aria-label={`Copy ${INSTALL}`}
        >
            <span className="text-[#4d94ff]">$</span>
            {INSTALL}
            <span className="text-xs text-white/40">
                {ok ? "copied" : "copy"}
            </span>
        </button>
    );
}

export default function Hero() {
    return (
        <section id="top" className="relative overflow-hidden">
            <div
                className="pointer-events-none absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full bg-[#A8A7A7]/15 blur-[120px]"
                aria-hidden
            />
            <div className="relative mx-auto max-w-6xl px-5 pb-24 pt-20 md:pt-32">
                {/* <h1 className="max-w-5xl text-6xl font-semibold leading-[0.98] tracking-tight md:text-[8.5rem]">
                    Queues don&apos;t run themselves.
                </h1> */}

                <h1 className="max-w-5xl text-6xl font-semibold leading-[0.98] tracking-tight md:text-[8.0rem]">
                    Multi-Runtime Pooler Engine For PGMQ
                </h1>
                <p className="mt-8 max-w-2xl text-xl leading-relaxed text-white/60">
                    Pulsar is the execution engine for PGMQ. It decides when to wake, how much to pull, who does the work and how to keep going, on serverless functions, edge isolates or your own servers.
                </p>
                <div className="mt-10 flex flex-wrap items-center gap-3">
                    <Btn href={LINKS.quickstart} solid>
                        Run your first queue
                    </Btn>
                    <CopyCmd />
                </div>
                <div className="mt-20">
                    <RunTimeline />
                </div>
                <p className="mt-10 max-w-xl text-white/60">
                    Every bar is a tick. When the tick budget or the host&apos;s clock runs out, Pulsar stops cleanly and hands off to a fresh run, so a serverless time limit never drops a job.
                </p>
            </div>
        </section>
    );
}