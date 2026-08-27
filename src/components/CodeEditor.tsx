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
        { token: 'keyword', foreground: '38bdf8', fontStyle: 'bold' },
        { token: 'string', foreground: '34d399' },
        { token: 'number', foreground: 'fbbf24' },
      ],
      colors: {
        'editor.background': '#090d16',
        'editor.lineHighlightBackground': '#1e293b55',
        'editorLineNumber.foreground': '#475569',
        'editorLineNumber.activeForeground': '#38bdf8',
        'editorCursor.foreground': '#38bdf8',
      },
    });
    monaco.editor.setTheme('visualCodeDark');
  };

  return (
    <div className="flex flex-col h-full bg-slate-950/80 rounded-xl border border-slate-800/90 overflow-hidden shadow-2xl">
      {/* Editor Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500/80" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
          </div>

          {/* Language selector */}
          <div className="flex rounded-lg bg-slate-950 p-0.5 border border-slate-800">
            {(['python', 'java', 'cpp'] as Language[]).map((lang) => (
              <button
                key={lang}
                onClick={() => onLanguageChange(lang)}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                  language === lang
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {lang === 'python' ? 'Python' : lang === 'java' ? 'Java' : 'C++'}
              </button>
            ))}
          </div>

          {activeLine && (
            <span className="text-xs font-mono bg-sky-950 text-sky-300 border border-sky-800/60 px-2 py-0.5 rounded animate-pulse">
              Executing Line {activeLine}
            </span>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onResetStarter}
            title="Reset Starter Code"
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-md transition-all"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={onRun}
            disabled={isLoading}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-lg ${
              isLoading
                ? 'bg-sky-700/50 text-sky-200 cursor-not-allowed'
                : 'bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white shadow-sky-500/20 active:scale-95'
            }`}
          >
            {isLoading ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>Analyzing & Tracing...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
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
            fontFamily: "'Fira Code', 'JetBrains Mono', 'Menlo', monospace",
          }}
        />
      </div>
    </div>
  );
};
