# Product Positioning Review

## Executive Conclusion

当前项目不应被定位为 `React Component Library`，也不应被定位为单纯的 `React Chat Component`。

基于当前代码、docs、SDK 包结构、core runtime、provider、schema、factory、plugin、CLI 和 documentation site 的实际能力，项目真实定位应为：

> 企业级 AI 平台 SDK。

在候选项中，最终判断为：

1. A. `React Component Library`: 不成立
2. B. `React/Vue Component Library`: 不充分
3. C. `AI SDK`: 成立，但描述偏泛
4. D. `AI Studio SDK`: 成立，是当前包名和产品层定位
5. E. `企业级 AI 平台 SDK`: 最准确

推荐定位：

> 以 `AI Studio SDK` 为产品名称，以 `企业级 AI 平台 SDK` 作为真实战略定位。

## 1. 项目边界分析

### 当前项目包含的能力

当前项目包含：

1. `ConversationRuntime`
2. `WorkflowRuntime`
3. `ProviderRegistry`
4. `PluginManager`
5. `Schema`
6. `WorkspaceFactory`
7. `createAiStudio`
8. React SDK
9. Vue SDK
10. CLI
11. Documentation Site
12. JSON Schema export
13. Plugin permission and sandbox foundation
14. SDK packaging umbrella package
15. Examples and benchmark

这些能力已经明显超出普通 React 组件库。

### 为什么不是普通 React 组件库

普通 React 组件库通常只提供：

1. UI 组件
2. props 类型
3. 样式
4. 少量 hooks
5. Storybook 或 demo

当前项目还提供：

1. AI runtime orchestration
2. provider registration and invocation
3. workflow execution
4. schema-driven configuration
5. workspace creation factory
6. enterprise plugin lifecycle
7. permission and sandbox concepts
8. React and Vue adapters
9. CLI scaffolding
10. documentation site generation

因此，把项目理解为 `React Component Library` 会低估核心资产，也会导致错误的发布、迁移和商业化策略。

### 当前架构的真实层级

当前架构不是：

```text
React App
└── Chat Component
```

而是：

```text
AI Studio SDK
├── Enterprise Config
├── Schema
├── Runtime
├── Provider
├── Workflow
├── Plugin
├── Framework SDK
├── CLI
└── Docs
```

### AiComposer 的真实位置

`AiComposer` 是重要入口，但不是项目整体定位。

它在项目中属于：

1. AI 输入体验组件
2. SDK 的 UI 入口之一
3. React/Vue framework layer 的可复用模块

它不代表整个项目边界。

如果只用 `AiComposer` 来定义项目，会忽略 `core`、`runtime`、`provider`、`schema`、`factory`、`plugin`、`CLI` 和 `docs-site` 的价值。

## 2. 目标用户分析

### React 开发者

React 开发者是目标用户之一，但不是唯一目标用户。

他们主要消费：

1. `@company/ai-studio-sdk/react`
2. `AiStudioProvider`
3. `AiComposer`
4. `ConversationView`
5. `WorkflowTimeline`
6. `useAiStudio`

他们的诉求是快速在 React 项目中接入 AI 输入、对话展示和工作流状态展示。

### Vue 开发者

Vue 开发者也是目标用户之一。

他们主要消费：

1. `@company/ai-studio-sdk/vue`
2. `AiStudioProvider`
3. `AiComposer`
4. `ConversationView`
5. `WorkflowTimeline`
6. `useAiStudio`

Vue 支持说明项目不是单一 React 项目。

### 业务项目团队

业务项目团队是关键目标用户。

他们关注：

1. 如何接入输入框
2. 如何接入消息区
3. 如何接入图片结果区
4. 如何保留现有业务 UI 和业务逻辑
5. 如何替换 runtime/provider 能力
6. 如何复用工作流能力

典型业务项目包括：

1. `CarCreativeWorkspace`
2. `KnowledgeWorkspace`
3. `AvatarWorkspace`
4. 营销内容生成工作台
5. 图像生成工作台
6. 企业知识问答工作台

