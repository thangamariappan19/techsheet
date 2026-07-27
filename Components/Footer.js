"use client";

import Link from "next/link";
import { Github, Twitter, Linkedin, Mail, Rss, Terminal, ArrowUpRight } from "lucide-react";
import VisitorCount from "./VisitorCount";

const TOPICS = ["React", "Next.js", "AI", "Architecture", "TypeScript", "DevOps"];
const PAGES = [
    { label: "All Articles", href: "/" },
    { label: "About", href: "/about" },
    { label: "RSS Feed", href: "/feed.xml" },
    { label: "Privacy Policy", href: "/privacy" },
];
const SOCIALS = [
    { icon: Twitter,  href: "https://twitter.com/iamthangam",                        label: "Twitter" },
    { icon: Github,   href: "https://github.com/thangamariappan19",                   label: "GitHub" },
    { icon: Linkedin, href: "https://www.linkedin.com/in/thanga-mariappan-p/",        label: "LinkedIn" },
    { icon: Rss,      href: "/feed.xml",                                              label: "RSS" },
    { icon: Mail,     href: "mailto:thangamariappancse@gmail.com",                    label: "Email" },
];

function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer className="w-full border-t border-border/60 bg-card/50 backdrop-blur-sm mt-12">
            <div className="container mx-auto px-6 py-14 max-w-7xl">

                {/* Top section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">

                    {/* Brand */}
                    <div className="flex flex-col gap-4">
                        <Link href="/" className="flex items-center gap-2.5 group w-fit">
                            <div className="bg-primary p-1.5 rounded-lg group-hover:scale-110 transition-transform">
                                <Terminal className="w-4 h-4 text-primary-foreground" />
                            </div>
                            <span className="font-black text-xl tracking-tight text-foreground">TechSheet</span>
                        </Link>
                        <p className="text-sm text-muted-foreground leading-relaxed max-w-[240px]">
                            Deep-dives on React, architecture, and AI — updated every morning with live news.
                        </p>
                        <div className="flex items-center gap-2 flex-wrap">
                            {SOCIALS.map(s => (
                                <a
                                    key={s.label}
                                    href={s.href}
                                    target={s.href.startsWith("http") ? "_blank" : undefined}
                                    rel="noopener noreferrer"
                                    aria-label={s.label}
                                    className="p-2 rounded-xl bg-muted/50 border border-border/50 hover:bg-primary/10 hover:border-primary/30 text-muted-foreground hover:text-primary transition-all"
                                >
                                    <s.icon className="w-4 h-4" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Topics */}
                    <div>
                        <p className="text-xs font-black uppercase tracking-[0.15em] text-muted-foreground mb-4">Browse Topics</p>
                        <div className="flex flex-wrap gap-2">
                            {TOPICS.map(t => (
                                <Link
                                    key={t}
                                    href={`/tags/${t.toLowerCase().replace(/\./g, '').replace(/\s+/g, '-')}`}
                                    className="px-3 py-1.5 rounded-xl bg-muted/50 border border-border/50 hover:bg-primary/10 hover:border-primary/30 text-xs font-bold text-muted-foreground hover:text-primary transition-all"
                                >
                                    {t}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Links */}
                    <div>
                        <p className="text-xs font-black uppercase tracking-[0.15em] text-muted-foreground mb-4">Quick Links</p>
                        <div className="flex flex-col gap-2">
                            {PAGES.map(p => (
                                <Link
                                    key={p.label}
                                    href={p.href}
                                    className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary transition-colors w-fit group"
                                >
                                    {p.label}
                                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="pt-8 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="text-xs text-muted-foreground">
                        © {year} TechSheet. Built by{" "}
                        <a
                            href="https://github.com/thangamariappan19"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-bold text-foreground hover:text-primary transition-colors"
                        >
                            Thanga Mariappan
                        </a>
                    </p>
                    <div className="flex items-center gap-4 flex-wrap justify-center sm:justify-end">
                        <VisitorCount />
                        <button
                            onClick={() => window.dispatchEvent(new CustomEvent('open-cookie-settings'))}
                            className="text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors font-medium"
                        >
                            Cookie Settings
                        </button>
                        <p className="text-xs text-muted-foreground/60 font-medium">
                            Powered by Next.js · Gemini AI · Deployed on Vercel
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
