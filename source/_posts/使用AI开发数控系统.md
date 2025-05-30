---
title: 使用AI开发数控系统记录
date: 2025-03-02 01:00:04
tags: [AI, C++, 前端, web]
---

# 使用 AI 开发数控系统记录

在过去的一周中，使用闲暇时间，使用 AI 从零开始开发一个数控系统。主要是为了验证下现有的 AI 对于复杂系统的开发，同时也记录了整个过程中所遇到的坑。

 ![image-20250302015222450](http://raw.gitmirror.com/lusipad/imgur/main/img/image-20250302015222450.png)



本次开发主要使用的 AI 工具为 Trae （字节出品，可免费使用 GPT4 和 Claude-3.5-Sonnet），Windsurf（15 刀的 Pro 版，包括 500 次 Chat 和 1500 次 Flow，不管是查看文件、执行命令还是改写代码都算一次 Flow，模型方面主要使用的是 Claude-3.7-sonnet）

前期用的 Trae，后期随着项目规模扩大，Trae 无法胜任后，换成了 WindSurf

在具体的开发中，也尽量按照：先计划、后开发；使用 TDD 的方式，测试和开发交替进行。

项目地址：[lusipad/XXCNC: 一个用来验证一些想法的简单原型项目，主要由AI进行编写](https://github.com/lusipad/XXCNC)



## 1. 需求沟通

### 1.1 确定高层需求

第一步先和 AI 进行了详细的沟通，我提出了自己的诉求

> Me: 我想开发一个数控系统，我们来聊下应该怎么设计吧
>
> AI：让我们来讨论数控系统的设计。数控系统是一个复杂的实时控制系统，需要考虑多个关键方面：
>
> 1. **系统架构**
>    - 实时控制层：负责底层运动控制、插补运算
>    - 逻辑控制层：处理 PLC 逻辑、IO 控制
>    - 应用层：用户界面、加工程序管理等
>
> 2. **核心功能模块**
>    - 运动控制模块
>      - 轴控制
>      - 插补算法（直线、圆弧等）
>      - 加减速控制
>    - G代码解析器
>    - 刀具管理
>    - 工件坐标系统
>    - 人机界面（HMI）
>
> 3. **技术选型建议**
>    - 实时控制层：C/C++（保证实时性）
>    - 逻辑控制：可以考虑 C++ 或工业控制专用语言
>    - 界面层：Qt/WPF 等现代 GUI 框架
>
> 4. **关键技术点**
>    - 实时性保证
>    - 运动控制算法
>    - 安全机制
>    - 误差补偿
>
> 您想先从哪个方面开始深入讨论？或者您对某个具体模块有特别的需求或疑问吗？

### 1.2 确定技术栈、具体的功模块划分

> Me：技术方面我决定使用C++，所以模块我们如何划分
>
> AI：基于C++开发数控系统，我建议按以下方式进行模块划分：
>
> 1. 核心控制模块（Core）
> 2. 运动控制模块（Motion）
> 3. 插补引擎模块（Interpolation）
> 4. G代码解析模块（GCode）
> 5. HMI界面模块（UI）
> 6. 配置管理模块（Config）
> 7. 诊断和日志模块（Diagnostic）
> 建议的项目结构：
>
> ```plaintext
> d:\Repos\XXCNC\
> ├── src/
> │   ├── Core/           // 核心控制模块
> │   ├── Motion/         // 运动控制模块
> │   ├── Interpolation/  // 插补引擎模块
> │   ├── GCode/         // G代码解析模块
> │   ├── UI/            // 用户界面模块
> │   ├── Config/        // 配置管理模块
> │   └── Diagnostic/    // 诊断和日志模块
> ├── include/           // 公共头文件
> ├── lib/              // 第三方库
> └── tests/            // 单元测试
> ```
>
> 这种模块划分的优点：
>
> 1. 高内聚低耦合，每个模块职责明确
> 2. 便于多人协作开发
> 3. 便于单元测试
> 4. 便于后期维护和扩展
>
> 
>
> Me：可以的，但是界面我不想使用QT等方式，我想提供webserver给外部使用，只提供简
>
> 明白了，我们可以将UI模块改为WebServer模块，使用RESTful API提供服务。这样的设计更加轻量级且灵活。让我修改一下相关模块：
>
> 移除原来的UI模块，替换为WebServer模块：
>
> 修改后的项目结构：
>
> 主要API功能：
>
> 1. 系统控制
>    
>    - GET /api/v1/status - 获取系统状态
>    - POST /api/v1/emergency-stop - 紧急停止
> 2. 轴控制
>    
>    - GET /api/v1/axis/{id}/status - 获取指定轴状态
>    - POST /api/v1/axis/{id}/move - 控制指定轴移动
>    - POST /api/v1/axis/{id}/home - 指定轴回零
> 3. 程序控制
>    
>    - POST /api/v1/program/upload - 上传G代码程序
>    - POST /api/v1/program/start - 开始执行程序
>    - POST /api/v1/program/pause - 暂停程序
>    - POST /api/v1/program/stop - 停止程序
> 4. 配置管理
>    
>    - GET /api/v1/config - 获取系统配置
>    - PUT /api/v1/config - 更新系统配置
>    对于Web服务器的实现，我建议使用以下几个C++库之一：
>
> 1. cpp-httplib - 轻量级HTTP服务器库
> 2. Crow - 现代C++ Web框架
> 3. Drogon - 高性能C++ Web应用框架
> 您觉得这个设计如何？我们可以进一步讨论具体的API设计或选择哪个Web框

## 2. 项目规划

### 2.1 项目计划

**这一步非常重要，让 AI 将数据拆分成详细的内容，后续可以让他直接根据计划和代码实现情况，就可以继续工作了**

> Me：可以的，你可以把这些工作都拆分成具体的工作，整理一个多人开发的工作清单吗
>
> AI：
>
> 好的，我来帮您整理一个多人开发的工作清单，按照功能模块和优先级划分：
>
> ### 第一阶段：核心功能开发
>
> 1. **核心控制模块（Core Team）**
>    - [ ] 实现核心控制器框架
>    - [ ] 开发实时任务调度系统
>    - [ ] 实现系统状态管理
>    - [ ] 开发紧急停止处理机制
>    - [ ] 单元测试编写
>
> 2. **运动控制模块（Motion Team）**
>    - [ ] 轴控制基础类实现
>    - [ ] 加减速算法开发
>    - [ ] 多轴协同控制
>    - [ ] 回零功能实现
>    - [ ] 单元测试编写
>
> 3. **插补引擎模块（Algorithm Team）**
>    - [ ] 直线插补算法实现
>    - [ ] 圆弧插补算法实现
>    - [ ] 样条曲线插补实现
>    - [ ] 前瞻算法开发
>    - [ ] 算法性能优化
>    - [ ] 单元测试编写
>
> ### 第二阶段：功能扩展
>
> 4. **G代码解析模块（Parser Team）**
>    - [ ] G代码词法分析器开发
>    - [ ] G代码语法解析器开发
>    - [ ] 指令转换系统实现
>    - [ ] 支持自定义宏
>    - [ ] 单元测试编写
>
> 5. **Web服务器模块（Web Team）**
>    - [ ] HTTP服务器框架搭建
>    - [ ] RESTful API设计和实现
>    - [ ] WebSocket实时数据推送
>    - [ ] API文档编写
>    - [ ] 接口测试用例编写
>
> 6. **配置管理模块（Config Team）**
>    - [ ] 配置文件格式设计
>    - [ ] 配置读写实现
>    - [ ] 配置验证机制
>    - [ ] 配置热更新功能
>    - [ ] 单元测试编写
>
> ### 第三阶段：系统集成与优化
>
> 7. **诊断和日志模块（Diagnostic Team）**
>    - [ ] 日志系统实现
>    - [ ] 错误诊断功能
>    - [ ] 性能监控系统
>    - [ ] 数据统计功能
>    - [ ] 单元测试编写
>
> 8. **系统集成（Integration Team）**
>    - [ ] 模块间通信机制实现
>    - [ ] 系统集成测试
>    - [ ] 性能测试和优化
>    - [ ] 内存泄漏检测
>    - [ ] 系统稳定性测试
>
> ### 第四阶段：文档和工具
>
> 9. **文档团队（Documentation Team）**
>    - [ ] API文档编写
>    - [ ] 系统架构文档
>    - [ ] 开发指南编写
>    - [ ] 用户手册编写
>    - [ ] 示例代码编写
>
> 10. **工具开发（Tools Team）**
>     - [ ] 调试工具开发
>     - [ ] 性能分析工具
>     - [ ] 日志分析工具
>     - [ ] 配置工具开发
>     - [ ] 测试工具开发
>
> ### 建议的团队配置：
> - Core Team: 2-3人（高级开发工程师）
> - Motion Team: 2人（运动控制专家）
> - Algorithm Team: 2人（算法工程师）
> - Parser Team: 1-2人（编译原理专家）
> - Web Team: 2人（全栈开发工程师）
> - Config Team: 1人（开发工程师）
> - Diagnostic Team: 1-2人（开发工程师）
> - Integration Team: 2人（系统工程师）
> - Documentation Team: 1人（技术文档工程师）
> - Tools Team: 1-2人（开发工程师）
>
> 总人力需求：15-19人
>
> 您觉得这个任务分配合理吗？我们可以根据实际情况调整团队规模和任务优先级。
>
> 
>
> Me：不过我打算都使用AI来完成，你觉得提供什么样的计划和Prompt给AI编写会给好用
>
> AI：我来帮您设计一个基于AI辅助开发的计划，包括每个模块的Prompt设计思路：
>
> ### 1. 核心控制模块开发
>
> ```plaintext:d:\Repos\XXCNC\docs\ai_tasks\core_module.md
> 开发步骤：
> 1. 框架设计
> Prompt示例：
> "请设计一个实时数控系统的核心控制器类，需要包含以下功能：
> - 实时任务调度
> - 系统状态管理
> - 紧急停止处理
> - 与其他模块的通信接口
> 请提供详细的类设计和关键方法实现。"
> 
> 2. 实现细节
> Prompt示例：
> "基于上述CoreController类设计，请实现实时任务调度系统，要求：
> - 支持不同优先级的任务
> - 确保关键任务的实时性
> - 提供任务取消机制
> - 包含完整的错误处理"
> ```
>
> ### 2. 运动控制模块开发
>
> ```plaintext:d:\Repos\XXCNC\docs\ai_tasks\motion_module.md
> 开发步骤：
> 1. 基础类设计
> Prompt示例：
> "设计一个数控系统的运动控制模块，需要：
> - 支持多轴控制
> - 实现加减速算法
> - 位置和速度控制
> - 提供轴状态监控
> 请提供类图和核心接口设计。"
> 
> 2. 算法实现
> Prompt示例：
> "实现S形加减速算法，要求：
> - 支持加加速度限制
> - 平滑的速度曲线
> - 考虑机械特性
> - 提供参数调整接口"
> ```
>
> ### 3. 插补引擎模块开发
>
> ```plaintext:d:\Repos\XXCNC\docs\ai_tasks\interpolation_module.md
> 开发步骤：
> 1. 算法框架
> Prompt示例：
> "设计一个支持多种插补方式的插补引擎，包括：
> - 直线插补
> - 圆弧插补
> - 样条曲线插补
> 请提供算法框架和关键数据结构。"
> 
> 2. 具体算法
> Prompt示例：
> "实现三次样条曲线插补算法，要求：
> - 保证路径连续性
> - 优化计算效率
> - 考虑速度规划
> - 提供误差控制"
> ```
>
> ### 4. Web服务器模块开发
>
> ```plaintext:d:\Repos\XXCNC\docs\ai_tasks\webserver_module.md
> 开发步骤：
> 1. API设计
> Prompt示例：
> "设计一个数控系统的RESTful API，需要包含：
> - 系统状态查询
> - 运动控制指令
> - 程序文件管理
> - 配置管理
> 请提供详细的API文档。"
> 
> 2. 实现细节
> Prompt示例：
> "使用C++实现上述API中的运动控制接口，要求：
> - 处理并发请求
> - 实现实时数据推送
> - 提供错误处理
> - 支持认证授权"
> ```
>
> ### 开发流程建议
>
> 1. **循序渐进**
>    - 先让AI生成框架设计
>    - 审查并确认设计合理性
>    - 再让AI实现具体细节
>    - 最后进行集成测试
>
> 2. **提示词技巧**
>    - 明确指定输入输出格式
>    - 提供具体的性能要求
>    - 要求包含错误处理
>    - 要求提供测试用例
>
> 3. **代码审查要点**
>    - 检查实时性要求
>    - 验证错误处理
>    - 确认接口一致性
>    - 检查内存管理
>
> 4. **迭代优化**
>    - 收集实际运行数据
>    - 针对性能瓶颈优化
>    - 完善错误处理
>    - 改进代码结构
>
> 您觉得这个AI辅助开发计划如何？我们可以先从某个具体模块开始尝试。
>
> 
>
> Me：请帮我完整的整理下
>
> AI：我来帮您整理一个完整的AI辅助开发计划：
>
> ### 一、项目初始化
>
> ```plaintext:d:\Repos\XXCNC\docs\ai_development_plan.md
> 1. 项目结构创建
> - 生成基础目录结构
> - 创建CMake配置文件
> - 设置基础编译环境
> - 配置单元测试框架
> 
> 2. 基础类型定义
> - 坐标系统
> - 运动参数
> - 错误代码
> - 系统状态定义
> ```
>
> ### 二、核心模块开发序列
>
> #### 1. 核心控制模块
> ```plaintext:d:\Repos\XXCNC\docs\ai_tasks\01_core_development.md
> 阶段1：基础框架
> - CoreController 类设计
> - 实时调度系统
> - 状态管理系统
> - 错误处理机制
> 
> 阶段2：功能实现
> - 任务队列管理
> - 系统初始化流程
> - 安全监控系统
> - 模块间通信
> ```
>
> #### 2. 运动控制模块
> ```plaintext:d:\Repos\XXCNC\docs\ai_tasks\02_motion_development.md
> 阶段1：基础功能
> - Axis 类实现
> - 运动参数管理
> - 位置控制系统
> - 速度控制系统
> 
> 阶段2：高级功能
> - 加减速算法
> - 多轴协同
> - 限位处理
> - 回零功能
> ```
>
> #### 3. 插补引擎模块
> ```plaintext:d:\Repos\XXCNC\docs\ai_tasks\03_interpolation_development.md
> 阶段1：基础算法
> - 直线插补
> - 圆弧插补
> - 基础速度规划
> - 路径优化
> 
> 阶段2：高级算法
> - 样条曲线插补
> - 前瞻算法
> - 轨迹平滑
> - 误差补偿
> ```
>
> #### 4. G代码解析模块
> ```plaintext:d:\Repos\XXCNC\docs\ai_tasks\04_gcode_development.md
> 阶段1：解析器
> - 词法分析器
> - 语法分析器
> - 指令解释器
> - 参数处理
> 
> 阶段2：执行系统
> - 指令队列管理
> - 宏指令处理
> - 坐标系转换
> - 刀具补偿
> ```
>
> #### 5. Web服务器模块
> ```plaintext:d:\Repos\XXCNC\docs\ai_tasks\05_webserver_development.md
> 阶段1：基础服务
> - HTTP服务器
> - REST API实现
> - WebSocket服务
> - 认证授权
> 
> 阶段2：功能接口
> - 状态监控API
> - 控制指令API
> - 文件管理API
> - 配置管理API
> ```
>
> ### 三、开发流程指南
>
> ```plaintext:d:\Repos\XXCNC\docs\ai_development_guide.md
> 1. 每个模块的开发流程：
>    a. 设计阶段
>    - 接口设计
>    - 类结构设计
>    - 算法设计
>    - 错误处理设计
> 
>    b. 实现阶段
>    - 核心功能实现
>    - 单元测试编写
>    - 性能优化
>    - 文档生成
> 
>    c. 测试阶段
>    - 单元测试
>    - 集成测试
>    - 性能测试
>    - 稳定性测试
> 
> 2. AI提示词模板：
>    a. 设计提示：
>    "请设计[模块名称]，需要满足以下要求：
>    - 功能需求：[具体功能]
>    - 性能要求：[具体指标]
>    - 接口要求：[接口规范]
>    - 错误处理：[处理方式]
>    请提供详细的类设计和关键方法定义。"
> 
>    b. 实现提示：
>    "基于[类名]设计，请实现以下功能：
>    - 具体功能：[功能描述]
>    - 输入参数：[参数说明]
>    - 输出要求：[输出规范]
>    - 性能要求：[性能指标]
>    请提供完整的代码实现和单元测试。"
> 
> 3. 代码审查重点：
>    - 实时性保证
>    - 内存管理
>    - 错误处理
>    - 代码规范
>    - 性能优化
>    - 接口一致性
> ```
>
> ### 四、测试计划
>
> ```plaintext:d:\Repos\XXCNC\docs\ai_testing_plan.md
> 1. 单元测试
> - 功能测试
> - 边界测试
> - 异常测试
> - 性能测试
> 
> 2. 集成测试
> - 模块间通信
> - 功能集成
> - 性能验证
> - 稳定性测试
> 
> 3. 系统测试
> - 完整功能测试
> - 负载测试
> - 长期稳定性测试
> - 异常恢复测试
> ```
>
> 您觉得这个计划如何？我们可以从任何一个模块开始实施。每个模块都可以进一步细化，根据实际需求调整开发顺序和优先级。

### 2.2 归档

接下来就是让 AI 把内容归档到 plan.md，进行我们的开发工作



## 3. 开发工作

### 3.1 项目初始化

这个阶段先让 AI 进行了项目的构建和初始化，包括了 CMake 项目搭建，这部分完成的不错

> Me: 我们按照这个计划开始准备开发工作吧
>
> AI：我会帮您开始项目的初始化工作。根据开发计划，我们首先需要创建基础的项目结构，包括设置CMake配置、编译环境和单元测试框架，然后定义基础类型如坐标系统和运动参数。完成初始化后，我们将按照计划开始核心控制模块的开发。
>
> 让我们先查看当前项目目录的结构，以确定需要创建哪些基础目录和文件。
>
> XXCNC
>
> 根据项目计划，我们需要创建一个CMake项目结构。首先创建CMakeLists.txt作为主配置文件，设置项目基本信息和编译选项。
>
> CMakeLists.txt
>
> 接下来创建src目录下的CMakeLists.txt文件，配置源代码的编译规则和依赖关系。
>
> src\CMakeLists.txt
>
> 现在我们需要创建tests目录下的CMakeLists.txt文件，配置单元测试框架和测试用例的编译规则。
>
> tests\CMakeLists.txt
>
> 现在我们需要创建基础的目录结构，包括src和tests目录下的各个模块子目录，以及一个.gitignore文件来排除不需要的文件。
>
> 让我们创建基础的目录结构，包括src和tests目录下的各个模块子目录。这些目录将用于存放源代码和测试文件。
>
> src\core\README.md
>
> 接下来我们需要创建基础类型定义文件，包括坐标系统、运动参数、错误代码和系统状态定义。我们先创建一个基础类型的头文件。
>
> src\include\xxcnc\types.h
>
> 已完成项目的初始化工作，主要包括：
>
> 1. 创建了基础的项目结构：
>    
>    - 配置了主CMakeLists.txt文件，设置了项目基本信息和编译选项
>    - 创建了src和tests目录的CMakeLists.txt，配置了源代码编译和测试框架
>    - 建立了核心模块的目录结构和说明文档
> 2. 定义了基础类型系统：
>    
>    - 在types.h中定义了基本数值类型
>    - 实现了坐标系统（Point结构）
>    - 定义了运动参数（MotionParameters结构）
>    - 创建了错误码系统（ErrorCode枚举）
>    - 定义了系统状态（SystemState枚举）
> 3. 设置了开发环境：
>    
>    - 配置了C++17标准
>    - 设置了严格的编译警告
>    - 集成了GTest测试框架
>    - 配置了安装和导出规则
>    项目初始化工作已经完成，现在可以开始进行核心模块的开发工作。

> 我会帮您配置和编译这个XXCNC项目。根据项目结构，我看到已经有基础的CMakeLists.txt文件和源代码目录，我将创建build目录，配置CMake项目并进行编译。编译过程将包括所有核心模块和测试用例。
>
> 首先创建build目录并进入该目录，然后使用CMake配置项目。
>
> XXCNC 终端
>
> mkdir build
>
> 现在我们使用CMake来配置项目，生成构建文件。
>
> XXCNC 终端
>
> cmake -B build -S .
>
> 我看到CMake配置失败了，这是因为缺少必要的源文件。让我先检查一下CMakeLists.txt文件的内容，以便了解项目的配置要求。
>
> src\CMakeLists.txt
>
> tests\CMakeLists.txt
>
> CMakeLists.txt
>
> 根据CMake配置文件的要求，我们需要创建核心控制模块的基础文件。让我们先创建CoreController的实现文件。
>
> src\core\CoreController.cpp
>
> 现在我们需要创建CoreController的头文件，定义基本的类接口和系统状态枚举。
>
> src\include\xxcnc\core\CoreController.h
>
> 我们需要创建一个基本的测试文件来验证CoreController的功能，这样才能通过CMake的配置。
>
> tests\core\CoreControllerTest.cpp
>
> 现在我们已经创建了必要的源文件，让我们重新运行CMake配置命令来生成构建文件。
>
> XXCNC 终端
>
> cmake -B build -S .
>
> 我们需要修改CMakeLists.txt文件，暂时只包含已经创建的源文件，移除尚未创建的文件。
>
> src\CMakeLists.txt
>
> 我们还需要修改测试的CMakeLists.txt文件，只包含已经创建的测试文件。
>
> tests\CMakeLists.txt
>
> 现在我们已经修改了CMake配置文件，让我们重新运行CMake配置命令，然后使用Visual Studio的构建工具进行编译。
>
> XXCNC 终端
>
> cmake -B build -S .
>
> CMake配置文件中存在语法错误，需要修复src/CMakeLists.txt文件中的格式问题。
>
> src\CMakeLists.txt
>
> 现在我们已经修复了CMake配置文件中的语法错误，让我们重新运行CMake配置命令，然后使用Visual Studio的构建工具进行编译。
>
> XXCNC 终端
>
> cmake -B build -S .
>
> 需要继续修复src/CMakeLists.txt文件中的语法错误，删除所有未使用的源文件引用。
>
> src\CMakeLists.txt
>
> 现在我们已经完全修复了CMake配置文件，让我们重新运行CMake配置命令，然后使用Visual Studio的构建工具进行编译。
>
> XXCNC 终端
>
> cmake -B build -S .
>
> 需要修复tests/CMakeLists.txt文件中的语法错误，删除所有未使用的测试文件引用。
>
> tests\CMakeLists.txt
>
> 现在我们已经修复了所有CMake配置文件的问题，让我们重新运行CMake配置命令，然后使用Visual Studio的构建工具进行编译。
>
> XXCNC 终端
>
> cmake -B build -S .
>
> CMake配置已经成功完成，现在让我们使用Visual Studio的MSBuild工具来编译项目。
>
> XXCNC 终端
>
> cmake --build build --config Release
>
> 编译失败的主要原因是文件编码问题，需要将源文件保存为UTF-8格式。我们需要修改CoreController.h文件的编码格式。
>
> src\include\xxcnc\core\CoreController.h
>
> 需要修改CoreController.cpp文件的编码格式，将中文注释改为英文，以解决编码问题。
>
> src\core\CoreController.cpp
>
> 现在我们已经修复了源文件的编码问题，让我们重新尝试编译项目。
>
> XXCNC 终端
>
> cmake --build build --config Release
>
> 成功完成了XXCNC项目的编译工作。主要完成了以下任务：
>
> 1. 创建并配置了基础的项目结构：
>    
>    - 创建了核心控制模块的源文件和头文件
>    - 实现了基本的CoreController类
>    - 添加了系统状态管理的基础功能
> 2. 配置了CMake构建系统：
>    
>    - 修复了CMakeLists.txt文件中的语法问题
>    - 正确配置了库目标和测试目标
>    - 设置了适当的包含目录和编译选项
> 3. 解决了编码问题：
>    
>    - 将源文件转换为UTF-8编码
>    - 修改了中文注释为英文注释
> 4. 成功编译了项目：
>    
>    - 生成了xxcnc静态库
>    - 编译了单元测试可执行文件
>    项目现在已经具备了基本的开发框架，可以继续进行功能开发。



### 3.2 添加三方库、单元测试

**但是接下来他就碰到了第一座大山，不知道怎么使用 vcpkg，在尝试了七八次后无果，人工介入帮其进行安装**



### 3.3 基础运动模型

这部分开发很快，但是内容不多，只是一些简单的定义、状态切换以及日志和异常处理等

> 已成功完成了核心控制模块的功能扩展：
>
> 1. 在CoreController中新增了两个重要功能：
>    
>    - 紧急停止（Emergency Stop）功能：可以在任何状态下触发，将系统置于紧急停止状态
>    - 回零（Homing）功能：在空闲状态下执行回零操作，完成后返回空闲状态
> 2. 更新了状态管理系统：
>    
>    - 在SystemState枚举中增加了HOMING和EMERGENCY_STOP状态
>    - 确保了状态转换的正确性和安全性
> 3. 完善了错误处理机制：
>    
>    - 为所有新增功能添加了异常捕获和处理
>    - 通过日志系统记录详细的错误信息
> 4. 添加了完整的单元测试：
>    
>    - 验证紧急停止在不同状态下的行为
>    - 测试回零操作在不同状态下的表现
>    - 确保状态转换的正确性



> 已完成运动控制模块中Axis类的基础功能实现：
>
> - 创建了Axis.h头文件，定义了以下关键组件：
>   
>   - AxisState枚举类型，描述轴的运动状态
>   - AxisParameters结构体，包含运动参数配置
>   - Axis类的完整接口定义
> - 实现了Axis.cpp，完成了以下功能：
>   
>   - 基础运动控制（使能、禁用、停止）
>   - 位置控制系统（moveTo方法）
>   - 速度控制系统（moveVelocity方法）
>   - 回零功能（home方法）
>   - 实时状态更新（update方法）
> - 实现了关键的安全特性：
>   
>   - 软限位检查
>   - 速度和加速度限制
>   - 紧急停止功能
>   - 状态监控和错误处理



### 3.4 插补器开发

开发了一个插补器，经过了大约 20 轮左右的对话，包括且不限于以下问题：

- 语法错误，编译通不过
- 编码错误
- 未定义的类、成员变量等

然后开始单元测试，一些简单的 case 立刻就过了，卡在一些功能问题，经过了超过 30 轮对话，包括：

- 插补器的退出条件错误，导致一直无法退出
- 性能条件写太随意，导致算法一直无法满足一直修改 （最终也没解决）

> 已完成插补引擎模块的基础算法实现，包括以下功能：
>
> - 创建了 InterpolationEngine 类，实现了基础的插补算法框架
> - 实现了直线插补算法，支持三轴联动
> - 实现了圆弧插补算法，支持顺时针和逆时针圆弧
> - 实现了梯形速度规划，包含加速、匀速和减速三个阶段
> - 实现了基于三点平滑的路径优化算法
>
> 已完成插补引擎模块的单元测试补充工作，主要完成了以下内容：
>
> - 创建了 InterpolationEngineTest.cpp 测试文件
> - 实现了基础的测试框架，包括 SetUp 和 TearDown 方法
> - 添加了直线插补测试，验证基本功能和路径连续性
> - 添加了圆弧插补测试，验证圆弧路径的正确性和半径一致性
> - 实现了边界条件测试，包括零距离移动和极小距离移动的情况
> - 添加了性能测试，验证算法的实时性和分段合理性
> - 实现了错误处理测试，验证非法参数的异常处理
> 所有测试用例都遵循了项目的测试规范，覆盖了基本功能、边界条件、性能要求和错误处理等方面，确保了插补引擎模块的代码质量和功能正确性。



### 3.5 运动功能进一步开发

这里进一步完善功能，此时出现了一个问题：他新写的测试用例没有添加到项目里，经过多次的修改，仍然未解决。其他功能均可在差不多 2~4 轮对话，测试失败后完成修复。

> 本次开发完成了运动控制模块的基础功能实现，主要包括：
>
> - 创建了 MotionController 类，实现了多轴协同运动控制系统
> - 实现了轴的基本控制功能，包括：
>   - 轴的使能/禁用
>   - 位置控制
>   - 速度控制
>   - 加速度控制
>   - 软限位保护
>   - 紧急停止功能
> - 实现了直线插补运动功能，支持：
>   - 多轴协同运动
>   - 速度规划
>   - 加速度规划
>   - 实时状态更新
>   代码采用了面向对象的设计方法，通过类的继承和组合实现了功能的模块化和可扩展性。同时，代码中加入了完善的错误处理和状态管理机制，确保了运动控制的安全性和可靠性。



### 3.6 G代码解析

此处新增的功能未作验证，基本生成后就能通过编译

> 已完成G代码执行系统的基础框架开发，主要包括：
>
> 1. 创建了GCodeExecutor类，实现了指令队列管理的核心功能：
>    
>    - 指令队列的添加和执行
>    - 暂停、恢复和停止功能
>    - 线程安全的队列操作
>    - 异步执行支持
> 2. 设计并实现了完整的G代码命令体系：
>    
>    - 定义了基础的GCodeCommand类
>    - 实现了多种具体命令类型：
>      - MotionCommand（运动指令）
>      - ToolCommand（刀具指令）
>      - CoordinateCommand（坐标系统指令）
>      - MacroCommand（宏指令）
> 3. 建立了命令参数体系：
>    
>    - 创建了基础的CommandParams结构
>    - 实现了各类具体参数结构：
>      - MotionParams（运动参数）
>      - ToolParams（刀具参数）
>      - CoordinateParams（坐标系统参数）
>      - MacroParams（宏指令参数）
>      这些实现为后续的功能扩展（如宏指令处理、坐标系转换和刀具补偿）奠定了良好的基础。



### 3.7 添加 web 功能

这里主要的难点是：CMake 集成三方库，多次失败后，人工调整添加（他名字写错了），整体对话大约 20 轮

> 已完成Web服务器模块的基础功能实现：
>
> - 创建了Web服务器模块的基础目录结构
> - 实现了WebServer类及其PIMPL实现类WebServerImpl
> - 添加了基础HTTP REST API接口：
>   - /api/health：健康检查接口
>   - /api/status：系统状态查询接口
> - 配置了CMake构建系统，包含必要的依赖项：
>   - cpp-httplib：HTTP服务器库
>   - spdlog：日志记录
>   - nlohmann-json：JSON处理
>   该模块现在具备了基本的Web服务功能，可以启动HTTP服务器并响应基本的API请求。后续可以根据需要扩展更多API接口，添加WebSocket支持，以及实现更复杂的功能。



### 3.8 前端页面开发-初版

这个是 AI 生成的第一版界面，只有按钮没有实际的动作

经过 20 轮左右的沟通，发现 Trae 中的 Claude-3.5 无法满足工作了，所以切换到了 windsurf 继续工作

![image-20250302014405797](http://raw.gitmirror.com/lusipad/imgur/main/img/image-20250302014405797.png)

让 windsurf 了解了项目的计划、当前的进度后，开始开发。

windsurf 的 Flow 是支持自己执行命令、查找文件等动作的，我直接全开了允许，让其进行自动工作。

> 让我先查看一下项目中的web相关文件。
>
> 
>
> Searched for files ind:\Repos\XXCNC
>
> 4 results
>
> 让我检查一下web服务器相关的代码。
>
> 
>
> Searched codebase
>
> 255 results
>
> 让我查看一下前端页面的代码。
>
> 
>
> Analyzed
>
> index.html:(1-200)
>
> 让我看看前端的JavaScript代码。
>
> 
>
> Analyzed
>
> main.js:(1-200)
>
> 我发现了几个问题：
>
> 1. 前端代码中有一些按钮的ID与HTML中的不匹配：
>    - HTML中有 `start-btn`, `pause-btn`, `resume-btn`，但在JavaScript中使用的是 `btnPause`, `btnResume`
>    - HTML中没有 `btnUpload`，但JavaScript中尝试添加事件监听器
>    - HTML中缺少 `speed` 元素，但JavaScript中尝试引用它
> 2. 一些DOM元素的ID不匹配：
>    - JavaScript中使用 `fileList`，但HTML中是 `file-list`
>    - JavaScript中使用 `speed`，但HTML中没有对应元素
> 3. 轨迹查看器的初始化代码有问题：
>    - `script.onload` 中的 `script` 变量未定义
>    - 轨迹查看器的初始化应该在页面加载完成后进行
>
> 让我修复这些问题：
>
> 
>
> Edited
>
> main.js
>
> 让我看看轨迹查看器的代码：
>
> 
>
> Analyzed
>
> trajectory-viewer.js:(1-200)
>
> 我发现轨迹查看器也有一些问题：
>
> 1. Three.js库的引入方式不合适，应该在HTML中通过CDN引入
>2. 轨迹查看器的初始化代码有问题，不应该在script.onload中定义类
> 3. 视图控制按钮的事件监听器绑定到了不存在的元素上
>
> 让我先修改HTML文件，添加Three.js库和视图控制按钮：
> 
> 
>
> Edited
>
> index.html
>
> 现在让我修改轨迹查看器的代码：
>
> 
>
> Edited
>
> trajectory-viewer.js
>
> 我已经修复了前端代码中的主要问题：
>
> 1. 修复了HTML和JavaScript代码中的DOM元素ID不匹配问题
>2. 改进了轨迹查看器的初始化和事件绑定
> 3. 添加了视图控制按钮
>4. 优化了代码结构和错误处理
> 
>主要改进包括：
> 
>1. 在HTML中：
>    - 通过CDN引入Three.js和OrbitControls库
>   - 添加了轨迹查看器的视图控制按钮
>    - 修正了一些元素的ID
>2. 在main.js中：
>    - 修正了DOM元素的选择器
>    - 将所有事件监听器移到页面加载完成后再绑定
>    - 改进了状态更新和文件上传的逻辑
>    - 优化了错误处理
>3. 在trajectory-viewer.js中：
>    - 移除了动态加载Three.js的代码
>   - 改进了类的初始化方式，通过参数传入canvas ID
>    - 添加了更多的错误检查
>    - 使用ResizeObserver来处理视图大小变化
>    - 改进了轨迹点的添加和清除逻辑
> 
> 现在让我检查一下后端代码：
> 
> 
> 
> Searched codebase
> 
> 70 results
> 
> 让我看看WebServer的实现：
> 
> 
>
> Searched codebase
>
> 8 results
>
> 让我看看WebServer的头文件：
>
> 
>
> Searched for files ind:\Repos\XXCNC
>
> 2 results
>
> 让我看看WebServer的头文件内容：
>
> 
>
> Analyzed
>
> WebServer.h:(1-200)
>
> 让我看看WebServer的实现文件：
>
> 
>
> Searched for files ind:\Repos\XXCNC
>
> 1 result
>
> 
>
> Analyzed
>
> WebServer.cpp:(1-200)
>
> 通过查看代码，我发现了几个问题：
>
> 1. WebServer的构造函数有两个版本，但在`main.cpp`中使用的是无参版本，这意味着没有提供WebAPI实现。
>2. WebServer的配置在启动时没有完全设置：
>    - 没有设置`enable_cors`
>   - 没有正确设置`static_dir`的完整路径
> 3. 回调函数没有完全实现：
>   - 状态回调只返回了基本的位置信息，没有包含进给速度和其他状态
>    - 命令回调缺少了一些重要命令的处理（如start、pause、resume等）
>   - 文件上传回调没有处理轨迹信息的生成
> 
>让我修复这些问题。首先修改main.cpp：
> 
>
> 
> Edited
> 
> main.cpp
> 
> 让我修改SystemStatus类，添加更多状态字段：
> 
> 
>
> Edited
>
> main.cpp
>
> 现在我已经修复了主要的问题：
>
> 1. 前端修复：
>   - 修正了DOM元素ID的不匹配
>    - 改进了事件监听器的绑定
>   - 优化了轨迹查看器的初始化和渲染
>    - 添加了视图控制按钮
>2. 后端修复：
>    - 完善了服务器配置，使用绝对路径和启用CORS
>   - 添加了更多的系统状态信息
>    - 实现了所有必要的命令处理（start、stop、pause、resume、home、setFeedRate）
>   - 添加了文件上传后的轨迹生成
> 3. 其他改进：
>   - 添加了更好的错误处理
>    - 改进了状态更新的逻辑
>   - 优化了代码结构
> 
>现在web界面的功能应该可以正常工作了。如果你遇到任何问题，请告诉我。

消耗了大概 300 Flow 后，完成了文件上传、模拟轨迹绘制功能



### 3.9 界面调整

由于第一版的界面太简陋，所以找了一个 CNC 界面让其进行模仿，这个是修改后的结果：

引入了 Three 进行三维轨迹绘制，调整了界面中按钮、布局等内容（功能都是空的）

实测可以生成输入的刀路的轨迹，这里是颇为惊喜的

此处主要花了很多时间在反复的调试效果，大概消耗了 300 Flow

![image-20250302015222450](http://raw.gitmirror.com/lusipad/imgur/main/img/image-20250302015222450.png)

### 3.10 文件上传

接下里就开始不给力了，一个文件上传功能，在主页中反复失败，不管怎么调整都没用；但是让他在一个单独页面做就没有问题。**主页已经很大了，看来 AI 在处理大型的情况，能力下降了**

最终 AI 通过重写主页来解决了这个问题。

但是后面调整其他功能的时候，也出现了该功能失灵时不灵的情况！

反复处理，消耗了大概 300 Flow



### 3.11 状态显示

此时界面显示的状态都不是实时的，所以需要让其和 C++ 后端联系起来。

此处大概消耗了 300 Flow，但是还是没完成（中间版本的时候可用，后续又被其改坏了）



### 3.12 真实轨迹绘制

之前项目中的轨迹是假的，是由 C++ 后端生成的假数据，此时计划接入到真实的解析、规划、插补来绘制轨迹。

在经过 N 轮沟通，消耗了超过 500 Flow 后，仍然没有能够绘制出轨迹。由于 Pro 会员的已经用完了，暂时告一段落，先将进度记录下来。



## 4. 小结

虽然本次开发最终未能达到期望的效果，但是对于 AI 的能力边界有了一个初步的认知：模块级别。从验证的结果来看，大部分单模块的开发都可以做得比较好，而跨模块或者上下文变长，就很难处理，反复验证也是失败告终。所以我们在使用 AI 进行项目开发的时候，还是以逐步分解，将其限制到模块级更加合适。

个人主观打分的话：

- 需求分析能力 9
- 项目规划能力 8
- 工程能力 6
  - CMake 项目构建和使用 5
  - web 项目 8
- 开发能力 8
  - C++ 模块开发 8
  - C++ 单元测试 7
  - 小型 web 开发 10
  - 大型 web 开发 6
- 调试能力
  - Lint 处理 10
  - 编译错误处理 9
  - 功能调试 3
