const fs = require('fs');
const path = require('path');

// Define paths
const outDir = path.join(process.cwd(), 'out');
const backendDir = path.join('../../backend-soodam/backend_soodam');
const staticDir = path.join(backendDir, 'static');
const templatesDir = path.join(backendDir, 'templates');
const publicDir = path.join(process.cwd(), '..', 'frontend_soodam', 'public');

// Create directories if they don't exist
[staticDir, templatesDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Create static subdirectories
const staticSubDirs = ['js', 'css', 'images', 'images/logo', 'fonts', 'fonts/estedad', 'fonts/iranyekan'];
staticSubDirs.forEach(dir => {
  const dirPath = path.join(staticDir, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

// Function to copy files from public directory
function copyFromPublic() {
  // Copy fonts
  const fontsDir = path.join(publicDir, 'fonts');
  if (fs.existsSync(fontsDir)) {
    const entries = fs.readdirSync(fontsDir, { withFileTypes: true });
    
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const sourcePath = path.join(fontsDir, entry.name);
        const destPath = path.join(staticDir, 'fonts', entry.name);
        
        if (!fs.existsSync(destPath)) {
          fs.mkdirSync(destPath, { recursive: true });
        }
        
        const fontFiles = fs.readdirSync(sourcePath);
        fontFiles.forEach(file => {
          const sourceFile = path.join(sourcePath, file);
          const destFile = path.join(destPath, file);
          fs.copyFileSync(sourceFile, destFile);
          console.log(`Copied font: ${sourceFile} -> ${destFile}`);
        });
      }
    }
  } else {
    console.error(`Fonts directory not found at: ${fontsDir}`);
  }

  // Copy all files from public directory
  function copyPublicFiles(sourceDir, destDir) {
    if (!fs.existsSync(sourceDir)) {
      return;
    }

    const entries = fs.readdirSync(sourceDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const sourcePath = path.join(sourceDir, entry.name);
      const destPath = path.join(destDir, entry.name);
      
      if (entry.isDirectory()) {
        // Skip fonts directory as it's handled separately
        if (entry.name === 'fonts') continue;
        
        if (!fs.existsSync(destPath)) {
          fs.mkdirSync(destPath, { recursive: true });
        }
        copyPublicFiles(sourcePath, destPath);
      } else {
        // Check if it's an image file
        const ext = path.extname(entry.name).toLowerCase();
        if (['.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.webp'].includes(ext)) {
          const finalDestPath = path.join(staticDir, 'images', path.relative(publicDir, sourcePath));
          const finalDestDir = path.dirname(finalDestPath);
          
          if (!fs.existsSync(finalDestDir)) {
            fs.mkdirSync(finalDestDir, { recursive: true });
          }
          
          fs.copyFileSync(sourcePath, finalDestPath);
          console.log(`Copied image: ${sourcePath} -> ${finalDestPath}`);
        }
      }
    }
  }

  // Start copying from public directory
  copyPublicFiles(publicDir, staticDir);
}

// Function to convert static references to FastAPI paths
function convertToFastAPIStatic(content) {
  // Convert script and link tags
  content = content.replace(/<script src=['"]\/_next\/static\/([^'"]+)['"]/g, '<script src="/static/$1"');
  content = content.replace(/<link href=['"]\/_next\/static\/([^'"]+)['"]/g, '<link href="/static/$1"');
  
  // Convert preload font links
  content = content.replace(/<link rel="preload" href=['"]\/fonts\/([^'"]+)['"]/g, '<link rel="preload" href="/static/fonts/$1"');
  
  // Convert image sources
  content = content.replace(/src=['"]\/_next\/static\/([^'"]+)['"]/g, 'src="/static/$1"');
  content = content.replace(/src=['"]\/([^'"]+\.(?:png|jpg|jpeg|gif|svg|ico|webp))['"]/g, 'src="/static/images/$1"');
  
  // Convert any remaining _next/static references
  content = content.replace(/\/_next\/static\/([^"'\s]+)/g, '/static/$1');
  
  // Convert any remaining /fonts/ references
  // content = content.replace(/\/fonts\/([^"'\s]+)/g, '/static/fonts/$1');
  
  return content;
}

// Function to copy files
function copyFile(source, destination, isHtml = false) {
  try {
    if (fs.existsSync(source)) {
      // Create destination directory if it doesn't exist
      const destDir = path.dirname(destination);
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }

      if (isHtml || source.endsWith('.js') || source.endsWith('.css')) {
        // Read, convert, and write HTML, JS, and CSS files
        const content = fs.readFileSync(source, 'utf8');
        const convertedContent = convertToFastAPIStatic(content);
        fs.writeFileSync(destination, convertedContent);
        console.log(`Converted and copied: ${source} -> ${destination}`);
      } else {
        // Direct copy for other files
        fs.copyFileSync(source, destination);
        console.log(`Copied: ${source} -> ${destination}`);
      }
    }
  } catch (error) {
    console.error(`Error processing file ${source}:`, error);
  }
}

// Function to recursively copy directory
function copyDir(source, destination) {
  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination, { recursive: true });
  }

  const entries = fs.readdirSync(source, { withFileTypes: true });

  for (const entry of entries) {
    const sourcePath = path.join(source, entry.name);
    const destPath = path.join(destination, entry.name);

    if (entry.isDirectory()) {
      copyDir(sourcePath, destPath);
    } else {
      // Handle font files specially
      if (entry.name.match(/\.(woff|woff2|ttf|eot|otf)$/)) {
        const fontDir = entry.name.includes('Estedad') ? 'fonts/estedad' : 'fonts/iranyekan';
        const finalDestPath = path.join(staticDir, fontDir, entry.name);
        copyFile(sourcePath, finalDestPath);
      } else {
        // Copy other files from _next/static to static directory
        const relativePath = path.relative(path.join(outDir, '_next', 'static'), sourcePath);
        const finalDestPath = path.join(staticDir, relativePath);
        copyFile(sourcePath, finalDestPath);
      }
    }
  }
}

// Function to process HTML files recursively
function processHtmlFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      processHtmlFiles(fullPath);
    } else if (entry.name.endsWith('.html')) {
      const relativePath = path.relative(outDir, fullPath);
      const destPath = path.join(templatesDir, relativePath);
      copyFile(fullPath, destPath, true);
    }
  }
}

