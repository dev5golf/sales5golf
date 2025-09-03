/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    // output: 'export', // 동적 라우트 문제로 임시 비활성화
    images: {
        unoptimized: true,
        remotePatterns: [
            { protocol: 'https', hostname: 'images.unsplash.com' }
        ]
    }
};

module.exports = nextConfig;


