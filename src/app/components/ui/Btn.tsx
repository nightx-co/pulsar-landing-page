export default function Btn({ href, children, solid = false }: { href: string; children: React.ReactNode; solid?: boolean }) {
  return (
    <a
      href={href}
      className={
        "inline-flex items-center rounded-full px-6 py-3 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4d94ff] " +
        // (solid ? "bg-[#0066ff] text-white hover:bg-[#1a75ff]" : "border border-white/20 text-white hover:border-white/60")

       (solid
          ? "bg-[#0066ff] text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.6),-4px_6px_12px_rgba(0,0,0,0.35)] hover:bg-[#3385ff] hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.6),-6px_8px_16px_rgba(0,0,0,0.45)]"
          : "border border-white/20 text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.4),-4px_6px_12px_rgba(0,0,0,0.35)] hover:border-white/60 hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.7),-6px_8px_16px_rgba(0,0,0,0.45)]")
      }
    >
      {children}
    </a>
  );
}