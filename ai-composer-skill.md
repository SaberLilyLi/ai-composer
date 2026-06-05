# AI Composer Development Skill

## Role

你是一名资深前端架构师。

当前正在开发：

```txt
AI Composer
```

企业级 AI 输入组件。

目标：

```txt
一套源码

支持 Vue

支持 React

长期维护

插件化架构
```

------

# 核心原则

## 原则1

禁止开发两套组件。

错误：

```txt
Composer.vue

Composer.tsx
```

正确：

```txt
AiComposer.tsx
```

唯一组件实现。

------

## 原则2

Vue 和 React 仅允许 Adapter。

目录：

```txt
src/adapters/

react.ts

vue.ts
```

不得实现业务逻辑。

------

## 原则3

业务逻辑必须进入：

```txt
src/core
```

禁止：

```txt
组件内直接写业务逻辑
```

------

## 原则4

样式统一使用：

```txt
TailwindCSS
```

禁止：

```txt
Element Plus

Naive UI

Ant Design

Arco Design

Bootstrap
```

------

## 原则5

禁止引入状态管理库。

禁止：

```txt
Redux

Mobx

Pinia

Vuex

Zustand
```

统一使用：

```txt
ComposerCore
```

管理状态。

------

# 技术栈

## 必须使用

```txt
TypeScript

TSX

TailwindCSS

Vite

pnpm
```

------

## 测试

必须使用：

```txt
Vitest
```

------

## 文档

必须使用：

```txt
Storybook
```

------

# 项目结构

```txt
src/

core/

components/

plugins/

styles/

adapters/

presets/
```

不得新增无关目录。

------

# Core职责

## ComposerCore

负责：

```txt
状态管理

发送逻辑

上传逻辑

事件系统

插件管理
```

------

## Store

负责：

```txt
状态存储
```

------

## EventBus

负责：

```txt
事件通信
```

------

## HistoryManager

负责：

```txt
历史记录
```

------

## UploadManager

负责：

```txt
文件上传
```

------

# Component职责

组件只负责：

```txt
渲染

交互

事件绑定
```

禁止：

```txt
请求接口

业务逻辑

状态管理
```

------

# 插件架构

所有新能力必须插件化。

禁止：

```txt
直接修改 ComposerCore
```

------

插件接口：

```ts
interface ComposerPlugin {

  name: string

  install(
    composer: ComposerCore
  ): void

}
```

------

# 默认插件

## MentionPlugin

支持：

```txt
@
```

------

## CommandPlugin

支持：

```txt
/
```

------

## UploadPlugin

支持：

```txt
上传
```

------

## PromptPlugin

支持：

```txt
Prompt模板
```

------

# 输入框规范

第一阶段必须使用：

```txt
textarea
```

禁止：

```txt
contenteditable
```

原因：

```txt
IME兼容问题

光标问题

浏览器兼容问题
```

------

# 组件开发顺序

Phase 1

```txt
AiComposer

SendButton

StopButton
```

完成后再继续。

------

Phase 2

```txt
AttachmentList

UploadPlugin
```

------

Phase 3

```txt
MentionPanel

CommandPanel
```

------

Phase 4

```txt
SSE

WebSocket
```

------

# Tailwind规范

允许：

```txt
flex

grid

gap

rounded

border
```

------

禁止：

```txt
内联style

!important
```

------

# 提交规范

每完成一个模块：

必须：

```txt
运行测试

修复Lint

更新Storybook
```

------

# 开发目标

最终形成：

@company/ai-composer

支持：

```txt
AI对话

Agent

图片生成

知识库

RAG

MCP
```

统一输入组件。