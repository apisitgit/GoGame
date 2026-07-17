# UI and UX Rules

## Experience Goal

The UI should feel like a usable game and learning tool, not a marketing site. The first screen of the app should take the player toward playing and learning.

## Layout Principles

- Prioritize the active task.
- Keep game, lesson, editor, and feedback clearly separated.
- Avoid nested cards.
- Use compact panels for tools.
- Do not place important text over busy visuals.
- Design desktop first for coding lessons.

## Main Screens

Expected screens:

- Home or start screen.
- Game scene.
- Quest dialogue.
- Lesson and challenge screen.
- Skill tree.
- Progress summary.

## Game Screen

Must include:

- Phaser canvas.
- Player controls.
- Interaction prompt.
- Quest panel.
- Sound toggle.
- Exit or home control.

Prompt text example:

```text
กด E เพื่อพูดคุย
```

## Challenge Screen Layout

Preferred desktop layout:

```text
┌─────────────────────┬─────────────────────────┐
│ Lesson / Quest      │ Monaco Editor            │
│ Thai explanation    │ Go code                  │
├─────────────────────┴─────────────────────────┤
│ Console / Test Result / Hint                   │
└───────────────────────────────────────────────┘
```

Rules:

- Left panel explains the task.
- Right panel is the editor.
- Bottom panel shows result.
- Run and Submit should be visually distinct.
- Disable Submit while running.

## Typography

- Thai text must be comfortable to read.
- Do not use tiny text for lesson explanations.
- Code uses monospace.
- Do not scale font size directly with viewport width.
- Use clear hierarchy, not oversized hero headings inside tools.

## Interaction Rules

- Buttons must show loading and disabled states.
- Keyboard shortcuts should not conflict with editor typing.
- Dialogues need next and previous controls.
- Repeated key presses should not create duplicate modals.
- Errors should explain what the player can do next.

## Accessibility

Minimum expectations:

- Buttons have accessible labels.
- Contrast is readable.
- Keyboard navigation works for main UI controls.
- Important feedback is text, not color only.
- Motion should not block progress.

## Visual Style Direction

Use a warm, clear RPG interface without becoming visually noisy.

Good:

- Pixel-inspired elements.
- Clean panels.
- Readable Thai text.
- Simple icons.
- Clear quest status.

Avoid:

- Landing page hero sections for the app experience.
- Decorative gradients as the main identity.
- Too many card layers.
- Purple-only or beige-only palette.
- Text-heavy screens without interaction.

## Empty And Error States

Every major UI state should have a useful fallback:

| State | UX |
|---|---|
| No quest active | Show available NPC direction or quest list |
| Backend offline | Explain local mode or retry |
| Content load failed | Show file/id that failed if safe |
| Submission failed | Show reason and next step |
| No progress | Invite player to start first quest |

## Thai UI Copy Rules

Use friendly and direct Thai.

Prefer:

```text
โค้ดยังไม่ผ่าน ลองดู Hint ถัดไปได้ครับ
```

Avoid:

```text
Invalid submission.
```

