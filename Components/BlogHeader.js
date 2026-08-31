"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Clock, Calendar } from "lucide-react";
import { motion } from "framer-motion";

/* ── Tag colour map ─────────────────────────────────────────────────── */
const TAG_META = {
    ai:           { hsl: "hsl(186 100% 50%)", hex: "#00e5e5" },
    react:        { hsl: "hsl(191 97% 54%)",  hex: "#12d8fa" },
    "next.js":    { hsl: "hsl(210 100% 65%)", hex: "#60a5fa" },
    nextjs:       { hsl: "hsl(210 100% 65%)", hex: "#60a5fa" },
    frontend:     { hsl: "hsl(191 97% 54%)",  hex: "#12d8fa" },
    "front-end":  { hsl: "hsl(191 97% 54%)",  hex: "#12d8fa" },
    typescript:   { hsl: "hsl(218 100% 65%)", hex: "#3b82f6" },
    devops:       { hsl: "hsl(38 100% 60%)",  hex: "#f59e0b" },
    architecture: { hsl: "hsl(268 85% 65%)",  hex: "#a855f7" },
    news:         { hsl: "hsl(38 100% 60%)",  hex: "#f59e0b" },
    security:     { hsl: "hsl(0 80% 60%)",    hex: "#ef4444" },
    agents:       { hsl: "hsl(142 76% 50%)",  hex: "#22c55e" },
};

function getTagMeta(tag = "") {
    return TAG_META[tag.toLowerCase()] ?? { hsl: "hsl(186 100% 50%)", hex: "#00e5e5" };
}

/* ── SVG placeholder — neon dot-grid + radial glow, no network needed ─ */
function buildSvgPlaceholder(hex) {
    const dots = [];
    for (let col = 0; col < 20; col++) {
        for (let row = 0; row < 14; row++) {
            dots.push(
                `<circle cx="${col * 60 + 30}" cy="${row * 60 + 30}" r="1.4" fill="${hex}" opacity="0.18"/>`
            );
        }
    }
    const svg = [
        `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">`,
        `<rect width="1200" height="800" fill="#070d1a"/>`,
        `<defs>`,
        `<radialGradient id="rg" cx="50%" cy="42%" r="62%">`,
        `<stop offset="0%" stop-color="${hex}" stop-opacity="0.28"/>`,
        `<stop offset="100%" stop-color="${hex}" stop-opacity="0.03"/>`,
        `</radialGradient>`,
        `</defs>`,
        `<rect width="1200" height="800" fill="url(#rg)"/>`,
        ...dots,
        `</svg>`,
    ].join("");
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/* ── Progressive image hook ─────────────────────────────────────────── */
function useProgressiveImage(realSrc, placeholder) {
    const [src, setSrc] = useState(placeholder);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        if (!realSrc) return;
        const img = new window.Image();
        img.onload  = () => { setSrc(realSrc); setReady(true); };
        img.onerror = () => { /* keep placeholder */ };
        img.src = realSrc;
    }, [realSrc]);

    return { src, ready };
}

