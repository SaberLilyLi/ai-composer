# Phase-04 Runtime Integration Report

## 阶段信息

- 阶段名称：Phase-04 Runtime Integration
- 当前分支：main
- 当前 Commit：ddf10a5
- 完成时间：2026-06-07
- 范围限制：仅 Runtime、Workflow、Provider、Conversation

## Runtime Architecture Review

本阶段前，`AgentConversationWorkspace` 的 UI 组合已经拆分为 `ConversationView`、`WorkflowTimeline`、`AiComposer`，但 React controller 仍直接依赖旧 `agentRuntime`：

- `requestAgentChat()`
- `requestAgentImage()`
- `getAgentRuntimeConfig()`
- `toAttachmentPreviews()`

本阶段后，`packages/react/src/controllers/useAgentConversationController.ts` 不再直接依赖旧 `agentRuntime`，运行链路调整为：

```text
AgentConversationWorkspace
  -> ConversationView
  -> WorkflowTimeline
  -> AiComposer
  -> useAgentConversationController
  -> ConversationRuntime / WorkflowRuntime
  -> ProviderRegistry
  -> GPTProvider / GPTImageProvider
```

旧 `packages/core/src/agentRuntime.ts` 仍保留为历史兼容模块，但 Workspace/controller 已不再调用。

## 新增文件

- `packages/core/src/ConversationRuntime.test.ts`
- `packages/core/src/RuntimeIntegration.test.ts`
- `packages/core/src/Abort.test.ts`
- `packages/core/src/Retry.test.ts`
- `packages/playground/src/RuntimePlayground.tsx`
- `docs/Phase-04-Runtime-Integration-Report.md`

## 修改文件

- `packages/shared/src/workflow.ts`
- `packages/providers/src/types.ts`
- `packages/providers/src/chat/GPTProvider.ts`
- `packages/providers/src/image/GPTImageProvider.ts`
- `packages/providers/src/index.ts`
- `packages/core/src/ProviderRegistry.ts`
- `packages/core/src/WorkflowEngine.ts`
- `packages/core/src/WorkflowRuntime.ts`
- `packages/core/src/ConversationRuntime.ts`
- `packages/core/src/index.ts`
- `packages/react/package.json`
- `packages/react/src/controllers/useAgentConversationController.ts`
- `packages/react/src/components/AgentConversationWorkspace.tsx`
- `packages/react/src/components/ConversationView.tsx`
- `packages/react/src/components/WorkflowTimeline.tsx`
- `packages/playground/package.json`
- `packages/playground/src/App.tsx`
- `pnpm-lock.yaml`

## Runtime 结构

### ConversationRuntime

职责：

- 发送用户消息
- 调用 `ChatProvider.chat()`
- 接收 assistant 响应
- 维护会话状态
- 暴露运行事件
- 支持 abort
- 统一错误状态

事件：

- `onStart`
- `onMessage`
- `onStreaming`
- `onError`
- `onComplete`
- `abort()`

### WorkflowRuntime

职责：

- 接收 prompt
- 调用 `GPTProvider.analyzeWorkflow()` 或 `PromptParser`
- 创建 workflow steps
- 调用 `WorkflowEngine`
- 通过 `ProviderRegistry` 匹配 provider
- 同步 runtime state
- 暴露 step progress
- 支持 abort、step retry、workflow retry

事件：

- `onStart`
- `onStepStart`
- `onStepSuccess`
- `onStepError`
- `onComplete`
- `onAbort`

## Provider 结构

### ProviderRegistry

已支持：

- `registerProvider()`
- `removeProvider()`
- `getProvider()`
- `listProviders()`
- `listCapabilities()`
- `getProviderForStep()`

### ProviderCapability

已新增能力声明：

```ts
interface ProviderCapability {
  provider: string;
  supports: WorkflowStepType[];
}
```

当前能力映射：

- `GPTProvider`：`chat`
- `GPTImageProvider`：`image_generate`、`image_edit`、`image_replace`
- `MockChatProvider`：`chat`
- `MockImageProvider`：`image_generate`、`image_edit`、`image_replace`

## WorkflowRuntime 能力

已完成：

- provider workflow analysis 集成
- step running/success/error 状态同步
- step provider 记录
- step startedAt/completedAt 记录
- step error 记录
- runtime status：`idle`、`running`、`success`、`error`、`aborted`
- `retryStep(stepId)`
- `retryWorkflow()`
- `abort()`

限制：

- workflow 执行仍是线性 steps
- 未实现复杂 DAG
- 未实现多 Agent
- 未实现视频、数字人、音乐执行能力

## ConversationRuntime 能力

已完成：

