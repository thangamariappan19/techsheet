"use client";

import React, { useState, useEffect } from "react";
import { cn } from "../Lib/utils";

function Toc({ headings }) {
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "0% 0% -80% 0%" }
    );

    headings.forEach((heading) => {
      const element = document.getElementById(heading.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [headings]);

  return (
    <nav className="flex flex-col gap-1 overflow-auto max-h-[calc(100vh-200px)] pr-2 scrollbar-none">
      {headings.map((heading) => (
        <a
          key={heading.id}
          href={`#${heading.id}`}
          onClick={(e) => {
            e.preventDefault();
            document.getElementById(heading.id)?.scrollIntoView({
              behavior: "smooth",
            });
            setActiveId(heading.id);
          }}
          className={cn(
            "group flex items-center gap-2 py-1.5 text-sm transition-all duration-200",
            heading.level === 3 ? "pl-4" : "pl-0",
            activeId === heading.id
              ? "text-primary font-bold"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <div className={cn(
            "w-1 h-4 rounded-full transition-all duration-200",
            activeId === heading.id ? "bg-primary scale-y-100" : "bg-transparent scale-y-0 group-hover:bg-muted-foreground/30 group-hover:scale-y-50"
          )} />
          <span className="truncate">{heading.text}</span>
        </a>
      ))}
    </nav>
  );
}

export default Toc;
