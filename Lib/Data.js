import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";

const dir = path.join(process.cwd(), "content", "blog");

export const getAllBlogPosts = async () => {
  if (!fs.existsSync(dir)) return [];

  const allFiles = fs.readdirSync(dir);
  const allBlogs = allFiles
    .filter(file => file.endsWith('.md') || file.endsWith('.mdx'))
    .map((file) => {
      const filePath = path.join(dir, file);
      const fileContent = fs.readFileSync(filePath, "utf-8");
      const { data, content } = matter(fileContent);
      const readTime = readingTime(content);
      return {
        data: {
          ...data,
          Title: data.Title || data.title,
          Abstract: data.Abstract || data.description,
          Tags: Array.isArray(data.tags) ? data.tags.join(" ") : (data.Tags || ""),
          Author: data.Author || "TechSheet AI",
          Date: data.date || data.Date,
          slug: data.slug || (data.Title || data.title || "").split(" ").join("-").toLowerCase() || file.replace('.md', '').replace('.mdx', '')
        },
        content,
        readTime
      };
    });

  return allBlogs;
};

export const getBlogPostBySlug = async (slug) => {
  const allBlogs = await getAllBlogPosts();
  return allBlogs.find(blog => blog.data.slug === slug);
};
