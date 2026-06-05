# AI Composer Phase 2 Upload Plan

## 1. Product Analysis

### Target users

1. Internal AI application teams that need a reusable attachment experience inside the composer.
2. End users who need to add images or files alongside prompts.
3. Product teams that want one consistent upload interaction across chat, agent, image, and knowledge scenarios.

### User goals

1. Add one or more files to the current input flow without leaving the composer context.
2. See which files are attached before sending.
3. Remove mistaken attachments quickly.
4. Reuse one attachment interaction pattern across multiple AI products.

### Business value

1. Removes duplicated upload UX across products.
2. Establishes the first real plugin capability on top of the Phase 1 core.
3. Opens the path for image generation, RAG, and knowledge scenarios without redesigning the input surface later.

### Core problem

After Phase 1, the composer can send text only. Real AI workflows often require images or documents, and teams will otherwise start adding ad hoc upload logic in business apps, which breaks the single-source architecture.

## 2. Scope Control

### Phase 2 MVP

Keep the upload scope intentionally narrow:

1. Attachment list rendering
2. Upload plugin registration
3. Add files through native file picker
4. Remove attached files before send
5. File type and file size validation
6. Upload lifecycle state in `core`
7. Object URL lifecycle management for preview-safe files

### V1

Add higher-value interaction improvements after Phase 2 MVP is stable:

1. Drag-and-drop upload
2. Paste upload
3. Image thumbnail preview
4. Upload error messaging
5. Count and size limits in UI

### V2

Add deeper product integrations:

1. Per-preset upload rules
2. Async upload transport hooks
3. Upload progress
4. OCR and document processing plugin chain
5. Asset reuse across sessions

### Explicitly excluded from Phase 2 MVP

1. Drag-and-drop
2. Clipboard paste upload
3. Real backend transport
4. Upload progress bar
5. Rich preview gallery
6. Folder upload
7. Mention and command integration

## 3. User Value / Business Value / Development Cost

### User value

High.
This is the minimum step from text-only composer to a reusable AI workbench input surface.

### Business value

High.
Upload is foundational for chat with files, image generation references, and knowledge workflows.

### Development cost

Medium.
The UI is straightforward, but the architecture needs clean plugin boundaries, validation rules, and lifecycle handling.

### Decision

Phase 2 should optimize for safe attachment lifecycle and clean extensibility, not advanced upload polish.

## 4. MVP User Flow

```text
Click attach trigger
-> open native file picker
-> choose files
-> UploadPlugin validates files
-> ComposerCore stores attachment state
-> AttachmentList renders items
-> user removes an item if needed
-> send text + attachments through integration boundary
```

## 5. UX Direction

The upload interaction should remain calm and enterprise-oriented.

### UX priorities

1. Keep attachment handling near the input surface.
2. Avoid modal-heavy or multi-step upload behavior.
3. Make invalid files understandable and recoverable.
4. Preserve the Phase 1 send flow; attachments should extend the composer, not hijack it.

### Interaction principles

1. Use a small attach action in the action row.
2. Render attachments as a compact list between textarea and action bar.
3. Keep removal one-click.
4. Show basic file metadata first; richer previews can wait.

## 6. Page Structure Direction

Phase 2 extends the existing composer surface rather than creating a new page.

### Surface structure

1. Composer shell
2. Text input area
3. Attachment list area
4. Action row
5. Attach trigger
6. Send / Stop actions

## 7. Low-Fidelity Wireframe

```text
+------------------------------------------------------------------+
| AI Composer Shell                                                |
|  +------------------------------------------------------------+  |
|  | textarea                                                   |  |
|  +------------------------------------------------------------+  |
|                                                                  |
|  +------------------------------------------------------------+  |
|  | AttachmentList                                             |  |
|  | [file-a.pdf]  [image-b.png]  [remove]                      |  |
|  +------------------------------------------------------------+  |
|                                                                  |
|  +---------------------+-------------------------------+         |
|  | Attach | status     | Send Button | Stop Button     |         |
|  +---------------------+-------------------------------+         |
+------------------------------------------------------------------+
```

## 8. Component Tree

```text
AiComposer
├─ ComposerTextarea
├─ AttachmentList
│  └─ AttachmentItem
├─ ComposerActions
│  ├─ AttachButton
│  ├─ SendButton
│  └─ StopButton
└─ ComposerStatusSlot
```

### Component responsibility split

#### `AiComposer`

1. Connect attachment state from `ComposerCore`
2. Wire upload plugin integration boundary into the UI
3. Pass user intents to `core`

