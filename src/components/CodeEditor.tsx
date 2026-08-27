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
    monaco.editor.defineTheme('vintageEspresso', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6B625B', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'B38A4A', fontStyle: 'bold' },
        { token: 'string', foreground: '66734F' },
        { token: 'number', foreground: 'C59B58' },
        { token: 'type', foreground: 'EAE5DF' },
      ],
      colors: {
        'editor.background': '#171412',
        'editor.lineHighlightBackground': '#221D1A',
        'editorLineNumber.foreground': '#5E4A3B',
        'editorLineNumber.activeForeground': '#B38A4A',
        'editorCursor.foreground': '#B38A4A',
      },
    });
    monaco.editor.setTheme('vintageEspresso');
  };

  return (
    <div className="flex flex-col h-full bg-[#171412] relative select-none">
      {/* Editor Header Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#221D1A] border-b border-[#3D322A]">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-medium text-[#9E948C] uppercase">{language}</span>
          {activeLine && (
            <span className="text-[11px] font-mono bg-[#2A2421] text-[#B38A4A] px-2 py-0.5 rounded border border-[#3D322A]">
              Line {activeLine}
            </span>
          )}
        </div>

        <button
          onClick={onResetStarter}
          title="Reset Code Template"
          className="text-xs text-[#9E948C] hover:text-[#EAE5DF] flex items-center gap-1 transition-colors"
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
