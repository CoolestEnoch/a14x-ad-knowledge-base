#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const KB_DIR = path.resolve(ROOT_DIR, 'docs/kb');
const OUT_FILE = path.resolve(ROOT_DIR, '.cache/copyparty-uploaders.json');
const LOG_FILE = path.resolve(ROOT_DIR, '.cache/copyparty-upload-hook.log');
const MISSED_FILE = path.resolve(ROOT_DIR, '.cache/copyparty-upload-hook-missed.jsonl');
const BUILD_SCRIPT = path.resolve(ROOT_DIR, 'scripts/build-contributors.mjs');

function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
}

function appendLog(line) {
  fs.mkdirSync(path.dirname(LOG_FILE), { recursive: true });
  fs.appendFileSync(LOG_FILE, `${new Date().toISOString()} ${line}\n`);
}

function appendMissed(payload, reason) {
  fs.mkdirSync(path.dirname(MISSED_FILE), { recursive: true });
  fs.appendFileSync(MISSED_FILE, `${JSON.stringify({
    at: new Date().toISOString(),
    reason,
    payload,
  })}\n`);
}

function rebuildContributors() {
  const result = spawnSync(process.execPath, [BUILD_SCRIPT], {
    cwd: ROOT_DIR,
    encoding: 'utf8',
  });

  if (result.status === 0) {
    appendLog(`rebuilt contributors stdout=${JSON.stringify(String(result.stdout || '').trim())}`);
  } else {
    appendLog(`rebuild-failed status=${result.status} stderr=${JSON.stringify(String(result.stderr || '').trim())}`);
  }
}

function yamlString(value) {
  return `"${String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

function writeUploaderFrontmatter(relative, uploader) {
  const file = path.resolve(KB_DIR, relative);

  if (!(file === KB_DIR || file.startsWith(`${KB_DIR}${path.sep}`))) {
    appendLog(`frontmatter-skipped unsafe-path file=${JSON.stringify(file)}`);
    return;
  }

  let text = '';
  try {
    text = fs.readFileSync(file, 'utf8');
  } catch (err) {
    appendLog(`frontmatter-skipped unreadable file=${JSON.stringify(relative)} error=${JSON.stringify(String(err?.message || err))}`);
    return;
  }

  const line = `uploader: ${yamlString(uploader)}`;
  let next = '';

  if (text.startsWith('---\n')) {
    const end = text.indexOf('\n---', 4);

    if (end !== -1) {
      const head = text.slice(4, end);
      const rest = text.slice(end);
      const updatedHead = /^\s*uploader\s*:/m.test(head)
        ? head.replace(/^\s*uploader\s*:.*$/m, line)
        : `${line}\n${head}`;
      next = `---\n${updatedHead}${rest}`;
    }
  }

  if (!next) {
    next = `---\n${line}\n---\n\n${text}`;
  }

  if (next === text) return;

  fs.writeFileSync(file, next, 'utf8');
  appendLog(`frontmatter-updated file=${JSON.stringify(relative)} uploader=${JSON.stringify(uploader)}`);
}

function normalizeUploader(value) {
  const text = String(value || '').trim();
  return text && text !== '*' ? text : 'anonymous';
}

function decodePathText(value) {
  const text = String(value || '').trim();

  try {
    return decodeURIComponent(text);
  } catch {
    return text;
  }
}

function collectStringsByKey(value, keys, result = []) {
  if (!value || typeof value !== 'object') return result;

  for (const [key, item] of Object.entries(value)) {
    if (keys.includes(key.toLowerCase()) && typeof item === 'string') {
      result.push(item);
    } else if (Array.isArray(item)) {
      for (const child of item) collectStringsByKey(child, keys, result);
    } else if (item && typeof item === 'object') {
      collectStringsByKey(item, keys, result);
    }
  }

  return result;
}

function relativeKbPath(value) {
  const raw = decodePathText(value).replace(/\\/g, '/');
  if (!raw) return '';

  const abs = path.isAbsolute(raw) ? path.resolve(raw) : '';

  if (abs && (abs === KB_DIR || abs.startsWith(`${KB_DIR}${path.sep}`))) {
    return path.relative(KB_DIR, abs).split(path.sep).join('/');
  }

  const cleaned = raw
    .replace(/^file:\/\//, '')
    .replace(/^\/+/, '')
    .replace(/^docs\/kb\//, '')
    .replace(/^kb\//, '');

  return cleaned && !cleaned.startsWith('..') ? cleaned : '';
}

function deriveRelativePath(payload) {
  const candidates = [
    payload?.ap,
    payload?.abs,
    payload?.abspath,
    payload?.path,
    payload?.vp,
    payload?.vpath,
    payload?.file,
    payload?.fn,
    payload?.name,
    ...collectStringsByKey(payload, ['ap', 'abspath', 'path', 'vp', 'vpath', 'file', 'fn']),
  ];

  for (const candidate of candidates) {
    const relative = relativeKbPath(candidate);

    if (relative && /\.mdx?$/i.test(relative)) return relative;
  }

  return '';
}

function deriveUploader(payload) {
  const direct = payload?.user ||
    payload?.username ||
    payload?.uname ||
    payload?.acct ||
    payload?.account ||
    payload?.auth;

  if (direct) return normalizeUploader(direct);

  const found = collectStringsByKey(payload, ['user', 'username', 'uname', 'acct', 'account', 'auth'])[0];
  return normalizeUploader(found);
}

function main() {
  const raw = process.argv[2] || '';
  let payload = {};

  try {
    payload = raw ? JSON.parse(raw) : {};
  } catch (err) {
    appendLog(`parse-failed argv=${JSON.stringify(process.argv.slice(2))} error=${JSON.stringify(String(err?.message || err))}`);
    appendMissed({ argv: process.argv.slice(2) }, 'json-parse-failed');
    return;
  }

  const relative = deriveRelativePath(payload);

  if (!relative) {
    appendLog(`missed keys=${JSON.stringify(Object.keys(payload || {}))}`);
    appendMissed(payload, 'no-markdown-path');
    return;
  }

  const now = new Date().toISOString();
  const uploader = deriveUploader(payload);
  const cache = readJson(OUT_FILE, {
    version: 1,
    updatedAt: '',
    files: {},
    events: [],
  });

  cache.version = 1;
  cache.updatedAt = now;
  cache.files ||= {};
  cache.events ||= [];
  cache.files[relative] = {
    uploader,
    uploadedAt: now,
    source: 'copyparty-xau',
  };
  cache.events.push({
    file: relative,
    uploader,
    uploadedAt: now,
    source: 'copyparty-xau',
  });
  cache.events = cache.events.slice(-5000);

  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.writeFileSync(OUT_FILE, `${JSON.stringify(cache, null, 2)}\n`);
  appendLog(`recorded file=${JSON.stringify(relative)} uploader=${JSON.stringify(uploader)}`);
  writeUploaderFrontmatter(relative, uploader);
  rebuildContributors();
}

main();
