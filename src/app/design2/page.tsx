"use client";

/**
 * Pulsar landing page: single file, Next.js (App Router) + Tailwind CSS.
 * Usage: save as app/page.tsx (or import <PulsarLanding /> anywhere).
 * No other dependencies. Search for "EDIT:" to find copy/links you'll want to change.
 */

import { useEffect, useRef, useState } from "react";

/* ------------------------------ content ------------------------------ */

const LINKS = {
  docs: "/docs", // EDIT:
  quickstart: "/docs/getting-started/quickstart", // EDIT:
  github: "https://github.com/", // EDIT: your repo
};

const INSTALL = "npm install pulsar"; // EDIT: real package name

const QUEUES = [
  { name: "scrape", mode: "EDP" },
  { name: "enrich", mode: "EDP" },
  { name: "screenshot", mode: "IDP" },
  { name: "embed", mode: "EDP" },
  { name: "security-scan", mode: "IDP" },
];

const MODES = {
  EDP: {
    title: "Event-Driven Pooler",
    tagline: "Work tells Pulsar when to wake up.",
    body: "A database trigger on your PGMQ queue invokes the engine when a job arrives. Pulsar drains the queue, self-invokes while work remains, then goes completely silent. 1,000 inserts don't mean 1,000 invocations: one engine run takes ownership of the workload.",
    flow: ["Job inserted", "DB trigger", "Engine wakes", "Process jobs", "More work? Self-invoke", "Drained: stop"],
    fits: ["Mostly idle queues", "Start soon after arrival", "No cost while empty"],
  },
  IDP: {
    title: "Interval-Driven Pooler",
    tagline: "Wakes up on a schedule, checks, repeats.",
    body: "The engine starts itself on a configured interval and runs its tick cycle across your interval-driven queues, guarded by one shared execution lock. It's the right fit when periodic discovery is fine or your queues hold scheduled and delayed work.",
    flow: ["Interval fires", "Take shared lock", "Run tick cycle", "Check queues", "Finish cycle", "Wait, wake again"],
    fits: ["Scheduled / delayed jobs", "No external wake-up event", "Many queues, one coordinator"],
  },
} as const;

const FEATURES = [
  ["Per-queue configuration", "Concurrency, batch size, tick limits, timing profile and consumer, tuned independently for every queue in the same engine."],
  ["Runtime-aware engine", "An internal clock tracks the time your host has left and stops ticking before the platform kills the function."],
  ["Reliable by construction", "Distributed execution locks, retries, failure recovery and dead-run handling prevent races and duplicate processing."],
  ["Elastic scaling", "Workers are activated by queue load, by trigger or by interval, so nothing idles waiting for jobs."],
  ["Dispatch anywhere", "Send jobs to HTTP endpoints, custom async handlers, or stream them into Kafka, NATS and other brokers."],
  ["Deeply customizable", "Hooks, payload transformations, queue routing and event triggers are all yours to shape."],
];

const RUNTIMES = [
  {
    name: "Serverless containers",
    hosts: "AWS Lambda, Vercel, Netlify",
    text: "Each run is a temporary worker. When the clock nears the host timeout or a cycleTickLimit is hit, Pulsar shuts down cleanly and self-invokes a fresh run.",
    flow: "run → ticks → limit → self-invoke",
  },
  {
    name: "V8 isolates",
    hosts: "Cloudflare Workers, Supabase Edge Functions",
    text: "Pulsar tracks both the invocation window and the isolate's age, and delays self-invocation slightly so the platform can recycle the old isolate.",
    flow: "run → ticks → isolate aging → pause → fresh isolate",
  },
  {
    name: "Persistent servers",
    hosts: "Node.js, Deno, Bun, Docker, Fly.io, VPS",
    text: "No host timeout, so no self-invocation. The tick loop stays warm and keeps polling or reacting to events indefinitely.",
    flow: "start → tick → tick → tick …",
  },
];

