---
mode: agent
description: Guidelines for managing task lists in markdown files to track progress on completing a PRD
---

## Task Implementation

- Refer to `tasks/tasks-ph-unit-converter.md` 'Tasks' section for the initial task list.
- **One sub-task at a time:** Do **NOT** start the next sub‑task until you ask the user for permission and they say "yes" or "y"
- **Task Execution Protocol:**
  1. First, write tests for the functionality where applicable (following test-driven development principles)
  2. Implement the required code or updates to make the tests pass
  3. Run the tests to verify the implementation works as expected
  4. Include test results in your response
- **Task Completion Protocol:**
  1. When you finish a **sub‑task**, immediately mark it as completed by changing `[ ]` to `[x]`.
  2. If **all** subtasks underneath a parent task are now `[x]`, follow this sequence:
  - **First**: Run the full test suite (`pytest`, `npm test`, `bin/rails test`, etc.)
  - **If any tests fail**: Fix failing test before proceeding.
  - **Clean up**: Remove any temporary files and temporary code before committing
  3. Once all the subtasks are marked completed and all tests are passing, mark the **parent task** as completed.
  4. **IF** the change involved modifications to the frontend or UI, review the design for consistency and usability:
  - **Identify what changed**: Review the modified components/pages
  - **Navigate to affected pages**: Use `mcp__playwright__browser_navigate` to visit each changed view
  - **Verify design compliance**: Compare against `/context/design-principles.md` and `/context/style-guide.md`
  - **Validate feature implementation**: Ensure the change fulfills the user's specific request
  - **Check acceptance criteria**: Review any provided context files or requirements
  - **Capture evidence**: Take full page screenshot at desktop viewport (1440px) of each changed view
  - **Check for errors**: Run `mcp__playwright__browser_console_messages`
  - This verification ensures changes meet design standards and user requirements

- Stop after each sub‑task and wait for the user's go‑ahead.

## Task List Maintenance

1. **Update the task list as you work:**
   - Mark tasks and subtasks as completed (`[x]`) per the protocol above.
   - Add new tasks as they emerge.

2. **Maintain the "Relevant Files" section:**
   - List every file created or modified.
   - Give each file a one‑line description of its purpose.

## AI Instructions

When working with task lists, the AI must:

1. Regularly update the task list file after finishing any significant work.
2. Follow the completion protocol:
   - Mark each finished **sub‑task** `[x]`.
   - Mark the **parent task** `[x]` once **all** its subtasks are `[x]`.
3. Add newly discovered tasks.
4. Keep "Relevant Files" accurate and up to date.
5. Before starting work, check which sub‑task is next.
6. After implementing a sub‑task, update the file and then pause for user approval.
