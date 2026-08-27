import React from 'react';
import Editor from '@monaco-editor/react';
import type { Language } from '../types';
import { Play, RotateCcw, Sparkles } from 'lucide-react';

interface CodeEditorProps {
  code: string;
  onChange: (value: string | undefined) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onRun: () => void;
  onResetStarter: () => void;
  isLoading: boolean;
  activeLine?: number;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  onChange,
  language,
  onLanguageChange,
  onRun,
  onResetStarter,
  isLoading,
  activeLine,
}) => {
  const monacoLanguage = language === 'python' ? 'python' : language === 'java' ? 'java' : 'cpp';

  const handleEditorDidMount = (_editor: any, monaco: any) => {
    monaco.editor.defineTheme('visualCodeDark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '64748b', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'd4af37', fontStyle: 'bold' },
        { token: 'string', foreground: '00b8a3' },
        { token: 'number', foreground: 'ffc01e' },
      ],
      colors: {
        'editor.background': '#0a0a0d',
        'editor.lineHighlightBackground': '#18192455',
        'editorLineNumber.foreground': '#4f4c5c',
        'editorLineNumber.activeForeground': '#d4af37',
        'editorCursor.foreground': '#d4af37',
      },
    });
    monaco.editor.setTheme('visualCodeDark');
  };

  return (
    <div className="flex flex-col h-full bg-[#0d0e14] rounded-2xl border border-[#d4af37]/20 overflow-hidden shadow-2xl">
      {/* Editor Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#11121a] border-b border-[#d4af37]/15">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff375f]/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#ffc01e]/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#00b8a3]/70" />
          </div>

          {/* Language selector */}
          <div className="flex rounded-lg bg-[#0a0a0e] p-0.5 border border-[#d4af37]/20">
            {(['python', 'java', 'cpp'] as Language[]).map((lang) => (
              <button
                key={lang}
                onClick={() => onLanguageChange(lang)}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                  language === lang
                    ? 'bg-[#d4af37] text-[#0a0a0e] font-bold shadow-sm'
                    : 'text-[#8e8a9c] hover:text-[#e2e8f0]'
                }`}
              >
                {lang === 'python' ? 'Python' : lang === 'java' ? 'Java' : 'C++'}
              </button>
            ))}
          </div>

          {activeLine && (
            <span className="text-xs font-mono bg-[#1b1c28] text-[#e6c97a] border border-[#d4af37]/35 px-2 py-0.5 rounded animate-pulse">
              Line {activeLine}
            </span>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onResetStarter}
            title="Reset Starter Code"
            className="p-1.5 text-[#8e8a9c] hover:text-[#e2e8f0] hover:bg-[#181926] rounded-lg transition-all"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={onRun}
            disabled={isLoading}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-bold transition-all shadow-lg ${
              isLoading
                ? 'bg-[#252636] text-[#716e80] cursor-not-allowed'
                : 'bg-gradient-to-r from-[#d4af37] to-[#b8952b] hover:from-[#e2c069] hover:to-[#cfa332] text-[#0a0a0e] shadow-[#d4af37]/20 active:scale-95'
            }`}
          >
            {isLoading ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin text-[#d4af37]" />
                <span>Analyzing & Tracing...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-[#0a0a0e]" />
                <span>Run & Visualize</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1 min-h-[300px] relative">
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
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          }}
        />
      </div>
    </div>
  );
};
