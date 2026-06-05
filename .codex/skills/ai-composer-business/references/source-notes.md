# AI Composer Source Notes

## Source of Truth

This skill is derived from these workspace files:

1. `F:\复用性对话框\ai-composer\ai-composer-skill.md`
2. `F:\复用性对话框\ai-composer\AI-Composer-完整版技术方案.md`
3. `F:\复用性对话框\ai-composer\ai-composer-rules.md`

## Current File Status

- `ai-composer-skill.md`: populated and used as the main business development rule source
- `AI-Composer-完整版技术方案.md`: populated and used as the architecture and roadmap source
- `ai-composer-rules.md`: empty as of `2026-06-05`; no additional file-based hard constraints are currently defined there

## Key Consolidated Decisions

1. Build one core implementation and adapt it for Vue and React.
2. Keep state and business workflows inside `src/core`.
3. Use plugin-oriented extensibility for new capabilities.
4. Use `textarea` in the first stage instead of `contenteditable`.
5. Keep the visual style enterprise-grade and usability-first.
6. Deliver in phases and pause for user confirmation between major steps.
