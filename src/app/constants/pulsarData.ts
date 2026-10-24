export const LINKS = {
  docs: "/docs/getting-started/introduction",
  quickstart: "/docs/getting-started/quickstart",
  config: "/docs/configuration",
  github: "https://github.com/",
};

export const INSTALL = "npm install @nightx/pulsar";
export const BLUE = "#0066ff";
export const BLUE_LT = "#4d94ff";

export const PROFILES = [
  ["REALTIME", "Lowest latency. Highest database load."],
  ["STANDARD", "The default balance of speed and cost."],
  ["BALANCED", "Steady background work."],
  ["RELAXED", "Fewer queries, slower pickup."],
  ["ULTRA_EFFICIENT", "Longest gaps. For low-priority batches."],
];

export const HANDLES = [
  "Polling and event activation",
  "Concurrency and batch sizing",
  "HTTP and callback dispatch",
  "Distributed locks and retries",
  "Adapting to serverless, edge and persistent hosts",
];

export const NOT = [
  "A message broker",
  "A replacement for PGMQ",
  "Another place your jobs are stored",
];

export const TICK_STEPS: [string, string][] = [
  ["Evaluate queues", "Read every configured queue and its limits."],
  ["Size the work", "Work out what each queue can take within concurrency and maxJobsPerTick."],
  ["Pull jobs", "Claim a batch from PGMQ."],
  ["Dispatch", "Hand the jobs to each queue's consumer."],
  ["Update state", "Record what ran."],
  ["Schedule next tick", "The timing profile and runtime decide when."],
];

export type RT = {
  id: string;
  label: string;
  kind: "isolate" | "vm" | "persistent";
  hosts: string[];
  blurb: string;
  rows: [string, string][];
};

export const RUNTIMES: RT[] = [
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

export const STORAGE_OPS = [
  "Worker registration and deregistration",
  "Spawning",
  "Job calculation",
  "Locks",
  "Execution coordination",
];

export const TARGETS: [string, string][] = [
  ["HTTP endpoint", "POST jobs to any URL, any language"],
  ["Async callback", "A function in your own process"],
  ["Apache Kafka", "Stream jobs into topics"],
  ["NATS", "Publish jobs to subjects"],
  ["External brokers", "Fan out to other systems"],
];

export const ENGINE_CODE = `new Pulsar({
  runtime: PulsarRuntime.SERVERLESS,
  storage,
  engine: {
    selfURL: "https://example.com/process-job",
    tickConcurrency: "sequential",
    maxGlobalConcurrency: 100,
    cycleTickLimit: 10,
  },
});`;

export const QUEUE_CODE = `createQueue({
  queue: "scrape",
  pooler: "event-driven-pooler",
  profile: "REALTIME",
  concurrency: 10,
  n: 10,
  maxJobsPerTick: 1000,
  consumer: { type: "http", url },
});`;

export const HTTP_CODE = `consumer: {
  type: "http",
  url: "https://api.example.com/jobs",
  headers: { Authorization: "Bearer " + key },
  timeoutMs: 5000,
}`;

export const CALLBACK_CODE = `consumer: {
  type: "callback",
  handler: async (job) => {
    // job.workerId, job.queue, job.payload,
    // job.attempts, job.timestamp
    await run(job.payload);
    // deregister job.workerId yourself
  },
}`;

export const HEIGHTS = [34, 58, 44, 72, 50, 84, 62, 40, 92, 54];

export const reduced = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;