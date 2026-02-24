/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        domains: ["images.unsplash.com", "cdn.buymeacoffee.com", "twitter.com"],
    },
};

module.exports = nextConfig;
