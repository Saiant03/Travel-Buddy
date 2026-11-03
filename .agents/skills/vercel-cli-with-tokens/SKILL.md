---
name: vercel-cli-with-tokens
description: Deploy and manage projects on Vercel using token-based authentication. Use when working with Vercel CLI using access tokens rather than interactive login — e.g. "deploy to vercel", "set up vercel", "add environment variables to vercel".
metadata:
  author: vercel
  version: "1.0.0"
---
# Vercel CLI with Tokens

## Travel Buddy integration

This skill applies only to an explicitly authorized, relevant Vercel CLI task. The current app uses React 19, TypeScript and Vite. Installation does not authorize Vercel access, project linking, upload or deployment. Follow the project contract and session network policy. Persistent Git authorization does not need to be requested again; an authorized push does not authorize a Vercel deployment. Paid or destructive plan changes remain outside this project mandate and require separate explicit authorization.

Never reveal, print, copy, inspect, search for or ask for token or secret values. Do not dump environment variables or search `.env` files. If setup state matters, check only whether a setting is present without displaying its value, or inspect non-secret project metadata. Use an already authenticated CLI normally; if authentication is unavailable, report that and stop. Never use `require_escalated` where the session disallows it.


Deploy and manage projects on Vercel using the CLI with token-based authentication, without relying on `vercel login`.

## Step 1: Verify CLI authentication without exposing credentials

For an explicitly authorized Vercel CLI task, use the normal authenticated CLI session:

```bash
vercel whoami
```

If the CLI reports that authentication is unavailable, stop and tell the user. Do not inspect environment values or secret files and do not ask the user to paste a token. Never pass a token as a command-line argument.

## Step 2: Locate the Project and Team

Check for non-secret project metadata in `.vercel/project.json` or `.vercel/repo.json`. Do not inspect or print secret values. If the task needs to know whether environment-based project identifiers are set, use a presence-only check:

```bash
if [ -n "${VERCEL_PROJECT_ID:-}" ] && [ -n "${VERCEL_ORG_ID:-}" ]; then echo "Project and organization IDs are configured"; else echo "Project and organization IDs are not both configured"; fi
```

A project URL can identify a team slug. If the intended project or team remains ambiguous, ask which one the user means before accessing it. Do not link a project just to discover its state.

## CLI Setup

Ensure the Vercel CLI is installed and up to date:

```bash
npm install -g vercel
vercel --version
```

## Deploying a Project

Always deploy as **preview** unless the user explicitly requests production. Choose a method based on what you have available.

### Quick Deploy (have project ID — no linking needed)

When the CLI is already authenticated and the project is correctly linked or its non-secret IDs are configured, deploy directly:

```bash
vercel deploy -y --no-wait
```

With a team scope (either via `VERCEL_ORG_ID` or `--scope`):

```bash
vercel deploy --scope <team-slug> -y --no-wait
```

Production (only when explicitly requested):

```bash
vercel deploy --prod --scope <team-slug> -y --no-wait
```

Check status:

```bash
vercel inspect <deployment-url>
```

### Full Deploy Flow (no project ID — need to link)

Use this when you have a token and team but no pre-existing project ID.

#### Check project state first

```bash
# Does the project have a git remote?
git remote get-url origin 2>/dev/null

# Is it already linked to a Vercel project?
cat .vercel/project.json 2>/dev/null || cat .vercel/repo.json 2>/dev/null
```

#### Link the project

**With git remote (preferred):**

```bash
vercel link --repo --scope <team-slug> -y
```

Reads the git remote and connects to the matching Vercel project. Creates `.vercel/repo.json`. More reliable than plain `vercel link`, which matches by directory name.

**Without git remote:**

```bash
vercel link --scope <team-slug> -y
```

Creates `.vercel/project.json`.

**Link to a specific project by name:**

```bash
vercel link --project <project-name> --scope <team-slug> -y
```

If the project is already linked, check `orgId` in `.vercel/project.json` or `.vercel/repo.json` to verify it matches the intended team.

#### Deploy after linking

**A) Git Push Deploy — has git remote (preferred)**

Git pushes trigger automatic Vercel deployments.

1. Follow the repository's persistent Git authorization; do not ask again when the operation is already authorized. A push alone does not authorize a Vercel deployment.
2. Commit and push:
   ```bash
   git add .
   git commit -m "deploy: <description of changes>"
   git push
   ```
3. Vercel builds automatically. Non-production branches get preview deployments.
4. Retrieve the deployment URL:
   ```bash
   sleep 5
   vercel ls --format json --scope <team-slug>
   ```
   Find the latest entry in the `deployments` array.

**B) CLI Deploy — no git remote**

```bash
vercel deploy --scope <team-slug> -y --no-wait
```

Check status:

```bash
vercel inspect <deployment-url>
```

