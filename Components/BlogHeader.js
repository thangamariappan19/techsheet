"use client";

import Link from "next/link";
import { ArrowRight, Clock, Calendar } from "lucide-react";
import { motion } from "framer-motion";

function BlogHeader({ data, readTime, featured = false }) {
    const slug = data.slug || (data.Title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const tags = (data.Tags || data.tags || "TECH")
        .toString().split(/[ ,]+/).filter(Boolean);

    const imageSource = (data.HeaderImage && data.HeaderImage !== "/placeholder-tech.jpg")
        ? data.HeaderImage
        : `https://picsum.photos/seed/${slug}/1200/800`;

    const date = data.Date
        ? new Date(data.Date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
        : null;

    // ── Featured / hero card ────────────────────────────────────────────────
    if (featured) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="group relative w-full overflow-hidden rounded-[2.5rem] border border-border/50 shadow-2xl"
                style={{ minHeight: "480px" }}
            >
                <Link href={`/blogs/${slug}`} className="block h-full">
                    {/* Background image */}
                    <div className="absolute inset-0">
                        <img
                            src={imageSource}
                            alt={data.Title}
                            className="object-cover w-full h-full transition-transform duration-[1.2s] group-hover:scale-105"
                        />
                        {/* Gradient overlay — strong at bottom */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/55 to-black/10" />
                        {/* Side vignette */}
                        <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-transparent" />
                    </div>

                    {/* Content */}
                    <div className="relative z-10 flex flex-col justify-end h-full p-8 md:p-14" style={{ minHeight: "480px" }}>
                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mb-5">
                            {tags.slice(0, 3).map(tag => (
                                <span
                                    key={tag}
                                    className="px-3 py-1 rounded-full bg-primary/80 backdrop-blur-sm text-white text-[10px] font-black uppercase tracking-[0.12em]"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>

                        {/* Title */}
                        <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-white leading-[1.05] tracking-tight mb-5 max-w-4xl">
                            {data.Title || data.title}
                        </h2>

                        {/* Description */}
                        <p className="text-white/65 text-base md:text-lg font-medium leading-relaxed mb-8 max-w-2xl line-clamp-2">
                            {data.Abstract || data.description}
                        </p>

                        {/* Meta row */}
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="flex items-center gap-5 text-sm text-white/55 font-medium">
                                <span className="font-bold text-white/80">{data.Author || "Thanga Mariappan"}</span>
                                <div className="flex items-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5" />
                                    {readTime}
                                </div>
                                {date && (
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="w-3.5 h-3.5" />
                                        {date}
                                    </div>
                                )}
                            </div>

                            <span className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15 text-white text-xs font-black uppercase tracking-wider group-hover:bg-primary group-hover:border-primary transition-all duration-300">
                                Read Article
                                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                            </span>
                        </div>
                    </div>
                </Link>
            </motion.div>
        );
    }

    // ── Regular card ────────────────────────────────────────────────────────
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.4 }}
            whileHover={{ y: -6 }}
            className="group relative flex flex-col h-full overflow-hidden rounded-[1.75rem] border border-border/50 bg-card hover:border-primary/30 shadow-sm hover:shadow-xl transition-all duration-300"
        >
            <Link href={`/blogs/${slug}`} className="flex flex-col h-full">

                {/* Image */}
                <div className="relative aspect-[16/9] overflow-hidden">
                    <img
                        src={imageSource}
                        alt={data.Title}
                        className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
                    />
                    {/* Subtle bottom fade */}
                    <div className="absolute inset-0 bg-gradient-to-t from-card/60 via-transparent to-transparent" />

                    {/* Tags */}
                    <div className="absolute top-3 left-3 flex gap-1.5">
                        {tags.slice(0, 2).map(tag => (
                            <span
                                key={tag}
                                className="px-2.5 py-1 rounded-full bg-black/65 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-wider border border-white/15"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="flex flex-col flex-grow p-6">

                    {/* Title */}
                    <h3 className="text-lg font-black leading-snug tracking-tight text-foreground group-hover:text-primary transition-colors mb-3 line-clamp-2">
                        {data.Title || data.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground font-medium leading-relaxed mb-5 line-clamp-2 flex-grow">
                        {data.Abstract || data.description}
                    </p>

                    {/* Footer meta */}
                    <div className="flex items-center justify-between pt-4 border-t border-border/40">
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <div className="w-6 h-6 rounded-lg bg-primary/15 border border-primary/20 flex items-center justify-center text-primary font-black text-[10px]">
                                {(data.Author || "T").charAt(0)}
                            </div>
                            <span className="font-bold text-foreground/80 truncate max-w-[80px]">
                                {(data.Author || "Thanga").split(" ")[0]}
                            </span>
                            <span className="text-border">·</span>
                            <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {readTime}
                            </div>
                        </div>

                        <div className="opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                            <ArrowRight className="w-4 h-4 text-primary" />
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}

export default BlogHeader;
