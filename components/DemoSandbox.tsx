import React, { useEffect, useRef, useState } from 'react';
import MyReact from '../lib/MyReactImpl';

/** @jsx MyReact.createElement */
/** @jsxFrag React.Fragment */

/* 
  NOTE: This file demonstrates usage of our Custom MyReact.
  Because we can't easily configure the build system at runtime to switch JSX pragmas purely for one file,
  we are defining the components using raw MyReact.createElement calls below, 
  simulating what Babel does.
*/

const DemoSandbox: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [key, setKey] = useState(0); // Used to reset the demo

  useEffect(() => {
    if (!containerRef.current) return;

    // --- DEFINING COMPONENTS FOR MyReact ---

    // 1. Simple Counter Component
    function Counter(props: { initial: number }) {
      const [count, setCount] = MyReact.useState(props.initial);
      
      const handleIncrement = () => {
        setCount((c: number) => c + 1);
      };

      const handleReset = () => {
        setCount(0);
      };

      return MyReact.createElement(
        "div",
        { className: "p-6 bg-slate-800 rounded-xl border border-indigo-500/30 flex flex-col items-center gap-4 shadow-lg" },
        MyReact.createElement("h3", { className: "text-indigo-400 text-sm font-bold uppercase tracking-wider" }, "MyReact Counter"),
        MyReact.createElement("h1", { className: "text-5xl font-black text-white" }, count.toString()),
        MyReact.createElement(
          "div",
          { className: "flex gap-2" },
          MyReact.createElement(
            "button",
            { 
              onClick: handleIncrement,
              className: "px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md font-medium transition-colors"
            },
            "Increment"
          ),
          MyReact.createElement(
            "button",
            { 
              onClick: handleReset,
              className: "px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-md font-medium transition-colors"
            },
            "Reset"
          )
        )
      );
    }

    // 2. A Static Tree Component
    function InfoCard() {
        return MyReact.createElement(
            "div",
            { className: "mt-4 p-4 bg-slate-900/50 rounded-lg text-center border border-slate-700" },
            MyReact.createElement("p", { className: "text-slate-400 text-sm italic" }, "This UI is rendered by the custom 'MyReact' engine, not the main React instance.")
        )
    }

    // 3. App Component
    function App() {
      return MyReact.createElement(
        "div",
        { className: "w-full max-w-sm mx-auto font-sans" },
        MyReact.createElement(Counter, { initial: 0 }),
        MyReact.createElement(InfoCard, {})
      );
    }

    // --- MOUNTING ---
    containerRef.current.innerHTML = ""; // Clear previous
    MyReact.render(MyReact.createElement(App, {}), containerRef.current);

  }, [key]);

  return (
    <div className="flex flex-col h-full">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                Live Preview
            </h2>
            <button 
                onClick={() => setKey(k => k + 1)}
                className="text-xs px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition-colors"
            >
                Remount MyReact
            </button>
        </div>
        
        <div className="flex-1 bg-black/40 rounded-xl border border-slate-800 p-8 flex items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
            
            {/* The Mounting Point for MyReact */}
            <div ref={containerRef} id="my-react-root" className="relative z-10 w-full"></div>

            <div className="absolute bottom-2 right-2 text-[10px] text-slate-600 font-mono pointer-events-none">
               MyReact.render(&lt;App /&gt;, root)
            </div>
        </div>
    </div>
  );
};

export default DemoSandbox;
