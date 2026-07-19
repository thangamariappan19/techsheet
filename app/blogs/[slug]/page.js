import { getBlogPostBySlug, getAllBlogPosts, getRelatedPosts } from "../../../Lib/Data";
import { getHeadings } from "../../../Lib/GetHeadings";
import { MDXRemote } from "next-mdx-remote/rsc";
import rehypeSlug from "rehype-slug";
import Toc from "../../../Components/Toc";
import LikeBtn from "../../../Components/LikeBtn";
import BlogShare from "../../../Components/BlogShare";
import Comments from "../../../Components/Comments";
import RelatedPosts from "../../../Components/RelatedPosts";
import ReadingProgress from "../../../Components/ReadingProgress";
import AdUnit from "../../../Components/AdUnit";
import { notFound } from "next/navigation";
import { Clock, User, Calendar, ArrowLeft } from "lucide-react";
import Link from "next/link";

// Only pre-build the 50 most recent posts; older posts are generated on-demand via ISR
export const dynamicParams = true;
export const revalidate = 86400; // revalidate cached pages every 24 hours

export async function generateStaticParams() {
    const posts = await getAllBlogPosts();
    return posts
        .sort((a, b) => new Date(b.data.Date || 0) - new Date(a.data.Date || 0))
        .slice(0, 50)
        .map((post) => ({ slug: post.data.slug }));
}

export async function generateMetadata({ params }) {
    const { slug } = await params;
    const post = await getBlogPostBySlug(slug);
    if (!post) return { title: "Post Not Found" };

    const title = post.data.Title || post.data.title;
    const description = post.data.Abstract || post.data.description;
    const image = post.data.HeaderImage || post.data.headerImage || `https://picsum.photos/seed/${slug}/1200/630`;
    const publishedTime = post.data.Date ? new Date(post.data.Date).toISOString() : undefined;

    return {
        title: title,
        description: description,
        alternates: {
            canonical: `/blogs/${slug}`,
        },
        openGraph: {
            title: title,
            description: description,
            type: "article",
            url: `/blogs/${slug}`,
            publishedTime: publishedTime,
            authors: [post.data.Author || "Thanga Mariappan"],
            images: [{ url: image, width: 1200, height: 630, alt: title }],
        },
        twitter: {
            card: "summary_large_image",
            title: title,
            description: description,
            images: [image],
        },
    };
}

