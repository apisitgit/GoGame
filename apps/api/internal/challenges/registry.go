package challenges

import "fmt"

type ValidationSpec struct {
	QuestID        string
	LessonID       string
	TestSource     string
	SuccessMessage string
	FailureMessage string
}

var specs = map[string]ValidationSpec{
	specKey("hello-gopher", "hello-world-001"): {
		QuestID:        "hello-gopher",
		LessonID:       "hello-world-001",
		TestSource:     helloWorldTestSource,
		SuccessMessage: "ผ่านแล้วครับ โปรแกรมผ่าน test cases ของภารกิจ",
		FailureMessage: "Test ยังไม่ผ่าน ลองตรวจว่าใช้ fmt.Println และข้อความตรงกับ \"สวัสดี Gopher\" ทุกตัวอักษร",
	},
}

func GetValidationSpec(questID string, lessonID string) (ValidationSpec, bool) {
	spec, ok := specs[specKey(questID, lessonID)]
	return spec, ok
}

func specKey(questID string, lessonID string) string {
	return fmt.Sprintf("%s/%s", questID, lessonID)
}

const helloWorldTestSource = `package main

import (
	"go/ast"
	"go/parser"
	"go/token"
	"io"
	"os"
	"strings"
	"testing"
)

func TestMainPrintsThaiGreeting(t *testing.T) {
	originalStdout := os.Stdout
	reader, writer, err := os.Pipe()
	if err != nil {
		t.Fatal("ไม่สามารถเตรียมตัวจับ output ได้")
	}

	os.Stdout = writer
	main()
	_ = writer.Close()
	os.Stdout = originalStdout

	outputBytes, err := io.ReadAll(reader)
	if err != nil {
		t.Fatal("ไม่สามารถอ่าน output ได้")
	}

	output := strings.TrimRight(string(outputBytes), "\r\n")
	if output != "สวัสดี Gopher" {
		t.Fatalf("output ยังไม่ตรงกับภารกิจ")
	}
}

func TestUsesFmtPrintln(t *testing.T) {
	fileSet := token.NewFileSet()
	file, err := parser.ParseFile(fileSet, "main.go", nil, 0)
	if err != nil {
		t.Fatal("ยังอ่านโครงสร้าง main.go ไม่ได้")
	}

	foundFmtPrintln := false
	ast.Inspect(file, func(node ast.Node) bool {
		call, ok := node.(*ast.CallExpr)
		if !ok {
			return true
		}

		selector, ok := call.Fun.(*ast.SelectorExpr)
		if !ok || selector.Sel.Name != "Println" {
			return true
		}

		identifier, ok := selector.X.(*ast.Ident)
		if ok && identifier.Name == "fmt" {
			foundFmtPrintln = true
			return false
		}

		return true
	})

	if !foundFmtPrintln {
		t.Fatal("ภารกิจนี้ต้องใช้ fmt.Println เพื่อแสดงข้อความ")
	}
}
`