// Process the out directory
if (fs.existsSync(outDir)) {
  // Copy files from public directory first
  copyFromPublic();
  
  // Process all HTML files recursively
  processHtmlFiles(outDir);

  // Copy static files to appropriate directories
  const files = fs.readdirSync(outDir);
  files.forEach(file => {
    const filePath = path.join(outDir, file);
    const stat = fs.statSync(filePath);

    if (stat.isFile()) {
      const ext = path.extname(file).toLowerCase();

      // Skip HTML files as they're already processed
      if (ext === '.html') return;

      // Copy static files to appropriate directories
      if (ext === '.js') {
        copyFile(filePath, path.join(staticDir, 'js', file));
      }
      else if (ext === '.css') {
        copyFile(filePath, path.join(staticDir, 'css', file));
      }
      else if (['.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico'].includes(ext)) {
        copyFile(filePath, path.join(staticDir, 'images', file));
      }
      // Copy font files
      else if (['.woff', '.woff2', '.ttf', '.eot', '.otf'].includes(ext)) {
        copyFile(filePath, path.join(staticDir, 'fonts', file));
      }
    }
  });

  // Copy _next/static directory contents to static directory
  const nextStaticDir = path.join(outDir, '_next', 'static');
  if (fs.existsSync(nextStaticDir)) {
    copyDir(nextStaticDir, staticDir);
    console.log('Copied _next/static contents to static directory');
  }
}

console.log('Build files have been organized successfully!'); 