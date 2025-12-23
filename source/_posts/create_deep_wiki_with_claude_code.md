---
title: 使用 Claude Code 生成 OpenDeepWiki
date: 2025-09-20 06:41:12
description: 使用 Claude Code 配合 CLIProxyAPI 生成 OpenDeepWiki 的完整教程，包括配置步骤和使用心得
categories: [AI工具]
tags: [AI, deepwiki, claudecode]
---

# 使用claudecode生成opendeepwiki

在之前的 [邪修用法：Codex/ClaudeCode转标准API](https://lusipad.com/2025/09/14/CLIProxyAPI/)中尝试了使用 codex 来生成 deep wiki，一切都顺利，就是因为限流导致最终未竟全功，这次换了一个 claude code 的号继续使用。

省流版本：**基本功能（网站生成）可用，有点费 Token，MCP 和一些细节仍需打磨。**



## 1. 配置 CLIProxyAPI

[CLIProxyAPI](https://github.com/router-for-me/CLIProxyAPI)

这里主要将为了将 Claude Code 转成标准的 OpenAI 兼容 API。因为使用了中转站，所以配置了对应的 base_url 和 key。



## 2. 配置 OpenDeepWiki

[OpenDeepWiki](https://github.com/AIDotNet/OpenDeepWiki)

**我用的0.9.0版本，用下来发现还是有不少问题，比如说默认配置无法直接打开站点、诊断就配了个18888的GRPC的，没有18889的Web页面之类的，还有一些页面无法访问，所以整体功能可用，但是很多细节还需要打磨**

```yaml
services:
  koalawiki:
    image: crpi-j9ha7sxwhatgtvj4.cn-shenzhen.personal.cr.aliyuncs.com/koala-ai/koala-wiki
    environment:
      - KOALAWIKI_REPOSITORIES=/repositories
      - TASK_MAX_SIZE_PER_USER=5 # 每个用户 AI 处理文档生成的最大数量
      - REPAIR_MERMAID=1 # 是否进行 Mermaid 修复，1 修复，其余不修复
      - CHAT_MODEL=claude-sonnet-4-20250514 # 必须要支持 function 的模型（我试了用 Haiku，无法访问，只能用sonnet了）
      - ANALYSIS_MODEL=claude-sonnet-4-20250514 # 分析模型，用于生成仓库目录结构，这个很重要，模型越强，生成的目录结构越好，为空则使用 ChatModel
                        # 分析模型建议使用 GPT-4.1  , CHAT 模型可以用其他模型生成文档，以节省 token 开销
      - CHAT_API_KEY=xxx #您的 APIkey
      - LANGUAGE=中文 # 设置生成语言默认为"中文", 英文可以填写 English 或 英文
      - ENDPOINT=http://xx.xxx.com:8317/v1
      - MODEL_PROVIDER=OpenAI # 模型提供商，支持 OpenAI, AzureOpenAI, Anthropic
      - DB_TYPE=sqlite
      - DB_CONNECTION_STRING=Data Source=/data/KoalaWiki.db
      - UPDATE_INTERVAL=5 # 仓库增量更新间隔，单位天
      - EnableSmartFilter=true # 是否启用智能过滤，这可能影响 AI 得到仓库的文件目录
      - ENABLE_INCREMENTAL_UPDATE=true # 是否启用增量更新
      - ENABLE_CODED_DEPENDENCY_ANALYSIS=false # 是否启用代码依赖分析？这可能会对代码的质量产生影响。
      - ENABLE_WAREHOUSE_FUNCTION_PROMPT_TASK=false # 是否启用 MCP Prompt 生成
      - ENABLE_WAREHOUSE_DESCRIPTION_TASK=false # 是否启用仓库 Description 生成
      - MAX_FILE_LIMIT=100 # 最大上传文件限制，单位 MB
      - DEEP_RESEARCH_MODEL= # 深度研究模型，为空则使用 CHAT_MODEL
      - ENABLE_WAREHOUSE_COMMIT=true # 是否启用仓库提交
      - ENABLE_FILE_COMMIT=true # 是否启用文件提交
      - REFINE_AND_ENHANCE_QUALITY=false # 是否启用质量优化
      - CATALOGUE_FORMAT=compact # 目录结构格式 (compact, json, pathlist, unix)
      - ENABLE_CODE_COMPRESSION=false # 是否启用代码压缩
      - READ_MAX_TOKENS=100000 # AI 读取文件的最大 token 限制
      - OTEL_SERVICE_NAME=koalawiki
      - OTEL_EXPORTER_OTLP_PROTOCOL=grpc
      - OTEL_EXPORTER_OTLP_ENDPOINT=http://aspire-dashboard:18889
    volumes:
      - ./repositories:/app/repositories
      - ./data:/data
    build:
      context: .
      dockerfile: src/KoalaWiki/Dockerfile
  
  aspire-dashboard:
    image: mcr.microsoft.com/dotnet/aspire-dashboard
    container_name: aspire-dashboard
    restart: always
    ports:
      - "18888:18888"
      - "18889:18889"
    environment:
      - TZ=Asia/Shanghai
      - Dashboard:ApplicationName=Aspire

  koalawiki-web:
    image: crpi-j9ha7sxwhatgtvj4.cn-shenzhen.personal.cr.aliyuncs.com/koala-ai/koala-wiki-web
    command: ["/app/start.sh"]
    environment:
      - NEXT_PUBLIC_API_URL=http://koalawiki:8080 # 用于提供给 server 的地址

  nginx: # 需要 nginx 将前端和后端代理到一个端口
    image: nginx:alpine
    ports:
      - "8090:80"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/conf.d/default.conf
    depends_on:
      - koalawiki
      - koalawiki-web
```



windows 下就直接 docker 启动！

默认账号：admin / admin

访问：http://localhost:8090

![image-20250920073747822](http://raw.gitmirror.com/lusipad/imgur/main/img/image-20250920073747822.png)

**后台查看进度**

![image-20250920073839619](http://raw.gitmirror.com/lusipad/imgur/main/img/image-20250920073933105.png)

**生成站点消耗**

![image-20250920074321482](http://raw.gitmirror.com/lusipad/imgur/main/img/image-20250920074321482.png)

以 lusipad/plcopen 为例，大概消耗了

```
次数：225 次
Token: 11.43M
代币价：$37.76
```

主要是因为我都全程用 sonnet，换成其他的可能会节省一些（不过按照这个价格，Pro 账号也不经用）



## 3. 使用 OpenDeepWiki

1. 网站直接使用

   直接网页上访问

2. MCP

   ![image-20250920075003090](http://raw.gitmirror.com/lusipad/imgur/main/img/image-20250920075003090.png)

点击页面的 MCP，可以看到已经生成了配置

我们使用 Chatbox 来测试下

![image-20250920075126736](http://raw.gitmirror.com/lusipad/imgur/main/img/image-20250920075126736.png)

![image-20250920075217076](http://raw.gitmirror.com/lusipad/imgur/main/img/image-20250920075217076.png)



开启了 MCP，尝试提问下

![image-20250920075308823](http://raw.gitmirror.com/lusipad/imgur/main/img/image-20250920075308823.png)

正在调用 MCP

![image-20250920075425956](http://raw.gitmirror.com/lusipad/imgur/main/img/image-20250920075425956.png)

![image-20250920075600567](http://raw.gitmirror.com/lusipad/imgur/main/img/image-20250920075600567.png)

整个过程大概要 20~30 秒左右，还是比较慢的

![image-20250920080041258](http://raw.gitmirror.com/lusipad/imgur/main/img/image-20250920080041258.png)

**这里可能有个比较大的问题，他会提示说读取不到文件，所以无法基于文件进行分析。。几个MCP都调用失败了**





---

干脆让 AI 生成了一份详细的使用说明

---

# OpenDeepWiki 使用说明

## 🚀 项目简介

OpenDeepWiki 是一个基于 AI 的智能代码知识库系统，能够自动分析代码仓库并生成高质量的技术文档。系统使用 Claude Sonnet 4 等先进的 AI 模型，为开发者提供深度的代码理解和文档生成服务。

## 🏗️ 系统架构

### 服务组件
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   前端服务      │    │   后端服务      │    │   监控面板      │
│ (koalawiki-web) │    │ (koalawiki)     │    │(aspire-dashboard)│
│   Port: 3000    │    │   Port: 8080    │    │ Port: 18888-89  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                ┌─────────────────┴─────────────────┐
                │          Nginx 代理服务           │
                │           Port: 8090             │
                └───────────────────────────────────┘
```

### 核心功能
- 🧠 **AI 文档生成**: 使用 Claude Sonnet 4 深度分析代码结构和逻辑
- 📊 **仓库管理**: 支持 Git 仓库的自动同步和增量更新
- 🌐 **Web 界面**: 现代化的前端界面，支持文档浏览和管理
- 📈 **实时监控**: Aspire Dashboard 提供系统运行状态监控
- 🔄 **增量更新**: 智能检测代码变更，只处理修改的部分

## ⚙️ 配置参数详解

### 核心配置 (docker-compose.yml)

#### AI 模型配置
```yaml
# AI 模型设置
CHAT_MODEL: claude-sonnet-4-20250514          # 主要聊天模型
ANALYSIS_MODEL: claude-sonnet-4-20250514      # 分析模型（用于目录结构生成）
CHAT_API_KEY: xxx                            # API 密钥
ENDPOINT: http://xx.xxx.com:8317/v1        # API 端点
MODEL_PROVIDER: OpenAI                         # 模型提供商
```

#### 任务控制配置
```yaml
TASK_MAX_SIZE_PER_USER: 5                      # 每用户最大并发任务数
LANGUAGE: 中文                                 # 生成文档的语言
UPDATE_INTERVAL: 5                             # 仓库更新间隔（天）
MAX_FILE_LIMIT: 100                            # 最大文件上传限制（MB）
READ_MAX_TOKENS: 100000                        # AI 读取文件的最大 token 限制
```

#### 功能开关配置
```yaml
REPAIR_MERMAID: 1                              # Mermaid 图表修复（1=启用）
EnableSmartFilter: true                        # 智能过滤
ENABLE_INCREMENTAL_UPDATE: true                # 增量更新
ENABLE_CODED_DEPENDENCY_ANALYSIS: false       # 代码依赖分析
ENABLE_WAREHOUSE_FUNCTION_PROMPT_TASK: false  # MCP Prompt 生成
ENABLE_WAREHOUSE_DESCRIPTION_TASK: false      # 仓库描述生成
ENABLE_WAREHOUSE_COMMIT: true                  # 仓库提交功能
ENABLE_FILE_COMMIT: true                       # 文件提交功能
REFINE_AND_ENHANCE_QUALITY: false              # 质量优化
ENABLE_CODE_COMPRESSION: false                 # 代码压缩
```

#### 高级配置
```yaml
CATALOGUE_FORMAT: compact                      # 目录结构格式 (compact/json/pathlist/unix)
DB_TYPE: sqlite                                # 数据库类型
DB_CONNECTION_STRING: Data Source=/data/KoalaWiki.db  # 数据库连接字符串
```

## 🚀 快速启动

### 1. 环境准备
```bash
# 确保已安装 Docker 和 Docker Compose
docker --version
docker compose --version

# 克隆项目到本地
git clone <repository-url>
cd OpenDeepWiki
```

### 2. 配置设置
编辑 `docker-compose.yml` 文件，配置您的 AI API 设置：
```yaml
CHAT_API_KEY: 您的API密钥
ENDPOINT: 您的API端点
```

### 3. 启动服务
```bash
# 启动所有服务
docker compose up -d

# 查看服务状态
docker compose ps

# 查看服务日志
docker compose logs -f koalawiki
```

### 4. 服务重启
```bash
# 停止服务
docker compose down

# 启动服务（包含配置更新）
docker compose up -d

# 清理孤立容器（如有需要）
docker compose down --remove-orphans
```

## 🌐 访问方式

### 主要服务端点
| 服务 | 地址 | 功能 |
|------|------|------|
| **Web 界面** | http://localhost:8090 | 主要使用入口，文档浏览和管理 |
| **监控面板** | http://localhost:18888 | 系统运行状态监控 |
| **后端 API** | http://localhost:8080 | 直接 API 访问（通常通过前端） |

### 主要功能页面
- 📚 **仓库列表**: 查看和管理已添加的代码仓库
- 📄 **文档浏览**: 查看 AI 生成的技术文档
- ⚙️ **设置页面**: 配置系统参数和 AI 模型
- 📊 **统计信息**: 查看文档生成统计和系统使用情况

## 📖 使用流程

### 1. 添加代码仓库
1. 访问 Web 界面: http://localhost:8090
2. 点击"添加仓库"按钮
3. 输入 Git 仓库 URL 或上传本地代码
4. 配置仓库分析参数

### 2. AI 文档生成
1. 系统自动分析代码结构
2. AI 模型深度理解代码逻辑
3. 生成多种类型的技术文档：
   - 项目概览
   - 架构分析
   - API 文档
   - 使用指南
   - 核心概念说明

### 3. 文档管理
1. 浏览生成的文档内容
2. 搜索特定技术信息
3. 导出文档为不同格式
4. 跟踪文档更新历史

## 🔧 运维管理

### 日志监控
```bash
# 查看实时日志
docker compose logs -f koalawiki

# 查看特定数量的日志
docker compose logs --tail=50 koalawiki

# 查看所有服务日志
docker compose logs -f
```

### 数据备份
```bash
# 备份数据目录
cp -r ./data ./data_backup_$(date +%Y%m%d)

# 备份仓库数据
cp -r ./repositories ./repositories_backup_$(date +%Y%m%d)
```

### 性能优化
1. **增加并发任务数**: 调整 `TASK_MAX_SIZE_PER_USER` 参数
2. **优化 Token 使用**: 调整 `READ_MAX_TOKENS` 限制
3. **启用智能过滤**: 确保 `EnableSmartFilter=true`
4. **配置增量更新**: 设置合适的 `UPDATE_INTERVAL`

## 🐛 故障排除

### 常见问题

#### 1. 服务启动失败
```bash
# 检查端口占用
netstat -tulpn | grep :8090
netstat -tulpn | grep :8080

# 重启 Docker 服务
sudo systemctl restart docker

# 清理 Docker 资源
docker system prune -f
```

#### 2. AI 生成失败
- 检查 API 密钥是否正确
- 验证网络连接到 AI 端点
- 查看日志中的具体错误信息
- 确认模型名称是否正确

#### 3. 前端无法访问
```bash
# 检查 nginx 配置
docker compose logs nginx

# 验证前端服务状态
docker compose logs koalawiki-web

# 重启前端服务
docker compose restart koalawiki-web nginx
```

#### 4. 数据库连接问题
```bash
# 检查数据目录权限
ls -la ./data/

# 重新创建数据库
rm -f ./data/KoalaWiki.db
docker compose restart koalawiki
```

### 性能调优建议

#### 1. 系统资源优化
- **内存**: 推荐至少 4GB RAM
- **存储**: 确保足够的磁盘空间用于代码仓库和生成的文档
- **网络**: 稳定的网络连接到 AI API 端点

#### 2. AI 参数调优
```yaml
# 高性能配置
TASK_MAX_SIZE_PER_USER: 10      # 增加并发任务
READ_MAX_TOKENS: 150000         # 增加 token 限制
ENABLE_CODE_COMPRESSION: true   # 启用代码压缩
```

#### 3. 数据库优化
- 定期备份数据库文件
- 监控数据库大小增长
- 考虑使用外部数据库（如 PostgreSQL）

## 📊 监控指标

### 系统监控 (Aspire Dashboard)
- 📈 **请求响应时间**: 监控 API 响应性能
- 🔄 **任务处理状态**: 跟踪 AI 文档生成进度
- 💾 **资源使用情况**: 监控内存和 CPU 使用
- 🌐 **网络连接状态**: 监控到 AI 端点的连接

### 应用指标
- 📚 **仓库数量**: 已管理的代码仓库总数
- 📄 **文档生成数**: 成功生成的文档数量
- ⏱️ **平均处理时间**: 文档生成的平均耗时
- 🎯 **成功率**: 文档生成的成功比例

## 🔐 安全建议

### 1. API 密钥安全
- 不要在公开代码中硬编码 API 密钥
- 定期更换 API 密钥
- 使用环境变量管理敏感信息

### 2. 网络安全
- 在生产环境中配置防火墙规则
- 使用 HTTPS 协议（配置 SSL 证书）
- 限制外部访问的端口

### 3. 数据安全
- 定期备份重要数据
- 加密敏感数据存储
- 实施访问控制策略

## 📚 扩展功能

### 1. 自定义 AI 模型
系统支持多种 AI 模型，可以根据需要配置：
- OpenAI GPT 系列
- Anthropic Claude 系列
- 自定义兼容端点

### 2. 插件扩展
- 支持自定义文档模板
- 可扩展的文件类型支持
- 自定义分析规则

### 3. 集成方案
- CI/CD 流水线集成
- 版本控制系统集成
- 项目管理工具集成

## 🆘 技术支持

### 获取帮助
1. 查看系统日志获取详细错误信息
2. 检查 GitHub Issues 页面
3. 参考项目文档和 README
4. 联系技术支持团队

### 贡献项目
- 提交 Bug 报告
- 建议新功能
- 贡献代码改进
- 完善文档内容

---

## 📝 更新日志

### 版本信息
- **当前版本**: 0.9.0
- **最后更新**: 2025-09-20
- **维护状态**: 活跃开发中

### 主要特性
- ✅ 支持 Claude Sonnet 4 模型
- ✅ 完整的 Web 界面
- ✅ 实时监控面板
- ✅ 增量更新机制
- ✅ 多语言文档生成
- ✅ Docker 容器化部署

---

*这份文档会随着系统功能的更新而持续维护和完善。*