const CODE = `import { createPulsar } from "pulsar"; // EDIT: real API

const pulsar = createPulsar({
  storage: {
    postgres: process.env.DATABASE_URL,
    redis: process.env.REDIS_URL, // optional
  },
  runtime: "serverless",
  selfInvocationMethod: "auto_using_pgnet",
  cycleTickLimit: 10,
  queues: {
    scrape: {
      mode: "edp",
      concurrency: 5,
      batchSize: 20,
      consumer: "https://api.example.com/jobs/scrape",
    },
    "security-scan": {
      mode: "idp",
      interval: "30s",
      concurrency: 2,
      consumer: async (job) => scan(job.payload),
    },
  },
});

export default pulsar.handler;`;

/* --------------------------- small components --------------------------- */

function Logo() {
  return (
    <span className="flex items-center gap-2 font-semibold tracking-tight text-white">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M2 12h4l2.5-7 4 14 3-9 1.5 2H22" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Pulsar
    </span>
  );
}

function Button({ href, children, primary = false }: { href: string; children: React.ReactNode; primary?: boolean }) {
  return (
    <a
      href={href}
      className={
        "inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white " +
        (primary
          ? "bg-zinc-100 text-black hover:bg-white"
          : "border border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-900/50 hover:text-white")
      }
    >
      {children}
    </a>
  );
}

function CopyCommand({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard?.writeText(text);
        setDone(true);
        setTimeout(() => setDone(false), 1500);
      }}
      className="pl-mono group flex items-center gap-3 rounded-lg border border-zinc-800 bg-[#09090b] px-4 py-2.5 text-sm text-zinc-300 hover:border-zinc-700"
      aria-label={`Copy ${text}`}
    >
      <span className="text-zinc-500">$</span>
      {text}
      <span className="ml-2 text-xs text-zinc-500 group-hover:text-zinc-300">{done ? "copied" : "copy"}</span>
    </button>
  );
}

/* ------------------------- hero: live engine console ------------------------- */

type Row = { id: number; tick: number; queue: string; mode: string; jobs: number; status: "Dispatched" | "Idle" | "Self-invoke"; ms: number };

function EngineConsole() {
  const [rows, setRows] = useState<Row[]>([]);
  const [lock, setLock] = useState(true);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setRows(
        QUEUES.slice(0, 5).map((q, i) => ({ id: i, tick: i + 1, queue: q.name, mode: q.mode, jobs: 12 - i * 2, status: "Dispatched", ms: 9 + i }))
      );
      return;
    }
    let n = 0;
    const t = setInterval(() => {
      n += 1;
      const q = QUEUES[n % QUEUES.length];
      const cycle = ((n - 1) % 10) + 1; // mirrors a cycleTickLimit of 10
      const idle = q.mode === "IDP" && n % 3 === 0;
      const row: Row = {
        id: n,
        tick: cycle,
        queue: q.name,
        mode: q.mode,
        jobs: idle ? 0 : 4 + ((n * 7) % 17),
        status: cycle === 10 ? "Self-invoke" : idle ? "Idle" : "Dispatched",
        ms: 6 + ((n * 5) % 14),
      };
      setRows((r) => [row, ...r].slice(0, 6));
      setLock(cycle !== 10);
    }, 1300);
    return () => clearInterval(t);
  }, []);

  const tone = (s: Row["status"]) =>
    s === "Dispatched" ? "text-emerald-400 bg-emerald-950/40 border border-emerald-800/40" : s === "Idle" ? "text-zinc-400 bg-zinc-900 border border-zinc-800" : "text-zinc-200 bg-zinc-800 border border-zinc-700";

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-800 bg-[#09090b] shadow-[0_30px_90px_-20px_rgba(0,0,0,0.9)]">
      <div className="flex items-center justify-between border-b border-zinc-800/80 px-4 py-3 text-xs text-zinc-400">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-800" />
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-800" />
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-800" />
          <span className="pl-mono ml-3 text-zinc-400">engine · run #4821</span>
        </div>
        <span className="pl-mono flex items-center gap-2 text-zinc-400">
          execution lock
          <span className={"inline-block h-2 w-2 rounded-full " + (lock ? "bg-emerald-400 pl-pulse" : "bg-amber-400")} />
          {lock ? "held" : "released"}
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="pl-mono w-full min-w-[560px] text-left text-[13px]">
          <thead className="text-zinc-500">
            <tr className="border-b border-zinc-800/60">
              {["Tick", "Queue", "Mode", "Jobs pulled", "Status", "Duration"].map((h) => (
                <th key={h} className="px-4 py-2.5 font-normal">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.id} className={"border-b border-zinc-900/80 text-zinc-300 " + (i === 0 ? "pl-row-in" : "")}>
                <td className="px-4 py-2.5 text-zinc-500">{r.tick}/10</td>
                <td className="px-4 py-2.5 text-zinc-200">{r.queue}</td>
                <td className="px-4 py-2.5 text-zinc-400">{r.mode}</td>
                <td className="px-4 py-2.5 text-zinc-300">{r.jobs}</td>
                <td className="px-4 py-2.5"><span className={"rounded px-2 py-0.5 text-xs " + tone(r.status)}>{r.status}</span></td>
                <td className="px-4 py-2.5 text-zinc-500">{r.ms}ms</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-zinc-500">Starting engine…</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ------------------------------ page sections ------------------------------ */

function ResourcesDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-1 hover:text-white transition focus:outline-none"
      >
        Resources
        <svg
          className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 mt-2 w-48 rounded-xl border border-zinc-800 bg-[#09090b] p-2 shadow-xl backdrop-blur-lg">
          <a
            href="/blog"
            className="block rounded-lg px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800/60 hover:text-white"
          >
            <div className="font-medium">Blog</div>
            <div className="text-xs text-zinc-500">Read our latest posts</div>
          </a>
          <a
            href="/changelog"
            className="block rounded-lg px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800/60 hover:text-white"
          >
            <div className="font-medium">Changelog</div>
            <div className="text-xs text-zinc-500">See recent updates</div>
          </a>
        </div>
      )}
    </div>
  );
}

