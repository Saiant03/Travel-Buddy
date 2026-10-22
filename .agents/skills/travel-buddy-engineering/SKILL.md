---
name: travel-buddy-engineering
description: Implement or refactor Travel Buddy application code after its brief and stack are defined, with clear boundaries and persistence checks.
---

# Travel Buddy engineering

Read AGENTS.md, docs/product.md, relevant decisions and the assigned task contract.
If stack or product behavior is undecided, surface the decision to the coordinator instead of installing a framework by assumption.

- Match the chosen stack and existing conventions. Organize by feature when that keeps behavior together; separate UI, domain rules and persistence where the boundary has a concrete purpose.
- Keep one source of truth for state. Avoid duplicating derived state or coupling storage access to every component.
- Define data shapes and interfaces before parallel implementation. Validate imported, stored and user supplied data at boundaries. Specify missing and invalid data behavior.
- Use typed contracts if the selected stack supports them. Introduce abstractions only for demonstrated reuse or independent responsibilities.
- For persistence changes, verify save and reload behavior and failure handling. Respect the brief's offline, LAN and privacy requirements; local does not automatically mean offline or multi-device sync.
- For UI changes include relevant loading, empty, error and keyboard behavior. Follow the agreed design direction rather than combining every installed aesthetic rule.
- Run the available type, lint and build checks relevant to the change. Add behavioral tests for meaningful rules or regressions, not assertions that merely duplicate the implementation.

Stay within assigned files. Return changed files, actual checks and results, unresolved questions and any impact on adjacent features. Do not mark integrated acceptance complete.
