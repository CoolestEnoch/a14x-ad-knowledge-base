<template>
  <div class="kb-chat-root">
    <button
      v-if="!open"
      class="kb-chat-fab"
      type="button"
      @click="open = true"
    >
      Chat
    </button>

    <div v-else class="kb-chat-panel">
      <div class="kb-chat-header">
        <div>
          <div class="kb-chat-title">知识库助手</div>
          <div class="kb-chat-subtitle">
            {{ statusText }}
          </div>
        </div>

        <button class="kb-chat-close" type="button" @click="open = false">
          ×
        </button>
      </div>

      <div ref="bodyRef" class="kb-chat-body">
        <div
          v-for="(msg, index) in messages"
          :key="index"
          class="kb-chat-message"
          :class="msg.role"
        >
          <div class="kb-chat-message-role">
            {{ msg.role === 'user' ? '我' : '助手' }}
          </div>
          <div
            class="kb-chat-message-content"
            v-html="renderMessage(msg)"
          />

          <div
            v-if="msg.sources && msg.sources.length"
            class="kb-chat-sources"
          >
            <div class="kb-chat-sources-title">参考来源：</div>
            <div
              v-for="(source, sIndex) in msg.sources"
              :key="sIndex"
              class="kb-chat-source"
            >
              {{ source.file }} #{{ source.chunkIndex }}
            </div>
          </div>
        </div>

        <div v-if="loading" class="kb-chat-loading">
          正在检索知识库并生成回答...
        </div>
      </div>

      <form class="kb-chat-input-row" @submit.prevent="sendMessage">
        <textarea
          v-model="input"
          class="kb-chat-input"
          rows="2"
          :placeholder="kbReady ? '问一下知识库...' : '知识库索引中...'"
          :disabled="!kbReady"
          @keydown.enter.exact.prevent="sendMessage"
        />
        <button class="kb-chat-send" type="submit" :disabled="loading || !kbReady || !input.trim()">
          发送
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue';

const open = ref(false);
const input = ref('');
const loading = ref(false);
const statusText = ref('连接中...');
const kbReady = ref(false);
const bodyRef = ref(null);
let statusTimer = null;

const messages = ref([
  {
    role: 'assistant',
    content: '你好，我可以基于 docs/kb 里的 Markdown 帮你查知识库。',
  },
]);

// ── 简易 Markdown + LaTeX 渲染 ──────────────────────

