# Go Quest Development Runner

`apps/runner` เป็น service แยกสำหรับรัน Go code และ Go tests ใน local development

## Security Boundary

Runner นี้ช่วยแยกการรัน code ออกจาก API process แต่ยังไม่ใช่ production sandbox สำหรับเปิด public

สิ่งที่ runner ทำแล้ว:

- API หลักไม่ใช้ `os/exec` กับ user code
- รับเฉพาะภาษา Go
- จำกัดขนาด source code
- จำกัด runtime ด้วย timeout
- จำกัดขนาด stdout และ stderr
- สร้าง temporary workspace ต่อ submission และลบทิ้งหลังจบ
- ใช้ environment variables แบบจำกัด ไม่ส่ง database URL หรือ secret เข้า execution command
- ปิด external module download ด้วย `GOFLAGS=-mod=readonly`
- reject import ที่เสี่ยง เช่น `os`, `os/exec`, `net`, `syscall`, `unsafe`
- ใช้ Go build cache เฉพาะใน `/tmp` ของ runner container เพื่อให้ local feedback ไม่ timeout จาก cold compile ทุกครั้ง

สิ่งที่ runner ยังไม่ได้รับประกัน:

- ยังไม่ได้ใช้ gVisor, Firecracker, nsjail หรือ sandbox runtime ระดับ production
- ยังไม่ได้ปิด network ต่อ process ด้วย kernel-level isolation
- ยังไม่ได้จำกัด CPU, memory และ process ด้วย cgroup ต่อ submission
- ยังไม่เหมาะกับการเปิดให้ผู้ใช้สาธารณะส่ง code โดยตรง

## API

### GET /health

ตรวจสถานะ runner

### POST /run

Request:

```json
{
  "language": "go",
  "sourceCode": "package main\n\nimport \"fmt\"\n\nfunc main() {\n    fmt.Println(\"สวัสดี Gopher\")\n}\n"
}
```

For server-managed tests, API may call the same endpoint with `command: "test"` and a trusted `testSource`:

```json
{
  "language": "go",
  "command": "test",
  "sourceCode": "package main\n\nfunc main() {}\n",
  "testSource": "package main\n\nimport \"testing\"\n\nfunc TestSomething(t *testing.T) {}\n"
}
```

Browser clients must not send `testSource` directly. In Go Quest, only the API service attaches hidden tests before forwarding work to runner.

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
- `failed`
- `compile_error`
- `runtime_error`
- `timeout`
- `rejected`
- `internal_error`

## Local Run

```bash
go run ./cmd/runner
```

หรือรันผ่าน Docker Compose จาก root repo:

```bash
docker compose up runner
```
