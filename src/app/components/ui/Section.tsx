export default function Section({ id, name, children }: { id: string; name: string; children: React.ReactNode }) {
    return (
        <section id={id} className="border-t border-white/10 py-12 md:py-24">
            <div className="mx-auto grid max-w-6xl gap-6 px-4 sm:px-5 md:grid-cols-[160px_1fr] md:gap-10">
                <div className="pl-mono flex items-center text-sm text-white/40 md:sticky md:top-24 md:self-start">
                    <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-[#0066ff]" />
                    {name}
                </div>
                {/* min-w-0 prevents grid item content from forcing overflow */}
                <div className="min-w-0">{children}</div>
            </div>
        </section>
    )
}