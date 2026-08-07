# Go Quest API

Base path:

```text
/api/v1
```

## Security Boundary

Goal 8 stores learning progress, submission metadata, and proxies development code runs/tests to a separate runner service.

The API does not:

- run user code
- accept hidden tests from the browser
- store full source code
- calculate trust from frontend-provided EXP

Code execution boundary:

- `/api/v1/code/run` validates request size and forwards source code to `apps/runner`.
- `/api/v1/code/submit` validates request size, selects server-managed test cases, forwards source and tests to `apps/runner`, then stores the submission result.
- The API process must not import `os/exec` or call `exec.Command` for user code.
- `apps/runner` is development-only. It applies timeout, source size, output cap, temporary workspace, and import guardrails.
- Hidden test source lives in backend challenge validation code and must not be returned to the browser.
- The runner is not a production sandbox yet. Do not expose it publicly without stronger isolation such as gVisor, Firecracker, nsjail, cgroup limits, and network isolation.

## Error Response

```json
{
  "error": {
    "code": "invalid_request",
    "message": "ข้อมูลที่ส่งมาไม่ถูกต้อง",
    "details": {}
  }
}
```

## Endpoints

### GET /health

Returns service health.

### GET /api/v1/lessons

Returns lesson metadata.

### GET /api/v1/lessons/:id

Returns one lesson metadata record.

### GET /api/v1/progress/:playerId

`playerId` must be a UUID. The backend creates a local player record if it does not exist.

Response:

```json
{
  "playerId": "11111111-1111-4111-8111-111111111111",
  "totalExp": 100,
  "quests": [
    {
      "questId": "hello-gopher",
      "status": "completed",
      "earnedExp": 100,
      "completedAt": "2026-07-20T09:00:00Z",
      "updatedAt": "2026-07-20T09:00:00Z"
    }
  ]
}
```

### PUT /api/v1/progress/:playerId

Updates one quest progress state. EXP is calculated by backend when status becomes `completed`.

Request:

```json
{
  "questId": "hello-gopher",
  "status": "active"
}
```

Allowed statuses:

- `locked`
- `available`
- `active`
- `completed`

### POST /api/v1/code/run

Runs Go source code through the development runner service.

Request:

```json
{
  "questId": "hello-gopher",
  "lessonId": "hello-world-001",
  "sourceCode": "package main\n\nimport \"fmt\"\n\nfunc main() {\n    fmt.Println(\"สวัสดี Gopher\")\n}\n"
}
```

Response:

```json
{
  "status": "passed",
  "stdout": "สวัสดี Gopher\n",
  "stderr": "",
  "message": "โปรแกรมรันสำเร็จ",
  "executionTimeMs": 300,
  "outputTruncated": false
}
```

Possible statuses:

- `passed`
- `compile_error`
- `runtime_error`
- `timeout`
- `rejected`
- `internal_error`

Notes:

- This endpoint is for development runner feedback only.
- This endpoint does not store a submission or grant EXP.

### POST /api/v1/code/submit

Submits Go source code for server-managed test validation. The browser sends only source code and ids; it does not send test cases.

Request:

```json
{
  "playerId": "11111111-1111-4111-8111-111111111111",
  "questId": "hello-gopher",
  "lessonId": "hello-world-001",
  "sourceCode": "package main\n\nimport \"fmt\"\n\nfunc main() {\n    fmt.Println(\"สวัสดี Gopher\")\n}\n"
}
```

Response:

```json
{
  "status": "passed",
  "stdout": "ผ่าน test cases",
  "stderr": "",
  "message": "ผ่านแล้วครับ โปรแกรมผ่าน test cases ของภารกิจ",
  "executionTimeMs": 300,
  "outputTruncated": false,
  "tests": {
    "passed": 2,
    "failed": 0,
    "total": 2,
    "score": 100
  },
  "submissionId": "33333333-3333-4333-8333-333333333333"
}
```

Notes:

- Hidden test implementation is not included in the response.
- Passed submissions complete the quest through the same backend transaction used by `POST /api/v1/submissions`.
- Failed, compile error, runtime error, and timeout submissions are also stored as submission metadata.
- EXP is still protected by the existing progress upsert rule, so repeated passed submissions do not grant duplicate EXP.

### POST /api/v1/submissions

Creates submission metadata. Do not send full source code.

Request:

```json
{
  "playerId": "11111111-1111-4111-8111-111111111111",
  "questId": "hello-gopher",
  "lessonId": "hello-world-001",
  "sourceSize": 82,
  "status": "passed",
  "stdoutPreview": "สวัสดี Gopher",
  "feedback": "ผ่านแล้วครับ โปรแกรมแสดงข้อความตรงกับภารกิจ"
}
```

Allowed statuses:

- `passed`
- `failed`
- `compile_error`
- `runtime_error`
- `timeout`
- `internal_error`

When status is `passed`, the backend completes the quest and grants EXP only once.

### GET /api/v1/submissions/:id

Returns one submission metadata record.
