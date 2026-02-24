"use client";

import { Info, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../Lib/utils";

function Alert({ show, type = "info", message }) {
  const icons = {
    success: <CheckCircle2 className="w-5 h-5" />,
    error: <XCircle className="w-5 h-5" />,
    warning: <AlertCircle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />,
  };

  const styles = {
    success: "bg-green-500 text-white shadow-green-500/20",
    error: "bg-destructive text-destructive-foreground shadow-destructive/20",
    warning: "bg-yellow-500 text-white shadow-yellow-500/20",
    info: "bg-primary text-primary-foreground shadow-primary/20",
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
          className="fixed bottom-10 left-0 right-0 z-[100] flex justify-center px-4 pointer-events-none"
        >
          <div
            className={cn(
              "pointer-events-auto flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl min-w-[300px] max-w-md border border-white/10 backdrop-blur-md",
              styles[type] || styles.info
            )}
          >
            <div className="flex-shrink-0">
              {icons[type] || icons.info}
            </div>
            <p className="text-sm font-bold tracking-tight">
              {message}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default Alert;
