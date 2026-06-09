#!/bin/bash
# ============================================================
# update.sh — 自动扫描 kb/ 目录生成 VitePress sidebar 配置
# 纯 bash + awk 实现
#
# - 从 kb-chat.config.json 读取 kb 目录配置
# - 自动发现 kb/ 下所有非隐藏文件夹作为 section
# - 支持 index.md 定义结构 + 自动扫描未引用文件
# - 无 index.md 的文件夹递归扫描目录结构
# - 空文件夹也会保留在 sidebar 中
# - kb 根目录零散 .md 文件归入"未分类"
# - config.mts 缺失时从 config.mts_default 初始化本地配置
#
# 用法:
#   cd docs && ./update.sh
# ============================================================

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$SCRIPT_DIR"

# ── 从 kb-chat.config.json 读取 kb 目录配置 ──
eval "$(node -e "
const fs = require('fs');
const path = require('path');
const root = '$ROOT_DIR';
const cfgFile = path.join(root, 'kb-chat.config.json');
let kbDirRel = 'docs/kb';
try { const cfg = JSON.parse(fs.readFileSync(cfgFile, 'utf8')); kbDirRel = cfg.kb?.dir || kbDirRel; } catch {}
const kbAbs = path.resolve(root, kbDirRel);
const kbRel = path.relative('$SCRIPT_DIR', kbAbs);
const urlPrefix = '/' + kbRel;  // e.g., /kb
console.log('KB_DIR_REL=' + JSON.stringify(kbRel));
console.log('KB_URL_PREFIX=' + JSON.stringify(urlPrefix));
")"

echo "==> 开始生成 sidebar (kb dir: $KB_DIR_REL) ..."

# ── VitePress 本地配置：config.mts 可不纳入 Git 跟踪 ──

ensure_vitepress_config() {
    local vitepress_dir=".vitepress"
    local config_file="$vitepress_dir/config.mts"
    local template_file="$vitepress_dir/config.mts_default"

    mkdir -p "$vitepress_dir"

    if [[ -f "$config_file" ]]; then
        return
    fi

    if [[ -f "$template_file" ]]; then
        cp "$template_file" "$config_file"
        echo "🧩 $config_file 不存在，已从 $template_file 初始化"
    else
        echo "⚠ $config_file 不存在，且未找到 $template_file；将只更新 sidebar.mts" >&2
    fi
}

# ── 文件锁：防止并发执行导致 sidebar 翻倍 ──
LOCK_FILE="/tmp/vitepress_sidebar_update.lock"
exec 9>"$LOCK_FILE"
if ! flock -n 9; then
    echo "⏳ update.sh 正在运行中（并发调用已跳过）"
    exit 0
fi

# ── 解析根 index.md：获取 section 列表 ─────────────────

parse_root_index() {
    local in_actions=0 text="" link=""
    while IFS= read -r line; do
        [[ "$line" =~ ^[[:space:]]*actions: ]] && { in_actions=1; continue; }
        # 遇到下一个顶级 key 停止
        [[ $in_actions -eq 1 && "$line" =~ ^[[:space:]]{0,2}[a-zA-Z]+: && ! "$line" =~ ^[[:space:]]{2,} ]] && in_actions=0
        [[ $in_actions -eq 0 ]] && continue
        if [[ "$line" =~ ^[[:space:]]*text:[[:space:]]*(.+)[[:space:]]*$ ]]; then
            text="${BASH_REMATCH[1]}"; text="${text//\"/}"; text="${text//\'/}"
        fi
        if [[ "$line" =~ ^[[:space:]]*link:[[:space:]]*(/[^[:space:]]+)[[:space:]]*$ ]]; then
            link="${BASH_REMATCH[1]}"
            [[ -n "$text" && -n "$link" ]] && { printf '%s|%s\n' "$text" "$link"; text=""; link=""; }
        fi
    done < "index.md"
}

# ── 发现 kb/ 下的所有非隐藏文件夹 ─────────────────────

