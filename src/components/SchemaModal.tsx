'use client';

import React from 'react';
import { GitFork, X } from 'lucide-react';

interface SchemaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SchemaModal: React.FC<SchemaModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#111827] border border-gray-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-gray-800 pb-3">
          <div className="flex items-center gap-2">
            <GitFork className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white">Why a Graph Database for Career Roadmaps?</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 text-xs text-gray-300 leading-relaxed">
          <p>
            In a relational SQL database, modeling prerequisite chains of variable depth (e.g. <em>&quot;What are all cascading prerequisites to master Transformer Architecture?&quot;</em>) requires expensive recursive CTEs and multiple self-joins that degrade in performance.
          </p>

          <div className="p-3.5 rounded-xl bg-gray-900 border border-gray-800 space-y-2">
            <h4 className="font-bold text-indigo-300">Graph Database Superpowers Utilized:</h4>
            <ul className="list-disc list-inside space-y-1.5 text-gray-400">
              <li><strong className="text-white">Transitive Dependency Closure:</strong> Variable-length traversals (<code>-[:PREREQUISITE_OF*1..5]-&gt;</code>) execute in constant time via index-free adjacency.</li>
              <li><strong className="text-white">Shortest Learning Paths:</strong> Native Dijkstra / BFS traversal via <code>shortestPath()</code> without junction tables.</li>
              <li><strong className="text-white">Multi-Hop Traversal (3 Hops):</strong> <code>JobRole -&gt; TargetSkill -&gt; Prerequisite -&gt; Course</code> executed in a single parameterized Cypher query.</li>
            </ul>
          </div>

          <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-800/30">
            <span className="font-bold text-indigo-300 block mb-1">CognoDB Cloud + openCypher:</span>
            Uses official Neo4j Bolt protocol (5.0+) with parameterized Cypher queries to ensure high throughput, type safety, and zero SQL/Cypher injection.
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition">
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
