import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import type { ProblemContext, Language, ExecutionAnalysisResult } from './types';
import { fetchLeetCodeProblem, analyzeAndTraceExecution } from './services/openrouter';
import { ProblemHeader } from './components/ProblemHeader';
import { CodeEditor } from './components/CodeEditor';
import { ErrorClassificationBanner } from './components/ErrorClassificationBanner';
import { TraceControls } from './components/TraceControls';
import { TreeVisualizer } from './components/visualizers/TreeVisualizer';
import { GraphVisualizer } from './components/visualizers/GraphVisualizer';
import { SequenceVisualizer } from './components/visualizers/SequenceVisualizer';
import { StateInspector } from './components/visualizers/StateInspector';
import { Sparkles, Terminal, Code2 } from 'lucide-react';

const DEFAULT_PROBLEM_QUERY = '98. Validate Binary Search Tree';

export function App() {
  const [problem, setProblem] = useState<ProblemContext | null>(null);
  const [language, setLanguage] = useState<Language>('python');
  const [code, setCode] = useState<string>('');
  const [activeInput, setActiveInput] = useState<string>('');
  const [isLoadingProblem, setIsLoadingProblem] = useState<boolean>(false);
  const [isTracing, setIsTracing] = useState<boolean>(false);

  const [traceResult, setTraceResult] = useState<ExecutionAnalysisResult | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1);

  // Initial load
  useEffect(() => {
    handleFetchProblem(DEFAULT_PROBLEM_QUERY);
  }, []);

  const handleFetchProblem = async (query: string) => {
    setIsLoadingProblem(true);
    try {
      const data = await fetchLeetCodeProblem(query);
      setProblem(data);
      setCode(data.starterCode[language] || data.starterCode.python);
      setActiveInput(data.examples[0]?.input || '');
      setTraceResult(null);
      setCurrentStepIndex(0);
      setIsPlaying(false);
    } catch (err: any) {
      alert(`Error fetching problem: ${err.message}`);
    } finally {
      setIsLoadingProblem(false);
    }
  };

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    if (problem) {
      setCode(problem.starterCode[lang] || '');
    }
  };

  const handleResetStarter = () => {
    if (problem) {
      setCode(problem.starterCode[language] || '');
    }
  };

  const handleRunAndTrace = async () => {
    if (!problem) return;
    setIsTracing(true);
    setIsPlaying(false);
    try {
      const result = await analyzeAndTraceExecution(problem, code, language, activeInput);
      setTraceResult(result);
      setCurrentStepIndex(0);

      // Trigger celebratory confetti if clean execution with no errors
      if (result.errorClassification.type === 'none') {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
        });
      }
    } catch (err: any) {
      alert(`Execution analysis error: ${err.message}`);
    } finally {
      setIsTracing(false);
    }
  };

  const activeStep = traceResult?.steps?.[currentStepIndex];

  const renderVisualizer = () => {
    if (!problem) return null;

    if (problem.dataStructureType === 'tree' || problem.dataStructureType === 'bst') {
      return (
        <TreeVisualizer
          data={activeStep?.treeState}
          stepExplanation={activeStep?.explanation}
        />
      );
    }

    if (problem.dataStructureType === 'graph') {
      return (
        <GraphVisualizer
          data={activeStep?.graphState}
          stepExplanation={activeStep?.explanation}
        />
      );
    }

    return (
      <SequenceVisualizer
        linkedListState={activeStep?.linkedListState}
        arrayState={activeStep?.arrayState}
        matrixState={activeStep?.matrixState}
        stepExplanation={activeStep?.explanation}
      />
    );
  };

  return (
    <div className="min-h-screen bg-[#050811] text-slate-100 flex flex-col font-sans selection:bg-sky-500/30 selection:text-sky-200">
      {/* Top Navbar */}
      <header className="px-6 py-3 bg-[#080d1a]/90 border-b border-slate-800/80 backdrop-blur sticky top-0 z-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
            <Code2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-tight text-white flex items-center gap-2">
              VisualCode <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-400 border border-sky-500/30">AI Execution Visualizer</span>
            </h1>
            <p className="text-[11px] text-slate-400">Step-by-step code understanding & 3-tier error classification</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-1.5 bg-slate-900/80 px-2.5 py-1 rounded-md border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>OpenRouter Engine: Gemini 2.5 Flash</span>
          </div>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <main className="flex-1 p-4 lg:p-6 flex flex-col gap-4 max-w-[1700px] w-full mx-auto">
        {/* Problem Header & Search Bar */}
        <ProblemHeader
          problem={problem}
          onFetchProblem={handleFetchProblem}
          isLoading={isLoadingProblem}
          activeInput={activeInput}
          onInputChange={setActiveInput}
        />

        {/* Error Classification Banner (if analysis available) */}
        {traceResult?.errorClassification && (
          <ErrorClassificationBanner error={traceResult.errorClassification} />
        )}

        {/* 2-Column Split Pane */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
          {/* Left Column: Monaco Code Editor (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-3 min-h-[450px]">
            <CodeEditor
              code={code}
              onChange={(val) => setCode(val || '')}
              language={language}
              onLanguageChange={handleLanguageChange}
              onRun={handleRunAndTrace}
              onResetStarter={handleResetStarter}
              isLoading={isTracing}
              activeLine={activeStep?.line}
            />
          </div>

          {/* Right Column: Visualizer Canvas + State Inspector (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-3">
            {/* Visualizer Header Controls */}
            {traceResult && traceResult.steps && traceResult.steps.length > 0 && (
              <TraceControls
                currentStep={currentStepIndex}
                totalSteps={traceResult.steps.length}
                isPlaying={isPlaying}
                onPlayToggle={() => setIsPlaying(!isPlaying)}
                onStepForward={() => setCurrentStepIndex((prev) => Math.min(prev + 1, traceResult.steps.length - 1))}
                onStepBack={() => setCurrentStepIndex((prev) => Math.max(prev - 1, 0))}
                onReset={() => setCurrentStepIndex(0)}
                onScrub={(idx) => setCurrentStepIndex(idx)}
                speed={speed}
                onSpeedChange={setSpeed}
              />
            )}

            {/* Split Visualizer & State Panel */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 flex-1 min-h-[420px]">
              {/* Data Structure Canvas (8 cols on md) */}
              <div className="md:col-span-7 flex flex-col min-h-[380px]">
                {renderVisualizer() || (
                  <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-slate-950/60 rounded-xl border border-slate-800 text-center">
                    <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center text-sky-400 mb-3 border border-slate-800">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-200 mb-1">Visualizer Ready</h3>
                    <p className="text-xs text-slate-400 max-w-sm">
                      Write your Python, Java, or C++ implementation and click <strong className="text-sky-300">Run & Visualize</strong> to inspect tree pointers, nodes, and step execution.
                    </p>
                  </div>
                )}
              </div>

              {/* State & Call Stack Inspector (5 cols on md) */}
              <div className="md:col-span-5 flex flex-col min-h-[380px]">
                <StateInspector
                  variables={activeStep?.variables}
                  callStack={activeStep?.callStack}
                  stdout={activeStep?.stdout}
                  returnValue={activeStep?.returnValue}
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-2 bg-[#080d1a] border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-between">
        <span>VisualCode • AI-Powered Dynamic Algorithm & Data Structure Visualizer</span>
        <div className="flex items-center gap-1 text-slate-400">
          <Terminal className="w-3.5 h-3.5" />
          <span>Multi-Language AST Execution Engine</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
