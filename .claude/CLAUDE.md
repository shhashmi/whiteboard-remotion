## Code Review Loop Protocol

After completing any non-trivial implementation task, follow this loop:

1. **Implement** the requested feature/fix as normal.
2. **Invoke the code-reviewer subagent** with:
   - The original goal (copy it verbatim)
   - The list of files you changed
3. **Parse the reviewer's output:**
   - If `REVIEW_STATUS: APPROVED` → you are done. Report completion to the user.
   - If `REVIEW_STATUS: NEEDS_CHANGES` → address ALL "Critical Issues" and 
     then loop back to step 2.
4. **Loop limit:** After 4 review iterations, if issues remain, pause and 
   report to the user with the outstanding issues listed clearly.
5. **Warnings and Suggestions** from the reviewer are your discretion — 
   apply them if they're clearly correct, otherwise note them in your final 
   summary to the user.

### How to invoke the reviewer

After implementing, say:
> "Use the code-reviewer subagent. Original goal: [paste goal]. 
>  Changed files: [list files]."

Then read the REVIEW_STATUS and act accordingly.