/* ---------------- Combined Single Nav Component ---------------- */

export function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800/80 bg-black/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5">
        {/* Brand Logo */}
        <a href="#top" className="flex items-center gap-2 font-semibold tracking-tight text-white">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M2 12h4l2.5-7 4 14 3-9 1.5 2H22"
              stroke="#ffffff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Pulsar
        </a>

        {/* Navigation Links */}
        <nav className="hidden items-center gap-6 text-sm text-zinc-400 md:flex">
          {/* Section Anchors */}
          <a className="hover:text-white transition" href="#modes">
            Modes
          </a>
          <a className="hover:text-white transition" href="#features">
            Features
          </a>
          <a className="hover:text-white transition" href="#runtimes">
            Runtimes
          </a>
          <a className="hover:text-white transition" href="#storage">
            Storage
          </a>

          <div className="h-4 w-px bg-zinc-800" />

          {/* Fumadocs App Links */}
          <a className="hover:text-white transition" href="/docs/getting-started/introduction">
            Documentation
          </a>

          {/* Resources Dropdown Menu */}
          <ResourcesDropdown />
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="hidden text-sm text-zinc-400 hover:text-white transition sm:block"
          >
            GitHub
          </a>

          <a
            href="/contact"
            className="rounded-full bg-zinc-100 px-3.5 py-1.5 text-xs font-semibold text-black hover:bg-white transition"
          >
            Contact
          </a>
        </div>
      </div>
    </header>
  );
}



