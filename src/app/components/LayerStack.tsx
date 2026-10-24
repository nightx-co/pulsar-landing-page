export default function LayerStack() {
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
              (hot ? "border-[#438cf9] bg-[#0066ff]/10" : "border-white/10")
            }
          >
            <div className={"text-xl font-medium " + (hot ? "text-white" : "text-white/90")}>{t}</div>
            <div className={"mt-1 text-sm " + (hot ? "text-white" : "text-white/50")}>{d}</div>
          </div>
          {i < layers.length - 1 && <div className="h-5 w-px bg-white/20" />}
        </div>
      ))}
    </div>
  );
}