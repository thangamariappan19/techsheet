# TechSheet

A daily tech blog powered by AI — covering frontend architecture, software engineering, and breaking AI news. Built with Next.js 16 App Router and deployed on Vercel.

**Live site:** [techsheet.vercel.app](https://techsheet.vercel.app)  
**Author:** Thanga Mariappan Pandian — Senior Front-End Architect

---

## Features

- **AI-generated daily posts** — GitHub Actions runs every midnight UTC and publishes three articles automatically using Google Gemini
- **Three blog categories per day** — Technical Deep-Dive, Frontend Architecture & Systems, Breaking AI & IT News Analysis
- **Live news awareness** — the generator fetches Hacker News, OpenAI, Google AI, Hugging Face, DeepMind, GitHub, Microsoft Dev Blog, and Dev.to before calling the AI, so articles reflect real current events
- **AI chat widget** — readers can ask questions about the blog content; powered by Gemini 2.0 Flash with streaming responses
- **Tag pages** — browse articles by topic
- **Related posts** — tag-overlap scoring surfaces the most relevant reads
- **Reading progress bar + estimated reading time**
- **Table of contents** — auto-generated from headings
- **Firebase likes and comments** per post
- **Dark / light theme** (next-themes)
- **Visitor counter**, cookie consent, Google Analytics, AdSense
- **RSS feed**, sitemap, and Open Graph images (per-post and site-wide)

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS, Framer Motion |
| Content | Markdown / MDX (`gray-matter`, `next-mdx-remote`) |
| AI | Google Gemini (`@google/generative-ai`) |
| Backend / DB | Firebase Firestore + Firebase Admin |
| Deployment | Vercel |
| Automation | GitHub Actions (daily cron) |

---

## Project Structure

```
├── app/                    # Next.js App Router pages and API routes
│   ├── api/chat/           # Streaming Gemini chat endpoint
│   ├── api/visitor-count/  # Visitor tracking
│   ├── blogs/[slug]/       # Blog detail page + OG image
│   ├── tags/[tag]/         # Tag listing page
│   ├── about/              # About page
│   ├── privacy/            # Privacy policy
│   └── feed.xml/           # RSS feed route
├── Components/             # Shared React components
├── content/blog/           # Markdown blog posts (auto-committed by CI)
├── Firebase/               # Firebase client and admin config
├── Lib/                    # Data access (blog parsing, auth, utilities)
├── scripts/
│   └── generateBlog.js     # AI blog generation script (runs in CI)
├── public/                 # Static assets and blog images
└── .github/workflows/
    └── daily-blog.yml      # Scheduled GitHub Action
```

---

## Getting Started

### Prerequisites

- Node.js >= 22
- A Google Gemini API key
- A Firebase project (Firestore enabled)

### Install

```bash
npm install
```

### Environment variables

Create `.env.local`:

```env
# Google Gemini (required for chat widget and blog generation)
GEMINI_API_KEY=your_key_here

# Firebase client SDK
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin SDK (for server-side operations)
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=
```

### Run locally

```bash
npm run dev
```

### Build for production

```bash
npm run build
npm start
```

---

## AI Blog Generation

The script `scripts/generateBlog.js` generates three Markdown files per run and commits them to `content/blog/`. Each article includes a YAML frontmatter block with title, date, description, tags, header image, and author.

**Run manually:**

```bash
GEMINI_API_KEY=your_key node scripts/generateBlog.js
```

The script:
1. Fetches live news from ~10 public sources (no extra API keys needed)
2. Calls Gemini with a news-aware prompt for each of the three categories
3. Sanitizes the output (strips LaTeX, escapes bare angle brackets for MDX compatibility)
4. Writes `.md` files to `content/blog/`

**Automated via GitHub Actions** — add `GEMINI_API_KEY` as a repository secret and the workflow runs automatically at 00:00 UTC daily.

---

## Deployment

The site is deployed on Vercel. After deploying:

1. Add `GEMINI_API_KEY` and all Firebase variables in **Project Settings → Environment Variables**
2. Redeploy so the chat widget and API routes can access them

---

## License

[MIT](LICENSE)
