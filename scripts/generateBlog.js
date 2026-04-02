require('dotenv').config();
require('dotenv').config({ path: '.env.local' });
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const path = require('path');

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateSingleBlog(blogConfig) {
    console.log(`\n🚀 Generating blog for type: ${blogConfig.type}...`);
    
    const prompt = `
        You are a Senior Full-Stack Architect, Engineering Manager, and Technical Blogger.
        Your task is to write a highly unique and engaging blog post focusing on: "${blogConfig.type}".
        
        ${blogConfig.instructions}
        
        Target length: 800-1200 words.
        Style: Informative, professional, viral readability (Simple English).
        Format: Clean Markdown.
        CRITICAL MDX RULE: Do not use unescaped "<" or ">" symbols outside of code blocks as it breaks MDX parsers.

        The blog must include:
        1. An SEO-optimized title that clearly states the unique topic.
        2. A compelling meta description.
        3. Hook in the first 2 lines.
        4. Detailed sections using H2 and H3 headings.
        5. "Key Takeaways" section.
        6. "How you can use this" section.
        7. Internal linking suggestions at the end.
        8. Suggest LinkedIn + Medium post captions at the very end.
        9. 3-5 relevant tags.

        Return the output as a JSON object with this EXACT structure (No markdown fences around JSON):
        {
            "title": "Title of the blog",
            "description": "Short SEO description",
            "tags": ["tag1", "tag2", "tag3"],
            "content": "Full markdown content (H2, H3, paragraphs, code blocks, etc.)"
        }
    `;

    const possibleModels = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-flash-latest", "gemini-pro-latest"];
    let result;
    let success = false;

    for (const modelName of possibleModels) {
        try {
            console.log(`🤖 Attempting to generate with model: ${modelName}...`);
            const model = genAI.getGenerativeModel({ 
                model: modelName,
                generationConfig: { responseMimeType: "application/json" }
            });
            result = await model.generateContent(prompt);
            success = true;
            console.log(`✅ Success with model: ${modelName}`);
            break;
        } catch (err) {
            console.warn(`⚠️ Model ${modelName} failed: ${err.message}`);
        }
    }

    if (!success) {
        throw new Error(`All generative models failed for ${blogConfig.type}.`);
    }

    const response = await result.response;
    const rawText = response.text().trim();
    
    // Defensive JSON extraction logic
    let cleanedJson = rawText;
    const startBrace = rawText.indexOf('{');
    const endBrace = rawText.lastIndexOf('}');
    if (startBrace !== -1 && endBrace !== -1) {
        cleanedJson = rawText.substring(startBrace, endBrace + 1);
    }
    
    let blogData;
    try {
        blogData = JSON.parse(cleanedJson);
    } catch (parseError) {
        console.error("❌ Failed to parse Gemini response as JSON. Content received:", rawText);
        throw new Error(`Invalid JSON format: ${parseError.message}`);
    }

    const date = new Date();
    const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    
    const slug = blogData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const filename = `${formattedDate}-${blogConfig.prefix}-${slug}.md`;
    const outputDir = path.join(process.cwd(), 'content', 'blog');
    
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const randomImageSeed = slug + '-' + Math.floor(Math.random() * 100000);
    const blogFileContent = `---
title: "${blogData.title.replace(/"/g, '\\"')}"
date: "${formattedDate}"
description: "${blogData.description.replace(/"/g, '\\"')}"
tags: ${JSON.stringify(blogData.tags)}
headerImage: "https://picsum.photos/seed/${randomImageSeed}/1200/800"
author: "Thanga Mariappan"
isPublished: true
---

${blogData.content}
`;
    fs.writeFileSync(path.join(outputDir, filename), blogFileContent);
    console.log(`✅ Success! New blog post created: ${filename}`);
    
    return blogData.title.replace(/"/g, "'");
}

async function generateAllBlogs() {
    console.log("🚀 Starting daily triple-blog generation process...");
    if (!process.env.GEMINI_API_KEY) {
        console.error("❌ GEMINI_API_KEY is not set. Please check your .env.local file or GitHub secrets.");
        process.exit(1);
    }

    const configurations = [
        {
            type: "Technical Deep-Dive",
            prefix: "tech",
            instructions: `Topic Focus: Practical, trending, and useful for developers (Angular, React, AI tools, system design, debugging, performance, etc.).
            Content rules: Include real-world examples, code snippets, problem-solving. Beginner to advanced explanation. Make it SEO optimized.`
        },
        {
            type: "Engineering Management & Leadership",
            prefix: "manager",
            instructions: `Topic Focus: A developer transitioning into an Associate Manager role.
            Content rules: Team handling, stakeholder management, sprint planning, conflict resolution, delivery pressure, career growth. Write as real experience + lessons (even if simulated). Make it relatable for IT professionals. SEO optimized.`
        },
        {
            type: "AI News & Trends",
            prefix: "ai",
            instructions: `Topic Focus: Latest updates from OpenAI, Anthropic (Claude), Google Gemini, etc.
            Content rules: Explain what changed, why it matters, and how it impacts developers/managers. Keep it short, viral, and easy to read. SEO optimized.`
        }
    ];

    try {
        const titles = [];
        for (let i = 0; i < configurations.length; i++) {
            const config = configurations[i];
            const title = await generateSingleBlog(config);
            titles.push(title);
            
            // Add a robust delay between requests (35 seconds) to avoid Gemini Free Tier quota errors.
            if (i < configurations.length - 1) {
                console.log("⏳ Waiting 35 seconds to prevent rate-limiting...");
                await new Promise(resolve => setTimeout(resolve, 35000));
            }
        }

        // Generate a human-like commit message for the automation
        if (process.env.GITHUB_ENV) {
            const combinedMsg = `chore: Daily Drop - Tech, Managerial, and AI News`;
            fs.appendFileSync(process.env.GITHUB_ENV, `BLOG_COMMIT_MSG=${combinedMsg}\\n`);
            console.log(`📝 Set commit message: ${combinedMsg}`);
        }
        
        console.log("🎉 All 3 daily blog posts generated successfully!");
    } catch (err) {
        console.error("❌ Error generating blogs:", err.message);
        process.exit(1);
    }
}

generateAllBlogs();
