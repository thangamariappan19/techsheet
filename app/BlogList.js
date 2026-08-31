"use client";

import { useState, useMemo } from "react";
import { Search, X, SlidersHorizontal } from "lucide-react";
import BlogHeader from "../Components/BlogHeader";
import AdUnit from "../Components/AdUnit";

const FILTERS = ["All", "React", "AI", "Architecture", "TypeScript", "Next.js", "DevOps"];

export default function BlogList({ initialBlogs }) {
    const [searchQuery, setSearchQuery]   = useState("");
    const [activeFilter, setActiveFilter] = useState("All");
    const [visibleCount, setVisibleCount] = useState(7);

    const sorted = useMemo(
        () => [...initialBlogs].sort((a, b) =>
            new Date(b.data.Date || 0) - new Date(a.data.Date || 0)),
        [initialBlogs]
    );

    const filtered = useMemo(() =>
        sorted.filter(blog => {
            if (!blog.data.isPublished) return false;
            const text = `${blog.data.Title || ""} ${blog.data.tags || ""} ${blog.data.Tags || ""} ${blog.data.Abstract || ""}`.toLowerCase();
            const matchesSearch = !searchQuery || text.includes(searchQuery.toLowerCase());
            const matchesFilter = activeFilter === "All" || text.includes(activeFilter.toLowerCase());
            return matchesSearch && matchesFilter;
        }),
        [sorted, searchQuery, activeFilter]
    );

    const featured  = filtered[0];
    const rest      = filtered.slice(1, visibleCount);
    const hasMore   = filtered.length > visibleCount;

    return (
        <section id="articles" className="container mx-auto px-4 md:px-6 pb-24 pt-6 max-w-7xl">

            {/* ── Section header ──────────────────────────────────────── */}
            <div className="flex flex-col gap-5 mb-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">

                    <div>
                        <p className="font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-primary/70 mb-1.5">
                            {filtered.length} article{filtered.length !== 1 ? "s" : ""}
                            {activeFilter !== "All" ? ` · ${activeFilter}` : ""}
                            {searchQuery ? ` · "${searchQuery}"` : ""}
                        </p>
                        <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-foreground">
                            Latest{" "}
                            <span
                                className="text-transparent bg-clip-text"
                                style={{
                                    backgroundImage: "linear-gradient(135deg, hsl(186 100% 50%), hsl(268 85% 65%))",
                                }}
                            >
                                TechSheets
                            </span>
                        </h2>
                    </div>

                    {/* Search */}
                    <div className="relative group max-w-sm w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-200" />
                        <input
                            type="text"
                            placeholder="Search articles…"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full bg-card border border-border rounded-2xl pl-11 pr-10 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all duration-200 placeholder:text-muted-foreground/40 font-mono"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Filter pills */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-muted-foreground/50 flex-shrink-0" />
                    {FILTERS.map(f => (
                        <button
                            key={f}
                            onClick={() => setActiveFilter(f)}
                            className={`flex-shrink-0 px-4 py-1.5 rounded-xl font-mono text-[11px] font-bold uppercase tracking-wider transition-all duration-200 ${
                                activeFilter === f
                                    ? "text-primary-foreground border border-primary/50"
                                    : "bg-card border border-border text-muted-foreground hover:border-primary/30 hover:text-primary"
                            }`}
                            style={activeFilter === f ? {
                                background: "linear-gradient(135deg, hsl(186 100% 50% / 0.9), hsl(268 85% 65% / 0.85))",
                                boxShadow: "0 0 16px hsl(186 100% 50% / 0.25), 0 0 40px hsl(186 100% 50% / 0.08)",
                            } : {}}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Empty state ─────────────────────────────────────────── */}
            {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 text-center border border-dashed border-border/50 rounded-[2rem] bg-card/30">
                    <div className="font-mono text-4xl mb-4 text-primary/30">&gt;_</div>
                    <p className="text-xl font-black text-muted-foreground mb-2">
                        No results found
                    </p>
                    <p className="font-mono text-sm text-muted-foreground/50 mb-6">
                        Try a different search term or filter
                    </p>
                    <button
                        onClick={() => { setSearchQuery(""); setActiveFilter("All"); }}
                        className="px-5 py-2.5 rounded-xl text-primary-foreground text-sm font-bold transition-all"
                        style={{ background: "hsl(var(--primary))" }}
                    >
                        Clear filters
                    </button>
                </div>
            ) : (
                <div className="flex flex-col gap-6">

                    {/* Featured hero card */}
                    {featured && (
                        <BlogHeader
                            data={featured.data}
                            content={featured.content}
                            readTime={featured.readTime?.text || "5 min read"}
                            featured={true}
                        />
                    )}

                    {/* Ad */}
                    <AdUnit slot="auto" format="auto" className="rounded-2xl overflow-hidden" />

                    {/* 3-col grid */}
                    {rest.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {rest.reduce((acc, blog, index) => {
                                acc.push(
                                    <BlogHeader
                                        key={blog.data.slug}
                                        data={blog.data}
                                        content={blog.content}
                                        readTime={blog.readTime?.text || "5 min read"}
                                    />
                                );
                                if ((index + 1) % 6 === 0 && index < rest.length - 1) {
                                    acc.push(
                                        <div key={`ad-${index}`} className="col-span-full">
                                            <AdUnit slot="auto" format="auto" className="rounded-2xl overflow-hidden" />
                                        </div>
                                    );
                                }
                                return acc;
                            }, [])}
                        </div>
                    )}

                    {/* Load more */}
                    {hasMore && (
                        <div className="flex justify-center pt-6">
                            <button
                                onClick={() => setVisibleCount(c => c + 6)}
                                className="group relative flex items-center gap-3 px-8 py-4 rounded-2xl border border-border bg-card hover:border-primary/40 hover:bg-primary/5 text-sm font-black text-muted-foreground hover:text-primary transition-all duration-200 overflow-hidden"
                            >
                                {/* shimmer on hover */}
                                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                                <span className="relative">
                                    Load {Math.min(filtered.length - visibleCount, 6)} more articles
                                </span>
                                <span className="relative px-2 py-0.5 rounded-md bg-muted font-mono text-xs font-black">
                                    {filtered.length - visibleCount} left
                                </span>
                            </button>
                        </div>
                    )}
                </div>
            )}
        </section>
    );
}
