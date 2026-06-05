# AI Composer Image Upload Visual Redesign Plan

## 1. Product Goal

This redesign is not about adding new upload capability.
It is about transforming the current attachment presentation into an AI-native, conversation-oriented image upload surface.

### Reference direction

Use the user-provided screenshots as the primary visual target.
Also reference the interaction language of Dreamina / 即梦 style creative workspaces:

1. image-first prompt composition
2. integrated prompt and reference workflow
3. bottom workflow chips instead of plain utility buttons
4. dark, focused creative workbench container

Reference sources used for product direction:

1. User-provided screenshots in this thread
2. [Dreamina multimodal workspace](https://dreamina.capcut.com/ai-video/multimodal-ai-workspace)
3. [Dreamina AI image generator](https://dreamina.capcut.com/tools/ai-image-generator/)
4. [即梦 AI image generator](https://jimeng.jianying.com/features/tools/ai-image-generator)

Important boundary:
Borrow the structural language and workflow rhythm only.
Do not copy brand-specific icons, exact labels, or proprietary styling details.

### Core objective

Make image upload feel like part of an AI creation workflow rather than a generic file form.

### Target outcome

1. Uploaded images become the visual focus.
2. The composer feels like an AI workbench, not a backend form.
3. The bottom toolbar feels mode-driven and workflow-driven.
4. The experience stays enterprise-grade, restrained, and modern.

## 2. Scope Control

### This step includes

1. Image upload visual redesign
2. Composer layout restructuring
3. Toolbar restructuring
4. Visual hierarchy update for image-first scenarios
5. Image-specific component structure planning

### This step excludes

1. New backend upload logic
2. Drag-and-drop upload
3. Paste upload
4. Upload progress
5. Streaming or transport changes
6. Agent workflow logic changes

## 3. UI Audit

### 1. Current issues

1. The current attachment list is file-centric rather than image-centric.
2. Every attachment is rendered as a generic row, which weakens visual focus.
3. The layout reads as:
   textarea -> file list -> button row
   This is structurally correct, but visually too flat and too administrative.
4. The upload result does not create a strong creative context before the user starts typing.
5. The toolbar does not yet communicate "mode", "skill", "reference", or "agent collaboration" in a high-value way.
6. The send area is correct functionally, but the surface does not yet feel like a premium AI composer.

### 2. Optimization suggestions

1. Separate image attachments from generic file attachments at the UI layer.
2. Promote uploaded images into a dedicated visual tray instead of the current list layout.
3. Rebuild the composer hierarchy into:
   image tray -> prompt input -> workflow toolbar -> send action
4. Use a darker, more focused workbench surface for image-heavy scenarios.
5. Replace the plain attach affordance with an "add image" visual tile when images are already present.
6. Reduce text metadata prominence and increase preview prominence.

### 3. Redesign proposal

1. Use a single large dark composer shell.
2. Render uploaded images in a top-left tray with slightly overlapping thumbnail cards.
3. Keep the prompt text area visually integrated with the tray instead of isolated below it.
4. Put workflow chips and mode controls in a clean bottom row.
5. Keep the send action on the far right as the strongest primary action.

## 4. What to Borrow from the Reference

### Borrow

1. The composer should feel like a creative stage rather than a message form.
2. Uploaded images should appear inline at the top of the input area.
3. The image tray should support a layered or compact horizontal composition.
4. The toolbar should read like workflow controls, not generic file actions.
5. The send action should be visually isolated as the clear terminal action.
6. Placeholder copy should communicate multimodal creation, not just text entry.

### Do not borrow directly

1. Exact icon shapes
2. Exact button labels
3. Exact color values
4. Exact paddings or pixel measurements
5. Proprietary visual branding details

## 5. Product Analysis

### Target users

1. Users preparing image generation requests.
2. Users using image references as creative context.
3. Teams embedding AI composer into visual workbench products.

### User goals

1. Upload one or more image references quickly.
2. Visually confirm the uploaded images before writing the prompt.
3. Continue typing in the same visual workspace without context switching.
4. Feel that the composer supports a creative workflow, not just raw message entry.

### Business value

1. Better aligns the component with image-generation products and AI creative tools.
2. Makes the component more reusable across multimodal AI scenarios.
3. Raises perceived product quality without requiring deeper architecture changes.

## 6. UX Direction

### Experience principles

1. Image first, metadata second.
2. Prompt and reference should feel co-located.
3. Actions should feel workflow-oriented rather than form-oriented.
4. Dark mode should be the primary visual reference for this surface, while still preserving theme support.

### Interaction principles

1. When no image is uploaded:
   show a compact image add affordance and prompt hint.
2. When one image is uploaded:
   show a single prominent thumbnail card with an add tile.
3. When multiple images are uploaded:
   show a layered tray or compact horizontal stack.
4. The remove action should stay available but visually secondary.

### Prompt hint direction

The placeholder and helper line should support this rhythm:

1. describe your idea
2. add reference images
3. invoke skills or commands
4. collaborate with agents

This is the main reason the toolbar and prompt hint should sit inside one unified composer shell.

## 7. Visual Direction

### Style keywords

1. enterprise-grade
2. technological
3. modern
4. high-end
5. restrained
6. trustworthy

### Forbidden directions

1. flashy gradients
2. cyberpunk
3. exaggerated glassmorphism
4. heavy ornamental decoration

### Visual system

1. Container radius: `20`
2. Internal card radius: `14` to `16`
3. Spacing: `12 / 16 / 24`
4. Background layering:
   - shell: near-black charcoal
   - inner surfaces: slightly lifted dark panel
   - borders: low-contrast graphite
5. Accent color:
   use restrained cyan or brand blue only for active workflow states

### Reference-adapted visual behavior

1. The image cards may use slight overlap and tiny rotation differences, but only subtly.
2. The container should feel dense but breathable, not empty and not crowded.
3. The toolbar chips should feel lightweight and secondary to the image tray and prompt area.
4. The primary send button should be circular or strongly compact, but remain enterprise-grade.

## 8. Layout Redesign

### Current structure

```text
textarea
-> overlay
-> attachment list
-> status + action row
```

### New structure

```text
image tray and hint line
-> integrated prompt area
-> contextual overlay
-> workflow toolbar
-> primary send action
```

### Reference-aligned layout behavior

1. Image tray should visually start from the left and establish the narrative of "reference first".
2. Prompt area should occupy the central breathable region.
3. Workflow chips should anchor the lower-left edge.
4. Send action should anchor the lower-right edge.

### Low-fidelity wireframe

```text
+--------------------------------------------------------------------------------+
| AI Composer Shell                                                              |
|                                                                                |
|  +-----------+ +-----------+ +-----------+ +-----------+                      |
|  | image 01  | | image 02  | | image 03  | |    +      |                      |
|  | thumbnail | | thumbnail | | thumbnail | | add more  |                      |
|  +-----------+ +-----------+ +-----------+ +-----------+                      |
|                                                                                |
|  "输入想法、脚本，'/' 使用技能，@ 调用参考，和 Agent 一起创作"                    |
|                                                                                |
|                                                                                |
|                                                                                |
|  +--------------+ +----------+ +-------------+ +-----+        +--------+      |
|  | Agent 模式   | | 自动     | | 使用技能    | | @   |        | 发送   |      |
|  +--------------+ +----------+ +-------------+ +-----+        +--------+      |
+--------------------------------------------------------------------------------+
```

## 9. Component Strategy

### Recommended component split

```text
AiComposer
├─ ComposerImageTray
│  ├─ ComposerImageCard
│  └─ ComposerImageAddTile
├─ ComposerPromptHint
├─ ComposerTextarea
├─ ComposerOverlayLayer
├─ ComposerWorkflowBar
│  ├─ ComposerModeChip
│  ├─ ComposerSkillChip
│  ├─ ComposerReferenceChip
│  └─ ComposerAgentChip
└─ ComposerPrimaryAction
```

### Responsibility split

#### `ComposerImageTray`

1. Render uploaded image previews
2. Handle compact stacking or horizontal tray layout
3. Show the add-more tile

#### `ComposerImageCard`

1. Render image preview only
2. Support lightweight remove affordance
3. Keep metadata hidden or secondary by default

#### `ComposerWorkflowBar`

1. Render tool and mode controls
2. Visually group workflow chips
3. Keep current business logic outside the UI layer

## 10. State and Data Boundary

No major state model rewrite is required for this redesign.

### Keep existing core behavior

1. Existing attachment state in `ComposerCore`
2. Existing upload plugin and upload manager
3. Existing mention and command state

### UI-only interpretation change

1. Detect image attachments in the render layer
2. Route image attachments into `ComposerImageTray`
3. Keep non-image attachments on a secondary path for later refinement

## 11. Implementation Boundary

### Minimum implementation pass

1. Redesign outer composer shell to match the darker, premium workbench look
2. Add image tray component for image attachments
3. Replace generic image list rows with thumbnail cards
4. Refactor bottom action row into a workflow-oriented toolbar
5. Keep existing upload, mention, command, and send logic intact
6. Add a dedicated Storybook scene that demonstrates the "image-first creative composer" state

### Do not do in this pass

1. Full file-type redesign for PDFs and non-image files
2. Backend integration changes
3. New state model for image ordering
4. Drag-and-drop animation work

## 12. Implementation Notes

### Recommended token additions

Consider adding semantic tokens such as:

```text
--color-bg-shell
--color-bg-elevated
--color-chip-bg
--color-chip-border
--color-accent-cyan
--color-send-surface
```

### Suggested UI mapping

1. `AttachmentList` should become an image-aware switcher:
   - image attachments -> tray layout
   - non-image attachments -> secondary compact list
2. `ComposerActions` should evolve into a workflow bar rather than a button row.
3. `SendButton` should visually detach from the chip group and become the single strongest action.

## 13. Risks and Mitigations

### Risk 1: visual redesign leaks into business logic

Mitigation:
Keep attachment classification in the render layer and reuse current core state.

### Risk 2: image-heavy layout breaks text-first scenarios

Mitigation:
Design the tray so it collapses cleanly when there are no image attachments.

### Risk 3: toolbar becomes overdecorated

Mitigation:
Use restrained chips and low-contrast surfaces with one clear primary send action.

### Risk 4: redesign diverges from future file support

Mitigation:
Keep image tray as a specialization layer, not a replacement for all attachment rendering.

## 14. Recommended Next Step

If this plan is confirmed, the next step should be:

1. Implement the dark composer shell redesign
2. Add `ComposerImageTray`
3. Convert image attachments to thumbnail cards
4. Restructure the bottom toolbar to match the target interaction
5. Add a Storybook scene specifically for image upload conversation mode
