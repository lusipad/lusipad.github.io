---
title: CLIProxyAPI 完整教程：一个代理统一所有 AI 编程工具
date: 2026-03-08 07:09:02
tags: [CLIProxyAPI, Claude Code, Gemini, Codex, AI, 教程]
---

你有 Claude 订阅，有 Gemini，有 Codex，可能还有 Qwen 的免费账户。

但它们各自为战。Claude Code 只能用 Claude，Gemini CLI 只能用 Gemini。想在 Claude Code 里调 Gemini？不行。想多个账户轮流用？手动切。一个号[配额满了](/2025/09/30/claude-weeklylimit-to-day/)？自己换。而且[配额只会越收越紧](/2025/10/07/Claude-Code-restrictions-in-2025/)。

CLIProxyAPI 解决的就是这个问题：**一个代理地址，接管所有 AI 账户，自动轮询、自动切换、自动转换格式。**

程序只有 10MB，内存占用不到 10MB。改配置不用重启。开源免费。

本文基于 CLIProxyAPI v6 源码撰写。[GitHub](https://github.com/router-for-me/CLIProxyAPI) | [官方文档](https://help.router-for.me/cn/)

下面按四类场景展开——先白嫖跑通，再加钱混搭，然后丢服务器，最后接中转。找到你的场景直接跳过去就行。

---

## 白嫖党：Qwen 免费跑通

先花 5 分钟跑通一个完全免费的场景。选 Qwen 是因为它**不需要任何付费订阅**，注册通义千问就能用。

去 [GitHub Releases](https://github.com/router-for-me/CLIProxyAPI/releases) 下载你系统对应的包——macOS Apple Silicon 选 `darwin_arm64`，Intel 选 `darwin_amd64`，Linux 选 `linux_amd64`。解压到一个干净目录，比如 `~/CLIProxyAPI/`。

> **Windows 用户**：下载 `windows_amd64.zip`，解压到比如 `D:\CLIProxyAPI\`。下文命令统一写 macOS/Linux 版本，Windows 差异会在引用块里说明。
>
> macOS 也可以 `brew install cliproxyapi`，Arch Linux 可以 `yay -S cli-proxy-api-bin`。

解压后目录里有一个可执行文件和一个 `config.example.yaml`。把 `config.example.yaml` 复制一份改名 `config.yaml`，清空内容，换成这几行：

```yaml
port: 8317
auth-dir: "~/.cli-proxy-api"
request-retry: 3

quota-exceeded:
  switch-project: true
  switch-preview-model: true

api-keys:
  - "ABC-123456"
```

这里的 `api-keys` 是你**自己随便设的密码**，客户端连代理时要带——跟 OpenAI 的 API Key 没有任何关系。`auth-dir` 是 OAuth 登录后认证文件的存放位置，`~` 代表用户主目录。

> **Windows 用户**：`~` 在 Windows 下指向 `C:\Users\你的用户名`，更保险的写法是改成绝对路径 `auth-dir: "D:\\CLIProxyAPI\\auths"`。

现在登录 Qwen。打开终端，cd 到 CLIProxyAPI 所在目录（程序需要读取同目录下的 `config.yaml`），执行登录命令：

```bash
cd ~/CLIProxyAPI
./CLIProxyAPI -qwen-login
```

> **Windows**：`cd D:\CLIProxyAPI` 然后 `.\CLIProxyAPI.exe -qwen-login`（PowerShell）或 `CLIProxyAPI.exe -qwen-login`（CMD）。

浏览器自动弹出 Qwen 登录页，登录通义千问账号，授权完成。终端会让你给这个账户起个名字（随便填，比如 `qwen-main`），回车，认证文件就存好了。想加多个账户？再执行一遍同样的命令，系统会自动轮询所有账户。

启动代理：

```bash
./CLIProxyAPI
```

看到 `API server started successfully on: :8317` 就成了。开一个新终端验证：

```bash
curl http://127.0.0.1:8317/v1/models -H "Authorization: Bearer ABC-123456"
```

> **Windows PowerShell**：必须写 `curl.exe`，写 `curl` 会调到 `Invoke-WebRequest`，参数完全不同。Windows 10 以上自带 `curl.exe`。

返回里能看到 `qwen3-coder-plus`、`qwen3-coder-flash` 等模型名，说明一切正常。

最后把客户端接上来。拿 Claude Code 举例：

```bash
export ANTHROPIC_BASE_URL=http://127.0.0.1:8317
export ANTHROPIC_AUTH_TOKEN=ABC-123456
export ANTHROPIC_DEFAULT_SONNET_MODEL=qwen3-coder-plus
claude
```

> **Windows PowerShell**：
> ```powershell
> $env:ANTHROPIC_BASE_URL = "http://127.0.0.1:8317"
> $env:ANTHROPIC_AUTH_TOKEN = "ABC-123456"
> $env:ANTHROPIC_DEFAULT_SONNET_MODEL = "qwen3-coder-plus"
> claude
> ```

其他客户端套路一样——**任何支持自定义 OpenAI Base URL 的工具**都能接：

- **Cherry Studio**：添加提供商 → 类型选 `OpenAI-Response` → API 密钥填 `ABC-123456` → API 地址填 `http://127.0.0.1:8317` → 管理模型 → 加载远程列表
- **Cline / Roo Code**：Provider 选 `OpenAI Compatible` → Base URL 填 `http://127.0.0.1:8317/v1` → API Key 填 `ABC-123456`
- **Cursor**：OpenAI API Base URL 填 `http://127.0.0.1:8317/v1`

到这里你已经在免费用了。如果你想看一个更完整的实战案例——比如在 VSCode Continue 里同时调 Codex 和 Claude，可以看[这篇](/2025/09/14/CLIProxyAPI/)。接下来看看怎么加更多提供商。

---

## 氪金党：多号混搭

一个 Qwen 免费号当然不够。真正强大的用法是把所有订阅塞进同一个代理，让 Claude Code 同时调三四家模型。

### 所有提供商一张总表

| 提供商 | 登录命令 | 前置条件 | 可用模型示例 |
|--------|---------|---------|-------------|
| Qwen | `-qwen-login` | 免费注册 | qwen3-coder-plus, qwen3-coder-flash |
| Gemini | `-login -project_id "项目ID"` | 需创建 GCP 项目 | gemini-2.5-pro, gemini-2.5-flash |
| Claude | `-claude-login` | Claude 订阅 | claude-opus-4-6, claude-sonnet-4-6 |
| Codex | `-codex-login` | ChatGPT Plus/Pro/Team | gpt-5, gpt-5-codex, gpt-5-codex-mini |
| iFlow（智谱 GLM） | `-iflow-login` 或 `-iflow-cookie` | 注册 | GLM 系列 |
| Kimi（月之暗面） | `-kimi-login` | 注册 | Kimi 系列 |
| Antigravity | `-antigravity-login` | 注册 | — |
| Vertex AI | `-vertex-import key.json` | GCP 服务账号 | Gemini 系列 |

除了 Gemini，其他提供商都是一条命令的事——执行登录命令，浏览器弹出授权页，登录完成。所有登录命令都支持 `-no-browser`（不自动打开浏览器，手动复制链接）和 `-oauth-callback-port 9999`（自定义回调端口）。

### Gemini 需要多走一步

Gemini 要先创建一个 Google Cloud 项目：

1. 打开 [Google Cloud Console](https://console.cloud.google.com/)，创建新项目（名称随意）
2. 在项目里搜索并启用 `cloudaicompanion.googleapis.com`
3. 记下项目 ID

然后执行：

```bash
./CLIProxyAPI -login -project_id "你的项目ID"
```

浏览器弹出 Google 登录页，登进去授权。`project_id` 不是必须的，但指定了能获得更好的配额管理。多账户就重复执行——每个 Google 账户可以创建自己的项目。

### 混搭示例

登录完多个提供商，所有模型会出现在同一个列表里。在 Claude Code 里可以这样混搭：

```bash
# 重活用 Claude，日常用 Gemini，轻量任务用 Codex
export ANTHROPIC_DEFAULT_OPUS_MODEL=claude-opus-4-6
export ANTHROPIC_DEFAULT_SONNET_MODEL=gemini-2.5-pro
export ANTHROPIC_DEFAULT_HAIKU_MODEL=gpt-5-codex-mini
```

客户端请求哪个模型，CLIProxyAPI 就自动路由到对应的提供商。格式转换、认证方式这些全自动。

### 路由策略和配额切换

多个账户才需要关心这些。如果你只有一个号，跳过这节。

```yaml
routing:
  strategy: "round-robin"   # 每次请求换一个账户
  # strategy: "fill-first"  # 优先用第一个账户直到满
```

`round-robin` 把请求均匀分配到所有账户，适合多号薅配额。`fill-first` 优先压一个号，适合"主力号 + 备用号"的组合。

配额相关的三个参数搭配使用：

```yaml
request-retry: 3              # 失败重试次数（403/408/5xx 自动重试）
max-retry-credentials: 2      # 最多尝试几个不同的账户
max-retry-interval: 30        # 冷却等待上限（秒）

quota-exceeded:
  switch-project: true         # 配额满了自动换账户
  switch-preview-model: true   # 配额满了自动换预览版模型
```

一个号配额满了，自动切下一个。所有号都满了，尝试切到预览版模型。这组配置是最小配置里就有的，一般不需要改。

---

## 服务器党：Docker + 远程

本地跑通了，下一步是丢到服务器上，多台设备共用一个代理。

### Docker 部署

建好目录和配置文件：

```bash
mkdir cliproxyapi && cd cliproxyapi
mkdir -p auths logs
```

`config.yaml` 跟前面一样，不需要改——Docker 容器里 `~` 就是 `/root`，volume 映射会把 `/root/.cli-proxy-api` 挂到宿主机的 `./auths`。

`docker-compose.yml`：

```yaml
services:
  cli-proxy-api:
    image: eceasy/cli-proxy-api:latest
    pull_policy: always
    container_name: cli-proxy-api
    ports:
      - "8317:8317"     # 主 API 端口
      - "8085:8085"     # Gemini OAuth 回调
      - "1455:1455"     # Codex OAuth 回调
      - "54545:54545"   # Claude OAuth 回调
      - "51121:51121"   # Antigravity OAuth 回调
      - "11451:11451"   # iFlow OAuth 回调
    volumes:
      - ./config.yaml:/CLIProxyAPI/config.yaml
      - ./auths:/root/.cli-proxy-api
      - ./logs:/CLIProxyAPI/logs
    restart: unless-stopped
```

```bash
docker compose up -d
```

### OAuth 登录：SSH 隧道

容器里没浏览器，OAuth 回调地址又限制了 localhost——用 SSH 隧道解决。原理很简单：在你本地电脑和服务器之间建一条隧道，把 OAuth 回调从本地转发到服务器。

以 Gemini 为例：先在服务器上执行登录命令（`-no-browser` 表示不打开浏览器，会输出一个链接），先别急着开链接；在本地电脑上建 SSH 隧道（Gemini 回调端口是 8085），然后在本地浏览器打开那个链接完成登录。

```bash
# 服务器上
docker compose exec cli-proxy-api /CLIProxyAPI/CLIProxyAPI -no-browser -login

# 本地电脑上（新终端）
ssh -L 8085:localhost:8085 user@你的服务器IP

# 然后在本地浏览器打开服务器输出的链接
```

各提供商的回调端口：

| 提供商 | 登录命令 | SSH 隧道端口 |
|--------|---------|-------------|
| Gemini | `-login` | 8085 |
| Codex | `-codex-login` | 1455 |
| Claude | `-claude-login` | 54545 |
| Antigravity | `-antigravity-login` | 51121 |
| iFlow | `-iflow-login` | 11451 |
| Qwen | `-qwen-login` | **不需要** |
| Kimi | `-kimi-login` | **不需要** |

Qwen 和 Kimi 用的是设备代码流（Device Code Flow），不依赖本地回调端口——直接在容器里执行登录命令，然后在任意设备的浏览器打开输出的链接就行。

登录完成后，客户端 Base URL 指向 `http://你的服务器IP:8317`，其他配置不变。

### 管理面板

从 v6.0.19 起，Web UI 内置在主程序里。配置里加上：

```yaml
remote-management:
  secret-key: "你的管理密码"
  allow-remote: false        # 要远程访问就改 true
  disable-control-panel: false
```

> 这是少数改了需要**重启**的配置项。

浏览器打开 `http://127.0.0.1:8317/management.html`，输密码，可以看使用统计、管理认证文件、查看日志。面板里的 OAuth 登录功能只能在本机用，远程服务器还是得走 SSH 隧道。

想要更丰富的管理？还有这些选择：
- **[EasyCLI](https://github.com/router-for-me/EasyCLI)** — 官方 Tauri 桌面客户端
- **TUI** — `./CLIProxyAPI -tui -standalone` 启动终端管理界面
- **[CLIProxyAPI Dashboard](https://github.com/itsmylife44/cliproxyapi-dashboard)** — Next.js Web 仪表盘

### 远程存储

默认认证文件存本地磁盘。多台服务器想共享认证，在 `.env` 里配远程存储——支持 PostgreSQL、Git 仓库、S3 三种方案：

```bash
# PostgreSQL
PGSTORE_DSN=postgresql://user:pass@localhost:5432/cliproxy

# Git 仓库
GITSTORE_GIT_URL=https://github.com/your-org/config.git
GITSTORE_GIT_USERNAME=user
GITSTORE_GIT_TOKEN=ghp_xxx

# S3 对象存储
OBJECTSTORE_ENDPOINT=https://s3.example.com
OBJECTSTORE_BUCKET=cliproxy
OBJECTSTORE_ACCESS_KEY=xxx
OBJECTSTORE_SECRET_KEY=xxx
```

大多数人用不到这个——除非你有多台服务器需要共享同一批账户。

---

## 中转党：API Key 接入

除了 OAuth 登录"借用"订阅，你也可以直接用 API Key 接入——官方 API 或中转服务商都行。

### Claude API

```yaml
claude-api-key:
  # 官方 API，不需要 base-url
  - api-key: "sk-ant-...你的密钥"

  # 中转商，需要指定 base-url
  - api-key: "sk-xxx..."
    base-url: "https://中转商地址/api"
```

Claude 的 API 会检查请求来源，从 Cline 等非官方客户端调用可能被拒。如果遇到这个问题，开 Cloak 伪装：

```yaml
claude-api-key:
  - api-key: "sk-ant-..."
    cloak:
      mode: "auto"    # 非 Claude Code 客户���自动伪装请求头
```

只有用 Claude API 且从非官方客户端调用时才需要 Cloak，其他场景不用管。

### Gemini API（AIStudio）

```yaml
gemini-api-key:
  - api-key: "AIzaSy..."
    models:
      - name: "gemini-2.5-flash"
        alias: "flash"   # 短别名，可选
```

### Codex API

```yaml
codex-api-key:
  - api-key: "sk-atSM..."
```

### OpenAI 兼容服务

像 OpenRouter 这类中转商，用 `openai-compatibility`：

```yaml
openai-compatibility:
  - name: "openrouter"
    base-url: "https://openrouter.ai/api/v1"
    api-key-entries:
      - api-key: "sk-or-v1-...密钥1"
      - api-key: "sk-or-v1-...密钥2"   # 多密钥自动轮询
    models:
      - name: "moonshotai/kimi-k2:free"
        alias: "kimi-k2"
```

> 区别：Claude/Codex 每个密钥单独声明 `base-url`（不同密钥可能来自不同中转商）；OpenAI 兼容模式下多密钥共享一个 `base-url`。

### 前缀路由

多个同类型密钥，想指定走哪个？给密钥加前缀：

```yaml
gemini-api-key:
  - api-key: "AIzaSy...01"
    prefix: "free"
  - api-key: "AIzaSy...02"
    prefix: "paid"
```

请求 `free/gemini-2.5-pro` 走第一个，`paid/gemini-2.5-pro` 走第二个。只有多密钥同类型的场景才需要这个。

---

## 你以后可能会用到的

以下功能大多数人不需要马上用。碰到的时候回来查就行，完整字段参考见 [config.example.yaml](https://github.com/router-for-me/CLIProxyAPI/blob/main/config.example.yaml)。

**模型别名** — 嫌模型名太长？起个短名。`fork: true` 保留原名的同时多一个别名：

```yaml
oauth-model-alias:
  gemini-cli:
    - name: "gemini-2.5-pro"
      alias: "g2.5p"
      fork: true
```

**排除模型** — 不想暴露某些模型给客户端，用通配符排除：

```yaml
oauth-excluded-models:
  gemini-cli:
    - "*-preview"
    - "*flash*"
```

**Payload 规则** — 给特定模型强制设参数或设默认值。比如让所有 Gemini Pro 请求默认带 thinking budget：

```yaml
payload:
  default:
    - models:
        - name: "gemini-2.5-pro"
      params:
        "generationConfig.thinkingConfig.thinkingBudget": 32768
```

**Amp CLI 集成** — 把 Amp 的模型请求映射到你自己的提供商：

```yaml
ampcode:
  upstream-url: "https://ampcode.com"
  model-mappings:
    - from: "claude-opus-4-5-20251101"
      to: "gemini-2.5-pro"
```

**Claude Header 默认值** — 遇到版本不匹配报错时覆盖默认请求头：

```yaml
claude-header-defaults:
  user-agent: "claude-cli/2.1.44 (external, sdk-cli)"
  package-version: "0.74.0"
  runtime-version: "v24.3.0"
  timeout: "600"
```

**网络代理** — 需要走代理访问外网时：

```yaml
proxy-url: "socks5://user:pass@192.168.1.1:1080"
```

**TLS** — 开启 HTTPS：

```yaml
tls:
  enable: true
  cert: "/path/to/cert.pem"
  key: "/path/to/key.pem"
```

**流式响应调优** — 一般不用改，除非遇到超时断开：

```yaml
streaming:
  keepalive-seconds: 15
  bootstrap-retries: 1
```

---

## 常见问题

**改了配置要重启吗？** 不用，热重载。唯一例外是 `remote-management`。

**怎么看有哪些模型？** `curl http://127.0.0.1:8317/v1/models -H "Authorization: Bearer 你的key"`

**Token 过期了？** 自动刷新。刷新失败就重新 `-login` 一次。

**`api-keys` 和提供商的 `api-key` 什么区别？** 前者是你给代理设的密码（随便写），后者是 AI 服务商给你的密钥。

**Claude Code 连不上？** 排查：`curl` 能返回数据吗？`ANTHROPIC_BASE_URL` 设对了吗？`ANTHROPIC_AUTH_TOKEN` 跟 `api-keys` 一致吗？都对的话开 `debug: true` 看日志。

**Codex 登录失败？** 需要 ChatGPT 付费会员（Plus/Pro/Team），免费号不行。

**Docker 里怎么 OAuth？** SSH 隧道，上面"服务器党"章节有写。

---

## 延伸阅读

- [邪修用法：Codex/Claude Code 转标准 API](/2025/09/14/CLIProxyAPI/) — CLIProxyAPI 实战案例，在 VSCode Continue 里同时调多家模型
- [Claude Code 可用量缩水分析](/2025/09/30/claude-weeklylimit-to-day/) — 为什么你需要多号轮询
- [Claude Code 限制收紧的深层原因](/2025/10/07/Claude-Code-restrictions-in-2025/) — 背后的技术和商业逻辑
- [Claude Code + Azure DevOps MCP 使用指南](/2025/09/02/use-claude-code-review-azure-devops-pr/) — Claude Code 的另一个高级玩法

## 生态

围绕 CLIProxyAPI 已经有 15+ 个衍生项目：

| 项目 | 平台 | 一句话介绍 |
|------|------|-----------|
| [EasyCLI](https://github.com/router-for-me/EasyCLI) | 全平台 | 官方桌面 GUI |
| [vibeproxy](https://github.com/automazeio/vibeproxy) | macOS | 菜单栏一键管理 |
| [ProxyPilot](https://github.com/Finesssee/ProxyPilot) | Windows | TUI 管理 + 系统托盘 |
| [Claude Proxy VSCode](https://github.com/uzhao/claude-proxy-vscode) | VS Code | 扩展里直接切模型 |
| [ZeroLimit](https://github.com/0xtbug/zero-limit) | Windows | Tauri 配额监控面板 |
| [CCS](https://github.com/kaitranntt/ccs) | CLI | 多账户一键切换 |
| [Quotio](https://github.com/nguyenphutrong/quotio) | macOS | 菜单栏配额追踪 |
| [霖君](https://github.com/wangdabaoqq/LinJun) | 全平台 | 跨平台桌面管理 |
| [Dashboard](https://github.com/itsmylife44/cliproxyapi-dashboard) | Web | Next.js 管理仪表盘 |

去试试。
