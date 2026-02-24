"use client";

import { motion } from "framer-motion";
import { Laptop, Twitter, Github, Linkedin, ExternalLink } from "lucide-react";

export default function AboutPage() {
    return (
        <div className="container mx-auto px-4 py-20 lg:py-32">
            <div className="max-w-4xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="relative"
                    >
                        <div className="aspect-square rounded-3xl overflow-hidden shadow-premium border-8 border-card rotate-3 hover:rotate-0 transition-transform duration-500">
                            <img
                                src="/about.jpg"
                                alt="Thanga"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.target.src = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000&auto=format&fit=crop";
                                }}
                            />
                        </div>
                        {/* Decorative element */}
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
                                Hi, I'm <span className="text-primary italic">Thanga</span>
                            </h1>
                            <p className="text-xl font-medium text-muted-foreground uppercase tracking-widest text-sm">
                                Front-end Developer & Tech Enthusiast
                            </p>
                        </div>

                        <p className="text-lg text-muted-foreground leading-relaxed">
                            I am a passionate Front-end Developer dedicated to building beautiful, functional, and user-centric web applications.
                            I love deep-diving into new technologies, creating simplified resources for developers, and staying ahead of the curve in the rapidly evolving tech landscape.
                        </p>

                        <div className="grid grid-cols-2 gap-4 mt-4">
                            {[
                                {
                                    label: "Portfolio",
                                    icon: Laptop,
                                    href: "https://thangamariappan.vercel.app",
                                    bg: "bg-primary text-primary-foreground"
                                },
                                {
                                    label: "Twitter",
                                    icon: Twitter,
                                    href: "https://twitter.com/iamthangam",
                                    bg: "bg-[#1DA1F2] text-white"
                                },
                                {
                                    label: "GitHub",
                                    icon: Github,
                                    href: "https://github.com/thangamariappan19",
                                    bg: "bg-zinc-800 text-white"
                                },
                                {
                                    label: "LinkedIn",
                                    icon: Linkedin,
                                    href: "https://www.linkedin.com/in/thanga-mariappan-p/",
                                    bg: "bg-[#0077b5] text-white"
                                }
                            ].map((item) => (
                                <a
                                    key={item.label}
                                    href={item.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={cn(
                                        "flex items-center justify-center gap-2 p-4 rounded-2xl font-bold transition-all hover:scale-[1.02] active:scale-95 shadow-lg",
                                        item.bg
                                    )}
                                >
                                    <item.icon className="w-5 h-5" />
                                    <span>{item.label}</span>
                                </a>
                            ))}
                        </div>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mt-24 p-8 rounded-3xl bg-muted/30 border border-border text-center"
                >
                    <h2 className="text-2xl font-bold mb-4 italic">TechSheet Mission</h2>
                    <p className="max-w-2xl mx-auto text-muted-foreground">
                        TechSheet was born out of a desire to make technical knowledge accessible and easy to digest.
                        Our mission is to provide high-quality, high-density cheatsheets that help developers master their craft without the noise.
                    </p>
                </motion.div>
            </div>
        </div>
    );
}

// Utility function copied here for simplicity since it's a standalone page
function cn(...inputs) {
    return inputs.filter(Boolean).join(" ");
}
