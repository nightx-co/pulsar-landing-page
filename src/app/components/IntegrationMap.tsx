import { BLUE, BLUE_LT, TARGETS } from "@/app/constants/pulsarData";

export default function IntegrationMap() {
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
            <rect x="470" y={cy(i) - 22} width="230" height="44" rx="12" fill="#050505" stroke="rgba(255,255,255,.18)" />
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