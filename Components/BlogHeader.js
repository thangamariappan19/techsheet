"use client";

import Link from "next/link";
import { ArrowRight, Clock, User } from "lucide-react";
import { motion } from "framer-motion";

function BlogHeader({ data, readTime }) {
  const slug = data.slug || data.Title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const getCategoryImage = (tags = "") => {
    const t = tags.toLowerCase();
    if (t.includes('ai') || t.includes('intelligence')) return "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=800&auto=format&fit=crop";
    if (t.includes('cyber') || t.includes('security')) return "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=800&auto=format&fit=crop";
    if (t.includes('cloud') || t.includes('aws') || t.includes('azure')) return "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop";
    if (t.includes('devops') || t.includes('pipeline')) return "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?q=80&w=800&auto=format&fit=crop";
    return "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=800&auto=format&fit=crop";
  };

  const imageSource = (data.HeaderImage && data.HeaderImage !== "/placeholder-tech.jpg") 
    ? data.HeaderImage 
    : getCategoryImage(data.Tags?.toString() || data.tags?.toString() || "");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      className="group relative flex flex-col h-full overflow-hidden rounded-[2rem] border border-border/50 bg-card/50 backdrop-blur-sm shadow-premium hover:shadow-2xl transition-all duration-300"
    >
      <Link href={`/blogs/${slug}`} className="flex flex-col h-full">
        {/* Card Image */}
        <div className="relative aspect-[16/9] overflow-hidden">
          <img
            src={imageSource}
            alt={data.Title}
            className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-60" />
          
          <div className="absolute top-4 left-4 flex gap-2">
            {(data.Tags || data.tags || "TECH").toString().split(/[ ,]+/).slice(0, 2).map((tag, idx) => (
              <span
                key={idx}
                className="px-3 py-1 rounded-full bg-background/80 backdrop-blur-md text-primary text-[10px] font-black uppercase tracking-wider border border-white/10 shadow-lg"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Card Content */}
        <div className="flex flex-col flex-grow p-8">
          <h3 className="text-2xl font-black leading-[1.2] tracking-tight text-foreground group-hover:text-primary transition-colors mb-4 line-clamp-2">
            {data.Title || data.title}
          </h3>

          <p className="line-clamp-2 text-muted-foreground text-sm font-medium leading-relaxed mb-6">
            {data.Abstract || data.description}
          </p>

          <div className="mt-auto pt-6 border-t border-border/50 flex items-center justify-between">
            <div className="flex items-center gap-4 min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 text-primary">
                  <User className="w-4 h-4" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-black text-foreground truncate flex items-center gap-1">
                    {data.Author || data.author}
                    {(data.Author === "TechSheet AI" || data.Author === "TechSheet Bot" || !data.Author) && (
                      <span className="text-[9px] text-primary">✨</span>
                    )}
                  </span>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-muted-foreground/70">
                <Clock className="w-3.5 h-3.5" />
                <span>{readTime}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-black text-primary uppercase tracking-widest translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
              Read
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default BlogHeader;
