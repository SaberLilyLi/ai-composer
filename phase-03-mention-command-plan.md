# AI Composer Phase 3 Mention and Command Plan

## 1. Product Analysis

### Target users

1. Internal AI product teams building agent workflows, knowledge tools, and multi-mode AI experiences.
2. End users who need to address an agent with `@` or invoke a structured action with `/`.
3. Product teams that want one consistent command-entry pattern instead of inventing custom slash menus per app.

### User goals

1. Trigger agent selection quickly with `@`.
2. Trigger command selection quickly with `/`.
3. Choose an item without leaving the keyboard flow.
4. Keep the main input experience fast, predictable, and non-intrusive.

### Business value

1. Establishes the composer as more than a text box by enabling structured AI workflows.
2. Creates a reusable interaction layer for agents, presets, and prompt actions across products.
3. Avoids fragmented business-specific command systems.

### Core problem

Text and attachments are not enough for many AI workbench scenarios. Users also need structured shortcuts to select agents, invoke commands, and inject predefined behaviors without leaving the composer or learning page-specific UI.

## 2. Scope Control

### Phase 3 MVP

Keep the scope narrow and interaction-first:

1. Mention trigger detection with `@`
2. Command trigger detection with `/`
3. Mention suggestion panel
4. Command suggestion panel
5. Keyboard navigation within suggestion panels
6. Insert selected mention/command into textarea
7. Plugin-based trigger handling through `MentionPlugin` and `CommandPlugin`

### V1

Add higher-value improvements after MVP is stable:

1. Grouped command categories
2. Rich mention avatars or badges
3. Recently used agents and commands
4. Empty-state guidance in panels
5. Better matching and ranking

### V2

Add deeper workflow behavior:

1. Role-specific command permissions
2. Dynamic server-driven agent list
3. Prompt template expansion
4. Multi-step commands
5. Agent mode switching and orchestration

### Explicitly excluded from Phase 3 MVP

1. Backend search
2. Multi-level nested menus
3. Permission systems
4. Workflow builder behavior
5. Streaming tool execution
6. Prompt template engine

## 3. User Value / Business Value / Development Cost

### User value

High.
This is the first structured intelligence layer on top of free-form text input.

### Business value

High.
This phase unlocks agent and command-oriented AI products while preserving the shared composer foundation.

### Development cost

Medium.
The UI is moderate, but the main challenge is trigger parsing, keyboard interaction, and keeping plugin boundaries clean.

### Decision

Phase 3 should optimize for predictable text editing and low-friction selection, not feature depth.

## 4. MVP User Flow

### Mention flow

```text
Type "@"
-> mention plugin activates
-> suggestion panel opens near input
-> user types filter text
-> panel narrows results
-> user confirms item with Enter or click
-> selected mention token is inserted
```

### Command flow

```text
Type "/"
-> command plugin activates
-> command panel opens
-> user filters command list
-> user confirms item
-> command token or text template is inserted
```

## 5. UX Direction

The interaction should feel efficient, calm, and professional.

### UX priorities

1. Preserve focus in the textarea.
2. Keep trigger panels lightweight and contextual.
3. Let keyboard users complete the full flow without touching the mouse.
4. Avoid noisy or oversized panels that overwhelm the composer.

### Interaction principles

1. Trigger panels should appear only when relevant.
2. Mention and command should share structural interaction patterns where possible.
3. Close panels on escape, blur when appropriate, or after successful selection.
4. Do not block normal typing when no suggestion context is active.

## 6. Page Structure Direction

Phase 3 extends the current composer surface with contextual overlays.

### Surface structure

1. Composer shell
2. Text input area
3. Attachment list area
4. Contextual suggestion layer
5. Action row

## 7. Low-Fidelity Wireframe

```text
+------------------------------------------------------------------+
| AI Composer Shell                                                |
|  +------------------------------------------------------------+  |
|  | textarea                                                   |  |
|  | "Ask @des..."                                              |  |
|  +------------------------------------------------------------+  |
|     +-----------------------------------------------+            |
|     | MentionPanel                                  |            |
|     | > Design Agent                                |            |
|     |   Research Agent                              |            |
|     |   Support Agent                               |            |
|     +-----------------------------------------------+            |
|                                                                  |
|  +------------------------------------------------------------+  |
|  | AttachmentList                                             |  |
|  +------------------------------------------------------------+  |
|                                                                  |
|  +---------------------+-------------------------------+         |
|  | Attach | status     | Send Button | Stop Button     |         |
|  +---------------------+-------------------------------+         |
+------------------------------------------------------------------+
```

### Command wireframe variant

```text
+-----------------------------------------------+
| CommandPanel                                  |
| > /summarize                                  |
|   /translate                                  |
|   /rewrite                                    |
+-----------------------------------------------+
```

## 8. Component Tree

```text
AiComposer
├─ ComposerTextarea
├─ AttachmentList
├─ ComposerOverlayLayer
│  ├─ MentionPanel
│  │  └─ MentionItem
│  └─ CommandPanel
│     └─ CommandItem
├─ ComposerActions
│  ├─ AttachButton
│  ├─ SendButton
│  └─ StopButton
└─ ComposerStatusSlot
```

### Component responsibility split

#### `ComposerTextarea`

