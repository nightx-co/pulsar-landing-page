import Code from "./ui/Code";
import { ENGINE_CODE, LINKS, QUEUE_CODE } from "@/app/constants/pulsarData";

function Card({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={"flex flex-col rounded-2xl border border-white/10 p-6 " + className}>
      <div className="text-lg font-medium text-white">{title}</div>
      <p className="mt-2 text-sm leading-relaxed text-white/60">{children}</p>
    </div>
  );
}

export default function Features() {
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