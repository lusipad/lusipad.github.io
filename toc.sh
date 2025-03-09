#!/bin/bash

SOURCE_DIR="source/_posts"
OUTPUT_FILE="README.md"
TMP_FILE=$(mktemp)

# 递归处理所有 Markdown 文件
find "$SOURCE_DIR" -type f -name '*.md' | while read -r fullpath; do
    # 提取 Front Matter 内容
    front_matter=$(awk '/^---/{flag=1; next} /^---/{flag=0} flag' "$fullpath")
    
    # 提取元数据
    title=$(echo "$front_matter" | grep -E '^title:' | cut -d ':' -f 2- | sed -e 's/^[[:space:]]*//' -e 's/"//g')
    raw_date=$(echo "$front_matter" | grep -E '^date:' | cut -d ':' -f 2- | sed -e 's/^[[:space:]]*//' -e 's/ .*//')

    # 验证日期格式
    if ! date -d "$raw_date" "+%Y-%m-%d" >/dev/null 2>&1; then
        echo "[跳过] 无效日期格式: $fullpath ($raw_date)"
        continue
    fi

    # 格式化日期
    ymd=$(date -d "$raw_date" "+%Y-%m-%d")
    year_month=$(date -d "$raw_date" "+%Y-%m")

    # 修正相对路径（假设脚本在项目根目录运行）
    rel_path="${fullpath#./}"

    # 写入临时文件
    printf "%s\t%s\t%s\t%s\n" "$year_month" "$ymd" "$title" "$rel_path" >> "$TMP_FILE"
done

# 生成 README 内容
echo "# 文章归档" > "$OUTPUT_FILE"
echo -e "\n按月份分类的文档列表：" >> "$OUTPUT_FILE"

# 处理排序和分组
sort -r "$TMP_FILE" | awk -F '\t' '
BEGIN { prev_month = "" }
{
    if ($1 != prev_month) {
        prev_month = $1
        split($1, arr, "-")
        printf "\n## %s年%s月\n", arr[1], arr[2]
    }
    printf "- [%s](%s) - %s\n", $3, $4, $2
}' >> "$OUTPUT_FILE"

rm "$TMP_FILE"
echo "已生成 $OUTPUT_FILE"

hexo g
hexo d
git add .
git commit -m "doc: update"
git push