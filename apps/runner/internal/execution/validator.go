package execution

import (
	"fmt"
	"go/parser"
	"go/token"
	"strings"
)

var deniedImports = map[string]string{
	"C":             "ไม่อนุญาตให้ใช้ cgo ใน development runner",
	"io/fs":         "ไม่อนุญาตให้เข้าถึง filesystem ใน development runner",
	"io/ioutil":     "ไม่อนุญาตให้เข้าถึง filesystem ใน development runner",
	"net":           "ไม่อนุญาตให้เปิด network ใน development runner",
	"net/http":      "ไม่อนุญาตให้เปิด network ใน development runner",
	"os":            "ไม่อนุญาตให้เข้าถึง OS หรือ filesystem ใน development runner",
	"os/exec":       "ไม่อนุญาตให้สร้าง process เพิ่มใน development runner",
	"path/filepath": "ไม่อนุญาตให้สำรวจ filesystem ใน development runner",
	"plugin":        "ไม่อนุญาตให้โหลด plugin ใน development runner",
	"runtime/debug": "ไม่อนุญาตให้เปลี่ยน runtime limit ใน development runner",
	"syscall":       "ไม่อนุญาตให้เรียก syscall ใน development runner",
	"unsafe":        "ไม่อนุญาตให้ใช้ unsafe ใน development runner",
}

func validateRequest(request Request, maxSourceBytes int) error {
	if request.Language != "" && request.Language != "go" {
		return fmt.Errorf("language ต้องเป็น go เท่านั้น")
	}

	if strings.TrimSpace(request.SourceCode) == "" {
		return fmt.Errorf("sourceCode ต้องไม่ว่าง")
	}

	if len([]byte(request.SourceCode)) > maxSourceBytes {
		return fmt.Errorf("sourceCode มีขนาดเกิน %d bytes", maxSourceBytes)
	}

	return validateImports(request.SourceCode)
}

func validateImports(sourceCode string) error {
	fileSet := token.NewFileSet()
	file, err := parser.ParseFile(fileSet, "main.go", sourceCode, parser.ImportsOnly)
	if err != nil {
		return nil
	}

	for _, imported := range file.Imports {
		path := strings.Trim(imported.Path.Value, `"`)
		if message, denied := deniedImports[path]; denied {
			return fmt.Errorf("%s: %s", path, message)
		}
		if strings.Contains(path, ".") {
			return fmt.Errorf("%s: development runner ยังไม่รองรับ external package", path)
		}
	}

	return nil
}
