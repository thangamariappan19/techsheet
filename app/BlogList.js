"use client";

import { useState } from "react";
import { Search, Sparkles } from "lucide-react";
import BlogHeader from "../Components/BlogHeader";

export default function BlogList({ initialBlogs }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(6);

  // Sort blogs by date descending (assuming data.Date is YYYY-MM-DD)
  const sortedBlogs = [...initialBlogs].sort((a, b) => {
    return new Date(b.data.Date || 0) - new Date(a.data.Date || 0);
  });

  const filteredBlogs = sortedBlogs.filter((blog) =>
    blog.data.isPublished && (
      (blog.data.Title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (blog.data.tags || "").toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const displayedBlogs = filteredBlogs.slice(0, visibleCount);

  return (
    <section className="container mx-auto px-6 py-24 md:py-32">
      <div className="flex flex-col gap-16">
        {/* Header & Filter Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 text-primary">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-sm font-black uppercase tracking-[0.2em] text-primary/80">
                Premium Content
              </span>
            </div>
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-foreground max-w-xl">
              Latest{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">
                TechSheets
              </span>
            </h2>
          </div>

          <div className="relative group max-w-md w-full">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Search blueprints, guides, tactics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-card/30 backdrop-blur-md border border-border/50 rounded-2xl pl-14 pr-6 py-5 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-premium"
            />
          </div>
        </div>

        {/* Grid Layout */}
        {displayedBlogs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {displayedBlogs.map((blog) => (
              <BlogHeader
                key={blog.data.slug}
                data={blog.data}
                content={blog.content}
                readTime={blog.readTime?.text || "5 min read"}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-center border border-dashed border-border/50 rounded-[3rem] bg-card/10">
            <p className="text-xl font-black text-muted-foreground">
              No matching TechSheets found.
            </p>
            <button
              onClick={() => setSearchQuery("")}
              className="mt-4 text-primary font-bold hover:underline"
            >
              Clear search
            </button>
          </div>
        )}

        {/* Pagination / Load More */}
        {filteredBlogs.length > visibleCount && (
          <div className="flex justify-center mt-12">
            <button
              onClick={() => setVisibleCount((prev) => prev + 6)}
              className="group relative px-10 py-5 bg-foreground text-background rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all shadow-2xl overflow-hidden"
            >
              <span className="relative z-10">Load More Blueprints</span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
