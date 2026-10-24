"use client";

/**
 * Pulsar landing page (v2). Single file, Next.js App Router + Tailwind CSS.
 * Save as app/page.tsx or import <PulsarLanding />. No other dependencies.
 * Palette: pure black, white at different opacities, one amber "signal" colour.
 * Search for "EDIT:" for placeholders.
 */

import { useEffect, useState } from "react";

const LINKS = {
  docs: "/docs", // EDIT:
  quickstart: "/docs/getting-started/quickstart", // EDIT:
  github: "https://github.com/", // EDIT: repo
};
const INSTALL = "npm install @pulsar/core";
const AMBER = "#0066ff";

/* --------------------------------- data --------------------------------- */

const ENGINE_KNOBS: [string, string, string][] = [
  ["runtime", "required", "V8_ISOLATE, SERVERLESS_VM or PERSISTENT. Sets how the engine schedules and stays alive."],
  ["storage", "AUTO", "Unified storage: Redis when a cache driver is supplied, Postgres unlogged tables when it isn't."],
  ["selfURL", "none", "Where the engine reaches itself. Needed on serverless and isolates, not on persistent."],
  ["selfInvocationMethod", "auto_using_pgnet", "Or manual, where your handler fires the next cycle fire-and-forget."],
  ["selfInvocationIntervalSec", "1", "Seconds between self-invocations. Minimum 1. Lower is faster and costs more invocations."],
  ["healthCheckIntervalSec", "15", "How often the engine inspects its own health and runtime state."],
  ["tickConcurrency", "sequential", "Tick queues one by one, or all at once with parallel."],
  ["maxGlobalConcurrency", "none", "Hard ceiling on workers across every queue. Demand above it is scaled down proportionally."],
  ["cycleTickLimit", "Infinity", "Total ticks across all queues in one run, then the engine restarts itself."],
];

const QUEUE_KNOBS: [string, string, string][] = [
  ["queue", "required", "The PGMQ queue name."],
  ["pooler", "interval-driven-pooler", "Or event-driven-pooler to wake on inserts and idle at zero cost."],
  ["profile", "STANDARD", "Polling cadence: a preset or your own activePollMs / backoffPollMs / maxTimerMs / idlePollMs."],
  ["concurrency", "per queue", "Max parallel workers for this queue. The global cap can scale it down."],
  ["n", "per queue", "Jobs each worker claims per tick. Requested jobs = concurrency × n."],
  ["maxJobsPerTick", "per queue", "Backpressure ceiling. If concurrency × n exceeds it, the batch is throttled."],
  ["cycleTickLimit", "10", "Tick budget for this queue per run. Recommended max 20 on serverless."],
  ["sleep", "seconds", "PGMQ visibility timeout. Keep it above your slowest handler."],
  ["consumer", "required", "An HTTP webhook or an in-process callback."],
];

const RUNTIMES = [
  ["V8_ISOLATE", "Cloudflare Workers, Supabase Edge Functions, Deno Deploy", "Monitors the isolate's remaining life and schedules ticks before the provider ends it.", "selfURL required", "cycleTickLimit 10"],
  ["SERVERLESS_VM", "AWS Lambda, GCP Cloud Run, Docker FaaS", "No continuous memory tracking. Handles spin-up and teardown between invocations.", "selfURL required", "cycleTickLimit 10"],
  ["PERSISTENT", "EC2, VPS, Kubernetes pods, Node.js and Deno daemons", "Native background loops and in-memory state. Never restarts itself.", "no selfURL", "cycleTickLimit 100 to 200"],
];

const PROFILES = [
  ["REALTIME", "Lowest latency. Highest database load."],
  ["STANDARD", "The default balance of speed and cost."],
  ["BALANCED", "Steady background work."],
  ["RELAXED", "Fewer queries, slower pickup."],
  ["ULTRA_EFFICIENT", "Longest gaps. For low-priority batches."],
];