#### `AttachmentList`

1. Render attachment collection
2. Display basic metadata such as file name, type, and size
3. Expose remove intent only

#### `AttachmentItem`

1. Render one attached file
2. Show status or validation state
3. Emit remove intent

#### `AttachButton`

1. Trigger hidden file input
2. Emit picked files
3. Avoid business logic beyond event forwarding

## 9. Plugin Architecture Plan

Phase 2 must be the first real pluginized capability.

### Upload plugin role

`UploadPlugin` should be responsible for:

1. File validation
2. Attachment normalization
3. Object URL creation and cleanup
4. Registration of upload-specific actions onto the composer core

### Plugin contract direction

Keep the existing global plugin shape, but Phase 2 needs an actionable upload-specific contract layered on top:

```ts
interface ComposerPlugin {
  name: string;
  install(composer: ComposerCore): void;
}

interface UploadPluginOptions {
  accept?: string[];
  maxFiles?: number;
  maxFileSize?: number;
}
```

### Key architecture decision

Do not make `AiComposer` own file validation or attachment lifecycle directly.
The component should emit files, and the upload capability should be handled through plugin-registered core actions.

## 10. State Management Plan

### Attachment entity

```ts
type AttachmentStatus = "ready" | "invalid";

interface ComposerAttachment {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  previewUrl?: string;
  status: AttachmentStatus;
  error?: string;
}
```

### Phase 2 core state extension

```ts
interface ComposerState {
  value: string;
  phase: "idle" | "generating";
  disabled: boolean;
  attachments: ComposerAttachment[];
}
```

### Core actions

1. `addAttachments(files: File[])`
2. `removeAttachment(id: string)`
3. `clearAttachments()`
4. `setUploadConstraints(options: UploadPluginOptions)`

### Derived state

1. `hasAttachments`
2. `attachmentCount`
3. `hasInvalidAttachments`
4. `canAttachMore`

### Event direction

```text
UI file selection
-> UploadPlugin normalization/validation
-> ComposerCore attachment state update
-> UI rerender
```

## 11. API Plan

Phase 2 should stay small and integration-friendly.

### Public props extension

```ts
interface AiComposerProps {
  attachments?: ComposerAttachment[];
  defaultAttachments?: ComposerAttachment[];
  uploadOptions?: {
    accept?: string[];
    maxFiles?: number;
    maxFileSize?: number;
  };
  onAttachmentsChange?: (attachments: ComposerAttachment[]) => void;
  onAttachmentError?: (message: string, file?: File) => void;
}
```

### Important API decisions

1. Keep transport outside the component.
2. Allow controlled and uncontrolled attachment state only if the implementation stays simple; otherwise prefer uncontrolled in Phase 2 and expose change callbacks.
3. Keep validation messages structured enough for business apps to customize later.
4. Do not expose upload transport progress yet.

## 12. Technical Direction

### Folder direction for Phase 2

```text
src/
  core/
    ComposerCore.ts
    UploadManager.ts
    types.ts
  components/
    AiComposer.tsx
    AttachmentList.tsx
    AttachmentItem.tsx
    AttachButton.tsx
  plugins/
    UploadPlugin.ts
```

### Core responsibility split

#### `ComposerCore`

1. Own attachment state
2. Coordinate plugin hooks
3. Keep send behavior aware of attachments without handling actual upload transport

#### `UploadManager`

1. Normalize file metadata
2. Generate attachment ids
3. Validate file size and count
4. Manage preview URL creation and revocation

#### `UploadPlugin`

1. Register upload behavior into the core
2. Apply upload constraints
3. Keep Phase 2 capability modular

## 13. Risks and Mitigations

### Risk 1: attachment logic leaks into the component tree

Mitigation:
Route normalization, validation, and lifecycle into `core` plus `UploadPlugin`.

### Risk 2: object URL leaks

Mitigation:
Centralize preview URL creation and cleanup in `UploadManager`.

### Risk 3: uncontrolled growth of upload features

Mitigation:
Limit Phase 2 to file picker + attachment list + remove flow.

### Risk 4: API grows too quickly

Mitigation:
Start with a narrow prop shape and push advanced behavior into plugin options.

## 14. Recommendation for the Next Step

If this plan is confirmed, the next step should be:

1. Extend `core` state with attachments
2. Add `UploadManager`
3. Create `UploadPlugin`
4. Implement `AttachmentList` and `AttachButton`
5. Add tests and Storybook coverage for upload MVP
6. Stop again before drag-and-drop or paste upload
