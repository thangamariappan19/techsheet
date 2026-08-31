"use client";

import Link from "next/link";
import { Github, Twitter, Linkedin, Mail, Rss, Terminal, ArrowUpRight } from "lucide-react";
import VisitorCount from "./VisitorCount";

const TOPICS = ["React", "Next.js", "AI", "Architecture", "TypeScript", "DevOps"];
const PAGES = [
    { label: "All Articles",    href: "/" },
    { label: "About",           href: "/about" },
    { label: "RSS Feed",        href: "/feed.xml" },
    { label: "Privacy Policy",  href: "/privacy" },
];
const SOCIALS = [
    { icon: Twitter,  href: "https://twitter.com/iamthangam",                     label: "Twitter"  },
    { icon: Github,   href: "https://github.com/thangamariappan19",                label: "GitHub"   },
    { icon: Linkedin, href: "https://www.linkedin.com/in/thanga-mariappan-p/",     label: "LinkedIn" },
    { icon: Rss,      href: "/feed.xml",                                           label: "RSS"      },
    { icon: Mail,     href: "mailto:thangamariappancse@gmail.com",                 label: "Email"    },
];

function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer className="relative w-full bg-card/40 backdrop-blur-sm mt-16">
            {/* Gradient top border */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            {/* Subtle glow under top border */}
            <div className="absolute top-0 left-1/4 right-1/4 h-8 bg-primary/4 blur-xl pointer-events-none" />

            <div className="container mx-auto px-6 py-14 max-w-7xl">

                {/* Top grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">

                    {/* Brand */}
                    <div className="flex flex-col gap-5">
                        <Link href="/" className="flex items-center gap-2.5 group w-fit">
                            <div className="relative">
                                <div className="absolute inset-0 rounded-lg bg-primary/20 blur-md group-hover:bg-primary/35 transition-all duration-300" />
                                <div className="relative p-1.5 rounded-lg border border-primary/30 bg-primary/10 group-hover:border-primary/60 transition-all duration-300">
                                    <Terminal className="w-4 h-4 text-primary" />
                                </div>
                            </div>
                            <span className="font-black text-lg tracking-tight text-foreground group-hover:text-primary transition-colors duration-300">
                                TechSheet
                            </span>
                        </Link>

                        <p className="text-sm text-muted-foreground leading-relaxed max-w-[240px]">
                            Deep-dives on React, architecture & AI — updated every morning with live news.
                        </p>

                        {/* Socials */}
                        <div className="flex items-center gap-2 flex-wrap">
                            {SOCIALS.map(s => (
                                <a
                                    key={s.label}
                                    href={s.href}
                                    target={s.href.startsWith("http") ? "_blank" : undefined}
                                    rel="noopener noreferrer"
                                    aria-label={s.label}
                                    className="p-2 rounded-xl bg-muted/40 border border-border/50 hover:bg-primary/10 hover:border-primary/40 text-muted-foreground hover:text-primary transition-all duration-200"
                                >
                                    <s.icon className="w-4 h-4" />
                                </a>
                            ))}
                        </div>

                        {/* Live status */}
                        <div className="flex items-center gap-2 font-mono text-[11px] text-muted-foreground/60">
                            <span className="relative flex h-1.5 w-1.5">
                                <span className="animate-ping-slow absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-accent" />
                            </span>
                            System online · {year}
                        </div>
                    </div>

                    {/* Topics */}
                    <div>
                        <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 mb-4">
                            Browse Topics
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {TOPICS.map(t => (
                                <Link
                                    key={t}
                                    href={`/tags/${t.toLowerCase().replace(/\./g, "").replace(/\s+/g, "-")}`}
                                    className="px-3 py-1.5 rounded-xl bg-muted/40 border border-border/50 hover:bg-primary/10 hover:border-primary/35 font-mono text-xs font-semibold text-muted-foreground hover:text-primary transition-all duration-200"
                                >
                                    {t}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Quick links */}
                    <div>
                        <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 mb-4">
                            Quick Links
                        </p>
                        <div className="flex flex-col gap-2">
                            {PAGES.map(p => (
                                <Link
                                    key={p.label}
                                    href={p.href}
                                    className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary transition-colors duration-200 w-fit group"
                                >
                                    <span className="font-mono text-primary/40 group-hover:text-primary transition-colors text-xs">&gt;</span>
                                    {p.label}
                                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="pt-8 border-t border-border/30 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="font-mono text-xs text-muted-foreground/50">
                        © {year} TechSheet · Built by{" "}
                        <a
                            href="https://github.com/thangamariappan19"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-bold text-foreground/80 hover:text-primary transition-colors duration-200"
                        >
                            Thanga Mariappan
                        </a>
                    </p>

                    <div className="flex items-center gap-4 flex-wrap justify-center sm:justify-end">
                        <VisitorCount />
                        <button
                            onClick={() => window.dispatchEvent(new CustomEvent("open-cookie-settings"))}
                            className="font-mono text-xs text-muted-foreground/40 hover:text-muted-foreground transition-colors font-medium"
                        >
                            Cookie Settings
                        </button>
                        <p className="font-mono text-xs text-muted-foreground/40">
                            Next.js · Gemini AI · Vercel
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
