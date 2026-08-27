import React from 'react';
import Editor from '@monaco-editor/react';
import type { Language } from '../types';
import { RotateCcw } from 'lucide-react';

interface CodeEditorProps {
  code: string;
  onChange: (value: string | undefined) => void;
  language: Language;
  onResetStarter: () => void;
  activeLine?: number;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  onChange,
  language,
  onResetStarter,
  activeLine,
}) => {
  const monacoLanguage = language === 'python' ? 'python' : language === 'java' ? 'java' : 'cpp';

  const handleEditorDidMount = (_editor: any, monaco: any) => {
    monaco.editor.defineTheme('leetCodeDark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '8c8c8c', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'ffa116', fontStyle: 'bold' },
        { token: 'string', foreground: '2cbb5d' },
        { token: 'number', foreground: '46c6c2' },
        { token: 'type', foreground: 'eff1f6' },
      ],
      colors: {
        'editor.background': '#1a1a1a',
        'editor.lineHighlightBackground': '#242424',
        'editorLineNumber.foreground': '#5c5c5c',
        'editorLineNumber.activeForeground': '#ffa116',
        'editorCursor.foreground': '#ffa116',
      },
    });
    monaco.editor.setTheme('leetCodeDark');
  };

  return (
    <div className="flex flex-col h-full bg-[#1a1a1a] relative select-none">
      {/* Editor Header Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#242424] border-b border-[#333333]">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-semibold text-[#8c8c8c] uppercase">{language}</span>
          {activeLine && (
            <span className="text-[11px] font-mono bg-[#333333] text-[#ffa116] px-2 py-0.5 rounded border border-[#484848]">
              Line {activeLine}
            </span>
          )}
        </div>

        <button
          onClick={onResetStarter}
          title="Reset Code Template"
          className="text-xs text-[#8c8c8c] hover:text-[#eff1f6] flex items-center gap-1 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1 w-full h-full relative">
        <Editor
          height="100%"
          language={monacoLanguage}
          value={code}
          onChange={onChange}
          theme="vs-dark"
          onMount={handleEditorDidMount}
          options={{
            fontSize: 13,
            lineNumbers: 'on',
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            smoothScrolling: true,
            tabSize: 4,
            automaticLayout: true,
            padding: { top: 12, bottom: 12 },
            fontFamily: "'JetBrains Mono', ui-monospace, Menlo, Monaco, Consolas, monospace",
          }}
        />
      </div>
    </div>
  );
};
