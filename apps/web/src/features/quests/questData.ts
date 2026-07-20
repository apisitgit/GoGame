import type { NpcDefinition, QuestDefinition } from "./types";

export const firstQuest: QuestDefinition = {
  id: "hello-gopher",
  title: "คำทักทายจาก Gopher",
  objective: 'แสดงข้อความ "สวัสดี Gopher" ด้วยโปรแกรม Go',
  rewardExp: 100,
  statusWhenNew: "available",
};

export const professorGopher: NpcDefinition = {
  id: "professor-gopher",
  name: "Professor Gopher",
  role: "อาจารย์ประจำ Beginner Village",
  prompt: "กด E เพื่อพูดคุย",
  questId: firstQuest.id,
  dialogue: [
    {
      id: "go-backend-intro",
      speaker: "Professor Gopher",
      text: "ยินดีต้อนรับสู่ Beginner Village นะครับ Go เป็นภาษาโปรแกรมที่เรียบง่าย อ่านตรงไปตรงมา และเหมาะมากกับงาน Backend ที่ต้องเร็วและดูแลง่าย",
    },
    {
      id: "package-main",
      speaker: "Professor Gopher",
      text: "ถ้าอยากให้ไฟล์ Go รันเป็นโปรแกรมได้ เราจะเริ่มจาก package main เหมือนป้ายบอกว่าไฟล์นี้คือทางเข้าหลักของโปรแกรม",
    },
    {
      id: "func-main",
      speaker: "Professor Gopher",
      text: "จากนั้น func main คือฟังก์ชันแรกที่โปรแกรมเรียกเมื่อเริ่มทำงาน เปรียบเหมือนประตูหน้าหมู่บ้านที่ทุกคนต้องผ่านก่อน",
    },
    {
      id: "fmt-println",
      speaker: "Professor Gopher",
      text: "ส่วน fmt.Println ใช้แสดงข้อความออกมาทางหน้าจอ เหมือนให้โปรแกรมพูดประโยคหนึ่งให้เราเห็น",
    },
    {
      id: "quest-offer",
      speaker: "Professor Gopher",
      text: 'ภารกิจแรกของคุณคือทำให้โปรแกรมแสดงคำว่า "สวัสดี Gopher" แล้วเราจะค่อยต่อยอดไปสู่บทเรียนถัดไป',
    },
  ],
  completedDialogue: [
    {
      id: "completed",
      speaker: "Professor Gopher",
      text: "เยี่ยมครับ ภารกิจทักทายพร้อมแล้ว ขั้นถัดไปเราจะเปิดพื้นที่เขียนโค้ดจริงให้คุณลองใช้ package main, func main และ fmt.Println",
    },
  ],
};

export const questDefinitions = [firstQuest];
export const npcDefinitions = [professorGopher];
