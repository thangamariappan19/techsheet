"use client";

import { motion } from "framer-motion";
import { Laptop, Twitter, Github, Linkedin, Code2, Layers, Cpu, GitBranch } from "lucide-react";

const LINKS = [
    { label: "Portfolio",  icon: Laptop,   href: "https://thangamariappan.vercel.app",             bg: "bg-primary text-primary-foreground" },
    { label: "Twitter",    icon: Twitter,  href: "https://twitter.com/iamthangam",                  bg: "bg-[#1DA1F2] text-white" },
    { label: "GitHub",     icon: Github,   href: "https://github.com/thangamariappan19",             bg: "bg-zinc-800 text-white" },
    { label: "LinkedIn",   icon: Linkedin, href: "https://www.linkedin.com/in/thanga-mariappan-p/", bg: "bg-[#0077b5] text-white" },
];

const EXPERTISE = [
    {
        icon: Layers,
        title: "Frontend Architecture",
        desc: "Designed component systems and micro-frontend architectures used by thousands of users. Deep experience in React 18+, Next.js App Router, and TypeScript at scale.",
    },
    {
        icon: Cpu,
        title: "Performance Engineering",
        desc: "Achieved sub-second LCP on production apps serving millions of page views. Tools of choice: Lighthouse CI, WebPageTest, and Chrome DevTools profiling.",
    },
    {
        icon: Code2,
        title: "Developer Tooling",
        desc: "Built custom ESLint rules, Webpack plugins, and internal CLI tools to enforce architectural boundaries across large monorepos with 50+ engineers.",
    },
    {
        icon: GitBranch,
        title: "Engineering Leadership",
        desc: "Led technical reviews, mentored junior developers, and defined coding standards and architecture guidelines for cross-functional teams.",
    },
];

const STACK = [
    "React 18+", "Next.js", "TypeScript", "Tailwind CSS",
    "Zustand", "TanStack Query", "Node.js", "GraphQL",
    "Vercel", "AWS", "Docker", "GitHub Actions",
];

export default function AboutContent() {
    return (
        <div className="container mx-auto px-4 py-20 lg:py-32">
            <div className="max-w-4xl mx-auto">

                {/* Hero */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="relative"
                    >
                        <div className="aspect-square rounded-3xl overflow-hidden shadow-premium border-8 border-card rotate-3 hover:rotate-0 transition-transform duration-500">
                            <img
                                src="/about.jpg"
                                alt="Thanga Mariappan Pandian — Senior Front-End Architect"
                                width={600}
                                height={600}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.target.src = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000&auto=format&fit=crop";
                                }}
                            />
                        </div>
                        <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-primary/20 rounded-full blur-3xl -z-10" />
                        <div className="absolute -top-6 -left-6 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl -z-10" />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex flex-col gap-6"
                    >
                        <div className="flex flex-col gap-2">
                            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
                                Hi, I&apos;m <span className="text-primary italic">Thanga</span>
                            </h1>
                            <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">
                                Senior Front-End Architect · 10+ Years Experience
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 text-muted-foreground leading-relaxed">
                            <p>
                                I&apos;m a Senior Front-End Architect at{" "}
                                <span className="text-foreground font-semibold">Accenture</span>, where I design and lead
                                the frontend architecture for enterprise-scale web platforms. My day-to-day involves
                                setting architectural standards, running performance audits, and making the hard tradeoffs
                                that keep large codebases maintainable as teams grow.
                            </p>
                            <p>
                                I started this blog because I kept seeing the same mistakes repeated — not because developers
                                were careless, but because the hard lessons from production systems rarely get written down.
                                Every post here comes from something I&apos;ve actually built, broken, or debugged at work.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-2">
                            {LINKS.map((item) => (
                                <a
                                    key={item.label}
                                    href={item.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`flex items-center justify-center gap-2 p-4 rounded-2xl font-bold transition-all hover:scale-[1.02] active:scale-95 shadow-lg ${item.bg}`}
                                >
                                    <item.icon className="w-5 h-5" />
                                    <span>{item.label}</span>
                                </a>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Expertise */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-24"
                >
                    <h2 className="text-2xl font-bold mb-8 text-foreground">What I Work On</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {EXPERTISE.map((item) => (
                            <div
                                key={item.title}
                                className="rounded-2xl border border-border bg-card p-6 flex flex-col gap-3 hover:border-primary/30 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                                        <item.icon className="w-4 h-4 text-primary" />
                                    </div>
                                    <h3 className="font-bold text-foreground">{item.title}</h3>
                                </div>
                                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Stack */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mt-16"
                >
                    <h2 className="text-2xl font-bold mb-6 text-foreground">My Stack</h2>
                    <div className="flex flex-wrap gap-2">
                        {STACK.map((tech) => (
                            <span
                                key={tech}
                                className="px-3 py-1.5 rounded-full border border-border bg-muted/40 text-sm font-mono font-medium text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors"
                            >
                                {tech}
                            </span>
                        ))}
                    </div>
                </motion.div>

                {/* About this blog */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-16 p-8 rounded-3xl bg-muted/30 border border-border"
                >
                    <h2 className="text-xl font-bold mb-4 text-foreground">About TechSheet</h2>
                    <div className="flex flex-col gap-3 text-muted-foreground leading-relaxed text-sm">
                        <p>
                            TechSheet covers frontend architecture, React patterns, web performance, and the practical
                            side of AI tooling for developers — topics I write about because they come up in code reviews
                            and architecture discussions every week.
                        </p>
                        <p>
                            The name comes from cheat sheets — dense, high-signal references. That&apos;s the standard
                            I hold every post to: if you can get the same information faster elsewhere, I haven&apos;t
                            done my job.
                        </p>
                        <p>
                            Have a question, a topic you&apos;d like covered, or spotted something wrong in a post?
                            Reach me at{" "}
                            <a
                                href="mailto:thangamariappancse@gmail.com"
                                className="text-primary underline underline-offset-2 hover:no-underline"
                            >
                                thangamariappancse@gmail.com
                            </a>
                            .
                        </p>
                    </div>
                </motion.div>

            </div>
        </div>
    );
}
