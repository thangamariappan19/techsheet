require('dotenv').config();
require('dotenv').config({ path: '.env.local' });
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const path = require('path');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ─── MDX Sanitizer ─────────────────────────────────────────────────────────────
// Prevents acorn/MDX parse errors from LaTeX, stray angle brackets, etc.
function sanitizeMDXContent(content) {
    content = content.replace(/\$\$([\s\S]*?)\$\$/g, (_, inner) => {
        const plain = inner
            .replace(/\\text\{([^}]*)\}/g, '$1')
            .replace(/\\[a-zA-Z]+\{([^}]*)\}/g, '$1')
            .replace(/\\[a-zA-Z]+/g, '')
            .replace(/[{}]/g, '')
            .replace(/\s+/g, ' ')
            .trim();
        return `**${plain}**`;
    });

    content = content.replace(/\$([^$\n]{1,120})\$/g, (_, inner) => {
        const plain = inner
            .replace(/\\text\{([^}]*)\}/g, '$1')
            .replace(/\\[a-zA-Z]+\{([^}]*)\}/g, '$1')
            .replace(/\\[a-zA-Z]+/g, '')
            .replace(/[{}]/g, '')
            .trim();
        return `\`${plain}\``;
    });

    const parts = content.split(/(```[\s\S]*?```|`[^`]+`)/g);
    return parts.map((part, i) => {
        if (i % 2 === 1) return part;
        return part
            .replace(/<(?![a-zA-Z/])/g, '&lt;')
            .replace(/(?<![a-zA-Z"'=])>/g, '&gt;');
    }).join('');
}

// ─── RSS Parser ────────────────────────────────────────────────────────────────
function parseRSSItems(xml, maxItems = 6) {
    const items = [];
    const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/gi;
    let match;
    while ((match = itemRegex.exec(xml)) !== null && items.length < maxItems) {
        const block = match[1];
        const extract = (tag) => {
            const m = block.match(new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${tag}>`, 'i'));
            if (!m) return '';
            return m[1]
                .replace(/<[^>]+>/g, '')
                .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
                .replace(/&quot;/g, '"').replace(/&#\d+;/g, '').replace(/&apos;/g, "'")
                .replace(/\s+/g, ' ').trim();
        };
        const title = extract('title');
        const description = extract('description').slice(0, 350);
        const pubDate = extract('pubDate');
        if (title && title.length > 10) items.push({ title, description, pubDate });
    }
    return items;
}

// ─── Fetch helpers ─────────────────────────────────────────────────────────────
async function fetchRSS(url, label) {
    try {
        const resp = await fetch(url, {
            headers: { 'User-Agent': 'TechSheet-NewsBot/2.0 (+https://techsheet.vercel.app)' },
            signal: AbortSignal.timeout(12000),
        });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const xml = await resp.text();
        const items = parseRSSItems(xml, 6);
        console.log(`  📡 ${label}: ${items.length} items`);
        return items.map(i => ({ ...i, source: label }));
    } catch (e) {
        console.warn(`  ⚠️  ${label} failed: ${e.message}`);
        return [];
    }
}

