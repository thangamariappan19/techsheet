import { getAllBlogPosts } from "../../../Lib/Data";
import BlogHeader from "../../../Components/BlogHeader";
import Link from "next/link";
import { Tag, ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
    const posts = await getAllBlogPosts();
    const tagSet = new Set();
    posts.forEach(p => {
        const tags = Array.isArray(p.data.tags)
            ? p.data.tags
            : (p.data.Tags || "").split(/[ ,]+/).filter(Boolean);
        tags.forEach(t => tagSet.add(t.toLowerCase().trim()));
    });
    return [...tagSet].map(tag => ({ tag: encodeURIComponent(tag) }));
}

export async function generateMetadata({ params }) {
    const tag = decodeURIComponent((await params).tag);
    return {
        title: `#${tag} | TechSheet`,
        description: `All TechSheet articles tagged with ${tag}.`,
    };
}

export default async function TagPage({ params }) {
    const tag = decodeURIComponent((await params).tag).toLowerCase().trim();
    const all = await getAllBlogPosts();

    const posts = all.filter(p => {
        if (!p.data.isPublished) return false;
        const tags = Array.isArray(p.data.tags)
            ? p.data.tags
            : (p.data.Tags || "").split(/[ ,]+/).filter(Boolean);
        return tags.some(t => t.toLowerCase().trim() === tag);
    }).sort((a, b) => new Date(b.data.Date) - new Date(a.data.Date));

    if (!posts.length) notFound();

    return (
        <div className="relative min-h-screen">
            <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4" />
            </div>

            <div className="container mx-auto px-4 py-12 md:py-20 max-w-6xl">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary mb-10 transition-all group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    All TechSheets
                </Link>

                <div className="flex items-center gap-4 mb-12">
                    <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20">
                        <Tag className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-4xl md:text-6xl font-black tracking-tighter">
                            #{tag}
                        </h1>
                        <p className="text-muted-foreground font-medium mt-1">
                            {posts.length} article{posts.length !== 1 ? "s" : ""}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {posts.map(post => (
                        <BlogHeader
                            key={post.data.slug}
                            data={post.data}
                            content={post.content}
                            readTime={post.readTime?.text || "5 min read"}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
