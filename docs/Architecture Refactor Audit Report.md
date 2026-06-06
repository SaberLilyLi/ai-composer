# AI Composer 架构重构审计报告

# 第一部分：本次改动概览

## 新增目录

* `docs/`
* `packages/`
* `packages/core/`
* `packages/core/src/`
* `packages/core/src/plugins/`
* `packages/providers/`
* `packages/providers/src/`
* `packages/react/`
* `packages/react/src/`
* `packages/react/src/adapters/`
* `packages/react/src/components/`
* `packages/react/src/core/`
* `packages/react/src/plugins/`
* `packages/react/src/styles/`
* `packages/shared/`
* `packages/shared/src/`
* `packages/vue/`
* `packages/vue/src/`
* `packages/playground/`
* `packages/playground/src/`

## 新增文件

* `pnpm-workspace.yaml`
* `tsconfig.base.json`
* `docs/AI Composer SDK 架构设计文档.md`
* `docs/Migration Guide.md`
* `packages/shared/package.json`
* `packages/shared/tsconfig.json`
* `packages/shared/src/composer.ts`
* `packages/shared/src/theme.ts`
* `packages/shared/src/workflow.ts`
* `packages/shared/src/index.ts`
* `packages/providers/package.json`
* `packages/providers/tsconfig.json`
* `packages/providers/src/index.ts`
* `packages/core/package.json`
* `packages/core/tsconfig.json`
* `packages/core/tsconfig.build.json`
* `packages/core/vitest.config.ts`
* `packages/core/src/index.ts`
* `packages/core/src/ComposerCore.ts`
* `packages/core/src/ContextManager.ts`
* `packages/core/src/EventBus.ts`
* `packages/core/src/Store.ts`
* `packages/core/src/UploadManager.ts`
* `packages/core/src/types.ts`
* `packages/core/src/agentRuntime.ts`
* `packages/core/src/ConversationEngine.ts`
* `packages/core/src/HistoryManager.ts`
* `packages/core/src/PluginManager.ts`
* `packages/core/src/ProviderRegistry.ts`
* `packages/core/src/PromptParser.ts`
* `packages/core/src/WorkflowEngine.ts`
* `packages/core/src/WorkflowRuntime.ts`
* `packages/core/src/vite-env.d.ts`
* `packages/core/src/plugins/CommandPlugin.ts`
* `packages/core/src/plugins/MentionPlugin.ts`
* `packages/core/src/plugins/UploadPlugin.ts`
* `packages/core/src/ComposerCore.test.ts`
* `packages/core/src/agentRuntime.test.ts`
* `packages/core/src/PromptParser.test.ts`
* `packages/core/src/WorkflowEngine.test.ts`
* `packages/react/package.json`
* `packages/react/tsconfig.json`
* `packages/react/tsconfig.build.json`
* `packages/react/vite.config.ts`
* `packages/react/vitest.config.ts`
* `packages/react/tailwind.config.ts`
* `packages/react/src/index.ts`
* `packages/react/src/adapters/react.ts`
* `packages/react/src/components/*`
* `packages/react/src/core/*`
* `packages/react/src/plugins/*`
* `packages/react/src/styles/*`
* `packages/vue/package.json`
* `packages/vue/tsconfig.json`
* `packages/vue/src/index.ts`
* `packages/playground/package.json`
* `packages/playground/tsconfig.json`
* `packages/playground/vite.config.ts`
* `packages/playground/tailwind.config.ts`
* `packages/playground/index.html`
* `packages/playground/src/App.tsx`
* `packages/playground/src/main.tsx`

构建过程中还产生了以下不应长期保留在源码目录的生成文件：

* `packages/shared/src/*.js`
* `packages/shared/src/*.d.ts`
* `packages/shared/src/*.d.ts.map`
* `packages/core/vitest.config.js`
* `packages/core/vitest.config.d.ts`
* `packages/core/vitest.config.d.ts.map`

## 修改文件

* `README.md`
* `package.json`
* `pnpm-lock.yaml`
* `tailwind.config.ts`
* `tsconfig.json`
* `src/components/AgentConversationWorkspace.tsx`
* `src/components/AgentConversationWorkspace.stories.tsx`

