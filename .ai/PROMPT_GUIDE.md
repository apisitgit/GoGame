# Prompt Guide

Use these prompts as starting points for future AI tasks. Adjust scope before sending.

## Create Project Foundation

```text
สร้างโครงสร้างเริ่มต้นของ Go Quest ตาม .ai context

ต้องทำ:
- Monorepo apps/web และ apps/api
- Frontend React + TypeScript + Vite
- Backend Go + Gin
- GET /health
- Frontend เรียก health endpoint
- Docker Compose สำหรับ development
- README ภาษาไทย

ห้ามทำ:
- Login
- AI Tutor
- Redis
- Code runner
- Multiplayer

ตรวจ:
- frontend build
- backend test
- health endpoint
```

## Add Beginner Village

```text
เพิ่มหน้า /play สำหรับ Beginner Village

ต้องทำ:
- Phaser scene แยกไฟล์
- ตัวละครเดินด้วย WASD และ Arrow Keys
- collision กับขอบฉาก
- camera follow
- UI คำแนะนำภาษาไทย
- destroy Phaser instance เมื่อออกจากหน้า

ตรวจ:
- เปิดหน้า /play ได้
- refresh แล้วไม่พัง
- build และ test ผ่าน
```

## Add NPC And Quest

```text
เพิ่ม Professor Gopher และ Quest แรก "คำทักทายจาก Gopher"

ต้องทำ:
- interaction prompt "กด E เพื่อพูดคุย"
- dialogue ภาษาไทย
- accept quest
- quest panel
- localStorage progress ชั่วคราว
- reset progress สำหรับ dev

ห้ามทำ:
- Monaco editor
- backend progress
- code runner
```

## Add Lesson Content

```text
สร้างระบบ lesson content แยกจาก source code

ต้องทำ:
- schema validation
- lesson Hello World ภาษาไทย
- starter code
- expected output
- hints 3 ระดับ
- common mistakes
- content README

ตรวจ:
- valid content load ได้
- invalid content ถูก reject
```

## Add Monaco Editor

```text
เพิ่ม coding challenge screen ด้วย Monaco Editor

ต้องทำ:
- โหลด starter code จาก lesson content
- draft ใน localStorage
- run/submit/reset/hint
- mock runner ตรวจ output "สวัสดี Gopher"
- submit ผ่านแล้ว quest completed

ห้ามทำ:
- ส่ง code ไป backend
- ใช้ eval
- AI tutor
```

## Review Prompt

```text
ช่วย review งานล่าสุดแบบ code review

ให้เน้น:
- bug
- security risk
- behavior regression
- missing tests
- architecture drift จาก .ai context

ตอบโดยเรียง findings ตาม severity พร้อม file และ line
```

## Context Refresh Prompt

```text
ก่อนเริ่มงานนี้ ให้อ่าน .ai/README.md และไฟล์ context ที่เกี่ยวข้อง
จากนั้นสรุปสั้น ๆ ว่ากติกาไหนสำคัญกับงานนี้ที่สุด แล้วลงมือทำ
```

