import React, { useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import type { Language } from '../types';
import { RotateCcw } from 'lucide-react';

interface CodeEditorProps {
  code: string;
  onChange: (value: string | undefined) => void;
  language: Language;
  onResetStarter: () => void;
  activeLine?: number;
  nextLine?: number;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  onChange,
  language,
  onResetStarter,
  activeLine,
  nextLine,
}) => {
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  const decorationsRef = useRef<any[]>([]);

  const monacoLanguage = language === 'python' ? 'python' : language === 'java' ? 'java' : 'cpp';

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

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

  // Sync dual-line indicators (Executed Line = Green, Next Line = Red)
  useEffect(() => {
    if (!editorRef.current || !monacoRef.current) return;
    const monaco = monacoRef.current;
    const newDecorations: any[] = [];

    if (activeLine && activeLine > 0) {
      newDecorations.push({
        range: new monaco.Range(activeLine, 1, activeLine, 1),
        options: {
          isWholeLine: true,
          className: 'bg-[#2cbb5d]/15 border-l-2 border-[#2cbb5d]',
          glyphMarginClassName: 'executed-line-glyph',
        },
      });
      try {
        editorRef.current.revealLineInCenterIfOutsideViewport(activeLine);
      } catch {}
    }

    if (nextLine && nextLine > 0 && nextLine !== activeLine) {
      newDecorations.push({
        range: new monaco.Range(nextLine, 1, nextLine, 1),
        options: {
          isWholeLine: true,
          className: 'bg-[#ef4743]/15 border-l-2 border-[#ef4743]',
          glyphMarginClassName: 'next-line-glyph',
        },
      });
    }

    decorationsRef.current = editorRef.current.deltaDecorations(
      decorationsRef.current,
      newDecorations
    );
  }, [activeLine, nextLine]);

  return (
    <div className="flex flex-col h-full bg-[#1a1a1a] relative select-none">
      {/* Editor Header Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#242424] border-b border-[#333333]">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-semibold text-[#8c8c8c] uppercase">{language}</span>
          {activeLine && (
            <span className="text-[11px] font-mono bg-[#2cbb5d]/20 text-[#2cbb5d] px-2 py-0.5 rounded border border-[#2cbb5d]/30 flex items-center gap-1">
              <span>➔</span>
              <span>Executed: L{activeLine}</span>
            </span>
          )}
          {nextLine && (
            <span className="text-[11px] font-mono bg-[#ef4743]/20 text-[#ef4743] px-2 py-0.5 rounded border border-[#ef4743]/30 flex items-center gap-1">
              <span>➔</span>
              <span>Next: L{nextLine}</span>
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