说明：`git status` 显示以上两个 `src/components/*` 文件已修改，但这部分是否完全属于本次架构重构，需要结合之前的工作记录再确认。

## 删除文件

* 无

## 本次重构完成度

* 架构骨架完成度：约 `65%`
* 可运行工程完成度：约 `70%`
* 文档要求完整实现度：约 `45%`
* 生产可用 SDK 完成度：约 `35%`

原因：monorepo、Core、Provider 接口、React 包、Vue 包边界、Playground、README、Migration Guide 已建立；但 React 展示层组件缺失，Vue 仍是契约/stub，Provider 还没有真实 GPT5.5 / GPT-Image-2 接入，Workflow 执行器仍是早期基础实现。

# 第二部分：项目最新目录结构

```text
ai-composer/
├── .env.example
├── .gitattributes
├── .gitignore
├── ai-composer-rules.md
├── ai-composer-skill.md
├── AI-Composer-完整版技术方案.md
├── image-upload-visual-redesign-plan.md
├── package.json
├── phase-01-mvp-plan.md
├── phase-02-upload-plan.md
├── phase-03-mention-command-plan.md
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── postcss.config.js
├── preview.html
├── README.md
├── tailwind.config.ts
├── test.html
├── test_fixed.html
├── tsconfig.base.json
├── tsconfig.build.json
├── tsconfig.json
├── vite.config.ts
├── docs/
│   ├── AI Composer SDK 架构设计文档.md
│   ├── Architecture Refactor Audit Report.md
│   └── Migration Guide.md
├── packages/
│   ├── core/
│   │   ├── package.json
│   │   ├── tsconfig.build.json
│   │   ├── tsconfig.json
│   │   ├── vitest.config.d.ts
│   │   ├── vitest.config.d.ts.map
│   │   ├── vitest.config.js
│   │   ├── vitest.config.ts
│   │   └── src/
│   │       ├── agentRuntime.test.ts
│   │       ├── agentRuntime.ts
│   │       ├── ComposerCore.test.ts
│   │       ├── ComposerCore.ts
│   │       ├── ContextManager.ts
│   │       ├── ConversationEngine.ts
│   │       ├── EventBus.ts
│   │       ├── HistoryManager.ts
│   │       ├── index.ts
│   │       ├── PluginManager.ts
│   │       ├── PromptParser.test.ts
│   │       ├── PromptParser.ts
│   │       ├── ProviderRegistry.ts
│   │       ├── Store.ts
│   │       ├── types.ts
│   │       ├── UploadManager.ts
│   │       ├── vite-env.d.ts
│   │       ├── WorkflowEngine.test.ts
│   │       ├── WorkflowEngine.ts
│   │       ├── WorkflowRuntime.ts
│   │       └── plugins/
│   │           ├── CommandPlugin.ts
│   │           ├── MentionPlugin.ts
│   │           └── UploadPlugin.ts
│   ├── playground/
│   │   ├── index.html
│   │   ├── package.json
│   │   ├── tailwind.config.ts
│   │   ├── tsconfig.json
│   │   ├── vite.config.ts
│   │   └── src/
│   │       ├── App.tsx
│   │       └── main.tsx
│   ├── providers/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       └── index.ts
│   ├── react/
│   │   ├── package.json
│   │   ├── tailwind.config.ts
│   │   ├── tsconfig.build.json
│   │   ├── tsconfig.json
│   │   ├── vite.config.ts
│   │   ├── vitest.config.ts
│   │   └── src/
│   │       ├── index.ts
│   │       ├── adapters/
│   │       │   └── react.ts
│   │       ├── components/
│   │       │   ├── AgentConversationWorkspace.stories.tsx
│   │       │   ├── AgentConversationWorkspace.tsx
│   │       │   ├── AiComposer.stories.tsx
│   │       │   ├── AiComposer.test.tsx
│   │       │   ├── AiComposer.tsx
│   │       │   ├── AttachButton.tsx
│   │       │   ├── AttachmentItem.tsx
│   │       │   ├── AttachmentList.tsx
│   │       │   ├── CommandPanel.tsx
│   │       │   ├── ComposerActions.tsx
│   │       │   ├── ComposerImageTray.tsx
│   │       │   ├── ComposerOverlayLayer.tsx
│   │       │   ├── ComposerStatusSlot.tsx
│   │       │   ├── ComposerTextarea.tsx
│   │       │   ├── MentionPanel.tsx
│   │       │   ├── SendButton.tsx
│   │       │   └── StopButton.tsx
│   │       ├── core/
│   │       │   ├── agentRuntime.ts
│   │       │   ├── ComposerCore.ts
│   │       │   ├── ContextManager.ts
│   │       │   ├── EventBus.ts
│   │       │   ├── Store.ts
│   │       │   ├── types.ts
│   │       │   └── UploadManager.ts
│   │       ├── plugins/
│   │       │   ├── CommandPlugin.ts
│   │       │   ├── MentionPlugin.ts
│   │       │   └── UploadPlugin.ts
│   │       └── styles/
│   │           ├── index.css
│   │           └── theme.css
│   ├── shared/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── composer.d.ts
│   │       ├── composer.d.ts.map
│   │       ├── composer.js
│   │       ├── composer.ts
│   │       ├── index.d.ts
│   │       ├── index.d.ts.map
│   │       ├── index.js
│   │       ├── index.ts
│   │       ├── theme.d.ts
│   │       ├── theme.d.ts.map
│   │       ├── theme.js
│   │       ├── theme.ts
│   │       ├── workflow.d.ts
│   │       ├── workflow.d.ts.map
│   │       ├── workflow.js
│   │       └── workflow.ts
│   └── vue/
│       ├── package.json
│       ├── tsconfig.json
│       └── src/
│           └── index.ts
└── src/
    ├── index.ts
    ├── vite-env.d.ts
    ├── adapters/
    │   ├── react.ts
    │   └── vue.ts
    ├── components/
    │   ├── AgentConversationWorkspace.stories.tsx
    │   ├── AgentConversationWorkspace.tsx
    │   ├── AiComposer.stories.tsx
    │   ├── AiComposer.test.tsx
    │   ├── AiComposer.tsx
    │   ├── AttachButton.tsx
    │   ├── AttachmentItem.tsx
    │   ├── AttachmentList.tsx
    │   ├── CommandPanel.tsx
    │   ├── ComposerActions.tsx
    │   ├── ComposerImageTray.tsx
    │   ├── ComposerOverlayLayer.tsx
    │   ├── ComposerStatusSlot.tsx
    │   ├── ComposerTextarea.tsx
    │   ├── MentionPanel.tsx
    │   ├── SendButton.tsx
    │   └── StopButton.tsx
    ├── core/
    │   ├── agentRuntime.test.ts
    │   ├── agentRuntime.ts
    │   ├── ComposerCore.test.ts
    │   ├── ComposerCore.ts
    │   ├── ContextManager.ts
    │   ├── EventBus.ts
    │   ├── Store.ts
    │   ├── types.ts
    │   └── UploadManager.ts
    ├── plugins/
    │   ├── CommandPlugin.ts
    │   ├── MentionPlugin.ts
    │   └── UploadPlugin.ts
    └── styles/
        ├── index.css
        └── theme.css
```

