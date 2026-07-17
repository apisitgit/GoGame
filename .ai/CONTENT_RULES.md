# Content Rules

## Content Goal

Lesson content should make Go understandable for Thai learners through story, visuals, examples, and practice.

Content is part of the game, not separate documentation.

## Lesson Structure

Every lesson should include:

1. Story context.
2. Problem.
3. Concept explanation.
4. Visual explanation.
5. Go syntax.
6. Starter code.
7. Challenge objective.
8. Public examples.
9. Hints.
10. Common mistakes.
11. Summary.
12. Next unlock.

## Suggested Content Schema

```yaml
id: hello-world-001
title: คำทักทายจาก Gopher
world: beginner-village
concepts:
  - package-main
  - func-main
  - fmt-println
story:
  npc: professor-gopher
  text: Professor Gopher อยากให้คุณส่งคำทักทายแรกให้หมู่บ้าน
objective:
  text: แสดงข้อความ "สวัสดี Gopher" ออกทางหน้าจอ
explanation:
  sections:
    - title: package main คืออะไร
      body: ...
starter_code: |
  package main

  import "fmt"

  func main() {
      // เขียนโค้ดตรงนี้
  }
expected_output: "สวัสดี Gopher"
hints:
  - ลองใช้ fmt.Println เพื่อพิมพ์ข้อความ
  - ข้อความต้องอยู่ในเครื่องหมายคำพูด
  - รูปแบบคือ fmt.Println("ข้อความ")
common_mistakes:
  - ลืม import fmt
  - สะกด Println ผิด
  - ลืมเครื่องหมายคำพูด
summary: ...
```

## Thai Explanation Style

Use:

- Simple Thai.
- Short paragraphs.
- Technical English in parentheses.
- Concrete examples.
- Friendly tone.

Avoid:

- Long textbook paragraphs.
- Translating terms into unnatural Thai.
- Explaining syntax before motivation.
- Giving full solution too early.

## Technical Term Policy

| English | Thai Explanation |
|---|---|
| variable | ตัวแปร หรือกล่องเก็บข้อมูล |
| function | ฟังก์ชัน หรือชุดคำสั่งที่ตั้งชื่อไว้ |
| parameter | ค่าที่รับเข้ามาในฟังก์ชัน |
| return value | ค่าที่ฟังก์ชันส่งกลับ |
| pointer | ตัวชี้ไปยังตำแหน่งข้อมูล |
| goroutine | งานย่อยที่ Go รันพร้อมกันได้ |
| channel | ช่องทางส่งข้อมูลระหว่าง goroutine |

## Hint Rules

Hints must be ordered from least revealing to most revealing.

Bad:

```text
ใส่ fmt.Println("สวัสดี Gopher")
```

Good:

```text
Hint 1: ภารกิจนี้ต้องแสดงข้อความออกทางหน้าจอ
Hint 2: คำสั่งที่ใช้พิมพ์ข้อความคือ fmt.Println
Hint 3: ข้อความที่ต้องแสดงต้องอยู่ในเครื่องหมาย "..."
```

## Common Mistakes

Every lesson should list likely mistakes and helpful feedback.

Example:

| Mistake | Feedback |
|---|---|
| Missing import | ต้อง import package `fmt` ก่อนใช้ `fmt.Println` |
| Wrong output | ข้อความที่พิมพ์ออกมาต้องตรงกับโจทย์ทุกตัวอักษร |
| Syntax error | ลองตรวจวงเล็บและเครื่องหมายคำพูด |

## Content Review Checklist

- The lesson starts with a real problem.
- Thai explanation is readable for beginners.
- English technical terms are preserved where useful.
- Hints do not reveal the full answer immediately.
- Challenge objective is testable.
- Common mistakes include helpful feedback.
- Content can be loaded without editing UI components.

