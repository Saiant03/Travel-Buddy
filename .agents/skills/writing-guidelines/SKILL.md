---
name: writing-guidelines
description: Review docs/prose for Writing Guidelines compliance. Use when asked to "review my docs", "check writing style", "audit prose", "review docs voice and tone", or "check this page against the writing handbook".
metadata:
  author: vercel
  version: "1.0.0"
  argument-hint: <file-or-pattern>
---

# Writing Guidelines

Review files for compliance with Writing Guidelines.

## How It Works

1. Fetch the latest guidelines from the source URL below
2. Read the specified files (or prompt user for files/pattern)
3. Check against all rules in the fetched guidelines
4. Output findings in the terse `file:line` format

## Guidelines Source

Fetch fresh guidelines before each review:

```
https://raw.githubusercontent.com/vercel-labs/writing-guidelines/main/command.md
```

Use WebFetch to retrieve the latest rules. The fetched content contains all the rules and output format instructions.

## Usage

When a user provides a file or pattern argument:
1. Fetch guidelines from the source URL above
2. Read the specified files
3. Apply all rules from the fetched guidelines
4. Output findings using the format specified in the guidelines

If no files specified, ask the user which files to review.

## Travel Buddy integration

Use for documentation work and read the live guideline source during review. Establish files from the task contract and actual diff. Adapt voice/compression guidance to clear, simple Romanian for a non-technical user; for repository docs, prioritize clarity, precision, consistency and useful sources/links. Apply rules tied to a specific editor or Vercel surface only when that surface exists. Do not impose MDX frontmatter, a model change, plan mode, PR/publication, or messages to others. Factual accuracy and higher-priority project instructions take priority. Use available network tools; if the source is inaccessible, state the limitation and do not invent a live-guideline review.
