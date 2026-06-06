# Phase-03 GPT Provider Completion Report

## Scope

本阶段目标是实现真实 Provider，并验证 Core、Workflow、Provider、Conversation 的基础链路是否可运行。

本阶段只允许：

* GPT5.5
* GPT-Image-2

本阶段禁止：

* 数字人
* 视频生成
* 音乐生成
* 复杂 Agent
* 复杂 Workflow
* 业务页面开发

本次未开发视频、数字人、音乐或复杂 Agent 能力。

## Provider Architecture Review

### 当前结构

```text
packages/providers/
├── package.json
├── tsconfig.json
├── tsconfig.build.json
├── vitest.config.ts
└── src/
    ├── config.ts
    ├── errors.ts
    ├── http.ts
    ├── index.ts
    ├── types.ts
    ├── chat/
    │   ├── GPTProvider.test.ts
    │   └── GPTProvider.ts
    └── image/
        ├── GPTImageProvider.test.ts
        └── GPTImageProvider.ts
```

### 结论

Provider 结构已从单文件聚合升级为分层结构：

* `types.ts`：统一 Provider 接口
* `config.ts`：Provider 配置
* `errors.ts`：Provider 错误模型
* `http.ts`：OpenAI/OpenRouter/兼容接口请求层
* `chat/GPTProvider.ts`：GPT5.5 文本 Provider
* `image/GPTImageProvider.ts`：GPT-Image-2 图片 Provider

当前结构合理，已经具备继续扩展 Provider 的基础。

## 新增文件

* `packages/providers/tsconfig.build.json`
* `packages/providers/vitest.config.ts`
* `packages/providers/src/config.ts`
* `packages/providers/src/errors.ts`
* `packages/providers/src/http.ts`
* `packages/providers/src/types.ts`
* `packages/providers/src/chat/GPTProvider.ts`
* `packages/providers/src/chat/GPTProvider.test.ts`
* `packages/providers/src/image/GPTImageProvider.ts`
* `packages/providers/src/image/GPTImageProvider.test.ts`
* `packages/core/src/WorkflowIntegration.test.ts`
* `packages/playground/src/GPTPlayground.tsx`
* `docs/Phase-03-GPT-Provider-Completion-Report.md`

## 修改文件

* `package.json`
* `pnpm-lock.yaml`
* `packages/providers/package.json`
* `packages/providers/src/index.ts`
* `packages/core/src/ProviderRegistry.ts`
* `packages/core/src/WorkflowEngine.ts`
* `packages/core/src/WorkflowRuntime.ts`
* `packages/playground/package.json`
* `packages/playground/src/App.tsx`

## Provider 结构

### ProviderConfig

新增：

```ts
interface ProviderConfig {
  apiKey: string;
  baseUrl?: string;
  model: string;
  timeout?: number;
  maxRetries?: number;
  provider?: "openai" | "openrouter" | "compatible";
}
```

支持：

* `apiKey`
* `baseUrl`
* `model`
* `timeout`
* `maxRetries`
* OpenAI
* OpenRouter
* OpenAI-compatible endpoints

### ProviderError

新增统一错误：

* `NetworkError`
* `AuthError`
* `RateLimitError`
* `ModelError`
* `TimeoutError`

### HTTP 层

新增 `providerRequest()`：

* Bearer token 鉴权
* JSON body
* FormData body
* timeout
* retry
* HTTP status 到 ProviderError 映射

## GPT5.5 能力

### GPTProvider

文件：

```text
packages/providers/src/chat/GPTProvider.ts
```

已实现：

* `chat()`
* `optimizePrompt()`
* `analyzeWorkflow()`

### chat()

能力：

* 普通聊天
* OpenAI-compatible `/chat/completions`
* 输入 `Message[]`
* 输出 `{ text, model }`

### optimizePrompt()

能力：

* 输入用户 prompt
* 调用 GPT chat
* 输出优化后的 prompt

示例目标：

```text
输入：改成蓝色
输出：保持车辆主体不变，将车漆改为深海蓝，保持真实摄影风格，保留车身反射细节
```

### analyzeWorkflow()

能力：

* 输入自然语言多步骤 prompt
* 要求模型返回 JSON
* 输出 `{ steps: [] }`
* step type 限制在当前阶段允许的基础范围：
  * `chat`
  * `image_generate`
  * `image_edit`
  * `image_replace`

## GPT-Image-2 能力

### GPTImageProvider

文件：

```text
packages/providers/src/image/GPTImageProvider.ts
```

已实现：

* `generateImage()`
* `editImage()`

### generateImage()

能力：

* 文生图
* OpenAI-compatible `/images/generations`
* 支持 URL 输出
* 支持 base64 输出转 data URL

### editImage()

能力：

* 图生图
* 图片编辑
* OpenAI-compatible `/images/edits`
* 支持 data URL 图片输入
* 支持 remote image URL 兼容字段
* 无图片输入时回退到 `generateImage()`

## Workflow 集成情况

### ProviderRegistry

新增能力：

* `registerProvider()`
* `removeProvider()`
* `getProvider()`
* `listProviders()`

兼容旧能力：

* `register()`
* `get()`

自动能力挂载：

* 注册带 `analyzeWorkflow()` 的 chat provider 时，自动暴露为 `workflowAnalyzer`
* 注册带 `optimizePrompt()` 的 chat provider 时，自动暴露为 `promptOptimizer`

