# 参考文献bib去掉去重代码

```python
import re

def load_bib_entries(file_path):
    """
    读取整个 bib 文件，按条目分割
    """
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    # 匹配每个条目（从 @xxx{ 到对应的 }）
    entries = re.findall(r'(@[^{]+\{[^@]*?\})', content, re.DOTALL)
    return entries

def extract_title(entry):
    """
    从单个 bib 条目中提取 title 字段
    """
    match = re.search(r'title\s*=\s*\{([^}]*)\}', entry, re.IGNORECASE)
    return match.group(1).strip() if match else None

def find_duplicate_titles(entries):
    """
    查找重复 title（忽略大小写）
    """
    seen = {}
    duplicates = []
    for entry in entries:
        title = extract_title(entry)
        if title:
            key = title.lower()
            if key in seen:
                duplicates.append(title)
            else:
                seen[key] = 1
    return duplicates

def save_duplicates(duplicates, output_path):
    """
    保存重复 title 到文件
    """
    with open(output_path, 'w', encoding='utf-8') as f:
        for title in duplicates:
            f.write(title + "\n")

if __name__ == "__main__":
    input_file = "THESISreference.bib"             # 替换为你的 bib 文件路径
    output_file = "duplicate_titles.txt"     # 输出的重复标题文件

    entries = load_bib_entries(input_file)
    duplicates = find_duplicate_titles(entries)

    if duplicates:
        print(f"发现 {len(duplicates)} 个重复标题，已保存到 {output_file}")
        save_duplicates(duplicates, output_file)
    else:
        print("没有重复的 title。")
```



> 更新: 2025-10-14 23:26:33  
> 原文: <https://3dcv.yuque.com/org-wiki-3dcv-mm1l0t/ysgfp9/iqdescx1wu56d80w>