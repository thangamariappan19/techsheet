/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
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
