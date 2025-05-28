/** @type {import('next').NextConfig} */
const nextConfig: import('next').NextConfig = {
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      issuer: /\.[jt]sx?$/,
      use: [{
        loader: '@svgr/webpack',
        options: {
          typescript: true,
          icon: true
        }
      }]
    });
    return config;
  },
  images: {
    domains: ['localhost', '194.5.193.119'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '194.5.193.119',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://194.5.193.119:8000/api/:path*'
      }
    ];
  },
  experimental: {
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
}

module.exports = nextConfig