1. Continues to own raw text input and keydown capture
2. Emits cursor-aware trigger intent into `core`
3. Does not own suggestion filtering logic

#### `ComposerOverlayLayer`

1. Decides which contextual panel is visible
2. Hosts mention and command overlays
3. Keeps overlay rendering concerns out of the textarea itself

#### `MentionPanel`

1. Render filtered mention items
2. Track highlighted item visually
3. Emit choose intent only

#### `CommandPanel`

1. Render filtered commands
2. Follow the same selection behavior model as mention
3. Emit choose intent only

## 9. Plugin Architecture Plan

Phase 3 must remain plugin-first.

### Mention plugin role

`MentionPlugin` should be responsible for:

1. Detecting `@` trigger contexts
2. Providing available mention items
3. Filtering mention results from a query
4. Applying selected mention insertion behavior

### Command plugin role

`CommandPlugin` should be responsible for:

1. Detecting `/` trigger contexts
2. Providing command definitions
3. Filtering commands from a query
4. Applying selected command insertion behavior

### Global plugin contract direction

```ts
interface ComposerPlugin {
  name: string;
  install(composer: ComposerCore): void;
}
```

### Phase 3 specific contracts

```ts
interface MentionItem {
  id: string;
  label: string;
  value: string;
  description?: string;
}

interface CommandItem {
  id: string;
  label: string;
  value: string;
  description?: string;
}
```

### Key architecture decision

Do not hardcode agent or command business data inside `AiComposer`.
The component should render panel state, while plugins supply data, filtering, and insertion behavior.

## 10. State Management Plan

### Context mode

```ts
type ComposerContextMode = "none" | "mention" | "command";
```

### Core state extension

```ts
interface ComposerContextState {
  mode: ComposerContextMode;
  query: string;
  startIndex: number;
  endIndex: number;
  highlightedIndex: number;
  isOpen: boolean;
}

interface ComposerState {
  value: string;
  phase: "idle" | "generating";
  disabled: boolean;
  attachments: ComposerAttachment[];
  context: ComposerContextState;
}
```

### Core actions

1. `openMentionContext()`
2. `openCommandContext()`
3. `updateContextQuery(query: string)`
4. `moveContextSelection(direction: "up" | "down")`
5. `selectContextItem()`
6. `closeContext()`

### Derived state

1. `isMentionOpen`
2. `isCommandOpen`
3. `filteredMentionItems`
4. `filteredCommandItems`
5. `highlightedContextItem`

### Event direction

```text
Textarea key input
-> plugin-aware trigger detection
-> core context state update
-> panel render/update
-> user selection
-> plugin insertion logic
-> textarea value update
```

## 11. API Plan

Phase 3 should expose configuration, not hard business coupling.

### Public props extension

```ts
interface AiComposerProps {
  mentions?: MentionItem[];
  commands?: CommandItem[];
  mentionOptions?: {
    trigger?: string;
  };
  commandOptions?: {
    trigger?: string;
  };
  onMentionSelect?: (item: MentionItem) => void;
  onCommandSelect?: (item: CommandItem) => void;
}
```

### Important API decisions

1. Keep mention and command data externally configurable.
2. Keep selection callbacks optional and side-effect-friendly.
3. Keep insertion behavior consistent by default, with customization left for later phases.
4. Avoid adding remote search hooks until local behavior is stable.

## 12. Technical Direction

### Folder direction for Phase 3

```text
src/
  core/
    ComposerCore.ts
    types.ts
    ContextManager.ts
  components/
    MentionPanel.tsx
    MentionItem.tsx
    CommandPanel.tsx
    CommandItem.tsx
    ComposerOverlayLayer.tsx
  plugins/
    MentionPlugin.ts
    CommandPlugin.ts
```

### Core responsibility split

#### `ComposerCore`

1. Own contextual suggestion state
2. Coordinate trigger lifecycle
3. Dispatch selection and insertion results

#### `ContextManager`

1. Parse trigger ranges
2. Extract query text
3. Normalize selection insertion ranges
4. Keep mention and command parsing rules isolated from UI

#### `MentionPlugin` / `CommandPlugin`

1. Supply source items
2. Filter source items by query
3. Register mention or command capability into core

## 13. Risks and Mitigations

### Risk 1: trigger parsing breaks normal typing

Mitigation:
Keep parsing rules narrow and test text insertion edge cases before adding advanced features.

### Risk 2: keyboard behavior conflicts with send behavior

Mitigation:
When a panel is open, arrow keys and Enter should be routed to context selection first; only fall back to send when no context is active.

### Risk 3: mention and command logic diverge too early

Mitigation:
Share one contextual interaction model and split only data source behavior into plugins.

### Risk 4: business apps demand custom remote behavior too early

Mitigation:
Keep MVP local and deterministic, then add async sources later if needed.

## 14. Recommendation for the Next Step

If this plan is confirmed, the next step should be:

1. Extend `core` with contextual state
2. Add `ContextManager`
3. Implement `MentionPlugin` and `CommandPlugin`
4. Add `MentionPanel`, `CommandPanel`, and overlay coordination
5. Update textarea keyboard routing
6. Add tests and Storybook coverage for mention and command MVP
7. Stop again before prompt templates or remote agent search
