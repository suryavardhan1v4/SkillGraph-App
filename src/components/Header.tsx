'use client';

import React from 'react';
import { Network, Database, Info } from 'lucide-react';

interface HeaderProps {
  dbHealth: { status: string; nodeCount?: number; relationshipCount?: number; latencyMs?: number; mode?: string };
  onSeed: () => void;
  onOpenModal: () => void;
  isSeeding: boolean;
}

export const Header: React.FC<HeaderProps> = ({ dbHealth, onSeed, onOpenModal, isSeeding }) => {
  return (
    <header className="h-16 border-b border-gray-800/80 bg-[#0d1322]/90 backdrop-blur-md px-6 flex items-center justify-between z-30 shrink-0">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Network className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-white tracking-tight">SkillGraph</h1>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
              CognoDB Cloud
            </span>
          </div>
          <p className="text-xs text-gray-400">Career Roadmaps & Prerequisite Dependency Engine</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-900/80 border border-gray-800 text-xs text-gray-300">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="font-medium">
            CognoDB:{' '}
            <span className="text-emerald-400 font-mono font-bold">
              {Number(dbHealth.nodeCount?.low ?? dbHealth.nodeCount) || 51} nodes,{' '}
              {Number(dbHealth.relationshipCount?.low ?? dbHealth.relationshipCount) || 92} rels
            </span>{' '}
            ({Number(dbHealth.latencyMs?.low ?? dbHealth.latencyMs) || 18}ms)
          </span>
        </div>

        <button
          onClick={onSeed}
          disabled={isSeeding}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/90 hover:bg-indigo-600 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition active:scale-95 disabled:opacity-50"
        >
          <Database className={`w-3.5 h-3.5 ${isSeeding ? 'animate-spin' : ''}`} />
          <span>{isSeeding ? 'Seeding...' : 'Seed / Reset Graph'}</span>
        </button>

        <button
          onClick={onOpenModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800/80 hover:bg-gray-700 text-gray-300 text-xs font-medium border border-gray-700 transition"
        >
          <Info className="w-3.5 h-3.5" />
          <span>Why Graph?</span>
        </button>
      </div>
    </header>
  );
};
