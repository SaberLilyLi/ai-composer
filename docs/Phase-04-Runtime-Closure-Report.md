# Phase-04 Runtime Closure Report

## 阶段信息

- 阶段名称：Phase-04 Runtime Closure
- 目标：统一 Runtime 主链，消除双轨制，为 Phase-05 Enterprise SDK 做准备
- 范围限制：
  - 不开发视频生成
  - 不开发数字人
  - 不开发音乐生成
  - 不开发 Plugin System
  - 不开发 Schema System
  - 不开发 Workspace Factory

## Runtime Architecture Review

### 当前 Runtime 链路

当前主链已经统一为：

```text
AiComposer
  -> AgentConversationWorkspace
  -> useAgentConversationController
  -> ConversationRuntime / WorkflowRuntime
  -> ProviderRegistry
  -> Provider
```

### 当前 Workspace 链路

React Workspace：

```text
AgentConversationWorkspace
  -> ConversationView
  -> WorkflowTimeline
  -> AiComposer
  -> useAgentConversationController
  -> ConversationRuntime / WorkflowRuntime
```

Vue Workspace：

```text
AgentConversationWorkspace (Vue)
  -> ConversationView (Vue)
  -> WorkflowTimeline (Vue)
  -> AiComposer (Vue)
  -> ConversationRuntime / WorkflowRuntime
```

### 当前 Provider 链路

当前 Provider 主链分两层：

```text
Runtime
  -> ProviderRegistry
  -> RuntimeProviderBundle
  -> LegacyChatProvider / LegacyImageProvider
  -> GPTProvider (workflowAnalyzer / promptOptimizer)
```

说明：

- `chat` 执行主链走 `LegacyChatProvider`
- `image` 执行主链走 `LegacyImageProvider`
- `workflow analyze / prompt optimize` 走 `GPTProvider`
- 当没有 API Key 时自动回退到 `MockChatProvider / MockImageProvider`

### 当前 Legacy 链路

Legacy 已从“散落在 Workspace/controller 里直接调用”收口为集中式适配层：

```text
packages/core/src/legacy/LegacyAdapter.ts
  -> requestAgentChat()
  -> requestAgentImage()
```

### Main Runtime 与 Legacy Runtime 划分

属于 Main Runtime：

- `ConversationRuntime`
- `WorkflowRuntime`
- `ProviderRegistry`
- `RuntimeEventBus`
- `createRuntimeProviderBundle`
- React `AgentConversationWorkspace`
- Vue `AgentConversationWorkspace`

属于 Legacy Runtime：

- `agentRuntime.ts`
- `requestAgentChat()`
- `requestAgentImage()`
- `LegacyChatProvider`
- `LegacyImageProvider`

结论：

> Legacy 能力仍保留，但已不再直接暴露给 Workspace 主链，而是通过 `LegacyAdapter` 进入 Runtime 主链。

## 新增文件

- `packages/core/src/legacy/LegacyAdapter.ts`
- `packages/core/src/runtimeProviders.ts`
- `packages/core/src/LegacyAdapter.test.ts`
- `packages/core/src/RuntimeClosure.test.ts`
- `packages/core/src/StreamingIntegration.test.ts`
- `packages/react/src/components/WorkspaceRuntimeIntegration.test.tsx`
- `docs/Phase-04-Runtime-Closure-Report.md`

## 修改文件

- `packages/shared/src/types/provider.ts`
- `packages/core/src/ConversationRuntime.ts`
- `packages/core/src/ProviderRegistry.ts`
- `packages/core/src/WorkflowEngine.ts`
- `packages/core/src/WorkflowRuntime.ts`
- `packages/core/src/agentRuntime.ts`
- `packages/core/src/index.ts`
- `packages/core/src/ProviderCapability.test.ts`
- `packages/react/src/controllers/useAgentConversationController.ts`
- `packages/react/src/components/AgentConversationWorkspace.tsx`
- `packages/vue/src/index.ts`

## 删除文件

- 无

## Runtime 主链图

```text
AiComposer
  -> Workspace Controller
  -> ConversationRuntime (chat)
  -> WorkflowRuntime (image / workflow)
  -> ProviderRegistry
  -> RuntimeProviderBundle
  -> LegacyAdapter / GPTProvider / MockProvider
```

## Legacy 收口情况

已完成：

- `requestAgentChat` / `requestAgentImage` 不再作为 Workspace 直接调用入口
- Legacy 能力被集中进 `LegacyAdapter`
- `LegacyChatProvider`、`LegacyImageProvider` 以 Provider 方式挂入 Runtime

未删除但保留：

- `agentRuntime.ts`
- 旧 helper API

当前状态判断：

> Legacy 已收口为兼容层，不再是 Workspace 主链。

## Workspace 收口情况

### React

已完成：

- `AgentConversationWorkspace` 不再直接请求 Provider
- `useAgentConversationController` 不再直接请求 `requestAgentImage` / `GPTProvider`
- `chat` 通过 `ConversationRuntime`
- `image` 通过 `WorkflowRuntime`
- Workspace 只消费 Runtime state，不再手动维护主流程消息和步骤

### Vue

已完成：

- 新增 Vue `AgentConversationWorkspace`
- Vue Workspace 走 `ConversationRuntime / WorkflowRuntime`
- 具备 chat / image mode、reset、stop、runtime 驱动的 message / step 展示

