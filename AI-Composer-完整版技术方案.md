# AI Composer 企业级组件技术方案

## 1. 项目背景

AI Composer 是公司内部统一的 AI 输入组件。

目标不是开发一个简单聊天输入框，而是构建一套可复用于：

- AI 对话
- Agent 平台
- 图片生成平台
- 企业知识库

的一体化输入组件。

---

# 2. 技术选型

## 核心技术栈

| 模块 | 选型 |
|--------|--------|
| 开发语言 | TypeScript |
| UI实现 | TSX |
| 样式方案 | TailwindCSS |
| 构建工具 | Vite |
| 包管理 | pnpm |
| 单元测试 | Vitest |
| 组件文档 | Storybook |
| 代码规范 | ESLint + Prettier |
| 发布方式 | NPM私有仓库 |

---

## 为什么选择 TS + TSX

优势：

- 类型安全
- 易于维护
- 更适合组件库开发
- React/Vue都能适配
- AI代码生成效果更好

---

## 为什么选择 TailwindCSS

优势：

- 不依赖具体UI框架
- 易于主题切换
- 样式复用率高
- 支持深度定制
- AI生成代码质量高

不建议：

- Element Plus
- Naive UI
- Ant Design

作为底层依赖。

这些库只适合作为业务项目依赖。

组件库应该保持独立。

---

# 3. 总体架构设计

```text
AiComposer

├── Core
├── Components
├── Plugins
├── Theme
├── Adapters
└── Presets
```

---

## Core

负责：

- 状态管理
- 上传管理
- 历史记录
- 事件系统
- 插件系统

目录：

```text
core/

ComposerCore.ts
Store.ts
EventBus.ts
HistoryManager.ts
UploadManager.ts
PluginManager.ts
```

---

## Components

负责：

```text
输入框
发送按钮
停止按钮
上传区域
Agent面板
命令面板
```

目录：

```text
components/

AiComposer.tsx
Toolbar.tsx
AttachmentList.tsx
CommandPanel.tsx
MentionPanel.tsx
SendButton.tsx
StopButton.tsx
```

---

## Theme

统一主题系统。

```text
styles/

theme.css
index.css
```

支持：

- Light
- Dark
- Auto

---

## Adapters

适配不同框架。

```text
adapters/

react.ts
vue.ts
```

内部组件代码仅维护一套。

---

## Presets

预设模式。

```text
presets/

ChatPreset
ImagePreset
KnowledgePreset
AgentPreset
```

不同项目直接切换模式。

---

# 4. 核心功能规划

## MVP

第一阶段必须实现：

- 多行输入
- 自动高度
- Enter发送
- Shift+Enter换行
- 停止生成
- 图片上传
- 文件上传

---

## 增强能力

第二阶段：

- 拖拽上传
- 粘贴上传
- 历史记录
- 快捷键
- Token统计

---

## Agent能力

第三阶段：

- @Agent
- /Command
- Prompt模板
- 多角色切换

---

## 企业级能力

第四阶段：

- SSE
- WebSocket
- AbortController
- 流式输出
- MCP工具调用预留

---

# 5. 实现路线

## Phase 1

组件基础能力

周期：1周

输出：

```text
AiComposer MVP
```

---

## Phase 2

上传能力

周期：1周

输出：

```text
UploadPlugin
```

---

## Phase 3

Agent能力

周期：1周

输出：

```text
MentionPlugin
CommandPlugin
```

---

## Phase 4

流式通信

周期：1周

输出：

```text
SSE Support
WebSocket Support
```

---

## Phase 5

工程化

周期：1周

输出：

```text
Storybook
Vitest
NPM Package
CI/CD
```

---

# 6. 风险点分析

## 风险1：contenteditable

问题：

- 光标错乱
- 中文输入法兼容
- Safari兼容性

方案：

第一版使用 textarea。

不要提前复杂化。

---

## 风险2：大文件上传

问题：

- 内存占用
- ObjectURL泄漏

方案：

1. 统一管理上传生命周期。
2. 通过传参限制文件大小，默认最大10MB

---

## 风险3：Vue与React行为差异

问题：

双端状态不一致。

方案：

所有状态统一进入：

```text
ComposerCore
```

---

## 风险4：插件失控

问题：

后期插件越来越多。

方案：

统一插件接口规范。

禁止直接修改Core。

---

# 7. 扩展方案

未来扩展：

## Voice Plugin

支持：

- 语音输入
- 语音转文字

---

## OCR Plugin

支持：

- 图片识别
- 文档识别

---

## Image Plugin

支持：

- 图片生成参数
- 风格模板

---

## RAG Plugin

支持：

- 文档引用
- 知识库问答

---

## Agent Plugin

支持：

- 多Agent协作
- 工作流编排

---

## MCP Plugin

支持：

- Tool Calling
- MCP Server

---

# 8. 引用方案（参考项目）

参考设计思想：

- assistant-ui
- shadcn/ui
- Vercel AI SDK
- Lexical

原则：

```text
参考设计
不Fork
不复制
不依赖核心代码
```

核心实现自主开发。

---

# 9. 代码规范

## UI层

只负责：

```text
展示
交互
事件绑定
```

禁止：

```text
业务逻辑
接口请求
状态管理
```

---

## Core层

负责：

```text
状态管理
上传逻辑
插件管理
历史记录
```

---

## 插件层

统一接口：

```ts
interface ComposerPlugin {
  name: string
  install(): void
}
```

---

# 10. 最终目标

形成公司内部统一组件：

```text
@company/ai-composer
```

实现：

- 一套源码
- Vue支持
- React支持
- 插件扩展
- 长期维护
- AI项目统一接入

成为公司所有AI产品的标准输入组件。