/* ── Card component ─────────────────────────────────────────────────── */
function BlogHeader({ data, readTime, featured = false }) {
    const slug = data.slug ||
        (data.Title || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    const tags = (data.Tags || data.tags || "TECH")
        .toString().split(/[ ,]+/).filter(Boolean);

    const realImageSrc =
        data.HeaderImage && data.HeaderImage !== "/placeholder-tech.jpg"
            ? data.HeaderImage
            : `https://picsum.photos/seed/${slug}/1200/800`;

    const date = data.Date
        ? new Date(data.Date).toLocaleDateString("en-US", {
              month: "short", day: "numeric", year: "numeric",
          })
        : null;

    const primaryMeta   = getTagMeta(tags[0]);
    const placeholderSrc = buildSvgPlaceholder(primaryMeta.hex);

    /* ── Featured / hero card ─────────────────────────────────────────── */
    if (featured) {
        return (
            <FeaturedCard
                slug={slug}
                tags={tags}
                data={data}
                readTime={readTime}
                date={date}
                realImageSrc={realImageSrc}
                placeholderSrc={placeholderSrc}
                primaryMeta={primaryMeta}
            />
        );
    }

    /* ── Regular card ─────────────────────────────────────────────────── */
    return (
        <RegularCard
            slug={slug}
            tags={tags}
            data={data}
            readTime={readTime}
            realImageSrc={realImageSrc}
            placeholderSrc={placeholderSrc}
            primaryMeta={primaryMeta}
        />
    );
}

/* ── Featured card ──────────────────────────────────────────────────── */
function FeaturedCard({ slug, tags, data, readTime, date, realImageSrc, placeholderSrc, primaryMeta }) {
    const { src: imgSrc, ready } = useProgressiveImage(realImageSrc, placeholderSrc);

    return (
        <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 0.61, 0.36, 1] }}
            className="group relative w-full overflow-hidden rounded-[2rem] border border-border/50 gradient-border"
            style={{ minHeight: "500px" }}
        >
            {/* Neon hover ring */}
            <div
                className="absolute inset-0 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10"
                style={{ boxShadow: `0 0 0 1px ${primaryMeta.hex}30, 0 0 80px ${primaryMeta.hex}10` }}
            />

            <Link href={`/blogs/${slug}`} className="block h-full">
                {/* Image */}
                <div className="absolute inset-0">
                    <img
                        src={imgSrc}
                        alt=""
                        className={`w-full h-full object-cover transition-all duration-[1.4s] group-hover:scale-105 ${
                            ready ? "opacity-100" : "opacity-90"
                        }`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/96 via-black/55 to-black/10" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent" />
                    <div
                        className="absolute bottom-0 left-0 right-0 h-px opacity-60 group-hover:opacity-100 transition-opacity duration-500"
                        style={{ background: `linear-gradient(90deg, transparent, ${primaryMeta.hex}, transparent)` }}
                    />
                </div>

                {/* Content */}
                <div
                    className="relative z-10 flex flex-col justify-end h-full p-8 md:p-14"
                    style={{ minHeight: "500px" }}
                >
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-5">
                        {tags.slice(0, 3).map(tag => {
                            const m = getTagMeta(tag);
                            return (
                                <span
                                    key={tag}
                                    className="px-3 py-1 rounded-full backdrop-blur-md text-[10px] font-mono font-bold uppercase tracking-[0.14em] border"
                                    style={{
                                        color: m.hex,
                                        borderColor: `${m.hex}40`,
                                        background: `${m.hex}18`,
                                    }}
                                >
                                    {tag}
                                </span>
                            );
                        })}
                    </div>

                    <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-white leading-[1.05] tracking-tight mb-5 max-w-4xl">
                        {data.Title || data.title}
                    </h2>

                    <p className="text-white/60 text-base md:text-lg font-medium leading-relaxed mb-8 max-w-2xl line-clamp-2">
                        {data.Abstract || data.description}
                    </p>

                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-5 text-sm text-white/50 font-medium">
                            <span className="font-bold text-white/85">{data.Author || "Thanga Mariappan"}</span>
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
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl backdrop-blur-sm border text-white text-xs font-black uppercase tracking-wider"
                            style={{ background: "rgba(255,255,255,0.08)", borderColor: "rgba(255,255,255,0.15)" }}
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

/* ── Regular card ───────────────────────────────────────────────────── */
function RegularCard({ slug, tags, data, readTime, realImageSrc, placeholderSrc, primaryMeta }) {
    const { src: imgSrc, ready } = useProgressiveImage(realImageSrc, placeholderSrc);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.4, ease: [0.22, 0.61, 0.36, 1] }}
            whileHover={{ y: -5 }}
            className="group relative flex flex-col h-full overflow-hidden rounded-[1.5rem] border border-border/50 bg-card card-neon gradient-border shadow-sm"
        >
            <Link href={`/blogs/${slug}`} className="flex flex-col h-full">

                {/* Image area */}
                <div className="relative aspect-[16/9] overflow-hidden">
                    <img
                        src={imgSrc}
                        alt=""
                        className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${
                            ready ? "opacity-100" : "opacity-95"
                        }`}
                    />

                    {/* Bottom fade */}
                    <div className="absolute inset-0 bg-gradient-to-t from-card/60 via-transparent to-transparent" />

                    {/* Hover neon line */}
                    <div
                        className="absolute bottom-0 left-0 right-0 h-px opacity-0 group-hover:opacity-70 transition-opacity duration-500 z-10"
                        style={{ background: `linear-gradient(90deg, transparent, ${primaryMeta.hex}, transparent)` }}
                    />

                    {/* Tag pills */}
                    <div className="absolute top-3 left-3 flex gap-1.5 z-10">
                        {tags.slice(0, 2).map(tag => {
                            const m = getTagMeta(tag);
                            return (
                                <span
                                    key={tag}
                                    className="px-2.5 py-1 rounded-lg backdrop-blur-md text-[9px] font-mono font-bold uppercase tracking-wider border"
                                    style={{
                                        color: m.hex,
                                        borderColor: `${m.hex}35`,
                                        background: "rgba(0,0,0,0.65)",
                                    }}
                                >
                                    {tag}
                                </span>
                            );
                        })}
                    </div>
                </div>

                {/* Text content */}
                <div className="flex flex-col flex-grow p-5">
                    <h3 className="text-base font-black leading-snug tracking-tight text-foreground group-hover:text-primary transition-colors duration-200 mb-2.5 line-clamp-2">
                        {data.Title || data.title}
                    </h3>
                    <p className="text-sm text-muted-foreground font-medium leading-relaxed mb-5 line-clamp-2 flex-grow">
                        {data.Abstract || data.description}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-border/40">
                        <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                            <div
                                className="w-6 h-6 rounded-lg flex items-center justify-center font-black text-[10px] font-mono border"
                                style={{
                                    background: `${primaryMeta.hex}15`,
                                    borderColor: `${primaryMeta.hex}30`,
                                    color: primaryMeta.hex,
                                }}
                            >
                                {(data.Author || "T").charAt(0)}
                            </div>
                            <span className="font-bold text-foreground/75 truncate max-w-[70px]">
                                {(data.Author || "Thanga").split(" ")[0]}
                            </span>
                            <span className="opacity-40">·</span>
                            <div className="flex items-center gap-1 font-mono">
                                <Clock className="w-3 h-3" />
                                {readTime}
                            </div>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                            <ArrowRight className="w-4 h-4" style={{ color: primaryMeta.hex }} />
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}

export default BlogHeader;