function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.06),transparent_65%)]" />
      <div className="relative mx-auto max-w-6xl px-5 pb-20 pt-20 md:pt-28">
        <div className="mx-auto max-w-3xl text-center">
          <a href={LINKS.github} className="mb-7 inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-[#09090b] px-4 py-1.5 text-xs text-zinc-300 hover:border-zinc-700">
            <span className="h-1.5 w-1.5 rounded-full bg-zinc-200" />
            Open source and built on PGMQ
          </a>
          <h1 className="text-balance text-5xl font-semibold leading-[1.05] tracking-tight text-white md:text-7xl">
            The execution engine for PGMQ queues
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-zinc-400">
            PGMQ stores your messages. Pulsar runs the workers around them: polling, waking, locking and dispatching, on serverless functions, edge isolates or your own servers.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button href={LINKS.quickstart} primary>Start processing jobs</Button>
            <CopyCommand text={INSTALL} />
          </div>
        </div>

        <div className="mx-auto mt-16 max-w-4xl">
          <EngineConsole />
        </div>

        <div className="mx-auto mt-14 grid max-w-4xl grid-cols-2 gap-px overflow-hidden rounded-xl border border-zinc-800 bg-zinc-800 md:grid-cols-4">
          {[
            ["2", "processing modes, event and interval"],
            ["0", "extra brokers, it's just Postgres"],
            ["3", "runtime models, one engine"],
            ["MIT", "open source, no lock-in"], // EDIT: confirm license
          ].map(([big, small]) => (
            <div key={small} className="bg-[#09090b] p-5">
              <div className="text-3xl font-semibold text-white">{big}</div>
              <div className="mt-1 text-sm text-zinc-500">{small}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Layer() {
  const boxes = [
    ["Your app", "Business logic and consumers", false],
    ["Pulsar", "Ticks, locks, dispatch, recovery", true],
    ["PGMQ", "Stores and manages messages", false],
    ["PostgreSQL", "Persistent foundation", false],
  ] as const;
  return (
    <section className="border-t border-zinc-800/80 py-24">
      <div className="mx-auto max-w-6xl px-5">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">Pulsar doesn't replace PGMQ. It operates it.</h2>
          <p className="mt-4 text-zinc-400">
            Running production queues means building the whole processing lifecycle yourself. Pulsar is that lifecycle, sitting on the Postgres database you already have.
          </p>
        </div>
        <div className="mt-12 grid gap-3 md:grid-cols-4">
          {boxes.map(([t, d, hot]) => (
            <div key={t} className={"rounded-xl border p-6 " + (hot ? "border-zinc-600 bg-zinc-900" : "border-zinc-800 bg-[#09090b]")}>
              <div className="text-lg font-medium text-white">{t}</div>
              <div className="mt-1 text-sm text-zinc-400">{d}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Modes() {
  const [tab, setTab] = useState<keyof typeof MODES>("EDP");
  const m = MODES[tab];
  return (
    <section id="modes" className="border-t border-zinc-800/80 py-24">
      <div className="mx-auto max-w-6xl px-5">
        <h2 className="max-w-2xl text-3xl font-semibold tracking-tight text-white md:text-4xl">Two ways to wake the engine</h2>
        <p className="mt-4 max-w-2xl text-zinc-400">Choose per queue. Start on events, poll on a schedule, or mix both in one engine.</p>

        <div role="tablist" className="mt-10 inline-flex rounded-lg border border-zinc-800 bg-[#09090b] p-1">
          {(Object.keys(MODES) as (keyof typeof MODES)[]).map((k) => (
            <button
              key={k}
              role="tab"
              aria-selected={tab === k}
              onClick={() => setTab(k)}
              className={"rounded-md px-5 py-2 text-sm font-medium transition " + (tab === k ? "bg-zinc-100 text-black" : "text-zinc-400 hover:text-white")}
            >
              {k === "EDP" ? "Event-driven" : "Interval-driven"}
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-6 rounded-2xl border border-zinc-800 bg-[#09090b] p-6 md:grid-cols-2 md:p-10">
          <div>
            <div className="pl-mono text-xs text-zinc-400">{tab}</div>
            <h3 className="mt-2 text-2xl font-semibold text-white">{m.title}</h3>
            <p className="mt-1 text-lg text-zinc-300">{m.tagline}</p>
            <p className="mt-5 leading-relaxed text-zinc-400">{m.body}</p>
            <ul className="mt-6 space-y-2 text-sm text-zinc-300">
              {m.fits.map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
          <ol key={tab} className="relative space-y-3 border-l border-zinc-800 pl-6">
            {m.flow.map((s, i) => (
              <li key={s} className="pl-step relative rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-200" style={{ animationDelay: `${i * 90}ms` }}>
                <span className="absolute -left-[31px] top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full border-2 border-zinc-400 bg-black" />
                {s}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section id="features" className="border-t border-zinc-800/80 py-24">
      <div className="mx-auto max-w-6xl px-5">
        <h2 className="max-w-2xl text-3xl font-semibold tracking-tight text-white md:text-4xl">Everything between the queue and your code</h2>
        <div className="mt-12 grid gap-px overflow-hidden rounded-xl border border-zinc-800 bg-zinc-800 md:grid-cols-3">
          {FEATURES.map(([t, d]) => (
            <div key={t} className="bg-[#09090b] p-7">
              <h3 className="font-medium text-white">{t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">{d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Tick() {
  const steps = ["Evaluate queues", "Determine work", "Pull jobs", "Dispatch", "Update state", "Schedule next tick"];
  return (
    <section className="border-t border-zinc-800/80 py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 md:grid-cols-2">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">One loop runs everything: the tick</h2>
          <p className="mt-4 leading-relaxed text-zinc-400">
            A tick is one complete execution cycle. Every tick evaluates your queues, works out how much each can handle, pulls jobs from PGMQ, dispatches them and schedules the next one. Queue and engine-level <span className="pl-mono text-zinc-300">cycleTickLimit</span> budgets decide when a run ends and a fresh one begins.
          </p>
        </div>
        <div className="pl-mono rounded-xl border border-zinc-800 bg-[#09090b] p-6 text-sm">
          {steps.map((s, i) => (
            <div key={s}>
              <div className="pl-tick rounded-md border border-zinc-800 px-4 py-2 text-zinc-200" style={{ animationDelay: `${i * 0.45}s` }}>{s}</div>
              <div className="py-1 text-center text-zinc-600">↓</div>
            </div>
          ))}
          <div className="rounded-md border border-dashed border-zinc-700 px-4 py-2 text-center text-zinc-300">tick again</div>
        </div>
      </div>
    </section>
  );
}

function Runtimes() {
  return (
    <section id="runtimes" className="border-t border-zinc-800/80 py-24">
      <div className="mx-auto max-w-6xl px-5">
        <h2 className="max-w-2xl text-3xl font-semibold tracking-tight text-white md:text-4xl">Runs where your code already runs</h2>
        <p className="mt-4 max-w-2xl text-zinc-400">Pulsar adapts its lifecycle to the execution model of the platform, so time limits never cost you a job.</p>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {RUNTIMES.map((r) => (
            <div key={r.name} className="flex flex-col rounded-xl border border-zinc-800 bg-[#09090b] p-6">
              <h3 className="text-lg font-medium text-white">{r.name}</h3>
              <div className="mt-1 text-sm text-zinc-400">{r.hosts}</div>
              <p className="mt-4 flex-1 text-sm leading-relaxed text-zinc-400">{r.text}</p>
              <div className="pl-mono mt-5 rounded-md bg-zinc-950 px-3 py-2 text-xs text-zinc-400 border border-zinc-800/50">{r.flow}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CodeBlock() {
  return (
    <section className="border-t border-zinc-800/80 py-24">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 md:grid-cols-5">
        <div className="md:col-span-2">
          <h2 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">Configure queues, not infrastructure</h2>
          <p className="mt-4 leading-relaxed text-zinc-400">
            Declare each queue's mode, concurrency, batch size and consumer. Pulsar handles polling, event activation, locking and self-invocation for you.
          </p>
          <div className="mt-6"><Button href={LINKS.quickstart}>Read the quickstart</Button></div>
        </div>
        <div className="overflow-hidden rounded-xl border border-zinc-800 bg-[#09090b] md:col-span-3">
          <div className="pl-mono border-b border-zinc-800 px-4 py-2.5 text-xs text-zinc-500">pulsar.config.ts</div>
          <pre className="pl-mono overflow-x-auto p-5 text-[13px] leading-6 text-zinc-300"><code>{CODE}</code></pre>
        </div>
      </div>
    </section>
  );
}

function Storage() {
  return (
    <section id="storage" className="border-t border-zinc-800/80 py-24">
      <div className="mx-auto max-w-6xl px-5">
        <h2 className="max-w-2xl text-3xl font-semibold tracking-tight text-white md:text-4xl">Postgres is enough. Redis makes it faster.</h2>
        <p className="mt-4 max-w-2xl text-zinc-400">
          The Unified Storage System gives the engine one interface. Add Redis for high-frequency state, or leave it out and Pulsar uses an unlogged Postgres table. Nothing breaks either way.
        </p>
        <div className="mt-12 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-zinc-800 bg-[#09090b] p-7">
            <div className="text-sm text-zinc-500">Postgres only</div>
            <ul className="mt-3 space-y-2 text-zinc-300">
              <li>Persistent storage in PostgreSQL</li>
              <li>Worker registration, locks and spawning via the unlogged table</li>
              <li>One dependency to run</li>
            </ul>
          </div>
          <div className="rounded-xl border border-zinc-700 bg-zinc-900/60 p-7">
            <div className="text-sm text-zinc-300">Postgres + Redis (optional)</div>
            <ul className="mt-3 space-y-2 text-zinc-200">
              <li>PostgreSQL stays the persistent layer</li>
              <li>Redis handles registration, locks and job calculation</li>
              <li>Less high-frequency load on your database</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="border-t border-zinc-800/80 py-28">
      <div className="mx-auto max-w-3xl px-5 text-center">
        <h2 className="text-4xl font-semibold tracking-tight text-white md:text-5xl">Give your queues an engine</h2>
        <p className="mt-5 text-zinc-400">Open source, self-hosted, and running on the Postgres you already have.</p>
        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button href={LINKS.quickstart} primary>Get started</Button>
          <Button href={LINKS.github}>Star on GitHub</Button>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-zinc-800/80 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 text-sm text-zinc-500 sm:flex-row">
        <Logo />
        <div className="flex gap-6">
          <a className="hover:text-white" href={LINKS.docs}>Docs</a>
          <a className="hover:text-white" href={LINKS.github}>GitHub</a>
          <a className="hover:text-white" href="#modes">Modes</a>
          <a className="hover:text-white" href="#runtimes">Runtimes</a>
        </div>
        <span>© {new Date().getFullYear()} Pulsar</span>
      </div>
    </footer>
  );
}

/* --------------------------------- page --------------------------------- */

export default function PulsarLanding() {
  return (
    <main
      className="min-h-screen scroll-smooth bg-[#000000] text-zinc-200 antialiased"
      style={{
        fontFamily:
          "Geist, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Inter, sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600&family=Fira+Code:wght@400;500&display=swap');
        html { scroll-behavior: smooth; }
        .pl-mono { font-family: 'Fira Code', 'Geist Mono', ui-monospace, monospace; }
        @keyframes pl-row { from { opacity: 0; transform: translateY(-8px); background: rgba(255,255,255,.05); } to { opacity: 1; transform: none; background: transparent; } }
        .pl-row-in { animation: pl-row .7s ease-out; }
        @keyframes pl-step { from { opacity: 0; transform: translateX(-8px); } to { opacity: 1; transform: none; } }
        .pl-step { animation: pl-step .35s ease-out both; }
        @keyframes pl-pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(52,211,153,.6); } 50% { box-shadow: 0 0 0 6px rgba(52,211,153,0); } }
        .pl-pulse { animation: pl-pulse 1.6s infinite; }
        @keyframes pl-tick { 0%,20%,100% { border-color: #27272a; background: transparent; } 8% { border-color: #52525b; background: rgba(255,255,255,.05); } }
        .pl-tick { animation: pl-tick 3.2s infinite; }
        @media (prefers-reduced-motion: reduce) { .pl-row-in,.pl-step,.pl-pulse,.pl-tick { animation: none !important; } }
      `}</style>
      <Nav />
      <Hero />
      <Layer />
      <Modes />
      <Features />
      <Tick />
      <Runtimes />
      <CodeBlock />
      <Storage />
      <CTA />
      <Footer />
    </main>
  );
}