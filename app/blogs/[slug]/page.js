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
        <article className="container mx-auto px-4 py-12 md:py-20 lg:px-8">
            <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary mb-8 transition-colors"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to TechSheets
            </Link>

            <div className="flex flex-col lg:flex-row gap-12">
                <div className="flex-1 min-w-0">
                    <header className="mb-12">
                        <div className="flex flex-wrap gap-2 mb-6">
                            {post.data.Tags && post.data.Tags.split(" ").map((tag) => (
                                <span
                                    key={tag}
                                    className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold leading-5"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>

                        <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl mb-6">
                            {post.data.Title}
                        </h1>

                        <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                                    <User className="w-4 h-4" />
                                </div>
                                <span className="font-semibold text-foreground flex items-center gap-1.5">
                                    {post.data.Author}
                                    {post.data.Author === "TechSheet AI" && (
                                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider border border-primary/20">
                                            <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                            </svg>
                                            AI
                                        </span>
                                    )}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                <span>{post.readTime?.text || '5 min read'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>Feb 24, 2026</span>
                            </div>
                        </div>
                    </header>

                    {post.data.HeaderImage && (
                        <div className="relative aspect-video mb-12 overflow-hidden rounded-3xl border border-border shadow-premium">
                            <img
                                src={post.data.HeaderImage}
                                alt={post.data.Title}
                                className="object-cover w-full h-full"
                            />
                        </div>
                    )}

                    <div className="prose prose-lg dark:prose-invert prose-primary max-w-none">
                        <MDXRemote
                            source={cleanedContent}
                            options={{
                                mdxOptions: {
                                    rehypePlugins: [rehypeSlug],
                                },
                            }}
                        />
                    </div>

                    <hr className="my-16 border-border" />

                    <div className="flex flex-col gap-12">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <LikeBtn id={slug} />
                            <BlogShare data={post.data} />
                        </div>

                        <div className="bg-card rounded-3xl border border-border p-8 shadow-premium">
                            <h3 className="text-2xl font-bold mb-8">Comments</h3>
                            <Comments id={slug} />
                        </div>
                    </div>
                </div>

                <aside className="hidden lg:block w-80 flex-shrink-0">
                    <div className="sticky top-24 space-y-8">
                        <div className="bg-card rounded-2xl border border-border p-6 shadow-premium">
                            <h3 className="font-bold text-lg mb-4">Table of Contents</h3>
                            <Toc headings={headings} />
                        </div>

                        <div className="bg-primary/5 rounded-2xl border border-primary/10 p-6">
                            <h4 className="font-bold text-sm mb-2 uppercase tracking-wider text-primary">Newsletter</h4>
                            <p className="text-sm text-muted-foreground mb-4">Get the latest techsheets directly in your inbox.</p>
                            <div className="flex gap-2">
                                <input
                                    type="email"
                                    placeholder="Email address"
                                    className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                                <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-bold">
                                    Subscribe
                                </button>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </article>
    );
}
