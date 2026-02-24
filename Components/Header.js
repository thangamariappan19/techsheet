"use client";

import { motion } from "framer-motion";

function Header() {
  return (
    <div className="relative pt-12 pb-8 px-6 mx-auto max-w-7xl overflow-hidden">
      <div className="relative z-10 w-full mx-auto text-center flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center gap-6"
        >
          <span className="px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-bold tracking-wider uppercase border border-primary/20">
            TechSheet v2.0
          </span>

          <h1 className="text-5xl font-black leading-tight tracking-tight text-foreground md:text-7xl lg:text-8xl">
            <span className="inline-block hover:scale-105 transition-transform duration-300">Plan.</span>{" "}
            <span className="block py-2 text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-indigo-500 animate-gradient-x lg:inline hover:scale-105 transition-transform duration-300">
              Learn.
            </span>{" "}
            <span className="inline-block hover:scale-105 transition-transform duration-300">Share.</span>
          </h1>

          <p className="max-w-2xl text-lg text-muted-foreground md:text-xl leading-relaxed">
            Ultimate techsheets for modern software engineering.
            Everything you need to master languages, frameworks, and tools in a single, beautiful page.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 mt-4">
            {["React", "Next.js", "Tailwind", "JavaScript", "HTML5"].map((tech) => (
              <span key={tech} className="px-3 py-1 rounded-md bg-secondary text-secondary-foreground text-xs font-semibold border border-border">
                {tech}
              </span>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Hero background blur blobs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full -z-10 pointer-events-none">
        <div className="absolute top-0 right-0 w-72 h-72 bg-primary/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-500/20 rounded-full blur-[120px]" />
      </div>
    </div>
  );
}

export default Header;
