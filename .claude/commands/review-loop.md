---
description: Trigger a code review loop against the last implementation
---

Review the most recent code changes against this goal: $ARGUMENTS

Use the code-reviewer subagent to review the changes. After getting feedback:
- Fix all Critical Issues
- Re-invoke the reviewer
- Repeat until REVIEW_STATUS: APPROVED or 4 iterations reached
- Report the final status and any remaining Suggestions to me