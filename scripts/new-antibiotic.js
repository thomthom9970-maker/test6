#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function slugify(name){
  return name.toLowerCase().trim().replace(/\s+/g,'-').replace(/[^a-z0-9\-]/g,'');
}

const args = process.argv.slice(2);
if(!args.length){
  console.error('Usage: node new-antibiotic.js "Name of Antibiotic" [--force]');
  process.exit(1);
}

const force = args.includes('--force');
const nameParts = args.filter(a=>!a.startsWith('--'));
const name = nameParts.join(' ').trim();
const slug = slugify(name);

const repoRoot = path.join(__dirname, '..');
const template1 = path.join(repoRoot, 'template-antibiotic.html');
const template2 = path.join(repoRoot, 'cloxaciclinne.html');
const templatePath = fs.existsSync(template1) ? template1 : template2;
const outPath = path.join(repoRoot, `${slug}.html`);
const indexPath = path.join(repoRoot, 'antibiotiques.html');
const searchPath = path.join(repoRoot, 'search.js');

if(!fs.existsSync(templatePath)){
  console.error('No template found (expected template-antibiotic.html or cloxaciclinne.html).');
  process.exit(1);
}

if(fs.existsSync(outPath) && !force){
  console.error(`Target file ${outPath} already exists. Use --force to overwrite.`);
  process.exit(1);
}

// Read template and replace placeholders
let tpl = fs.readFileSync(templatePath, 'utf8');
tpl = tpl.replace(/<title>[\s\S]*?<\/title>/i, `<title>${name} — My Wiki</title>`);
tpl = tpl.replace(/<h1>[\s\S]*?<\/h1>/i, `<h1>${name}</h1>`);
tpl = tpl.replace(/<h2>[\s\S]*?<\/h2>/i, `<h2>${name}</h2>`);
tpl = tpl.replace(/Cloxaciclinne/g, name);
tpl = tpl.replace(/cloxaciclinne.html/g, `${slug}.html`);
tpl = tpl.replace(/edit <strong>.*?<\/strong>/i, `edit <strong>${slug}.html</strong>`);

// Write new page
fs.writeFileSync(outPath, tpl, 'utf8');
console.log('Created', outPath);

// Make backups of index and search before editing
function backup(file){
  if(!fs.existsSync(file)) return;
  const b = file + '.bak.' + Date.now();
  fs.copyFileSync(file, b);
  console.log('Backup created:', b);
}

if(fs.existsSync(indexPath)){
  backup(indexPath);
  let idx = fs.readFileSync(indexPath, 'utf8');
  const link = `          <li><a href="${slug}.html">${name}</a> — fiche modifiable.</li>\n`;
  if(idx.includes(`href="${slug}.html"`)){
    console.log('Index already contains link for', slug);
  } else if(idx.includes('<ul class="list">')){
    idx = idx.replace(/(<ul class="list">)/, `$1\n${link}`);
    fs.writeFileSync(indexPath, idx, 'utf8');
    console.log('Updated', indexPath);
  } else {
    // fallback: insert before </article>
    idx = idx.replace(/(<\/article>)/, `  <ul class=\"list\">\n${link}  </ul>\n$1`);
    fs.writeFileSync(indexPath, idx, 'utf8');
    console.log('Updated (fallback)', indexPath);
  }
} else {
  console.warn('Warning: antibiotiques.html not found; skipping index update.');
}

// Update search.js safely
if(fs.existsSync(searchPath)){
  backup(searchPath);
  let sj = fs.readFileSync(searchPath, 'utf8');
  if(sj.includes(`${slug}.html`)){
    console.log('search.js already contains an entry for', slug);
  } else {
    const insert = `  {url:'${slug}.html', title:'${name}', text: '${name}. Fiche modifiable sur un antibiotique.'},\n`;
    sj = sj.replace(/const SITE_PAGES = \[\n/, match => match ? match + insert : match);
    fs.writeFileSync(searchPath, sj, 'utf8');
    console.log('Updated', searchPath);
  }
} else {
  console.warn('Warning: search.js not found; skipping search index update.');
}

console.log('Done. New page:', `${slug}.html`);