async function fetchHackerNews() {
    try {
        const resp = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json', {
            signal: AbortSignal.timeout(8000),
        });
        const ids = await resp.json();

        // Fetch top 60 stories in batches of 20
        const stories = [];
        for (let i = 0; i < Math.min(60, ids.length); i += 20) {
            const batch = ids.slice(i, i + 20);
            const results = await Promise.allSettled(
                batch.map(id =>
                    fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`, {
                        signal: AbortSignal.timeout(5000),
                    }).then(r => r.json())
                )
            );
            results.forEach(r => { if (r.status === 'fulfilled' && r.value?.title) stories.push(r.value); });
        }

        const AI_KW  = ['ai', 'llm', 'gpt', 'claude', 'gemini', 'openai', 'anthropic', 'mistral', 'llama', 'neural', 'machine learning', 'copilot', 'agent', 'model', 'deep learning', 'transformer', 'multimodal', 'reasoning', 'chatgpt'];
        const TECH_KW = ['react', 'next.js', 'typescript', 'rust', 'go ', 'python', 'bun', 'deno', 'node', 'docker', 'kubernetes', 'wasm', 'github', 'programming', 'framework', 'database', 'api', 'cloud', 'performance', 'security', 'devtools'];

        const ai   = stories.filter(s => AI_KW.some(k => s.title.toLowerCase().includes(k))).sort((a, b) => (b.score || 0) - (a.score || 0)).slice(0, 8);
        const tech = stories.filter(s => TECH_KW.some(k => s.title.toLowerCase().includes(k))).sort((a, b) => (b.score || 0) - (a.score || 0)).slice(0, 8);

        console.log(`  📡 Hacker News: ${ai.length} AI + ${tech.length} tech stories`);
        return {
            ai:   ai.map(s => ({ title: s.title, description: s.url || '', source: `Hacker News (${s.score || 0} pts)` })),
            tech: tech.map(s => ({ title: s.title, description: s.url || '', source: `Hacker News (${s.score || 0} pts)` })),
        };
    } catch (e) {
        console.warn(`  ⚠️  Hacker News failed: ${e.message}`);
        return { ai: [], tech: [] };
    }
}

async function fetchDevTo(tag, count = 5) {
    try {
        const resp = await fetch(`https://dev.to/api/articles?tag=${tag}&top=3&per_page=${count}`, {
            headers: { 'User-Agent': 'TechSheet-NewsBot/2.0' },
            signal: AbortSignal.timeout(8000),
        });
        const articles = await resp.json();
        console.log(`  📡 Dev.to #${tag}: ${articles.length} articles`);
        return articles.map(a => ({
            title: a.title,
            description: (a.description || '').slice(0, 280),
            source: `Dev.to #${tag}`,
        }));
    } catch (e) {
        console.warn(`  ⚠️  Dev.to #${tag} failed: ${e.message}`);
        return [];
    }
}

// ─── Orchestrator ──────────────────────────────────────────────────────────────
async function gatherLiveNews() {
    console.log('\n📰 Fetching live news from public sources (no API keys needed)...');

    const [
        hn,
        openAI,
        googleAI,
        github,
        huggingFace,
        vergeAI,
        deepMind,
        msDevBlog,
        devToAI,
        devToReact,
        devToWebDev,
    ] = await Promise.all([
        fetchHackerNews(),
        fetchRSS('https://openai.com/news/rss.xml',                              'OpenAI Blog'),
        fetchRSS('https://blog.google/technology/ai/rss/',                        'Google AI Blog'),
        fetchRSS('https://github.blog/feed/',                                     'GitHub Blog'),
        fetchRSS('https://huggingface.co/blog/feed.xml',                         'Hugging Face'),
        fetchRSS('https://www.theverge.com/ai-artificial-intelligence/rss/index.xml', 'The Verge AI'),
        fetchRSS('https://deepmind.google/blog/rss.xml',                         'Google DeepMind'),
        fetchRSS('https://devblogs.microsoft.com/feed/',                         'Microsoft Dev Blog'),
        fetchDevTo('ai', 5),
        fetchDevTo('react', 5),
        fetchDevTo('webdev', 4),
    ]);

    const aiItems = [
        ...openAI,
        ...googleAI,
        ...huggingFace,
        ...vergeAI,
        ...deepMind,
        ...devToAI,
        ...hn.ai,
    ].filter(i => i.title).slice(0, 14);

    const techItems = [
        ...github,
        ...msDevBlog,
        ...devToReact,
        ...devToWebDev,
        ...hn.tech,
    ].filter(i => i.title).slice(0, 12);

    console.log(`\n✅ Live news ready: ${aiItems.length} AI items · ${techItems.length} tech items\n`);
    return { aiItems, techItems };
}

function formatNews(items, fallback) {
    if (!items.length) return fallback;
    return items
        .map((item, i) => `${i + 1}. [${item.source}] ${item.title}${item.description ? `\n   → ${item.description}` : ''}`)
        .join('\n\n');
}

