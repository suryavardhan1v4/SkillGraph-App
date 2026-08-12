'use client';

import React, { useState } from 'react';
import { Network, Database, Info, Search, Activity, Cpu, Sparkles } from 'lucide-react';

interface HeaderProps {
  dbHealth: { status: string; nodeCount?: any; relationshipCount?: any; latencyMs?: any; mode?: string };
  onSeed: () => void;
  onOpenModal: () => void;
  isSeeding: boolean;
  skills: any[];
  onSearchSelect: (skillId: string) => void;
  queryCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  dbHealth,
  onSeed,
  onOpenModal,
  isSeeding,
  skills,
  onSearchSelect,
  queryCount,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const filteredSkills = searchQuery.trim()
    ? skills.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.category.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const handleSelect = (id: string) => {
    onSearchSelect(id);
    setSearchQuery('');
    setIsSearchOpen(false);
  };

  return (
    <header className="h-16 border-b border-gray-800/80 bg-[#080d1a]/95 backdrop-blur-md px-6 flex items-center justify-between z-30 shrink-0">
      {/* Brand Logo & Title */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Network className="w-5 h-5 text-white" />
            </div>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-[#080d1a]"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold text-white tracking-tight bg-gradient-to-r from-white via-gray-200 to-indigo-200 bg-clip-text text-transparent">
                SkillGraph
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" />
                CognoDB Cloud
              </span>
            </div>
            <p className="text-[11px] text-gray-400 flex items-center gap-1.5">
              <span>Graph-Native Career & Prerequisite Intelligence</span>
            </p>
          </div>
        </div>

        {/* Global Node Search Auto-complete */}
        <div className="relative w-64 hidden lg:block">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search skill (e.g. PyTorch, RAG)..."
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              className="w-full bg-gray-900/90 border border-gray-700/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition shadow-inner"
            />
          </div>

          {isSearchOpen && filteredSkills.length > 0 && (
            <div className="absolute left-0 right-0 top-10 bg-[#0f172a] border border-gray-700 rounded-xl shadow-2xl overflow-hidden z-50 max-h-60 overflow-y-auto">
              {filteredSkills.slice(0, 6).map(skill => (
                <button
                  key={skill.id}
                  onClick={() => handleSelect(skill.id)}
                  className="w-full px-3 py-2 text-left text-xs hover:bg-indigo-950/60 flex items-center justify-between border-b border-gray-800/60 last:border-0 transition"
                >
                  <span className="font-semibold text-white">{skill.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-800 text-indigo-300">{skill.category}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Real-time System Metrics Ticker & Actions */}
      <div className="flex items-center gap-3">
        {/* Live Engine HUD */}
        <div className="hidden md:flex items-center gap-3 px-3 py-1.5 rounded-xl bg-gray-900/90 border border-gray-800/90 text-xs shadow-inner">
          <div className="flex items-center gap-1.5 text-gray-300">
            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-gray-400">Bolt:</span>
            <span className="font-mono text-emerald-400 font-bold">5.4 Active</span>
          </div>
          <div className="h-3 w-px bg-gray-800"></div>
          <div className="flex items-center gap-1.5 text-gray-300">
            <Activity className="w-3.5 h-3.5 text-purple-400" />
            <span className="font-mono text-gray-200">
              <strong className="text-white font-bold">{Number(dbHealth.nodeCount?.low ?? dbHealth.nodeCount) || 51}</strong> nodes /{' '}
              <strong className="text-white font-bold">{Number(dbHealth.relationshipCount?.low ?? dbHealth.relationshipCount) || 92}</strong> rels
            </span>
          </div>
          <div className="h-3 w-px bg-gray-800"></div>
          <div className="flex items-center gap-1 text-emerald-400 font-mono text-[11px]">
            <span>{Number(dbHealth.latencyMs?.low ?? dbHealth.latencyMs) || 18}ms</span>
          </div>
        </div>

        {/* Action Buttons */}
        <button
          onClick={onSeed}
          disabled={isSeeding}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 transition active:scale-95 disabled:opacity-50"
        >
          <Database className={`w-3.5 h-3.5 ${isSeeding ? 'animate-spin' : ''}`} />
          <span>{isSeeding ? 'Seeding...' : 'Seed CognoDB'}</span>
        </button>

        <button
          onClick={onOpenModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-800/90 hover:bg-gray-700 text-gray-300 hover:text-white text-xs font-medium border border-gray-700/80 transition shadow-sm"
        >
          <Info className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden sm:inline">Why Graph?</span>
        </button>
      </div>
    </header>
  );
};