### Deploying from a Remote Repository (code not cloned locally)

1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd <repo-name>
   ```
2. Link to Vercel:
   ```bash
   vercel link --repo --scope <team-slug> -y
   ```
3. Deploy via git push (if you have push access) or CLI deploy.

### About `.vercel/` Directory

A linked project has either:
- `.vercel/project.json` — from `vercel link`. Contains `projectId` and `orgId`.
- `.vercel/repo.json` — from `vercel link --repo`. Contains `orgId`, `remoteName`, and a `projects` map.

Not needed when `VERCEL_ORG_ID` + `VERCEL_PROJECT_ID` are both set in the environment.

**Do NOT** run `vercel project inspect` or `vercel link` in an unlinked directory to detect state — they will interactively prompt or silently link as a side-effect. `vercel ls` is safe (in an unlinked directory it defaults to showing all deployments for the scope). `vercel whoami` is safe anywhere.

## Managing Environment Variables

```bash
# Add a variable through the CLI's interactive prompt; do not put its value in shell history or chat.
vercel env add VAR_NAME --scope <team-slug>

# Set for a specific environment (production, preview, development)
vercel env add VAR_NAME production --scope <team-slug>

# List environment variables
vercel env ls --scope <team-slug>

# Pull env vars to local .env.local file
vercel env pull --scope <team-slug>

# Remove a variable
vercel env rm VAR_NAME --scope <team-slug> -y
```

## Inspecting Deployments

```bash
# List recent deployments
vercel ls --format json --scope <team-slug>

# Inspect a specific deployment
vercel inspect <deployment-url>

# View build logs (requires Vercel CLI v35+)
vercel inspect <deployment-url> --logs

# View runtime request logs (follows live by default; add --no-follow for a one-shot snapshot)
vercel logs <deployment-url>
```

## Managing Domains

```bash
# List domains
vercel domains ls --scope <team-slug>

# Add a domain to the project — linked or env-linked directory (1 arg)
vercel domains add <domain> --scope <team-slug>

# Add a domain — unlinked directory (requires <project> positional)
vercel domains add <domain> <project> --scope <team-slug>
```

## Stripe Projects Plan Changes

If this project is managed by Stripe Projects. **Ask the user before running any paid or destructive plan change** — upgrades bill a real card, downgrades remove seats.

First run `stripe projects status --json` to confirm the Vercel resource's local name. The examples below assume the default (`vercel-plan`); substitute the actual name if it was renamed at `stripe projects add` time.

- **Upgrade to Pro:** `stripe projects add vercel/pro` (or `stripe projects upgrade vercel-plan pro`)
- **Downgrade to Hobby:** `stripe projects downgrade vercel-plan hobby`

### What Pro gives you

- $20/month platform fee, includes $20/month of usage credit.
- Turbo build machines (30 vCPUs, 60 GB memory) by default for new projects — significantly faster builds than Hobby.
- 1 deploying seat + unlimited free Viewer seats (read-only collaborators, preview comments).
- Higher included allocations (1 TB Fast Data Transfer, 10M Edge Requests per month).
- Paid add-ons available: SAML SSO, HIPAA BAA, Flags Explorer, Observability Plus, Speed Insights, Web Analytics Plus.

Full details: https://vercel.com/docs/plans/pro-plan

## Working Agreement

- Never pass a token as a `--token` flag, expose its value, inspect secret files, or ask the user to provide it. Use only the already authenticated CLI session.
- **Default to preview deployments.** Only deploy to production when explicitly asked.
- Follow the project's persistent Git authorization; do not ask again when the operation is already authorized. A push does not authorize a Vercel deployment.
- **Do not modify `.vercel/` files directly.** The CLI manages this directory. Reading them (e.g. to verify `orgId`) is fine.
- **Do not curl/fetch deployed URLs to verify.** Just return the link to the user.
- **Use `--format json`** when structured output will help with follow-up steps.
- **Use `-y`** on commands that prompt for confirmation to avoid interactive blocking.

## Troubleshooting

### Authentication error

If the CLI reports `Authentication required`, verify only the existing CLI session with `vercel whoami`. Report that authentication is unavailable and stop. Do not search for, reveal, or request a token.

### Wrong team

Verify the scope is correct:

```bash
vercel whoami --scope <team-slug>
```

### Build failure

Check the build logs:

```bash
vercel inspect <deployment-url> --logs
```

Common causes:
- Missing dependencies — ensure `package.json` is complete and committed.
- Missing environment variables — add with `vercel env add`.
- Framework misconfiguration — check `vercel.json`. Vercel auto-detects frameworks (Next.js, Remix, Vite, etc.) from `package.json`; override with `vercel.json` if detection is wrong.

### CLI not installed

```bash
npm install -g vercel
```
