import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import crypto from 'crypto';
import { spawn } from 'child_process';

const app = express();

app.use(cors());
app.use(express.json({ limit: '2mb' }));

const ROOT_DIR = process.cwd();
const CHAT_CONFIG_FILE = path.resolve(ROOT_DIR, 'kb-chat.config.json');
const PROMPTS_FILE = path.resolve(ROOT_DIR, 'prompts.md');

function loadJsonFile(file, label) {
  try {
    return JSON.parse(fsSync.readFileSync(file, 'utf8'));
  } catch (err) {
    if (err?.code !== 'ENOENT') {
      console.warn(`[Config] ${label || file} load failed: ${String(err?.message || err)}`);
    }

    return {};
  }
}

function configString(value, fallback = '') {
  if (value === undefined || value === null) return fallback;
  return String(value);
}

function configFlag(value, fallback = '1') {
  if (value === undefined || value === null) return fallback;
  if (typeof value === 'boolean') return value ? '1' : '0';
  return String(value) === '0' || String(value).toLowerCase() === 'false' ? '0' : '1';
}

function configArray(value) {
  if (Array.isArray(value)) return value;
  if (value === undefined || value === null || value === '') return [];
  return [value];
}

function resolveRootPath(value, fallback) {
  const raw = configString(value, fallback);
  return path.isAbsolute(raw) ? raw : path.resolve(ROOT_DIR, raw);
}

function requiredPort(value, label) {
  const port = Number(value);

  if (!Number.isInteger(port) || port <= 0 || port > 65535) {
    throw new Error(`[Config] invalid port: ${label}`);
  }

  return port;
}

function writeJsonIfAllowed(file, data, force = false) {
  if (fsSync.existsSync(file) && !force) {
    console.log(`[Config] exists, skipped: ${file}`);
    return;
  }

  fsSync.mkdirSync(path.dirname(file), { recursive: true });
  fsSync.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  console.log(`[Config] wrote: ${file}`);
}

function sampleChatConfig() {
  return loadJsonFile(path.resolve(ROOT_DIR, 'kb-chat.config.json.example'), 'kb-chat.config.json.example');
}

function sampleProvidersConfig() {
  return loadJsonFile(path.resolve(ROOT_DIR, 'kb-chat.providers.json.example'), 'kb-chat.providers.json.example');
}

function maybeInitConfigFiles() {
  if (!process.argv.includes('--init-config')) return false;

  const force = process.argv.includes('--force');
  writeJsonIfAllowed(CHAT_CONFIG_FILE, sampleChatConfig(), force);
  writeJsonIfAllowed(path.resolve(ROOT_DIR, 'kb-chat.providers.json'), sampleProvidersConfig(), force);
  process.exit(0);
}

maybeInitConfigFiles();

function normalizeProviderPoolSources(config = {}) {
  const sources = [];
  const addBase64 = (value, label = '') => {
    const text = String(value || '').trim();

    if (text) sources.push({ type: 'base64', value: text, label: label || 'base64' });
  };
  const addSubscription = (url, label = '') => {
    const text = String(url || '').trim();

    if (text) sources.push({ type: 'subscription', url: text, label: label || text });
  };

  for (const source of configArray(config.sources)) {
    if (typeof source === 'string') {
      const text = source.trim();

      if (!text) continue;
      if (/^https?:\/\//i.test(text)) addSubscription(text);
      else addBase64(text);
      continue;
    }

    if (!source || typeof source !== 'object') continue;

    const type = String(source.type || '').trim().toLowerCase();

    if (type === 'subscription' || type === 'provider-subscription' || type === 'coolauxv-subscription') {
      addSubscription(source.url || source.subscriptionUrl, source.label || source.name || '');
    } else if (type === 'base64' || type === 'provider-base64' || type === 'coolauxv-base64') {
      addBase64(source.value || source.base64, source.label || source.name || '');
    } else if (type === 'base64-file' || source.file) {
      const file = String(source.file || '').trim();

      if (file) sources.push({ type: 'base64-file', file, label: source.label || source.name || file });
    }
  }

  for (const item of configArray(config.importBase64)) {
    addBase64(item, 'importBase64');
  }

  for (const file of configArray(config.importBase64Files || config.importBase64File)) {
    const text = String(file || '').trim();

    if (text) sources.push({ type: 'base64-file', file: text, label: text });
  }

  for (const item of configArray(config.subscriptions || config.subscriptionUrls || config.subscriptionUrl)) {
    addSubscription(item, 'subscription');
  }

  return sources;
}

function normalizeOllamaSources(providersConfig = {}) {
  const sources = [];
  const addSource = (source, index) => {
    if (!source || typeof source !== 'object') return;

    const type = String(source.type || '').trim().toLowerCase();
    const enabled = source.enabled === undefined ? true : Boolean(source.enabled);

    if (!enabled) return;

    if (type === 'ollama-subscription') {
      const url = String(source.url || source.subscriptionUrl || '').trim();

      if (url) {
        sources.push({
          type: 'subscription',
          id: String(source.id || source.label || `ollama-subscription-${index + 1}`),
          label: String(source.label || source.name || url),
          url,
          model: String(source.model || ''),
        });
      }
    } else if (type === 'ollama-endpoints' || type === 'ollama') {
      const endpoints = configArray(source.endpoints)
        .map((item) => typeof item === 'string' ? { url: item } : item)
        .filter((item) => item && (item.url || item.baseUrl || item.endpoint));

      if (endpoints.length) {
        sources.push({
          type: 'endpoints',
          id: String(source.id || source.label || `ollama-endpoints-${index + 1}`),
          label: String(source.label || source.name || `ollama-endpoints-${index + 1}`),
          endpoints,
          model: String(source.model || ''),
        });
      }
    }
  };

  configArray(providersConfig.sources).forEach(addSource);
  configArray(providersConfig.ollama?.sources).forEach(addSource);

  return sources;
}

const CHAT_CONFIG = loadJsonFile(CHAT_CONFIG_FILE, CHAT_CONFIG_FILE);
const CHAT_SERVER_CONFIG = CHAT_CONFIG.chatServer || {};
const KB_CONFIG = CHAT_CONFIG.kb || {};
const RAG_CONFIG = CHAT_CONFIG.rag || {};
const INDEX_CACHE_CONFIG = CHAT_CONFIG.indexCache || {};
const OLLAMA_CONFIG = CHAT_CONFIG.ollama || {};
const PROVIDER_POOL_CONFIG = CHAT_CONFIG.providerPool || {};
const PROVIDERS_CONFIG_FILE = resolveRootPath(CHAT_CONFIG.providersFile, 'kb-chat.providers.json');
const PROVIDERS_CONFIG = loadJsonFile(PROVIDERS_CONFIG_FILE, PROVIDERS_CONFIG_FILE);

const KB_DIR = resolveRootPath(KB_CONFIG.dir, 'docs/kb');
const PORT = requiredPort(CHAT_SERVER_CONFIG.port, 'chatServer.port');
const HOST = configString(CHAT_SERVER_CONFIG.host, '0.0.0.0');
const DEFAULT_MODEL = configString(OLLAMA_CONFIG.defaultModel || OLLAMA_CONFIG.model, '');

const USE_PROVIDER_POOL = configFlag(PROVIDER_POOL_CONFIG.enabled, '1');
const PROVIDER_POOL_FILE = resolveRootPath(PROVIDER_POOL_CONFIG.cacheFile || PROVIDER_POOL_CONFIG.file, '.cache/provider-pool.json');
const PROVIDER_POOL_SOURCES = normalizeProviderPoolSources(PROVIDERS_CONFIG);
const OLLAMA_SOURCES = normalizeOllamaSources(PROVIDERS_CONFIG);
const PROVIDER_POOL_TIMEOUT_MS = Number(PROVIDER_POOL_CONFIG.timeoutMs || 120000);
const PROVIDER_POOL_RETRY_LIMIT = Number(PROVIDER_POOL_CONFIG.retryLimit || 6);

const SUBSCRIPTION_REFRESH_TIME =
  configString(OLLAMA_CONFIG.subscriptionRefreshTime, '04:00');
const KB_REFRESH_MS = Number(KB_CONFIG.refreshMs || 30 * 1000);
const OLLAMA_TAGS_TIMEOUT_MS = Number(OLLAMA_CONFIG.tagsTimeoutMs || 3000);
const OLLAMA_HEALTH_BATCH_SIZE = Number(OLLAMA_CONFIG.healthBatchSize || 12);
const OLLAMA_HEALTH_LIMIT = Number(OLLAMA_CONFIG.healthLimit || 60);
const OLLAMA_CHAT_RETRY_LIMIT = Number(OLLAMA_CONFIG.chatRetryLimit || 8);
const OLLAMA_CHAT_TIMEOUT_MS = Number(OLLAMA_CONFIG.chatTimeoutMs || 120000);

const TOP_K = Number(RAG_CONFIG.topK || 6);
const CHUNK_SIZE = Number(RAG_CONFIG.chunkSize || 1600);
const CHUNK_OVERLAP = Number(RAG_CONFIG.chunkOverlap || 200);
const KB_INDEX_CACHE_FILE = resolveRootPath(INDEX_CACHE_CONFIG.file, '.cache/kb-chat-index.json');
const KB_DIR_CACHE_KEY = path.relative(ROOT_DIR, KB_DIR).split(path.sep).join('/') || '.';
const USE_KB_INDEX_CACHE = configFlag(INDEX_CACHE_CONFIG.enabled, '1');
const USE_KB_INOTIFY = configFlag(KB_CONFIG.useInotify, '1');
const KB_INDEX_CACHE_VERSION = 2;

const DEFAULT_SYSTEM_PROMPT = `
你是实验室知识库助手。你必须优先依据给定的 Markdown 知识库片段回答。
如果知识库片段不足以回答，就明确说明“知识库里没有找到足够依据”，然后再给出一般性建议。
回答要使用中文，尽量直接、具体。
不要在正文末尾列出“参考来源”，系统会在前端单独显示来源文件。
不要编造不存在的文件、结论或实验结果。
`.trim();

const KB_SYSTEM_RULES = `
你必须优先依据给定的 Markdown 知识库片段回答。
如果知识库片段不足以回答，就明确说明“知识库里没有找到足够依据”，然后再给出一般性建议。
回答要使用中文，尽量直接、具体。
不要在正文末尾列出“参考来源”，系统会在前端单独显示来源文件。
不要编造不存在的文件、结论或实验结果。
`.trim();

let kbChunks = [];
let lastKbIndexAt = null;
let isKbIndexing = false;
let lastKbIndexError = null;
let kbIndexLoadedFromCache = false;
let kbIndexCacheAt = null;
let kbIndexMode = 'full';
let kbFileRecords = new Map();
let kbSyncTimer = null;
let pendingKbFiles = new Set();
let inotifyProcess = null;
let sidebarUpdateTimer = null;
const SIDEBAR_UPDATE_DEBOUNCE_MS = 3000;

function triggerSidebarUpdate() {
  if (sidebarUpdateTimer) clearTimeout(sidebarUpdateTimer);
  sidebarUpdateTimer = setTimeout(() => {
    sidebarUpdateTimer = null;
    const docsDir = path.dirname(KB_DIR);  // kb.dir 的父目录即 docs
    const updateScript = path.join(docsDir, 'update.sh');
    if (!fsSync.existsSync(updateScript)) return;
    console.log('[KB] triggering sidebar update...');
    const proc = spawn('bash', [updateScript], {
      cwd: docsDir,
      stdio: ['ignore', 'ignore', 'pipe'],  // stdout 静默，不刷终端
    });
    let stderr = '';
    proc.stderr.on('data', (d) => { stderr += String(d); });
    proc.on('close', (code) => {
      if (code === 0) {
        const lines = (stderr.match(/共生成 \d+ 个链接条目/g) || []).pop();
        console.log(`[KB] sidebar update done${lines ? ' (' + lines + ')' : ''}`);
      } else {
        console.warn(`[KB] sidebar update failed (exit ${code}): ${stderr.slice(0, 200)}`);
      }
    });
    proc.on('error', (err) => {
      console.warn(`[KB] sidebar update error: ${String(err?.message || err)}`);
    });
  }, SIDEBAR_UPDATE_DEBOUNCE_MS);
}

let endpointCandidates = [];
let subscriptionEndpointCandidates = [];
let activeEndpoint = null;
let activeModel = DEFAULT_MODEL || null;
let lastSubscriptionAt = null;
let lastSubscriptionError = null;
let nextSubscriptionRefreshAt = null;
let badEndpoints = new Set();
let providerPool = [];
let badProviderPoolIds = new Set();
let lastProviderPoolAt = null;
let lastProviderPoolError = null;
let customJsContextCache = new Map();

function normalizeBaseUrl(url) {
  let s = String(url || '').trim();

  if (!s) return '';

  if (!/^https?:\/\//i.test(s)) {
    s = `http://${s}`;
  }

  s = s.replace(/\/+$/, '');

  s = s.replace(/\/api$/, '');

  return s;
}

function isProbablyUrl(s) {
  return typeof s === 'string' && /^(https?:\/\/)?[a-zA-Z0-9.-]+(?::\d+)?(\/.*)?$/.test(s);
}

function parseJsonText(text, label) {
  const body = String(text || '').trim();

  if (!body) {
    throw new Error(`${label} 返回空响应`);
  }

  try {
    return JSON.parse(body);
  } catch (err) {
    throw new Error(`${label} 返回的不是有效 JSON: ${String(err?.message || err)}`);
  }
}

async function readJsonResponse(res, label) {
  const text = await res.text();
  return parseJsonText(text, label);
}

function splitJsonValues(text) {
  const values = [];
  const input = String(text || '');
  let start = -1;
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];

    if (start === -1) {
      if (char === '{' || char === '[') {
        start = i;
        depth = 1;
      } else if (!/\s/.test(char)) {
        return [];
      }

      continue;
    }

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === '"') {
        inString = false;
      }

      continue;
    }

    if (char === '"') {
      inString = true;
    } else if (char === '{' || char === '[') {
      depth += 1;
    } else if (char === '}' || char === ']') {
      depth -= 1;

      if (depth === 0) {
        values.push(input.slice(start, i + 1));
        start = -1;
      }
    }
  }

  return start === -1 ? values : [];
}