### AI 应用团队

AI 应用团队也是核心用户。

他们关注：

1. model provider 接入
2. chat runtime
3. image workflow
4. prompt orchestration
5. workflow step tracking
6. retry and abort
7. streaming and async execution

这类用户使用项目时，不只关心 UI，而是关心 AI 应用运行链路。

### 企业内部平台团队

企业内部平台团队是最重要的长期目标用户。

他们关注：

1. schema-driven workspace
2. plugin governance
3. provider governance
4. CLI scaffolding
5. documentation
6. package release
7. cross-framework integration
8. internal platform standardization

这说明项目的上层定位应是企业级 AI 平台 SDK，而不是组件库。

### 目标用户结论

当前项目未来使用者不是单一 React 开发者，而是：

1. React 开发者
2. Vue 开发者
3. 业务项目团队
4. AI 应用团队
5. 企业内部平台团队

其中最核心的目标用户是：

> 企业内部 AI 应用平台团队和业务项目接入团队。

## 3. 项目定位

### 一句话定位

> AI Studio SDK 是一个面向企业 AI 应用构建的跨框架 SDK，提供输入组件、对话视图、工作流运行时、Provider 接入、Schema 配置、Workspace Factory、Plugin 扩展、CLI 和文档体系。

### 技术定位

> 一个 TypeScript-first 的企业 AI SDK，封装 AI runtime、provider、workflow、schema、plugin 和 React/Vue UI adapters，用于标准化企业 AI 应用的构建与迁移。

### 产品定位

> 一个 AI Studio 应用构建套件，帮助业务团队快速组合 AI 输入、对话、图片生成、工作流状态和企业配置能力。

### 商业定位

> 一个企业内部 AI 平台 SDK，用于统一多业务线 AI 应用的技术底座、交互标准、Provider 接入、插件治理和交付规范。

## 4. 能力层级图

```text
AI Studio SDK
├── SDK Package
│   ├── @company/ai-studio-sdk
│   ├── @company/ai-studio-sdk/core
│   ├── @company/ai-studio-sdk/react
│   └── @company/ai-studio-sdk/vue
├── Core
│   ├── ComposerCore
│   ├── Store
│   ├── EventBus
│   ├── ContextManager
│   ├── UploadManager
│   └── HistoryManager
├── Runtime
│   ├── ConversationRuntime
│   ├── WorkflowRuntime
│   ├── ConversationEngine
│   ├── WorkflowEngine
│   └── RuntimeEventBus
├── Provider
│   ├── ProviderRegistry
│   ├── provider interfaces
│   ├── GPTProvider
│   ├── GPTImageProvider
│   └── mock providers
├── Plugin
│   ├── PluginManager
│   ├── plugin lifecycle
│   ├── plugin manifest
│   ├── plugin permission
│   ├── plugin sandbox
│   ├── UploadPlugin
│   ├── MentionPlugin
│   └── CommandPlugin
├── Schema
│   ├── WorkspaceSchema
│   ├── ProviderSchema
│   ├── FeatureSchema
│   ├── ThemeSchema
│   ├── SchemaValidator
│   └── JSON Schema Exporter
├── Factory
│   ├── createAiStudio
│   ├── WorkspaceFactory
│   ├── ChatWorkspace
│   ├── ImageWorkspace
│   └── AgentWorkspace
├── React SDK
│   ├── AiStudioProvider
│   ├── useAiStudio
│   ├── AiComposer
│   ├── ConversationView
│   └── WorkflowTimeline
├── Vue SDK
│   ├── AiStudioProvider
│   ├── useAiStudio
│   ├── AiComposer
│   ├── ConversationView
│   └── WorkflowTimeline
├── CLI
│   ├── ai-studio init
│   ├── workspace schema scaffold
│   ├── provider config scaffold
│   └── ai-studio bootstrap file
├── Documentation
│   ├── DocumentationGenerator
│   ├── docs-site
│   ├── integration guides
│   ├── migration guides
│   └── release checklist
└── Examples
    ├── React examples
    ├── Vue examples
    ├── schema examples
    ├── plugin examples
    └── CLI examples
```

