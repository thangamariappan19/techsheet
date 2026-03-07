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
          Author: data.Author || data.author || "TechSheet AI",
          Date: data.date || data.Date,
          HeaderImage: data.HeaderImage || data.headerImage,
          isPublished: data.isPublished !== undefined ? data.isPublished : true,
          slug: data.slug || (data.Title || data.title || "").toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || file.replace('.md', '').replace('.mdx', '')
        },
        content,
        readTime
      };
    });

  return allBlogs;
};

export const getBlogPostBySlug = async (slug) => {
  const allBlogs = await getAllBlogPosts();
  const cleanLookupSlug = slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  return allBlogs.find(blog => 
    blog.data.slug === slug || 
    blog.data.slug === cleanLookupSlug ||
    (blog.data.Title || "").toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') === cleanLookupSlug
  );
};