function parseOllamaChatText(text, label) {
  try {
    return parseJsonText(text, label);
  } catch (err) {
    const chunks = splitJsonValues(text);

    if (chunks.length <= 1) {
      throw err;
    }

    const parts = chunks.map((chunk) => JSON.parse(chunk));
    const content = parts
      .map((part) => part?.message?.content || part?.response || '')
      .join('');
    const last = parts[parts.length - 1] || {};

    return {
      ...last,
      response: content || last.response || '',
      message: {
        ...(last.message || {}),
        role: last?.message?.role || 'assistant',
        content: content || last?.message?.content || '',
      },
    };
  }
}

async function readOllamaChatResponse(res, label) {
  const text = await res.text();
  return parseOllamaChatText(text, label);
}

function normalizeProviderId(id) {
  return String(id || '').trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-');
}

function normalizeProviderType(type) {
  const normalized = String(type || '').trim();

  if (normalized === 'openai-responses') return 'openai-responses';
  if (normalized === 'chat-parts') return 'chat-parts';
  if (normalized === 'ollama') return 'ollama';
  if (normalized === 'chat-no-history') return 'chat-no-history';
  return 'chat-completions';
}

function defaultBodyTemplateForProviderType(type) {
  const normalized = normalizeProviderType(type);

  if (normalized === 'openai-responses') {
    return { model: '{{model}}', stream: true, input: '{{messages}}' };
  }

  if (normalized === 'chat-parts') {
    return { model: '{{model}}', id: '{{requestId}}', messages: '{{messages}}', trigger: '{{trigger}}' };
  }

  if (normalized === 'chat-no-history') {
    return { conversationId: '{{conversationId}}', content: '{{latestUserText}}', model: '{{model}}' };
  }

  return { model: '{{model}}', stream: true, messages: '{{messages}}' };
}

function defaultStreamConfigForProviderType(type) {
  const normalized = normalizeProviderType(type);

  if (normalized === 'openai-responses') {
    return { parser: 'openai-responses', deltaPath: '', reasoningPath: '' };
  }

  if (normalized === 'chat-parts') {
    return { parser: 'chat-parts', deltaPath: '', reasoningPath: '' };
  }

  if (normalized === 'ollama') {
    return { parser: 'ollama', deltaPath: 'message.content', reasoningPath: '' };
  }

  if (normalized === 'chat-no-history') {
    return { parser: 'chat-completions', deltaPath: 'content', reasoningPath: '' };
  }

  return { parser: 'chat-completions', deltaPath: 'choices.0.delta.content', reasoningPath: '' };
}

function decodeProviderBase64(base64) {
  const input = String(base64 || '').trim().replace(/^provider-pool:\/\//i, '').replace(/^coolauxv-provider:\/\//i, '');
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);

  try {
    return Buffer.from(padded, 'base64').toString('utf8');
  } catch {
    return '';
  }
}

function parseProviderBase64Payload(base64) {
  const decoded = decodeProviderBase64(base64);

  if (!decoded) return [];

  try {
    const payload = JSON.parse(decoded);

    if (Array.isArray(payload?.providers)) {
      return payload.providers.filter((item) => item && typeof item === 'object');
    }

    if (Array.isArray(payload)) {
      return payload.filter((item) => item && typeof item === 'object');
    }

    return payload && typeof payload === 'object' ? [payload] : [];
  } catch {
    return [];
  }
}

function parseProviderBase64PayloadStrict(base64, label = 'base64') {
  const decoded = decodeProviderBase64(base64);

  if (!decoded) {
    throw new Error(`${label} base64 解码失败`);
  }

  let payload;

  try {
    payload = JSON.parse(decoded);
  } catch (err) {
    throw new Error(`${label} base64 解码后不是有效 JSON: ${String(err?.message || err)}`);
  }

  const providers = extractProviderObjects(payload);

  if (!providers.length) {
    throw new Error(`${label} 没有解析到 provider`);
  }

  return providers;
}

function extractProviderObjects(payload) {
  if (Array.isArray(payload?.providers)) {
    return payload.providers.filter((item) => item && typeof item === 'object');
  }

  if (Array.isArray(payload)) {
    return payload.filter((item) => item && typeof item === 'object');
  }

  return payload && typeof payload === 'object' ? [payload] : [];
}

