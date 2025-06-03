/** @type {import('next').NextConfig} */
const nextConfig: import('next').NextConfig = {
  // distDir: '../../backend-soodam/backend_soodam',
  distDir: '.next',
  output: 'export',
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
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://194.5.193.119:8000/api/:path*'
      },
      {
        source: '/media/:path*',
        destination: 'http://194.5.193.119:8000/media/:path*'
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
  // Custom build output configuration
  async generateBuildId() {
    return 'build';
  },
  // Move static files to static directory
  async onBuildComplete() {
    const fs = require('fs');
    const path = require('path');
    
    // Define paths
    const outDir = path.join(process.cwd(), 'out');
    const backendDir = path.join('out');
    const staticDir = path.join(backendDir, 'static');
    const templatesDir = path.join(backendDir, 'templates');

    // Create directories if they don't exist
    [staticDir, templatesDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });

    // Create static subdirectories
    const staticSubDirs = ['js', 'css', 'images'];
    staticSubDirs.forEach(dir => {
      const dirPath = path.join(staticDir, dir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
    });

    // Function to copy files
    function copyFile(source, destination) {
      try {
        if (fs.existsSync(source)) {
          fs.copyFileSync(source, destination);
          console.log(`Copied: ${source} -> ${destination}`);
        }
      } catch (error) {
        console.error(`Error copying file ${source}:`, error);
      }
    }

    // Copy files from out directory (static export)
    if (fs.existsSync(outDir)) {
      const files = fs.readdirSync(outDir);
      
      files.forEach(file => {
        const filePath = path.join(outDir, file);
        const stat = fs.statSync(filePath);

        if (stat.isFile()) {
          const ext = path.extname(file).toLowerCase();

          // Copy HTML files to templates
          if (ext === '.html') {
            copyFile(filePath, path.join(templatesDir, file));
          }
          // Copy static files to appropriate directories
          else if (ext === '.js') {
            copyFile(filePath, path.join(staticDir, 'js', file));
          }
          else if (ext === '.css') {
            copyFile(filePath, path.join(staticDir, 'css', file));
          }
          else if (['.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico'].includes(ext)) {
            copyFile(filePath, path.join(staticDir, 'images', file));
          }
        }
      });

      // Copy _next directory contents
      const nextDir = path.join(outDir, '_next');
      if (fs.existsSync(nextDir)) {
        // Copy static files
        const staticDir = path.join(nextDir, 'static');
        if (fs.existsSync(staticDir)) {
          // Copy CSS
          const cssDir = path.join(staticDir, 'css');
          if (fs.existsSync(cssDir)) {
            fs.readdirSync(cssDir).forEach(file => {
              copyFile(
                path.join(cssDir, file),
                path.join(staticDir, 'css', file)
              );
            });
          }

          // Copy JS chunks
          const chunksDir = path.join(staticDir, 'chunks');
          if (fs.existsSync(chunksDir)) {
            fs.readdirSync(chunksDir).forEach(file => {
              if (file.endsWith('.js')) {
                copyFile(
                  path.join(chunksDir, file),
                  path.join(staticDir, 'js', file)
                );
              }
            });
          }

          // Copy media
          const mediaDir = path.join(staticDir, 'media');
          if (fs.existsSync(mediaDir)) {
            fs.readdirSync(mediaDir).forEach(file => {
              copyFile(
                path.join(mediaDir, file),
                path.join(staticDir, 'images', file)
              );
            });
          }
        }
      }
    }
  }
}

module.exports = nextConfig