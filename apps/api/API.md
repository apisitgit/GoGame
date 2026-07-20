# Go Quest API

Base path:

```text
/api/v1
```

## Security Boundary

Goal 6 stores learning progress and submission metadata only.

The API does not:

- run user code
- accept hidden tests from the browser
- store full source code
- calculate trust from frontend-provided EXP

Code execution must be implemented later as a separate runner service with sandboxing.

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