说明：未展开 `node_modules/`、`.git/` 和被忽略的 `dist/`。

# 第三部分：架构检查

## Core层

* `ConversationEngine`：已完成，但属于基础实现。
* `WorkflowEngine`：已完成，但执行能力仍很基础。
* `PromptParser`：已完成，但目前是规则/关键词启发式解析，不是模型驱动解析。
* `Types`：已完成，分布在 `packages/shared/src/*` 和 `packages/core/src/types.ts`。

结论：Core 层已建立，基础能力完成；但距离完整 AI Studio SDK Core 还有差距。

## Provider层

* `ChatProvider`：已完成，存在接口和 `MockChatProvider`。
* `ImageProvider`：已完成，存在接口、`GPTImageProvider` 包装类和 `MockImageProvider`。
* `VideoProvider`：已完成接口，未完成真实实现。
* `AvatarProvider`：已完成接口，未完成真实实现。

结论：Provider 层接口已完成；真实模型 Provider 未完成。

## React层

* `AiComposer`：已完成。
* `ConversationView`：未完成。当前消息展示逻辑内嵌在 `AgentConversationWorkspace` 中。
* `WorkflowTimeline`：未完成。当前 React 包没有独立工作流时间线组件。

结论：React 输入层完成；展示层和工作流层组件未拆出。

