#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DOCS_DIR="$ROOT_DIR/docs"
UPDATE_SCRIPT="$DOCS_DIR/update.sh"
COPYPARTY_SCRIPT="$DOCS_DIR/copyparty-sfx.py"
CHAT_SERVER_SCRIPT="$ROOT_DIR/server/kb-chat-server.mjs"

VITEPRESS_HOST=""
VITEPRESS_PORT=""
COPYPARTY_HOST=""
COPYPARTY_PORT=""
COPYPARTY_USER=""
COPYPARTY_PASS=""
KB_CHAT_HOST=""
KB_CHAT_PORT=""
KB_DIR=""

# 所有子进程 PID 收集在这里
declare -a PIDS=()

# ── 清理：递归杀进程树 + 进程组兜底 ──────────────────

kill_tree() {
    local pid="$1" child_pids
    child_pids=$(pgrep -P "$pid" 2>/dev/null || true)
    for c in $child_pids; do
        kill_tree "$c"
    done
    kill -TERM "$pid" 2>/dev/null || true
}

cleanup() {
    # 防止递归触发
    trap '' INT TERM EXIT

    echo ""
    echo "[EXIT] 正在递归清理所有子进程..."

    # 1. 递归 SIGTERM 杀掉整棵进程树
    for pid in "${PIDS[@]}"; do
        kill_tree "$pid"
    done

    # 2. 等子进程优雅退出
    sleep 1

    # 3. SIGKILL 强杀残留（只杀子进程，不杀自己）
    for pid in "${PIDS[@]}"; do
        kill -KILL "$pid" 2>/dev/null || true
    done
    pkill -KILL -P $$ 2>/dev/null || true

    wait 2>/dev/null || true
    echo "[EXIT] 已退出"
}

# ── 配置读取 ───────────────────────────────────────

load_runtime_config() {
    eval "$(cd "$ROOT_DIR" && node - <<'NODE'
const fs = require('fs');
const path = require('path');
const root = process.cwd();
const cfgFile = path.join(root, 'kb-chat.config.json');
const shellString = (name, value) => `${name}=${JSON.stringify(String(value ?? ''))}`;
const requiredString = (value, name) => {
  const text = String(value ?? '').trim();

  if (!text) throw new Error(`missing config: ${name}`);
  return text;
};
const requiredPort = (value, name) => {
  const port = Number(value);

  if (!Number.isInteger(port) || port <= 0 || port > 65535) {
    throw new Error(`invalid config port: ${name}`);
  }

  return port;
};

let cfg;

try {
  cfg = JSON.parse(fs.readFileSync(cfgFile, 'utf8'));
} catch (err) {
  throw new Error(`failed to load ${cfgFile}: ${String(err?.message || err)}`);
}

const kbDir = cfg.kb && cfg.kb.dir ? path.resolve(root, cfg.kb.dir) : path.resolve(root, 'docs/kb');
const lines = [
  shellString('KB_DIR', kbDir),
  shellString('KB_CHAT_HOST', requiredString(cfg.chatServer?.host, 'chatServer.host')),
  shellString('KB_CHAT_PORT', requiredPort(cfg.chatServer?.port, 'chatServer.port')),
  shellString('VITEPRESS_HOST', requiredString(cfg.vitepress?.host, 'vitepress.host')),
  shellString('VITEPRESS_PORT', requiredPort(cfg.vitepress?.port, 'vitepress.port')),
  shellString('COPYPARTY_HOST', requiredString(cfg.copyparty?.host, 'copyparty.host')),
  shellString('COPYPARTY_PORT', requiredPort(cfg.copyparty?.port, 'copyparty.port')),
  shellString('COPYPARTY_USER', cfg.copyparty?.user || ''),
  shellString('COPYPARTY_PASS', cfg.copyparty?.pass || ''),
];

console.log(lines.join('\n'));
NODE
)"
}

# ── 环境检查 ───────────────────────────────────────