- 基于 `ChatProvider.chat()` 的发送链路
- user/assistant message 同步
- streaming 状态事件
- success/error/aborted 状态
- abort 支持

限制：

- 当前 provider `chat()` 仍返回完整文本，尚未接入真正 token streaming
- streaming UI 为状态级支持，不是逐 token 输出

## 取消机制

已完成：

- `ConversationRuntime.abort()`
- `WorkflowRuntime.abort()`
- `WorkflowEngine.execute()` 支持 `AbortSignal`
- provider 调用传递 `signal`
- abort 后 runtime 状态保持 `aborted`
- abort 事件通过 `onAbort` 暴露

## 重试机制

已完成：

- `WorkflowRuntime.retryStep(stepId)`
- `WorkflowRuntime.retryWorkflow()`
- 失败 step 可重新执行
- retry 后同步 step 状态和 runtime 状态

限制：

- 当前 retry 仍基于内存中的最近一次 input/state
- 未实现持久化 retry history
- 未实现复杂 partial dependency retry

## ConversationView 增强

已完成：

- 展示 assistant `streaming`
- 展示 assistant `success`
- 展示 assistant `error`
- 保持 markdown、图片、附件展示能力

职责边界：

- 仅展示 messages
- 不调用 provider
- 不执行 workflow
- 不持有 runtime 状态

## WorkflowTimeline 增强

已完成：

- 展示 waiting/running/success/error
- 展示 glyph：`○`、`⟳`、`✓`、`!`
- 展示 provider
- 展示 step 耗时
- 展示 step error

职责边界：

- 仅展示 steps
- 不调用 provider
- 不执行 workflow
- 不管理 runtime

## Runtime Playground

新增 `packages/playground/src/RuntimePlayground.tsx`。

支持验证：

- chat
- prompt optimize
- workflow parse/run
- image workflow
- cancel
- retry workflow

默认行为：

- 无 `VITE_GPT_API_KEY` 时使用 Mock Provider
- 有 `VITE_GPT_API_KEY` 时使用 `GPTProvider` / `GPTImageProvider`

## 测试结果

执行命令：

```bash
pnpm.cmd test
```

结果：

- build：通过
- providers tests：11 passed，2 skipped
- core tests：18 passed
- react tests：16 passed
- 总体：通过

新增测试覆盖：

- `ConversationRuntime.test.ts`
- `RuntimeIntegration.test.ts`
- `Abort.test.ts`
- `Retry.test.ts`

页面验证：

- dev server：`http://127.0.0.1:5173/`
- HTTP 状态：200
- Vite root 挂载检查：通过

## 技术债

- 旧 `packages/core/src/agentRuntime.ts` 仍保留为兼容模块，后续可规划废弃。
- `ConversationRuntime` 尚未实现真实 token streaming。
- `WorkflowRuntime` 当前为线性步骤执行，不支持 DAG、并行、条件分支。
- retry 机制未持久化，只依赖当前 runtime 内存状态。
- Provider capability 已可用，但尚未建立更细粒度参数能力声明。
- React Workspace 已接 Runtime，但 Vue 尚未接入 Runtime。
- Playground 使用 mock-first 策略，真实 GPT/GPT-Image 调用仍依赖环境变量。

## 下一阶段建议

### P0

- 完成真实 streaming chat 支持
- 为 GPTProvider 增加 stream chat 接口
- 将 ConversationView 接入真实 token streaming
- 增强 ProviderCapability 参数描述

### P1

- WorkflowRuntime 支持持久化 execution history
- retry 支持 step dependency 检查
- Vue 接入 Runtime
- ProviderRegistry 增加默认 provider 选择策略

### P2

- 设计但不实现 VideoProvider Runtime 路由
- 设计但不实现 AvatarProvider Runtime 路由
- 设计但不实现 AudioProvider Runtime 路由
- WorkflowEngine 支持 DAG/branch 的接口设计

## 是否完成 Phase-04

结论：已完成 Phase-04 Runtime Integration 的 MVP 目标。

完成依据：

- `AgentConversationWorkspace` / controller 已移除旧 `agentRuntime` 直接请求依赖
- 新增 `ConversationRuntime`
- 增强 `WorkflowRuntime`
- `WorkflowRuntime` 已接入 `ProviderRegistry`
- `WorkflowEngine` 已按 ProviderCapability 匹配 provider
- 已实现 abort
- 已实现 step retry / workflow retry
- `ConversationView` / `WorkflowTimeline` 已展示 runtime 状态
- 已新增 Runtime Playground
- 指定测试已新增并通过

不包含内容：

- 未开发视频生成
- 未开发数字人
- 未开发音乐生成
- 未开发复杂 Agent
- 未开发多 Agent
- 未开发业务页面
