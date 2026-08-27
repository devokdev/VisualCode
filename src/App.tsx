import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import type { ProblemContext, Language, ExecutionAnalysisResult } from './types';
import { fetchLeetCodeProblem, analyzeAndTraceExecution } from './services/openrouter';
import { TopBar } from './components/TopBar';
import { CodeEditor } from './components/CodeEditor';
import { CompactErrorBanner } from './components/CompactErrorBanner';
import { FloatingTimeline } from './components/FloatingTimeline';
import { DebugPanel } from './components/visualizers/DebugPanel';
import { TreeVisualizer } from './components/visualizers/TreeVisualizer';
import { GraphVisualizer } from './components/visualizers/GraphVisualizer';
import { SequenceVisualizer } from './components/visualizers/SequenceVisualizer';
import { ProblemsListView } from './components/ProblemsListView';
import { ApiKeyModal } from './components/ApiKeyModal';
import { ProblemStatementModal } from './components/ProblemStatementModal';
import { Sparkles, GitBranch, FileText, Box, Layers, Terminal } from 'lucide-react';

const DEFAULT_PROBLEM_QUERY = '199. Binary Tree Right Side View';

export function App() {
  const [currentTab, setCurrentTab] = useState<'editor' | 'problems'>('editor');
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isProblemModalOpen, setIsProblemModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [debugTab, setDebugTab] = useState<'variables' | 'callstack' | 'output'>('variables');
  const [selectedNodeVal, setSelectedNodeVal] = useState<string | number | null>(null);

  const [problem, setProblem] = useState<ProblemContext | null>(null);
  const [language, setLanguage] = useState<Language>('java');
  const [code, setCode] = useState<string>('');
  const [activeInput, setActiveInput] = useState<string>('');
  const [isLoadingProblem, setIsLoadingProblem] = useState<boolean>(false);
  const [isTracing, setIsTracing] = useState<boolean>(false);

  const [traceResult, setTraceResult] = useState<ExecutionAnalysisResult | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1);
  const [visualizerTab, setVisualizerTab] = useState<'tree' | 'problem' | 'debug'>('tree');

  // Initial Load
  useEffect(() => {
    handleFetchProblem(DEFAULT_PROBLEM_QUERY);
  }, []);

  const handleFetchProblem = async (query: string) => {
    setIsLoadingProblem(true);
    try {
      const data = await fetchLeetCodeProblem(query);
      setProblem(data);
      setCode(data.starterCode[language] || data.starterCode.java || data.starterCode.python);
      setActiveInput(data.examples[0]?.input || '');
      setTraceResult(null);
      setCurrentStepIndex(0);
      setIsPlaying(false);
      setSelectedNodeVal(null);
      setCurrentTab('editor');
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

      // Auto open drawer if error detected
      if (result.errorClassification.type !== 'none') {
        setIsDrawerOpen(true);
      }

      if (result.errorClassification.type === 'none') {
        confetti({
          particleCount: 60,
          spread: 55,
          origin: { y: 0.7 },
        });
      }
    } catch (err: any) {
      alert(`Execution trace error: ${err.message}`);
    } finally {
      setIsTracing(false);
    }
  };

  const activeStep = traceResult?.steps?.[currentStepIndex];

  const renderVisualizerContent = () => {
    if (!problem) return null;

    if (problem.dataStructureType === 'tree' || problem.dataStructureType === 'bst') {
      return (
        <TreeVisualizer
          data={activeStep?.treeState}
          stepExplanation={activeStep?.explanation}
          onSelectNode={(node) => {
            setSelectedNodeVal(node.val);
            setIsDrawerOpen(true);
            setDebugTab('variables');
          }}
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
    <div className="h-screen w-screen bg-[#0e0e11] text-[#f4f4f5] flex flex-col font-sans overflow-hidden">
      {/* 1. Top Bar: Search • Language • API Key • Debug Drawer • Run */}
      <TopBar
        problem={problem}
        onSearch={handleFetchProblem}
        language={language}
        onLanguageChange={handleLanguageChange}
        onRun={handleRunAndTrace}
        isLoading={isTracing || isLoadingProblem}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        isDrawerOpen={isDrawerOpen}
        onToggleDrawer={() => setIsDrawerOpen(!isDrawerOpen)}
        onNavigateTab={setCurrentTab}
      />

      {/* Main Content Area */}
      {currentTab === 'problems' ? (
        <div className="flex-1 overflow-y-auto">
          <ProblemsListView
            onSelectProblem={handleFetchProblem}
            onNavigateTab={() => setCurrentTab('editor')}
            onFetchDynamicProblem={handleFetchProblem}
            isLoading={isLoadingProblem}
          />
        </div>
      ) : (
        <div className="flex-1 flex flex-col min-h-0 relative">
          {/* Compact Error Banner if exists */}
          {traceResult?.errorClassification && (
            <div className="px-4 py-2 bg-[#141418] border-b border-white/[0.06]">
              <CompactErrorBanner error={traceResult.errorClassification} />
            </div>
          )}

          {/* 3-Panel Core IDE: Left Editor (58%) | Right Visualizer Tabs (42%) */}
          <div className="flex-1 flex min-h-0 overflow-hidden">
            {/* Left Panel: Monaco Code Editor */}
            <div className="w-[58%] h-full flex flex-col border-r border-white/[0.06] min-w-0">
              <CodeEditor
                code={code}
                onChange={(val) => setCode(val || '')}
                language={language}
                onResetStarter={handleResetStarter}
                activeLine={activeStep?.line}
              />
            </div>

            {/* Right Panel: Tabbed Visualizer & Debugger */}
            <div className="flex-1 h-full flex flex-col bg-[#141418] min-w-0 relative">
              {/* Right Panel Header Tabs - Lucide icons, no emojis */}
              {!isDrawerOpen && (
                <div className="h-9 border-b border-white/[0.06] bg-[#1a1a20] px-3 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setVisualizerTab('tree')}
                      className={`px-3 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                        visualizerTab === 'tree'
                          ? 'bg-[#26262e] text-[#ffa116] border border-white/[0.06] shadow-sm'
                          : 'text-[#71717a] hover:text-[#d4d4d8]'
                      }`}
                    >
                      <GitBranch className="w-3.5 h-3.5" />
                      <span>Visualizer</span>
                    </button>

                    <button
                      onClick={() => setVisualizerTab('problem')}
                      className={`px-3 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                        visualizerTab === 'problem'
                          ? 'bg-[#26262e] text-[#ffa116] border border-white/[0.06] shadow-sm'
                          : 'text-[#71717a] hover:text-[#d4d4d8]'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Problem</span>
                    </button>

                    <button
                      onClick={() => {
                        setVisualizerTab('debug');
                        setDebugTab('variables');
                      }}
                      className={`px-3 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                        visualizerTab === 'debug' && debugTab === 'variables'
                          ? 'bg-[#26262e] text-[#ffa116] border border-white/[0.06] shadow-sm'
                          : 'text-[#71717a] hover:text-[#d4d4d8]'
                      }`}
                    >
                      <Box className="w-3.5 h-3.5" />
                      <span>Variables</span>
                    </button>

                    <button
                      onClick={() => {
                        setVisualizerTab('debug');
                        setDebugTab('callstack');
                      }}
                      className={`px-3 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                        visualizerTab === 'debug' && debugTab === 'callstack'
                          ? 'bg-[#26262e] text-[#ffa116] border border-white/[0.06] shadow-sm'
                          : 'text-[#71717a] hover:text-[#d4d4d8]'
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Call Stack</span>
                    </button>

                    <button
                      onClick={() => {
                        setVisualizerTab('debug');
                        setDebugTab('output');
                      }}
                      className={`px-3 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                        visualizerTab === 'debug' && debugTab === 'output'
                          ? 'bg-[#26262e] text-[#ffa116] border border-white/[0.06] shadow-sm'
                          : 'text-[#71717a] hover:text-[#d4d4d8]'
                      }`}
                    >
                      <Terminal className="w-3.5 h-3.5" />
                      <span>Output</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    {problem && (
                      <button
                        onClick={() => setIsProblemModalOpen(true)}
                        className="text-[#71717a] hover:text-[#ffa116] transition-colors truncate max-w-[200px] flex items-center gap-1 font-medium"
                        title="Click to view full problem description in modal"
                      >
                        <span>{problem.title}</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Visualizer / Debugger / Problem Body */}
              <div className="flex-1 min-h-0 relative overflow-y-auto">
                {isDrawerOpen || visualizerTab === 'tree' ? (
                  renderVisualizerContent() || (
                    <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center text-[#71717a]">
                      <Sparkles className="w-6 h-6 text-[#ffa116] mb-2" />
                      <h4 className="text-sm font-semibold text-[#f4f4f5] mb-1">Visualizer Ready</h4>
                      <p className="text-xs max-w-xs text-[#71717a]">
                        Click <strong className="text-[#ffa116]">Run</strong> in the top bar to step through code execution.
                      </p>
                    </div>
                  )
                ) : visualizerTab === 'problem' ? (
                  problem ? (
                    <div className="p-6 space-y-4 text-xs text-[#d4d4d8] leading-relaxed">
                      <div className="flex items-center justify-between">
                        <h2 className="text-sm font-bold text-[#f4f4f5]">{problem.title}</h2>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            problem.difficulty === 'Easy'
                              ? 'badge-easy'
                              : problem.difficulty === 'Medium'
                              ? 'badge-medium'
                              : 'badge-hard'
                          }`}
                        >
                          {problem.difficulty}
                        </span>
                      </div>

                      <div className="bg-[#1a1a20] p-4 rounded-xl border border-white/[0.06] whitespace-pre-line text-xs">
                        {problem.description}
                      </div>

                      {problem.examples && problem.examples.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-bold text-[#f4f4f5] text-xs font-mono uppercase">Examples</h4>
                          {problem.examples.map((ex, idx) => (
                            <div key={idx} className="bg-[#1a1a20] p-3 rounded-xl border border-white/[0.06] space-y-1 font-mono text-xs">
                              <div><span className="text-[#71717a]">Input: </span><span className="text-[#ffa116]">{ex.input}</span></div>
                              <div><span className="text-[#71717a]">Output: </span><span className="text-[#10b981]">{ex.output}</span></div>
                            </div>
                          ))}
                        </div>
                      )}

                      {problem.constraints && (
                        <div className="space-y-1">
                          <h4 className="font-bold text-[#f4f4f5] text-xs font-mono uppercase">Constraints</h4>
                          <ul className="list-disc pl-5 space-y-1 text-[#71717a] font-mono text-[11px]">
                            {problem.constraints.map((c, idx) => (
                              <li key={idx}>{c}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-6 text-center text-xs text-[#71717a]">No problem loaded</div>
                  )
                ) : (
                  <DebugPanel
                    activeTab={debugTab}
                    onSelectTab={setDebugTab}
                    variables={activeStep?.variables}
                    callStack={activeStep?.callStack}
                    stdout={activeStep?.stdout}
                    returnValue={activeStep?.returnValue}
                    selectedNodeVal={selectedNodeVal}
                  />
                )}
              </div>
            </div>

            {/* Collapsible Debug Drawer */}
            {isDrawerOpen && (
              <div className="w-80 h-full border-l border-white/[0.06] bg-[#141418] flex flex-col shrink-0 animate-in slide-in-from-right duration-200">
                <DebugPanel
                  activeTab={debugTab}
                  onSelectTab={setDebugTab}
                  variables={activeStep?.variables}
                  callStack={activeStep?.callStack}
                  stdout={activeStep?.stdout}
                  returnValue={activeStep?.returnValue}
                  selectedNodeVal={selectedNodeVal}
                />
              </div>
            )}
          </div>

          {/* Bottom Floating Timeline Bar */}
          <FloatingTimeline
            currentStep={currentStepIndex}
            totalSteps={traceResult?.steps?.length || 0}
            isPlaying={isPlaying}
            onPlayToggle={() => setIsPlaying(!isPlaying)}
            onStepForward={() =>
              setCurrentStepIndex((prev) =>
                Math.min(prev + 1, (traceResult?.steps?.length || 1) - 1)
              )
            }
            onStepBack={() => setCurrentStepIndex((prev) => Math.max(prev - 1, 0))}
            onReset={() => setCurrentStepIndex(0)}
            onScrub={(idx) => setCurrentStepIndex(idx)}
            speed={speed}
            onSpeedChange={setSpeed}
          />
        </div>
      )}

      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
      />

      {/* Problem Statement Modal */}
      <ProblemStatementModal
        problem={problem}
        isOpen={isProblemModalOpen}
        onClose={() => setIsProblemModalOpen(false)}
        activeInput={activeInput}
        onInputChange={setActiveInput}
      />
    </div>
  );
}

export default App;
