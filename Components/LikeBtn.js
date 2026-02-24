"use client";

import { useState, useEffect } from "react";
import { doc, updateDoc, increment, onSnapshot, setDoc, getDoc } from "firebase/firestore";
import { db } from "../Firebase/Firebase";
import { Heart, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../Lib/utils";

function LikeBtn({ id }) {
  const [likes, setLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pumping, setPumping] = useState(false);

  useEffect(() => {
    const docRef = doc(db, "likes", id);

    // Check if user has already liked in this session/localstorage
    const likedPosts = JSON.parse(localStorage.getItem("likedPosts") || "[]");
    setHasLiked(likedPosts.includes(id));

    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setLikes(docSnap.data().count || 0);
      } else {
        setLikes(0);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [id]);

  const handleLike = async () => {
    if (hasLiked) return;

    setPumping(true);
    const docRef = doc(db, "likes", id);

    try {
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        await updateDoc(docRef, {
          count: increment(1)
        });
      } else {
        await setDoc(docRef, { count: 1 });
      }

      const likedPosts = JSON.parse(localStorage.getItem("likedPosts") || "[]");
      likedPosts.push(id);
      localStorage.setItem("likedPosts", JSON.stringify(likedPosts));
      setHasLiked(true);
    } catch (error) {
      console.error("Error liking post:", error);
    } finally {
      setTimeout(() => setPumping(false), 500);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={handleLike}
        disabled={loading || hasLiked}
        className={cn(
          "group relative flex items-center justify-center w-16 h-16 rounded-full transition-all duration-300",
          hasLiked
            ? "bg-primary/20 text-primary cursor-default"
            : "bg-muted hover:bg-primary/10 text-muted-foreground hover:text-primary active:scale-95 shadow-lg hover:shadow-primary/20"
        )}
      >
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Loader2 className="w-6 h-6 animate-spin" />
            </motion.div>
          ) : (
            <motion.div
              key="heart"
              animate={pumping ? { scale: [1, 1.4, 0.9, 1.1, 1] } : {}}
              transition={{ duration: 0.5 }}
            >
              <Heart
                className={cn(
                  "w-7 h-7 transition-all",
                  hasLiked && "fill-current"
                )}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {pumping && (
          <motion.div
            initial={{ scale: 0.5, opacity: 1 }}
            animate={{ scale: 2, opacity: 0 }}
            className="absolute inset-0 rounded-full border-2 border-primary"
          />
        )}
      </button>

      <div className="flex flex-col items-center">
        <span className="text-xl font-bold tracking-tight text-foreground">
          {likes}
        </span>
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Likes
        </span>
      </div>
    </div>
  );
}

export default LikeBtn;
