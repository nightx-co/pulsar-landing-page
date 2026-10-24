"use client";

/**
 * Pulsar landing page (v3). Single file, Next.js App Router + Tailwind CSS.
 * Save as app/page.tsx or import <PulsarLanding />. No other dependencies.
 * Palette: pure black, white at different opacities, one brand blue (#0066ff).
 * Search for "EDIT:" for placeholders.
 */

import { useEffect, useState } from "react";

const LINKS = {
  docs: "/docs", // EDIT:
  quickstart: "/docs/getting-started/quickstart", // EDIT:
  config: "/docs/configuration", // EDIT: full configuration reference
  github: "https://github.com/", // EDIT: repo
};
const INSTALL = "npm install @pulsar/core";
const BLUE = "#0066ff"; // brand
const BLUE_LT = "#4d94ff"; // brand, lightened so small text stays readable on black

/* --------------------------------- data --------------------------------- */

const PROFILES = [
  ["REALTIME", "Lowest latency. Highest database load."],
  ["STANDARD", "The default balance of speed and cost."],
  ["BALANCED", "Steady background work."],
  ["RELAXED", "Fewer queries, slower pickup."],
  ["ULTRA_EFFICIENT", "Longest gaps. For low-priority batches."],
];

const HANDLES = [
  "Polling and event activation",
  "Concurrency and batch sizing",
  "HTTP and callback dispatch",
  "Distributed locks and retries",
  "Adapting to serverless, edge and persistent hosts",
];
const NOT = ["A message broker", "A replacement for PGMQ", "Another place your jobs are stored"];

const TICK_STEPS: [string, string][] = [
  ["Evaluate queues", "Read every configured queue and its limits."],
  ["Size the work", "Work out what each queue can take within concurrency and maxJobsPerTick."],
  ["Pull jobs", "Claim a batch from PGMQ."],
  ["Dispatch", "Hand the jobs to each queue's consumer."],
  ["Update state", "Record what ran."],
  ["Schedule next tick", "The timing profile and runtime decide when."],
];

type RT = {
  id: string;
  label: string;
  kind: "isolate" | "vm" | "persistent";
  hosts: string[];
  blurb: string;
  rows: [string, string][];
};
const RUNTIMES: RT[] = [
  {
    id: "V8_ISOLATE",
    label: "V8 isolate",
    kind: "isolate",
    hosts: ["Cloudflare Workers", "Supabase Edge Functions", "Deno Deploy"],
    blurb: "Tracks the invocation window and the isolate's age. Pauses briefly before self-invoking so the platform can recycle the old isolate.",
    rows: [["selfURL", "Required"], ["cycleTickLimit", "10, max 20"], ["Restarts itself", "Yes, after a short pause"]],
  },
  {
    id: "SERVERLESS_VM",
    label: "Serverless VM",
    kind: "vm",
    hosts: ["AWS Lambda", "GCP Cloud Run", "Docker FaaS"],
    blurb: "Every run is a temporary worker. It stops at the host timeout or the tick limit, then self-invokes a fresh run.",
    rows: [["selfURL", "Required"], ["cycleTickLimit", "10, max 20"], ["Restarts itself", "Yes, every run"]],
  },
  {
    id: "PERSISTENT",
    label: "Persistent",
    kind: "persistent",
    hosts: ["EC2", "VPS", "Kubernetes pods", "Node.js and Deno daemons"],
    blurb: "No host timeout, so nothing to restart. The tick loop stays warm and keeps polling or reacting to events.",
    rows: [["selfURL", "Not needed"], ["cycleTickLimit", "100 to 200, or omit"], ["Restarts itself", "Never"]],
  },
];

const STORAGE_OPS = ["Worker registration and deregistration", "Spawning", "Job calculation", "Locks", "Execution coordination"];

// EDIT: confirm how Kafka / NATS / broker streaming is configured, then adjust the copy below.
const TARGETS: [string, string][] = [
  ["HTTP endpoint", "POST jobs to any URL, any language"],
  ["Async callback", "A function in your own process"],
  ["Apache Kafka", "Stream jobs into topics"],
  ["NATS", "Publish jobs to subjects"],
  ["External brokers", "Fan out to other systems"],
];

const ENGINE_CODE = `new Pulsar({
  runtime: PulsarRuntime.SERVERLESS,
  storage,
  engine: {
    selfURL: "https://example.com/process-job",
    tickConcurrency: "sequential",
    maxGlobalConcurrency: 100,
    cycleTickLimit: 10,
  },
});`;

