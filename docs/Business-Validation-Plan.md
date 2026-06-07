# Business Validation Plan

## First Validation Project

Project:

`二手车创意生图`

## Validation Goal

Verify that the current SDK can replace UI and runtime integration points in a real business project without forcing a rewrite of the host product shell.

## Migration Scope

Replace these areas:

1. input area
2. message area
3. image result area

Keep these areas unchanged:

1. existing UI shell
2. existing business logic
3. existing business routing
4. existing permissions and analytics flow

## SDK Replacement Targets

Replace with SDK assets:

1. `AiComposer`
2. `ConversationView`
3. `ConversationRuntime`
4. `GPTProvider`
5. `GPTImageProvider`

Use `WorkflowTimeline` when workflow step visibility is needed by the business page.

## Validation Steps

1. Introduce `@company/ai-studio-sdk/react` into the project.
2. Keep the existing page layout and style shell.
3. Replace the current input area with `AiComposer`.
4. Replace the current message rendering area with `ConversationView`.
5. Replace image generation runtime wiring with `ConversationRuntime`, `GPTProvider`, and `GPTImageProvider`.
6. Keep current submit flow and business validation rules in the host project.
7. Verify that generated image results still render in the current business result area.

## Success Criteria

1. no business rewrite of the page shell is required
2. existing UI tone remains unchanged
3. request flow still satisfies current business logic
4. image generation result flow remains stable
5. host project can own layout while reusing SDK input and conversation modules

## Risks To Watch

1. host project styles may conflict with current SDK class names and theme tokens
2. business message schema may not match SDK message rendering assumptions
3. current SDK umbrella package still depends on older internal package names
4. React integration path is stronger than the current Vue maintainability level

## Validation Output

Expected output after the first migration:

1. integration notes
2. API friction list
3. style override requirements
4. packaging issues discovered in a clean business install
5. decision on whether the SDK is ready for broader internal rollout
