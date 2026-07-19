import { getAllBlogPosts } from '../Lib/Data';

const BASE_URL = 'https://techsheet.vercel.app';

export default async function sitemap() {
    const posts = await getAllBlogPosts();
    const published = posts.filter(p => p.data.isPublished !== false);

    const blogUrls = published.map(post => ({
        url: `${BASE_URL}/blogs/${post.data.slug}`,
        lastModified: new Date(post.data.Date || Date.now()),
        changeFrequency: 'weekly',
        priority: 0.8,
    }));

    const allTags = [...new Set(
        published.flatMap(p =>
            p.data.Tags ? p.data.Tags.split(/[ ,]+/).filter(Boolean) : []
        )
    )];

    const tagUrls = allTags.map(tag => ({
        url: `${BASE_URL}/tags/${tag.toLowerCase().trim()}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.6,
    }));

    return [
        { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
        { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
        ...blogUrls,
        ...tagUrls,
    ];
}
