import { GoogleGenerativeAI } from "@google/generative-ai";
import { getAllBlogMetadata } from "../../../Lib/Data";

function scoreRelevance(query, post) {
    const words = query.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    if (!words.length) return 0;
    const haystack = [post.title, post.description, post.tags.join(' '), post.excerpt].join(' ').toLowerCase();
    return words.filter(w => haystack.includes(w)).length;
}

export async function POST(req) {
    // Clear error when key is not configured in Vercel env vars
    if (!process.env.GEMINI_API_KEY) {
        return new Response(
            "TechSheet AI is not configured yet. Add GEMINI_API_KEY to your Vercel environment variables (Project Settings → Environment Variables), then redeploy.",
            { status: 503 }
        );
    }

    try {
        const { message, history = [] } = await req.json();
        if (!message?.trim()) return new Response("Missing message", { status: 400 });

        // Lightweight metadata load — no full content, won't timeout in serverless
        const posts = await getAllBlogMetadata();

        const scored = posts
            .map(p => ({ post: p, score: scoreRelevance(message, p) }))
            .sort((a, b) => b.score - a.score)
            .slice(0, 5);

        const contextPosts = scored[0]?.score > 0 ? scored.map(s => s.post) : posts.slice(0, 3);

        const context = contextPosts.map(p =>
            `TITLE: ${p.title}\nTAGS: ${p.tags.join(', ')}\nSUMMARY: ${p.description}\nEXCERPT: ${p.excerpt}`
        ).join('\n\n---\n\n');

        const systemPrompt = `You are TechSheet AI, a helpful assistant for the TechSheet developer blog. Answer based on the blog content below. Be concise and practical. Reference article titles when relevant.

BLOG CONTENT:
${context}`;

        const conversationHistory = history.slice(-6).map(m => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.content }],
        }));

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const chat = model.startChat({
            history: [
                { role: 'user', parts: [{ text: systemPrompt }] },
                { role: 'model', parts: [{ text: "Understood. I'm TechSheet AI, ready to help." }] },
                ...conversationHistory,
            ],
        });

        const result = await chat.sendMessageStream(message);

        const stream = new ReadableStream({
            async start(controller) {
                const encoder = new TextEncoder();
                for await (const chunk of result.stream) {
                    const text = chunk.text();
                    if (text) controller.enqueue(encoder.encode(text));
                }
                controller.close();
            },
        });

        return new Response(stream, {
            headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-cache' },
        });
    } catch (err) {
        console.error('[chat/route]', err.message);
        const msg = err.message?.includes('API_KEY') || err.message?.includes('403')
            ? "API key error — check GEMINI_API_KEY in Vercel environment variables."
            : "Something went wrong. Please try again.";
        return new Response(msg, { status: 500 });
    }
}
