"use client";

import { motion } from "framer-motion";
import { Rss, ArrowRight, Cpu, Database, Layers, Gem } from "lucide-react";
import Link from "next/link";

const STATS = [
    { value: "200+", label: "Articles",    icon: Layers },
    { value: "3",    label: "Daily drops", icon: Cpu },
    { value: "10+",  label: "Topics",      icon: Database },
    { value: "Free", label: "Forever",      icon: Gem },
];

const TOPICS = ["React", "Next.js", "AI", "Architecture", "TypeScript", "DevOps"];

const fadeUp = (delay = 0) => ({
    initial:    { opacity: 0, y: 20 },
    animate:    { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay, ease: [0.22, 0.61, 0.36, 1] },
});

function Header() {
    return (
        <div className="relative px-4 md:px-6 pt-14 pb-12 mx-auto max-w-7xl overflow-hidden">

            {/* Dot-grid layer (hero-scoped) */}
            <div
                aria-hidden="true"
                className="absolute inset-0 -z-20 pointer-events-none opacity-30 dark:opacity-100"
                style={{
                    backgroundImage:
                        "radial-gradient(circle at 1px 1px, hsl(186 100% 50% / 0.07) 1px, transparent 0)",
                    backgroundSize: "36px 36px",
                }}
            />

            {/* Ambient glow orbs */}
            <div aria-hidden="true" className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
                <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-primary/10 dark:bg-primary/15 rounded-full blur-[140px]" />
                <div className="absolute top-16 right-0 w-[350px] h-[350px] bg-secondary/10 dark:bg-secondary/12 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 left-0 w-[280px] h-[280px] bg-primary/5 dark:bg-primary/10 rounded-full blur-[100px]" />
            </div>

            <div className="flex flex-col items-center text-center gap-8">

                {/* Live status badge */}
                <motion.div {...fadeUp(0)}>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 backdrop-blur-sm">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                        </span>
                        <span className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
                            Live — Updated daily
                        </span>
                    </div>
                </motion.div>

                {/* Headline */}
                <motion.div {...fadeUp(0.08)}>
                    <h1 className="text-5xl md:text-7xl lg:text-[88px] font-black tracking-tighter leading-[0.92] max-w-5xl">
                        <span className="block text-foreground">The dev blog that</span>
                        <span
                            className="block text-transparent bg-clip-text"
                            style={{
                                backgroundImage:
                                    "linear-gradient(135deg, hsl(186,100%,50%) 0%, hsl(186,100%,62%) 35%, hsl(268,85%,65%) 70%, hsl(268,85%,75%) 100%)",
                            }}
                        >
                            ships knowledge.
                        </span>
                    </h1>
                </motion.div>

                {/* Subtext */}
                <motion.p
                    {...fadeUp(0.15)}
                    className="max-w-lg text-base md:text-lg text-muted-foreground leading-relaxed"
                >
                    Deep-dives on React, architecture & AI —{" "}
                    <span className="font-mono text-sm text-primary/80 bg-primary/10 px-1.5 py-0.5 rounded-md">
                        written by engineers
                    </span>
                    , enriched with live news every morning.
                </motion.p>

                {/* CTAs */}
                <motion.div
                    {...fadeUp(0.22)}
                    className="flex flex-wrap items-center justify-center gap-3"
                >
                    <a
                        href="#articles"
                        className="group relative flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm overflow-hidden transition-all duration-300"
                        style={{
                            background: "hsl(var(--primary))",
                            color: "hsl(var(--primary-foreground))",
                        }}
                    >
                        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
                        <span className="relative">Browse Articles</span>
                        <ArrowRight className="relative w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                    </a>
                    <a
                        href="/feed.xml"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-card border border-border text-foreground font-black text-sm hover:border-primary/40 hover:bg-primary/5 transition-all duration-200"
                    >
                        <Rss className="w-4 h-4 text-orange-400" />
                        RSS Feed
                    </a>
                </motion.div>

                {/* Stats row */}
                <motion.div
                    {...fadeUp(0.30)}
                    className="flex items-stretch gap-px rounded-2xl border border-border/60 overflow-hidden bg-border/20 backdrop-blur-sm"
                >
                    {STATS.map((s, i) => {
                        const Icon = s.icon;
                        return (
                            <div
                                key={i}
                                className="flex flex-col items-center px-7 py-4 bg-card/70 backdrop-blur-sm gap-1 min-w-[90px] group hover:bg-primary/10 transition-colors duration-200"
                            >
                                {Icon && (
                                    <Icon className="w-3.5 h-3.5 text-primary/50 group-hover:text-primary mb-0.5 transition-colors duration-200" />
                                )}
                                <span className="text-2xl font-black text-foreground group-hover:text-primary transition-colors duration-200">
                                    {s.value}
                                </span>
                                <span className="font-mono text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                    {s.label}
                                </span>
                            </div>
                        );
                    })}
                </motion.div>

                {/* Topic pills */}
                <motion.div
                    {...fadeUp(0.38)}
                    className="flex flex-wrap items-center justify-center gap-2"
                >
                    {TOPICS.map(topic => (
                        <Link
                            key={topic}
                            href={`/tags/${topic.toLowerCase().replace(/\./g, "").replace(/\s+/g, "-")}`}
                            className="group flex items-center gap-1.5 px-4 py-1.5 rounded-xl border border-border/60 bg-card/60 hover:border-primary/40 hover:bg-primary/10 text-muted-foreground hover:text-primary font-mono text-xs font-semibold transition-all duration-200"
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-40 group-hover:opacity-100 transition-opacity" />
                            {topic}
                        </Link>
                    ))}
                </motion.div>

            </div>
        </div>
    );
}

export default Header;
