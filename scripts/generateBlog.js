require('dotenv').config();
require('dotenv').config({ path: '.env.local' });
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const path = require('path');

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateBlog() {
    console.log("🚀 Starting blog generation process...");

    if (!process.env.GEMINI_API_KEY) {
        console.error("❌ GEMINI_API_KEY is not set. Please check your .env.local file or GitHub secrets.");
        process.exit(1);
    }

    const domains = [
        "AI & Machine Learning", "Web Development", "DevOps & CI/CD", 
        "Cloud Computing", "Cybersecurity", "Software Architecture", 
        "Frontend Frameworks", "Backend Engineering", "Database Systems", 
        "Mobile App Development", "IoT & Edge Computing", "Blockchain in Tech"
    ];

    try {
        const domain = domains[Math.floor(Math.random() * domains.length)];
        console.log(`✨ Broad domain selected: ${domain}`);

        const prompt = `
            You are a Senior Full-Stack Architect and Technical Blogger for "TechSheet".
            Your task is to come up with a highly unique, cutting-edge, and engaging topic within the broad domain of: "${domain}".
            Do NOT write about generic concepts. Always improve the content by finding a fresh, specific angle, an emerging tool, or an advanced pattern that developers would find fascinating today.
            Write a detailed, high-quality technical blog post about your chosen specific topic.
            
            Target length: 800-1200 words.
            Style: Informative, professional, and developer-focused.
            Format: Clean Markdown.

            The blog must include:
            1. An SEO-optimized title that clearly states the unique topic.
            2. A compelling meta description.
            3. Detailed sections using H2 and H3 headings.
            4. Practical code examples (where relevant) in appropriate languages (JavaScript, TS, Python, etc.).
            5. Deep-dive explanations of complex concepts.
            6. Real-world use cases or scenarios.
            7. A strong summary/conclusion.
            8. 3-5 relevant tags.

            Return the output as a JSON object with this EXACT structure (No markdown fences around JSON):
            {
                "title": "Title of the blog",
                "description": "Short SEO description",
                "tags": ["tag1", "tag2", "tag3"],
                "content": "Full markdown content (H2, H3, paragraphs, code blocks, etc.)"
            }
        `;

        const possibleModels = [
            "gemini-2.0-flash", // Favored newest model
            "gemini-1.5-flash",
            "gemini-flash-latest", 
            "gemini-pro-latest",
            "gemini-pro"
        ];
        
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
                // Continue to next model
            }
        }

        if (!success) {
            throw new Error("All generative models failed. Please check your API key/quota.");
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
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}`;

        // Create slug from title
        const slug = blogData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const filename = `${formattedDate}-${slug}.md`;
        const outputDir = path.join(process.cwd(), 'content', 'blog');

        // Ensure directory exists
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // Use a random image service with a seed based on the post slug so it's always uniquely different for each blog
        const randomImageSeed = slug + '-' + Math.floor(Math.random() * 100000);
        
        const blogFileContent = `---
title: "${blogData.title}"
date: "${formattedDate}"
description: "${blogData.description}"
tags: ${JSON.stringify(blogData.tags)}
headerImage: "https://picsum.photos/seed/${randomImageSeed}/1200/800"
author: "Thanga Mariappan"
isPublished: true
---

${blogData.content}
`;

        fs.writeFileSync(path.join(outputDir, filename), blogFileContent);
        console.log(`✅ Success! New blog post created: ${filename}`);

    } catch (error) {
        console.error("❌ Error generating blog:", error.message);
        process.exit(1);
    }
}

generateBlog();
