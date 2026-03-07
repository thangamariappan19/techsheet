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

    const topics = [
        "Artificial Intelligence & Machine Learning in Software Development",
        "Next.js 15 & React Server Components Best Practices",
        "Modern Web Architecture: From Monoliths to Micro-frontends",
        "DevOps Automation & CI/CD Pipelines for 2026",
        "Cloud Native Applications on AWS/Azure/GCP",
        "Essential Developer Tools to Boost Productivity",
        "Cybersecurity Fundamentals for Web Developers",
        "Software Engineering Trends: What to Expect in the Next 2 Years",
        "Emerging Programming Frameworks that are Changing the Industry",
        "Performance Optimization Strategies for Modern Web Apps"
    ];

    try {
        const selectedTopic = topics[Math.floor(Math.random() * topics.length)];
        console.log(`✨ Topic selected: ${selectedTopic}`);

        const prompt = `
            You are a Senior Full-Stack Architect and Technical Blogger for "TechSheet".
            Write a detailed, high-quality technical blog post about: "${selectedTopic}".
            
            Target length: 800-1200 words.
            Style: Informative, professional, and developer-focused.
            Format: Clean Markdown.

            The blog must include:
            1. An SEO-optimized title.
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
            "gemini-flash-latest", 
            "gemini-pro-latest",
            "gemini-1.5-flash", 
            "gemini-pro", 
            "gemini-1.5-pro", 
            "gemini-2.0-flash"
        ];
        let result;
        let success = false;

        for (const modelName of possibleModels) {
            try {
                console.log(`🤖 Attempting to generate with model: ${modelName}...`);
                const model = genAI.getGenerativeModel({ model: modelName });
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
        
        // Clean potential markdown code blocks around JSON if the model included them
        const cleanedJson = rawText.replace(/^```json/, '').replace(/```$/, '').trim();
        
        let blogData;
        try {
            blogData = JSON.parse(cleanedJson);
        } catch (parseError) {
            console.error("❌ Failed to parse Gemini response as JSON. Retrying with content-only format if possible...");
            // Fallback: If JSON parsing fails, the model might have returned text. We'll try to extract manually or just fail.
            throw new Error("Invalid Gemini response format");
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

        const blogFileContent = `---
title: "${blogData.title}"
date: "${formattedDate}"
description: "${blogData.description}"
tags: ${JSON.stringify(blogData.tags)}
headerImage: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1200&auto=format&fit=crop&keywords=${encodeURIComponent(blogData.title)}"
author: "TechSheet AI"
isPublished: true
---

${blogData.content}

---
*This post was automatically generated by **TechSheet AI** on ${formattedDate}.*
`;

        fs.writeFileSync(path.join(outputDir, filename), blogFileContent);
        console.log(`✅ Success! New blog post created: ${filename}`);

    } catch (error) {
        console.error("❌ Error generating blog:", error.message);
        process.exit(1);
    }
}

generateBlog();
