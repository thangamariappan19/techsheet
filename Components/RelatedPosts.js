import Link from "next/link";
import { Clock, ArrowUpRight } from "lucide-react";

export default function RelatedPosts({ posts }) {
    if (!posts?.length) return null;

    return (
        <div className="mt-20">
            <h3 className="text-3xl font-black tracking-tight mb-8 flex items-center gap-3">
                <div className="w-1.5 h-7 bg-primary rounded-full" />
                More TechSheets
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post) => {
                    const tags = Array.isArray(post.data.tags)
                        ? post.data.tags
                        : (post.data.Tags || "").split(/[ ,]+/).filter(Boolean);

                    return (
                        <Link
                            key={post.data.slug}
                            href={`/blogs/${post.data.slug}`}
                            className="group flex flex-col gap-4 bg-card/40 backdrop-blur-sm border border-border/50 rounded-[1.5rem] p-6 hover:border-primary/40 hover:shadow-premium transition-all duration-300"
                        >
                            <div className="flex flex-wrap gap-1.5">
                                {tags.slice(0, 2).map(tag => (
                                    <span
                                        key={tag}
                                        className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>

                            <h4 className="font-black text-base leading-snug text-foreground group-hover:text-primary transition-colors line-clamp-2">
                                {post.data.Title || post.data.title}
                            </h4>

                            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                                {post.data.Abstract || post.data.description}
                            </p>

                            <div className="flex items-center justify-between mt-auto pt-2 border-t border-border/30">
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <Clock className="w-3.5 h-3.5" />
                                    <span>{post.readTime?.text || "5 min read"}</span>
                                </div>
                                <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
