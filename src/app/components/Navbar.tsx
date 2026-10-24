import { useState } from "react";
import Mark from "./ui/Mark";
import Btn from "./ui/Btn";
import { LINKS } from "@/app/constants/pulsarData";
import Image from "next/image";

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    const navLinks = [
        ["Poolers", "#poolers"],
        ["Features", "#features"],
        ["Tick", "#tick"],
        ["Tuning", "#tuning"],
        ["Runtimes", "#runtimes"],
        ["Storage", "#storage"],
        ["Integrations", "#integrations"],
    ]

    return (
        <header className="sticky top-0 z-30 border-b border-white/10 bg-black/85 backdrop-blur">
            <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-8 px-5">
                <a href="#top" className="flex items-center gap-2 text-lg font-semibold  animate-[pulse_0.1s_cubic-bezier(0.4,0,0.6,1)_infinite]">
                    <Image
                        width={70}
                        height={70}
                        className=""
                        src="/logo.png"
                        alt=""
                    />
                    Pulsar
                </a>

                {/* Desktop Navigation */}
                <nav className="hidden gap-6 text-sm text-white/50 lg:flex">
                    {navLinks.map(([t, h]) => (
                        <a key={h} href={h} className="hover:text-white transition-colors">
                            {t}
                        </a>
                    ))}
                </nav>

                {/* Desktop Action Buttons */}
                <div className="hidden items-center gap-4 text-sm sm:flex">
                    <a href={LINKS.github} className="text-white/60 hover:text-white transition-colors">
                        GitHub
                    </a>
                    <a href={LINKS.docs} className="text-white/60 hover:text-white transition-colors">
                        Docs
                    </a>
                    <Btn href={LINKS.quickstart} solid>
                        Get started
                    </Btn>
                </div>

                {/* Mobile Toggle Button */}
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex flex-col justify-center items-center gap-1.5 w-8 h-8 rounded text-white/70 hover:text-white lg:hidden focus:outline-none"
                    aria-label="Toggle Navigation Menu"
                >
                    <span className={`h-0.5 w-6 bg-current transition-all duration-300 ${isOpen ? "rotate-45 translate-y-2" : ""}`} />
                    <span className={`h-0.5 w-6 bg-current transition-all duration-300 ${isOpen ? "opacity-0" : ""}`} />
                    <span className={`h-0.5 w-6 bg-current transition-all duration-300 ${isOpen ? "-rotate-45 -translate-y-2" : ""}`} />
                </button>
            </div>

            {/* Mobile Dropdown Menu */}
            {isOpen && (
                <div className="border-b border-white/10 bg-black/95 px-5 py-4 lg:hidden">
                    <nav className="flex flex-col gap-4 text-sm text-white/70">
                        {navLinks.map(([t, h]) => (
                            <a
                                key={h}
                                href={h}
                                onClick={() => setIsOpen(false)}
                                className="hover:text-white transition-colors"
                            >
                                {t}
                            </a>
                        ))}
                        <hr className="border-white/10 my-1" />
                        <div className="flex flex-col gap-3 pt-1">
                            <a
                                href={LINKS.github}
                                onClick={() => setIsOpen(false)}
                                className="text-white/60 hover:text-white transition-colors"
                            >
                                GitHub
                            </a>
                            <a
                                href={LINKS.docs}
                                onClick={() => setIsOpen(false)}
                                className="text-white/60 hover:text-white transition-colors"
                            >
                                Docs
                            </a>
                            <div className="pt-2">
                                <Btn href={LINKS.quickstart} solid>
                                    Get started
                                </Btn>
                            </div>
                        </div>
                    </nav>
                </div>
            )}
        </header>
    )
}