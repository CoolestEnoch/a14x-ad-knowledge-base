import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import path from 'node:path';

const ROOT_DIR = process.cwd();
const KB_DIR = path.resolve(ROOT_DIR, 'docs/kb');
const OUTPUT_FILE = path.resolve(ROOT_DIR, 'docs/public/contributors.json');
const MANIFEST_CANDIDATES = [
  path.resolve(ROOT_DIR, '.cache/copyparty-uploaders.json'),
  path.resolve(ROOT_DIR, 'docs/kb/.uploaders.json'),
  path.resolve(ROOT_DIR, 'docs/uploaders.json'),
  path.resolve(ROOT_DIR, 'contributors.config.json'),
];
const FRONTMATTER_KEYS = [
  'uploader',
  'uploadedBy',
  'uploaded_by',
  'contributor',
  'contributors',
  'maintainer',
  'owner',
];

function readJson(file) {
  try {
    return JSON.parse(fsSync.readFileSync(file, 'utf8'));
  } catch {
    return null;
  }
}

function normalizeName(value) {
  if (Array.isArray(value)) return value.map(normalizeName).filter(Boolean).join(', ');
  const text = String(value || '').trim();
  return text || '';
}

function parseFrontmatter(text) {
  const match = String(text || '').match(/^---\s*\n([\s\S]*?)\n---\s*(?:\n|$)/);
  const result = {};

  if (!match) return result;

  for (const line of match[1].split('\n')) {
    const item = line.match(/^([A-Za-z0-9_-]+)\s*:\s*(.*?)\s*$/);
    if (!item) continue;

    let value = item[2].trim();
    value = value.replace(/^['"]|['"]$/g, '');

    if (value.startsWith('[') && value.endsWith(']')) {
      result[item[1]] = value
        .slice(1, -1)
        .split(',')
        .map((part) => part.trim().replace(/^['"]|['"]$/g, ''))
        .filter(Boolean);
    } else {
      result[item[1]] = value;
    }
  }

  return result;
}

function loadManifest() {
  for (const file of MANIFEST_CANDIDATES) {
    const data = readJson(file);
    if (data) return { file, data };
  }

  return { file: '', data: null };
}

function manifestUploader(manifest, relative) {
  const data = manifest?.data;
  if (!data) return '';

  const files = data.files || data.uploaders || data;
  if (files && typeof files === 'object' && !Array.isArray(files)) {
    const direct = files[relative] || files[`docs/kb/${relative}`];
    if (direct) return normalizeName(direct.uploader || direct.uploadedBy || direct.contributor || direct);
  }

  const rules = Array.isArray(data.rules) ? data.rules : [];
  for (const rule of rules) {
    const pattern = String(rule.glob || rule.pathPrefix || rule.prefix || '').replace(/^docs\/kb\//, '');
    if (!pattern) continue;

    if (rule.pathPrefix || rule.prefix) {
      if (relative.startsWith(pattern)) return normalizeName(rule.uploader || rule.uploadedBy || rule.contributor);
    } else {
      const escaped = pattern
        .replace(/[.+^${}()|[\]\\]/g, '\\$&')
        .replace(/\*\*/g, '\u0000')
        .replace(/\*/g, '[^/]*');
      if (new RegExp(`^${escaped.replace(/\u0000/g, '.*')}$`).test(relative)) {
        return normalizeName(rule.uploader || rule.uploadedBy || rule.contributor);
      }
    }
  }

  return '';
}

function frontmatterUploader(frontmatter) {
  for (const key of FRONTMATTER_KEYS) {
    const value = normalizeName(frontmatter[key]);
    if (value) return value;
  }

  return '';
}

async function walkMarkdownFiles(dir) {
  const result = [];

  async function walk(current) {
    let entries = [];
    try {
      entries = await fs.readdir(current, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      const full = path.join(current, entry.name);
      if (entry.name.startsWith('.')) continue;
      if (entry.isDirectory()) await walk(full);
      else if (entry.isFile() && /\.mdx?$/i.test(entry.name)) result.push(full);
    }
  }

  await walk(dir);
  return result.sort();
}

function ensurePerson(map, name, source) {
  const key = normalizeName(name) || 'Unknown';

  if (!map.has(key)) {
    map.set(key, {
      name: key,
      files: 0,
      bytes: 0,
      lines: 0,
      sourceCounts: {},
      firstFileAt: '',
      lastFileAt: '',
      samples: [],
    });
  }

  const person = map.get(key);
  person.sourceCounts[source] = (person.sourceCounts[source] || 0) + 1;
  return person;
}

async function main() {
  const manifest = loadManifest();
  const files = await walkMarkdownFiles(KB_DIR);
  const people = new Map();

  for (const file of files) {
    const relative = path.relative(KB_DIR, file).split(path.sep).join('/');
    const [text, stat] = await Promise.all([
      fs.readFile(file, 'utf8'),
      fs.stat(file),
    ]);
    const frontmatter = parseFrontmatter(text);
    const fromFrontmatter = frontmatterUploader(frontmatter);
    const fromManifest = manifestUploader(manifest, relative);
    const uploader = fromFrontmatter || fromManifest || 'Unknown';
    const source = fromFrontmatter ? 'frontmatter' : (fromManifest ? 'copyparty-manifest' : 'unknown');
    const person = ensurePerson(people, uploader, source);
    const mtime = stat.mtime.toISOString();

    person.files += 1;
    person.bytes += stat.size;
    person.lines += text.split('\n').length;
    person.firstFileAt = person.firstFileAt && person.firstFileAt < mtime ? person.firstFileAt : mtime;
    person.lastFileAt = person.lastFileAt && person.lastFileAt > mtime ? person.lastFileAt : mtime;

    if (person.samples.length < 8) {
      person.samples.push(relative);
    }
  }

  const contributors = [...people.values()]
    .sort((a, b) => b.files - a.files || b.lines - a.lines || a.name.localeCompare(b.name));
  const payload = {
    version: 2,
    generatedAt: new Date().toISOString(),
    method: 'copyparty-manifest/frontmatter',
    manifestFile: manifest.file ? path.relative(ROOT_DIR, manifest.file).split(path.sep).join('/') : '',
    targets: ['docs/kb'],
    totals: {
      contributors: contributors.length,
      files: files.length,
      bytes: contributors.reduce((sum, item) => sum + item.bytes, 0),
      lines: contributors.reduce((sum, item) => sum + item.lines, 0),
    },
    contributors,
  };

  await fs.mkdir(path.dirname(OUTPUT_FILE), { recursive: true });
  await fs.writeFile(OUTPUT_FILE, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  console.log(`[contributors] wrote ${OUTPUT_FILE}: ${contributors.length} contributors, ${files.length} files`);
}

main().catch((err) => {
  console.error(`[contributors] ${String(err?.stack || err?.message || err)}`);
  process.exit(1);
});
