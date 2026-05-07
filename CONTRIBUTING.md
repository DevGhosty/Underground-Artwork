# Contributing

This is a collaborative class project. Keep changes small, focused, and easy for
teammates to review.

## Branches

- `main`: **release-ready V1 only.** Do not merge or push here until the team
  agrees the product is a **solid V1** (stable demo, agreed scope). Until then,
  treat `main` as frozen.
- `development`: shared integration branch — **all day-to-day work lands here**
  first.
- `feature/*`: one branch per feature or task, **always created from
  `development`** (never from `main` while `main` is frozen).

Use branch names that describe the work, for example:

- `feature/listings`
- `feature/api-scaffold`
- `feature/auth`
- `feature/schema`
- `feature/search-map`

Workflow: `git checkout development && git pull`, then
`git checkout -b feature/your-feature`.

## Pull Requests

Open pull requests **from `feature/*` into `development`** for all new work.

**Do not** open PRs into `main` or merge `development` → `main` until V1 is
explicitly approved. When V1 is ready, merge `development` into `main` once
(optional: tag `v1.0.0`), then continue using `feature/*` → `development` for
V1.1+.

Before asking for review:

- Confirm the app still runs.
- Mention any database schema changes.
- Include screenshots for visible UI changes.
- Note any known limitations or follow-up work.

## Product Rules

- Do not add online payment or checkout flows.
- Keep seller locations approximate.
- Prioritize local discovery, seller contact, and offline meetups.
- Make authenticity cues visible through listing details, photos, seller
  profiles, and artwork stories without claiming formal verification.
