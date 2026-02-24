"use client";

import { Twitter, Linkedin, Facebook, Link as LinkIcon, Share2, Check } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../Lib/utils";

function BlogShare({ data }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== "undefined" ? window.location.href : "";
  const title = data.Title;

  const shareLinks = [
    {
      name: "Twitter",
      icon: Twitter,
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
      color: "hover:bg-[#1DA1F2] hover:text-white"
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      color: "hover:bg-[#0077b5] hover:text-white"
    },
    {
      name: "Facebook",
      icon: Facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      color: "hover:bg-[#4267B2] hover:text-white"
    }
  ];

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-2 mb-2">
        <Share2 className="w-4 h-4 text-muted-foreground" />
        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Share TechSheet</span>
      </div>

      <div className="flex items-center gap-3">
        {shareLinks.map((link) => (
          <a
            key={link.name}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "p-3 rounded-2xl bg-muted border border-border text-foreground transition-all duration-300 shadow-sm",
              link.color
            )}
            title={`Share on ${link.name}`}
          >
            <link.icon className="w-5 h-5" />
          </a>
        ))}

        <button
          onClick={copyToClipboard}
          className={cn(
            "p-3 rounded-2xl border transition-all duration-300 shadow-sm relative",
            copied
              ? "bg-green-500/10 border-green-500 text-green-500"
              : "bg-muted border-border text-foreground hover:bg-primary hover:text-white hover:border-primary"
          )}
          title="Copy Link"
        >
          <AnimatePresence mode="wait">
            {copied ? (
              <motion.div
                key="check"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
              >
                <Check className="w-5 h-5" />
              </motion.div>
            ) : (
              <motion.div
                key="link"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
              >
                <LinkIcon className="w-5 h-5" />
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </div>
    </div>
  );
}

export default BlogShare;
