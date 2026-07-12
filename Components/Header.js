"use client";

import { motion } from "framer-motion";
import { Rss, ArrowRight, Zap } from "lucide-react";
import Link from "next/link";

const STATS = [
    { value: "200+", label: "Articles" },
    { value: "3", label: "New daily" },
    { value: "10+", label: "Topics" },
    { value: "Free", label: "Forever" },
];

const TOPICS = ["React", "Next.js", "AI", "Architecture", "TypeScript", "DevOps"];

function Header() {
    return (
        <div className="relative px-6 pt-16 pb-10 mx-auto max-w-7xl overflow-hidden">

            {/* Ambient blobs */}
            <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
                <div className="absolute -top-20 left-1/4 w-96 h-96 bg-primary/15 rounded-full blur-[140px]" />
                <div className="absolute top-10 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-[120px]" />
            </div>

            <div className="flex flex-col items-center text-center gap-8">

                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-black uppercase tracking-[0.15em]"
                >
                    <Zap className="w-3 h-3 fill-primary" />
                    Updated daily with live AI news
                </motion.div>

                {/* Headline */}
                <motion.h1
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.95] max-w-4xl"
                >
                    <span className="text-foreground">The dev blog that</span>
                    <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-violet-500 to-purple-500">
                        ships knowledge.
                    </span>
                </motion.h1>

                {/* Subtext */}
                <motion.p
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="max-w-xl text-base md:text-lg text-muted-foreground leading-relaxed"
                >
                    Deep-dives on React, architecture, and AI — written by engineers,
                    enriched with live news every morning.
                </motion.p>

                {/* CTA row */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="flex flex-wrap items-center justify-center gap-3"
                >
                    <a
                        href="#articles"
                        className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-black text-sm hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-primary/25"
                    >
                        Browse Articles
                        <ArrowRight className="w-4 h-4" />
                    </a>
                    <a
                        href="/feed.xml"
                        target="_blank"
                        className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-card border border-border text-foreground font-black text-sm hover:border-primary/40 hover:bg-primary/5 transition-all"
                    >
                        <Rss className="w-4 h-4 text-orange-400" />
                        RSS Feed
                    </a>
                </motion.div>

                {/* Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="flex flex-wrap items-center justify-center gap-px rounded-2xl border border-border/60 overflow-hidden bg-border/30 mt-2"
                >
                    {STATS.map((s, i) => (
                        <div
                            key={i}
                            className="flex flex-col items-center px-8 py-4 bg-card/80 backdrop-blur-sm gap-0.5 min-w-[90px]"
                        >
                            <span className="text-2xl font-black text-foreground">{s.value}</span>
                            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">{s.label}</span>
                        </div>
                    ))}
                </motion.div>

                {/* Topic pills */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="flex flex-wrap items-center justify-center gap-2"
                >
                    {TOPICS.map(topic => (
                        <Link
                            key={topic}
                            href={`/tags/${topic.toLowerCase().replace(/\./g, '').replace(/\s+/g, '-')}`}
                            className="px-4 py-1.5 rounded-xl bg-secondary/60 hover:bg-primary/10 border border-border/60 hover:border-primary/30 text-muted-foreground hover:text-primary text-xs font-bold transition-all"
                        >
                            {topic}
                        </Link>
                    ))}
                </motion.div>
            </div>
        </div>
    );
}

export default Header;