discover_kb_dirs() {
    for d in "$KB_DIR_REL"/*/; do
        [[ -d "$d" ]] || continue
        local name
        name=$(basename "$d")
        # 跳过隐藏文件夹和 img 文件夹
        [[ "$name" == .* ]] && continue
        [[ "$name" == "img" ]] && continue
        printf '%s|%s\n' "$name" "${KB_URL_PREFIX}/${name}"
    done
}

# ── bash 版单引号转义（与 awk esc 保持一致）─────────────

escape_ts() {
    local s="$1"
    s="${s//\\/\\\\}"
    s="${s//\'/\\\'}"
    printf '%s' "$s"
}

# ── 递归扫描目录生成结构化行（用于没有 index.md 的目录）──

scan_dir_recursive() {
    local dir="$1"       # 文件系统路径
    local base_path="$2" # URL 路径前缀
    local depth="$3"     # 当前深度

    [[ -d "$dir" ]] || return

    local -a entries=()

    for subdir in "$dir"/*/; do
        [[ -d "$subdir" ]] || continue
        local sub_name
        sub_name=$(basename "$subdir")
        # 跳过隐藏文件夹和 img 文件夹
        [[ "$sub_name" == .* ]] && continue
        [[ "$sub_name" == "img" ]] && continue
        entries+=("D|$sub_name|$subdir")
    done

    for f in "$dir"/*.md; do
        [[ -f "$f" ]] || continue
        local bn
        bn=$(basename "$f")
        [[ "$bn" == "index.md" ]] && continue
        entries+=("F|$bn|$f")
    done

    [[ ${#entries[@]} -gt 0 ]] || return

    local sorted_entries
    sorted_entries=$(printf '%s\n' "${entries[@]}" | sort -t '|' -k2,2V)

    while IFS='|' read -r etype name entry_path; do
        [[ -n "$etype" ]] || continue

        if [[ "$etype" == "D" ]]; then
            local sub_url="${base_path}/${name}"
            local group_link=""
            [[ -f "$entry_path/index.md" ]] && group_link="$sub_url"

            printf 'G|%d|%s|%s\n' "$depth" "$(escape_ts "$name")" "$(escape_ts "$group_link")"
            scan_dir_recursive "$entry_path" "$sub_url" $((depth + 1))
        else
            local name_noext="${name%.md}"
            printf 'L|%d|%s|%s\n' "$depth" \
                "$(escape_ts "$name_noext")" \
                "$(escape_ts "${base_path}/${name_noext}")"
        fi
    done <<< "$sorted_entries"
}

# ── awk 脚本：解析 section 的 markdown index ─────────────
# 输出: G|depth|text|link  或  L|depth|text|link
# depth: 0=##, 1=###, 2=####; 列表项 = 当前标题depth+1

read -r -d '' PARSE_AWK << 'AWKEOF' || true
BEGIN { stack_len = 0; }

function to_path(rel, sect) {
    sub(/\.md$/, "", rel);
    sub(/\/index$/, "", rel);
    if (rel == "") rel = "/";
    else if (rel !~ /^\//) rel = "/" rel;
    path = sect rel;
    sub(/\/$/, "", path);
    return path;
}
function esc(s) {
    gsub(/\\/, "\\\\", s);
    gsub(/\047/, "\\\047", s);
    return s;
}
function path_dir(path) {
    sub(/\/[^\/]+$/, "", path);
    return path;
}
function is_under(child, parent) {
    return child == parent || substr(child, 1, length(parent) + 1) == parent "/";
}
function parse_link(content, _j, _t, _l) {
    if (match(content, /^\[[^]]+\]\(.+\)$/)) {
        _j = index(content, "](");
        _t = substr(content, 2, _j - 2);
        _l = substr(content, _j + 2);
        _l = substr(_l, 1, length(_l) - 1);
        return _t "|" _l;
    }
    return content "|";
}
function close_to(lvl) {
    while (stack_len > 0 && stack[stack_len] >= lvl) stack_len--;
}
/^#{2,4} / {
    rl = length($1); al = rl - 2;
    $1 = ""; sub(/^[[:space:]]+/, "");
    parsed = parse_link($0);
    split(parsed, p, "|");
    vp = (p[2] != "") ? to_path(p[2], sect) : "";
    close_to(al);
    stack_len++; stack[stack_len] = al;
    stack_link[stack_len] = vp;
    printf "G|%d|%s|%s\n", al, esc(p[1]), esc(vp);
    next;
}
/^[-*] \[.+\]\(.+\)/ {
    sub(/^[-*][[:space:]]+/, "");
    parsed = parse_link($0);
    split(parsed, p, "|");
    vp = to_path(p[2], sect);
    target = stack_len;

    # Plain headings have no explicit link. Infer their folder from the first child
    # so later sibling links can escape instead of being swallowed by the group.
    if (target > 0 && stack_link[target] == "" && vp != "") stack_link[target] = path_dir(vp);

    while (target > 0 && stack_link[target] != "" && vp != "" && !is_under(vp, stack_link[target])) target--;

    d = (target > 0) ? stack[target] + 1 : 0;
    printf "L|%d|%s|%s\n", d, esc(p[1]), esc(vp);
}
AWKEOF

parse_section_index() {
    local file="$1" section_path="$2"
    [[ -f "$file" ]] || return
    awk -v sect="$section_path" "$PARSE_AWK" "$file"
}

# ── awk 脚本：过滤空分组 ───────────────────────────────
# 保留有 link、有子项、或 depth==0 的顶级分组

read -r -d '' FILTER_AWK << 'AWKEOF' || true
BEGIN { FS="|"; }
{ lines[NR] = $0; types[NR] = $1; depths[NR] = int($2); }
END {
    for (i = 1; i <= NR; i++) keep[i] = 1;
    for (i = 1; i <= NR; i++) {
        if (types[i] != "G") continue;
        d = depths[i];
        has = 0;
        # 自身有 link 就算有内容
        split(lines[i], p, "|");
        if (p[4] != "") has = 1;
        # 或后面有更深层级的子项
        for (j = i + 1; !has && j <= NR; j++) {
            if (depths[j] <= d) break;
            if (keep[j] == 1) has = 1;
        }
        # depth=0 的顶级分组始终保留（即使没有子项，空文件夹也要显示）
        if (!has && d == 0) has = 1;
        if (!has) keep[i] = 0;
    }
    for (i = 1; i <= NR; i++) if (keep[i]) print lines[i];
}
AWKEOF

# ── awk 脚本：结构化行 → TypeScript ─────────────────────

read -r -d '' RENDER_AWK << 'AWKEOF' || true
BEGIN { FS = "|"; stack_len = 0; }
function indent(n)  { return sprintf("%*s", 6 + n * 4, ""); }
function iprop(n)   { return sprintf("%*s", 6 + n * 4 + 2, ""); }

{
    type = $1; depth = int($2); text = $3; link = $4;

    # 关闭层级 >= 当前 depth 的分组
    while (stack_len > 0 && stack[stack_len] >= depth) {
        d = stack[stack_len];
        print iprop(d) "],";
        print indent(d) "},";
        stack_len--;
    }

    if (type == "G") {
        print indent(depth) "{";
        print iprop(depth) "text: \047" text "\047,";
        if (link != "") print iprop(depth) "link: \047" link "\047,";
        print iprop(depth) "collapsed: true,";
        print iprop(depth) "items: [";
        stack_len++;
        stack[stack_len] = depth;
    } else if (type == "L") {
        print indent(depth) "{ text: \047" text "\047, link: \047" link "\047 },";
    }
}
END {
    while (stack_len > 0) {
        d = stack[stack_len];
        print iprop(d) "],";
        print indent(d) "},";
        stack_len--;
    }
}
AWKEOF

# ── 主流程 ─────────────────────────────────────────────

main() {
    ensure_vitepress_config

    # 1. 从 index.md 解析显式列出的 sections
    local -a sec_names=() sec_paths=()
    while IFS='|' read -r name path; do
        sec_names+=("$name")
        sec_paths+=("$path")
    done < <(parse_root_index)

    echo "📂 从根 index.md 发现 ${#sec_names[@]} 个 section:"

    # 构建显式 section 的集合
    local -A explicit_set
    for i in "${!sec_names[@]}"; do
        explicit_set["${sec_names[$i]}"]=1
        echo "  ✓ ${sec_names[$i]} (${sec_paths[$i]}) — 来自 index.md"
    done

    # 2. 发现 kb/ 下其他文件夹（未在 index.md 中列出的）
    local discovered=0
    while IFS='|' read -r name path; do
        if [[ -z "${explicit_set[$name]:-}" ]]; then
            sec_names+=("$name")
            sec_paths+=("$path")
            echo "  🔍 $name ($path) — 自动发现（文件系统扫描）"
            discovered=$((discovered + 1))
        fi
    done < <(discover_kb_dirs)

    if [[ $discovered -gt 0 ]]; then
        echo "📂 自动发现 $discovered 个新文件夹"
    fi

    if [[ ${#sec_names[@]} -eq 0 ]]; then
        echo "❌ 未找到任何 kb section" >&2
        exit 1
    fi

    # 3. 收集所有结构化行到临时文件
    local tmp_raw="/tmp/vitepress_sidebar_raw.txt"
    local tmp_filtered="/tmp/vitepress_sidebar_filtered.txt"
    > "$tmp_raw"

    for i in "${!sec_names[@]}"; do
        local name="${sec_names[$i]}"
        local path="${sec_paths[$i]}"
        local index_file="${path#/}/index.md"
        local sec_dir="${path#/}"  # e.g., kb/学习笔记
        local tmp_sec="/tmp/vitepress_sec_$$_${i}.txt"

        # 显式声明的 section 如果文件夹已删除，跳过
        if [[ -n "${explicit_set[$name]:-}" ]] && [[ ! -d "$sec_dir" ]]; then
            echo "  ⚠ $name ($path) — 文件夹已删除，跳过" >&2
            continue
        fi

        # Section 自身是 depth=0 的 Group
        # 有 index.md 才带 link（可点击打开页面），否则纯分类（只能展开/收起）
        if [[ -f "$index_file" ]]; then
            printf 'G|0|%s|%s\n' "$(escape_ts "$name")" "$(escape_ts "$path")" >> "$tmp_raw"
        else
            printf 'G|0|%s|\n' "$(escape_ts "$name")" >> "$tmp_raw"
        fi

        if [[ -f "$index_file" ]]; then
            # ── 有 index.md：用现有解析器 ──
            parse_section_index "$index_file" "$path" > "$tmp_sec"

            # 收集所有已被引用的完整路径
            local all_refs=""
            while IFS='|' read -r stype sdepth stext slink; do
                [[ -n "$slink" ]] && all_refs+="${slink}"$'\n'
            done < "$tmp_sec"

            # 扫描 section 根目录下未被 index.md 引用的 .md 文件
            local sec_root="${index_file%/*}"
            local -a root_extras=()
            for f in "$sec_root"/*.md; do
                [[ -f "$f" ]] || continue
                local bn=$(basename "$f")
                [[ "$bn" == "index.md" ]] && continue
                local name_noext="${bn%.md}"
                local check="${path}/${name_noext}"
                if ! echo "$all_refs" | grep -qxF "$check"; then
                    root_extras+=("$bn")
                fi
            done
            if [[ ${#root_extras[@]} -gt 0 ]]; then
                local tmp_sec2="/tmp/vitepress_sec2_$$_${i}.txt"
                local sorted_root
                sorted_root=$(printf '%s\n' "${root_extras[@]}" | sort)
                while IFS= read -r bn; do
                    local name_noext="${bn%.md}"
                    printf 'L|0|%s|%s\n' \
                        "$(escape_ts "$name_noext")" \
                        "$(escape_ts "${path}/${name_noext}")" >> "$tmp_sec2"
                done <<< "$sorted_root"
                cat "$tmp_sec" >> "$tmp_sec2"
                mv "$tmp_sec2" "$tmp_sec"
            fi

            # 将 tmp_sec 读入数组后重建，把未引用文件插入到对应 G 后面
            local -a sec_lines=()
            while IFS='|' read -r stype sdepth stext slink; do
                sec_lines+=("$stype|$sdepth|$stext|$slink")
            done < "$tmp_sec"

            > "$tmp_sec"
            local idx=0
            while [[ $idx -lt ${#sec_lines[@]} ]]; do
                IFS='|' read -r stype sdepth stext slink <<< "${sec_lines[$idx]}"

                # 输出当前行
                printf '%s|%s|%s|%s\n' "$stype" "$sdepth" "$stext" "$slink" >> "$tmp_sec"

                # 如果是带 link 的 G，扫描其目录插入未引用的 .md 文件
                if [[ "$stype" == "G" && -n "$slink" ]]; then
                    local fs_dir="${slink#/}"
                    local real_dir="${fs_dir//\\\'/\'}"
                    if [[ -d "$real_dir" ]]; then
                        local -a extras=()
                        for f in "$real_dir"/*.md; do
                            [[ -f "$f" ]] || continue
                            local bn=$(basename "$f")
                            [[ "$bn" == "index.md" ]] && continue
                            local name_noext="${bn%.md}"
                            local check="${slink}/${name_noext}"
                            if ! echo "$all_refs" | grep -qxF "$check"; then
                                extras+=("$bn")
                            fi
                        done
                        if [[ ${#extras[@]} -gt 0 ]]; then
                            local sorted
                            sorted=$(printf '%s\n' "${extras[@]}" | sort)
                            while IFS= read -r bn; do
                                local name_noext="${bn%.md}"
                                printf 'L|%d|%s|%s\n' $((sdepth + 1)) \
                                    "$(escape_ts "$name_noext")" \
                                    "$(escape_ts "${slink}/${name_noext}")" >> "$tmp_sec"
                            done <<< "$sorted"
                        fi
                    fi
                fi

                idx=$((idx + 1))
            done

            # 子条目 depth 整体 +1，写入 raw
            while IFS='|' read -r stype sdepth stext slink; do
                printf '%s|%d|%s|%s\n' "$stype" $((sdepth + 1)) "$stext" "$slink"
            done < "$tmp_sec" >> "$tmp_raw"

        else
            # ── 无 index.md：纯文件系统扫描，不生成任何文件 ──
            local fs_dir="${path#/}"  # e.g., kb/learning
            scan_dir_recursive "$fs_dir" "$path" 0 > "$tmp_sec"

            # 子条目 depth 整体 +1，写入 raw
            while IFS='|' read -r stype sdepth stext slink; do
                printf '%s|%d|%s|%s\n' "$stype" $((sdepth + 1)) "$stext" "$slink"
            done < "$tmp_sec" >> "$tmp_raw"
        fi

        rm -f "$tmp_sec" /tmp/vitepress_sec2_$$_*.txt 2>/dev/null || true
    done

    # 4. 添加"未分类"section —— kb/ 下零散的 .md 文件（不在任何子文件夹里）
    local -a uncategorized=()
    for f in "$KB_DIR_REL"/*.md; do
        [[ -f "$f" ]] || continue
        local bn
        bn=$(basename "$f")
        [[ "$bn" == "index.md" ]] && continue
        uncategorized+=("$bn")
    done

    if [[ ${#uncategorized[@]} -gt 0 ]]; then
        echo "📂 发现 ${#uncategorized[@]} 个 kb 根目录零散 .md 文件 → 归入「未分类」"
        printf 'G|0|%s|\n' '未分类' >> "$tmp_raw"
        local sorted_uncat
        sorted_uncat=$(printf '%s\n' "${uncategorized[@]}" | sort)
        while IFS= read -r bn; do
            local name_noext="${bn%.md}"
            printf 'L|1|%s|%s\n' \
                "$(escape_ts "$name_noext")" \
                "$(escape_ts "${KB_URL_PREFIX}/${name_noext}")" >> "$tmp_raw"
        done <<< "$sorted_uncat"
    fi

    # 5. 过滤空分组
    awk -F'|' "$FILTER_AWK" "$tmp_raw" > "$tmp_filtered"

    # 6. 生成 TypeScript sidebar
    local sidebar_ts
    sidebar_ts="export default ["$'\n'"$(awk -F'|' "$RENDER_AWK" "$tmp_filtered")"$'\n'"]"$'\n'

    # 7. 写入独立的 sidebar.mts（不改 config.mts，避免 VitePress 重启崩溃）
    local sidebar_path=".vitepress/sidebar.mts"
    printf '%s\n' "$sidebar_ts" > "$sidebar_path"

    rm -f "$tmp_raw" "$tmp_filtered"

    local total
    total=$(grep -c "link:" <<< "$sidebar_ts" || true)
    echo ""
    echo "✅ 已更新 $sidebar_path"
    echo "   共生成 $total 个链接条目"
}

main
echo "==> 完成"
