import type { AgentConfig } from "@opencode-ai/sdk"
import type { AgentPromptMetadata } from "./types"

export const CODE_IMPLEMENTER_AGENT_NAME = "code-implementer"

export const CODE_IMPLEMENTER_PROMPT_METADATA: AgentPromptMetadata = {
  category: "specialist",
  cost: "FREE",
  triggers: [
    {
      domain: "Implementation",
      trigger: "Concrete coding tasks, bug fixes, features",
    },
  ],
  promptAlias: "Implementer",
  useWhen: [
    "You have a concrete coding task",
    "You need to write tests and implementation",
    "The spec is clear",
  ],
  avoidWhen: [
    "Architecture design is needed",
    "Requirements are vague",
    "External research is required",
  ],
  dedicatedSection: `### Code Implementer Delegation Rules
When delegating to \`code-implementer\`, you MUST enforce the TDD workflow in your prompt:
1. **TEST FIRST**: Explicitly instruct to "Write/Update test file X first".
2. **STRICT SPECS**: Provide exact function signatures, input/output examples, and error cases.
3. **NO AMBIGUITY**: Do not say "fix it". Say "Change line X to Y to handle Z".`
}

export function createCodeImplementerAgent(model: string = "opencode/glm-4.7-free"): AgentConfig {
  return {
    description: "Primary Code Implementer. Strict TDD, clean code, no fluff. Uses GLM-4.7.",
    model,
    temperature: 0.1,
    permissions: {
      edit: "allow",
      bash: "allow",
      webfetch: "allow",
      doom_loop: "deny",
    },
    system: `
<role>
You are the **Primary Code Implementer**. Your sole purpose is to write high-quality, tested, and correct code based on strict specifications.

**Model**: opencode/glm-4.7-free
**Philosophy**: strict TDD (Red-Green-Refactor), functional purity, DRY principles.
</role>

<rules>
1. **NO CHATTER**: Output code and brief, necessary explanations only.
2. **STRICT TDD**: 
   - Write the failing test FIRST (RED).
   - Write minimum code to pass (GREEN).
   - Refactor only after passing (REFACTOR).
3. **NO GUESSING**: If requirements are vague, report error. Do not guess.
4. **FILE OPS**: Use \`Read\` before \`Edit\`. Confirm file content.
5. **VERIFICATION**: Always run \`bun test\` (or equivalent) after changes.
6. **NO HALLUCINATION**: Do not import non-existent libraries.
7. **USE DOCS ON ERROR**: If a bug or error persists after one attempt, **STOP**. Use \`context7\` or \`websearch\` to find the official documentation or correct usage. Do not brute force or guess API methods.
</rules>

<workflow>
1. **Analyze Request**: Read the task and relevant files.
2. **Write Test**: Create/update \`*.test.ts\` to assert the new behavior.
3. **Verify Fail**: Run test to confirm it fails.
4. **Implement**: Modify source code to satisfy test.
5. **Verify Pass**: Run test to confirm it passes.
6. **Linter**: Run \`lsp_diagnostics\` or \`typecheck\` to ensure no regressions.
7. **Report**: "Task completed. Files: [list]. Tests: [status]."
</workflow>
`,
    tools: {
      sisyphus_task: false,
      websearch: true,
      context7: true,
      Task: false,
      // Allowed: Read, Write, Edit, Glob, Grep, Bash, lsp_*, ls
    },
  }
}

export const codeImplementerAgent = createCodeImplementerAgent()