const CODE = `import { Pulsar, PulsarRuntime, PulsarUnifiedStorage, createQueue } from "@pulsar/core"; // EDIT: confirm createQueue path
import { RedisDriver } from "@pulsar/redis";
import { PostgresDriver } from "@pulsar/postgres";

const storage = new PulsarUnifiedStorage({
  cache: new RedisDriver({ protocol: "http", keyPrefix: "pulsar", url, token }), // optional
  db: new PostgresDriver({ connectionString, unloggedTableSchema: "pulsar_engine" }),
  strategy: "AUTO",
});

export const Scrape = createQueue({
  queue: "scrape",
  type: "STANDARD",
  pooler: "event-driven-pooler",
  profile: "REALTIME",
  concurrency: 10,
  n: 10,
  maxJobsPerTick: 1000,
  cycleTickLimit: 10,
  sleep: 30,
  consumer: { type: "http", url: "https://api.example.com/scrape", timeoutMs: 5000 },
});

const engine = new Pulsar({
  runtime: PulsarRuntime.SERVERLESS,
  storage,
  engine: {
    selfURL: "https://example.com/process-job",
    selfInvocationMethod: "auto_using_pgnet",
    tickConcurrency: "sequential",
    maxGlobalConcurrency: 100,
    cycleTickLimit: 10,
  },
  // EDIT: how queues are passed to the engine
});`;

/* ------------------------------- primitives ------------------------------- */

