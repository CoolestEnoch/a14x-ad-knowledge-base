#!/bin/bash

token="wEBXOAr4uWYdSZnbD3UlbgArDWjGCq_DXtY5hsPm4MnDWdC5d9_HdLEU5irJCOx2s0dkbX39oVLuWQSLc7EiUQ=="

download_sites_v2() {
    # 使用关联数组（Bash 4.0+）
    declare -A sites=(
        ["自动驾驶入门"]="https://3dcv.yuque.com/org-wiki-3dcv-mm1l0t/ysgfp9"
        ["现有工作"]="https://3dcv.yuque.com/org-wiki-3dcv-mm1l0t/fi3p5p"
        ["项目资源"]="https://3dcv.yuque.com/org-wiki-3dcv-mm1l0t/lvap8y"
        ["文章调研"]="https://3dcv.yuque.com/org-wiki-3dcv-mm1l0t/oa9xe9"
        ["二维入门相关"]="https://3dcv.yuque.com/org-wiki-3dcv-mm1l0t/qe88dq"
        ["实用技术"]="https://3dcv.yuque.com/org-wiki-3dcv-mm1l0t/zhy6ev"
        ["3D检测相关Baseline"]="https://3dcv.yuque.com/org-wiki-3dcv-mm1l0t/uc9e11"
        ["学习笔记"]="https://3dcv.yuque.com/org-wiki-3dcv-mm1l0t/wawabo"
    )
    
    for name in "${!sites[@]}"; do
        url="${sites[$name]}"
        mkdir -p "$name"
        pushd "$name" > /dev/null || continue
        echo "下载 $url 到 $name ..."
        yuque-dl -t "$token" "$url"
        popd > /dev/null
    done
}

download_sites_v2