const QUEUE_CODE = `createQueue({
  queue: "scrape",
  pooler: "event-driven-pooler",
  profile: "REALTIME",
  concurrency: 10,
  n: 10,
  maxJobsPerTick: 1000,
  consumer: { type: "http", url },
});`;

const HTTP_CODE = `consumer: {
  type: "http",
  url: "https://api.example.com/jobs",
  headers: { Authorization: "Bearer " + key },
  timeoutMs: 5000,
}`;

const CALLBACK_CODE = `consumer: {
  type: "callback",
  handler: async (job) => {
    // job.workerId, job.queue, job.payload,
    // job.attempts, job.timestamp
    await run(job.payload);
    // deregister job.workerId yourself
  },
}`;

/* ------------------------------- primitives ------------------------------- */

const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function Mark({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M1 12h6l2-9 4 18 3-9h7" stroke={BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Btn({ href, children, solid = false }: { href: string; children: React.ReactNode; solid?: boolean }) {
  return (
    <a
      href={href}
      className={
        "inline-flex items-center rounded-full px-6 py-3 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4d94ff] " +
        (solid ? "bg-[#0066ff] text-white hover:bg-[#1a75ff]" : "border border-white/20 text-white hover:border-white/60")
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
          <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-[#0066ff]" />
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
            <tr key={r[0]} className="border-b border-white/5 align-top last:border-0">
              {r.map((c, i) => (
                <td key={i} className={"px-5 py-3.5 " + (i === 0 ? "pl-mono text-white" : i === 1 ? "pl-mono text-[#4d94ff]" : "text-white/60")}>{c}</td>
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
  ...HEIGHTS.map((_, i) => ({ kind: "tick", h: HEIGHTS[(i + 4) % 10] }) as Slot),
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

/* --------------------- what it is: the layer diagram --------------------- */

function LayerStack() {
  const layers: [string, string, boolean][] = [
    ["Your code", "Consumers and handlers", false],
    ["Pulsar", "The orchestration layer: ticks, locks, dispatch", true],
    ["PGMQ", "Stores and manages the messages", false],
    ["PostgreSQL", "Durable foundation", false],
  ];
  return (
    <div className="flex flex-col items-stretch">
      {layers.map(([t, d, hot], i) => (
        <div key={t} className="flex flex-col items-center">
          <div
            className={
              "w-full rounded-2xl border p-6 " +
              (hot ? "border-[#0066ff] bg-[#0066ff]/10 shadow-[0_0_60px_-10px_rgba(0,102,255,.55)]" : "border-white/10")
            }
          >
            <div className={"text-xl font-medium " + (hot ? "text-white" : "text-white/90")}>{t}</div>
            <div className={"mt-1 text-sm " + (hot ? "text-[#4d94ff]" : "text-white/50")}>{d}</div>
          </div>
          {i < layers.length - 1 && <div className="h-5 w-px bg-white/20" />}
        </div>
      ))}
    </div>
  );
}

/* ---------------- pooler comparison: IDP always beats, EDP only on work ---------------- */

const N = 48;
const IDP_PAT = Array.from({ length: N }, (_, i) => i % 6 === 0);
const EDP_PAT = Array.from({ length: N }, (_, i) => (i >= 9 && i <= 15) || (i >= 33 && i <= 36));

function PoolerRow({ pat, label, note, head }: { pat: boolean[]; label: string; note: string; head: number }) {
  return (
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
              background: on ? (i <= head ? BLUE : "rgba(255,255,255,.2)") : "rgba(255,255,255,.1)",
            }}
          />
        ))}
      </div>
    </div>
  );
}

function PoolerLines() {
  const [head, setHead] = useState(0);
  useEffect(() => {
    if (reduced()) { setHead(N); return; }
    const t = setInterval(() => setHead((h) => (h + 1) % (N + 6)), 170);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="space-y-7 rounded-2xl border border-white/10 p-6">
      <PoolerRow head={head} pat={IDP_PAT} label="interval-driven" note="wakes every interval, work or not" />
      <PoolerRow head={head} pat={EDP_PAT} label="event-driven" note="silent until a job is inserted" />
    </div>
  );
}

/* ------------------------------ features bento ------------------------------ */

function Card({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={"flex flex-col rounded-2xl border border-white/10 p-6 " + className}>
      <div className="text-lg font-medium text-white">{title}</div>
      <p className="mt-2 text-sm leading-relaxed text-white/60">{children}</p>
    </div>
  );
}

function Features() {
  const rows = [
    ["scrape", "event-driven", "10", "10"],
    ["embed", "event-driven", "4", "20"],
    ["scan", "interval-driven", "2", "5"],
  ];
  return (
    <>
      <div className="mt-12 grid gap-3 md:grid-cols-12">
        <Card title="Per-queue configuration" className="md:col-span-6">
          Concurrency, batch size, tick limits, timing profile and consumer, tuned separately for every queue in the same engine.
          <span className="pl-mono mt-6 block rounded-xl border border-white/10 text-xs" aria-hidden>
            <span className="grid grid-cols-[1.1fr_1.4fr_.7fr_.7fr] border-b border-white/10 px-4 py-2 text-white/40">
              <span>queue</span><span>pooler</span><span>concurrency</span><span>n</span>
            </span>
            {rows.map((r) => (
              <span key={r[0]} className="grid grid-cols-[1.1fr_1.4fr_.7fr_.7fr] px-4 py-2 text-white/70 [&:not(:last-child)]:border-b [&:not(:last-child)]:border-white/5">
                <span className="text-white">{r[0]}</span><span>{r[1]}</span><span className="text-[#4d94ff]">{r[2]}</span><span className="text-[#4d94ff]">{r[3]}</span>
              </span>
            ))}
          </span>
        </Card>

        <Card title="Runtime-aware engine" className="md:col-span-6">
          An internal clock tracks the time your host has left and stops ticking before the platform ends the function, then hands off cleanly.
          <span className="mt-6 block" aria-hidden>
            <span className="flex h-10 items-stretch gap-[3px]">
              <span className="flex-[7] rounded-[2px] bg-white/70" />
              <span className="flex-[1.2] rounded-[2px] bg-[#0066ff]" />
              <span className="flex-[2] rounded-[2px] border border-dashed border-white/25" />
            </span>
            <span className="pl-mono mt-3 flex text-xs text-white/40">
              <span className="flex-[7]">ticking</span>
              <span className="flex-[1.2] text-[#4d94ff]">stop</span>
              <span className="flex-[2] text-right">host timeout</span>
            </span>
          </span>
        </Card>

        <Card title="Reliable by construction" className="md:col-span-3">
          Distributed locks, retries and failure recovery prevent races and duplicate processing.
        </Card>
        <Card title="Elastic scaling" className="md:col-span-3">
          Workers wake on a trigger or an interval, so nothing idles waiting for jobs.
        </Card>
        <Card title="Dispatch anywhere" className="md:col-span-3">
          HTTP endpoints, async handlers, or streams into Kafka, NATS and other brokers.
        </Card>
        <Card title="Deeply customizable" className="md:col-span-3">
          Hooks, payload transformations, queue routing and event triggers are yours to shape.
        </Card>
      </div>

      <h3 className="mt-20 max-w-2xl text-2xl font-semibold tracking-tight text-white md:text-3xl">Two levels of control</h3>
      <p className="mt-3 max-w-2xl text-white/60">The engine sets how Pulsar lives and what it may spend. Every queue then sets its own pace inside those limits.</p>
      <div className="mt-8 grid gap-3 lg:grid-cols-2">
        {[
          ["Engine", "Runtime, storage, self-invocation, global concurrency and the tick budget.", "new Pulsar({ engine })", ENGINE_CODE],
          ["Queue", "Pooler, polling profile, concurrency, batch size and consumer.", "createQueue({ … })", QUEUE_CODE],
        ].map(([t, d, title, code]) => (
          <div key={t} className="flex flex-col rounded-2xl border border-white/10 p-6">
            <div className="text-xl font-medium text-white">{t}</div>
            <p className="mt-2 text-sm text-white/60">{d}</p>
            <div className="mt-5 flex-1"><Code title={title} code={code} /></div>
          </div>
        ))}
      </div>
      <a href={LINKS.config} className="mt-6 inline-block text-sm text-[#4d94ff] underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#4d94ff]">
        Read the full configuration reference
      </a>
    </>
  );
}

/* ------------------------------ the tick loop ------------------------------ */

function TickLoop() {
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

/* ------------------------------ tuning calculator ------------------------------ */

function Slider({ label, value, set, min, max }: { label: string; value: number; set: (n: number) => void; min: number; max: number }) {
  return (
    <label className="block">
      <div className="pl-mono mb-2 flex justify-between text-xs text-white/60"><span>{label}</span><span className="text-white">{value}</span></div>
      <input type="range" min={min} max={max} value={value} onChange={(e) => set(+e.target.value)} className="w-full accent-[#0066ff]" />
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

/* ------------------------------ runtimes ------------------------------ */

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

function LifeStrip({ kind }: { kind: RT["kind"] }) {
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

function Runtimes() {
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

/* ------------------------------ storage toggle ------------------------------ */

function Storage() {
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

/* ------------------------------ integrations ------------------------------ */

function IntegrationMap() {
  const cy = (i: number) => 32 + i * 58;
  return (
    <>
      <svg viewBox="0 0 720 300" className="mt-10 hidden w-full md:block" role="img" aria-label="Pulsar dispatching jobs to an HTTP endpoint, a callback, Kafka, NATS and other brokers">
        {TARGETS.map((_, i) => (
          <g key={i}>
            <path d={`M170 150 C 320 150, 320 ${cy(i)}, 470 ${cy(i)}`} fill="none" stroke="rgba(255,255,255,.14)" strokeWidth="1.5" />
            <path d={`M170 150 C 320 150, 320 ${cy(i)}, 470 ${cy(i)}`} fill="none" stroke={BLUE} strokeWidth="1.5" strokeDasharray="6 10" className="pl-flow" />
          </g>
        ))}
        <rect x="20" y="114" width="150" height="72" rx="16" fill="rgba(0,102,255,.12)" stroke={BLUE} strokeWidth="1.5" />
        <text x="95" y="146" textAnchor="middle" fill="#fff" fontSize="18" fontWeight="600">Pulsar</text>
        <text x="95" y="168" textAnchor="middle" fill={BLUE_LT} fontSize="12" className="pl-mono">claimed jobs</text>
        {TARGETS.map(([t, d], i) => (
          <g key={t}>
            <rect x="470" y={cy(i) - 22} width="230" height="44" rx="12" fill="#000" stroke="rgba(255,255,255,.18)" />
            <text x="486" y={cy(i) - 3} fill="#fff" fontSize="14" fontWeight="500">{t}</text>
            <text x="486" y={cy(i) + 13} fill="rgba(255,255,255,.45)" fontSize="11">{d}</text>
          </g>
        ))}
      </svg>
      <ul className="mt-10 grid gap-2 md:hidden">
        {TARGETS.map(([t, d]) => (
          <li key={t} className="rounded-xl border border-white/10 px-4 py-3">
            <div className="text-white">{t}</div>
            <div className="text-sm text-white/50">{d}</div>
          </li>
        ))}
      </ul>
    </>
  );
}

/* ---------------------------------- page ---------------------------------- */

function CopyCmd() {
  const [ok, setOk] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard?.writeText(INSTALL); setOk(true); setTimeout(() => setOk(false), 1400); }}
      className="pl-mono flex items-center gap-3 rounded-full border border-white/20 px-5 py-3 text-sm text-white/80 hover:border-white/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4d94ff]"
      aria-label={`Copy ${INSTALL}`}
    >
      <span className="text-[#4d94ff]">$</span>{INSTALL}<span className="text-xs text-white/40">{ok ? "copied" : "copy"}</span>
    </button>
  );
}

export default function PulsarLanding() {
  return (
    <main className="min-h-screen bg-black text-white antialiased" style={{ fontFamily: "'Bricolage Grotesque', system-ui, sans-serif" }}>
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

      {/* nav */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-black/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-8 px-5">
          <a href="#top" className="flex items-center gap-2 text-lg font-semibold"><Mark />Pulsar</a>
          <nav className="hidden gap-6 text-sm text-white/50 lg:flex">
            {[["Poolers", "#poolers"], ["Features", "#features"], ["Tick", "#tick"], ["Tuning", "#tuning"], ["Runtimes", "#runtimes"], ["Storage", "#storage"], ["Integrations", "#integrations"]].map(([t, h]) => (
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
      <section id="top" className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full bg-[#0066ff]/15 blur-[120px]" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-5 pb-24 pt-20 md:pt-32">
          <h1 className="max-w-5xl text-6xl font-semibold leading-[0.98] tracking-tight md:text-[8.5rem]">
            Queues don&apos;t run themselves.
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
            Every bar is a tick. When the tick budget or the host&apos;s clock runs out, Pulsar stops cleanly and hands off to a fresh run, so a serverless time limit never drops a job.
          </p>
        </div>
      </section>

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
        <p className="mt-4 text-sm text-white/40">Interval-driven is the default. Polling cadence comes from the queue&apos;s profile.</p>
        <div className="mt-8 grid gap-3 sm:grid-cols-5">
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

      {/* cta */}
      <section className="relative overflow-hidden border-t border-white/10 py-32">
        <div className="pointer-events-none absolute -bottom-48 left-1/2 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-[#0066ff]/20 blur-[130px]" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-5">
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