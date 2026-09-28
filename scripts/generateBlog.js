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

// ─── JSON Repairer ─────────────────────────────────────────────────────────────
// Fixes unescaped newlines/tabs inside JSON string values (common with Gemini output)
function repairJSON(jsonStr) {
    let result = '';
    let inString = false;
    let escaped = false;
    for (let i = 0; i < jsonStr.length; i++) {
        const ch = jsonStr[i];
        if (escaped) { result += ch; escaped = false; continue; }
        if (ch === '\\') { result += ch; escaped = true; continue; }
        if (ch === '"') { inString = !inString; result += ch; continue; }
        if (inString && (ch === '\n' || ch === '\r')) { result += ' '; continue; }
        if (inString && ch === '\t') { result += ' '; continue; }
        result += ch;
    }
    return result;
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

// ─── Existing post titles loader (deduplication) ───────────────────────────────
function loadRecentPostTitles(limit = 30) {
    const contentDir = path.join(process.cwd(), 'content', 'blog');
    if (!fs.existsSync(contentDir)) return [];
    return fs.readdirSync(contentDir)
        .filter(f => f.endsWith('.md'))
        .sort().reverse()
        .slice(0, limit)
        .map(f => f.replace(/^\d{4}-\d{2}-\d{2}-[a-z]+-/, '').replace(/-/g, ' ').replace(/\.md$/, ''));
}

// ─── Blog Generator ────────────────────────────────────────────────────────────
async function generateSingleBlog(blogConfig) {
    console.log(`\n🚀 Generating: ${blogConfig.type}...`);

    const recentTitles = loadRecentPostTitles(30);
    const recentTitlesList = recentTitles.slice(0, 15).map((t, i) => `${i + 1}. ${t}`).join('\n');

    const prompt = `
You are Thanga Mariappan Pandian — a Senior Front-End Architect with 10+ years of experience at enterprise scale, writing for your personal technical blog TechSheet (techsheet.vercel.app).

TASK: Write ONE high-quality, original blog post.

Category: "${blogConfig.type}"

${blogConfig.instructions}

RECENTLY PUBLISHED TITLES (do NOT duplicate or closely repeat these topics):
${recentTitlesList || 'None yet.'}

OUTPUT FORMAT (strict JSON, no markdown fences):
{
  "title": "Specific, non-generic title — no 'Beyond X' or 'Mastering X' patterns",
  "description": "Compelling meta description (max 160 chars) — must be specific, not vague",
  "tags": ["tag1", "tag2", "tag3"],
  "content": "Full Markdown content"
}

CONTENT REQUIREMENTS:
- Length: 1200–1800 words
- Originality: Write from DIRECT personal experience. Include a real scenario, a mistake you made and learned from, or a non-obvious opinion that might be controversial.
- No generic "here are 5 tips" structures. Give ONE focused, deep insight.
- Code must be real, runnable, and non-trivial. Show the actual problem AND the solution.
- AVOID: vague statements, marketing buzzwords, "it's important to...", "in today's world..."
- End with a single concrete action the reader can take TODAY, not a list of generic takeaways.
- CRITICAL MDX RULE: Never use bare < or > outside code blocks. Never use LaTeX math syntax (\$\$...\$\$). Never use {expression} patterns outside code blocks.
`;

    const possibleModels = ["gemini-flash-latest", "gemini-2.5-flash", "gemini-2.0-flash", "gemini-pro-latest"];
    let successModel = null;
    let result;

    for (const modelName of possibleModels) {
        try {
            console.log(`  🤖 Trying model: ${modelName}...`);
            const model = genAI.getGenerativeModel({
                model: modelName,
                generationConfig: { responseMimeType: "application/json" },
            });
            result = await model.generateContent(prompt);
            successModel = modelName;
            console.log(`  ✅ Success with: ${modelName}`);
            break;
        } catch (err) {
            console.warn(`  ⚠️  ${modelName} failed: ${err.message}`);
        }
    }

    if (!successModel) throw new Error(`All models failed for: ${blogConfig.type}`);

    function extractAndRepair(raw) {
        const s = raw.indexOf('{'), e = raw.lastIndexOf('}');
        const json = (s !== -1 && e !== -1) ? raw.substring(s, e + 1) : raw;
        return repairJSON(json);
    }

    let blogData;
    let parseAttempts = 3;
    while (parseAttempts > 0) {
        const cleaned = extractAndRepair(result.response.text().trim());
        try {
            blogData = JSON.parse(cleaned);
            break;
        } catch (parseError) {
            parseAttempts--;
            if (parseAttempts === 0) {
                console.error("❌ JSON parse failed after 3 attempts:", cleaned.slice(0, 300));
                throw new Error(`Invalid JSON: ${parseError.message}`);
            }
            console.warn(`  ⚠️  JSON parse failed (${parseError.message}), retrying generation...`);
            const model = genAI.getGenerativeModel({
                model: successModel,
                generationConfig: { responseMimeType: "application/json" },
            });
            result = await model.generateContent(prompt);
        }
    }

    const date = new Date();
    const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const slug = blogData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const filename = `${formattedDate}-${blogConfig.prefix}-${slug}.md`;
    const outputDir = path.join(process.cwd(), 'content', 'blog');

    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const fileContent = `---
title: "${blogData.title.replace(/"/g, '\\"')}"
date: "${formattedDate}"
description: "${blogData.description.replace(/"/g, '\\"')}"
tags: ${JSON.stringify(blogData.tags)}
author: "Thanga Mariappan Pandian"
isPublished: false
---`;

${sanitizeMDXContent(blogData.content)}
`;
    fs.writeFileSync(path.join(outputDir, filename), fileContent);
    console.log(`  📝 Created: ${filename}`);
    return blogData.title.replace(/"/g, "'");
}

// ─── Main ──────────────────────────────────────────────────────────────────────
async function generateAllBlogs() {
    console.log("🚀 TechSheet Blog Engine — Draft Generation (1 post/day)");
    if (!process.env.GEMINI_API_KEY) {
        console.error("❌ GEMINI_API_KEY is not set.");
        process.exit(1);
    }

    const { aiItems, techItems } = await gatherLiveNews();

    const today = new Date().toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
    const dayOfWeek = new Date().getDay(); // 0=Sun, 1=Mon, ...

    const noAINews = 'No live feeds available — use your knowledge of the latest AI releases and model updates.';
    const noTechNews = 'No live feeds available — choose a specific trending topic from React, TypeScript, or systems design.';

    // Rotate category by day of week so no single topic dominates
    const categories = [
        {
            type: "Technical Deep-Dive",
            prefix: "tech",
            instructions: `
TODAY: ${today}

TRENDING RIGHT NOW (Hacker News, GitHub Blog, Dev.to):
${formatNews(techItems, noTechNews)}

Pick ONE specific topic from above. Requirements:
- Write from personal experience — describe a specific production problem you solved using this technology
- Show the actual bug/mistake FIRST, then the correct approach with real code
- Include benchmarks or concrete metrics where possible
- The reader is a senior engineer; skip basic explanations, go straight to the non-obvious insight
- Do NOT write a "top 5 tools" or "intro to X" post — pick one specific technical problem and go deep`,
        },
        {
            type: "Architecture Decision Record",
            prefix: "architecture",
            instructions: `
TODAY: ${today}

Write an Architecture Decision Record (ADR) style post — one real architectural decision, the context, the alternatives considered, and why you chose what you chose.
Examples: why you moved from REST to GraphQL (or back), why you chose Zustand over Redux, why you stopped using micro-frontends.
INDUSTRY CONTEXT: ${formatNews(techItems.slice(0, 4), noTechNews)}

Requirements:
- Base this on a REAL decision with REAL trade-offs — not hypotheticals
- Include the specific constraints that drove the decision (team size, traffic, deadlines)
- Show what you would do differently with hindsight
- Be honest about what didn't work — readers trust vulnerability more than perfection`,
        },
        {
            type: "AI Developer Tools Analysis",
            prefix: "ai",
            instructions: `
TODAY: ${today}

LIVE NEWS from OpenAI, Google AI, Hugging Face, DeepMind, The Verge, Hacker News:
${formatNews(aiItems, noAINews)}

Pick ONE specific development from above that materially affects how front-end engineers build software.
Requirements:
1. Write only about news items LISTED ABOVE — do not invent or extrapolate stories
2. Explain exactly what changed technically — not just marketing language
3. Show a concrete code example of how this changes a developer's workflow
4. Give your honest opinion: is this actually useful, or is it hype?
5. Name exact model versions, dates, and API endpoints as given in the news
6. Do NOT write a roundup — pick one story and go deep on the technical implications`,
        },
    ];

    // Rotate: Mon=tech, Tue=architecture, Wed=ai, Thu=tech, Fri=architecture
    const rotation = [1, 2, 0, 1, 2]; // indexed Mon–Fri (dayOfWeek 1–5)
    const configIndex = dayOfWeek >= 1 && dayOfWeek <= 5
        ? rotation[dayOfWeek - 1]
        : Math.floor(Math.random() * categories.length);
    const config = categories[configIndex];

    try {
        const title = await generateSingleBlog(config);

        if (process.env.GITHUB_ENV) {
            const msg = humanCommitMessage([title]);
            fs.appendFileSync(process.env.GITHUB_ENV, `BLOG_COMMIT_MSG=${msg}\n`);
            console.log(`\n📝 Commit message: ${msg}`);
        }

        console.log(`\n✅ Draft created: ${title}`);
        console.log('⚠️  Post is set to isPublished: false — review and edit before publishing.');
    } catch (err) {
        console.error("❌ Fatal error:", err.message);
        process.exit(1);
    }
}

generateAllBlogs();
