export default function Code({ code, title }: { code: string; title: string }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-black">
      <div className="pl-mono border-b border-white/10 px-5 py-3 text-xs text-white/40">{title}</div>
      <pre className="pl-mono overflow-x-auto p-5 text-[13px] leading-6 text-white/80"><code>{code}</code></pre>
    </div>
  );
}