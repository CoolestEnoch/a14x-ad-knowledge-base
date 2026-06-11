# 车路知识库 🚗

> 基于 VitePress 的实验室知识库系统，支持 Markdown 文档 + **🤖 AI 对话问答**，本地部署，隐私安全。

---

## ✨ 核心特色

### 🤖 AI 智能对话（RAG 知识库问答）

**这不是一个普通的静态文档站！** 页面右下角集成了 AI 对话组件，你可以：

- **直接用自然语言提问**，AI 会自动从知识库中检索相关片段，结合上下文给出准确回答
- **支持多轮对话**，可以追问、深入讨论
- **兼容多种大模型后端**：
  - 本地 Ollama 部署的模型（完全离线、免费）
  - 大模型提供商 API（OpenAI 兼容接口、自定义 Provider）
  - 提供商池（Provider Pool）——多源负载均衡 & 自动故障转移
- **回答可溯源**：每条回答都会显示引用了哪些知识库文件，点击即可跳转
- **🎭 自定义系统提示词**：在项目根目录创建 `prompts.md`，随意定制 AI 的人设、语气、行为规则——想让它当实验室管家还是毒舌学术导师，你说了算

> 把知识库变成你的私人 AI 助手，而不是只能点点菜单、翻翻页面。

### 🔒 本地部署，隐私无忧

所有数据留在你的服务器上，不经过任何第三方。Ollama + 本地知识库 = 完全离线可用。

### 📐 LaTeX 数学公式

支持 `$...$` 行内公式和 `$$...$$` 块级公式，客户端 MathJax 渲染，不拖慢编译速度。

### 📂 文件即内容

直接在 `docs/kb/` 下创建 `.md` 文件，自动生成侧边栏导航、自动建立全文索引，无需手动配置路由。

---

## 🚀 快速开始

### 环境要求