function escapeHtml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderMarkdown(text) {
  if (!text) return '';

  const placeholders = [];
  const pushPH = (html) => {
    placeholders.push(html);
    return `\x00${placeholders.length - 1}\x00`;
  };

  let html = text;

  // 1. 保护代码块 ```...```
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
    const escaped = escapeHtml(code.trimEnd());
    return pushPH(`<pre><code>${escaped}</code></pre>`);
  });

  // 2. 保护行内代码 `...`
  html = html.replace(/`([^`\n]+)`/g, (_, code) =>
    pushPH(`<code>${escapeHtml(code)}</code>`)
  );

  // 3. 保护 display math $$...$$ 和 \[...\]
  html = html.replace(/\$\$([\s\S]*?)\$\$/g, (_, math) =>
    pushPH(`<div class="math display">\\[${escapeHtml(math.trim())}\\]</div>`)
  );
  html = html.replace(/\\\[([\s\S]*?)\\\]/g, (_, math) =>
    pushPH(`<div class="math display">\\[${escapeHtml(math.trim())}\\]</div>`)
  );

  // 4. 保护 inline math $...$（不在 $$ 里，不含换行）
  html = html.replace(/(?<!\$)\$(?!\$)([^$\n]+?)\$(?!\$)/g, (_, math) =>
    pushPH(`<span class="math inline">\\(${escapeHtml(math)}\\)</span>`)
  );

  // 5. HTML 转义剩余内容
  html = escapeHtml(html);

  // 6. Markdown 格式化
  // 标题
  html = html.replace(/^### (.+)$/gm, '<h4>$1</h4>');
  html = html.replace(/^## (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^# (.+)$/gm, '<h2>$1</h2>');

  // 粗体 / 斜体
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // 无序列表
  html = html.replace(/^[-*] (.+)$/gm, '<li>$1</li>');
  html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul>$1</ul>');

  // 有序列表
  html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');

  // 换行 → <br>，双换行 → </p><p>
  html = html.replace(/\n\n+/g, '</p><p>');
  html = html.replace(/\n/g, '<br>');
  html = `<p>${html}</p>`;

  // 清理空段落
  html = html.replace(/<p>\s*<\/p>/g, '');

  // 7. 恢复占位符
  html = html.replace(/\x00(\d+)\x00/g, (_, i) => placeholders[parseInt(i)] || '');

  return html;
}

function renderMessage(msg) {
  if (msg.role === 'user') {
    return escapeHtml(msg.content).replace(/\n/g, '<br>');
  }
  return renderMarkdown(msg.content);
}

// MathJax 重新排版（聊天内容变化后触发）
function typesetChat() {
  nextTick(() => {
    if (window.MathJax?.typesetPromise) {
      MathJax.typesetPromise();
    }
  });
}

// 监听消息变化，自动渲染数学公式
watch(() => messages.value.length, typesetChat);

// ── API 调用 ──────────────────────────────────────

async function requestJson(url, options = {}) {
  const res = await fetch(url, options);
  const text = await res.text();

  if (!text.trim()) {
    throw new Error(`后端返回空响应：${res.status} ${res.statusText}`);
  }

  let data;

  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`后端返回的不是 JSON：${text.slice(0, 120)}`);
  }

  if (!res.ok) {
    throw new Error(data.error || `请求失败：${res.status}`);
  }

  return data;
}

async function fetchStatus() {
  try {
    const data = await requestJson('/api/status');

    if (data.ok) {
      kbReady.value = Boolean(data.kbReady);

      if (data.isKbIndexing) {
        statusText.value = `知识库索引中，已加载 ${data.chunks} 个片段`;
      } else if (data.kbReady) {
        statusText.value = `${data.chunks} 个知识片段，模型：${data.providerPoolActive ? data.providerPoolModel : data.activeModel || '未选择'}`;
      } else if (data.lastKbIndexError) {
        statusText.value = `知识库索引失败：${data.lastKbIndexError}`;
      } else {
        statusText.value = '知识库索引未完成';
      }
    } else {
      kbReady.value = false;
      statusText.value = '后端状态异常';
    }
  } catch {
    kbReady.value = false;
    statusText.value = '后端未连接';
  }
}

async function scrollToBottom() {
  await nextTick();

  if (bodyRef.value) {
    bodyRef.value.scrollTop = bodyRef.value.scrollHeight;
  }
}

async function sendMessage() {
  const text = input.value.trim();

  if (!text || loading.value || !kbReady.value) return;

  input.value = '';

  messages.value.push({
    role: 'user',
    content: text,
  });

  loading.value = true;

  await scrollToBottom();
  typesetChat();

  try {
    const history = messages.value
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .slice(-8)
      .map((m) => ({
        role: m.role,
        content: m.content,
      }));

    const data = await requestJson('/api/chat', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        message: text,
        history,
      }),
    });

    if (!data.ok) {
      throw new Error(data.error || '请求失败');
    }

    messages.value.push({
      role: 'assistant',
      content: data.answer || '没有返回内容。',
      sources: data.sources || [],
    });

    await fetchStatus();
  } catch (err) {
    messages.value.push({
      role: 'assistant',
      content: `出错了：${err?.message || String(err)}`,
    });
  } finally {
    loading.value = false;
    await scrollToBottom();
    typesetChat();
  }
}

onMounted(() => {
  fetchStatus();
  statusTimer = window.setInterval(fetchStatus, 2000);
});

onUnmounted(() => {
  if (statusTimer) {
    window.clearInterval(statusTimer);
  }
});
</script>

<style scoped>
.kb-chat-root {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 9999;
  font-family: var(--vp-font-family-base);
}

.kb-chat-fab {
  width: 64px;
  height: 64px;
  border-radius: 999px;
  border: none;
  background: var(--vp-c-brand-1);
  color: white;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.24);
}

.kb-chat-panel {
  width: min(420px, calc(100vw - 32px));
  height: min(620px, calc(100vh - 80px));
  border: 1px solid var(--vp-c-divider);
  border-radius: 16px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 12px 42px rgba(0, 0, 0, 0.28);
}

.kb-chat-header {
  padding: 14px 16px;
  border-bottom: 1px solid var(--vp-c-divider);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--vp-c-bg-soft);
}

.kb-chat-title {
  font-weight: 700;
  font-size: 15px;
}

.kb-chat-subtitle {
  margin-top: 3px;
  font-size: 12px;
  color: var(--vp-c-text-2);
}

.kb-chat-close {
  border: none;
  background: transparent;
  color: var(--vp-c-text-2);
  font-size: 26px;
  cursor: pointer;
}

.kb-chat-body {
  flex: 1;
  overflow-y: auto;
  padding: 14px;
}

.kb-chat-message {
  margin-bottom: 14px;
  padding: 10px 12px;
  border-radius: 12px;
  word-break: break-word;
  line-height: 1.6;
  font-size: 14px;
}

.kb-chat-message.user {
  margin-left: 28px;
  background: var(--vp-c-brand-soft);
}

.kb-chat-message.assistant {
  margin-right: 28px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
}

.kb-chat-message-role {
  font-size: 12px;
  color: var(--vp-c-text-2);
  margin-bottom: 4px;
}

/* 聊天消息内的 Markdown 渲染样式 */
.kb-chat-message-content :deep(p) {
  margin: 0 0 0.5em 0;
}
.kb-chat-message-content :deep(p:last-child) {
  margin-bottom: 0;
}
.kb-chat-message-content :deep(h2),
.kb-chat-message-content :deep(h3),
.kb-chat-message-content :deep(h4) {
  margin: 0.8em 0 0.4em 0;
  font-size: 1.05em;
  font-weight: 700;
}
.kb-chat-message-content :deep(strong) {
  font-weight: 700;
}
.kb-chat-message-content :deep(em) {
  font-style: italic;
}
.kb-chat-message-content :deep(code) {
  background: var(--vp-c-bg-alt, rgba(128, 128, 128, 0.15));
  border-radius: 4px;
  padding: 1px 5px;
  font-size: 0.9em;
  font-family: var(--vp-font-family-mono), monospace;
}
.kb-chat-message-content :deep(pre) {
  background: var(--vp-c-bg-alt, rgba(128, 128, 128, 0.12));
  border-radius: 8px;
  padding: 10px 12px;
  overflow-x: auto;
  margin: 0.5em 0;
  font-size: 0.88em;
}
.kb-chat-message-content :deep(pre code) {
  background: transparent;
  padding: 0;
}
.kb-chat-message-content :deep(ul),
.kb-chat-message-content :deep(ol) {
  margin: 0.4em 0;
  padding-left: 1.5em;
}
.kb-chat-message-content :deep(li) {
  margin: 0.2em 0;
}
.kb-chat-message-content :deep(.math) {
  display: inline-flex;
}
.kb-chat-message-content :deep(.math.display) {
  display: flex;
  justify-content: center;
  margin: 0.6em 0;
}

.kb-chat-sources {
  margin-top: 10px;
  padding-top: 8px;
  border-top: 1px dashed var(--vp-c-divider);
  font-size: 12px;
  color: var(--vp-c-text-2);
}

.kb-chat-sources-title {
  margin-bottom: 4px;
  font-weight: 600;
}

.kb-chat-source {
  overflow-wrap: anywhere;
}

.kb-chat-loading {
  color: var(--vp-c-text-2);
  font-size: 13px;
  padding: 8px;
}

.kb-chat-input-row {
  border-top: 1px solid var(--vp-c-divider);
  padding: 10px;
  display: flex;
  gap: 8px;
  background: var(--vp-c-bg);
}

.kb-chat-input {
  flex: 1;
  resize: none;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  padding: 8px 10px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  outline: none;
}

.kb-chat-input:focus {
  border-color: var(--vp-c-brand-1);
}

.kb-chat-send {
  width: 64px;
  border: none;
  border-radius: 10px;
  background: var(--vp-c-brand-1);
  color: white;
  cursor: pointer;
}

.kb-chat-send:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 640px) {
  .kb-chat-root {
    right: 12px;
    bottom: 12px;
  }

  .kb-chat-panel {
    width: calc(100vw - 24px);
    height: calc(100vh - 72px);
  }
}
</style>
