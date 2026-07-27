'use client';
import { useEffect, useState } from 'react';
import { Eye } from 'lucide-react';
import { db } from '../Firebase/Firebase';
import { doc, getDoc, setDoc, increment } from 'firebase/firestore';

const statsRef = doc(db, 'meta', 'siteStats');

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
          await setDoc(statsRef, { visitorCount: increment(1) }, { merge: true });
        }
        const snap = await getDoc(statsRef);
        setCount(snap.exists() ? (snap.data().visitorCount ?? 0) : 0);
      } catch {
        // silently fail — non-critical feature
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
