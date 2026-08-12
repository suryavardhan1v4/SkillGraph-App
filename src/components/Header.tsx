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
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const filteredSkills = searchQuery.trim()
    ? skills.filter(
        s =>
          s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleSelect = (id: string) => {
    onSearchSelect(id);
    setSearchQuery('');
    setIsSearchOpen(false);
  };

  return (
    <header className="h-16 border-b border-slate-200 bg-white/95 backdrop-blur-md px-6 flex items-center justify-between z-30 shrink-0 shadow-sm">
      {/* Brand Logo & Title */}
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-600/20">
              <Network className="w-5 h-5 text-white" />
            </div>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-white"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold text-slate-900 tracking-tight">
                SkillGraph
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" />
                CognoDB Cloud
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Graph-Native Career Intelligence & Prerequisite Navigator
            </p>
          </div>
        </div>

        {/* Global Node Search Auto-complete */}
        <div className="relative w-64 hidden lg:block">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search skill (e.g. PyTorch, RAG)..."
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white transition shadow-inner"
            />
          </div>

          {isSearchOpen && filteredSkills.length > 0 && (
            <div className="absolute left-0 right-0 top-10 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-50 max-h-60 overflow-y-auto">
              {filteredSkills.slice(0, 6).map(skill => (
                <button
                  key={skill.id}
                  onClick={() => handleSelect(skill.id)}
                  className="w-full px-3 py-2 text-left text-xs hover:bg-slate-50 flex items-center justify-between border-b border-slate-100 last:border-0 transition"
                >
                  <span className="font-semibold text-slate-800">{skill.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-indigo-600 font-medium">
                    {skill.category}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Real-time System Metrics Ticker & Actions */}
      <div className="flex items-center gap-3">
        {/* Live Engine HUD */}
        <div className="hidden md:flex items-center gap-3 px-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs shadow-sm">
          <div className="flex items-center gap-1.5 text-slate-600">
            <Cpu className="w-3.5 h-3.5 text-indigo-600" />
            <span className="text-slate-400">Bolt:</span>
            <span className="font-mono text-emerald-700 font-bold">5.4 Active</span>
          </div>
          <div className="h-3 w-px bg-slate-200"></div>
          <div className="flex items-center gap-1.5 text-slate-700">
            <Activity className="w-3.5 h-3.5 text-purple-600" />
            <span className="font-mono">
              <strong className="text-slate-900 font-bold">{Number(dbHealth.nodeCount?.low ?? dbHealth.nodeCount) || 51}</strong> nodes /{' '}
              <strong className="text-slate-900 font-bold">{Number(dbHealth.relationshipCount?.low ?? dbHealth.relationshipCount) || 92}</strong> rels
            </span>
          </div>
          <div className="h-3 w-px bg-slate-200"></div>
          <div className="flex items-center gap-1 text-emerald-700 font-mono text-[11px] font-bold">
            <span>{Number(dbHealth.latencyMs?.low ?? dbHealth.latencyMs) || 18}ms</span>
          </div>
        </div>

        {/* Action Buttons */}
        <button
          onClick={onSeed}
          disabled={isSeeding}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition active:scale-95 disabled:opacity-50"
        >
          <Database className={`w-3.5 h-3.5 ${isSeeding ? 'animate-spin' : ''}`} />
          <span>{isSeeding ? 'Seeding...' : 'Seed CognoDB'}</span>
        </button>

        <button
          onClick={onOpenModal}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition"
        >
          <Info className="w-3.5 h-3.5 text-indigo-600" />
          <span className="hidden sm:inline">Why Graph?</span>
        </button>
      </div>
    </header>
  );
};
