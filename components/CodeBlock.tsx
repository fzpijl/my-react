import React from 'react';

interface CodeBlockProps {
  code: string;
  highlight?: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code }) => {
  return (
    <div className="bg-[#1e293b] rounded-lg overflow-hidden border border-slate-700 shadow-xl font-mono text-sm leading-6">
      <div className="flex items-center px-4 py-2 bg-[#0f172a] border-b border-slate-700">
        <div className="flex space-x-2 mr-4">
            <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
        </div>
        <span className="text-slate-400 text-xs">MyReactImpl.js</span>
      </div>
      <div className="p-4 overflow-x-auto">
        <pre className="text-slate-300">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};

export default CodeBlock;
