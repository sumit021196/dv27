const fs = require('fs');
const path = require('path');

const targetDirs = [
  path.join(__dirname, '..', 'components'),
  path.join(__dirname, '..', 'app')
];

const replacements = [
  { from: /text-foreground\/40/g, to: 'text-foreground/60' },
  { from: /text-foreground\/30/g, to: 'text-foreground/50' },
  { from: /text-foreground\/20/g, to: 'text-foreground/45' },
  { from: /text-foreground\/15/g, to: 'text-foreground/35' },
  { from: /text-foreground\/10/g, to: 'text-foreground/25' },
  
  // Standard Tailwind Grays
  { from: /text-gray-400/g, to: 'text-gray-600' },
  { from: /text-gray-300/g, to: 'text-gray-500' },
  { from: /text-gray-500/g, to: 'text-gray-700' },
  
  // Border Opacities (making borders slightly more visible but keeping them subtle)
  { from: /border-foreground\/5/g, to: 'border-foreground/12' },
  { from: /border-foreground\/10/g, to: 'border-foreground/18' }
];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  
  for (const r of replacements) {
    content = content.replace(r.from, r.to);
  }
  
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

function walkDir(dir) {
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.next') {
        walkDir(fullPath);
      }
    } else if (stat.isFile() && (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.css'))) {
      processFile(fullPath);
    }
  }
}

for (const dir of targetDirs) {
  if (fs.existsSync(dir)) {
    walkDir(dir);
  }
}

console.log("Darkening of grey colors complete!");