function parseProviderSubscriptionText(text, label = 'subscription') {
  const body = String(text || '').trim();

  if (!body) {
    throw new Error(`${label} 返回空内容`);
  }

  try {
    const payload = JSON.parse(body);
    const providers = extractProviderObjects(payload);

    if (!providers.length) {
      throw new Error('没有 provider');
    }

    return providers;
  } catch (jsonErr) {
    try {
      return parseProviderBase64PayloadStrict(body, label);
    } catch (base64Err) {
      throw new Error(`${label} 既不是 provider JSON，也不是 provider base64: ${String(jsonErr?.message || jsonErr)}; ${String(base64Err?.message || base64Err)}`);
    }
  }
}

function normalizeModelItem(item) {
  if (typeof item === 'string') {
    const id = item.trim();
    return id ? { id, tag: '', class: '' } : null;
  }

  if (!item || typeof item !== 'object') return null;

  const id = String(item.id || item.name || item.model || '').trim();

  if (!id) return null;

  return {
    id,
    tag: String(item.tag || '').trim(),
    class: String(item.class || item.sub || item.category || '').trim(),
  };
}

function normalizeModelGroups(tpl) {
  let groups = Array.isArray(tpl.modelGroups) ? tpl.modelGroups : null;

  if (!groups && tpl.models) {
    groups = [];

    if (Array.isArray(tpl.models.text) && tpl.models.text.length) {
      groups.push({ id: 'general', label: '通用模型', type: 'text', models: tpl.models.text, selectedModel: tpl.modelName || '' });
    }

    if (Array.isArray(tpl.models.vision) && tpl.models.vision.length) {
      groups.push({ id: 'vision', label: '视觉模型', type: 'vision', models: tpl.models.vision, selectedModel: tpl.visionModel || '' });
    }
  }

  if (!groups || !groups.length) {
    groups = [{ id: 'general', label: '通用模型', type: 'text', models: [], selectedModel: tpl.modelName || tpl.model || '' }];
  }

  return groups.map((group, idx) => {
    const models = (Array.isArray(group.models) ? group.models : (Array.isArray(group.list) ? group.list : []))
      .map(normalizeModelItem)
      .filter(Boolean);
    let selectedModel = String(group.selectedModel || group.model || '').trim();

    if (!selectedModel && models.length) {
      selectedModel = models[0].id;
    }

    return {
      id: normalizeProviderId(group.id || group.label || group.name || `group-${idx + 1}`),
      label: String(group.label || group.name || `模型分类${idx + 1}`),
      type: group.type === 'vision' ? 'vision' : 'text',
      models,
      selectedModel,
    };
  });
}

function normalizeTemplateKey(key) {
  return String(key || '').trim().replace(/[^a-zA-Z0-9_.-]/g, '');
}

function normalizeCustomFields(input) {
  const result = {};

  if (!input) return result;

  if (Array.isArray(input)) {
    for (const item of input) {
      const key = normalizeTemplateKey(item?.key || item?.name || '');

      if (key) {
        result[key] = String(item.value ?? item.val ?? '');
      }
    }

    return result;
  }

  if (typeof input === 'object') {
    for (const [rawKey, value] of Object.entries(input)) {
      const key = normalizeTemplateKey(rawKey);

      if (key) {
        result[key] = String(value ?? '');
      }
    }
  }

  return result;
}

function parseTemplateObject(value) {
  if (!value) return null;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }
  return typeof value === 'object' ? value : null;
}

function normalizeCoolAuxvProviderTemplate(tpl) {
  if (!tpl || typeof tpl !== 'object') return null;

  const type = normalizeProviderType(tpl.type);
  const id = normalizeProviderId(tpl.id || tpl.label || tpl.baseUrl || '');

  if (!id) return null;

  const headersTemplate = parseTemplateObject(tpl.headersTemplate) || { 'Content-Type': 'application/json' };
  const bodyTemplate = parseTemplateObject(tpl.bodyTemplate) || defaultBodyTemplateForProviderType(type);
  const streamDefault = defaultStreamConfigForProviderType(type);
  const stream = tpl.stream && typeof tpl.stream === 'object' ? tpl.stream : {};

  return {
    id,
    label: String(tpl.label || tpl.id || 'Provider'),
    type,
    baseUrl: String(tpl.baseUrl || ''),
    apiKey: String(tpl.apiKey || ''),
    roles: {
      system: String(tpl.roles?.system || 'system'),
      user: String(tpl.roles?.user || 'user'),
      assistant: String(tpl.roles?.assistant || 'assistant'),
    },
    headersTemplate,
    bodyTemplate,
    stream: {
      parser: String(stream.parser || streamDefault.parser),
      deltaPath: String(stream.deltaPath ?? streamDefault.deltaPath),
      reasoningPath: String(stream.reasoningPath ?? streamDefault.reasoningPath),
      reasoningTag: String(stream.reasoningTag || '').trim().toLowerCase(),
    },
    modelGroups: normalizeModelGroups(tpl),
    customFields: normalizeCustomFields(tpl.customFields),
    customJsCode: String(tpl.customJsCode || ''),
    customJsRunOnce: tpl.customJsRunOnce !== false,
  };
}

function applyTemplateString(value, context) {
  return String(value).replace(/{{\s*([a-zA-Z0-9_.-]+)\s*}}/g, (match, key) => {
    if (!Object.prototype.hasOwnProperty.call(context, key)) return '';

    const replacement = context[key];
    if (typeof replacement === 'function') {
      try {
        const result = replacement(context);
        return result === undefined || result === null ? '' : String(result);
      } catch (err) {
        console.warn(`[ProviderPool] template function ${key} failed: ${String(err?.message || err)}`);
        return '';
      }
    }

    return replacement === undefined || replacement === null ? '' : String(replacement);
  });
}

function applyTemplateValue(value, context) {
  if (Array.isArray(value)) return value.map((item) => applyTemplateValue(item, context));

  if (value && typeof value === 'object') {
    const output = {};

    for (const [key, subValue] of Object.entries(value)) {
      output[key] = applyTemplateValue(subValue, context);
    }

    return output;
  }

  if (typeof value === 'string') {
    const exact = value.match(/^{{\s*([a-zA-Z0-9_.-]+)\s*}}$/);

    if (exact && Object.prototype.hasOwnProperty.call(context, exact[1])) {
      const replacement = context[exact[1]];

      if (typeof replacement === 'function') {
        try {
          return replacement(context);
        } catch (err) {
          console.warn(`[ProviderPool] template function ${exact[1]} failed: ${String(err?.message || err)}`);
          return '';
        }
      }

      return replacement;
    }

    return applyTemplateString(value, context);
  }

  return value;
}

function filterCustomJsContext(raw) {
  const result = {};

  for (const [key, value] of Object.entries(raw || {})) {
    if (!/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key)) continue;

    if (
      typeof value === 'function' ||
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean'
    ) {
      result[key] = value;
    }
  }

  return result;
}

function serializeHeaders(headers) {
  return Array.from(headers.entries())
    .map(([key, value]) => `${key}: ${value}`)
    .join('\r\n');
}

function gmXmlhttpRequest(opts = {}) {
  const url = String(opts.url || '').trim();

  if (!url) {
    return Promise.reject(new Error('GM_xmlhttpRequest missing url'));
  }

  const controller = new AbortController();
  const timeout = Number(opts.timeout || PROVIDER_POOL_TIMEOUT_MS);
  const timer = setTimeout(() => controller.abort(), timeout);
  const method = String(opts.method || 'GET').toUpperCase();
  const headers = opts.headers && typeof opts.headers === 'object' ? opts.headers : {};
  const body = opts.data ?? opts.body;

  return fetch(url, {
    method,
    headers,
    body: method === 'GET' || method === 'HEAD' ? undefined : body,
    signal: controller.signal,
  }).then(async (res) => {
    clearTimeout(timer);

    const responseText = await res.text();
    const response = {
      status: res.status,
      statusText: res.statusText,
      responseText,
      response: responseText,
      responseHeaders: serializeHeaders(res.headers),
      finalUrl: res.url || url,
    };

    if (typeof opts.onload === 'function') {
      opts.onload(response);
    }

    return response;
  }).catch((err) => {
    clearTimeout(timer);

    if (err?.name === 'AbortError') {
      if (typeof opts.ontimeout === 'function') opts.ontimeout(err);
      throw new Error(`GM_xmlhttpRequest timeout: ${url}`);
    }

    if (typeof opts.onerror === 'function') opts.onerror(err);
    throw err;
  });
}

function providerCustomJsBaseContext(template) {
  const roles = template.roles || {};
  const stream = template.stream || {};

  return {
    providerId: template.id || '',
    providerLabel: template.label || '',
    providerType: template.type || '',
    baseUrl: template.baseUrl || '',
    apiKey: template.apiKey || '',
    apiKeyPlaceholder: template.apiKeyPlaceholder || '',
    keyLink: template.keyLink || '',
    keyLinkTitle: template.keyLinkTitle || '',
    headersTemplate: template.headersTemplate || {},
    bodyTemplate: template.bodyTemplate || {},
    modelGroups: Array.isArray(template.modelGroups) ? template.modelGroups : [],
    roleSystem: roles.system || 'system',
    roleUser: roles.user || 'user',
    roleAssistant: roles.assistant || 'assistant',
    streamParser: stream.parser || '',
    deltaPath: stream.deltaPath || '',
    reasoningPath: stream.reasoningPath || '',
    sessionIdPath: stream.sessionIdPath || '',
    sessionIdKey: stream.sessionIdKey || 'conversationId',
    reasoningTag: stream.reasoningTag || '',
    supportsVision: Boolean(template.supportsVision),
    supportsContinuousChat: template.supportsContinuousChat !== false,
    ...template.customFields,
  };
}

