'use client';

import React, { useState } from 'react';
import { Terminal, Play, ChevronUp, ChevronDown, CheckCircle, Clock, Zap, Copy } from 'lucide-react';

interface CypherConsoleProps {
  currentCypher: string;
  currentLatency: number;
  onExecutePreset: (presetName: string) => void;
}

const PRESET_QUERIES = [
  {
    name: '3-Hop Career Multi-Hop',
    label: 'JobRole -> Skill -> Prereq -> Course',
    cypher: `MATCH (role:JobRole {id: 'ai_llm_engineer'})-[:REQUIRES_SKILL]->(skill:Skill)\nOPTIONAL MATCH (prereq:Skill)-[:PREREQUISITE_OF]->(skill)\nOPTIONAL MATCH (course:Course)-[:TEACHES]->(skill)\nRETURN role.title, skill.name, prereq.name, course.title`,
  },
  {
    name: 'Shortest Learning Path',
    label: 'shortestPath(python -> llm_agents)',
    cypher: `MATCH (s:Skill {id: 'python'}), (e:Skill {id: 'llm_agents'})\nMATCH path = shortestPath((s)-[:PREREQUISITE_OF*]->(e))\nRETURN [n in nodes(path) | n.name] AS steps, length(path) AS hops`,
  },
  {
    name: 'Variable-Depth Prerequisite Tree',
    label: 'Transitive Closure (*1..5 Hops)',
    cypher: `MATCH (target:Skill {id: 'transformers'})\nOPTIONAL MATCH path = (prereq:Skill)-[:PREREQUISITE_OF*1..5]->(target)\nRETURN prereq.name, min(length(path)) AS depth\nORDER BY depth ASC`,
  },
  {
    name: 'Industry Foundation Ranking',
    label: 'Most Depended-on Foundational Skills',
    cypher: `MATCH (s:Skill)<-[:PREREQUISITE_OF]-(dependent)\nRETURN s.name AS foundationalSkill, count(dependent) AS downstreamSkillsUnlocked\nORDER BY downstreamSkillsUnlocked DESC LIMIT 5`,
  },
];

export const CypherConsole: React.FC<CypherConsoleProps> = ({
  currentCypher,
  currentLatency,
  onExecutePreset,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCypher);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="border-t border-slate-200 bg-white/95 backdrop-blur-md z-30 transition-all duration-300 shadow-sm">
      {/* Console Bar Strip */}
      <div
        className="h-12 px-4 flex items-center justify-between text-xs cursor-pointer select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold shrink-0 shadow-sm">
            <Terminal className="w-3.5 h-3.5 text-indigo-600" />
            <span>openCypher Live REPL</span>
          </div>

          <code className="font-mono text-[11px] text-slate-800 truncate max-w-2xl bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 shadow-inner">
            {currentCypher.replace(/\s+/g, ' ').trim()}
          </code>
        </div>

        <div className="flex items-center gap-3 shrink-0" onClick={e => e.stopPropagation()}>
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 font-bold">
            <Clock className="w-3 h-3 text-emerald-600 animate-pulse" />
            <span>⚡ {currentLatency}ms</span>
          </div>

          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200 transition"
            title="Copy Cypher Query"
          >
            {copied ? <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-semibold transition"
          >
            <span>{isExpanded ? 'Collapse' : 'Query Sandbox'}</span>
            {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Expanded Sandbox Panel */}
      {isExpanded && (
        <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <Zap className="w-4 h-4 text-purple-600" />
              <span>Interactive openCypher Scenarios (Click to Execute on CognoDB):</span>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">Protocol: Bolt 5.0+ | Engine: openCypher</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {PRESET_QUERIES.map(preset => (
              <button
                key={preset.name}
                onClick={() => onExecutePreset(preset.name)}
                className="p-3 rounded-xl bg-white border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 text-left transition group space-y-1 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-700">{preset.name}</span>
                  <Play className="w-3 h-3 text-indigo-600 opacity-0 group-hover:opacity-100 transition" />
                </div>
                <p className="text-[10px] text-slate-500 line-clamp-1">{preset.label}</p>
              </button>
            ))}
          </div>

          <div className="relative rounded-xl bg-slate-900 border border-slate-800 p-3.5 overflow-x-auto shadow-inner">
            <pre className="text-xs font-mono text-emerald-400 leading-relaxed whitespace-pre-wrap">
              {currentCypher}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
