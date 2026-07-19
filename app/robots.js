export default function robots() {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
        },
        sitemap: 'https://techsheet.vercel.app/sitemap.xml',
    };
}