async function executeProviderCustomJs(template) {
  if (!template?.customJsCode?.trim()) return {};

  const providerId = template.id || '';

  if (template.customJsRunOnce !== false && providerId && customJsContextCache.has(providerId)) {
    return customJsContextCache.get(providerId) || {};
  }

  const code = String(template.customJsCode || '').trim();
  const baseContext = providerCustomJsBaseContext(template);
  const validIdent = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/;
  const sandboxKeys = Object.keys(baseContext).filter((key) => validIdent.test(key));
  const sandboxValues = sandboxKeys.map((key) => baseContext[key]);
  const declarationNames = [];

  code.replace(/^(?:\s*(?:const|let|var)\s+(\w+)\b\s*[=;])|(?:\s*function\s+(\w+)\b)/gm, (match, varName, funcName) => {
    const name = varName || funcName;

    if (name) declarationNames.push(name);

    return match;
  });

  const exportLines = declarationNames
    .filter((name, idx, arr) => arr.indexOf(name) === idx)
    .map((name) => `__exports__["${name}"] = typeof ${name} !== "undefined" ? ${name} : undefined;`)
    .join('\n');
  const fnPrefix = /\bawait\b/.test(code) ? 'async ' : '';
  const safeCrypto = {
    getRandomValues: (array) => crypto.webcrypto.getRandomValues(array),
    randomUUID: () => crypto.randomUUID(),
    subtle: crypto.webcrypto.subtle,
  };
  const atobImpl = (value) => Buffer.from(String(value), 'base64').toString('binary');
  const btoaImpl = (value) => Buffer.from(String(value), 'binary').toString('base64');
  const safeGlobalThis = {
    crypto: safeCrypto,
    fetch,
    GM_xmlhttpRequest: gmXmlhttpRequest,
    URL,
    URLSearchParams,
    TextEncoder,
    TextDecoder,
    Uint8Array,
    ArrayBuffer,
    setTimeout,
    clearTimeout,
    console,
    atob: atobImpl,
    btoa: btoaImpl,
  };
  const paramKeys = [
    ...sandboxKeys,
    'GM_xmlhttpRequest',
    'fetch',
    'crypto',
    'URL',
    'URLSearchParams',
    'TextEncoder',
    'TextDecoder',
    'Uint8Array',
    'ArrayBuffer',
    'setTimeout',
    'clearTimeout',
    'console',
    'atob',
    'btoa',
    'process',
    'require',
    'module',
    'exports',
    'global',
    'globalThis',
  ];
  const paramValues = [
    ...sandboxValues,
    gmXmlhttpRequest,
    fetch,
    safeCrypto,
    URL,
    URLSearchParams,
    TextEncoder,
    TextDecoder,
    Uint8Array,
    ArrayBuffer,
    setTimeout,
    clearTimeout,
    console,
    atobImpl,
    btoaImpl,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    safeGlobalThis,
  ];

  const runner = new Function(...paramKeys, `
    "use strict";
    return (${fnPrefix} function() {
      const __exports__ = {};
      ${code}
      ${exportLines}
      return __exports__;
    })();
  `);

  const raw = await Promise.race([
    Promise.resolve(runner(...paramValues)),
    new Promise((_, reject) => setTimeout(() => reject(new Error('customJsCode timeout')), PROVIDER_POOL_TIMEOUT_MS)),
  ]);
  const context = filterCustomJsContext(raw);

  if (template.customJsRunOnce !== false && providerId) {
    customJsContextCache.set(providerId, context);
  }

  return context;
}

function getValueByPath(obj, valuePath) {
  if (!obj || !valuePath) return undefined;

  return String(valuePath).split('.').reduce((acc, key) => {
    if (acc === undefined || acc === null) return undefined;
    if (!key) return acc;
    if (/^\d+$/.test(key)) return acc[Number(key)];
    return acc[key];
  }, obj);
}

function generateRequestId() {
  return `req-${Date.now().toString(36)}-${crypto.randomBytes(4).toString('hex')}`;
}

function selectedTextModel(template) {
  const group = template.modelGroups.find((item) => item.type !== 'vision') || template.modelGroups[0];

  return group?.selectedModel || group?.models?.[0]?.id || '';
}

function providerMessagesForTemplate(template, messages) {
  return messages.map((message) => ({
    role: template.roles?.[message.role] || message.role,
    content: message.content,
  }));
}

function latestUserText(messages) {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    if (messages[i]?.role === 'user') return messages[i].content || '';
  }

  return '';
}

function systemPromptText(messages) {
  return messages
    .filter((message) => message?.role === 'system')
    .map((message) => message.content || '')
    .filter(Boolean)
    .join('\n\n');
}

function providerTemplateContext(template, model, messages) {
  const mappedMessages = providerMessagesForTemplate(template, messages);
  const userText = latestUserText(messages);
  const sysText = systemPromptText(messages);
  const noHistoryText = [sysText ? `system:${sysText}` : '', userText ? `user:${userText}` : ''].filter(Boolean).join('\n');

  return {
    providerId: template.id,
    providerLabel: template.label,
    providerType: template.type,
    baseUrl: template.baseUrl,
    apiKey: template.apiKey,
    model,
    messages: template.type === 'chat-no-history' ? [{ role: template.roles.user || 'user', content: userText }] : mappedMessages,
    input: template.type === 'chat-no-history' ? noHistoryText : mappedMessages,
    stream: true,
    requestId: generateRequestId(),
    trigger: template.customFields.trigger || 'submit-message',
    sessionId: '',
    conversationId: '',
    latestUserText: template.type === 'chat-no-history' ? noHistoryText : userText,
    latestUserInputText: userText,
    latestSystemPrompt: sysText,
    ...template.customFields,
  };
}

function buildProviderPoolHeaders(template, context) {
  const headers = applyTemplateValue(template.headersTemplate || {}, context);
  const cleaned = {};

  for (const [key, value] of Object.entries(headers || {})) {
    const str = String(value ?? '').trim();

    if (str) cleaned[key] = str;
  }

  if (!Object.keys(cleaned).some((key) => key.toLowerCase() === 'content-type')) {
    cleaned['Content-Type'] = 'application/json';
  }

  return cleaned;
}

function extractChatCompletionsText(data) {
  const choice = Array.isArray(data?.choices) ? data.choices[0] : null;

  if (!choice) return '';
  if (typeof choice?.delta?.content === 'string') return choice.delta.content;
  if (typeof choice?.message?.content === 'string') return choice.message.content;
  if (typeof choice?.text === 'string') return choice.text;

  return '';
}

function extractOpenAiResponsesText(data) {
  if (typeof data?.output_text === 'string') return data.output_text;

  if (!Array.isArray(data?.output)) return '';

  let text = '';

  for (const item of data.output) {
    if (!Array.isArray(item?.content)) continue;

    for (const block of item.content) {
      if (block?.type === 'output_text' && block.text) {
        text += block.text;
      }
    }
  }

  return text;
}

function extractChatPartsText(data) {
  const readMessage = (message) => {
    if (!message || typeof message !== 'object') return '';
    if (typeof message.content === 'string') return message.content;
    if (!Array.isArray(message.parts)) return '';
    return message.parts.map((part) => typeof part?.text === 'string' ? part.text : '').join('');
  };

  if (data?.type === 'text-delta' && typeof data.delta === 'string') return data.delta;
  if (data?.type === 'text' && typeof data.text === 'string') return data.text;
  if (data?.message) return readMessage(data.message);

  if (Array.isArray(data?.messages)) {
    for (let i = data.messages.length - 1; i >= 0; i -= 1) {
      const text = readMessage(data.messages[i]);
      if (text) return text;
    }
  }

  return '';
}

function parseProviderPoolResponseText(template, text) {
  const body = String(text || '').trim();

  if (!body) {
    throw new Error(`${template.label} 返回空响应`);
  }

  const parser = template.stream?.parser || template.type || 'chat-completions';
  const contentParts = [];

  const consume = (data) => {
    if (!data || typeof data !== 'object') return;

    const customPath = template.stream?.deltaPath || '';
    let content = customPath ? getValueByPath(data, customPath) : undefined;

    if (content === undefined || content === null) {
      if (parser === 'openai-responses') content = extractOpenAiResponsesText(data);
      else if (parser === 'chat-parts') content = extractChatPartsText(data);
      else if (parser === 'ollama') content = getValueByPath(data, 'message.content') ?? data.response;
      else content = extractChatCompletionsText(data) || data.content || data.text || data.response;
    }

    if (content !== undefined && content !== null) {
      const value = String(content);
      const isDone = String(data.contentType || '').trim() === '1002' && value.trim().toLowerCase() === '[done]';

      if (!isDone) contentParts.push(value);
    }
  };

  if (body.includes('\ndata:') || body.startsWith('data:')) {
    for (const line of body.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) continue;

      const payload = trimmed.slice(5).trim();
      if (!payload || payload === '[DONE]') continue;

      consume(JSON.parse(payload));
    }
  } else {
    const chunks = splitJsonValues(body);

    if (chunks.length > 1) {
      for (const chunk of chunks) consume(JSON.parse(chunk));
    } else {
      consume(parseJsonText(body, template.label));
    }
  }

  const answer = contentParts.join('').trim();

  if (!answer) {
    throw new Error(`${template.label} 没有返回正文内容`);
  }

  return {
    provider: `pool:${template.id}`,
    endpoint: template.baseUrl,
    model: selectedTextModel(template),
    response: answer,
    message: {
      role: 'assistant',
      content: answer,
    },
  };
}

