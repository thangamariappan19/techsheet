"use client";

import Link from "next/link";
import { ArrowRight, Clock, Calendar } from "lucide-react";
import { motion } from "framer-motion";

/* Map first tag to a neon accent color */
const TAG_COLORS = {
    ai:           "hsl(142 76% 50%)",
    react:        "hsl(186 100% 50%)",
    "next.js":    "hsl(210 100% 65%)",
    nextjs:       "hsl(210 100% 65%)",
    frontend:     "hsl(186 100% 50%)",
    typescript:   "hsl(218 100% 65%)",
    devops:       "hsl(38 100% 60%)",
    architecture: "hsl(268 85% 65%)",
    news:         "hsl(38 100% 60%)",
    security:     "hsl(0 80% 60%)",
    agents:       "hsl(142 76% 50%)",
};

function getTagColor(tag = "") {
    return TAG_COLORS[tag.toLowerCase()] ?? "hsl(186 100% 50%)";
}

/* Gradient placeholder shown while / if image fails to load */
const PLACEHOLDER_GRADIENT =
    "linear-gradient(135deg, hsl(186 100% 50% / 0.12) 0%, hsl(222 42% 8% / 0.4) 50%, hsl(268 85% 65% / 0.08) 100%)";

function BlogHeader({ data, readTime, featured = false }) {
    const slug = data.slug ||
        (data.Title || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    const tags = (data.Tags || data.tags || "TECH")
        .toString().split(/[ ,]+/).filter(Boolean);

    const imageSource =
        data.HeaderImage && data.HeaderImage !== "/placeholder-tech.jpg"
            ? data.HeaderImage
            : `https://picsum.photos/seed/${slug}/1200/800`;

    const date = data.Date
        ? new Date(data.Date).toLocaleDateString("en-US", {
              month: "short", day: "numeric", year: "numeric",
          })
        : null;

    const primaryTagColor = getTagColor(tags[0]);

    /* ── Featured / hero card ─────────────────────────────────────────── */
    if (featured) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, ease: [0.22, 0.61, 0.36, 1] }}
                className="group relative w-full overflow-hidden rounded-[2rem] border border-border/50 gradient-border"
                style={{ minHeight: "500px" }}
            >
                {/* Neon glow ring on hover */}
                <div
                    className="absolute inset-0 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10"
                    style={{ boxShadow: `0 0 0 1px ${primaryTagColor}30, 0 0 80px ${primaryTagColor}10` }}
                />

                <Link href={`/blogs/${slug}`} className="block h-full">
                    {/* Background: gradient placeholder + image on top */}
                    <div
                        className="absolute inset-0"
                        style={{ background: PLACEHOLDER_GRADIENT }}
                    >
                        <img
                            src={imageSource}
                            alt=""
                            loading="eager"
                            decoding="async"
                            className="object-cover w-full h-full transition-transform duration-[1.4s] group-hover:scale-105"
                            style={{ color: "transparent" }}
                        />
                        {/* Cinematic overlays */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/96 via-black/55 to-black/10" />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent" />
                        {/* Neon accent line */}
                        <div
                            className="absolute bottom-0 left-0 right-0 h-px opacity-60 group-hover:opacity-100 transition-opacity duration-500"
                            style={{ background: `linear-gradient(90deg, transparent, ${primaryTagColor}, transparent)` }}
                        />
                    </div>

                    {/* Content */}
                    <div
                        className="relative z-10 flex flex-col justify-end h-full p-8 md:p-14"
                        style={{ minHeight: "500px" }}
                    >
                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mb-5">
                            {tags.slice(0, 3).map(tag => (
                                <span
                                    key={tag}
                                    className="px-3 py-1 rounded-full backdrop-blur-md text-[10px] font-mono font-bold uppercase tracking-[0.14em] border"
                                    style={{
                                        color: getTagColor(tag),
                                        borderColor: `${getTagColor(tag)}40`,
                                        background: `${getTagColor(tag)}18`,
                                    }}
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
                        <p className="text-white/60 text-base md:text-lg font-medium leading-relaxed mb-8 max-w-2xl line-clamp-2">
                            {data.Abstract || data.description}
                        </p>

                        {/* Meta row */}
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="flex items-center gap-5 text-sm text-white/50 font-medium">
                                <span className="font-bold text-white/85">
                                    {data.Author || "Thanga Mariappan"}
                                </span>
                                <div className="flex items-center gap-1.5 font-mono text-xs">
                                    <Clock className="w-3.5 h-3.5" />
                                    {readTime}
                                </div>
                                {date && (
                                    <div className="flex items-center gap-1.5 font-mono text-xs">
                                        <Calendar className="w-3.5 h-3.5" />
                                        {date}
                                    </div>
                                )}
                            </div>

                            <span
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl backdrop-blur-sm border text-white text-xs font-black uppercase tracking-wider transition-all duration-300"
                                style={{
                                    background: "rgba(255,255,255,0.08)",
                                    borderColor: "rgba(255,255,255,0.15)",
                                }}
                            >
                                Read Article
                                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                            </span>
                        </div>
                    </div>
                </Link>
            </motion.div>
        );
    }

    /* ── Regular card ─────────────────────────────────────────────────── */
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.4, ease: [0.22, 0.61, 0.36, 1] }}
            whileHover={{ y: -5 }}
            className="group relative flex flex-col h-full overflow-hidden rounded-[1.5rem] border border-border/50 bg-card card-neon gradient-border shadow-sm transition-shadow duration-300"
        >
            <Link href={`/blogs/${slug}`} className="flex flex-col h-full">

                {/* Image — gradient background shows while / if image fails */}
                <div
                    className="relative aspect-[16/9] overflow-hidden"
                    style={{ background: PLACEHOLDER_GRADIENT }}
                >
                    <img
                        src={imageSource}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className="absolute inset-0 object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
                        style={{ color: "transparent" }}
                    />

                    {/* Gradient fade at bottom */}
                    <div className="absolute inset-0 bg-gradient-to-t from-card/70 via-transparent to-transparent" />

                    {/* Neon accent line on hover */}
                    <div
                        className="absolute bottom-0 left-0 right-0 h-px opacity-0 group-hover:opacity-70 transition-opacity duration-500"
                        style={{ background: `linear-gradient(90deg, transparent, ${primaryTagColor}, transparent)` }}
                    />

                    {/* Tags */}
                    <div className="absolute top-3 left-3 flex gap-1.5 z-10">
                        {tags.slice(0, 2).map(tag => (
                            <span
                                key={tag}
                                className="px-2.5 py-1 rounded-lg backdrop-blur-md text-[9px] font-mono font-bold uppercase tracking-wider border"
                                style={{
                                    color: getTagColor(tag),
                                    borderColor: `${getTagColor(tag)}35`,
                                    background: "rgba(0,0,0,0.65)",
                                }}
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Card content */}
                <div className="flex flex-col flex-grow p-5">

                    <h3 className="text-base font-black leading-snug tracking-tight text-foreground group-hover:text-primary transition-colors duration-200 mb-2.5 line-clamp-2">
                        {data.Title || data.title}
                    </h3>

                    <p className="text-sm text-muted-foreground font-medium leading-relaxed mb-5 line-clamp-2 flex-grow">
                        {data.Abstract || data.description}
                    </p>

                    {/* Footer meta */}
                    <div className="flex items-center justify-between pt-4 border-t border-border/40">
                        <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                            <div
                                className="w-6 h-6 rounded-lg flex items-center justify-center font-black text-[10px] font-mono border"
                                style={{
                                    background: `${primaryTagColor}15`,
                                    borderColor: `${primaryTagColor}30`,
                                    color: primaryTagColor,
                                }}
                            >
                                {(data.Author || "T").charAt(0)}
                            </div>
                            <span className="font-bold text-foreground/75 truncate max-w-[70px]">
                                {(data.Author || "Thanga").split(" ")[0]}
                            </span>
                            <span className="text-border/80">·</span>
                            <div className="flex items-center gap-1 font-mono">
                                <Clock className="w-3 h-3" />
                                {readTime}
                            </div>
                        </div>

                        <div className="opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                            <ArrowRight
                                className="w-4 h-4 transition-colors duration-200"
                                style={{ color: primaryTagColor }}
                            />
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}

export default BlogHeader;