限制：

- Vue `AiComposer` 仍是基础版本
- Vue 样式与 React 不完全一致
- Vue 输入层交互仍弱于 React

## ConversationRuntime 能力

本次完成后统一负责：

- chat 执行
- streaming state
- message update
- message retry
- message state
- abort

已增强：

- runtime state 在 streaming 中包含即时消息快照
- 新增 `retry()`
- 新增 `onAbort()`

## WorkflowRuntime 能力

本次完成后统一负责：

- workflow execute
- workflow retry
- workflow abort
- workflow state
- user / assistant message 记录
- step progress

已增强：

- `runPrompt()` 支持 `messageAttachments`
- `runPrompt()` 支持 image generation options
- assistant 最终图片结果可直接写入 message attachments

## Streaming 能力

当前状态：

- `Provider -> ConversationRuntime -> ConversationView` 链路已打通
- `ConversationRuntime` 能把 streaming message 写入 runtime state
- `ConversationView` 可显示 runtime 产出的 streaming 消息
- `StreamingIntegration.test.ts` 已验证链路

限制：

- 当前真实 `GPTProvider` 仍未实现真实远端 token streaming
- 当前 streaming 完整链路主要由 runtime contract 和 mock/stream-capable provider 验证

## Abort 能力

已统一：

- `ConversationRuntime.abort()`
- `WorkflowRuntime.abort()`
- Workspace `Stop` 统一调用 runtime abort

结果：

- Workspace、Runtime、Workflow 链路已统一支持 cancel

## Retry 能力

已统一：

- `ConversationRuntime.retry()`
- `WorkflowRuntime.retryWorkflow()`
- `WorkflowRuntime.retryStep()`

UI 可直接调用：

- React Workspace 已暴露：
  - `Retry`
  - `Retry Workflow`
  - `Retry Step`

## ProviderCapability 完善情况

本次增强后支持：

- `provider`
- `providerName`
- `model`
- `supports`
- `supportedSteps`
- `attachments`
- `streaming`
- `maxImages`
- `maxFiles`

并且：

- `ProviderRegistry` 会标准化 capability
- `WorkflowRuntime` 通过 `ProviderRegistry.getProviderForStep()` 自动选 Provider

## Vue 对齐情况

对齐完成项：

- `ConversationView`
- `WorkflowTimeline`
- `AgentConversationWorkspace`
- Runtime 主链一致

未完全对齐项：

- Vue `AiComposer` 仍是轻量实现
- 上传 / action options / rich interaction 仍未达到 React 等级

结论：

> Vue 已完成 Runtime 主链对齐，但尚未达到 React 交互能力对齐。

## 测试

新增测试：

- `LegacyAdapter.test.ts`
- `RuntimeClosure.test.ts`
- `StreamingIntegration.test.ts`
- `WorkspaceRuntimeIntegration.test.tsx`

执行结果：

- `pnpm.cmd --filter @company/ai-composer-shared build`
- `pnpm.cmd --filter @company/ai-composer-providers build`
- `pnpm.cmd --filter @company/ai-composer-core build`
- `pnpm.cmd --filter @company/ai-composer-core test`
- `pnpm.cmd --filter @company/ai-composer build`
- `pnpm.cmd --filter @company/ai-composer test`
- `pnpm.cmd --filter @company/ai-composer-vue build`
- `pnpm.cmd --filter @company/ai-composer-playground build`

结果：

- Core build：通过
- Core test：通过
- React build：通过
- React test：通过
- Vue build：通过
- Playground build：通过

## 技术债

当前仍存在的技术债：

1. `agentRuntime.ts` 仍存在
   - 但已从主链退出，作为兼容层保留

2. 真实远端 streaming 尚未落地到 `GPTProvider`
   - 当前 runtime contract 已打通
   - 但真实生产级 token stream 仍不是最终版

3. Vue 输入层仍弱于 React
   - Runtime 对齐已完成
   - 输入体验对齐未完成

4. Runtime 状态在 Workspace 中仍有缓存镜像
   - 但已经是“消费 runtime state”
   - 不再是手动拼装主流程消息

## Phase-05 准入评估

### 当前判断

本次收口后：

> **Phase-04 完成度提升到约 92%-95%。**

理由：

- Runtime 主链已统一
- Workspace 不再直接调用 Provider / helper
- Legacy 已集中收口
- chat / image 都走 Runtime
- abort / retry / step progress / streaming state 已形成主链
- Vue 已接入 Runtime 主链

### 是否允许进入 Phase-05

结论：

> **可以进入 Phase-05 Enterprise SDK。**

但进入条件是：

- 把 `agentRuntime.ts` 明确标记为 legacy compatibility layer
- Phase-05 不再回退到双轨执行模式
- 企业级配置化、Schema、Factory、Plugin System 必须建立在当前统一 Runtime 主链之上

## 最终结论

本次 Phase-04 Runtime Closure 已达到预期目标：

- 已统一 Runtime 主链
- 已消除 Workspace 层双轨制
- 已建立 Legacy 集中兼容层
- 已完成 React / Vue 的 Runtime 主链收口
- 已为 Phase-05 Enterprise SDK 做好基础准备

最终判断：

> **允许进入 Phase-05 Enterprise SDK。**
