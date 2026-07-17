# Coding Rules

## General Rules

- Prefer simple code over clever code.
- Follow existing project patterns once the codebase exists.
- Keep functions small and named by intent.
- Use types to make invalid states difficult.
- Add comments only for non-obvious business logic or safety boundaries.
- Avoid global mutable state.
- Handle errors explicitly.
- Keep formatting automated.

## TypeScript Rules

### Types

- Do not use `any` unless there is a narrow interoperability reason.
- Prefer `unknown` for untrusted data, then validate.
- Export shared domain types from feature or shared type modules.
- Use discriminated unions for state machines.

Example:

```ts
type QuestStatus = "locked" | "available" | "active" | "completed";

type SubmissionState =
  | { status: "idle" }
  | { status: "running" }
  | { status: "passed"; score: number }
  | { status: "failed"; message: string };
```

### React

- Components should be focused on rendering and interaction.
- Put reusable logic in hooks only when it has real reuse or clarity.
- Keep Phaser lifecycle out of ordinary UI components where possible.
- Dispose external instances on unmount.
- Avoid storing derived state when it can be computed.

### Frontend Testing

Test pure logic first:

- Quest state transitions.
- Hint progression.
- Local storage adapters.
- Level calculation.
- Content validation.

Avoid brittle tests that assert every pixel of game rendering.

## Phaser Rules

- Keep scenes in separate files.
- Keep config in a dedicated module.
- Avoid creating multiple Phaser game instances for the same mount point.
- Destroy Phaser instance when leaving the game screen.
- Input handling should be predictable and testable where possible.
- Collision and movement constants should be named.

## Go Rules

### Formatting

All Go code must pass:

```bash
gofmt
go test ./...
go vet ./...
```

Use `golangci-lint` later when configured.

### Error Handling

- Return errors; do not panic for normal request failures.
- Wrap errors at boundaries where context matters.
- Convert internal errors to safe API responses.
- Do not leak secrets or internal paths in user-facing messages.

### HTTP Handlers

Handlers should:

- Decode and validate request.
- Call service layer.
- Return response.

Handlers should not:

- Contain SQL.
- Calculate complex reward rules.
- Run user code.
- Know about hidden test internals.

### Services

Services own business rules:

- Quest completion.
- EXP reward.
- Submission state transition.
- Player progress.

### Repositories

Repositories own database access:

- SQL queries.
- Transactions.
- Mapping rows to domain structs.

Do not create interfaces for every repository on day one. Add interfaces when they help testing or swapping implementations.

## SQL And Database Rules

- Use migrations for schema changes.
- Use UUID for externally referenced ids.
- Store timestamps in UTC.
- Use unique constraints for duplicate reward prevention.
- Use transactions when progress and submissions change together.
- Do not trust frontend-provided EXP or reward values.

## Security Rules

Never:

- Execute user code inside the API process.
- Mount Docker socket into runner containers.
- Send hidden tests to the browser.
- Log secrets.
- Trust player id from the frontend without future auth checks.

Always:

- Validate request size.
- Apply timeouts.
- Limit output.
- Keep security boundary documented.

## Commit Style

Use concise conventional commits:

```text
chore: initialize project context
feat: add beginner village scene
fix: prevent duplicate quest reward
docs: document lesson authoring rules
test: cover quest state transitions
```

## Definition Of Done For Code Tasks

A code task is done when:

- Implementation matches the requested scope.
- Tests relevant to the risk pass.
- Formatting passes.
- Build passes when available.
- README or docs are updated if behavior changed.
- Known limitations are stated honestly.

