'use client';

import Editor from '@monaco-editor/react';

type CodeEditorProps = {
  value: string;
  language: string;
  onChange: (value: string) => void;
};

function toMonacoLanguage(language: string) {
  if (language === 'JAVASCRIPT') return 'javascript';
  if (language === 'PYTHON') return 'python';
  return 'plaintext';
}

export function CodeEditor({ value, language, onChange }: CodeEditorProps) {
  return (
    <div className="relative min-h-[520px] bg-[#181c17] max-[560px]:min-h-[420px]">
      <Editor
        aria-label="Code editor"
        height="520px"
        language={toMonacoLanguage(language)}
        theme="vs-dark"
        value={value}
        loading={
          <div className="flex h-[520px] items-center px-5 font-mono text-[11px] text-[#a4ae9b]">
            Loading editor
          </div>
        }
        onChange={(nextValue) => onChange(nextValue ?? '')}
        options={{
          automaticLayout: true,
          fontFamily: 'IBM Plex Mono, ui-monospace, SFMono-Regular, Menlo, monospace',
          fontSize: 13,
          lineHeight: 22,
          minimap: { enabled: false },
          padding: { top: 18, bottom: 18 },
          renderLineHighlight: 'line',
          scrollBeyondLastLine: false,
          tabSize: 2,
          wordWrap: 'on',
        }}
      />
      <textarea
        aria-label="Code editor value"
        className="absolute left-0 top-0 h-px w-px opacity-0"
        tabIndex={-1}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
