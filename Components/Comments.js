"use client";

import { useState, useEffect } from "react";
import { collection, addDoc, Timestamp, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../Firebase/Firebase";
import { MessageSquare, Send, User, Calendar } from "lucide-react";
import Alert from "./Alert";
import { motion, AnimatePresence } from "framer-motion";

function Comments({ id }) {
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewAlert, setViewAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) setUser(storedUser);

    const q = query(
      collection(db, "posts", id, "comments"),
      orderBy("date", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedComments = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate() || new Date(),
      }));
      setComments(fetchedComments);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [id]);

  const handlePost = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    if (!user) {
      setAlertMessage("Please sign in to comment");
      setViewAlert(true);
      setTimeout(() => setViewAlert(false), 2000);
      return;
    }

    try {
      const docData = {
        userName: user.name,
        userImage: user.photo,
        comment: comment.trim(),
        date: Timestamp.now(),
        userId: user.uid,
      };

      await addDoc(collection(db, "posts", id, "comments"), docData);
      setComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  return (
    <div className="space-y-8">
      <Alert show={viewAlert} type="error" message={alertMessage} />

      <form onSubmit={handlePost} className="relative group">
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={user ? "Write a comment..." : "Sign in to join the conversation"}
          disabled={!user}
          className="w-full min-h-[120px] p-4 rounded-2xl bg-muted/30 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none outline-none disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <div className="absolute bottom-4 right-4 flex items-center gap-3">
          <span className="text-xs text-muted-foreground">
            {comment.length} characters
          </span>
          <button
            type="submit"
            disabled={!comment.trim() || !user}
            className="p-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-50 shadow-premium"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>

      <div className="space-y-6">
        {loading ? (
          <div className="flex flex-col gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-24 rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : comments.length > 0 ? (
          <div className="grid gap-6">
            <AnimatePresence mode="popLayout">
              {comments.map((c, idx) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex gap-4 p-4 rounded-2xl border border-border bg-card/50 hover:bg-card transition-colors group"
                >
                  <div className="flex-shrink-0">
                    {c.userImage ? (
                      <img src={c.userImage} alt={c.userName} className="w-10 h-10 rounded-full border border-border" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        <User className="w-5 h-5 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-bold text-foreground truncate">{c.userName}</h4>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        <span>{c.date.toLocaleDateString()}</span>
                      </div>
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">
                      {c.comment}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-12 rounded-3xl border-2 border-dashed border-border">
            <MessageSquare className="w-12 h-12 text-muted/30 mx-auto mb-4" />
            <p className="text-muted-foreground">No comments yet. Be the first to share your thoughts!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Comments;
