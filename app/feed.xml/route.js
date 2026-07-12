import { getAllBlogPosts } from "../../Lib/Data";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://techsheet.vercel.app";

function escapeXml(str) {
    return (str || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}

export async function GET() {
    const all = await getAllBlogPosts();
    const posts = all
        .filter(p => p.data.isPublished)
        .sort((a, b) => new Date(b.data.Date) - new Date(a.data.Date))
        .slice(0, 30);

    const items = posts.map(p => {
        const title = escapeXml(p.data.Title || p.data.title);
        const desc = escapeXml(p.data.Abstract || p.data.description);
        const url = `${SITE_URL}/blogs/${p.data.slug}`;
        const date = p.data.Date ? new Date(p.data.Date).toUTCString() : new Date().toUTCString();
        const tags = (Array.isArray(p.data.tags) ? p.data.tags : (p.data.Tags || "").split(/[ ,]+/))
            .filter(Boolean)
            .map(t => `<category>${escapeXml(t)}</category>`)
            .join("");
        return `
    <item>
      <title>${title}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${desc}</description>
      <pubDate>${date}</pubDate>
      <author>thanga.m.pandian@accenture.com (Thanga Mariappan)</author>
      ${tags}
    </item>`;
    }).join("");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>TechSheet — Modern Developer Hub</title>
    <link>${SITE_URL}</link>
    <description>Tech blogs and articles on React, architecture, AI, and software development.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`;

    return new Response(xml, {
        headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600, s-maxage=3600",
        },
    });
}
