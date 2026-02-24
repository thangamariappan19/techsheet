"use client";

import Link from "next/link";
import { ArrowRight, Clock, User } from "lucide-react";
import { motion } from "framer-motion";

function BlogHeader({ data, readTime }) {
  const slug = data.Title.split(" ").join("-").toLowerCase();

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-premium hover:shadow-premium-hover"
    >
      <Link href={`/blogs/${slug}`} className="flex flex-col h-full p-6 md:p-8">
        <div className="flex items-center gap-2 mb-4">
          {data.Tags && data.Tags.split(" ").slice(0, 2).map((tag, idx) => (
            <span
              key={idx}
              className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary transition-colors group-hover:bg-primary/20"
            >
              {tag}
            </span>
          ))}
        </div>

        <h3 className="text-xl font-bold leading-tight tracking-tight text-foreground sm:text-2xl group-hover:text-primary transition-colors mb-3">
          {data.Title}
        </h3>

        <p className="line-clamp-3 text-muted-foreground text-sm flex-grow mb-6">
          {data.Abstract}
        </p>

        <div className="mt-auto pt-6 border-t border-border flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <User className="w-4 h-4" />
              <span className="font-medium text-foreground/80">{data.Author}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>{readTime}</span>
            </div>
          </div>

          <div className="flex items-center gap-1 font-semibold text-primary group-hover:translate-x-1 transition-transform">
            <span>Read</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default BlogHeader;
