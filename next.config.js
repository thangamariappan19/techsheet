/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    // Compress responses
    compress: true,
    // Reduce logging noise in CI
    logging: { fetches: { fullUrl: false } },
    images: {
        // Cache remote images for 7 days instead of the default 60s
        minimumCacheTTL: 604800,
        remotePatterns: [
            { protocol: "https", hostname: "images.unsplash.com" },
            { protocol: "https", hostname: "cdn.buymeacoffee.com" },
            { protocol: "https", hostname: "twitter.com" },
            { protocol: "https", hostname: "picsum.photos" },
            { protocol: "https", hostname: "fastly.picsum.photos" },
        ],
    },
};

module.exports = nextConfig;
