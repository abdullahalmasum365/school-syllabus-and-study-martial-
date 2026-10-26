const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const portalDir = __dirname;

const classes = [
  { id: 'p1', name: 'Primary 1', dir: '01 - Primary 1', icon: '🐣', subjects: ['IT', 'English'] },
  { id: 'p2', name: 'Primary 2', dir: '02 - Primary 2', icon: '🌱', subjects: ['IT'] },
  { id: 'p3', name: 'Primary 3', dir: '03 - Primary 3', dirAlt: '03 - Primary 3 (P3)', icon: '📘', subjects: ['IT'] },
  { id: 'p4', name: 'Primary 4', dir: '04 - Primary 4', icon: '📗', subjects: ['IT', 'Maths'] },
  { id: 'p6', name: 'Primary 6', dir: '05 - Primary 6', icon: '📙', subjects: ['IT'] },
  { id: 'sec1', name: 'Secondary 1 (Sec 1)', dir: '06 - Secondary 1 (Sec 1)', icon: '🎓', subjects: ['Computer Science'] },
  { id: 'sec2', name: 'Secondary 2 (Sec 2)', dir: '07 - Secondary 2 (Sec 2)', icon: '🚀', subjects: ['Computer Science'] },
  { id: 'olevel', name: 'O Level Computer Science', dir: '08 - O Level Computer Science (2023-2026)', icon: '🏆', subjects: ['Computer Science (2023-2026)'] },
];

function getFilesRecursively(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of list) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      results = results.concat(getFilesRecursively(fullPath));
    } else {
      results.push(fullPath);
    }
  }
  return results;
}

const summary = {};
for (const cls of classes) {
  const dirs = [path.join(rootDir, cls.dir)];
  if (cls.dirAlt) dirs.push(path.join(rootDir, cls.dirAlt));
  
  const allFiles = [];
  for (const d of dirs) {
    allFiles.push(...getFilesRecursively(d));
  }
  
  summary[cls.name] = allFiles.map(f => {
    const rel = path.relative(rootDir, f);
    const ext = path.extname(f).toLowerCase();
    const size = fs.statSync(f).size;
    return { name: path.basename(f), relPath: rel.replace(/\\/g, '/'), ext, size };
  });
}

console.log('Class file counts:');
for (const [cls, files] of Object.entries(summary)) {
  console.log(`- ${cls}: ${files.length} files`);
}
