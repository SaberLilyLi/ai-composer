# AI Composer SDK 架构设计文档（Architecture.md）

## 项目定位

当前项目：

@company/ai-composer

不再定位为：

```text
AI 输入框组件
```

升级定位为：

```text
跨框架 AI Studio SDK
```

目标：

构建企业级 AI 能力平台。

支持：

- React
- Vue

支持：

- Chat
- RAG
- Workflow
- Agent
- GPT-5.5
- GPT-Image-2
- Flux
- 即梦
- 可灵
- 视频生成
- 数字人
- 多媒体工作流

---

# 核心设计原则

## 原则1

框架无关

所有业务逻辑必须运行在 Core 层。

禁止：

React

Vue

DOM

Window

Document

出现在 Core 层。

---

## 原则2

UI 与业务解耦

React 和 Vue 只负责渲染。

禁止：

组件直接调用模型。

禁止：

组件直接请求 OpenAI。

---

## 原则3

Provider 驱动

所有 AI 模型能力必须经过 Provider。

统一接口。

---

## 原则4

Workflow First

所有 AI 能力最终统一为 Workflow。

例如：

聊天

图片生成

视频生成

数字人

Agent

都属于 Workflow。

---

# Monorepo结构

```text
packages

├── core
│
├── providers
│
├── shared
│
├── react
│
├── vue
│
└── playground
```

---

# packages/core

纯 TypeScript。

负责：

Conversation

Workflow

Parser

Executor

State

Types

Engine

---

## ConversationEngine

负责：

消息管理

流式状态管理

消息更新

消息重试

消息删除

会话切换

结构：

```ts
interface Message {
  id: string

  role: 'user' | 'assistant' | 'system'

  content: string

  attachments?: Attachment[]

  status?: 'pending' | 'streaming' | 'success' | 'error'

  createdAt: number
}
```

---

## WorkflowEngine

负责：

步骤管理

步骤执行

步骤回滚

步骤重试

状态同步

结构：

```ts
interface WorkflowStep {
  id: string

  type: WorkflowStepType

  title: string

  prompt?: string

  status: 'waiting' | 'running' | 'success' | 'error'

  output?: unknown
}
```

---

## WorkflowStepType

```ts
type WorkflowStepType =
  | 'chat'
  | 'image_generate'
  | 'image_edit'
  | 'image_replace'
  | 'video_generate'
  | 'image_to_video'
  | 'avatar_generate'
  | 'avatar_talking_video'
  | 'agent_task'
```

---

## PromptParser

负责：

自然语言解析

例如：

```text
把车改成蓝色

然后背景改成雨夜高架

最后调整为9:16
```

输出：

```json
[
  {
    "type": "image_edit",
    "prompt": "把车改成蓝色"
  },
  {
    "type": "image_edit",
    "prompt": "背景改成雨夜高架"
  },
  {
    "type": "image_edit",
    "prompt": "调整为9:16"
  }
]
```

---

# packages/providers

统一模型能力。

---

## ChatProvider

```ts
interface ChatProvider {
  chat()
}
```

---

## ImageProvider

```ts
interface ImageProvider {
  generateImage()

  editImage()
}
```

---

## VideoProvider

```ts
interface VideoProvider {
  generateVideo()

  imageToVideo()
}
```

---

## AvatarProvider

```ts
interface AvatarProvider {
  createAvatar()

  generateTalkingVideo()
}
```

---

## AgentProvider

```ts
interface AgentProvider {
  plan()

  execute()
}
```

---

# GPT-5.5 Provider

新增：

GPTProvider

能力：

- Chat
- Prompt优化
- Workflow解析
- Agent规划

接口：

```ts
chat()

optimizePrompt()

analyzeWorkflow()
```

---

# GPT-Image-2 Provider

新增：

GPTImageProvider

接口：

```ts
generateImage()

editImage()
```

---

# 未来扩展

新增：

```text
FluxProvider

QwenProvider

JimengProvider

KelingProvider

ComfyUIProvider

RunwayProvider

VeoProvider

HeyGenProvider
```

无需修改组件层。

---

# packages/react

React适配层。

仅负责：

UI渲染。

---

组件：

```text
AiComposer

ConversationView

MessageBubble

ImageMessage

VideoMessage

AvatarMessage

AttachmentPreview

WorkflowTimeline

WorkflowResultViewer
```

---

# packages/vue

Vue适配层。

API与React完全一致。

组件名称保持一致。

---

# AiComposer

职责：

输入。

---

支持：

```text
文本

图片

视频

文件

拖拽上传

模型切换

Prompt输入
```

---

禁止：

```text
消息渲染

工作流渲染

图片展示

视频展示
```

---

输出：

```ts
onSend({
  text,

  attachments,

  model,
})
```

---

# ConversationView

职责：

消息展示。

支持：

```text
Markdown

图片

视频

数字人

流式输出
```

---

# WorkflowTimeline

职责：

工作流展示。

例如：

```text
✓ Step1

⟳ Step2

○ Step3
```

状态：

```text
waiting

running

success

error
```

---

# Workspace层

仅负责组合。

---

## ChatWorkspace

```text
ConversationView

+

AiComposer
```

---

## ImageWorkspace

```text
ConversationView

+

WorkflowTimeline

+

AiComposer
```

---

## VideoWorkspace

```text
ConversationView

+

WorkflowTimeline

+

AiComposer
```

---

## AvatarWorkspace

```text
ConversationView

+

WorkflowTimeline

+

AiComposer
```

---

## AgentWorkspace

```text
ConversationView

+

WorkflowTimeline

+

AiComposer
```

---

# AgentConversationWorkspace

保留。

内部重构：

```text
ConversationView

+

WorkflowTimeline

+

AiComposer
```

实现。

---

# 多媒体支持

统一结构：

```ts
interface Attachment {
  id: string

  type: 'image' | 'video' | 'audio' | 'file' | 'avatar'

  url: string
}
```

---

# 主题系统

统一：

```text
Light

Dark
```

共享：

Theme Tokens

React 与 Vue 共用。

---

# 要求

保持：

AiComposer

AgentConversationWorkspace

向下兼容。

新增能力禁止破坏现有 API。

---

# 交付内容

Codex执行后必须生成：

1. Monorepo目录结构

2. Core Engine

3. Providers

4. React组件

5. Vue组件

6. TypeScript类型

7. Hooks

8. Store

9. Mock API

10. 示例项目

11. README

12. Migration Guide

13. 单元测试

确保项目可运行。