## Vue层

* `AiComposer`：未完成真实组件。当前只有 adapter contract / placeholder。
* `ConversationView`：未完成真实组件。当前只有 contract。
* `WorkflowTimeline`：未完成真实组件。当前只有 contract。

结论：Vue 包边界已建立，但 Vue 渲染能力未完成。

# 第四部分：组件职责检查

## AiComposer当前负责什么？

当前 `AiComposer` 负责：

* 文本输入
* textarea 自动高度
* Enter 发送
* Shift+Enter 换行
* Send / Stop 操作
* 附件上传入口
* 图片附件展示
* Mention 面板
* Command 面板
* action options 选择
* 绑定 `ComposerCore`
* 注册 Upload / Mention / Command 插件
* 向外发出 `onSend`、`onStop`、`onChange`、附件变化等事件

判断：它基本符合“输入层”职责，但已经偏大。附件、Mention、Command 仍可以接受为 composer 输入能力；但 UI 复杂度后续需要继续拆小。

## ConversationView当前负责什么？

React 层没有独立 `ConversationView`。

当前 conversation 展示职责由 `AgentConversationWorkspace` 内联承担，包括：

* 渲染 user / assistant / system message
* 渲染附件预览
* 渲染生成图片
* 渲染模型信息

判断：不符合职责分离。展示层应该独立为 `ConversationView`，而不是和 workspace、运行时请求、状态管理混在一起。

## WorkflowTimeline当前负责什么？

React 层没有独立 `WorkflowTimeline`。

Core 层已有 `WorkflowEngine` / `WorkflowRuntime`，但前端没有对应工作流时间线展示组件。

判断：工作流层 UI 未完成。当前只具备 Core 执行结构，没有完成用户可见的 workflow 状态展示。

## 是否符合职责分离原则？

* 输入层：部分符合。`AiComposer` 可作为输入层，但功能较重。
* 展示层：未符合。`ConversationView` 未拆出。
* 工作流层：未符合。`WorkflowTimeline` 未拆出。
* Workspace 组合层：部分符合。`AgentConversationWorkspace` 当前承担了过多展示和请求职责。

总体结论：Core 与 React package 的边界初步建立，但组件内部职责分离还没有完成。

# 第五部分：兼容性检查

## 当前是否兼容 React？

评级：低风险

说明：React 包可构建、可测试，`AiComposer` 和 `AgentConversationWorkspace` 可用。主要风险是旧 `src/` 与新 `packages/react/` 并存，后续需要统一入口，避免双实现漂移。

## 当前是否兼容 Vue？

评级：高风险

说明：Vue 包存在，但只有 adapter contract，没有真实 Vue 组件实现，也没有 Vue 测试、Storybook 或 playground 验证。

## 当前是否兼容 GPT5.5？

评级：高风险

说明：存在 `GPTProvider` 类名和接口，但没有真实 GPT5.5 API 接入、模型配置、鉴权、流式输出、错误处理、工具调用或 workflow analyze 的真实实现。

## 当前是否兼容 GPT-Image-2？

评级：高风险

说明：存在 `GPTImageProvider` 包装类，但没有真实 GPT-Image-2 API 协议实现。当前 `AgentConversationWorkspace` 仍偏向 DashScope/Qwen/Wan runtime。

## 未来扩展 Flux

评级：中风险

说明：已有 `ImageProvider` 接口，可扩展；但缺少 provider 注册规范、能力元数据、参数 schema 和结果统一结构。

## 未来扩展 即梦

评级：中风险

说明：可通过 `ImageProvider` / `VideoProvider` 扩展，但当前没有供应商适配模板和鉴权抽象。

## 未来扩展 可灵

评级：中风险

说明：视频生成接口存在，但 workflow step 与结果展示组件不足。

## 未来扩展 Runway

