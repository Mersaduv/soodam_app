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