async function requestProviderPoolChat(template, messages) {
  const model = selectedTextModel(template);

  if (!template.baseUrl) {
    throw new Error(`${template.label} 缺少 baseUrl`);
  }

  if (!model) {
    throw new Error(`${template.label} 缺少模型配置`);
  }

  const customJsContext = await executeProviderCustomJs(template);
  const context = {
    ...providerTemplateContext(template, model, messages),
    ...customJsContext,
    model,
  };
  const url = applyTemplateString(template.baseUrl, context);
  const headers = buildProviderPoolHeaders(template, context);
  const body = applyTemplateValue(template.bodyTemplate || defaultBodyTemplateForProviderType(template.type), context);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PROVIDER_POOL_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      method: 'POST',
      signal: controller.signal,
      headers,
      body: JSON.stringify(body),
    });

    clearTimeout(timer);

    if (!res.ok) {
      const errorText = await res.text().catch(() => '');
      throw new Error(`${template.label} HTTP ${res.status}: ${errorText.slice(0, 300)}`);
    }

    const text = await res.text();
    const result = parseProviderPoolResponseText(template, text);

    validateChatContent(result, template.label);

    lastProviderPoolAt = new Date().toISOString();
    lastProviderPoolError = null;
    console.log(`[ProviderPool] chat ok: ${template.id}, model: ${model}`);

    return result;
  } catch (err) {
    clearTimeout(timer);
    lastProviderPoolError = String(err?.message || err);
    throw err;
  }
}

function normalizeProviderPoolList(list) {
  const result = [];
  const seen = new Set();

  for (const item of list || []) {
    const normalized = normalizeCoolAuxvProviderTemplate(item);

    if (!normalized) continue;

    let id = normalized.id;
    let index = 2;

    while (seen.has(id)) {
      id = `${normalized.id}-${index}`;
      index += 1;
    }

    normalized.id = id;
    seen.add(id);
    result.push(normalized);
  }

  return result;
}

function normalizeProviderPoolReplaceList(list) {
  const map = new Map();

  for (const item of list || []) {
    const normalized = normalizeCoolAuxvProviderTemplate(item);

    if (normalized) {
      map.set(normalized.id, normalized);
    }
  }

  return [...map.values()];
}

function mergeProviderListsPreserveOrder(...lists) {
  const result = [];
  const indexes = new Map();

  for (const list of lists) {
    for (const provider of list || []) {
      if (!provider?.id) continue;

      if (indexes.has(provider.id)) {
        result[indexes.get(provider.id)] = provider;
      } else {
        indexes.set(provider.id, result.length);
        result.push(provider);
      }
    }
  }

  return result;
}

async function fetchText(url, label, timeoutMs = 30000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'user-agent': 'vitepress-kb-chat/1.0',
        accept: 'application/json,text/plain,*/*',
      },
    });

    clearTimeout(timer);

    if (!res.ok) {
      throw new Error(`${label} HTTP ${res.status}`);
    }

    return await res.text();
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

async function saveProviderPool() {
  const payload = {
    version: 1,
    savedAt: new Date().toISOString(),
    providers: providerPool,
  };
  const tmpFile = `${PROVIDER_POOL_FILE}.tmp`;

  await fs.mkdir(path.dirname(PROVIDER_POOL_FILE), { recursive: true });
  await fs.writeFile(tmpFile, JSON.stringify(payload, null, 2), 'utf8');
  await fs.rename(tmpFile, PROVIDER_POOL_FILE);
}

async function loadProviderPool() {
  if (USE_PROVIDER_POOL !== '1') return;

  const sourceProviders = [];
  const cachedProviders = [];

  try {
    const raw = await fs.readFile(PROVIDER_POOL_FILE, 'utf8');
    const data = JSON.parse(raw);

    if (Array.isArray(data?.providers)) {
      cachedProviders.push(...normalizeProviderPoolReplaceList(data.providers));
    }
  } catch (err) {
    if (err?.code !== 'ENOENT') {
      console.warn(`[ProviderPool] load failed: ${String(err?.message || err)}`);
    }
  }

  for (const [idx, source] of PROVIDER_POOL_SOURCES.entries()) {
    const label = source.label || `${source.type}-${idx + 1}`;

    try {
      let rawProviders = [];

      if (source.type === 'base64') {
        rawProviders = parseProviderBase64PayloadStrict(source.value, label);
      } else if (source.type === 'base64-file') {
        const text = await fs.readFile(resolveRootPath(source.file, ''), 'utf8');
        const entries = text.split(/\s+/).map((item) => item.trim()).filter(Boolean);

        for (const [entryIndex, entry] of entries.entries()) {
          rawProviders.push(...parseProviderBase64PayloadStrict(entry, `${label}#${entryIndex + 1}`));
        }
      } else if (source.type === 'subscription') {
        const text = await fetchText(source.url, label);
        rawProviders = parseProviderSubscriptionText(text, label);
      }

      const normalized = normalizeProviderPoolReplaceList(rawProviders);

      if (!normalized.length) {
        throw new Error('没有可用 provider');
      }

      sourceProviders.push(...normalized);
      console.log(`[ProviderPool] source loaded: ${label}, providers: ${normalized.length}`);
    } catch (err) {
      console.warn(`[ProviderPool] source skipped: ${label}: ${String(err?.message || err)}`);
    }
  }

  providerPool = mergeProviderListsPreserveOrder(sourceProviders, cachedProviders);

  if (sourceProviders.length) {
    await saveProviderPool();
  }

  if (providerPool.length) {
    console.log(`[ProviderPool] loaded ${providerPool.length} provider(s)`);
  }
}

async function importProviderPoolBase64(base64) {
  const imported = normalizeProviderPoolList(parseProviderBase64Payload(base64));

  if (!imported.length) {
    throw new Error('没有从 base64 中解析到有效提供商');
  }

  const map = new Map(providerPool.map((provider) => [provider.id, provider]));

  for (const provider of imported) {
    map.set(provider.id, provider);
    badProviderPoolIds.delete(provider.id);
  }

  providerPool = [...map.values()];
  await saveProviderPool();

  return imported;
}

function parseDailyTime(value) {
  const match = String(value || '').trim().match(/^(\d{1,2}):(\d{2})$/);

  if (!match) return null;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return null;
  }

  return { hours, minutes };
}

function getNextDailyRunAt(timeValue) {
  const time = parseDailyTime(timeValue) || parseDailyTime('04:00');
  const now = new Date();
  const next = new Date(now);

  next.setHours(time.hours, time.minutes, 0, 0);

  if (next <= now) {
    next.setDate(next.getDate() + 1);
  }

  return next;
}

function stripMarkdown(md) {
  return String(md)
    .replace(/^---[\s\S]*?---/m, '')
    .replace(/!\[[^\]]*]\([^)]+\)/g, '')
    .replace(/\[([^\]]+)]\([^)]+\)/g, '$1')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function tokenize(text) {
  const raw = String(text || '').toLowerCase();

  const ascii = raw.match(/[a-z0-9_./:-]{2,}/g) || [];
  const cjkText = (raw.match(/[\u4e00-\u9fff]+/g) || []).join('');
  const cjk = [];

  for (let size = 2; size <= 4; size += 1) {
    for (let i = 0; i <= cjkText.length - size; i += 1) {
      cjk.push(cjkText.slice(i, i + size));
    }
  }

  return [...ascii, ...cjk].filter((t) => t.length > 0);
}

function compactForPathMatch(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/\.(mdx?|html?)$/g, '')
    .replace(/[^\u4e00-\u9fffa-z0-9]+/g, '');
}

function queryPathPhrase(query) {
  return compactForPathMatch(query)
    .replace(/介绍一下/g, '')
    .replace(/介绍/g, '')
    .replace(/讲讲/g, '')
    .replace(/说说/g, '')
    .replace(/帮我/g, '')
    .replace(/请/g, '')
    .replace(/一下/g, '')
    .replace(/里面/g, '')
    .replace(/里的/g, '')
    .replace(/有什么/g, '')
    .replace(/有哪些/g, '')
    .replace(/什么/g, '')
    .replace(/东西/g, '')
    .replace(/内容/g, '')
    .replace(/的/g, '');
}

