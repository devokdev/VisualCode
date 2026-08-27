import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import type { ProblemContext, Language, ExecutionAnalysisResult } from './types';
import { fetchLeetCodeProblem, analyzeAndTraceExecution } from './services/openrouter';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { ProblemsListView } from './components/ProblemsListView';
import { ApiKeyModal } from './components/ApiKeyModal';
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

const RECENT_PROBLEMS = [
  { title: '98. Validate Binary Search Tree', difficulty: 'Medium' as const, timeAgo: '2m ago' },
  { title: 'Invert Binary Tree', difficulty: 'Easy' as const, timeAgo: '45m ago' },
  { title: '200. Number of Islands', difficulty: 'Medium' as const, timeAgo: '1h ago' },
  { title: '15. 3Sum', difficulty: 'Medium' as const, timeAgo: '3h ago' },
  { title: '146. LRU Cache', difficulty: 'Hard' as const, timeAgo: 'Yesterday' },
];

export function App() {
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'problems' | 'editor' | 'visualizer' | 'history' | 'settings'>('dashboard');
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);

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
    <div className="min-h-screen bg-[#0a0a0d] text-slate-100 flex font-sans selection:bg-[#d4af37]/30 selection:text-[#f6e05e]">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen overflow-y-auto">
        {/* Top Navbar */}
        <header className="px-8 py-3 bg-[#0d0e14]/90 border-b border-[#d4af37]/15 backdrop-blur sticky top-0 z-30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="font-heading text-sm font-bold tracking-wider text-[#e6c97a]">
              {currentTab === 'dashboard'
                ? 'DASHBOARD'
                : currentTab === 'problems'
                ? 'PROBLEM LIBRARY'
                : currentTab === 'editor'
                ? 'WORKSPACE & CODE EDITOR'
                : currentTab === 'visualizer'
                ? 'ALGORITHM VISUALIZER'
                : currentTab.toUpperCase()}
            </h1>
          </div>

          <div className="flex items-center gap-3 text-xs text-[#a09a88]">
            <div className="flex items-center gap-1.5 bg-[#141520] px-3 py-1 rounded-lg border border-[#d4af37]/20">
              <span className="w-2 h-2 rounded-full bg-[#00b8a3] animate-pulse" />
              <span className="font-mono text-[11px] text-[#e2e8f0]">OpenRouter Gemini 2.5 Flash</span>
            </div>
          </div>
        </header>

        {/* Tab Router Content */}
        {currentTab === 'dashboard' && (
          <DashboardView
            onSelectProblem={(q) => handleFetchProblem(q)}
            onNavigateTab={setCurrentTab}
            onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
            recentProblems={RECENT_PROBLEMS}
          />
        )}

        {currentTab === 'problems' && (
          <ProblemsListView
            onSelectProblem={(q) => handleFetchProblem(q)}
            onNavigateTab={setCurrentTab}
          />
        )}

        {(currentTab === 'editor' || currentTab === 'visualizer') && (
          <main className="flex-1 p-6 flex flex-col gap-5 max-w-[1700px] w-full mx-auto">
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
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1">
              {/* Left Column: Monaco Code Editor (5 cols) */}
              <div className="lg:col-span-5 flex flex-col gap-3 min-h-[460px]">
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
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 flex-1 min-h-[420px]">
                  {/* Data Structure Canvas (8 cols on md) */}
                  <div className="md:col-span-7 flex flex-col min-h-[380px]">
                    {renderVisualizer() || (
                      <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-[#11121a] rounded-2xl border border-[#d4af37]/20 text-center shadow-xl">
                        <div className="w-12 h-12 rounded-xl bg-[#1c1d29] flex items-center justify-center text-[#d4af37] mb-3 border border-[#d4af37]/30 shadow-inner">
                          <Sparkles className="w-6 h-6" />
                        </div>
                        <h3 className="font-serif-title text-sm font-semibold text-[#f1ede2] mb-1">Visualizer Ready</h3>
                        <p className="text-xs text-[#8e8a9c] max-w-sm leading-relaxed">
                          Write your Python, Java, or C++ implementation and click <strong className="text-[#d4af37]">Run & Visualize</strong> to inspect tree pointers, nodes, and step execution.
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
        )}

        {(currentTab === 'history' || currentTab === 'settings') && (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="p-8 rounded-2xl border border-[#d4af37]/20 bg-[#11121a] text-center max-w-md shadow-2xl">
              <Code2 className="w-8 h-8 text-[#d4af37] mx-auto mb-3" />
              <h3 className="font-serif-title text-base font-semibold text-[#f1ede2] mb-1">
                {currentTab === 'history' ? 'Execution History' : 'Preferences & Settings'}
              </h3>
              <p className="text-xs text-[#8e8a9c] mb-4">
                Configure your OpenRouter models, editor font sizes, and view past algorithm runs.
              </p>
              <button
                onClick={() => setIsApiKeyModalOpen(true)}
                className="px-4 py-2 bg-[#d4af37] text-[#0a0a0e] font-bold text-xs rounded-xl shadow-md"
              >
                Configure API Key
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="px-8 py-3 bg-[#0c0d12] border-t border-[#d4af37]/15 text-[11px] text-[#7d7a8a] flex items-center justify-between">
          <span>VisualCode • Visualize. Debug. Conquer.</span>
          <div className="flex items-center gap-1.5 text-[#9d98a8]">
            <Terminal className="w-3.5 h-3.5 text-[#d4af37]" />
            <span>LeetCode Multi-Language AST Execution Engine</span>
          </div>
        </footer>
      </div>

      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
      />
    </div>
  );
}

export default App;
