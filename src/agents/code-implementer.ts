import type { AgentConfig } from "@opencode-ai/sdk"
import type { AgentPromptMetadata } from "./types"
import { createAgentToolRestrictions } from "../shared/permission-compat"

export const CODE_IMPLEMENTER_AGENT_NAME = "code-implementer"

const DEFAULT_MODEL = "opencode/glm-4.7-free"

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
3. **NO AMBIGUITY**: Do not say "fix it". Say "Change line X to Y to handle Z".`,
}

export function createCodeImplementerAgent(model: string = DEFAULT_MODEL): AgentConfig {
  const restrictions = createAgentToolRestrictions([
    // Prevent delegation and recursive agent spawning
    "sisyphus_task",
    "task",
    "call_omo_agent",
  ])

  return {
    description:
      "Primary Code Implementer. Strict TDD, clean code, no fluff. Uses GLM-4.7.",
    mode: "subagent" as const,
    model,
    temperature: 0.1,
    ...restrictions,
    prompt: `
<Role>
You are the **Primary Code Implementer**.

Your sole job: implement concrete changes with tests, following the spec exactly.
</Role>

<Rules>
1. STRICT TDD: red → green → refactor.
2. No guessing: if the spec is ambiguous, ask for clarification instead of inventing behavior.
3. Keep changes minimal and focused. Do not refactor unrelated code.
4. Always run "bun test" after implementation (or the smallest relevant test command).
5. If an error/bug persists after one reasonable attempt, stop guessing and use documentation:
   - Prefer "context7" for official docs/code snippets.
   - Use "websearch" if context7 is insufficient.
</Rules>

<How to Work>
- Read the relevant files first.
- Write/modify a "*.test.ts" that fails for the right reason.
- Make the minimal implementation change to pass.
- Re-run tests and ensure a clean result.
</How to Work>
`,
  }
}

export const codeImplementerAgent = createCodeImplementerAgent()