check_env() {
    if ! command -v node >/dev/null 2>&1; then
        echo "[ERROR] 缺少 node"
        exit 1
    fi
    if ! command -v npm >/dev/null 2>&1; then
        echo "[ERROR] 缺少 npm"
        exit 1
    fi

    load_runtime_config

    if [ ! -d "$KB_DIR" ]; then
        echo "[ERROR] kb 目录不存在：$KB_DIR"
        exit 1
    fi
    if [ ! -f "$UPDATE_SCRIPT" ]; then
        echo "[ERROR] update.sh 不存在：$UPDATE_SCRIPT"
        exit 1
    fi
    if [ ! -f "$COPYPARTY_SCRIPT" ]; then
        echo "[ERROR] copyparty 不存在：$COPYPARTY_SCRIPT"
        exit 1
    fi
    if [ ! -f "$CHAT_SERVER_SCRIPT" ]; then
        echo "[ERROR] chat server 不存在：$CHAT_SERVER_SCRIPT"
        exit 1
    fi
}

# ── update.sh ──────────────────────────────────────

run_update() {
    echo ""
    echo "[KB] 正在运行 docs/update.sh ..."
    cd "$ROOT_DIR"
    if bash "$UPDATE_SCRIPT"; then
        echo "[KB] update.sh 执行完成"
    else
        echo "[KB] update.sh 执行失败，但服务继续"
    fi
    echo ""
}

# ── 启动各服务（全部作为子进程，同一进程组）─────────

start_copyparty() {
    local args=("-i" "$COPYPARTY_HOST" "-p" "$COPYPARTY_PORT")
    if [ -n "$COPYPARTY_USER" ] && [ -n "$COPYPARTY_PASS" ]; then
        args+=("-a" "${COPYPARTY_USER}:${COPYPARTY_PASS}")
        args+=("-v" "${KB_DIR}::rwmd,${COPYPARTY_USER}")
    else
        args+=("-v" "${KB_DIR}::rwmd")
    fi
    echo "[Copyparty] http://${COPYPARTY_HOST}:${COPYPARTY_PORT}/ -> $KB_DIR"
    python3 "$COPYPARTY_SCRIPT" "${args[@]}" &
    PIDS+=($!)
}

start_chat_server() {
    echo "[KB Chat] 启动后端：http://${KB_CHAT_HOST}:${KB_CHAT_PORT}"
    cd "$ROOT_DIR"
    node "$CHAT_SERVER_SCRIPT" &
    PIDS+=($!)
}

start_vitepress() {
    echo "[VitePress] npx vitepress dev docs --host $VITEPRESS_HOST --port $VITEPRESS_PORT"
    cd "$ROOT_DIR"
    npx vitepress dev docs --host "$VITEPRESS_HOST" --port "$VITEPRESS_PORT" &
    PIDS+=($!)
}

# ── 端口检查 ──────────────────────────────────────

check_ports() {
    local -a ports=("$VITEPRESS_PORT" "$COPYPARTY_PORT" "$KB_CHAT_PORT")
    local -a names=("VitePress" "Copyparty" "KB Chat")
    local has_conflict=0

    for i in "${!ports[@]}"; do
        if ss -tlnp 2>/dev/null | grep -q ":${ports[$i]}\b"; then
            echo "[ERROR] 端口 ${ports[$i]} (${names[$i]}) 已被占用"
            has_conflict=1
        fi
    done

    if [ "$has_conflict" -eq 1 ]; then
        echo ""
        echo "[ERROR] 存在端口冲突，拒绝启动。请先停止占用端口的进程："
        echo "  fuser -k ${VITEPRESS_PORT}/tcp ${COPYPARTY_PORT}/tcp ${KB_CHAT_PORT}/tcp"
        exit 1
    fi
}

# ── 主入口 ─────────────────────────────────────────

main() {
    check_env
    check_ports
    trap cleanup INT TERM EXIT

    run_update

    start_copyparty
    start_chat_server
    start_vitepress

    # 等待任意子进程退出（异常时触发 cleanup）
    wait
}

main "$@"
