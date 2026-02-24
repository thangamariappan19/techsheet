"use client";

import { Github, Twitter, Linkedin, Mail, Heart } from "lucide-react";

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-border bg-card">
      <div className="container mx-auto px-6 py-12">
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xl tracking-tight text-foreground">
                TechSheet
              </span>
            </div>
            <p className="max-w-xs text-center md:text-left text-sm text-muted-foreground">
              Empowering developers with premium, simplified documentation and cheatsheets.
            </p>
          </div>

          <div className="flex flex-col items-center gap-6">
            <div className="flex items-center gap-4">
              {[
                { icon: Twitter, href: "https://twitter.com/iamthangam", label: "Twitter" },
                { icon: Github, href: "https://github.com/thangamariappan19", label: "GitHub" },
                { icon: Linkedin, href: "https://www.linkedin.com/in/thanga-mariappan-p/", label: "LinkedIn" },
                { icon: Mail, href: "mailto:hello@techsheet.dev", label: "Email" },
              ].map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-primary transition-all"
                  aria-label={item.label}
                >
                  <item.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-muted-foreground">
            © {year} TechSheet. All rights reserved.
          </p>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <span>Built with</span>
            <Heart className="w-4 h-4 text-destructive fill-destructive" />
            <span>by</span>
            <a
              href="https://github.com/thangamariappan19"
              className="font-medium text-foreground hover:text-primary transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              Thanga
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
