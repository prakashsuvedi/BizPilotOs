# Commit Message Guidelines & Standards

This repository strictly enforces [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) to ensure readable, structured, and clear git commit history.

---

## 1. Structure of a Commit Message

Each commit message consists of a **header**, an optional **body**, and an optional **footer**:

```text
<type>(<scope>): <short summary>

[optional body]

[optional footer(s)]
```

---

## 2. Mandatory Types

| Type | Description |
| :--- | :--- |
| **`feat`** | A new user-facing capability or feature |
| **`fix`** | A bug fix or runtime patch |
| **`docs`** | Documentation changes only (e.g., `README.md`, comments) |
| **`style`** | Code formatting, missing semi-colons, no logic change |
| **`refactor`** | Code refactoring that neither fixes a bug nor adds a feature |
| **`perf`** | Code changes that improve performance |
| **`test`** | Adding missing unit/integration tests or updating tests |
| **`build`** | Changes affecting the build system or external dependencies |
| **`ci`** | Changes to CI/CD workflows and configuration files |
| **`chore`** | Maintenance tasks, repository housekeeping, release version increments |

---

## 3. Rules & Examples

- **Use imperative mood in summary**: `"add feature"` not `"added feature"` or `"adds feature"`.
- **Do not capitalize the first letter** of the summary line.
- **No dot/period (`.`)** at the end of the summary line.

### Examples

```bash
# Good commit messages
git commit -m "feat(auth): integrate multi-factor authentication fallback"
git commit -m "fix(smtp): eliminate missing require module failure in ES bundling"
git commit -m "chore(deps): update vite and tailwind packages"
git commit -m "docs(api): update OpenAPI schemas for enterprise endpoints"
```

---

## 4. Git Hooks & Automated Enforcement

Commitlint is configured via `.commitlintrc.json`. Git hooks verify every commit attempt before execution.
