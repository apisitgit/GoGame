# Project Philosophy

## Core Belief

Go Quest exists because many people do not learn deeply by reading syntax in order. They learn by trying, failing safely, seeing feedback, and solving memorable problems. The game should respect that learning style.

The product philosophy is:

> Build a real game that happens to teach Go.

Not:

> Build a course and decorate it with game elements.

## What The Game Is

Go Quest is a learning RPG where each programming concept is introduced through a concrete problem in the game world. The player should remember why a concept exists before memorizing how to type it.

Example:

| Weak Course Approach | Go Quest Approach |
|---|---|
| "This is a variable. Syntax is `x := 10`." | "The merchant needs a box to remember today's coins. That box is a variable." |
| "A pointer stores an address." | "The healer needs to change the original patient record, not a copy." |
| "Use goroutines for concurrency." | "One worker is too slow. Hire multiple workers and watch tasks finish faster." |

## Product Principles

### 1. Problem Before Syntax

Every lesson must start with a problem:

- What is broken?
- Who needs help?
- Why does the current approach fail?
- What new Go concept solves the problem?

Syntax comes after motivation.

### 2. Visual Before Abstract

If a concept is invisible in normal code, the game should visualize it.

Important visual concepts:

- Variables as labeled boxes
- Pointers as arrows to memory cells
- Slices as windows over arrays
- Maps as key-to-bucket-to-value flow
- Goroutines as concurrent workers
- Channels as message paths
- Mutexes as locks and waiting queues
- Garbage collection as unreachable objects being cleaned

### 3. Feedback Must Be Fast

The player should rarely wait long without knowing what happened. After an action, show one of:

- Success
- Compile error
- Test failure
- Hint
- Visual change
- Quest progress
- Reward

### 4. Failure Is A Learning Tool

Wrong answers should not shame the player. They should reveal the next useful clue.

Bad:

```text
Wrong answer.
```

Good:

```text
โค้ดรันได้แล้ว แต่ผลลัพธ์ยังไม่ตรงกับที่ภารกิจต้องการ
ลองตรวจดูว่าข้อความใน fmt.Println ตรงกับ "สวัสดี Gopher" หรือไม่
```

### 5. Thai First, Technical Accuracy Always

The explanation should be Thai-first but technically correct.

Use Thai for understanding:

```text
ฟังก์ชันคือชุดคำสั่งที่ตั้งชื่อไว้ เพื่อเรียกใช้ซ้ำได้
```

Keep English terms when they matter:

```text
ฟังก์ชัน (function)
พารามิเตอร์ (parameter)
ค่าที่คืนกลับ (return value)
```

### 6. Real Work Matters

The end goal is job readiness, not only tutorial completion. Later missions must simulate backend developer work:

- Read requirements
- Implement API endpoints
- Handle errors
- Write tests
- Read logs
- Debug incidents
- Optimize SQL
- Review pull requests
- Deploy with Docker

### 7. MVP Must Stay Small

Start with one excellent playable lesson. A polished first quest is more valuable than ten shallow systems.

Do not add these in the first playable slice:

- AI Tutor
- Multiplayer
- Redis
- Kubernetes
- Complex inventory
- Real money shop
- Full account system
- Microservice architecture

## Design Promise

When in doubt, choose the option that makes the player say:

```text
อ๋อ เข้าใจแล้วว่าทำไมต้องใช้สิ่งนี้
```

not merely:

```text
จำ syntax ได้แล้ว
```