- Node.js ≥ 18
- npm
- (可选) Python 3 — 用于 [Copyparty](https://github.com/9001/copyparty) 文件服务
- (可选) `inotifywait` — 用于文件变更自动感知（Linux）

### 安装

```bash
npm install
```

### 初始化配置文件

```bash
npm run kb-chat:init
```

这会在项目根目录生成两个配置文件：
- `kb-chat.config.json` — 主配置（端口、知识库路径、RAG 参数等）
- `kb-chat.providers.json` — 大模型提供商配置

### 一键启动

```bash
bash run.sh
```

启动后你会看到三个服务同时运行：
| 服务 | 默认端口 | 说明 |
|------|---------|------|
| VitePress 文档站 | 1919 | 前端页面 + 知识库浏览 |
| KB Chat Server | 1145 | RAG 检索 + AI 对话 API |
| Copyparty 文件服务 | 10810 | 文件管理（可选） |

打开浏览器访问 `http://localhost:1919` 即可看到知识库首页，**右下角就是 AI 对话入口**。

---

## 📝 如何撰写内容

### 目录结构约定

所有知识库内容放在 `docs/kb/` 目录下：

```
docs/
├── index.md                  # 首页（hero 区域）
├── kb/                       # 知识库根目录
│   ├── 自动驾驶入门/          # 一级分类（文件夹 = 侧边栏分组）
│   │   ├── index.md           # 分类首页（可选）
│   │   ├── 1.三维检测简介/     # 二级分类
│   │   │   ├── index.md
│   │   │   └── xxx.md         # 具体文章
│   │   └── 2.数据集/
│   │       ├── index.md
│   │       └── 2.1KITTI数据集.md
│   ├── 现有工作/
│   └── ...
├── .vitepress/
│   ├── config.mts             # VitePress 配置
│   └── sidebar.mts            # 侧边栏配置（由 update.sh 自动生成）
└── update.sh                  # 侧边栏更新脚本
```

### 写文章三步走

**第 1 步：创建目录和文件**

在 `docs/kb/` 下新建文件夹和 `.md` 文件。例如：

```bash
mkdir -p docs/kb/我的新分类
echo "# 我的新文章" > docs/kb/我的新分类/我的新文章.md
```

**第 2 步：写 Markdown**

直接写标准 Markdown，支持所有 GFM 语法，额外支持：

```markdown
# 标题

正文内容...

## 数学公式

行内公式 $E = mc^2$，块级公式：

$$
\int_0^\infty e^{-x^2} dx = \frac{\sqrt{\pi}}{2}
$$

## 代码块

​```python
print("hello world")
​```
```

**第 3 步：刷新侧边栏**

文件保存后，系统会自动检测变更并重新生成侧边栏（通过 `inotify` 监听，3 秒内完成）。你也可以手动运行：

```bash
bash docs/update.sh
```

侧边栏由 `docs/.vitepress/sidebar.mts` 控制，此文件由 `update.sh` 自动扫描 `docs/kb/` 目录结构生成，**不要手动编辑**。

### 文件夹命名建议

- 文件夹名 = 侧边栏分组的显示名称
- 文件夹下的 `index.md` = 该分组的首页（可作为导读或目录）
- 如果文件夹下的子内容都是 `.md` 文件且不超过一层，可省略子文件夹，直接用扁平结构

### 关于 `index.md`

- `docs/index.md`：站点的首页（Hero 区域），里面定义了页面头部的标题、标语和快速入口按钮
- `docs/kb/某分类/index.md`：该分类的首页，可写分类导读。如果不需要导读，可以不创建——不影响侧边栏生成

---

## 🤖 AI 对话（RAG）工作机制

### 整体架构

```
用户提问
    │
    ▼
┌──────────────────────────────────────┐
│  1. 检索 (Retrieve)                  │
│  ┌────────────────────────────────┐  │
│  │ 对问题分词 → 与知识库索引匹配    │  │
│  │ 返回 Top-K 个最相关文本片段     │  │
│  └────────────────────────────────┘  │
│              │                        │
│              ▼                        │
│  2. 增强 (Augment)                   │
│  ┌────────────────────────────────┐  │
│  │ 将检索片段 + 系统提示词         │  │
│  │ + 对话历史 → 拼成最终 prompt    │  │
│  └────────────────────────────────┘  │
│              │                        │
│              ▼                        │
│  3. 生成 (Generate)                  │
│  ┌────────────────────────────────┐  │
│  │ 发送给大模型 → 流式返回答案     │  │
│  │ 同时返回引用来源（文件、片段号） │  │
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘
```

### 索引机制

1. **文件扫描**：启动时递归扫描 `docs/kb/` 下所有 `.md` 文件
2. **Markdown 清洗**：去除 frontmatter、图片、链接、代码块等格式标记，保留纯文本
3. **文本分块**：按 `chunkSize`（默认 1600 字符）切块，相邻块之间保留 `chunkOverlap`（默认 200 字符）重叠
4. **分词建索引**：对每个分块提取中英文 Token（英文 2+ 字符词、中文 2-4 字 n-gram），建立倒排索引
5. **缓存持久化**：索引保存到 `.cache/kb-chat-index.json`，下次启动直接加载，秒级就绪
6. **增量更新**：通过 `inotifywait` 监听文件变更，文件修改后自动增量重建索引；如 inotify 不可用则定时轮询（默认 30 秒）

### 检索打分策略

检索时对每个分块计算相关性分数：

| 匹配类型 | 权重 | 说明 |
|---------|------|------|
| 文件路径关键词匹配 | +12 (≥4字) / +6 | 路径中的目录名、文件名匹配 |
| 内容关键词匹配 | +2 (≥4字) / +1 | 正文内容匹配 |
| 路径名短语精确匹配 | +120 | 问题中的关键短语出现在路径中 |
| 顶级目录名匹配 | +100 | 问题中包含顶级分类名 |
| index.md 加分 | +8 | 分类首页优先 |
| 文件名包含问题文本 | +10 | 兜底精确匹配 |

最终取 Top-K（默认 K=6）个分片送入上下文。

### 配置 RAG 参数

在 `kb-chat.config.json` 中调整：

```json
{
  "rag": {
    "topK": 6,           // 检索返回的最大片段数
    "chunkSize": 1600,   // 文本分块大小（字符数）
    "chunkOverlap": 200  // 相邻分块的重叠区域
  },
  "kb": {
    "dir": "docs/kb",       // 知识库目录
    "refreshMs": 30000,     // 定时刷新间隔（毫秒，inotify 不可用时生效）
    "useInotify": true      // 是否使用文件监听
  },
  "indexCache": {
    "enabled": true,
    "file": ".cache/kb-chat-index.json"
  }
}
```

### 🎭 自定义系统提示词（`prompts.md`）

你可以在项目根目录创建 `prompts.md` 来**自定义 AI 的系统提示词**，让对话助手的行为、语气、知识范围更符合你的需求。

**工作原理：**

```
prompts.md 存在？
    │
    ├── 是 → 系统提示词 = prompts.md 内容 + 知识库强制规则
    │
    └── 否 → 使用内置默认提示词（实验室知识库助手）
```

无论你是否自定义，以下**强制规则**始终会追加到系统提示词末尾：
- 必须优先依据知识库片段回答
- 知识库不足时明确说明，再给一般建议
- 回答使用中文，直接具体
- 不编造文件、结论或实验结果

**示例 `prompts.md`：**

```markdown
你是一个自动驾驶研究实验室的专业知识助手，名叫"小车"。
你应该：
- 用热情、专业的态度回答每个问题
- 当用户问"有哪些论文"时，先列出知识库中的论文，再给出总结
- 回答中涉及技术术语时，附带简短的中文解释
- 如果用户问代码相关的问题，尽量给出可运行的代码示例
- 永远用"同学"称呼提问者
```

**注意事项：**
- `prompts.md` 已加入 `.gitignore`，不会提交到 Git——每台部署的服务器可以有自己独立的提示词
- 修改后无需重启服务，下次对话自动生效（每次请求都会重新读取）
- 文件编码为 UTF-8
- 保持提示词简洁——太长的系统提示词会挤占知识库片段的空间

---

## 🔌 大模型提供商配置

### 配置架构

大模型后端有两个并行的体系，**共存且自动降级**：

```
用户请求
    │
    ├── 1. Provider Pool（优先级高）
    │     支持多源、自定义模板、自定义 JS
    │     失败时自动切换下一个 Provider
    │
    └── 2. Ollama 本地（降级后备）
          支持多端点订阅、健康检查、自动切换
```

所有大模型相关配置都在 `kb-chat.providers.json` 中。

### 方式一：Ollama 订阅（本地/自部署模型）

适用场景：自己有 Ollama 服务，或者使用能提供 Ollama 订阅链接的源。

```json
{
  "version": 1,
  "sources": [
    {
      "type": "ollama-subscription",
      "label": "我的 Ollama 订阅",
      "url": "https://example.com/my-ollama-subscription.json",
      "model": ""
    },
    {
      "type": "ollama-endpoints",
      "label": "手动指定端点",
      "endpoints": [
        { "url": "http://192.168.114.51:11434" },
        { "url": "http://192.168.114.51:11435" }
      ],
      "model": "qwen2.5:7b"
    }
  ]
}
```

**订阅 JSON 格式**（Ollama 订阅链接返回的数据格式）：

```json
[
  {
      "url": "https://114.5.1.4",
      "speeds": [
          {
              "model": "gpt-oss:120b",
              "speed": 114514.1919810
          }
      ]
  },
  {
      "url": "https://11.45.1.4",
      "speeds": [
          {
              "model": "qwen3:4b-instruct-2507-q4_K_M",
              "speed": 114.5141919810
          }
      ]
  },
  {
      "url": "http://1.145.1.4",
      "speeds": [
          {
              "model": "llama3.2:3b",
              "speed": 11.45141919810
          }
      ]
  }
]
```

系统会从中自动提取端点和模型列表，并做健康检查。

### 方式二：CoolAuxv Provider Base64（大模型提供商）

适用场景：使用 CoolAuxv 等工具导出的提供商配置（加密为 base64），或直接粘贴 JSON 格式的 provider 配置。

#### 从 CoolAuxv 导出

在 [CoolAuxv](https://github.com/CoolestEnoch/CoolAuxv) 中导出提供商 → 复制 base64 字符串 → 粘贴到配置：

```json
{
  "version": 1,
  "sources": [
    {
      "type": "coolauxv-base64",
      "label": "我的 API 提供商",
      "value": "eyJwcm92aWRlcnMiOl...（这里粘贴完整的 base64 字符串）"
    }
  ]
}
```

#### Base64 解码后的 Provider JSON 格式

```json
{
  "providers": [
    {
      "id": "my-provider",
      "label": "我的提供商",
      "type": "chat-completions",
      "baseUrl": "https://api.example.com/v1/chat/completions",
      "apiKey": "sk-xxxxxxxxxxxxxxxx",
      "headersTemplate": {
        "Content-Type": "application/json"
      },
      "bodyTemplate": {
        "model": "{{model}}",
        "stream": true,
        "messages": "{{messages}}"
      },
      "stream": {
        "parser": "chat-completions",
        "deltaPath": "choices.0.delta.content"
      },
      "modelGroups": [
        {
          "id": "general",
          "label": "通用模型",
          "type": "text",
          "models": [
            { "id": "gpt-4o", "tag": "latest" },
            { "id": "claude-3.5-sonnet", "tag": "" }
          ],
          "selectedModel": "gpt-4o"
        }
      ]
    }
  ]
}
```

#### Provider 类型说明

| 类型 | 说明 |
|------|------|
| `chat-completions` | OpenAI 兼容的 `/v1/chat/completions` 接口 |
| `openai-responses` | OpenAI Responses API 格式 |
| `chat-parts` | 自定义 parts-based 消息格式 |
| `chat-no-history` | 无对话历史模式（每次请求独立） |
| `ollama` | Ollama 原生 API |

#### 模板变量

`bodyTemplate` 和 `headersTemplate` 中支持 `{{变量名}}` 模板语法：

| 变量 | 说明 |
|------|------|
| `{{model}}` | 当前选定模型 |
| `{{messages}}` | 对话消息数组 |
| `{{apiKey}}` | API Key |
| `{{latestUserText}}` | 最新一条用户消息纯文本 |
| `{{requestId}}` | 自动生成的请求 ID |
| `{{baseUrl}}` | Provider 的 baseUrl |

#### 自定义 JavaScript

Provider 支持 `customJsCode` 字段，可注入自定义 JS 来动态修改请求体、请求头、使用 `GM_xmlhttpRequest` 调用外部 API：

```json
{
  "customJsCode": "async function getToken() { const res = await fetch('https://auth.example.com/token'); const data = await res.json(); return data.access_token; }"
}
```

JS 沙箱提供了 `fetch`、`GM_xmlhttpRequest`、`crypto`、`atob`/`btoa` 等 API。

### 方式三：通过 API 导入 Base64

前端右下角的 AI 对话框提供"导入提供商"入口，粘贴 base64 即可在线导入，无需改配置文件。底层调用：

```
POST /api/provider-pool/import
{ "base64": "eyJwcm92aWRlcnMiOl..." }
```

### Provider Pool 机制

- 多个 Provider 源并发请求，合并去重
- 缓存到 `.cache/provider-pool.json`
- 聊天时 Provider 失败 → 自动跳过，尝试下一个
- Provider Pool 全部失败 → 自动降级到 Ollama

---

## 🔧 完整配置参考

### `kb-chat.config.json`

```json
{
  "chatServer": {
    "host": "0.0.0.0",
    "proxyHost": "127.0.0.1",
    "port": 1145
  },
  "vitepress": {
    "host": "0.0.0.0",
    "port": 1919
  },
  "copyparty": {
    "host": "0.0.0.0",
    "port": 10810,
    "publicUrl": "http://127.0.0.1:10810",
    "user": "",
    "pass": ""
  },
  "kb": {
    "dir": "docs/kb",
    "refreshMs": 30000,
    "useInotify": true
  },
  "rag": {
    "topK": 6,
    "chunkSize": 1600,
    "chunkOverlap": 200
  },
  "indexCache": {
    "enabled": true,
    "file": ".cache/kb-chat-index.json"
  },
  "providersFile": "kb-chat.providers.json",
  "providerPool": {
    "enabled": true,
    "cacheFile": ".cache/provider-pool.json",
    "timeoutMs": 120000,
    "retryLimit": 6
  },
  "ollama": {
    "subscriptionRefreshTime": "04:00",
    "tagsTimeoutMs": 3000,
    "healthBatchSize": 12,
    "healthLimit": 60,
    "chatRetryLimit": 8,
    "chatTimeoutMs": 120000,
    "defaultModel": ""
  }
}
```

### `kb-chat.providers.json`

```json
{
  "version": 1,
  "sources": [
    {
      "type": "coolauxv-base64",
      "label": "示例 Provider",
      "value": "base64_here"
    },
    {
      "type": "ollama-subscription",
      "label": "Ollama 订阅",
      "url": "https://example.com/ollama.json"
    },
    {
      "type": "ollama-endpoints",
      "label": "手动端点",
      "endpoints": [
        { "url": "http://localhost:11434" }
      ]
    }
  ]
}
```

---

## 🛠️ npm 脚本

| 命令 | 说明 |
|------|------|
| `npm run docs:dev` | 启动 VitePress 开发服务器 |
| `npm run docs:build` | 构建生产版本 |
| `npm run docs:preview` | 预览生产构建 |
| `npm run kb-chat:init` | 初始化配置文件（安全模式，不覆盖已有） |
| `npm run kb-chat:init:force` | 强制初始化配置文件（覆盖） |
| `npm run kb-chat:server` | 单独启动 KB Chat 后端 |

---

## 📁 项目结构

```
.
├── docs/
│   ├── index.md                  # 站点首页
│   ├── kb/                       # 知识库内容（所有 .md 文件放这里）
│   ├── .vitepress/
│   │   ├── config.mts            # VitePress 配置
│   │   ├── sidebar.mts           # 侧边栏（自动生成）
│   │   └── theme/                # 自定义主题（含 AI Chat 组件）
│   └── update.sh                 # 侧边栏生成脚本
├── server/
│   └── kb-chat-server.mjs        # KB Chat 后端（RAG + API）
├── kb-chat.config.json           # 主配置文件
├── kb-chat.providers.json        # 大模型提供商配置
├── .cache/                       # 索引缓存 & Provider 池缓存
├── run.sh                        # 一键启动脚本
├── package.json
└── README.md
```

---

## 📄 License

GPLv3 — 详见 [LICENSE](./LICENSE)
