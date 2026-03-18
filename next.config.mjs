/** @type {import('next').NextConfig} */
const nextConfig = {
    output: process.env.VERCEL ? undefined : 'export',
    trailingSlash: true,
    images: {
        unoptimized: true,
    },
};

export default nextConfig;
