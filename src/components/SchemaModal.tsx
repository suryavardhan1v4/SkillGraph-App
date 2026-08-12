'use client';

import React from 'react';
import { X, Network, Database, CheckCircle2, Zap } from 'lucide-react';

interface SchemaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SchemaModal: React.FC<SchemaModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center">
              <Network className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">Why a Graph Database?</h2>
              <p className="text-xs text-slate-500">Relational SQL vs CognoDB openCypher Architecture</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
          <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200 space-y-2">
            <h3 className="text-sm font-extrabold text-indigo-900 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-indigo-600" />
              The Relational SQL Bottleneck
            </h3>
            <p>
              In a traditional relational SQL database, modeling variable-length prerequisite chains or multi-hop career paths
              requires recursive Common Table Expressions (<code className="bg-white px-1.5 py-0.5 rounded text-indigo-800 font-mono">WITH RECURSIVE</code>)
              and repeated self-joins across foreign keys. As the depth of prerequisite trees grows, query execution time degrades quadratically.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                <Database className="w-4 h-4 text-rose-600" />
                <span>Relational SQL Model</span>
              </div>
              <ul className="space-y-1 text-[11px] text-slate-500 list-disc pl-4">
                <li>Normalized tables with foreign key join tables.</li>
                <li>Requires recursive self-joins for transitive closure.</li>
                <li>Shortest path requires complex custom stored procedures.</li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-2">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                <Network className="w-4 h-4 text-emerald-600" />
                <span>CognoDB Graph Model</span>
              </div>
              <ul className="space-y-1 text-[11px] text-emerald-800 list-disc pl-4">
                <li>Index-free adjacency: relationships are direct pointers.</li>
                <li>Native <code className="bg-white px-1 rounded font-mono">shortestPath()</code> algorithm in 1 line.</li>
                <li>Variable-depth traversal <code className="bg-white px-1 rounded font-mono">[:PREREQUISITE_OF*1..5]</code> in ms.</li>
              </ul>
            </div>
          </div>

          {/* Schema Summary */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <h4 className="text-xs font-bold text-slate-800">Core Graph Schema Entities</h4>
            <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-[11px]">
              <div className="p-2 rounded-xl bg-white border border-slate-200 text-center">
                <strong className="text-indigo-600 block">:Skill</strong>
                <span className="text-[10px] text-slate-500 font-sans">35 nodes</span>
              </div>
              <div className="p-2 rounded-xl bg-white border border-slate-200 text-center">
                <strong className="text-purple-600 block">:JobRole</strong>
                <span className="text-[10px] text-slate-500 font-sans">6 nodes</span>
              </div>
              <div className="p-2 rounded-xl bg-white border border-slate-200 text-center">
                <strong className="text-emerald-600 block">:Course</strong>
                <span className="text-[10px] text-slate-500 font-sans">10 nodes</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition shadow-sm"
          >
            Close Overview
          </button>
        </div>
      </div>
    </div>
  );
};
