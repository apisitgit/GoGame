# Go Quest

Go Quest คือโปรเจกต์เกม RPG สำหรับเรียนภาษา Go เป็นภาษาไทย ตั้งแต่พื้นฐานจนถึงระดับใช้งานจริงในงาน backend

ตอนนี้ repo อยู่ในช่วง Goal 3: เพิ่ม Professor Gopher และ Quest แรก เพื่อให้ผู้เล่นเริ่ม core loop แบบ RPG ได้

## AI Context

เอกสารกำกับโปรเจกต์อยู่ในโฟลเดอร์ [.ai](./.ai/README.md)

เริ่มอ่านจาก:

1. [.ai/README.md](./.ai/README.md)
2. [.ai/PROJECT_PHILOSOPHY.md](./.ai/PROJECT_PHILOSOPHY.md)
3. ไฟล์เฉพาะด้านตามงาน เช่น architecture, content, UI, gameplay หรือ workflow

## Product Direction

หลักคิดสำคัญ:

- เกมนี้คือ RPG ที่สอน Go ไม่ใช่คอร์สออนไลน์ที่มีเกมตกแต่ง
- ทุกบทเรียนต้องเริ่มจากปัญหาจริงก่อน syntax
- คำอธิบายต้องเป็นภาษาไทยที่เข้าใจง่าย แต่ศัพท์เทคนิคต้องแม่น
- MVP แรกควรเป็น vertical slice ที่เล่นจบด่านแรกได้จริง

## Project Structure

```text
.
├── apps/
│   ├── api/          # Go + Gin backend
│   └── web/          # React + TypeScript + Vite frontend
├── content/          # Future lesson and quest content
├── infrastructure/   # Future migrations and deployment support
├── .ai/              # AI/project context rules
├── docker-compose.yml
└── README.md
```

## Requirements

- Node.js 22.13+ LTS หรือ Node.js 24+
- npm 11 หรือใกล้เคียง
- Go 1.23 ขึ้นไป สำหรับรัน backend นอก Docker
- Docker และ Docker Compose สำหรับรันทั้งระบบแบบ local development

## Environment

คัดลอกไฟล์ตัวอย่างก่อนรันแบบ manual:

```bash
cp apps/web/.env.example apps/web/.env
cp apps/api/.env.example apps/api/.env
```

ค่าหลัก:

| Variable | Purpose |
|---|---|
| `VITE_API_BASE_URL` | URL ของ backend สำหรับ frontend |
| `API_PORT` | port ของ Go API |
| `CORS_ALLOWED_ORIGIN` | origin ของ frontend ที่ backend อนุญาต |
| `DATABASE_URL` | PostgreSQL connection string; local Docker ใช้ host port `5433` |

## Run With Docker Compose

```bash
docker compose up --build
```

เปิดเว็บ:

```text
http://localhost:5173
```

ตรวจ backend:

```text
http://localhost:8080/health
```

## Run Manually

Frontend:

```bash
cd apps/web
npm install
npm run dev
```

Backend:

```bash
cd apps/api
go mod download
go run ./cmd/api
```

## Checks

Frontend:

```bash
cd apps/web
npm run lint
npm run test
npm run build
```

Backend:

```bash
cd apps/api
gofmt -w .
go test ./...
go vet ./...
```

## Security Notes

- `CORS_ALLOWED_ORIGIN` ต้องเป็น origin เฉพาะเจาะจง ห้ามใช้ `*`
- API มี request timeout และ security headers ตั้งแต่ foundation
- API ยังไม่รันโค้ดของผู้เล่น และห้ามเพิ่มการรัน user code ใน API process
- ระบบรัน Go code ต้องเป็น service แยกใน goal ภายหลัง พร้อม timeout, resource limit และ sandbox boundary
- Docker Compose ใช้ `no-new-privileges` กับ web และ api service

## Current Scope

มีแล้ว:

- React/Vite frontend
- Go/Gin backend
- `GET /health`
- frontend health status
- หน้า `/play` สำหรับ Beginner Village
- Phaser scene พร้อม player movement ด้วย `WASD` และ arrow keys
- collision กับขอบโลกและสิ่งกีดขวาง
- camera follow
- UI คำแนะนำภาษาไทย, ปุ่มเสียงแบบ placeholder และปุ่ม Home
- Professor Gopher ใน Beginner Village
- interaction prompt `กด E เพื่อพูดคุย`
- dialogue ภาษาไทยสำหรับ `package main`, `func main` และ `fmt.Println`
- Quest Panel สำหรับภารกิจ `คำทักทายจาก Gopher`
- quest state `locked`, `available`, `active`, `completed`
- บันทึก quest progress ผ่าน `localStorage` ชั่วคราว
- Reset Progress สำหรับ development
- PostgreSQL service ใน Docker Compose
- `.gitignore`
- context rules ใน `.ai/`

ยังไม่มี:

- Login
- AI Tutor
- Monaco challenge screen
- Code runner
- Database schema/migrations จริง
- backend-backed progress และ EXP จริง

## Next Step

Goal ถัดไปที่แนะนำคือสร้าง Lesson Content ภาษาไทยสำหรับ Hello World โดยแยกข้อมูลบทเรียนออกจาก React component
