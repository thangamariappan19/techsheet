"use client";

import { useState, useMemo } from "react";
import { Search, X, SlidersHorizontal } from "lucide-react";
import BlogHeader from "../Components/BlogHeader";

const FILTERS = ["All", "React", "AI", "Architecture", "TypeScript", "Next.js", "DevOps"];

export default function BlogList({ initialBlogs }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState("All");
    const [visibleCount, setVisibleCount] = useState(7);

    const sorted = useMemo(() =>
        [...initialBlogs].sort((a, b) => new Date(b.data.Date || 0) - new Date(a.data.Date || 0)),
        [initialBlogs]
    );

    const filtered = useMemo(() => sorted.filter(blog => {
        if (!blog.data.isPublished) return false;
        const text = `${blog.data.Title || ""} ${blog.data.tags || ""} ${blog.data.Tags || ""} ${blog.data.Abstract || ""}`.toLowerCase();
        const matchesSearch = !searchQuery || text.includes(searchQuery.toLowerCase());
        const matchesFilter = activeFilter === "All" || text.includes(activeFilter.toLowerCase());
        return matchesSearch && matchesFilter;
    }), [sorted, searchQuery, activeFilter]);

    const featured = filtered[0];
    const rest = filtered.slice(1, visibleCount);
    const hasMore = filtered.length > visibleCount;

    return (
        <section id="articles" className="container mx-auto px-4 md:px-6 pb-24 pt-6 max-w-7xl">

            {/* Section header */}
            <div className="flex flex-col gap-6 mb-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                    <div>
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-primary/70 mb-1">
                            {filtered.length} article{filtered.length !== 1 ? "s" : ""}
                            {activeFilter !== "All" ? ` in ${activeFilter}` : ""}
                            {searchQuery ? ` matching "${searchQuery}"` : ""}
                        </p>
                        <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-foreground">
                            Latest{" "}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500">
                                TechSheets
                            </span>
                        </h2>
                    </div>

                    {/* Search */}
                    <div className="relative group max-w-sm w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Search articles…"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full bg-card border border-border rounded-2xl pl-11 pr-10 py-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary/50 transition-all placeholder:text-muted-foreground/50"
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

                {/* Category filters */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                    {FILTERS.map(f => (
                        <button
                            key={f}
                            onClick={() => setActiveFilter(f)}
                            className={`flex-shrink-0 px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                                activeFilter === f
                                    ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25"
                                    : "bg-card border border-border text-muted-foreground hover:border-primary/30 hover:text-primary"
                            }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 text-center border border-dashed border-border/50 rounded-[2rem] bg-card/30">
                    <p className="text-2xl font-black text-muted-foreground mb-2">No results found</p>
                    <p className="text-sm text-muted-foreground/60 mb-6">Try a different search term or filter</p>
                    <button
                        onClick={() => { setSearchQuery(""); setActiveFilter("All"); }}
                        className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 transition-all"
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

                    {/* Rest of posts — 3-column grid */}
                    {rest.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {rest.map(blog => (
                                <BlogHeader
                                    key={blog.data.slug}
                                    data={blog.data}
                                    content={blog.content}
                                    readTime={blog.readTime?.text || "5 min read"}
                                />
                            ))}
                        </div>
                    )}

                    {/* Load more */}
                    {hasMore && (
                        <div className="flex justify-center pt-6">
                            <button
                                onClick={() => setVisibleCount(c => c + 6)}
                                className="group flex items-center gap-3 px-8 py-4 rounded-2xl border border-border bg-card hover:border-primary/40 hover:bg-primary/5 text-sm font-black text-muted-foreground hover:text-primary transition-all"
                            >
                                Load {Math.min(filtered.length - visibleCount, 6)} more articles
                                <span className="px-2 py-0.5 rounded-md bg-muted text-xs font-black">
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
