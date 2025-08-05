---
mode: agent
model: Claude Sonnet 4
description: Execute the next step in the implementation plan of 'specification.md'.
---

Refer to the "Step-by-Step Plan" in `specification.md`.

## Process:

1. Identify the next incomplete step in `specification.md`. If none are marked as completed, start at step 1.

2. For each implementation step:
   - First, write tests for the functionality where applicable (following test-driven development principles)
   - Implement the required code or updates to make the tests pass
   - Run the tests to verify the implementation works as expected
   - Include test results in your response

3. When a step is successfully implemented and verified with tests:
   - Mark the step as completed in `specification.md`
   - Report the test results and any observations
   - Pause so that I may review the code, make any changes, and commit the results.

4. If all steps are completed, respond that no more steps remain. = 4 L

After each implementation, run the tests and report results to confirm functionality works as expected.
