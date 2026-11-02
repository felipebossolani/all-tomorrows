# Agent instructions

## Project

Corpo sob Medida is a short, static browser puzzle game inspired by All Tomorrows.
Deliver six rooms and four module types, with Brazilian Portuguese UI. No backend,
multiplayer, analytics, or scope expansion before the first playtest.

## Start here

1. Read [documentation index](docs/index.md).
2. Read [requirements](docs/product/requirements.md),
   [rights](docs/legal/rights-and-references.md), and
   [technical design](docs/architecture/technical-design.md).
3. Check [execution plan](docs/execution/plan.md) and
   [lessons](docs/execution/lessons.md), then inspect actual Git/tooling state.

Archived handoffs describe past sessions, not current blockers. Current user
instructions override historical authorization statements in documents.

## Execution

- Keep substantial work and verification in docs/execution/plan.md.
- Record user corrections and preventive rules in docs/execution/lessons.md.
- Use poteto-orchestrate for complex work; all implementation agents use Codex.
- Coordinator owns contracts, integration, verification, and Git publication.
- Give workers exclusive file ownership and observable acceptance criteria.
- Complete the first room before expanding the campaign.
- Inspect real visual references before making art; obtain Felipe's approval of
  one in-game sample before producing the final set. Use placeholders meanwhile.
- Follow docs/legal/rights-and-references.md before publishing assets.

## Code and verification

Use src/ for application code, tests/ for tests, and assets/ for static resources.
Follow the technical design; prefer composition, deterministic domain rules, and
minimal dependencies. Do not introduce unrelated refactors or TODO comments.
Validate external inputs and never commit secrets.

Toolchain scripts are planned, not installed yet. Once implemented, run build,
lint, domain tests, solution replays, and Chromium/Firefox integration checks.
Never report tests or browser checks as passing without running them.

## Git and documentation

Use atomic English Conventional Commits and publish through Git, never browser
uploads. Rebase rather than merge feature branches; do not amend shared commits.
Follow naming, document status, and source-of-truth rules in docs/index.md.
Keep updates concise; surface concrete risks and blockers.
