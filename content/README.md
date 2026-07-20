# Go Quest Content

โฟลเดอร์นี้เก็บเนื้อหา lesson และ quest แยกจาก application source code เพื่อให้เพิ่มบทเรียนได้โดยไม่ต้องแก้ React component หลัก

โครงสร้างปัจจุบัน:

```text
content/
├── lessons/
│   └── hello-world.json
└── quests/          # reserved for future quest content
```

## Lesson Format

ช่วง MVP ใช้ JSON ก่อน เพราะ frontend มี TypeScript JSON import อยู่แล้วและยังไม่ต้องเพิ่ม dependency สำหรับ YAML parser

ทุก lesson ต้องมีข้อมูลหลัก:

- `id`
- `questId`
- `title`
- `world`
- `concepts`
- `story`
- `problem`
- `objective`
- `explanation.sections`
- `visual.steps`
- `syntax`
- `starterCode`
- `expectedOutput`
- `challenge`
- `publicExamples`
- `hints`
- `commonMistakes`
- `summary`
- `nextUnlock`

Schema validation อยู่ที่:

```text
apps/web/src/features/lessons/lessonSchema.ts
```

Registry ที่ผูก lesson กับ quest อยู่ที่:

```text
apps/web/src/features/lessons/lessonRegistry.ts
```

## Add A New Lesson

1. สร้างไฟล์ใหม่ใต้ `content/lessons`
2. ใช้ `hello-world.json` เป็น template
3. ตั้ง `questId` ให้ตรงกับ quest ที่ต้องการผูก
4. เพิ่ม import และ register ใน `lessonRegistry.ts`
5. เพิ่มหรือปรับ test ให้ content ใหม่ผ่าน schema
6. รันคำสั่งตรวจสอบ

```bash
cd apps/web
npm run lint
npm run test
npm run build
```

## Content Quality Checklist

- เริ่มจากปัญหาในเกมก่อน syntax
- ใช้ภาษาไทยอ่านง่าย
- เก็บ English technical term ที่สำคัญ เช่น `package`, `function`, `import`
- Hint เรียงจากช่วยคิดไปหาช่วยโครงสร้าง ไม่เฉลยทั้งหมดทันที
- Common mistakes ต้องให้ feedback ที่ช่วยแก้ต่อได้
- ห้ามใส่ hidden test case ในไฟล์ที่ frontend โหลดได้
