"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import Link from "next/link";
import {
  Terminal,
  Sun,
  Moon,
  Github,
  Info,
  Menu,
  X,
  Zap,
} from "lucide-react";
import { auth } from "../Firebase/Firebase";
import Alert from "./Alert";
import { motion, AnimatePresence } from "framer-motion";

function Navbar() {
  const [isMounted, setIsMounted] = useState(false);
  const [user, setUser] = useState(null);
  const { theme, setTheme } = useTheme();
  const [viewAlert, setViewAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) setUser(storedUser);

    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggleTheme = () => {
    if (isMounted) setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <>
      <Alert show={viewAlert} type="success" message={alertMessage} />

      <nav
        className={`fixed top-0 left-0 right-0 z-50 glass transition-all duration-300 ${
          scrolled ? "border-b" : "border-b border-transparent"
        }`}
      >
        {/* Gradient top line */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="flex h-14 items-center justify-between">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="relative">
                <div className="absolute inset-0 rounded-lg bg-primary/20 blur-md group-hover:bg-primary/35 transition-all duration-300" />
                <div className="relative p-1.5 rounded-lg border border-primary/30 bg-primary/10 group-hover:border-primary/60 transition-all duration-300">
                  <Terminal className="w-4 h-4 text-primary" />
                </div>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-black text-lg tracking-tight text-foreground group-hover:text-primary transition-colors duration-300">
                  TechSheet
                </span>
                {/* Live indicator */}
                <span className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-accent/15 border border-accent/25 text-accent font-mono text-[9px] font-bold uppercase tracking-widest">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping-slow absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-accent" />
                  </span>
                  live
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              <Link
                href="/about"
                className="group flex items-center gap-1.5 px-4 py-2 rounded-lg text-muted-foreground hover:text-foreground transition-all duration-200 relative"
              >
                <Info className="w-3.5 h-3.5" />
                <span className="text-sm font-semibold">About</span>
                <span className="absolute bottom-0.5 left-4 right-4 h-px bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              </Link>

              <a
                href="https://github.com/thangamariappan19"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200"
                aria-label="GitHub"
              >
                <Github className="w-4.5 h-4.5" />
              </a>

              <div className="h-5 w-px bg-border mx-1" />

              <button
                onClick={toggleTheme}
                className="relative p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200"
                aria-label="Toggle theme"
              >
                <AnimatePresence mode="wait" initial={false}>
                  {isMounted && theme === "dark" ? (
                    <motion.div
                      key="sun"
                      initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                      animate={{ rotate: 0,   opacity: 1, scale: 1 }}
                      exit={{    rotate:  90, opacity: 0, scale: 0.5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Sun className="w-4.5 h-4.5 text-amber-400" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="moon"
                      initial={{ rotate:  90, opacity: 0, scale: 0.5 }}
                      animate={{ rotate: 0,   opacity: 1, scale: 1 }}
                      exit={{    rotate: -90, opacity: 0, scale: 0.5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Moon className="w-4.5 h-4.5" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </div>

            {/* Mobile controls */}
            <div className="md:hidden flex items-center gap-1.5">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-all"
                aria-label="Toggle theme"
              >
                {isMounted && theme === "dark"
                  ? <Sun className="w-4 h-4 text-amber-400" />
                  : <Moon className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-all"
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{    opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl"
            >
              <div className="container mx-auto px-4 py-4 flex flex-col gap-1">
                <Link
                  href="/about"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-all"
                >
                  <Info className="w-4 h-4 text-primary" />
                  <span className="font-semibold text-sm">About</span>
                </Link>
                <a
                  href="https://github.com/thangamariappan19"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-all"
                >
                  <Github className="w-4 h-4 text-primary" />
                  <span className="font-semibold text-sm">GitHub</span>
                </a>
                <div className="h-px bg-border/50 my-1" />
                <div className="flex items-center gap-2 px-3 py-2 text-xs font-mono text-muted-foreground">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping-slow absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-accent" />
                  </span>
                  Updated daily · Gemini AI · Next.js
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
}

export default Navbar;
