---
title: deepwiki初体验
date: 2025-05-13 07:43:32
tags: [AI]
---

# DeepWiki初体验

继首个 AI 程序员 Devin 沉沙折戟之后，Cognition 又整了个 DeepWiki，号称是活的项目文档。

之前在用一些本地 agent 的时候，我也萌生过此类的想法，既然 AI 可以读项目，那让它每天定时把整个项目重新更新一遍，只要规则合适，应该只是时间问题？

没想到这么快就有项目落地了，看看效果如何。



先首页 add repo，然后大概一天后收到邮件说整完了。

用的是我自己仓库里的 [lusipad/plcopen | DeepWiki](https://deepwiki.com/lusipad/plcopen)



## 首页

![image-20250513075204948](http://raw.gitmirror.com/lusipad/imgur/main/img/image-20250513075204948.png)



分成了 概述、架构、代码组件、使用指南、开发几块。(这个我觉得还行)

概述里的内容大部分来自 README 和 test 的用例，还有一个自己绘制的框图。（还行）

架构部分主要是将 FB、运动控制、执行器三者分别阐述。（不错）

核心代码则是将几个关键的类详细展开了，并且有详细的 UML 图。（不错）

使用指南就不大行了，可能还是原来的代码写得不咋滴导致的。

开发部分我原本以为是给一些开发指南之类的，结果在写构建和加代码，但是内容又有些错误。。

除此以外，还可以通过 AI 问题。



~~整体来说，我觉得非常不错，关注下有没有开源替代的，准备部署一个。（之前看过 OpenDeepWiki 主要靠 Gemini Pro 的长上下文来整的，我其实还是想内网部署一个）~~

[plcopen - lusipad 的文档仓库 | OpenDeekWiki | OpenDeekWiki](https://opendeep.wiki/lusipad/plcopen)

![image-20250530054435152](http://raw.gitmirror.com/lusipad/imgur/main/img/image-20250530054435152.png)

开源版本的效果也很不错。看来 Agent 领域没有护城河：）
