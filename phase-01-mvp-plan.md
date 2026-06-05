# AI Composer Phase 1 MVP Plan

## 1. Product Analysis

### Target users

1. Internal AI product teams that need a reusable input component.
2. Frontend engineers integrating AI chat, agent, image generation, or knowledge workflows.
3. Product teams that want one consistent interaction model across Vue and React projects.

### User goals

1. Enter and edit multi-line prompts efficiently.
2. Send content with low interaction cost.
3. Stop generation quickly when output is no longer needed.
4. Reuse one component across multiple AI scenarios without rebuilding the input area.

### Business value

1. Reduce duplicate development across AI products.
2. Standardize interaction behavior and future plugin capability.
3. Lower long-term maintenance cost by enforcing one core implementation.

### Core problem

Different AI products repeatedly rebuild similar composer inputs, causing inconsistent UX, duplicated logic, and higher maintenance cost.

## 2. Scope Control

### MVP

Only include the smallest useful composer flow for Phase 1:

1. Multi-line text input
2. Auto-resize textarea
3. `Enter` to send
4. `Shift+Enter` for newline
5. Send button
6. Stop button
7. Controlled sending and generating states
8. Theme token foundation for light and dark mode

### V1

Add the next most valuable capabilities after MVP is stable:

1. Attachment list
2. Upload plugin
3. Drag and paste upload
4. Better keyboard shortcuts
5. History support

### V2

Add extensibility and streaming integration:

1. Mention plugin
2. Command plugin
3. Prompt plugin
4. SSE support
5. WebSocket support
6. Agent and preset integration

### Explicitly excluded from Phase 1

1. File upload
2. `@Agent`
3. `/Command`
4. Prompt templates
5. Streaming transport
6. Token statistics
7. Large preset switching UI

## 3. User Value / Business Value / Development Cost

### User value

High.
Phase 1 already covers the most frequent interaction loop: type -> send -> stop -> continue editing.

### Business value

High.
This phase establishes the reusable contract and core architecture that all later scenarios depend on.

### Development cost

Low to medium.
The feature set is intentionally small, but the cost includes laying a correct core architecture for later plugins and adapters.

### Decision

Phase 1 should optimize for architectural correctness and predictable interaction, not feature count.

## 4. MVP User Flow

```text
Focus textarea
-> type prompt
-> auto expand as content grows
-> press Enter or click Send
-> core transitions to generating state
-> Send becomes disabled
-> Stop becomes available
-> click Stop
-> core exits generating state
-> continue editing or resend
```

## 5. Page Structure Direction

This is a single reusable component surface rather than a full page.

### Surface structure

1. Composer shell
2. Input area
3. Action bar
4. Send / Stop actions
5. Optional status slot area reserved for future extension

## 6. Low-Fidelity Wireframe

```text
+--------------------------------------------------------------+
| AI Composer Shell                                            |
|  +--------------------------------------------------------+  |
|  | textarea                                               |  |
|  | multi-line input                                       |  |
|  | auto-resize                                            |  |
|  +--------------------------------------------------------+  |
|                                                              |
|  +----------------------+-------------------------------+    |
|  | status / hint slot   | Send Button | Stop Button     |    |
|  +----------------------+-------------------------------+    |
+--------------------------------------------------------------+
```

### Interaction notes

1. Input area is always the visual center.
2. Primary action is send.
3. Stop action is secondary in idle state and primary-available in generating state.
4. Leave extension space without exposing future features in the MVP UI.

## 7. Component Tree

```text
AiComposer
├─ ComposerTextarea
├─ ComposerActions
│  ├─ SendButton
│  └─ StopButton
└─ ComposerStatusSlot
```

### Component responsibility split

#### `AiComposer`

1. Connect props and events to `ComposerCore`
2. Coordinate layout
3. Pass state down to child components

#### `ComposerTextarea`

1. Render `textarea`
2. Handle input event and keyboard behavior
3. Trigger auto-resize

#### `ComposerActions`

1. Render action container
2. Coordinate action layout only

#### `SendButton`

1. Render send action
2. Emit send intent

#### `StopButton`

1. Render stop action
2. Emit stop intent

#### `ComposerStatusSlot`

1. Reserve extension area for status or hints
2. Keep Phase 1 layout future-proof without leaking business logic into UI

## 8. State Management Plan

Follow the project rule: no external state library, state owned by `ComposerCore`.

### Core state for Phase 1

```ts
type ComposerPhase = "idle" | "generating";

interface ComposerState {
  value: string;
  phase: ComposerPhase;
  disabled: boolean;
}
```

### Derived state

1. `canSend`: `value.trim().length > 0 && phase !== "generating" && !disabled`
2. `canStop`: `phase === "generating"`

### Core actions

1. `setValue(value: string)`
2. `send()`
3. `stop()`
4. `setDisabled(disabled: boolean)`
5. `reset()`

### Event direction

```text
UI event
-> component emit intent
-> ComposerCore action
-> state update
-> adapter subscription
-> UI rerender
```

## 9. API Plan

Phase 1 should expose a small, stable API.

### Public props

```ts
interface AiComposerProps {
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  minRows?: number;
  maxRows?: number;
  theme?: "light" | "dark" | "auto";
  onChange?: (value: string) => void;
  onSend?: (value: string) => void | Promise<void>;
  onStop?: () => void;
}
```

### Public events / callbacks

1. `onChange`
2. `onSend`
3. `onStop`

### Important API decisions

1. Support both controlled and uncontrolled text value.
2. Keep transport concerns outside the component.
3. `onSend` is an integration boundary, not an internal network call.
4. `onStop` only emits intent; upstream integration decides how to abort generation.

## 10. Technical Direction

### Folder direction for Phase 1

```text
src/
  core/
    ComposerCore.ts
    Store.ts
    EventBus.ts
  components/
    AiComposer.tsx
    ComposerTextarea.tsx
    ComposerActions.tsx
    SendButton.tsx
    StopButton.tsx
    ComposerStatusSlot.tsx
  adapters/
    react.ts
    vue.ts
  styles/
    theme.css
    index.css
```

### Theme token baseline

```text
--color-bg-primary
--color-bg-secondary
--color-text-primary
--color-text-secondary
--color-border-primary
--color-brand-primary
--color-action-danger
```

### Technical principles

1. Keep `textarea` as the only input primitive for Phase 1.
2. Keep keyboard handling centralized and predictable.
3. Keep business transitions in core, not in leaf buttons.
4. Keep adapters thin and framework-specific only.

## 11. Risks and Mitigations

### Risk 1: premature feature expansion

Mitigation:
Lock Phase 1 to send/stop/input only.

### Risk 2: React and Vue behavior drift

Mitigation:
Keep one `ComposerCore` state model and thin adapters.

### Risk 3: textarea auto-resize inconsistency

Mitigation:
Implement resize behavior in one dedicated input component with predictable measurement logic.

### Risk 4: mixing transport logic into UI

Mitigation:
Keep `onSend` and `onStop` as pure integration boundaries.

## 12. Recommendation for the Next Step

If this plan is confirmed, the next step should be:

1. Establish project scaffold and package baseline
2. Create theme tokens and base styles
3. Implement `core` minimal state model
4. Implement `AiComposer`, `SendButton`, and `StopButton`
5. Stop for confirmation again before entering upload or plugin work
