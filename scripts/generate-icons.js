const fs = require('fs');
const path = require('path');

// SVG icon template - MMA fist/glove icon with dark background
function generateSVG(size) {
  const padding = Math.round(size * 0.15);
  const iconSize = size - padding * 2;
  const cx = size / 2;
  const cy = size / 2;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${Math.round(size * 0.2)}" fill="#0f0f13"/>
  <g transform="translate(${padding}, ${padding})">
    <!-- MMA Glove / Fist Icon -->
    <circle cx="${iconSize/2}" cy="${iconSize/2}" r="${iconSize * 0.42}" fill="none" stroke="#ef4444" stroke-width="${Math.max(2, Math.round(size * 0.04))}"/>
    <text x="${iconSize/2}" y="${iconSize * 0.58}" font-family="Arial, sans-serif" font-weight="bold" font-size="${Math.round(iconSize * 0.45)}" fill="#ef4444" text-anchor="middle" dominant-baseline="middle">M</text>
    <line x1="${iconSize * 0.2}" y1="${iconSize * 0.78}" x2="${iconSize * 0.8}" y2="${iconSize * 0.78}" stroke="#3b82f6" stroke-width="${Math.max(1.5, Math.round(size * 0.025))}" stroke-linecap="round"/>
  </g>
</svg>`;
}

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, '..', 'public', 'icons');

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

sizes.forEach(size => {
  const svg = generateSVG(size);
  const filename = `icon-${size}x${size}.svg`;
  fs.writeFileSync(path.join(iconsDir, filename), svg);
  console.log(`Generated ${filename}`);
});

// Also generate favicon.svg
const faviconSvg = generateSVG(32);
fs.writeFileSync(path.join(__dirname, '..', 'public', 'favicon.svg'), faviconSvg);
console.log('Generated favicon.svg');

console.log('\nNote: For production, convert SVGs to PNGs using a tool like sharp or an online converter.');
console.log('For now, update manifest.json to use .svg extensions instead of .png');
