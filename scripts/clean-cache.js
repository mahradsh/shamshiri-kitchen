const fs = require('fs');
const path = require('path');

function removeDir(dir) {
  if (fs.existsSync(dir)) {
    console.log(`Removing ${dir}...`);
    fs.rmSync(dir, { recursive: true, force: true });
    console.log(`✓ Removed ${dir}`);
  } else {
    console.log(`Directory ${dir} does not exist, skipping...`);
  }
}

console.log('🧹 Cleaning cache files for Cloudflare Pages deployment...');

// Remove cache directories
removeDir('.next/cache');
removeDir('.next/server');

// Remove specific files
const filesToRemove = [
  '.next/trace',
  '.next/build-manifest.json',
  '.next/export-marker.json',
  '.next/images-manifest.json',
  '.next/prerender-manifest.json',
  '.next/routes-manifest.json',
  '.next/react-loadable-manifest.json'
];

filesToRemove.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`Removing ${file}...`);
    fs.unlinkSync(file);
    console.log(`✓ Removed ${file}`);
  }
});

console.log('✅ Cache cleanup completed!'); 