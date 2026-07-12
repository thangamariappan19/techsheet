"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Send, Bot, User, Loader2 } from "lucide-react";

const SUGGESTED = [
    "What is INP and how do I optimize it?",
    "Explain React Server Components",
    "What is micro-frontend architecture?",
    "Latest AI news this week",
];

export default function ChatWidget() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            role: "assistant",
            content: "Hey! I'm TechSheet AI. Ask me anything about the articles here — React, architecture, AI news, performance, you name it. 🚀",
        },
    ]);
    const [input, setInput] = useState("");
    const [streaming, setStreaming] = useState(false);
    const bottomRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        if (open) setTimeout(() => inputRef.current?.focus(), 150);
    }, [open]);

    const send = async (text) => {
        const msg = (text ?? input).trim();
        if (!msg || streaming) return;
        setInput("");

        const userMsg = { role: "user", content: msg };
        const history = [...messages, userMsg];
        setMessages(history);
        setStreaming(true);

        // Add empty assistant message we'll stream into
        setMessages(prev => [...prev, { role: "assistant", content: "" }]);

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: msg,
                    history: history.slice(-8).map(m => ({ role: m.role, content: m.content })),
                }),
            });

            if (!res.ok) throw new Error("Request failed");

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let accumulated = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                accumulated += decoder.decode(value, { stream: true });
                setMessages(prev => [
                    ...prev.slice(0, -1),
                    { role: "assistant", content: accumulated },
                ]);
            }
        } catch {
            setMessages(prev => [
                ...prev.slice(0, -1),
                { role: "assistant", content: "Sorry, something went wrong. Please try again." },
            ]);
        } finally {
            setStreaming(false);
        }
    };

    return (
        <>
            {/* Floating button */}
            <motion.button
                onClick={() => setOpen(o => !o)}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-primary text-primary-foreground font-black text-sm shadow-premium-hover"
                aria-label="Open AI chat"
            >
                <Sparkles className="w-4 h-4" />
                Ask AI
            </motion.button>

            {/* Chat panel */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: 24, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 24, scale: 0.96 }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        className="fixed bottom-24 right-6 z-50 w-[22rem] sm:w-[26rem] h-[520px] flex flex-col glass rounded-[2rem] border border-border/50 shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-border/50 bg-card/60">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary/30 to-purple-500/30 border border-primary/20 flex items-center justify-center">
                                    <Sparkles className="w-4 h-4 text-primary" />
                                </div>
                                <div>
                                    <p className="font-black text-sm text-foreground">TechSheet AI</p>
                                    <p className="text-[10px] text-muted-foreground font-medium">
                                        {streaming ? "Thinking…" : "Online · Ask anything"}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setOpen(false)}
                                className="p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-thin">
                            {messages.map((msg, i) => (
                                <div
                                    key={i}
                                    className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                                >
                                    <div className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                        msg.role === "user"
                                            ? "bg-primary/20 border border-primary/30"
                                            : "bg-purple-500/20 border border-purple-500/30"
                                    }`}>
                                        {msg.role === "user"
                                            ? <User className="w-3.5 h-3.5 text-primary" />
                                            : <Bot className="w-3.5 h-3.5 text-purple-400" />
                                        }
                                    </div>
                                    <div className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                                        msg.role === "user"
                                            ? "bg-primary text-primary-foreground rounded-tr-sm font-medium"
                                            : "bg-muted/60 text-foreground rounded-tl-sm"
                                    }`}>
                                        {msg.content || (
                                            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                                        )}
                                    </div>
                                </div>
                            ))}

                            {/* Suggested prompts when only the welcome message is shown */}
                            {messages.length === 1 && (
                                <div className="flex flex-col gap-2 pt-1">
                                    {SUGGESTED.map(s => (
                                        <button
                                            key={s}
                                            onClick={() => send(s)}
                                            className="text-left text-xs px-3.5 py-2.5 rounded-xl border border-border/60 bg-card/40 hover:border-primary/40 hover:bg-primary/5 text-muted-foreground hover:text-foreground transition-all font-medium"
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            )}

                            <div ref={bottomRef} />
                        </div>

                        {/* Input */}
                        <div className="px-4 py-3 border-t border-border/50 bg-card/40">
                            <form
                                onSubmit={e => { e.preventDefault(); send(); }}
                                className="flex items-center gap-2"
                            >
                                <input
                                    ref={inputRef}
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    placeholder="Ask about any tech topic…"
                                    disabled={streaming}
                                    className="flex-1 bg-background/60 border border-border/50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-50 placeholder:text-muted-foreground/60"
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim() || streaming}
                                    className="p-2.5 rounded-xl bg-primary text-primary-foreground hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    {streaming
                                        ? <Loader2 className="w-4 h-4 animate-spin" />
                                        : <Send className="w-4 h-4" />
                                    }
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
