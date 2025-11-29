import React, { useState } from 'react';
import { LESSONS } from './constants';
import CodeBlock from './components/CodeBlock';
import DemoSandbox from './components/DemoSandbox';

const App: React.FC = () => {
  const [activeLessonId, setActiveLessonId] = useState(LESSONS[0].id);
  const activeLesson = LESSONS.find((l) => l.id === activeLessonId) || LESSONS[0];

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-300">
      {/* Header */}
      <header className="h-16 border-b border-slate-800 bg-[#0f172a]/90 backdrop-blur sticky top-0 z-50 flex items-center justify-between px-6 lg:px-12">
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-500/20">M</div>
            <h1 className="text-xl font-semibold tracking-tight text-white">MyReact <span className="text-slate-500 font-normal">Deep Dive</span></h1>
        </div>
        <div className="text-sm font-medium text-slate-500">
            Learn React Principles by Building It
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden max-w-[1920px] mx-auto w-full">
        
        {/* Navigation Sidebar */}
        <nav className="w-full lg:w-64 border-b lg:border-b-0 lg:border-r border-slate-800 bg-[#0f172a] overflow-y-auto">
            <div className="p-6">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Architecture</div>
                <ul className="space-y-1">
                    {LESSONS.map((lesson, idx) => (
                        <li key={lesson.id}>
                            <button
                                onClick={() => setActiveLessonId(lesson.id)}
                                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-3 ${
                                    activeLessonId === lesson.id
                                    ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-600/20'
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                                }`}
                            >
                                <span className={`flex items-center justify-center w-5 h-5 rounded border text-[10px] ${
                                    activeLessonId === lesson.id 
                                    ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10' 
                                    : 'border-slate-700 text-slate-600'
                                }`}>
                                    {idx + 1}
                                </span>
                                {lesson.title.replace(/^\d+\.\s/, '')}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
            
            <div className="p-6 mt-auto">
                 <div className="p-4 bg-slate-900 rounded-lg border border-slate-800">
                    <h4 className="text-white text-sm font-semibold mb-2">Did you know?</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                        React's Fiber architecture was a rewrite of the core algorithm to support asynchronous rendering, allowing the main thread to remain responsive during heavy updates.
                    </p>
                 </div>
            </div>
        </nav>

        {/* Content Area */}
        <main className="flex-1 flex flex-col lg:flex-row min-h-0">
            
            {/* Left: Code & Explanation */}
            <div className="flex-1 overflow-y-auto p-6 lg:p-12 scroll-smooth">
                <div className="max-w-3xl mx-auto">
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-white mb-4">{activeLesson.title}</h2>
                        <p className="text-slate-400 text-lg leading-relaxed mb-6">
                            {activeLesson.description}
                        </p>
                    </div>

                    <div className="mb-8">
                        <CodeBlock code={activeLesson.code} highlight={activeLesson.highlight} />
                    </div>

                    <div className="prose prose-invert prose-slate">
                        <h3 className="text-indigo-400">Why does this matter?</h3>
                        {activeLesson.id === 'intro' && <p>React elements are immutable. Once created, they don't change. This simplicity allows React to compare trees quickly.</p>}
                        {activeLesson.id === 'render' && <p>Separating the render trigger from the actual commit allows React to prepare a new tree in memory without blocking the browser.</p>}
                        {activeLesson.id === 'workloop' && <p>By breaking rendering into small units (fibers), React becomes "interruptible". High priority tasks like user input can jump the queue.</p>}
                        {activeLesson.id === 'reconciliation' && <p>React's heuristic (O(n)) makes the comparison feasible. It assumes if element types change, the subtrees are different, allowing it to discard old trees completely.</p>}
                        {activeLesson.id === 'hooks' && <p>Hooks rely entirely on call order. That's why you can't put hooks inside <code>if</code> statements or loops—it would mess up the index tracking on the fiber.</p>}
                    </div>
                </div>
            </div>

            {/* Right: Live Sandbox */}
            <div className="w-full lg:w-[400px] bg-[#0b1120] border-l border-slate-800 p-6 flex flex-col">
                <DemoSandbox />
                
                <div className="mt-8 flex-1 overflow-y-auto">
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Debug Console</h3>
                    <div className="font-mono text-xs space-y-2 text-slate-400">
                        <div className="flex gap-2">
                            <span className="text-indigo-400">{'>'}</span>
                            <span>MyReact initialized...</span>
                        </div>
                        <div className="flex gap-2">
                            <span className="text-indigo-400">{'>'}</span>
                            <span>Engine: Fiber (Concurrent)</span>
                        </div>
                        <div className="flex gap-2">
                            <span className="text-indigo-400">{'>'}</span>
                            <span>WorkLoop: Active</span>
                        </div>
                        {activeLesson.id === 'render' && (
                             <div className="flex gap-2 animate-pulse text-emerald-400">
                                <span>* WIP Root assigned</span>
                            </div>
                        )}
                        {activeLesson.id === 'hooks' && (
                             <div className="flex gap-2 animate-pulse text-emerald-400">
                                <span>* Hook state initialized at index 0</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

        </main>
      </div>
    </div>
  );
};

export default App;
