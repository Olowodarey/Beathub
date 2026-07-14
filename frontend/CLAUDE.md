@AGENTS.md


# CLAUDE.md

Project instructions for Claude Code. Read this before doing any work in this repo.

## Git rules — read carefully

- **Never run `git commit`.** Stage changes if useful, but leave committing to me.
- **Never run `git push`.** No exceptions, even if a task seems finished.
- **Never create a commit that includes Claude as a co-author, contributor, or in any commit trailer.** Specifically:
  - Do not add `Co-Authored-By: Claude <...>` or any similar trailer.
  - Do not mention Claude, Anthropic, or "AI-generated" in commit messages, PR descriptions, or code comments.
  - If you ever do create a commit (only if I explicitly tell you to in a given session), write the message as if I wrote it — plain, describing what changed and why, no attribution footer.
- **Never open a pull request or merge a branch** unless I explicitly ask in that session.
- If you think a commit or push is the right next step, say so and ask — don't just do it.

## Project context

Music platform admin dashboard ("Beathub") — internal tool for a music platform's team/label management, content moderation, and an ad-marketplace feature for creators to promote content.

 Currently in frontend-first phase using mock data — no backend/Prisma wiring yet unless I say otherwise.

## Roles

Role lives on `Membership`, not `User` (a user can belong to multiple teams with different roles). Three roles: `OWNER`, `ADMIN`, `MEMBER`. `MEMBER` splits into two UI personas — Creator and Label rep — driven by a `personaType` field, not a separate enum value.

Role is set at invitation time (`Invitation.role`), not inferred from Google auth. Don't build logic that tries to guess a role from email/OAuth data.

## Code style preferences

- Keep components small and colocated with the route that uses them unless something is genuinely shared across 3+ pages.
- Match existing formatting/lint config — don't introduce a new formatter or restructure config files without asking.
- Favor readable, slightly verbose code over clever one-liners.
- No new dependencies without checking with me first — tell me what you want to add and why, I'll approve or suggest an alternative.

## What to avoid

- Don't touch `.env` or any secrets files.
- Don't run database migrations against Neon without confirming with me first.
- Don't refactor unrelated code while working on a feature — flag it instead and I'll decide if it's worth doing separately.