export default async function BlogPost({ params }) {
    const { slug } = await params;
    const post = await getBlogPostBySlug(slug);

    if (!post) {
        notFound();
    }

    const [headings, relatedPosts] = await Promise.all([
        getHeadings(post.content),
        getRelatedPosts(slug, 3),
    ]);

    // Strip custom ID syntax {#...} which causes MDX compile errors
    const cleanedContent = post.content.replace(/\{#[^}]+\}/g, "");

    // Logic to handle missing or placeholder images
    const imageSource = (post.data.HeaderImage && post.data.HeaderImage !== "/placeholder-tech.jpg") 
        ? post.data.HeaderImage 
        : (post.data.headerImage || `https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=1200&keywords=${encodeURIComponent(post.data.Title || 'technology')}`);

    const articleSchema = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": post.data.Title || post.data.title,
        "description": post.data.Abstract || post.data.description,
        "image": [imageSource],
        "datePublished": post.data.Date ? new Date(post.data.Date).toISOString() : undefined,
        "dateModified": post.data.Date ? new Date(post.data.Date).toISOString() : undefined,
        "author": [{ "@type": "Person", "name": post.data.Author || "Thanga Mariappan" }],
        "publisher": { "@type": "Organization", "name": "TechSheet", "url": "https://techsheet.vercel.app" },
        "mainEntityOfPage": { "@type": "WebPage", "@id": `https://techsheet.vercel.app/blogs/${slug}` },
    };

    return (
        <div className="relative min-h-screen overflow-hidden">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
            />
            <ReadingProgress />
            {/* Background Blobs for Visual Consistency */}
            <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/4" />
            </div>

            <article className="container mx-auto px-4 py-6 md:py-10 max-w-7xl relative z-10">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary mb-6 transition-all group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to TechSheets
                </Link>

                <div className="flex flex-col lg:flex-row gap-8 xl:gap-12">
                    {/* ── Main content ── */}
                    <div className="flex-1 min-w-0">

                        {/* Hero image — full width, above the fold */}
                        <div className="relative aspect-[2/1] mb-6 overflow-hidden rounded-2xl border border-border/40 bg-muted/30 shadow-lg group/image">
                            <img
                                src={imageSource}
                                alt={post.data.Title || post.data.title}
                                className="object-cover w-full h-full transition-transform duration-700 group-hover/image:scale-105"
                            />
                        </div>

                        <header className="mb-8">
                            {/* Tags */}
                            <div className="flex flex-wrap gap-1.5 mb-4">
                                {(post.data.Tags || post.data.tags || "TECH").toString().split(/[ ,]+/).slice(0, 4).map((tag) => (
                                    <Link
                                        key={tag}
                                        href={`/tags/${encodeURIComponent(tag.toLowerCase().trim())}`}
                                        className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider border border-primary/20 hover:bg-primary/20 transition-colors"
                                    >
                                        {tag}
                                    </Link>
                                ))}
                            </div>

                            {/* Title */}
                            <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl lg:text-4xl xl:text-5xl mb-5 leading-[1.2]">
                                {post.data.Title || post.data.title}
                            </h1>

                            {/* Author / meta row */}
                            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground border-b border-border/50 pb-5">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center border border-primary/20 text-primary">
                                        <User className="w-4 h-4" />
                                    </div>
                                    <div className="flex flex-col leading-tight">
                                        <span className="font-semibold text-foreground text-sm flex items-center gap-1.5">
                                            {post.data.Author || post.data.author || "TechSheet AI"}
                                            {(post.data.Author === "TechSheet AI" || post.data.Author === "TechSheet Bot" || !post.data.Author) && (
                                                <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[9px] font-bold uppercase border border-primary/20">AI</span>
                                            )}
                                        </span>
                                        <span className="text-[11px] text-muted-foreground/70">Senior Architect</span>
                                    </div>
                                </div>
                                <div className="w-px h-4 bg-border/60 mx-1" />
                                <div className="flex items-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5 text-primary" />
                                    <span className="text-xs font-medium">{post.readTime?.text || '5 min read'}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5 text-primary" />
                                    <span className="text-xs font-medium">
                                        {post.data.Date ? new Date(post.data.Date).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' }) : 'Mar 07, 2026'}
                                    </span>
                                </div>
                            </div>
                        </header>

                        {/* Article body */}
                        <div className="prose prose-base lg:prose-lg dark:prose-invert prose-primary max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-primary prose-pre:bg-muted/60 prose-pre:border prose-pre:border-border/50 prose-pre:rounded-xl prose-img:rounded-xl prose-code:text-primary">
                            <MDXRemote
                                source={cleanedContent}
                                options={{ mdxOptions: { rehypePlugins: [rehypeSlug] } }}
                            />
                        </div>

                        <div className="my-10 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

                        {/* Bottom ad */}
                        <AdUnit slot="auto" format="auto" className="mb-8 rounded-xl overflow-hidden" />

                        <div className="flex flex-col gap-8">
                            {/* Like + Share */}
                            <div className="flex items-center justify-between flex-wrap gap-4 bg-card/40 backdrop-blur-sm p-5 rounded-2xl border border-border/50">
                                <LikeBtn id={slug} />
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Share</span>
                                    <BlogShare data={post.data} />
                                </div>
                            </div>

                            <RelatedPosts posts={relatedPosts} />

                            {/* Discussion */}
                            <div className="bg-card/40 backdrop-blur-sm rounded-2xl border border-border/50 p-6 md:p-10">
                                <h3 className="text-2xl font-bold mb-8 tracking-tight">Discussion</h3>
                                <Comments id={slug} />
                            </div>
                        </div>
                    </div>

                    {/* ── Sidebar ── */}
                    <aside className="hidden lg:block w-64 xl:w-72 flex-shrink-0">
                        <div className="sticky top-24 space-y-6">

                            {/* TOC */}
                            <div className="bg-card/40 backdrop-blur-sm rounded-2xl border border-border/50 p-5">
                                <h3 className="font-bold text-sm mb-4 tracking-tight flex items-center gap-2 text-foreground">
                                    <div className="w-1 h-4 bg-primary rounded-full" />
                                    Contents
                                </h3>
                                <Toc headings={headings} />
                            </div>

                            {/* Sidebar ad */}
                            <AdUnit slot="auto" format="auto" className="rounded-xl overflow-hidden" />

                            {/* Newsletter */}
                            <div className="bg-card/40 backdrop-blur-sm rounded-2xl border border-border/50 p-5">
                                <h4 className="font-bold text-sm mb-1 text-foreground">Stay Updated</h4>
                                <p className="text-xs text-muted-foreground mb-4">Daily articles for senior engineers.</p>
                                <div className="flex flex-col gap-2">
                                    <input
                                        type="email"
                                        placeholder="your@email.com"
                                        className="w-full bg-background border border-border/50 rounded-xl px-3 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    />
                                    <button className="w-full bg-primary text-primary-foreground px-3 py-2.5 rounded-xl text-xs font-bold tracking-wider uppercase hover:opacity-90 transition-all">
                                        Subscribe
                                    </button>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </article>
        </div>
    );
}
