import { defineConfig } from 'vitepress'
import fs from 'node:fs'
import path from 'node:path'
import sidebar from './sidebar.mts'

function loadKbChatConfig() {
  try {
    const configPath = path.resolve(process.cwd(), 'kb-chat.config.json')
    return JSON.parse(fs.readFileSync(configPath, 'utf8'))
  } catch (error) {
    return {}
  }
}

function requiredPort(value: unknown, name: string) {
  const port = Number(value)

  if (!Number.isInteger(port) || port <= 0 || port > 65535) {
    throw new Error(`invalid config port: ${name}`)
  }

  return port
}

function requiredString(value: unknown, name: string) {
  const text = String(value ?? '').trim()

  if (!text) throw new Error(`missing config: ${name}`)
  return text
}

const kbChatConfig = loadKbChatConfig()
const kbChatHost = String(kbChatConfig?.chatServer?.host || '127.0.0.1')
const kbChatProxyHost = String(kbChatConfig?.chatServer?.proxyHost || kbChatHost)
const kbChatPort = Number(kbChatConfig?.chatServer?.port || 1145)
const vitepressHost = String(kbChatConfig?.vitepress?.host || '0.0.0.0')
const vitepressPort = Number(kbChatConfig?.vitepress?.port || 1919)
const copypartyPort = Number(kbChatConfig?.copyparty?.port || 10810)
const copypartyHost = String(kbChatConfig?.copyparty?.host || '127.0.0.1')
const copypartyPublicUrl = String(kbChatConfig?.copyparty?.publicUrl || `http://${copypartyHost}:${copypartyPort}`)
const githubRepository = String(process.env.GITHUB_REPOSITORY || '')
const repositoryName = githubRepository.split('/')[1] || ''
const siteBase = process.env.VITEPRESS_BASE || (process.env.GITHUB_ACTIONS && repositoryName ? `/${repositoryName}/` : '/')

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "车路知识库",
  description: "车路知识库",
  //base: siteBase,
  base: '/a14x-ad-knowledge-base/',
  ignoreDeadLinks: true,
  // 客户端 MathJax 渲染数学公式（服务端不渲染 SVG，避免大文件崩溃）
  head: [
    ['script', {}, `MathJax={tex:{inlineMath:[['$','$'],['\\\\(','\\\\)']],displayMath:[['$$','$$'],['\\\\[','\\\\]']]},options:{ignoreHtmlClass:'no-mathjax',processHtmlClass:'math'},startup:{ready(){MathJax.startup.defaultReady();}}}`],
    ['script', { id: 'MathJax-script', src: 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js', async: true }],
  ],
  markdown: {
    // 数学公式不在服务端渲染 SVG（文件里公式多时编译产物可达 2.5MB 导致 Vue 崩溃）
    // 改为客户端 MathJax 渲染，无论用户上传多少公式都不会出问题
    config: (md) => {
      // ── inline math: $...$ ──
      md.inline.ruler.after('escape', 'math_inline', (state, silent) => {
        if (state.src[state.pos] !== '$') return false;
        if (state.src[state.pos + 1] === ' ' || state.src[state.pos + 1] === '\t') return false;
        let end = state.src.indexOf('$', state.pos + 1);
        if (end === -1) return false;
        if (!silent) {
          const token = state.push('math_inline', '', 0);
          token.content = state.src.slice(state.pos + 1, end);
          token.markup = '$';
        }
        state.pos = end + 1;
        return true;
      });
      md.renderer.rules.math_inline = (tokens, idx) =>
        `<span class="math inline">\\(${tokens[idx].content}\\)</span>`;

      // ── display math: $$...$$ 或单独成行的 $...$ ──
      md.block.ruler.after('blockquote', 'math_block', (state, startLine, endLine, silent) => {
        let pos = state.bMarks[startLine] + state.tShift[startLine];
        let max = state.eMarks[startLine];
        if (pos >= max) return false;
        const line = state.src.slice(pos, max);
        if (!line.startsWith('$$') && line !== '$') return false;
        const marker = line.startsWith('$$') ? '$$' : '$';
        if (marker === '$$') {
          const close = line.indexOf('$$', 2);
          if (close !== -1) {
            if (!silent) {
              const token = state.push('math_block', '', 0);
              token.content = line.slice(2, close);
              token.markup = '$$';
              token.block = true;
            }
            state.line = startLine + 1;
            return true;
          }
        }
        let nextLine = startLine + 1;
        let content = marker === '$$' ? line.slice(2) : '';
        for (; nextLine < endLine; nextLine++) {
          const lpos = state.bMarks[nextLine] + state.tShift[nextLine];
          const lmax = state.eMarks[nextLine];
          const cur = state.src.slice(lpos, lmax);
          if (cur.trim() === marker) {
            if (!silent) {
              const token = state.push('math_block', '', 0);
              token.content = content.trim();
              token.markup = marker;
              token.block = true;
            }
            state.line = nextLine + 1;
            return true;
          }
          content += (content ? '\n' : '') + cur;
        }
        return false;
      });
      md.renderer.rules.math_block = (tokens, idx) =>
        `<div class="math display">\\[${tokens[idx].content}\\]</div>`;
    },
  },
  vite: {
    server: {
      host: vitepressHost,
      port: vitepressPort,
      proxy: {
        '/api': {
          target: `http://${kbChatProxyHost}:${kbChatPort}`,
          changeOrigin: true,
        },
      },
    },
  },
  themeConfig: {
    search: {
      provider: 'local'
    },

    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: '贡献统计', link: '/contributors' },
      { text: '编辑', link: copypartyPublicUrl },
      { text: 'A14X Blog', link: 'http://10.21.22.113:4000' }
    ],


sidebar,

    socialLinks: [
      { icon: 'mtr', link: copypartyPublicUrl },
      { icon: 'twitter', link: 'https://x.com/realdonaldtrump' },
    ]
  }
})
