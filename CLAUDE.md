# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

Hexo 静态博客项目（lusipad.com），使用 Fluid 主题，双部署到 GitHub Pages 和自建 Nginx 服务器。

## 技术栈

- **框架**: Hexo 6.3.0
- **主题**: Fluid 1.9.8
- **部署**: hexo-deployer-git (GitHub Pages) + rsync (自建服务器)

## 常用命令

```bash
# 本地开发
npm run server          # 启动本地服务器 localhost:4000

# 构建
npm run build           # 生成静态文件到 public/
npm run clean           # 清理 public/ 和 db.json

# 部署
npm run deploy          # 部署到 GitHub Pages
./publish.sh            # 一键发布（生成TOC→构建→部署→git提交推送）
./toc.sh                # 生成文章目录并执行 publish.sh

# 创建新文章
hexo new post "标题"    # 在 source/_posts/ 创建新文章
```

## 项目结构

```
source/_posts/          # 文章源文件（Markdown）
source/_posts/*.assets/ # 文章配套资源
public/                 # 构建输出（静态HTML）
_config.yml             # Hexo 主配置
_config.fluid.yml       # Fluid 主题配置
scaffolds/              # 内容模板（post/page/draft）
```

## 架构说明

### 部署流程

```
source/*.md → hexo generate → public/ → 双部署
                                        ├→ GitHub Pages (gh-pages分支)
                                        └→ lusipad.com (rsync到Nginx)
```

### 文章 Front Matter

```yaml
---
title: 文章标题
date: YYYY-MM-DD HH:mm:ss
tags: [标签1, 标签2]
---
```

## 配置要点

- **站点语言**: zh-CN
- **代码高亮**: highlightjs（启用行号）
- **搜索**: local-search.xml（客户端全文搜索）
- **GitHub仓库**: lusipad/lusipad.github.io
