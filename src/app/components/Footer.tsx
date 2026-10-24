import Btn from "./ui/Btn";
import { LINKS } from "@/app/constants/pulsarData";

export default function Footer() {
    return (
        <>
            <section className="relative overflow-hidden border-t border-white/10 py-32">
                <div className="pointer-events-none absolute -bottom-48 left-1/2 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-[#A8A7A7]/20 blur-[130px]" aria-hidden />
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
                    <span className="flex items-center gap-2 text-xl text-white font-semibold animate-[pulse_0.1s_cubic-bezier(0.4,0,0.6,1)_infinite]">
                        Pulsar
                    </span>
                    
                
                    <div className="flex gap-6">
                        <a className="hover:text-white" href={LINKS.docs}>Docs</a>
                        <a className="hover:text-white" href={LINKS.github}>GitHub</a>
                    </div>
                    <span>© {new Date().getFullYear()} Pulsar. Open source.</span>
                </div>
            </footer>
        </>
    )
}