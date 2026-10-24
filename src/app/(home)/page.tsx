"use client";

import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Section from "../components/ui/Section";
import { H2, P } from "../components/ui/Typography";
import LayerStack from "../components/LayerStack";
import PoolerLines from "../components/PoolerLines";
import Table from "../components/ui/Table";
import Features from "../components/Features";
import TickLoop from "../components/TickLoop";
import Calculator from "../components/Calculator";
import Runtimes from "../components/Runtimes";
import Storage from "../components/Storage";
import IntegrationMap from "../components/IntegrationMap";
import Code from "../components/ui/Code";
import Footer from "../components/Footer";
import { CALLBACK_CODE, HANDLES, HTTP_CODE, NOT, PROFILES } from "../constants/pulsarData";

export default function PulsarLanding() {
    return (
        <main className="min-h-screen bg-[#050505] text-white antialiased" style={{ fontFamily: "'Bricolage Grotesque', system-ui, sans-serif" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,600;12..96,700&family=JetBrains+Mono:wght@400;500&display=swap');
                html { scroll-behavior: smooth; }
                .pl-mono { font-family: 'JetBrains Mono', ui-monospace, monospace; }
                @keyframes pl-beat { 0%,100% { opacity: 1; } 50% { opacity: .25; } }
                .pl-beat { animation: pl-beat 1.2s ease-in-out infinite; }
                @keyframes pl-flow { to { stroke-dashoffset: -32; } }
                .pl-flow { animation: pl-flow 1.2s linear infinite; }
                @media (prefers-reduced-motion: reduce) { .pl-beat, .pl-flow { animation: none; } html { scroll-behavior: auto; } }
            `}</style>

            <Navbar />
            <Hero />

            {/* positioning */}
            <Section id="what" name="what it is">
                <H2>PGMQ stores the messages. Pulsar operates them.</H2>
                <P>Pulsar is an orchestration engine, not a queue. You keep your Postgres and your business logic. Pulsar runs everything in between.</P>
                <div className="mt-10 grid items-start gap-10 lg:grid-cols-2">
                <LayerStack />
                <div className="space-y-8">
                    <div>
                    <div className="mb-4 text-white">Pulsar handles</div>
                    <ul className="space-y-3">
                        {HANDLES.map((h) => (
                        <li key={h} className="flex items-start gap-3 text-white/70">
                            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#0066ff]" />{h}
                        </li>
                        ))}
                    </ul>
                    </div>
                    <div className="border-t border-white/10 pt-8">
                    <div className="mb-4 text-white">Pulsar is not</div>
                    <ul className="space-y-3">
                        {NOT.map((h) => (
                        <li key={h} className="flex items-start gap-3 text-white/40">
                            <span className="mt-[11px] h-px w-3 shrink-0 bg-white/40" />{h}
                        </li>
                        ))}
                    </ul>
                    </div>
                </div>
                </div>
            </Section>

            {/* poolers */}
            <Section id="poolers" name="poolers">
                <H2>Choose what wakes the engine, per queue</H2>
                <P>An interval-driven queue is polled on a schedule under one shared lock. An event-driven queue sleeps until a database trigger fires, then drains itself and goes quiet. One insert burst does not mean one invocation per job.</P>
                
                <div className="mt-10">
                    <PoolerLines />
                </div>

                {/* Added overflow container so table swipes on mobile instead of breaking layout */}
                <div className="mt-6 w-full overflow-x-auto">
                    <Table
                        head={["Pooler", "Trigger", "Idle cost", "Pickup latency", "Best for"]}
                        rows={[
                            ["interval-driven-pooler", "Timed polling", "Low, regular polls", "Bound by the interval", "Continuous, batch and delayed work"],
                            ["event-driven-pooler", "Storage event", "Zero idle polls", "Under 10ms", "Bursty, sporadic, interactive tasks"]
                        ]}
                    />
                </div>

                <p className="mt-4 text-sm text-white/40">
                    Interval-driven is the default. Polling cadence comes from the queue&apos;s profile.
                </p>

                {/* Made grid fluid: 1 col (mobile) -> 2 cols (sm) -> 3 cols (md) -> 5 cols (lg) */}
                <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                    {PROFILES.map(([p, d]) => (
                        <div key={p} className="rounded-xl border border-white/10 p-4">
                            <div className="pl-mono text-xs text-white">{p}</div>
                            <div className="mt-2 text-sm text-white/50">{d}</div>
                        </div>
                    ))}
                </div>
            </Section>

            {/* features */}
            <Section id="features" name="features">
                <H2>Everything between the queues and your code</H2>
                <P>The moving parts of a production queue, already built and configured per queue.</P>
                <Features />
            </Section>

            {/* tick */}
            <Section id="tick" name="the tick">
                <H2>One loop runs everything: the tick</H2>
                <P>A tick is one complete execution cycle. Ticks repeat until a queue or engine cycleTickLimit is spent, or the host&apos;s clock runs low. Then the run ends and a fresh one begins.</P>
                <div className="mt-12"><TickLoop /></div>
            </Section>

            {/* tuning */}
            <Section id="tuning" name="tuning">
                <H2>Do the math before production does</H2>
                <P>Requested jobs are concurrency × n. If that exceeds maxJobsPerTick, Pulsar scales workers down for the tick instead of overloading your database. Self-invocation cost is just arithmetic.</P>
                <div className="mt-10"><Calculator /></div>
                <div className="mt-6 grid gap-6 md:grid-cols-2">
                <div className="rounded-2xl border border-white/10 p-6">
                    <div className="font-medium text-white">Global concurrency</div>
                    <p className="mt-2 text-sm leading-relaxed text-white/60">With maxGlobalConcurrency at 100 and ten queues each asking for 100 workers, every queue is held to about 10. Slots are first come, first served when demand is lower.</p>
                </div>
                <div className="rounded-2xl border border-white/10 p-6">
                    <div className="font-medium text-white">Tick concurrency</div>
                    <p className="mt-2 text-sm leading-relaxed text-white/60">Sequential is safe on CPU, memory and connections. Parallel ticks every queue at once for lower latency, at the price of spikes. With a cycleTickLimit of 10 across 10 queues, sequential gives each queue one tick.</p>
                </div>
                </div>
            </Section>

            {/* runtimes */}
            <Section id="runtimes" name="runtimes">
                <H2>One engine, three ways to live</H2>
                <P>Set the runtime and Pulsar adapts its scheduling and lifecycle. Pick one to watch how a run ends.</P>
                <Runtimes />
            </Section>

            {/* storage */}
            <Section id="storage" name="storage">
                <H2>Postgres is enough. Redis makes it faster.</H2>
                <P>Unified Storage puts Redis and PostgreSQL behind one interface. Supply a cache driver and hot operations move to Redis. Leave it out and they run through an unlogged Postgres table.</P>
                <Storage />
            </Section>

            {/* integrations */}
            <Section id="integrations" name="integrations">
                <H2>Plug jobs into anything</H2>
                <P>Pulsar claims the jobs, then dispatches them to your own endpoint, your own function, or the streaming tools you already run.</P>
                <IntegrationMap />
                <div className="mt-10 grid gap-3 lg:grid-cols-2">
                <Code title="http consumer" code={HTTP_CODE} />
                <Code title="callback consumer" code={CALLBACK_CODE} />
                </div>
                <div className="mt-6 max-w-2xl border-l-2 border-[#0066ff] pl-4 text-sm leading-relaxed text-white/60">
                In callback mode your code must deregister the worker when the job finishes, or its slot stays occupied and the queue stalls. Set sleep above your slowest handler so a job is never picked up twice.
                </div>
            </Section>

            <Footer />
        </main>
    )
}