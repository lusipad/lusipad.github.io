---
title: 邪修用法：Codex/Claude Code 转标准 API
date: 2025-09-14 08:54:04
description: 使用 CLIProxyAPI 将 Codex 和 Claude Code 转换为 OpenAI 兼容 API，实现低成本使用 GPT/Claude 模型
categories: [AI工具]
tags: [AI, claude, codex]
---

# 邪修用法：Codex/ClaudeCode转标准API

最近 Codex 便宜（越南、印尼有虾皮会员送 3 个月 ChatGpt Plus 会员的活动），综合成本大概 30 块 / 3月，性价比直接拉满。由于我自己的会员开太多了，光靠 Cli 根本用不完。所以想到既然都是 API，那应该也有类似 CCR 这种可以转换成标准 OpenAI 兼容 API 的用法吧？

在验证了几个后，踩了不少坑后，最终用了 https://github.com/luispater/CLIProxyAPI/tree/main 项目。可以支持自定义 API，支持轮询，把我想做的都改完了。



## 配置

编辑 `config.yaml`

```
codex-api-key:
  - api-key: "your-codex-api-key"
    base-url: "https://your-server.com:3000/openai"
```



## 在 VSCode 中使用

直接在 Continue 上配置上（密码没配置，随便填）

```json
{
  "models": [
    {
      "title": "GPT-5",
      "provider": "openai",
      "model": "AUTODETECT",
      "apiBase": "http://localhost:8317/v1",
      "apiKey": "dummy"
    }
  ]
}
```

![image-20250914090815475](http://raw.gitmirror.com/lusipad/imgur/main/img/image-20250914090815475.png)

可以配置，可以选模型，还可以调用工具链。



## 在 OpenDeepwiki 使用

既然可以用 API，就把之前的 OpenDeepwiki 翻出来，赶紧配置上看看能不能用。

先上结论：能用，但是 API 不够用



配置方法不展开了，无法就是 API_Base 换成了 localhost:8173，修改了分析模型为 gpt-5，chat 模型为 gpt-5-mini，然后 docker 一开就开始嚯嚯嚯分析了。

![image-20250914091759920](http://raw.gitmirror.com/lusipad/imgur/main/img/image-20250914091759920.png)

![image-20250914091818154](http://raw.gitmirror.com/lusipad/imgur/main/img/image-20250914091818154.png)

![image-20250914091854646](http://raw.gitmirror.com/lusipad/imgur/main/img/image-20250914091854646.png)

**这里最大的问题出现了：扫描太快了！大概10分钟左右就触发了429限流了: (**

虽然我已经用了两个号做负载均衡，但是无奈还是消耗太快。可能后续要换个 Pro 账号，或者修改下源码，做一个限速功能或者等待重试功能。

![image-20250914092311996](http://raw.gitmirror.com/lusipad/imgur/main/img/image-20250914092311996.png)



像我这个项目大概要 1000+ 次访问，但是由于速度太快了，很快就限速了，叠加上错误重试，就失败了。。

![image-20250914093057760](http://raw.gitmirror.com/lusipad/imgur/main/img/image-20250914093057760.png)

![image-20250914093145082](http://raw.gitmirror.com/lusipad/imgur/main/img/image-20250914093145082.png)



## 使用限制

1. 并发限制 （429）

   Codex 的使用限制，大概每 3 小时 150 条左右

   这个我跑了两次的结果，用的不同的模型（第一次 gpt-5，第二次 gpt-5-mini），但是总量接近

   ![image-20250914091038840](http://raw.gitmirror.com/lusipad/imgur/main/img/image-20250914091038840.png)

