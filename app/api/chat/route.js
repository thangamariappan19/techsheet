import { GoogleGenerativeAI } from "@google/generative-ai";
import { getAllBlogPosts } from "../../../Lib/Data";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

function scoreRelevance(query, post) {
    const words = query.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    if (!words.length) return 0;
    const haystack = [
        post.data.Title,
        post.data.Abstract,
        post.data.Tags,
        post.content.slice(0, 600),
    ].join(" ").toLowerCase();
    return words.filter(w => haystack.includes(w)).length;
}

export async function POST(req) {
    try {
        const { message, history = [] } = await req.json();
        if (!message?.trim()) {
            return new Response("Missing message", { status: 400 });
        }

        const allPosts = await getAllBlogPosts();
        const published = allPosts.filter(p => p.data.isPublished);

        // Pick top 5 most relevant posts by keyword overlap
        const scored = published
            .map(p => ({ post: p, score: scoreRelevance(message, p) }))
            .sort((a, b) => b.score - a.score)
            .slice(0, 5);

        // If nothing relevant found, fall back to 3 most recent posts
        const contextPosts = scored[0]?.score > 0
            ? scored.map(s => s.post)
            : published
                .sort((a, b) => new Date(b.data.Date) - new Date(a.data.Date))
                .slice(0, 3);

        const context = contextPosts.map(p => {
            const tags = Array.isArray(p.data.tags) ? p.data.tags.join(", ") : (p.data.Tags || "");
            const excerpt = p.content.replace(/#+\s/g, '').replace(/\*\*/g, '').slice(0, 500);
            return `TITLE: ${p.data.Title}\nTAGS: ${tags}\nSUMMARY: ${p.data.Abstract}\nEXCERPT: ${excerpt}`;
        }).join("\n\n---\n\n");

        const systemPrompt = `You are TechSheet AI, a helpful assistant for the TechSheet developer blog. Answer questions using the blog content below as your primary source. Be concise and practical. If asked about a specific topic, reference the relevant article title. If the blog doesn't cover something, say so and give a brief general answer.

BLOG CONTENT:
${context}`;

        // Build conversation for Gemini
        const conversationHistory = history.slice(-6).map(msg => ({
            role: msg.role === "user" ? "user" : "model",
            parts: [{ text: msg.content }],
        }));

        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const chat = model.startChat({
            history: [
                { role: "user", parts: [{ text: systemPrompt }] },
                { role: "model", parts: [{ text: "Understood. I'm TechSheet AI, ready to help with questions about the blog content." }] },
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
            headers: {
                "Content-Type": "text/plain; charset=utf-8",
                "Cache-Control": "no-cache",
            },
        });
    } catch (err) {
        console.error("[chat/route]", err);
        return new Response("Something went wrong. Please try again.", { status: 500 });
    }
}