function chunkText(text, size = CHUNK_SIZE, overlap = CHUNK_OVERLAP) {
  const chunks = [];
  const clean = text.trim();

  if (!clean) return chunks;

  let start = 0;

  while (start < clean.length) {
    const end = Math.min(start + size, clean.length);
    const piece = clean.slice(start, end).trim();

    if (piece) {
      chunks.push(piece);
    }

    if (end >= clean.length) break;

    start = Math.max(0, end - overlap);
  }

  return chunks;
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

      if (entry.isDirectory()) {
        await walk(full);
      } else if (entry.isFile() && /\.mdx?$/i.test(entry.name)) {
        result.push(full);
      }
    }
  }

  await walk(dir);

  return result.sort();
}

function normalizeRelativePath(file) {
  return path.relative(KB_DIR, file).split(path.sep).join('/');
}

function indexCacheMeta() {
  return {
    version: KB_INDEX_CACHE_VERSION,
    kbDir: KB_DIR_CACHE_KEY,
    chunkSize: CHUNK_SIZE,
    chunkOverlap: CHUNK_OVERLAP,
  };
}

function isIndexCacheCompatible(cache) {
  const meta = indexCacheMeta();

  return cache &&
    cache.version === meta.version &&
    cache.kbDir === meta.kbDir &&
    cache.chunkSize === meta.chunkSize &&
    cache.chunkOverlap === meta.chunkOverlap &&
    Array.isArray(cache.files);
}

function rebuildKbChunksFromRecords() {
  kbChunks = [...kbFileRecords.values()]
    .sort((a, b) => a.file.localeCompare(b.file))
    .flatMap((record) => record.chunks || []);
}

async function loadKbIndexCache() {
  if (USE_KB_INDEX_CACHE !== '1') return false;

  try {
    const raw = await fs.readFile(KB_INDEX_CACHE_FILE, 'utf8');
    const cache = JSON.parse(raw);

    if (!isIndexCacheCompatible(cache)) {
      console.log('[KB] index cache ignored: incompatible metadata');
      return false;
    }

    kbFileRecords = new Map(cache.files.map((record) => [record.file, record]));
    rebuildKbChunksFromRecords();
    lastKbIndexAt = cache.lastIndexedAt || null;
    kbIndexCacheAt = cache.savedAt || null;
    kbIndexLoadedFromCache = true;
    kbIndexMode = 'cache';

    console.log(`[KB] loaded index cache: ${kbFileRecords.size} files, ${kbChunks.length} chunks from ${KB_INDEX_CACHE_FILE}`);
    return true;
  } catch (err) {
    if (err?.code !== 'ENOENT') {
      console.warn(`[KB] index cache load failed: ${String(err?.message || err)}`);
    }

    return false;
  }
}

async function saveKbIndexCache() {
  if (USE_KB_INDEX_CACHE !== '1') return;

  const now = new Date().toISOString();
  const cache = {
    ...indexCacheMeta(),
    savedAt: now,
    lastIndexedAt: lastKbIndexAt,
    files: [...kbFileRecords.values()].sort((a, b) => a.file.localeCompare(b.file)),
  };
  const tmpFile = `${KB_INDEX_CACHE_FILE}.tmp`;

  await fs.mkdir(path.dirname(KB_INDEX_CACHE_FILE), { recursive: true });
  await fs.writeFile(tmpFile, JSON.stringify(cache), 'utf8');
  await fs.rename(tmpFile, KB_INDEX_CACHE_FILE);
  kbIndexCacheAt = now;
}

async function buildFileIndexRecord(file) {
  const stat = await fs.stat(file);
  const raw = await fs.readFile(file, 'utf8');
  const relative = normalizeRelativePath(file);
  const title = path.basename(file).replace(/\.mdx?$/i, '');
  const clean = stripMarkdown(raw);
  const pieces = chunkText(clean);
  const chunks = pieces.map((content, idx) => ({
    id: `${relative}#${idx + 1}`,
    file: relative,
    title,
    chunkIndex: idx + 1,
    content,
    pathText: compactForPathMatch(relative),
    topDir: relative.split('/')[0] || relative,
    tokens: tokenize(`${relative} ${title} ${content}`),
    pathTokens: tokenize(relative),
  }));

  return {
    file: relative,
    mtimeMs: stat.mtimeMs,
    size: stat.size,
    chunks,
  };
}

async function syncKbIndex(options = {}) {
  const changedFiles = options.changedFiles || null;
  isKbIndexing = true;
  lastKbIndexError = null;

  try {
    let changed = false;
    let updated = 0;
    let removed = 0;

    if (changedFiles) {
      for (const file of changedFiles) {
        if (!/\.mdx?$/i.test(file)) continue;

        const relative = normalizeRelativePath(file);

        try {
          const record = await buildFileIndexRecord(file);
          kbFileRecords.set(relative, record);
          updated += 1;
          changed = true;
        } catch (err) {
          if (err?.code === 'ENOENT') {
            if (kbFileRecords.delete(relative)) {
              removed += 1;
              changed = true;
            }
          } else {
            throw err;
          }
        }
      }
    } else {
      const files = await walkMarkdownFiles(KB_DIR);
      const live = new Set();

      for (const file of files) {
        const relative = normalizeRelativePath(file);
        const stat = await fs.stat(file);
        const previous = kbFileRecords.get(relative);

        live.add(relative);

        if (!previous || previous.mtimeMs !== stat.mtimeMs || previous.size !== stat.size || options.force) {
          const record = await buildFileIndexRecord(file);
          kbFileRecords.set(relative, record);
          updated += 1;
          changed = true;
        }
      }

      for (const relative of kbFileRecords.keys()) {
        if (!live.has(relative)) {
          kbFileRecords.delete(relative);
          removed += 1;
          changed = true;
        }
      }
    }

    if (changed || kbChunks.length === 0) {
      rebuildKbChunksFromRecords();
      lastKbIndexAt = new Date().toISOString();
      await saveKbIndexCache();
    }

    kbIndexMode = changedFiles ? 'incremental' : (changed ? 'sync' : 'cache');

    console.log(`[KB] index ${kbIndexMode}: ${kbFileRecords.size} files, ${kbChunks.length} chunks, updated ${updated}, removed ${removed}`);
  } catch (err) {
    lastKbIndexError = String(err?.message || err);
    throw err;
  } finally {
    isKbIndexing = false;
  }
}

async function rebuildKbIndex() {
  await syncKbIndex({ force: true });
}

function retrieveRelevantChunks(query, topK = TOP_K) {
  const qTokens = tokenize(query);
  const qSet = new Set(qTokens);
  const compactQuery = compactForPathMatch(query);
  const pathPhrase = queryPathPhrase(query);

  if (qSet.size === 0) return [];

  const scored = kbChunks.map((chunk) => {
    let score = 0;

    for (const token of chunk.pathTokens || []) {
      if (qSet.has(token)) {
        score += token.length >= 4 ? 12 : 6;
      }
    }

    for (const token of chunk.tokens) {
      if (qSet.has(token)) {
        score += token.length >= 4 ? 2 : 1;
      }
    }

    const pathText = chunk.pathText || compactForPathMatch(chunk.file);
    const topDirText = compactForPathMatch(chunk.topDir);

    if (pathPhrase && pathPhrase.length >= 2 && pathText.includes(pathPhrase)) {
      score += 120;
    }

    if (topDirText && compactQuery.includes(topDirText)) {
      score += 100;
    }

    if (/index\.mdx?$/i.test(chunk.file)) {
      score += 8;
    }

    if (chunk.file.toLowerCase().includes(String(query).toLowerCase())) {
      score += 10;
    }

    return { ...chunk, score };
  });

  return scored
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

function extractEndpointCandidates(data) {
  const candidates = [];

  function addCandidate(url, model) {
    const baseUrl = normalizeBaseUrl(url);

    if (!baseUrl) return;

    candidates.push({
      baseUrl,
      model: model || null,
    });
  }

  function visit(value, hintModel = null) {
    if (!value) return;

    if (typeof value === 'string') {
      if (isProbablyUrl(value)) {
        addCandidate(value, hintModel);
      }
      return;
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        visit(item, hintModel);
      }
      return;
    }

    if (typeof value === 'object') {
      const modelList = Array.isArray(value.models)
        ? value.models.map((model) => model?.name || model?.model).filter(Boolean)
        : [];
      const speedModelList = Array.isArray(value.speeds)
        ? value.speeds.map((speed) => speed?.model || speed?.name).filter(Boolean)
        : [];

      const possibleUrl =
        value.url ||
        value.api ||
        value.endpoint ||
        value.base_url ||
        value.baseUrl ||
        value.host;

      const possibleModel =
        value.model ||
        value.name ||
        value.model_name ||
        value.modelName ||
        modelList[0] ||
        speedModelList[0] ||
        hintModel;

      if (possibleUrl) {
        addCandidate(possibleUrl, possibleModel);
      }

      for (const [key, subValue] of Object.entries(value)) {
        const nextHint = key.includes(':') || key.includes('/') ? hintModel : key;
        visit(subValue, possibleModel || nextHint);
      }
    }
  }

  visit(data);

  const seen = new Set();
  const deduped = [];

  for (const item of candidates) {
    const key = `${item.baseUrl}@@${item.model || ''}`;

    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(item);
    }
  }

  return deduped;
}

