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

export function App() {
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'problems' | 'editor' | 'visualizer' | 'history' | 'settings'>('dashboard');
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);

  const [problem, setProblem] = useState<ProblemContext | null>(null);
  const [language, setLanguage] = useState<Language>('python');
  const [code, setCode] = useState<string>('');
  const [activeInput, setActiveInput] = useState<string>('');
  const [isLoadingProblem, setIsLoadingProblem] = useState<boolean>(false);
  const [isTracing, setIsTracing] = useState<boolean>(false);

  const [recentSearchedProblems, setRecentSearchedProblems] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('visualcode_recent_searches') || '[]');
    } catch {
      return [];
    }
  });

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

      // Save to real recent history
      setRecentSearchedProblems((prev) => {
        const updated = [data.title, ...prev.filter((p) => p !== data.title)].slice(0, 10);
        localStorage.setItem('visualcode_recent_searches', JSON.stringify(updated));
        return updated;
      });
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
    <div className="min-h-screen bg-[#141414] text-[#eff1f6] flex font-sans selection:bg-[#ffa116]/30 selection:text-[#ffb23d]">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen overflow-y-auto">
        {/* Top Navbar */}
        <header className="px-8 py-3 bg-[#1a1a1a] border-b border-[#2a2a2a] sticky top-0 z-30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xs font-bold uppercase tracking-wider text-[#8a8a8e]">
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

          <div className="flex items-center gap-3 text-xs text-[#8a8a8e]">
            <div className="flex items-center gap-1.5 bg-[#262626] px-3 py-1 rounded-lg border border-[#333333]">
              <span className="w-2 h-2 rounded-full bg-[#00b8a3] animate-pulse" />
              <span className="font-mono text-[11px] text-[#eff1f6]">OpenRouter Gemini 2.5 Flash</span>
            </div>
          </div>
        </header>

        {/* Tab Router Content */}
        {currentTab === 'dashboard' && (
          <DashboardView
            onSelectProblem={(q) => handleFetchProblem(q)}
            onNavigateTab={setCurrentTab}
            onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
            recentSearchedProblems={recentSearchedProblems}
          />
        )}

        {currentTab === 'problems' && (
          <ProblemsListView
            onSelectProblem={(q) => handleFetchProblem(q)}
            onNavigateTab={setCurrentTab}
            onFetchDynamicProblem={handleFetchProblem}
            isLoading={isLoadingProblem}
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
                      <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-[#1e1e1e] rounded-2xl border border-[#2e2e2e] text-center shadow-xl">
                        <div className="w-12 h-12 rounded-xl bg-[#262626] flex items-center justify-center text-[#ffa116] mb-3 border border-[#383838]">
                          <Sparkles className="w-6 h-6" />
                        </div>
                        <h3 className="text-sm font-bold text-[#eff1f6] mb-1">Visualizer Ready</h3>
                        <p className="text-xs text-[#8a8a8e] max-w-sm leading-relaxed">
                          Write your Python, Java, or C++ implementation and click <strong className="text-[#ffa116]">Run & Visualize</strong> to inspect tree pointers, nodes, and step execution.
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
            <div className="p-8 rounded-2xl border border-[#2e2e2e] bg-[#1e1e1e] text-center max-w-md shadow-2xl">
              <Code2 className="w-8 h-8 text-[#ffa116] mx-auto mb-3" />
              <h3 className="text-base font-bold text-[#eff1f6] mb-1">
                {currentTab === 'history' ? 'Execution History' : 'Preferences & Settings'}
              </h3>
              <p className="text-xs text-[#8a8a8e] mb-4">
                Configure your OpenRouter models, editor font sizes, and view past algorithm runs.
              </p>
              <button
                onClick={() => setIsApiKeyModalOpen(true)}
                className="px-4 py-2 bg-[#ffa116] text-[#141414] font-bold text-xs rounded-xl shadow-md"
              >
                Configure API Key
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="px-8 py-3 bg-[#141414] border-t border-[#2a2a2a] text-[11px] text-[#666666] flex items-center justify-between">
          <span>VisualCode • LeetCode Multi-Language AST Execution Engine</span>
          <div className="flex items-center gap-1.5 text-[#8a8a8e]">
            <Terminal className="w-3.5 h-3.5 text-[#ffa116]" />
            <span>Python / Java / C++ AST Tracer</span>
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