## 5. SDK 与业务项目边界

### 属于 SDK 的能力

以下能力应属于 SDK：

1. `AiComposer`
2. `ConversationView`
3. `WorkflowTimeline`
4. `ConversationRuntime`
5. `WorkflowRuntime`
6. `ProviderRegistry`
7. `GPTProvider`
8. `GPTImageProvider`
9. `PluginManager`
10. `UploadPlugin`
11. `MentionPlugin`
12. `CommandPlugin`
13. `Schema`
14. `SchemaValidator`
15. `WorkspaceFactory`
16. `createAiStudio`
17. React SDK adapter
18. Vue SDK adapter
19. CLI scaffold
20. documentation and integration guides

这些能力属于通用底座，能够跨业务复用。

### 属于业务项目的能力

以下能力应属于业务项目：

1. `CarCreativeWorkspace`
2. `KnowledgeWorkspace`
3. `AvatarWorkspace`
4. 二手车创意生图页面
5. 企业知识库问答页面
6. 品牌营销生成页面
7. 具体业务表单
8. 业务权限
9. 业务路由
10. 业务埋点
11. 业务数据映射
12. 业务审核流
13. 业务结果展示策略

这些能力会随业务域变化，不应该固化为 SDK 核心。

### Workspace 的边界判断

`ChatWorkspace`、`ImageWorkspace`、`AgentWorkspace` 可以保留，但应定位为：

> Reference Implementation。

业务项目推荐方式：

1. 组合 `AiComposer`
2. 组合 `ConversationView`
3. 组合 `WorkflowTimeline`
4. 自行构建业务 Workspace

这样可以避免业务项目被 SDK 的示例 Workspace 反向约束。

## 6. 未来路线评估

### VideoPlugin

结论：

> SDK 层。

原因：

Video 能力属于横向 AI 能力扩展，应以 plugin/provider/runtime capability 的形式进入 SDK。

但具体视频业务页面，例如广告视频生成工作台、短剧生成工作台，应属于业务层。

### AvatarPlugin

结论：

> SDK 层提供能力接口和 plugin 基础，业务层实现具体工作台。

原因：

Avatar 能力既有通用技术链路，也有强业务场景差异。

SDK 应提供：

1. capability contract
2. provider integration
3. workflow runtime support
4. plugin lifecycle support

业务项目负责：

1. 数字人业务流程
2. 角色资产
3. 审核逻辑
4. 行业模板

### AudioPlugin

结论：

> SDK 层。

原因：

Audio generation、speech、music、voice clone 等属于可复用 AI capability。

SDK 可以提供统一 plugin 和 provider 接入，但具体音频产品形态留在业务层。

### MCPPlugin

结论：

> SDK 层，而且优先级较高。

原因：

MCP 是工具接入和 agent tool ecosystem 的基础协议能力，不是某个业务域能力。

它应属于企业 AI 平台 SDK 的扩展底座。

### RAGPlugin

结论：

> SDK 层提供通用 RAG 能力，业务层提供知识域和检索策略。

SDK 应包含：

1. RAG capability contract
2. retriever interface
3. embedding provider contract
4. context injection pipeline
5. citation and source metadata contract

业务层负责：

1. 知识库来源
2. 权限过滤
3. 行业语料
4. 召回策略配置
5. 结果展示规则

### 未来路线总判断

未来插件应按此原则划分：

> 通用 AI capability 属于 SDK 层；具体行业工作台和业务流程属于业务层。

## 7. 最终项目名称建议

### 候选名称评估

#### `@company/ai-composer`

优点：

1. 适合输入框组件
2. 名称短
3. 对 `AiComposer` 友好

问题：

