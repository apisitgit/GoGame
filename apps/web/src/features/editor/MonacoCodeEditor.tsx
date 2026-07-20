import { useEffect, useRef } from "react";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";

type MonacoCodeEditorProps = {
  value: string;
  language: string;
  onChange: (value: string) => void;
};

export function MonacoCodeEditor({
  value,
  language,
  onChange,
}: MonacoCodeEditorProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const valueRef = useRef(value);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!containerRef.current || editorRef.current) {
      return;
    }

    editorRef.current = monaco.editor.create(containerRef.current, {
      value,
      language,
      theme: "vs-dark",
      automaticLayout: true,
      fontSize: 15,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      tabSize: 4,
      wordWrap: "on",
    });

    const subscription = editorRef.current.onDidChangeModelContent(() => {
      const nextValue = editorRef.current?.getValue() ?? "";
      valueRef.current = nextValue;
      onChangeRef.current(nextValue);
    });

    return () => {
      subscription.dispose();
      editorRef.current?.dispose();
      editorRef.current = null;
    };
  }, [language, value]);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor || value === valueRef.current) {
      return;
    }

    valueRef.current = value;
    editor.setValue(value);
  }, [value]);

  return (
    <div
      ref={containerRef}
      className="h-full min-h-[420px] w-full overflow-hidden rounded-md border border-white/10"
      data-testid="monaco-go-editor"
    />
  );
}
