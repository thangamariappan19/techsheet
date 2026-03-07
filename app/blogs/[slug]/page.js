import { getBlogPostBySlug, getAllBlogPosts } from "../../../Lib/Data";
import { getHeadings } from "../../../Lib/GetHeadings";
import { MDXRemote } from "next-mdx-remote/rsc";
import rehypeSlug from "rehype-slug";
import Toc from "../../../Components/Toc";
import LikeBtn from "../../../Components/LikeBtn";
import BlogShare from "../../../Components/BlogShare";
import Comments from "../../../Components/Comments";
import { notFound } from "next/navigation";
import { Clock, User, Calendar, ArrowLeft } from "lucide-react";
import Link from "next/link";

export async function generateStaticParams() {
    const posts = await getAllBlogPosts();
    return posts.map((post) => ({
        slug: post.data.slug,
    }));
}

export async function generateMetadata({ params }) {
    const { slug } = await params;
    const post = await getBlogPostBySlug(slug);
    if (!post) return { title: "Post Not Found" };

    return {
        title: `${post.data.Title} | TechSheet`,
        description: post.data.Abstract,
        openGraph: {
            title: post.data.Title,
            description: post.data.Abstract,
            type: "article",
        },
    };
}

export default async function BlogPost({ params }) {
    const { slug } = await params;
    const post = await getBlogPostBySlug(slug);

    if (!post) {
        notFound();
    }

    const headings = await getHeadings(post.content);

    // Strip custom ID syntax {#...} which causes MDX compile errors
    const cleanedContent = post.content.replace(/\{#[^}]+\}/g, "");

    return (
        <article className="container mx-auto px-4 py-8 md:py-20 max-w-5xl">
            <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary mb-10 transition-colors group"
            >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Back to TechSheets
            </Link>

            <div className="flex flex-col lg:flex-row gap-16">
                <div className="flex-1 min-w-0">
                    <header className="mb-10">
                        <div className="flex flex-wrap gap-2 mb-6">
                            {(post.data.Tags || post.data.tags) && (post.data.Tags || post.data.tags.join(" ")).split(" ").map((tag) => (
                                <span
                                    key={tag}
                                    className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider border border-primary/20"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>

                        <h1 className="text-4xl font-black tracking-tight text-foreground sm:text-5xl lg:text-6xl mb-8 leading-tight">
                            {post.data.Title || post.data.title}
                        </h1>

                        <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground border-b border-border pb-8">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 text-primary">
                                    <User className="w-5 h-5" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-bold text-foreground flex items-center gap-1.5">
                                        {post.data.Author || "TechSheet AI"}
                                        {(post.data.Author === "TechSheet AI" || !post.data.Author) && (
                                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider border border-primary/20">
                                                ✨ AI
                                            </span>
                                        )}
                                    </span>
                                    <span className="text-xs text-muted-foreground">Tech Specialist</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-full">
                                <Clock className="w-4 h-4 text-primary" />
                                <span className="font-medium text-foreground/80 lowercase">{post.readTime?.text || '5 min read'}</span>
                            </div>
                            <div className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-full">
                                <Calendar className="w-4 h-4 text-primary" />
                                <span className="font-medium text-foreground/80">{post.data.Date ? new Date(post.data.Date).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' }) : 'Mar 07, 2026'}</span>
                            </div>
                        </div>
                    </header>

                    <div className="relative aspect-[21/9] mb-16 overflow-hidden rounded-[2rem] border border-border bg-muted shadow-2xl">
                        <img
                            src={post.data.HeaderImage || post.data.headerImage || `https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1200&auto=format&fit=crop&keywords=${encodeURIComponent(post.data.Title || 'coding')}`}
                            alt={post.data.Title || post.data.title}
                            className="object-cover w-full h-full transition-transform duration-700 hover:scale-105"
                        />
                    </div>

                    <div className="prose prose-lg dark:prose-invert prose-primary max-w-none prose-headings:font-black prose-a:text-primary prose-pre:bg-muted/50 prose-pre:border prose-pre:border-border prose-pre:rounded-2xl">
                        <MDXRemote
                            source={cleanedContent}
                            options={{
                                mdxOptions: {
                                    rehypePlugins: [rehypeSlug],
                                },
                            }}
                        />
                    </div>

                    <hr className="my-20 border-border" />

                    <div className="flex flex-col gap-12">
                        <div className="flex items-center justify-between flex-wrap gap-6 bg-muted/30 p-6 rounded-3xl border border-border">
                            <LikeBtn id={slug} />
                            <BlogShare data={post.data} />
                        </div>

                        <div className="bg-card rounded-[2rem] border border-border p-8 md:p-12 shadow-premium relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -z-10" />
                            <h3 className="text-3xl font-black mb-10 tracking-tight">Discussion</h3>
                            <Comments id={slug} />
                        </div>
                    </div>
                </div>

                <aside className="hidden lg:block w-80 flex-shrink-0">
                    <div className="sticky top-24 space-y-10">
                        <div className="bg-card rounded-2xl border border-border p-6 shadow-premium hover:shadow-premium-hover transition-shadow">
                            <h3 className="font-black text-xl mb-6 tracking-tight flex items-center gap-2">
                                <div className="w-1.5 h-6 bg-primary rounded-full" />
                                Contents
                            </h3>
                            <Toc headings={headings} />
                        </div>

                        <div className="bg-primary/5 rounded-[2rem] border border-primary/20 p-8 relative overflow-hidden group">
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
                            <h4 className="font-black text-xl mb-3 tracking-tight text-foreground">Newsletter</h4>
                            <p className="text-sm text-muted-foreground mb-8 leading-relaxed">Join 5,000+ developers getting weekly tech insights.</p>
                            <div className="flex flex-col gap-3">
                                <input
                                    type="email"
                                    placeholder="your@email.com"
                                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                                />
                                <button className="w-full bg-primary text-primary-foreground px-4 py-3 rounded-xl text-sm font-black shadow-premium hover:opacity-90 active:scale-[0.98] transition-all">
                                    Subscribe Now
                                </button>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </article>
    );
}
