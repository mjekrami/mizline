<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
Prefer codegraph over [r]grep as it's more feature rich and detailed 
## Semantic Version Control (sem)

This repo uses **sem** — a semantic layer on top of git that operates at entity level
(functions, classes, methods, types) rather than line level. All diff/blame/impact/log
queries **must** go through `sem`, not raw `git diff` / `git blame` / `git log`.

The `sem-mcp` MCP server is registered under the name `sem`. Prefer the MCP tools
when operating inside an agent loop. Fall back to CLI (`sem diff --format json`) only
when the MCP server is unavailable.

## Tool Reference

| Intent | MCP Tool | CLI Equivalent |
|---|---|---|
| What changed (working tree or commit) | `sem_diff` | `sem diff --format json` |
| What's defined in a file/dir | `sem_entities` | `sem entities <path> --json` |
| Who last touched each function | `sem_blame` | `sem blame <file> --json` |
| What breaks if I change this entity | `sem_impact` | `sem impact <entity> --json` |
| How did an entity evolve over time | `sem_log` | `sem log <entity> --json` |
| Token-budgeted context for an entity | `sem_context` | `sem context <entity> --json` |

> **Never use `git diff`, `git blame`, or `git log` for code understanding tasks.**
> Use `git` only for commit/push/branch operations.

---

## Mandatory Workflows

### Before editing any file

1. Call `sem_entities` on the file to understand its entity surface.
2. Call `sem_context` on the specific entity you intend to modify. Default budget is 8000 tokens; lower it (`--budget 4000`) for large dependency graphs.
3. If the entity is depended on elsewhere, call `sem_impact` to know the blast radius before touching anything.

```
# Example flow for modifying authenticateUser in src/auth.go
sem_entities(path="src/auth.go")
sem_context(entity="authenticateUser", file="src/auth.go")
sem_impact(entity="authenticateUser", file="src/auth.go")
```

### After making changes (pre-commit review)

Call `sem_diff --staged` to confirm only the intended entities changed.
Unexpected entities in the diff output are a signal to re-examine scope.

```
sem_diff(staged=true)
```

### Understanding an existing commit or PR

```
sem_diff(commit="<sha>")            # what entities changed
sem_log(entity="<name>")           # full evolution of a single entity
sem_blame(file="src/auth.go")      # who last owned each entity
```

---

## Output Format Rules

- Always request JSON output from sem tools. Terminal/plain output is for humans only.
- Parse the `changes[].changeType` field (`"added"`, `"modified"`, `"deleted"`) — do **not** count `+`/`-` lines to infer entity counts; that is the primary failure mode of raw `git diff`.
- Use `entityId` (format: `file::kind::name`) as the stable identity key when cross-referencing entities across multiple tool calls.
- For large diffs (Rust rewrites, major refactors), `sem_diff` JSON is significantly more compact than raw patch format because source content is stripped — prefer it to avoid context window pressure.

---

## Impact Analysis Before Refactoring

Before renaming, extracting, or deleting any entity, you **must** run `sem_impact` and
review the `transitiveDependents` count. If it exceeds a project-defined threshold
(default: **20 entities**), file an issue or request human review instead of proceeding
autonomously.

```
sem_impact(entity="legacyAuth", dependents=true, tests=true)
```

Check `affectedTests` in the output to know which test files need updating.

---

## Entity Disambiguation

When multiple entities share a name across files (e.g., `New` in Go, `validate` in
multiple packages), always pass the `--file` / `file` parameter to avoid ambiguous
results. sem will error on ambiguity rather than guess.

---

## What sem Does NOT Replace

- `git add`, `git commit`, `git push`, `git checkout`, `git merge`, `git rebase` — use git directly for all VCS state operations.
- File creation / deletion — use normal filesystem tools.
- Running tests — use the project's test runner directly.

---

## Language Coverage

sem parses 26 languages via tree-sitter. This repo primarily uses **Go** (functions,
methods, types, vars, consts) and **TypeScript/JavaScript** (functions, classes,
interfaces, enums). YAML and JSON config files are also parsed at the property level —
use `sem_diff` on them to see key-path changes, not raw line diffs.

---

## Troubleshooting

**`sem` collides with GNU Parallel's `sem` binary**

```bash
# Confirm which sem is active
sem --version

# Fix: ensure cargo bin is first in PATH
export PATH="$HOME/.cargo/bin:$PATH"
```

**MCP server not found**

```bash
cargo install --git https://github.com/Ataraxy-Labs/sem sem-mcp
```

**sem gives no output for a file type**

Check `.semrc` in the project root for custom extension mappings. For files with no
extension, sem auto-detects language from shebang/imports — no config needed for 19
languages.