评级：中风险

说明：可走 `VideoProvider`，但缺少异步任务轮询、任务状态、取消、失败重试等视频类 provider 通用机制。

## 未来扩展 Veo

评级：中风险

说明：同视频类能力，Provider 接口有基础入口，但真实生产接入还需要任务生命周期设计。

## 未来扩展 数字人

评级：中风险

说明：已有 `AvatarProvider` 和 `avatar_generate` / `avatar_talking_video` step type，但没有 Avatar UI、资产结构、任务状态和结果展示。

## 未来扩展 音乐生成

评级：高风险

说明：当前没有 `MusicProvider`，没有 `music_generate` workflow step type，也没有音频结果展示组件。需要新增能力边界。

# 第六部分：下一阶段开发建议

## P0

必须优先完成：

* 清理架构迁移遗留：决定是否保留根目录 `src/`，避免旧单包和新 packages 双轨维护。
* 移除或迁移源码目录中的生成产物：例如 `packages/shared/src/*.js`、`*.d.ts`、`*.d.ts.map`、`packages/core/vitest.config.js` 等。
* 拆出 React `ConversationView`。
* 拆出 React `WorkflowTimeline`。
* 将 `AgentConversationWorkspace` 改成组合层，只组合 `ConversationView + WorkflowTimeline + AiComposer`。
* 明确 Provider 真实接入规范：鉴权、baseURL、模型名、请求参数、错误结构、返回结构。
* 实现 GPT5.5 Provider 的真实接口，至少覆盖 chat / optimizePrompt / analyzeWorkflow。

## P1

建议完成：

* 实现 GPT-Image-2 Provider。
* 完善 `WorkflowEngine`：支持 step 状态订阅、失败重试、取消、回滚、异步任务状态。
* 为 Provider 增加能力声明：支持的 workflow step、输入 schema、输出 schema。
* 增加 React `ConversationView` 测试和 Storybook。
* 增加 React `WorkflowTimeline` 测试和 Storybook。
* 建立 Vue 真实组件实现计划，不要长期停留在 contract。
* 将 `agentRuntime` 从 Core 中重新评估：目前它包含 fetch/API 请求逻辑，可能更适合 Provider 或 Playground，而不是纯 Core。

## P2

未来扩展：

* 视频生成 Provider：Runway / Veo / 可灵。
* 图像 Provider：Flux / 即梦。
* 数字人 Provider：Avatar create / talking video。
* 音乐生成：新增 `MusicProvider`、`music_generate` workflow step type、音频展示组件。
* SSE / WebSocket transport。
* Workflow 可视化编辑器。
* 多 workspace：ChatWorkspace / ImageWorkspace / VideoWorkspace / AvatarWorkspace / AgentWorkspace。
* CI/CD、发布版本策略、包导出稳定性检查。

# 第七部分：最终评分

## 可扩展性

评分：`7/10`

原因：monorepo、Core、Provider、Workflow、Shared types 已经搭起来，方向正确。但 Provider 能力声明、异步任务模型、真实模型实现还不完整。

## 可维护性

评分：`6/10`

原因：包边界比之前清晰很多，但当前存在旧 `src/` 和新 `packages/*` 双结构并存，且有构建产物进入源码目录的问题。后续若不清理，会增加维护成本。

## React/Vue复用性

评分：`5/10`

原因：React 可用，Vue 只有边界和 contract。Core 复用方向是对的，但真正的双框架复用尚未完成。

## 未来AI能力扩展性

评分：`6/10`

原因：Chat/Image/Video/Avatar/Agent 的 Provider 接口已出现，Workflow step type 也覆盖了一批 AI 能力。但 GPT5.5、GPT-Image-2、视频、数字人都还没有真实接入，音乐生成也缺少类型和 Provider。

## 总体评分

评分：`6/10`

原因：这次重构完成了“架构地基”和“可运行 workspace”，方向正确，工程也能 build/test。主要不足是：React 展示层未拆、Vue 未真实实现、Provider 仍是接口/包装层、Workflow 执行器偏 MVP、旧结构与新结构并存。整体适合作为下一阶段 SDK 化开发的起点，但还不能视为完整架构落地。
