import type { MockRunResult } from "./types";

const PRINTLN_PATTERN = /fmt\.Println\(\s*"([^"]*)"\s*\)/;

export function runMockGoChallenge(
  sourceCode: string,
  expectedOutput: string,
): MockRunResult {
  const printedText = extractPrintedText(sourceCode);

  if (!sourceCode.includes("package main")) {
    return {
      status: "failed",
      stdout: "",
      message: "ยังไม่พบ package main ซึ่งเป็นจุดเริ่มของโปรแกรม Go ที่รันได้",
    };
  }

  if (!sourceCode.includes('import "fmt"')) {
    return {
      status: "failed",
      stdout: "",
      message: "ยังไม่พบ import \"fmt\" ก่อนใช้ fmt.Println",
    };
  }

  if (!printedText) {
    return {
      status: "failed",
      stdout: "",
      message: "ยังไม่พบคำสั่ง fmt.Println(\"...\") สำหรับแสดงข้อความ",
    };
  }

  if (printedText !== expectedOutput) {
    return {
      status: "failed",
      stdout: printedText,
      message: `โค้ดรันแบบจำลองได้แล้ว แต่ output ต้องเป็น "${expectedOutput}"`,
    };
  }

  return {
    status: "passed",
    stdout: printedText,
    message: "ผ่านแล้วครับ โปรแกรมแสดงข้อความตรงกับภารกิจ",
  };
}

function extractPrintedText(sourceCode: string): string | null {
  return sourceCode.match(PRINTLN_PATTERN)?.[1] ?? null;
}