### WorkflowRuntime

改动：

* `runPrompt()` 优先使用 Provider 的 `analyzeWorkflow()`
* 如果没有 workflow analyzer，则回退到本地 `PromptParser`

链路：

```text
用户输入
↓
WorkflowRuntime.runPrompt()
↓
GPTProvider.analyzeWorkflow()
↓
WorkflowEngine.execute()
↓
GPTImageProvider.editImage()
↓
Conversation message output
↓
ConversationView 可展示
```

### WorkflowEngine

改动：

* `image_generate` 调用 `generateImage()`
* `image_edit` / `image_replace` 优先调用 `editImage()`
* 如果 image provider 没有 `editImage()`，回退到 `generateImage()`

## Playground

新增 GPT Playground：

```text
packages/playground/src/GPTPlayground.tsx
```

入口：

```text
http://127.0.0.1:4173/
```

已支持验证：

* `chat`
* `optimize`
* `workflow`
* `image`

配置环境变量：

```env
VITE_GPT_API_KEY=
VITE_GPT_BASE_URL=https://api.openai.com/v1
VITE_GPT_CHAT_MODEL=gpt-5.5
VITE_GPT_IMAGE_MODEL=gpt-image-2
```

浏览器验证结果：

```text
Page title: AI Composer Playground
GPT Playground visible: yes
Modes visible: chat / optimize / workflow / image
```

## 测试结果

命令：

```bash
pnpm test
```

结果：

```text
Build: passed
Providers: 2 test files passed, 11 tests passed, 2 real-call tests skipped
Core: 5 test files passed, 13 tests passed
React: 3 test files passed, 16 tests passed
```

### GPTProvider.test

覆盖：

* mock chat 调用
* prompt 优化
* workflow JSON 解析
* AuthError
* retry
* timeout
* env-gated real compatible chat endpoint

### GPTImageProvider.test

覆盖：

* mock image generation
* mock image edit
* edit without attachments fallback
* RateLimitError
* retry
* env-gated real compatible image endpoint

### WorkflowIntegration.test

覆盖：

* `Prompt -> Provider analyzeWorkflow -> WorkflowEngine -> ImageProvider editImage -> Conversation`
* ProviderRegistry lifecycle

## Provider Architecture Completion

| 项目 | 状态 |
| -- | -- |
| Provider 分层目录 | 已完成 |
| ProviderConfig | 已完成 |
| ProviderError | 已完成 |
| GPTProvider | 已完成 |
| GPTImageProvider | 已完成 |
| ProviderRegistry | 已完成 |
| WorkflowRuntime 集成 | 已完成 |
| WorkflowEngine 集成 | 已完成 |
| Mock 测试 | 已完成 |
| 错误处理测试 | 已完成 |
| 超时测试 | 已完成 |
| 重试测试 | 已完成 |
| 真实调用测试 | 已提供，默认跳过，需要环境变量显式启用 |
| GPT Playground | 已完成 |

## 技术债

当前遗留技术债：

* 根目录旧 `src/` 结构仍未清理
* `packages/shared/src` 中仍存在构建生成的 `.js`、`.d.ts`、`.d.ts.map`
* `packages/core` 中仍存在 `vitest.config.js`、`vitest.config.d.ts`、`vitest.config.d.ts.map`
* `GPTProvider.analyzeWorkflow()` 当前依赖模型输出 JSON，缺少 schema validator
* `GPTImageProvider.editImage()` 对 remote URL 的兼容取决于后端是否支持 `image_url`
* WorkflowEngine 仍是线性执行器
* WorkflowRuntime 缺少事件流、取消和 step progress callback
* Playground 未做密钥安全提示和运行日志
* `AgentConversationWorkspace` 仍使用旧 `agentRuntime`，尚未切换到 GPT Provider

## 下一阶段建议

### P0

* 将 `AgentConversationWorkspace` 从旧 `agentRuntime` 迁移到 ProviderRegistry
* 为 `GPTProvider.analyzeWorkflow()` 增加严格 schema 校验
* 为 Provider 增加能力声明：
  * provider name
  * model
  * supported step types
  * input schema
  * output schema

### P1

* 增强 WorkflowRuntime：
  * 事件订阅
  * step progress
  * abort/cancel
  * retry
* 增强 WorkflowTimeline 展示实际 Provider 执行状态
* 增加 image edit 的 File/Blob 输入标准化

### P2

* 清理旧 `src/`
* 清理源码目录中的构建产物
* 完善 Vue 与 Provider 的集成示例
* 增加 Provider playground 的交互日志和请求状态面板

## 禁止项确认

本阶段未开发：

* 视频生成
* 数字人
* 音乐生成
* 复杂 Agent
* 复杂 Workflow

## 最终结论

Phase-03 GPT Provider 阶段已完成。

当前项目已经具备：

* OpenAI/OpenRouter/兼容接口 Provider 配置
* GPT5.5 chat / prompt optimize / workflow analyze
* GPT-Image-2 generate / edit
* Provider 统一错误
* Provider timeout/retry
* ProviderRegistry lifecycle
* WorkflowRuntime 与 GPT Provider 的基础打通
* GPT Playground 验证入口
* Mock、错误、超时、重试测试
* 显式开启的真实调用测试入口

完成后停止开发，等待下一阶段指令。
