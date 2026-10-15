import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      { source: '/img/:path*', headers: [{ key: 'Cache-Control', value: 'public, max-age=2592000' }] },
    ];
  },
};

export default nextConfig;