// ─── Human-looking commit message ─────────────────────────────────────────────
function humanCommitMessage(titles) {
    const first = titles[0] || 'new article';

    // Shorten a title to the first meaningful clause (before any colon or dash)
    const short = (t) => t.split(/[:\-–—]/)[0].trim().replace(/^(the|a|an)\s+/i, '');

    const templates = [
        () => `Add article: ${short(first)}`,
        () => `New post on ${short(first)}`,
        () => `Wrote about ${short(first)}`,
        () => `Published: ${short(first)}`,
        () => `${short(first)} — new article`,
        () => `Post: ${short(first)}`,
        () => `${short(titles[0] || first)} + ${titles.length - 1} more`,
        () => `Added ${titles.length} new articles`,
        () => `Update blog — ${short(first)}`,
        () => `New write-up: ${short(first)}`,
    ];

    const pick = templates[Math.floor(Math.random() * templates.length)];
    return pick();
}

// ─── Blog Generator ────────────────────────────────────────────────────────────
async function generateSingleBlog(blogConfig) {
    console.log(`\n🚀 Generating: ${blogConfig.type}...`);

    const prompt = `
You are a highly experienced Senior Front-End Architect and Technical Blogger writing for TechSheet.

TASK: Write a blog post for category: "${blogConfig.type}"

${blogConfig.instructions}

OUTPUT FORMAT (strict JSON, no markdown fences):
{
  "title": "SEO-optimized title",
  "description": "Compelling meta description (max 160 chars)",
  "tags": ["tag1", "tag2", "tag3"],
  "content": "Full Markdown content"
}

CONTENT REQUIREMENTS:
- Length: 900–1400 words
- Style: Sharp, professional, viral readability. Simple English. No fluff.
- Include H2 and H3 headings, real code snippets where applicable.
- End with: "## Key Takeaways" and "## What You Should Do Today" sections.
- CRITICAL MDX RULE: Never use bare < or > outside code blocks. Never use LaTeX math syntax ($$...$$). Never use {expression} patterns outside code blocks.
`;

    const possibleModels = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-flash-latest", "gemini-pro-latest"];
    let result;
    let success = false;

    for (const modelName of possibleModels) {
        try {
            console.log(`  🤖 Trying model: ${modelName}...`);
            const model = genAI.getGenerativeModel({
                model: modelName,
                generationConfig: { responseMimeType: "application/json" },
            });
            result = await model.generateContent(prompt);
            success = true;
            console.log(`  ✅ Success with: ${modelName}`);
            break;
        } catch (err) {
            console.warn(`  ⚠️  ${modelName} failed: ${err.message}`);
        }
    }

    if (!success) throw new Error(`All models failed for: ${blogConfig.type}`);

    const rawText = result.response.text().trim();
    let cleanedJson = rawText;
    const s = rawText.indexOf('{'), e = rawText.lastIndexOf('}');
    if (s !== -1 && e !== -1) cleanedJson = rawText.substring(s, e + 1);

    let blogData;
    try {
        blogData = JSON.parse(cleanedJson);
    } catch (parseError) {
        console.error("❌ JSON parse failed:", rawText.slice(0, 300));
        throw new Error(`Invalid JSON: ${parseError.message}`);
    }

    const date = new Date();
    const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const slug = blogData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const filename = `${formattedDate}-${blogConfig.prefix}-${slug}.md`;
    const outputDir = path.join(process.cwd(), 'content', 'blog');

    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const seed = slug + '-' + Math.floor(Math.random() * 100000);
    const fileContent = `---
title: "${blogData.title.replace(/"/g, '\\"')}"
date: "${formattedDate}"
description: "${blogData.description.replace(/"/g, '\\"')}"
tags: ${JSON.stringify(blogData.tags)}
headerImage: "https://picsum.photos/seed/${seed}/1200/800"
author: "Thanga Mariappan"
isPublished: true
---

${sanitizeMDXContent(blogData.content)}
`;
    fs.writeFileSync(path.join(outputDir, filename), fileContent);
    console.log(`  📝 Created: ${filename}`);
    return blogData.title.replace(/"/g, "'");
}

// ─── Main ──────────────────────────────────────────────────────────────────────
async function generateAllBlogs() {
    console.log("🚀 TechSheet Daily Blog Engine v2 — News-Aware Generation");
    if (!process.env.GEMINI_API_KEY) {
        console.error("❌ GEMINI_API_KEY is not set.");
        process.exit(1);
    }

    // Step 1: Gather live news BEFORE calling Gemini
    const { aiItems, techItems } = await gatherLiveNews();

    const today = new Date().toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });

    const noAINews = 'No live feeds available — use your knowledge of the latest AI releases, model updates, and industry moves as of today.';
    const noTechNews = 'No live feeds available — choose a trending topic from React, TypeScript, Rust, Go, or system design.';

    const configurations = [
        {
            type: "Technical Deep-Dive",
            prefix: "tech",
            instructions: `
TODAY: ${today}

WHAT IS TRENDING RIGHT NOW (live from Hacker News, GitHub Blog, Dev.to):
${formatNews(techItems, noTechNews)}

PICK the single most interesting topic from above that senior developers would love.
- If it covers a new tool, library, or release — explain what changed, why it matters, and show a migration or usage example.
- If it covers a new pattern or approach — show real code, benchmarks, trade-offs.
- Write as if you are the FIRST in-depth technical post about this. Don't just summarize — go deep.
- Assume the reader is a senior engineer who has already seen the headline.`,
        },
        {
            type: "Frontend Architecture & Systems",
            prefix: "architecture",
            instructions: `
TODAY: ${today}

INDUSTRY CONTEXT (recent discussions):
${formatNews(techItems.slice(0, 6), noTechNews)}

Write about advanced frontend architecture, scaling strategy, or engineering leadership.
You may use the industry context above to make the post timely, or choose a timeless architecture topic.
Focus on: design decisions, patterns, trade-offs, technical debt, team-level thinking.
Write as a Staff/Principal Engineer sharing hard-won experience — not theory, but reality.`,
        },
        {
            type: "Breaking AI & IT News Analysis",
            prefix: "ai",
            instructions: `
TODAY: ${today}

LIVE NEWS GATHERED RIGHT NOW from OpenAI, Google AI, Hugging Face, DeepMind, The Verge, Hacker News:
${formatNews(aiItems, noAINews)}

THIS IS A NEWS ANALYSIS BLOG. Rules:
1. You MUST write about the REAL news items listed above — do not invent stories.
2. Pick the 2–3 most significant stories. Prioritize announcements from big companies (OpenAI, Anthropic, Google, Meta, Microsoft).
3. For each story: What happened → Why it matters for developers → What should they do?
4. Be the FIRST deep analysis — readers want signal, not hype. No marketing language.
5. Name exact product names, model names, dates as given in the news above.
6. End with a "Bottom Line" section: one paragraph on what this week means for the industry.
7. Today's date is ${today} — make the timeliness obvious in the writing.`,
        },
    ];

    try {
        const titles = [];
        for (let i = 0; i < configurations.length; i++) {
            const title = await generateSingleBlog(configurations[i]);
            titles.push(title);

            if (i < configurations.length - 1) {
                console.log("\n⏳ Waiting 35s (free-tier rate limit)...\n");
                await new Promise(resolve => setTimeout(resolve, 35000));
            }
        }

        if (process.env.GITHUB_ENV) {
            const msg = humanCommitMessage(titles);
            fs.appendFileSync(process.env.GITHUB_ENV, `BLOG_COMMIT_MSG=${msg}\\n`);
            console.log(`\n📝 Commit message: ${msg}`);
        }

        console.log(`\n🎉 Done! Generated ${titles.length} posts:\n${titles.map((t, i) => `  ${i + 1}. ${t}`).join('\n')}`);
    } catch (err) {
        console.error("❌ Fatal error:", err.message);
        process.exit(1);
    }
}

generateAllBlogs();