const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function Mark({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M1 12h6l2-9 4 18 3-9h7" stroke={AMBER} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Btn({ href, children, solid = false }: { href: string; children: React.ReactNode; solid?: boolean }) {
  return (
    <a
      href={href}
      className={
        "inline-flex items-center rounded-full px-6 py-3 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ffb224] " +
        (solid ? "bg-white text-black hover:bg-[#ffb224]" : "border border-white/20 text-white hover:border-white/60")
      }
    >
      {children}
    </a>
  );
}

function Section({ id, name, children }: { id: string; name: string; children: React.ReactNode }) {
  return (
    <section id={id} className="border-t border-white/10 py-24">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 md:grid-cols-[160px_1fr]">
        <div className="pl-mono text-sm text-white/40 md:sticky md:top-24 md:self-start">
          <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-[#ffb224]" />
          {name}
        </div>
        <div>{children}</div>
      </div>
    </section>
  );
}

const H2 = ({ children }: { children: React.ReactNode }) => (
  <h2 className="max-w-3xl text-4xl font-semibold leading-[1.08] tracking-tight text-white md:text-5xl">{children}</h2>
);
const P = ({ children }: { children: React.ReactNode }) => (
  <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/60">{children}</p>
);

function Code({ code, title }: { code: string; title: string }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-black">
      <div className="pl-mono border-b border-white/10 px-5 py-3 text-xs text-white/40">{title}</div>
      <pre className="pl-mono overflow-x-auto p-5 text-[13px] leading-6 text-white/80"><code>{code}</code></pre>
    </div>
  );
}

function Table({ head, rows }: { head: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-white/10">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-white/10 text-white/40">
            {head.map((h) => <th key={h} className="px-5 py-3 font-normal">{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r[0]} className="border-b border-white/5 last:border-0 align-top">
              {r.map((c, i) => (
                <td key={i} className={"px-5 py-3.5 " + (i === 0 ? "pl-mono text-white" : i === 1 ? "pl-mono text-[#ffb224]" : "text-white/60")}>{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ------------------------- signature: the run timeline ------------------------- */

const HEIGHTS = [34, 58, 44, 72, 50, 84, 62, 40, 92, 54];
type Slot = { kind: "tick"; h: number; faded?: boolean } | { kind: "gap" };
const SLOTS: Slot[] = [
  ...HEIGHTS.map((h) => ({ kind: "tick", h }) as Slot),
  { kind: "gap" },
  ...HEIGHTS.map((h, i) => ({ kind: "tick", h: HEIGHTS[(i + 4) % 10] }) as Slot),
  { kind: "gap" },
  ...[46, 70, 38, 60].map((h) => ({ kind: "tick", h, faded: true }) as Slot),
];

function RunTimeline() {
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
              <div className={"h-full w-px border-l border-dashed " + (i < head ? "border-[#ffb224]" : "border-white/20")} />
            </div>
          ) : (
            <div
              key={i}
              className="flex-1 rounded-[2px] transition-colors duration-200"
              style={{
                height: `${s.h}%`,
                background: i === head ? AMBER : i < head ? "rgba(255,255,255,.75)" : "rgba(255,255,255,.12)",
                opacity: s.faded ? 0.5 : 1,
              }}
            />
          )
        )}
      </div>
      <div className="pl-mono mt-4 flex justify-between text-xs text-white/40">
        <span>run 1 · 10 ticks · cycleTickLimit</span>
        <span className="text-[#ffb224]">self-invoke</span>
        <span className="hidden sm:inline">run 2 · fresh isolate</span>
      </div>
    </div>
  );
}

/* ---------------- pooler comparison: IDP always beats, EDP only on work ---------------- */

const N = 48;
const IDP_PAT = Array.from({ length: N }, (_, i) => i % 6 === 0);
const EDP_PAT = Array.from({ length: N }, (_, i) => (i >= 9 && i <= 15) || (i >= 33 && i <= 36));

function PoolerLines() {
  const [head, setHead] = useState(0);
  useEffect(() => {
    if (reduced()) { setHead(N); return; }
    const t = setInterval(() => setHead((h) => (h + 1) % (N + 6)), 170);
    return () => clearInterval(t);
  }, []);
  const Row = ({ pat, label, note }: { pat: boolean[]; label: string; note: string }) => (
    <div>
      <div className="pl-mono mb-2 flex justify-between text-xs">
        <span className="text-white">{label}</span>
        <span className="text-white/40">{note}</span>
      </div>
      <div className="flex h-10 items-end gap-[2px]" aria-hidden>
        {pat.map((on, i) => (
          <div
            key={i}
            className="flex-1 rounded-[1px] transition-colors"
            style={{
              height: on ? "100%" : "8%",
              background: on ? (i <= head ? AMBER : "rgba(255,255,255,.2)") : "rgba(255,255,255,.1)",
            }}
          />
        ))}
      </div>
    </div>
  );
  return (
    <div className="space-y-7 rounded-2xl border border-white/10 p-6">
      <Row pat={IDP_PAT} label="interval-driven" note="wakes every interval, work or not" />
      <Row pat={EDP_PAT} label="event-driven" note="silent until a job is inserted" />
    </div>
  );
}

/* ------------------------------ tuning calculator ------------------------------ */

function Slider({ label, value, set, min, max }: { label: string; value: number; set: (n: number) => void; min: number; max: number }) {
  return (
    <label className="block">
      <div className="pl-mono mb-2 flex justify-between text-xs text-white/60"><span>{label}</span><span className="text-white">{value}</span></div>
      <input type="range" min={min} max={max} value={value} onChange={(e) => set(+e.target.value)} className="w-full accent-[#ffb224]" />
    </label>
  );
}

function Calculator() {
  const [c, setC] = useState(50);
  const [n, setN] = useState(10);
  const [cap, setCap] = useState(200);
  const [sec, setSec] = useState(1);
  const req = c * n;
  const got = Math.min(req, cap);
  const monthly = Math.round((86400 * 30) / sec);
  return (
    <div className="grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 md:grid-cols-2">
      <div className="space-y-6 bg-black p-6">
        <div className="text-white">Per-tick batch</div>
        <Slider label="concurrency" value={c} set={setC} min={1} max={100} />
        <Slider label="n (jobs per worker)" value={n} set={setN} min={1} max={50} />
        <Slider label="maxJobsPerTick" value={cap} set={setCap} min={10} max={2000} />
        <div className="pl-mono text-sm text-white/60">
          {c} × {n} = {req} requested →{" "}
          <span className="text-[#ffb224]">{got} fetched</span>
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

/* ---------------------------------- page ---------------------------------- */

function CopyCmd() {
  const [ok, setOk] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard?.writeText(INSTALL); setOk(true); setTimeout(() => setOk(false), 1400); }}
      className="pl-mono flex items-center gap-3 rounded-full border border-white/20 px-5 py-3 text-sm text-white/80 hover:border-white/60"
      aria-label={`Copy ${INSTALL}`}
    >
      <span className="text-[#ffb224]">$</span>{INSTALL}<span className="text-xs text-white/40">{ok ? "copied" : "copy"}</span>
    </button>
  );
}

export default function PulsarLanding() {
  const [mode, setMode] = useState<"engine" | "queue">("engine");
  return (
    <main className="min-h-screen bg-black text-white antialiased" style={{ fontFamily: "'Bricolage Grotesque', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,600;12..96,700&family=JetBrains+Mono:wght@400;500&display=swap');
        html { scroll-behavior: smooth; }
        .pl-mono { font-family: 'JetBrains Mono', ui-monospace, monospace; }
        @keyframes pl-beat { 0%,100% { opacity: 1; } 50% { opacity: .25; } }
        .pl-beat { animation: pl-beat 1.2s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) { .pl-beat { animation: none; } html { scroll-behavior: auto; } }
      `}</style>

      {/* nav */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-black/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-8 px-5">
          <a href="#top" className="flex items-center gap-2 text-lg font-semibold"><Mark />Pulsar</a>
          <nav className="hidden gap-6 text-sm text-white/50 md:flex">
            {[["Poolers", "#poolers"], ["Configuration", "#config"], ["Tuning", "#tuning"], ["Runtimes", "#runtimes"], ["Storage", "#storage"], ["Consumers", "#consumers"]].map(([t, h]) => (
              <a key={h} href={h} className="hover:text-white">{t}</a>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-4 text-sm">
            <a href={LINKS.github} className="hidden text-white/60 hover:text-white sm:block">GitHub</a>
            <a href={LINKS.docs} className="hidden text-white/60 hover:text-white sm:block">Docs</a>
            <Btn href={LINKS.quickstart} solid>Get started</Btn>
          </div>
        </div>
      </header>

      {/* hero */}
      <section id="top" className="mx-auto max-w-6xl px-5 pb-24 pt-20 md:pt-32">
        <h1 className="max-w-5xl text-6xl font-semibold leading-[0.98] tracking-tight md:text-[8.5rem]">
          Queues don't run themselves.
        </h1>
        <p className="mt-8 max-w-2xl text-xl leading-relaxed text-white/60">
          Pulsar is the execution engine for PGMQ. It decides when to wake, how much to pull, who does the work and how to keep going, on serverless functions, edge isolates or your own servers.
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-3">
          <Btn href={LINKS.quickstart} solid>Run your first queue</Btn>
          <CopyCmd />
        </div>
        <div className="mt-20"><RunTimeline /></div>
        <p className="mt-10 max-w-xl text-white/60">
          Every bar is a tick. When the tick budget or the host's clock runs out, Pulsar stops cleanly and hands off to a fresh run, so a serverless time limit never drops a job.
        </p>
      </section>

      {/* positioning */}
      <Section id="what" name="what it is">
        <H2>PGMQ stores the messages. Pulsar operates them.</H2>
        <P>You keep your Postgres and your business logic. Pulsar is everything between: polling, event activation, concurrency, dispatch, distributed locks and platform adaptation. It does not replace PGMQ or add a broker.</P>
        <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
          {[["Your code", "Consumers and handlers"], ["Pulsar", "Ticks, locks, dispatch"], ["PGMQ", "Message storage"], ["PostgreSQL", "Durable foundation"]].map(([t, d], i) => (
            <div key={t} className="bg-black p-6">
              <div className={"text-xl font-medium " + (i === 1 ? "text-[#ffb224]" : "text-white")}>{t}</div>
              <div className="mt-1 text-sm text-white/50">{d}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* poolers */}
      <Section id="poolers" name="poolers">
        <H2>Choose what wakes the engine, per queue</H2>
        <P>An interval-driven queue is polled on a schedule under one shared lock. An event-driven queue sleeps until a database trigger fires, then drains itself and goes quiet. One insert burst does not mean one invocation per job.</P>
        <div className="mt-10"><PoolerLines /></div>
        <div className="mt-6">
          <Table
            head={["Pooler", "Trigger", "Idle cost", "Pickup latency", "Best for"]}
            rows={[
              ["interval-driven-pooler", "Timed polling", "Low, regular polls", "Bound by the interval", "Continuous, batch and delayed work"],
              ["event-driven-pooler", "Storage event", "Zero idle polls", "Under 10ms", "Bursty, sporadic, interactive tasks"],
            ]}
          />
        </div>
        <p className="mt-4 text-sm text-white/40">Interval-driven is the default. Polling cadence comes from the queue's profile.</p>
        <div className="mt-8 grid gap-3 sm:grid-cols-5">
          {PROFILES.map(([p, d]) => (
            <div key={p} className="rounded-xl border border-white/10 p-4">
              <div className="pl-mono text-xs text-white">{p}</div>
              <div className="mt-2 text-sm text-white/50">{d}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* config */}
      <Section id="config" name="configuration">
        <H2>Two levels of control: the engine and each queue</H2>
        <P>The engine sets how Pulsar lives and what it may spend. Every queue then sets its own pace inside those limits.</P>
        <div className="mt-8 inline-flex rounded-full border border-white/15 p-1" role="tablist">
          {(["engine", "queue"] as const).map((m) => (
            <button key={m} role="tab" aria-selected={mode === m} onClick={() => setMode(m)}
              className={"rounded-full px-5 py-2 text-sm transition " + (mode === m ? "bg-white text-black" : "text-white/60 hover:text-white")}>
              {m === "engine" ? "Engine" : "Queue"}
            </button>
          ))}
        </div>
        <div className="mt-6">
          <Table head={["Property", "Default", "What it does"]} rows={(mode === "engine" ? ENGINE_KNOBS : QUEUE_KNOBS).map((r) => [...r])} />
        </div>
        <div className="mt-10"><Code title="pulsar.ts" code={CODE} /></div>
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
        <P>Set the runtime and Pulsar adapts its scheduling and lifecycle. Serverless and isolate runtimes re-invoke themselves; persistent ones simply keep ticking.</P>
        <div className="mt-10 grid gap-3 md:grid-cols-3">
          {RUNTIMES.map(([name, hosts, text, a, b]) => (
            <div key={name} className="flex flex-col rounded-2xl border border-white/10 p-6">
              <div className="pl-mono text-white">{name}</div>
              <div className="mt-1 text-sm text-[#ffb224]">{hosts}</div>
              <p className="mt-4 flex-1 text-sm leading-relaxed text-white/60">{text}</p>
              <div className="pl-mono mt-5 space-y-1 text-xs text-white/40"><div>{a}</div><div>{b}</div></div>
            </div>
          ))}
        </div>
        <p className="mt-6 max-w-2xl text-sm leading-relaxed text-white/50">
          Re-invocation uses pg_net by default. Choose manual to trigger the next cycle yourself through something fire-and-forget like QStash or SNS. Never await a request to selfURL, it holds the current instance open.
        </p>
      </Section>

      {/* storage */}
      <Section id="storage" name="storage">
        <H2>Postgres is enough. Redis makes it faster.</H2>
        <P>Unified Storage puts Redis and PostgreSQL behind one interface. In AUTO mode, hot operations such as worker registration, locks and job calculation go to Redis when you supply a cache driver, and to unlogged Postgres tables when you don't.</P>
        <div className="mt-10 grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 p-6">
            <div className="text-white">Postgres only</div>
            <p className="mt-2 text-sm leading-relaxed text-white/60">Durable storage plus operational state in an unlogged table under the schema you choose. One dependency, nothing breaks.</p>
          </div>
          <div className="rounded-2xl border border-[#ffb224]/60 p-6">
            <div className="text-[#ffb224]">Postgres + Redis</div>
            <p className="mt-2 text-sm leading-relaxed text-white/60">A TCP driver for persistent servers or an HTTP driver like Upstash for serverless and edge. Less high-frequency load on your database.</p>
          </div>
        </div>
      </Section>

      {/* consumers */}
      <Section id="consumers" name="consumers">
        <H2>Hand jobs to your code your way</H2>
        <P>An HTTP consumer POSTs claimed jobs to any endpoint, in any language. A callback consumer runs an async function in the same process.</P>
        <div className="mt-10 grid gap-3 lg:grid-cols-2">
          <Code title="http consumer" code={`consumer: {\n  type: "http",\n  url: "https://api.example.com/jobs",\n  headers: { Authorization: \`Bearer \${key}\` },\n  timeoutMs: 5000,\n}`} />
          <Code title="callback consumer" code={`consumer: {\n  type: "callback",\n  handler: async (job) => {\n    // job.workerId, job.queue, job.payload,\n    // job.attempts, job.timestamp\n    await run(job.payload);\n    // deregister job.workerId yourself\n  },\n}`} />
        </div>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/50">
          In callback mode your code is responsible for deregistering the worker when the job finishes. Set sleep above your slowest handler so a job is never picked up twice.
        </p>
      </Section>

      {/* cta */}
      <section className="border-t border-white/10 py-32">
        <div className="mx-auto max-w-6xl px-5">
          <h2 className="max-w-4xl text-5xl font-semibold leading-[1.02] tracking-tight md:text-8xl">Give your queues an engine.</h2>
          <div className="mt-10 flex flex-wrap gap-3">
            <Btn href={LINKS.quickstart} solid>Get started</Btn>
            <Btn href={LINKS.github}>Star on GitHub</Btn>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 py-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 text-sm text-white/40">
          <span className="flex items-center gap-2 text-white"><Mark size={16} /><span className="pl-beat">Pulsar</span></span>
          <div className="flex gap-6">
            <a className="hover:text-white" href={LINKS.docs}>Docs</a>
            <a className="hover:text-white" href={LINKS.github}>GitHub</a>
          </div>
          <span>© {new Date().getFullYear()} Pulsar. Open source.</span>
        </div>
      </footer>
    </main>
  );
}