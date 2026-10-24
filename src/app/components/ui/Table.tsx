export default function Table({ head, rows }: { head: string[]; rows: string[][] }) {
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