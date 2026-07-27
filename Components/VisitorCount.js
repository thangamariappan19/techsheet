'use client';
import { useEffect, useState } from 'react';
import { Eye } from 'lucide-react';

function formatCount(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return n.toString();
}

export default function VisitorCount() {
  const [count, setCount] = useState(null);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const visitKey = `techsheet-visited-${today}`;

    async function run() {
      try {
        const alreadyCounted = localStorage.getItem(visitKey);
        if (!alreadyCounted) {
          localStorage.setItem(visitKey, '1');
          const res = await fetch('/api/visitor-count', { method: 'POST' });
          if (res.ok) {
            const data = await res.json();
            setCount(data.count);
          }
        } else {
          const res = await fetch('/api/visitor-count');
          if (res.ok) {
            const data = await res.json();
            setCount(data.count);
          }
        }
      } catch {
        // silently fail — visitor count is non-critical
      }
    }
    run();
  }, []);

  if (count === null) return null;

  return (
    <span className="flex items-center gap-1 text-xs text-muted-foreground/60 font-medium">
      <Eye className="w-3 h-3" />
      {formatCount(count)} visitors
    </span>
  );
}
