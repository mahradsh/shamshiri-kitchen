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

// Remove ONLY the large cache directories that cause 25MB limit issues
removeDir('.next/cache');

// Remove trace file if it exists
const filesToRemove = [
  '.next/trace'
];

filesToRemove.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`Removing ${file}...`);
    fs.unlinkSync(file);
    console.log(`✓ Removed ${file}`);
  }
});

console.log('✅ Cache cleanup completed!');
console.log('📝 Keeping essential manifest files for Next.js routing'); 