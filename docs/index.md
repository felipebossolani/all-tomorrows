# Documentation

Status: active
Owner: project maintainer
Updated: 2026-11-02

## Reading order and sources of truth

| Document                                                | Responsibility                                                     |
| ------------------------------------------------------- | ------------------------------------------------------------------ |
| [Requirements](product/requirements.md)                 | Product scope, rules, acceptance criteria                          |
| [Technical design](architecture/technical-design.md)    | Stack, architecture, proposed rule changes, Codex responsibilities |
| [Execution plan](execution/plan.md)                     | Current work, checklists, verification and delivery status         |
| [Lessons](execution/lessons.md)                         | Corrections and rules preventing recurrence                        |
| [Rights and references](legal/rights-and-references.md) | Attribution and conditions for asset publication                   |
| [Development](execution/development.md)                 | Setup, execução e comandos de validação                            |
| [Visual direction](architecture/visual-direction.md)    | Referências examinadas e limites de publicação                     |
| [Ideas](product/ideas.md)                               | Backlog outside the committed release scope                        |
| [Linux handoff](archive/linux-handoff.md)               | Historical context only                                            |

[AGENTS.md](../AGENTS.md) is the agent entry point. [LICENSE](../LICENSE) covers
original code/documentation; it does not license the book's characters or images.

[Cooperative redesign](architecture/cooperative-redesign.md) records the v0.2 playtest response and supersedes the original onboarding/campaign direction.

## Naming and structure

- Root contains repository entry points and conventional files such as AGENTS.md
  and LICENSE. Product and implementation documents live under docs/.
- Directories and document filenames use English lowercase kebab-case. Content
  remains in Brazilian Portuguese where appropriate to this project.
- Use descriptive names by responsibility: requirements.md, technical-design.md,
  plan.md. Avoid session-specific names for active documents.
- Each document has one H1, then Status, Owner and Updated metadata. Dates use
  YYYY-MM-DD. Status values: draft, active, superseded, archived.
- Use relative Markdown links. Update inbound links in the same change as a move.
- Product requirements belong in product/; implementation decisions in
  architecture/; current progress in execution/; permissions in legal/.
- archive/ preserves context and never defines current infrastructure status.
- Do not duplicate canonical rules across documents. Link to their owner.
- Future accepted architectural decisions use architecture/decisions/NNNN-title.md
  with Context, Decision, Consequences and Validation sections. Do not create
  placeholder ADRs or label unverified proposals as accepted decisions.

## Current boundaries

The extensor adjustment is implemented and validated by exhaustive state search.
Requirements and technical design describe the same terminal-module support rule. The execution plan owns completion status.
This organization borrows common repository/harness conventions; it does not claim
compliance with a specific external framework.

[Opening concept](product/opening-concept.md) registra a amostra isolada de Worms em `/concept.html`, em avaliação antes de ampliar a campanha.
