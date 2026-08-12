'use client';

import React from 'react';
import { Terminal, Code2 } from 'lucide-react';

interface CypherBarProps {
  cypher: string;
  latencyMs: number;
}

export const CypherBar: React.FC<CypherBarProps> = ({ cypher, latencyMs }) => {
  return (
    <div className="h-12 border-t border-gray-800/80 bg-[#0a0f1c]/95 px-4 flex items-center justify-between text-xs z-10 shrink-0">
      <div className="flex items-center gap-3 overflow-hidden">
        <span className="flex items-center gap-1.5 text-indigo-400 font-bold shrink-0">
          <Terminal className="w-3.5 h-3.5" />
          <span>Live openCypher:</span>
        </span>
        <code className="font-mono text-[11px] text-gray-300 truncate max-w-2xl bg-black/40 px-2 py-1 rounded border border-gray-800/60">
          {cypher.replace(/\s+/g, ' ').trim()}
        </code>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className="font-mono text-[11px] text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/30">
          ⚡ {latencyMs}ms in CognoDB
        </span>
        <span className="text-gray-500">
          <Code2 className="w-4 h-4" />
        </span>
      </div>
    </div>
  );
};