1. 过窄
2. 容易被理解成输入框或聊天组件
3. 无法覆盖 runtime、provider、schema、plugin、CLI 和 docs

结论：

> 不推荐作为最终总包名，可作为 React/Vue 组件实现包或历史内部包名。

#### `@company/ai-studio-sdk`

优点：

1. 与当前 `packages/sdk` 包名一致
2. 能覆盖 UI、runtime、workspace、schema、plugin
3. 产品感强
4. 适合业务团队理解
5. 适合跨 React/Vue 发布

问题：

1. 对“企业平台治理”表达不如 enterprise 命名直接
2. 需要通过文档强调它不是单纯 UI SDK

结论：

> 推荐作为正式产品包名。

#### `@company/enterprise-ai-sdk`

优点：

1. 企业级定位明确
2. 覆盖范围足够大
3. 适合平台团队和长期路线

问题：

1. 名称偏泛
2. 产品识别度弱
3. 与当前 `AI Studio` 工作台概念不够贴合

结论：

> 可作为战略定位或未来平台族名称，不建议替代当前包名。

### 推荐名称

最终推荐：

```text
@company/ai-studio-sdk
```

推荐理由：

1. 已经与当前 `packages/sdk` 一致
2. 能覆盖 React/Vue UI、core runtime、schema、factory、plugin、CLI 和 docs
3. 不会被误解为单一 React 组件库
4. 比 `enterprise-ai-sdk` 更有产品识别度
5. 比 `ai-composer` 更能代表完整项目范围

### 命名层级建议

```text
@company/ai-studio-sdk
├── @company/ai-studio-sdk/core
├── @company/ai-studio-sdk/react
└── @company/ai-studio-sdk/vue
```

历史内部包可以继续存在，但对外推荐统一使用 `@company/ai-studio-sdk`。

## 8. 验收结论

### 明确回答

当前项目不是 React 项目。

当前项目是：

> React + Vue 企业级 AI SDK 项目。

更准确地说：

> 当前项目是一个以 `@company/ai-studio-sdk` 为统一出口的企业级 AI 平台 SDK，包含 React/Vue UI adapters、core runtime、provider、workflow、schema、factory、plugin、CLI 和 documentation site。

### 原因

原因如下：

1. 项目包含 `packages/react` 和 `packages/vue`，不是单一 React 实现。
2. 项目包含 `packages/core`，并提供 runtime、factory、schema、plugin 等非 UI 能力。
3. 项目包含 `packages/providers`，说明 AI provider 接入是核心能力之一。
4. 项目包含 `packages/sdk`，并以 `@company/ai-studio-sdk` 作为 umbrella package。
5. 项目包含 `packages/cli`，说明它具备工程初始化和平台交付能力。
6. 项目包含 `docs-site`，说明它已经进入 SDK 文档和交付体系。
7. Phase-05 明确目标是 Enterprise SDK Foundation。
8. Phase-06 明确目标是 Enterprise Hardening，并补齐 SDK packaging、CLI、docs-site、plugin permission、JSON Schema。
9. `AiComposer`、`ConversationView`、`WorkflowTimeline` 是 SDK 的 UI 模块，不是项目的全部。
10. `ConversationRuntime`、`WorkflowRuntime`、`ProviderRegistry`、`WorkspaceFactory`、`createAiStudio` 这些能力已经超出组件库边界。

### 最终验收判断

本项目应按照以下方式理解和推进：

```text
Primary Positioning:
Enterprise AI Platform SDK

Product Name:
AI Studio SDK

Package Name:
@company/ai-studio-sdk

Framework Support:
React + Vue

Core Value:
standardize enterprise AI app composition through UI modules, runtime, provider, workflow, schema, factory, plugin, CLI, and docs.
```

最终结论：

> 当前项目不是 React Component Library，也不是 React Chat Component。它是 React + Vue 企业级 AI 平台 SDK，`AiComposer` 只是其中的输入体验模块。
