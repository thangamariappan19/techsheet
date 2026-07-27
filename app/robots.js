export default function robots() {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/api/', '/pages/api/'],
            },
        ],
        sitemap: 'https://techsheet.vercel.app/sitemap.xml',
    };
}
