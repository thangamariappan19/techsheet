"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import Link from "next/link";
import {
  Terminal,
  Sun,
  Moon,
  Github,
  User,
  LogOut,
  Info,
  Menu,
  X
} from "lucide-react";
import { auth, provider } from "../Firebase/Firebase";
import { signInWithPopup, signOut } from "firebase/auth";
import Alert from "./Alert";
import { motion, AnimatePresence } from "framer-motion";

function Navbar() {
  const [isMounted, setIsMounted] = useState(false);
  const [user, setUser] = useState(null);
  const { theme, setTheme } = useTheme();
  const [viewAlert, setViewAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  const toggleTheme = () => {
    if (isMounted) {
      setTheme(theme === "light" ? "dark" : "light");
    }
  };

  const handleSignOut = () => {
    signOut(auth)
      .then(() => {
        setUser(null);
        localStorage.removeItem("user");
        setAlertMessage("Hope to see you again!");
        setViewAlert(true);
        setTimeout(() => setViewAlert(false), 2000);
      })
      .catch((error) => console.error(error));
  };

  const handleSignIn = () => {
    signInWithPopup(auth, provider)
      .then((res) => {
        const userData = {
          name: res.user.displayName,
          photo: res.user.photoURL,
          token: res.user.accessToken,
          uid: res.user.uid,
        };
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
        setAlertMessage(`Hello ${res.user.displayName}`);
        setViewAlert(true);
        setTimeout(() => setViewAlert(false), 2000);
      })
      .catch((err) => console.error(err));
  };

  return (
    <>
      <Alert show={viewAlert} type="success" message={alertMessage} />
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex h-16 items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 group transition-all"
            >
              <div className="bg-primary p-1.5 rounded-lg group-hover:scale-110 transition-transform">
                <Terminal className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl tracking-tight text-foreground">
                TechSheet
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              <Link
                href="/about"
                className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-muted text-foreground/80 hover:text-foreground transition-all"
              >
                <Info className="w-4 h-4" />
                <span className="text-sm font-medium">About</span>
              </Link>

              <a
                href="https://github.com/thangamariappan19"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg hover:bg-muted text-foreground/80 hover:text-foreground transition-all"
              >
                <Github className="w-5 h-5" />
              </a>

              <div className="h-6 w-px bg-border mx-2" />

              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-muted text-foreground/80 hover:text-foreground transition-all"
                aria-label="Toggle theme"
              >
                {isMounted && theme === "dark" ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>

              {user ? (
                <div className="flex items-center gap-3 ml-2">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted border border-border">
                    {user.photo ? (
                      <img src={user.photo} alt={user.name} className="w-6 h-6 rounded-full" />
                    ) : (
                      <User className="w-4 h-4" />
                    )}
                    <span className="text-sm font-medium truncate max-w-[100px]">{user.name}</span>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
                    title="Sign Out"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleSignIn}
                  className="ml-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-semibold transition-all shadow-premium"
                >
                  Sign In
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-muted text-foreground/80 transition-all"
              >
                {isMounted && theme === "dark" ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-lg hover:bg-muted text-foreground/80 transition-all"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-border bg-background"
            >
              <div className="p-4 flex flex-col gap-2">
                <Link
                  href="/about"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-all"
                >
                  <Info className="w-5 h-5" />
                  <span className="font-medium">About</span>
                </Link>
                <a
                  href="https://github.com/thangamariappan19"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-all"
                >
                  <Github className="w-5 h-5" />
                  <span className="font-medium">GitHub</span>
                </a>

                <div className="h-px bg-border my-2" />

                {user ? (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3 p-3">
                      <img src={user.photo} alt={user.name} className="w-8 h-8 rounded-full" />
                      <span className="font-medium">{user.name}</span>
                    </div>
                    <button
                      onClick={() => {
                        handleSignOut();
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-destructive/10 text-destructive transition-all"
                    >
                      <LogOut className="w-5 h-5" />
                      <span className="font-medium">Sign Out</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      handleSignIn();
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex justify-center items-center gap-2 p-4 rounded-xl bg-primary text-primary-foreground font-bold shadow-premium"
                  >
                    Sign In
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
}

export default Navbar;