async function refreshSubscription() {
  lastSubscriptionError = null;

  const loaded = [];
  const errors = [];

  for (const [idx, source] of OLLAMA_SOURCES.entries()) {
    const label = source.label || source.id || `ollama-source-${idx + 1}`;

    try {
      if (source.type === 'endpoints') {
        const candidates = source.endpoints.map((item) => ({
          baseUrl: normalizeBaseUrl(item.url || item.baseUrl || item.endpoint),
          model: DEFAULT_MODEL || source.model || item.model || null,
          sourceId: source.id,
          sourceLabel: label,
        })).filter((item) => item.baseUrl);

        loaded.push(...candidates);
        console.log(`[Ollama] source loaded: ${label}, candidates: ${candidates.length}`);
      } else if (source.type === 'subscription') {
        const text = await fetchText(source.url, label, 15000);
        const json = parseJsonText(text, label);
        const candidates = extractEndpointCandidates(json).map((item) => ({
          ...item,
          model: DEFAULT_MODEL || source.model || item.model || null,
          sourceId: source.id,
          sourceLabel: label,
        }));

        loaded.push(...candidates);
        console.log(`[Ollama] source loaded: ${label}, candidates: ${candidates.length}`);
      }
    } catch (err) {
      const message = `${label}: ${String(err?.message || err)}`;
      errors.push(message);
      console.warn(`[Ollama] source skipped: ${message}`);
    }
  }

  subscriptionEndpointCandidates = loaded;
  endpointCandidates = loaded;
  lastSubscriptionAt = new Date().toISOString();
  lastSubscriptionError = errors.join('；') || null;
  badEndpoints = new Set();

  if (!activeEndpoint && endpointCandidates.length > 0) {
    activeEndpoint = endpointCandidates[0].baseUrl;
    activeModel = DEFAULT_MODEL || endpointCandidates[0].model || activeModel;
  }

  if (endpointCandidates.length > 0) {
    await selectHealthyEndpoint();
  }
}

