---
title: KTransformers 2.3 版本发布
date: 2025-03-06 23:31:10
description: KTransformers 2.3 发布，新增 Unsloth 1.58/2.51bit 量化支持，单卡 19GB 显存即可运行 DeepSeek-R1
categories: [AI工具]
tags: [AI, ktransformers, deepseek]
---

# KTransformers 2.3 版本发布

KTransfomer 2.3 版本发布了，主要是增加了对 unsloth 1.58/2.51 bits 权重的支持以及更长的上下文支持。

详细的内容包括：

1. 低精度推理优化 #754
  新增 IQ1_S/IQ2_XXS 量化乘法支持，现已兼容 Unsloth DeepSeek-R1 1.58bit/2.51bit 动态量化权重
  使用 DeepSeek-R1 混合精度模型（IQ1+FP8）提高模型表现，实测单卡显存占用 19GB，系统内存占用 140GB。混合精度模型（IQ1+FP8）MMLU 评测83.6 分，略高于全精度版 DeepSeek-V3，更多测试正在进行中，详情见 https://github.com/kvcache-ai/ktransformers/blob/main/doc/en/benchmark.md

2. 长上下文处理增强 #750
  实现 chunked prefill
  在 24GB 显存环境下支持 DeepSeek-R1 处理最高 139K tokens 长上下文。介于DeepSeek最高只支持到128K上下文，我们的长上下文优化将告一段落。

  

V0.2.4 预告：
下一个版本将是 0.2 系列的最后一个子版本，将会迎来 ktransformers 从“玩具”到“实用”最关键的一个更新 -- 多并发支持。

0.2.4 预计在两周内发布，后续将推进 0.3 版本的开发和发布，预计包括 AMX 等提升更高性能的优化，以及 AMD、XPU、摩尔、沐曦、昇腾等更多的显卡种类支持。



在之前我验证过 671B 的 2.51bit 版本，相对来说是一个可以接受的版本。从成本来说，240GB 内存 + 14GB 显存也是一个可以接受的范围。这次进一步降低了入门门槛，打算找个时间好好验证下，成本减低所带来的性能变化到底有多少。（5000 块整一套满血版不是梦哈）
