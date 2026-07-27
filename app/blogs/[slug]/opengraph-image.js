import { ImageResponse } from "next/og";
import { getBlogPostBySlug } from "../../../Lib/Data";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "TechSheet blog post by Thanga Mariappan Pandian";

export default async function Image({ params }) {
    const { slug } = await params;
    const post = await getBlogPostBySlug(slug);

    const title = post?.data?.Title || post?.data?.title || "TechSheet";
    const description = (post?.data?.Abstract || post?.data?.description || "").slice(0, 120);
    const tags = Array.isArray(post?.data?.tags)
        ? post.data.tags.slice(0, 3)
        : (post?.data?.Tags || "").split(/[ ,]+/).filter(Boolean).slice(0, 3);
    const readTime = post?.readTime?.text || "5 min read";

    return new ImageResponse(
        (
            <div
                style={{
                    width: "1200px",
                    height: "630px",
                    background: "linear-gradient(135deg, #030712 0%, #0f0f1a 50%, #0a0a14 100%)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    padding: "60px 72px",
                    fontFamily: "sans-serif",
                    position: "relative",
                    overflow: "hidden",
                }}
            >
                {/* Background glow */}
                <div
                    style={{
                        position: "absolute",
                        top: "-120px",
                        right: "-120px",
                        width: "480px",
                        height: "480px",
                        borderRadius: "50%",
                        background: "radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)",
                    }}
                />
                <div
                    style={{
                        position: "absolute",
                        bottom: "-80px",
                        left: "-80px",
                        width: "360px",
                        height: "360px",
                        borderRadius: "50%",
                        background: "radial-gradient(circle, rgba(168,85,247,0.2) 0%, transparent 70%)",
                    }}
                />

                {/* Top: logo + read time */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div
                            style={{
                                width: "40px",
                                height: "40px",
                                borderRadius: "10px",
                                background: "rgb(99,102,241)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <span style={{ color: "white", fontWeight: "900", fontSize: "18px" }}>&gt;_</span>
                        </div>
                        <span style={{ color: "white", fontWeight: "900", fontSize: "22px", letterSpacing: "-0.5px" }}>
                            TechSheet
                        </span>
                    </div>
                    <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "14px", fontWeight: "700" }}>
                        {readTime}
                    </span>
                </div>

                {/* Middle: tags + title + description */}
                <div style={{ display: "flex", flexDirection: "column", gap: "20px", flex: 1, justifyContent: "center" }}>
                    {tags.length > 0 && (
                        <div style={{ display: "flex", gap: "10px" }}>
                            {tags.map(tag => (
                                <span
                                    key={tag}
                                    style={{
                                        padding: "6px 14px",
                                        borderRadius: "999px",
                                        background: "rgba(99,102,241,0.15)",
                                        border: "1px solid rgba(99,102,241,0.35)",
                                        color: "rgb(129,140,248)",
                                        fontSize: "11px",
                                        fontWeight: "900",
                                        textTransform: "uppercase",
                                        letterSpacing: "0.1em",
                                    }}
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}

                    <h1
                        style={{
                            color: "white",
                            fontSize: title.length > 60 ? "40px" : "52px",
                            fontWeight: "900",
                            lineHeight: 1.1,
                            letterSpacing: "-1.5px",
                            margin: 0,
                        }}
                    >
                        {title}
                    </h1>

                    {description && (
                        <p
                            style={{
                                color: "rgba(255,255,255,0.55)",
                                fontSize: "18px",
                                lineHeight: 1.5,
                                margin: 0,
                                fontWeight: "500",
                            }}
                        >
                            {description}
                        </p>
                    )}
                </div>

                {/* Bottom: author */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div
                        style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "10px",
                            background: "linear-gradient(135deg, rgba(99,102,241,0.3), rgba(168,85,247,0.3))",
                            border: "1px solid rgba(99,102,241,0.3)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "rgb(129,140,248)",
                            fontWeight: "900",
                            fontSize: "16px",
                        }}
                    >
                        T
                    </div>
                    <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "14px", fontWeight: "700" }}>
                        Thanga Mariappan Pandian · techsheet.vercel.app
                    </span>
                </div>
            </div>
        ),
        { ...size }
    );
}