async function getOllamaTags(baseUrl) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), OLLAMA_TAGS_TIMEOUT_MS);

  try {
    const res = await fetch(`${baseUrl}/api/tags`, {
      signal: controller.signal,
      headers: {
        accept: 'application/json',
      },
    });

    clearTimeout(timer);

    if (!res.ok) {
      throw new Error(`http ${res.status}`);
    }

    return await readJsonResponse(res, `${baseUrl}/api/tags`);
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

function pickModelFromTags(tags, preferredModel) {
  const models = Array.isArray(tags?.models) ? tags.models : [];
  const names = models.map((m) => m.name).filter(Boolean);

  if (preferredModel && names.includes(preferredModel)) {
    return preferredModel;
  }

  if (preferredModel) {
    return preferredModel;
  }

  return names[0] || null;
}

function normalizeModelName(model) {
  return String(model || '').trim().toLowerCase();
}

function isSuspiciousAnswer(text) {
  const answer = String(text || '').trim();

  if (!answer) return true;

  const cialloCount = (answer.match(/ciallo/gi) || []).length;

  if (cialloCount >= 2) return true;

  const compact = answer.replace(/\s+/g, '');

  if (compact.length >= 40) {
    const unit = compact.slice(0, Math.floor(compact.length / 3));

    if (unit.length >= 8 && compact.includes(unit + unit)) {
      return true;
    }
  }

  return false;
}

function validateOllamaChatResult(result, requestedModel, endpoint) {
  const returnedModel = result?.model;
  const answer = result?.message?.content || result?.response || '';

  if (returnedModel && requestedModel && normalizeModelName(returnedModel) !== normalizeModelName(requestedModel)) {
    throw new Error(`Ollama endpoint 不可信：请求模型 ${requestedModel}，实际返回 ${returnedModel}`);
  }

  if (isSuspiciousAnswer(answer)) {
    throw new Error(`Ollama endpoint 返回疑似无效内容：${String(answer).slice(0, 80)}`);
  }

  console.log(`[Ollama] chat ok: ${endpoint}, model: ${requestedModel}`);
}

function validateChatContent(result, label) {
  const answer = result?.message?.content || result?.response || '';

  if (isSuspiciousAnswer(answer)) {
    throw new Error(`${label} 返回疑似无效内容：${String(answer).slice(0, 80)}`);
  }
}

async function selectHealthyEndpoint() {
  const limit = Math.max(1, OLLAMA_HEALTH_LIMIT);
  const batchSize = Math.max(1, OLLAMA_HEALTH_BATCH_SIZE);
  const candidates = endpointCandidates
    .filter((item) => !badEndpoints.has(item.baseUrl))
    .slice(0, limit);

  for (let i = 0; i < candidates.length; i += batchSize) {
    const batch = candidates.slice(i, i + batchSize);
    const results = await Promise.allSettled(batch.map(async (item) => {
      const tags = await getOllamaTags(item.baseUrl);
      const model = pickModelFromTags(tags, DEFAULT_MODEL || item.model);

      if (!model) {
        throw new Error('healthy but no model');
      }

      return {
        baseUrl: item.baseUrl,
        model,
      };
    }));

    for (let j = 0; j < results.length; j += 1) {
      const result = results[j];
      const item = batch[j];

      if (result.status === 'fulfilled') {
        activeEndpoint = result.value.baseUrl;
        activeModel = result.value.model;

        console.log(`[Ollama] active endpoint: ${activeEndpoint}, model: ${activeModel}`);
        return true;
      }

      console.warn(`[Ollama] unhealthy: ${item.baseUrl} ${String(result.reason?.message || result.reason)}`);
    }
  }

  const availableCount = endpointCandidates.filter((item) => !badEndpoints.has(item.baseUrl)).length;

  if (availableCount > candidates.length) {
    console.warn(`[Ollama] checked first ${candidates.length}/${availableCount} available endpoints; no healthy endpoint found`);
  } else {
    console.warn('[Ollama] no healthy endpoint found');
  }

  return false;
}

function buildPromptMessages(userMessage, history, contexts) {
  const contextText = contexts.map((c, idx) => {
    return [
      `【资料 ${idx + 1}】`,
      `来源：${c.file}`,
      `片段：${c.chunkIndex}`,
      c.content,
    ].join('\n');
  }).join('\n\n---\n\n');

  const customPrompt = readCustomPrompt();
  const system = customPrompt
    ? [customPrompt, KB_SYSTEM_RULES].join('\n\n')
    : DEFAULT_SYSTEM_PROMPT;

  const ragMessage = `
下面是从知识库中检索到的相关片段：

${contextText || '没有检索到相关片段。'}

用户问题：
${userMessage}
`.trim();

  const safeHistory = normalizeChatHistory(history, userMessage);

  return [
    { role: 'system', content: system },
    ...safeHistory,
    { role: 'user', content: ragMessage },
  ];
}

function normalizeChatHistory(history, currentUserMessage) {
  const safeHistory = Array.isArray(history)
    ? history
        .filter((m) => m && ['user', 'assistant'].includes(m.role) && typeof m.content === 'string')
        .map((m) => ({
          role: m.role,
          content: m.content,
        }))
    : [];
  const last = safeHistory[safeHistory.length - 1];

  if (last?.role === 'user' && last.content.trim() === String(currentUserMessage || '').trim()) {
    safeHistory.pop();
  }

  return safeHistory;
}

function readCustomPrompt() {
  try {
    const text = fsSync.readFileSync(PROMPTS_FILE, 'utf8').trim();
    return text || '';
  } catch (err) {
    if (err?.code !== 'ENOENT') {
      console.warn(`[Prompts] failed to load ${PROMPTS_FILE}: ${String(err?.message || err)}`);
    }

    return '';
  }
}

async function requestOllamaChat(endpoint, model, messages) {
  const body = {
    model,
    messages,
    stream: false,
    options: {
      temperature: 0.2,
    },
  };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), OLLAMA_CHAT_TIMEOUT_MS);

  const res = await fetch(`${endpoint}/api/chat`, {
    method: 'POST',
    signal: controller.signal,
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  clearTimeout(timer);

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Ollama HTTP ${res.status}: ${text.slice(0, 300)}`);
  }

  const result = await readOllamaChatResponse(res, `${endpoint}/api/chat`);

  validateOllamaChatResult(result, model, endpoint);

  return {
    ...result,
    provider: 'ollama',
    endpoint,
    model: result?.model || model,
  };
}

async function callOllamaChat(messages) {
  let lastError = null;
  const retryLimit = Math.max(1, OLLAMA_CHAT_RETRY_LIMIT);

  for (let attempt = 0; attempt < retryLimit; attempt += 1) {
    if (!activeEndpoint || !activeModel || badEndpoints.has(activeEndpoint)) {
      activeEndpoint = null;
      activeModel = DEFAULT_MODEL || null;

      await selectHealthyEndpoint();
    }

    if (!activeEndpoint || !activeModel) {
      break;
    }

    const endpoint = activeEndpoint;
    const model = activeModel;

    try {
      return await requestOllamaChat(endpoint, model, messages);
    } catch (err) {
      lastError = err;

      console.warn(`[Ollama] chat failed on ${endpoint}: ${String(err?.message || err)}`);

      badEndpoints.add(endpoint);
      activeEndpoint = null;
      activeModel = DEFAULT_MODEL || null;
    }
  }

  throw lastError || new Error('没有可用的 Ollama endpoint 或 model');
}

async function callProviderPool(messages) {
  if (USE_PROVIDER_POOL !== '1' || providerPool.length === 0) {
    throw new Error('提供商池为空或未启用');
  }

  let lastError = null;
  const retryLimit = Math.max(1, PROVIDER_POOL_RETRY_LIMIT);
  const candidates = providerPool
    .filter((provider) => !badProviderPoolIds.has(provider.id))
    .slice(0, retryLimit);

  for (const provider of candidates) {
    try {
      return await requestProviderPoolChat(provider, messages);
    } catch (err) {
      lastError = err;
      badProviderPoolIds.add(provider.id);
      console.warn(`[ProviderPool] chat failed on ${provider.id}: ${String(err?.message || err)}`);
    }
  }

  throw lastError || new Error('提供商池没有可用提供商');
}

async function callChat(messages) {
  let providerPoolError = null;

  if (USE_PROVIDER_POOL === '1' && providerPool.length > 0) {
    try {
      return await callProviderPool(messages);
    } catch (err) {
      providerPoolError = err;
      console.warn(`[ProviderPool] all failed, fallback to Ollama: ${String(err?.message || err)}`);
    }
  }

  try {
    return await callOllamaChat(messages);
  } catch (err) {
    if (providerPoolError) {
      const parts = [];

      if (providerPoolError) parts.push(`提供商池失败：${String(providerPoolError?.message || providerPoolError)}`);
      parts.push(`Ollama 也失败：${String(err?.message || err)}`);

      throw new Error(parts.join('；'));
    }

    throw err;
  }
}

app.get('/api/status', (req, res) => {
  // 提供商池信息
  const poolActive = USE_PROVIDER_POOL === '1' && providerPool.length > 0;
  let poolModel = null;
  let poolLabel = null;
  if (poolActive) {
    const firstProvider = providerPool.filter((p) => !badProviderPoolIds.has(p.id))[0] || providerPool[0];
    poolLabel = firstProvider?.label || null;
    poolModel = firstProvider?.modelGroups?.[0]?.selectedModel
      || firstProvider?.modelGroups?.[0]?.models?.[0]?.id
      || null;
  }

  res.json({
    ok: true,
    kbDir: KB_DIR,
    chunks: kbChunks.length,
    isKbIndexing,
    kbReady: !isKbIndexing && kbChunks.length > 0,
    lastKbIndexAt,
    lastKbIndexError,
    kbIndexMode,
    kbIndexLoadedFromCache,
    kbIndexCacheAt,
    kbIndexCacheFile: KB_INDEX_CACHE_FILE,
    kbInotifyActive: Boolean(inotifyProcess),
    activeEndpoint,
    activeModel,
    providerPoolActive: poolActive,
    providerPoolModel: poolModel,
    providerPoolLabel: poolLabel,
    endpointCandidates: endpointCandidates.length,
    lastSubscriptionAt,
    lastSubscriptionError,
    subscriptionRefreshTime: SUBSCRIPTION_REFRESH_TIME,
    nextSubscriptionRefreshAt,
    providerPoolEnabled: USE_PROVIDER_POOL === '1',
    providerPoolCount: providerPool.length,
    providerPoolAvailable: providerPool.filter((provider) => !badProviderPoolIds.has(provider.id)).length,
    chatConfigFile: CHAT_CONFIG_FILE,
    providersConfigFile: PROVIDERS_CONFIG_FILE,
    providerSourceCount: PROVIDER_POOL_SOURCES.length,
    ollamaSourceCount: OLLAMA_SOURCES.length,
    providerPoolFile: PROVIDER_POOL_FILE,
    lastProviderPoolAt,
    lastProviderPoolError,
  });
});

app.post('/api/provider-pool/import', async (req, res) => {
  try {
    const base64 = String(req.body?.base64 || '').trim();

    if (!base64) {
      res.status(400).json({
        ok: false,
        error: 'base64 不能为空',
      });
      return;
    }

    const imported = await importProviderPoolBase64(base64);

    res.json({
      ok: true,
      imported: imported.map((provider) => ({
        id: provider.id,
        label: provider.label,
        type: provider.type,
        model: selectedTextModel(provider),
      })),
      providerPoolCount: providerPool.length,
    });
  } catch (err) {
    res.status(400).json({
      ok: false,
      error: String(err?.message || err),
    });
  }
});

app.post('/api/reindex', async (req, res) => {
  try {
    await rebuildKbIndex();
    res.json({
      ok: true,
      chunks: kbChunks.length,
      lastKbIndexAt,
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      error: String(err?.message || err),
    });
  }
});

app.post('/api/refresh-ollama', async (req, res) => {
  try {
    await refreshSubscription();
    res.json({
      ok: true,
      activeEndpoint,
      activeModel,
      endpointCandidates: endpointCandidates.length,
      lastSubscriptionAt,
      lastSubscriptionError,
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      error: String(err?.message || err),
    });
  }
});

app.post('/api/chat', async (req, res) => {
  try {
    const message = String(req.body?.message || '').trim();
    const history = req.body?.history || [];

    if (!message) {
      res.status(400).json({
        ok: false,
        error: 'message 不能为空',
      });
      return;
    }

    if (isKbIndexing && kbChunks.length === 0) {
      res.status(503).json({
        ok: false,
        error: '知识库索引尚未完成，请稍后再试',
      });
      return;
    }

    const contexts = retrieveRelevantChunks(message, TOP_K);
    const messages = buildPromptMessages(message, history, contexts);
    const result = await callChat(messages);

    res.json({
      ok: true,
      answer: result?.message?.content || result?.response || '',
      model: result?.model || activeModel,
      endpoint: result?.endpoint || activeEndpoint,
      provider: result?.provider || 'ollama',
      sources: contexts.map((c) => ({
        file: c.file,
        chunkIndex: c.chunkIndex,
        score: c.score,
      })),
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      error: String(err?.message || err),
    });
  }
});

function scheduleNextSubscriptionRefresh() {
  if (OLLAMA_SOURCES.length === 0) {
    nextSubscriptionRefreshAt = null;
    return;
  }

  const next = getNextDailyRunAt(SUBSCRIPTION_REFRESH_TIME);
  const delay = Math.max(1000, next.getTime() - Date.now());

  nextSubscriptionRefreshAt = next.toISOString();

  console.log(`[Ollama] next subscription refresh: ${nextSubscriptionRefreshAt} (${SUBSCRIPTION_REFRESH_TIME})`);

  setTimeout(() => {
    refreshSubscription()
      .catch((err) => {
        console.error(`[Ollama] scheduled refresh failed: ${String(err?.message || err)}`);
      })
      .finally(() => {
        scheduleNextSubscriptionRefresh();
      });
  }, delay);
}

function queueKbFileSync(file) {
  pendingKbFiles.add(file);

  if (kbSyncTimer) {
    clearTimeout(kbSyncTimer);
  }

  kbSyncTimer = setTimeout(() => {
    const files = [...pendingKbFiles];
    pendingKbFiles = new Set();
    kbSyncTimer = null;

    syncKbIndex({ changedFiles: files }).catch((err) => {
      console.error(`[KB] incremental index failed: ${String(err?.message || err)}`);
    });
  }, 500);
}

function startKbInotify() {
  if (USE_KB_INOTIFY !== '1') return false;

  inotifyProcess = spawn('inotifywait', [
    '-m',
    '-r',
    '-e',
    'close_write,create,delete,move,attrib',
    '--format',
    '%w%f',
    KB_DIR,
  ], {
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  inotifyProcess.stdout.setEncoding('utf8');
  inotifyProcess.stdout.on('data', (data) => {
    let hasFsChange = false;
    for (const line of data.split(/\r?\n/)) {
      const file = line.trim();
      if (!file) continue;

      if (/\.mdx?$/i.test(file)) {
        queueKbFileSync(file);
      }
      // 任何文件/目录变更都触发 sidebar 更新（新建文件夹、删除等）
      hasFsChange = true;
    }
    if (hasFsChange) triggerSidebarUpdate();
  });

  inotifyProcess.stderr.setEncoding('utf8');
  inotifyProcess.stderr.on('data', (data) => {
    const text = data.trim();

    if (text) {
      console.warn(`[KB] inotify: ${text}`);
    }
  });

  inotifyProcess.on('error', (err) => {
    console.warn(`[KB] inotify unavailable: ${String(err?.message || err)}`);
    inotifyProcess = null;
  });

  inotifyProcess.on('exit', (code) => {
    if (code !== 0 && code !== null) {
      console.warn(`[KB] inotify exited with code ${code}; periodic sync remains active`);
    }

    inotifyProcess = null;
  });

  console.log(`[KB] inotify watching ${KB_DIR}`);
  return true;
}

async function main() {
  await loadProviderPool();
  await loadKbIndexCache();
  await syncKbIndex();

  const hasInotify = startKbInotify();

  if (!hasInotify) {
    setInterval(() => {
      syncKbIndex().catch((err) => {
        console.error(`[KB] sync failed: ${String(err?.message || err)}`);
      });
    }, KB_REFRESH_MS);
  }

  app.listen(PORT, HOST, () => {
    console.log(`[KB Chat] listening on http://${HOST}:${PORT}`);
    console.log(`[KB Chat] kb dir: ${KB_DIR}`);
  });

  refreshSubscription().catch((err) => {
    console.error(`[Ollama] initial refresh failed: ${String(err?.message || err)}`);
  });

  scheduleNextSubscriptionRefresh();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
