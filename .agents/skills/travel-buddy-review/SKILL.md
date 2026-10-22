---
name: travel-buddy-review
description: Review Travel Buddy changes before handoff and verify fixes against product criteria, actual behavior and integration evidence.
---

# Travel Buddy review

Read the task criteria, changed files and relevant project decisions. Check the resulting behavior, not only the implementer's report.

For code, trace the principal flow and affected interfaces. Inspect validation, state ownership, persistence and errors relevant to the change. For UI, inspect actual rendering and interaction at mobile and desktop sizes when tooling is available. For documentation, inspect internal consistency and whether proposed decisions are falsely described as approved.

Report actionable findings with an ID, severity, file and location, evidence or reproduction, user impact and expected behavior. Distinguish confirmed defects, open questions and checks not executed. If no defects are found, say so with the scope and limits of the review.

Send findings to the coordinator. The responsible implementer repairs them. Recheck each finding and affected integration after changes; a written claim that it was fixed is insufficient evidence. The coordinator performs the final integrated check before human review.

A documentation-only setup has no application build or browser flow to test. Do not fabricate those results or demand an application implementation during setup.
