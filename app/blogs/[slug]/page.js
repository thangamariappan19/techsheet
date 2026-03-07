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

    const title = post.data.Title || post.data.title;
    const description = post.data.Abstract || post.data.description;

    return {
        title: `${title} | TechSheet`,
        description: description,
        openGraph: {
            title: title,
            description: description,
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

    // Logic to handle missing or placeholder images
    const imageSource = (post.data.HeaderImage && post.data.HeaderImage !== "/placeholder-tech.jpg") 
        ? post.data.HeaderImage 
        : (post.data.headerImage || `https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=1200&keywords=${encodeURIComponent(post.data.Title || 'technology')}`);

    return (
        <div className="relative min-h-screen overflow-hidden">
            {/* Background Blobs for Visual Consistency */}
            <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/4" />
            </div>

            <article className="container mx-auto px-4 py-8 md:py-20 max-w-5xl relative z-10">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary mb-12 transition-all group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to TechSheets
                </Link>

                <div className="flex flex-col lg:flex-row gap-16">
                    <div className="flex-1 min-w-0">
                        <header className="mb-12">
                            <div className="flex flex-wrap gap-2 mb-8">
                                {(post.data.Tags || post.data.tags || "TECH").toString().split(/[ ,]+/).map((tag) => (
                                    <span
                                        key={tag}
                                        className="px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.1em] border border-primary/20"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>

                            <h1 className="text-4xl font-black tracking-tight text-foreground sm:text-6xl lg:text-7xl mb-10 leading-[1.1]">
                                {post.data.Title || post.data.title}
                            </h1>

                            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground border-b border-border/50 pb-10">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center border border-primary/20 text-primary shadow-inner">
                                        <User className="w-6 h-6" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-foreground text-base tracking-tight flex items-center gap-2">
                                            {post.data.Author || post.data.author || "TechSheet AI"}
                                            {(post.data.Author === "TechSheet AI" || post.data.Author === "TechSheet Bot" || !post.data.Author) && (
                                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[9px] font-black uppercase border border-primary/20">
                                                    ✨ AI
                                                </span>
                                            )}
                                        </span>
                                        <span className="text-xs font-medium text-muted-foreground/80">Senior Architect</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 bg-muted/30 px-4 py-2 rounded-xl border border-border/50">
                                    <Clock className="w-4 h-4 text-primary" />
                                    <span className="font-bold text-foreground/70 lowercase">{post.readTime?.text || '5 min read'}</span>
                                </div>
                                <div className="flex items-center gap-2 bg-muted/30 px-4 py-2 rounded-xl border border-border/50">
                                    <Calendar className="w-4 h-4 text-primary" />
                                    <span className="font-bold text-foreground/70">{post.data.Date ? new Date(post.data.Date).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' }) : 'Mar 07, 2026'}</span>
                                </div>
                            </div>
                        </header>

                        <div className="relative aspect-[21/9] mb-20 overflow-hidden rounded-[2.5rem] border border-border/50 bg-muted/30 shadow-2xl group/image">
                            <img
                                src={imageSource}
                                alt={post.data.Title || post.data.title}
                                className="object-cover w-full h-full transition-all duration-1000 group-hover/image:scale-105"
                            />
                            <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-[2.5rem]" />
                        </div>

                        <div className="prose prose-xl dark:prose-invert prose-primary max-w-none prose-headings:font-black prose-headings:tracking-tight prose-a:text-primary prose-pre:bg-secondary/50 prose-pre:border prose-pre:border-border/50 prose-pre:rounded-[1.5rem] prose-pre:shadow-2xl prose-img:rounded-3xl">
                            <MDXRemote
                                source={cleanedContent}
                                options={{
                                    mdxOptions: {
                                        rehypePlugins: [rehypeSlug],
                                    },
                                }}
                            />
                        </div>

                        <div className="my-24 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

                        <div className="flex flex-col gap-16">
                            <div className="flex items-center justify-between flex-wrap gap-8 bg-card/30 backdrop-blur-sm p-8 rounded-[2rem] border border-border/50 shadow-premium">
                                <LikeBtn id={slug} />
                                <div className="flex items-center gap-4">
                                    <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Share this techsheet</span>
                                    <BlogShare data={post.data} />
                                </div>
                            </div>

                            <div className="bg-card/50 backdrop-blur-sm rounded-[3rem] border border-border/50 p-8 md:p-14 shadow-2xl relative overflow-hidden group/discussion">
                                <div className="absolute -top-12 -right-12 w-64 h-64 bg-primary/5 rounded-full blur-[80px] group-hover/discussion:bg-primary/10 transition-colors duration-700" />
                                <h3 className="text-4xl font-black mb-12 tracking-tight">Discussion</h3>
                                <Comments id={slug} />
                            </div>
                        </div>
                    </div>

                    <aside className="hidden lg:block w-80 flex-shrink-0">
                        <div className="sticky top-28 space-y-12">
                            <div className="bg-card/30 backdrop-blur-sm rounded-3xl border border-border/50 p-8 shadow-premium group/toc">
                                <h3 className="font-black text-xl mb-8 tracking-tighter flex items-center gap-3">
                                    <div className="w-1.5 h-6 bg-primary rounded-full group-hover/toc:scale-y-125 transition-transform origin-top" />
                                    Contents
                                </h3>
                                <Toc headings={headings} />
                            </div>

                            <div className="bg-gradient-to-br from-primary/[0.08] to-purple-500/[0.08] backdrop-blur-sm rounded-[2.5rem] border border-primary/20 p-10 relative overflow-hidden group/news">
                                <div className="absolute -top-20 -right-20 w-48 h-48 bg-primary/10 rounded-full blur-[60px] group-hover/news:scale-150 transition-transform duration-1000" />
                                <h4 className="font-black text-2xl mb-4 tracking-tighter text-foreground">Join the Hub</h4>
                                <p className="text-sm font-medium text-muted-foreground/80 mb-10 leading-relaxed">Exclusive insights for 5,500+ top-tier software engineers.</p>
                                <div className="flex flex-col gap-4">
                                    <input
                                        type="email"
                                        placeholder="your@email.com"
                                        className="w-full bg-background border border-border/50 rounded-2xl px-5 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-inner"
                                    />
                                    <button className="w-full bg-primary text-primary-foreground px-5 py-4 rounded-2xl text-sm font-black shadow-premium hover:shadow-premium-hover active:scale-[0.98] transition-all tracking-wider uppercase">
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
