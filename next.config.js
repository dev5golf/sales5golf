/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    // output: 'export', // Vercel에서는 API 라우트 사용을 위해 주석 처리
    images: {
        unoptimized: true,
        remotePatterns: [
            { protocol: 'https', hostname: 'images.unsplash.com' }
        ]
    }
};

module.exports = nextConfig;


