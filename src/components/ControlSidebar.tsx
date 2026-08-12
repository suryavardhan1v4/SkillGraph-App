'use client';

import React, { useState } from 'react';
import {
  Briefcase,
  GitCommit,
  ChevronDown,
  CheckCircle2,
  Layers,
  GraduationCap,
  Zap,
  ExternalLink,
  BarChart3,
  CheckSquare,
  Sparkles,
  Percent,
} from 'lucide-react';

interface ControlSidebarProps {
  roles: any[];
  skills: any[];
  selectedRole: any;
  onSelectRole: (roleId: string) => void;
  onComputePath: (start: string, end: string) => void;
  pathResult: any;
  onSelectSkillForInspection: (skillId: string) => void;
  selectedCategories: string[];
  onToggleCategory: (cat: string) => void;
}

export const ControlSidebar: React.FC<ControlSidebarProps> = ({
  roles,
  skills,
  selectedRole,
  onSelectRole,
  onComputePath,
  pathResult,
  onSelectSkillForInspection,
  selectedCategories,
  onToggleCategory,
}) => {
  const [activeTab, setActiveTab] = useState<'role' | 'path' | 'analytics'>('role');
  const [startSkill, setStartSkill] = useState('python');
  const [endSkill, setEndSkill] = useState('llm_agents');
  const [knownSkills, setKnownSkills] = useState<Set<string>>(new Set(['python', 'data_structures', 'git', 'sql']));

  const toggleKnownSkill = (skillId: string) => {
    setKnownSkills(prev => {
      const next = new Set(prev);
      if (next.has(skillId)) next.delete(skillId);
      else next.add(skillId);
      return next;
    });
  };

  // Calculate Readiness for selected role
  const requiredSkillIds = selectedRole?.requiredSkills?.map((s: any) => s.id) || [];
  const matchedSkillsCount = requiredSkillIds.filter((id: string) => knownSkills.has(id)).length;
  const readinessPercent = requiredSkillIds.length > 0 ? Math.round((matchedSkillsCount / requiredSkillIds.length) * 100) : 0;

  return (
    <aside className="w-96 bg-[#0B1020]/95 border-r border-gray-800/80 flex flex-col z-20 shrink-0 backdrop-blur-sm shadow-xl">
      {/* MODE TABS */}
      <div className="p-3 border-b border-gray-800/80 grid grid-cols-3 gap-1 bg-gray-950/40">
        <button
          onClick={() => setActiveTab('role')}
          className={`flex items-center justify-center gap-1 py-2 px-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'role'
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30'
              : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900/60'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>Roadmaps</span>
        </button>

        <button
          onClick={() => setActiveTab('path')}
          className={`flex items-center justify-center gap-1 py-2 px-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'path'
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-600/30'
              : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900/60'
          }`}
        >
          <GitCommit className="w-3.5 h-3.5" />
          <span>Path Finder</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center justify-center gap-1 py-2 px-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'analytics'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/30'
              : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900/60'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Insights</span>
        </button>
      </div>

      {/* TAB 1: CAREER ROLE & READINESS ANALYZER */}
      {activeTab === 'role' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1.5 uppercase tracking-wider">
              Target Career Pathway
            </label>
            <div className="relative">
              <select
                value={selectedRole?.roleId || ''}
                onChange={e => onSelectRole(e.target.value)}
                className="w-full bg-gray-900/90 border border-gray-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 appearance-none font-semibold pr-8 shadow-inner"
              >
                <option value="">-- Select Target Career Goal --</option>
                {roles.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.title} ({r.avgSalary})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>

          {selectedRole && selectedRole.found && (
            <>
              {/* Role Overview Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-b from-indigo-950/40 via-purple-950/20 to-gray-900/60 border border-indigo-700/40 space-y-2 shadow-lg">
                <div className="flex items-start justify-between">
                  <h3 className="text-sm font-extrabold text-white leading-tight">{selectedRole.title}</h3>
                  <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    {selectedRole.avgSalary}
                  </span>
                </div>
                <p className="text-[11px] text-indigo-300 font-semibold">{selectedRole.department}</p>
                <p className="text-xs text-gray-300 leading-relaxed">{selectedRole.description}</p>
              </div>

              {/* Interactive Career Readiness Meter */}
              <div className="p-3.5 rounded-xl bg-gray-900/90 border border-gray-800 space-y-2 shadow-inner">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-gray-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    Career Readiness Score
                  </span>
                  <span className="font-mono font-extrabold text-emerald-400 text-sm">{readinessPercent}%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 transition-all duration-500"
                    style={{ width: `${readinessPercent}%` }}
                  ></div>
                </div>
                <p className="text-[10px] text-gray-400">
                  {matchedSkillsCount} of {requiredSkillIds.length} required competencies mastered.
                </p>
              </div>

              {/* Multi-Hop Breakdown */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                  <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">Multi-Hop Traversal (3 Hops)</span>
                  <span className="text-[10px] font-mono text-emerald-400">⚡ {selectedRole.executionMs}ms in CognoDB</span>
                </div>

                {/* Direct Requirements Checklist */}
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-indigo-400 mb-2">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Direct Core Requirements (Hop 1)</span>
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {selectedRole.requiredSkills?.map((skill: any) => {
                      const isKnown = knownSkills.has(skill.id);
                      return (
                        <div
                          key={skill.id}
                          className="flex items-center justify-between p-2 rounded-xl bg-gray-900/90 border border-gray-800 hover:border-indigo-600/60 transition text-xs"
                        >
                          <button
                            onClick={() => onSelectSkillForInspection(skill.id)}
                            className="font-medium text-white hover:text-indigo-300 text-left"
                          >
                            {skill.name}
                          </button>
                          <button
                            onClick={() => toggleKnownSkill(skill.id)}
                            className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold transition flex items-center gap-1 ${
                              isKnown
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                : 'bg-gray-800 text-gray-400 hover:text-white border border-gray-700'
                            }`}
                          >
                            {isKnown ? 'Mastered' : '+ Mark Known'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Upstream Prerequisites (Hop 2) */}
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-400 mb-2">
                    <Layers className="w-3.5 h-3.5" />
                    <span>Upstream Dependencies (Hop 2)</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedRole.upstreamPrerequisites?.map((prereq: any) => (
                      <button
                        key={prereq.id}
                        onClick={() => onSelectSkillForInspection(prereq.id)}
                        className="text-[11px] px-2.5 py-1 rounded-xl bg-purple-950/60 text-purple-200 border border-purple-800/50 font-medium hover:bg-purple-900 transition"
                      >
                        {prereq.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Recommended Courses (Hop 3) */}
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 mb-2">
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>Accredited Courses (Hop 3)</span>
                  </div>
                  <div className="space-y-2">
                    {selectedRole.recommendedCourses?.slice(0, 4).map((course: any) => (
                      <div
                        key={course.id}
                        className="p-2.5 rounded-xl bg-gray-900/90 border border-gray-800 hover:border-emerald-700/60 transition text-xs space-y-1"
                      >
                        <div className="flex items-start justify-between">
                          <a
                            href={course.url}
                            target="_blank"
                            rel="noreferrer"
                            className="font-bold text-white hover:text-emerald-400 flex items-center gap-1 leading-snug"
                          >
                            <span>{course.title}</span>
                            <ExternalLink className="w-3 h-3 shrink-0" />
                          </a>
                          <span className="text-[10px] text-gray-400 font-mono shrink-0">{course.durationHours}h</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-gray-400">
                          <span className="px-1.5 py-0.5 rounded bg-gray-800 text-gray-300 font-medium">{course.provider}</span>
                          <span>
                            Teaches: <strong className="text-indigo-300">{course.teachesSkill}</strong>
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* TAB 2: SHORTEST LEARNING PATH SIMULATOR */}
      {activeTab === 'path' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="p-3.5 rounded-2xl bg-purple-950/30 border border-purple-800/40 text-xs text-purple-200 leading-relaxed shadow-sm">
            <span className="font-bold text-purple-300 flex items-center gap-1 mb-1">
              <Zap className="w-3.5 h-3.5" />
              openCypher shortestPath():
            </span>
            Calculates the mathematical shortest sequence of prerequisites connecting any two skill concepts.
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5">1. Starting Skill (Where You Are)</label>
              <select
                value={startSkill}
                onChange={e => setStartSkill(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 font-medium"
              >
                {skills.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.category})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5">2. Target Goal Skill (Where You Want To Go)</label>
              <select
                value={endSkill}
                onChange={e => setEndSkill(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 font-medium"
              >
                {skills.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.category})
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() => onComputePath(startSkill, endSkill)}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-extrabold shadow-lg shadow-purple-600/30 transition flex items-center justify-center gap-2 active:scale-95"
            >
              <Zap className="w-4 h-4" />
              <span>Simulate Learning Sequence</span>
            </button>
          </div>

          {pathResult && (
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs font-bold text-gray-300 border-b border-gray-800 pb-2">
                <span>Computed Sequence</span>
                <span className="font-mono text-purple-400">
                  {pathResult.found ? `${pathResult.hops} Hops • ${pathResult.executionMs}ms` : 'No Path'}
                </span>
              </div>
              <div className="space-y-2 relative before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gray-800">
                {pathResult.steps?.map((step: any, idx: number) => (
                  <div
                    key={step.id}
                    onClick={() => onSelectSkillForInspection(step.id)}
                    className="relative flex items-center gap-3 pl-1 text-xs cursor-pointer group"
                  >
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-purple-600 to-pink-600 border-2 border-gray-900 text-white font-mono text-[10px] font-bold flex items-center justify-center shrink-0 z-10 group-hover:scale-110 transition shadow-md">
                      {idx + 1}
                    </div>
                    <div className="flex-1 p-2.5 rounded-xl bg-gray-900/90 border border-gray-800 group-hover:border-purple-600 transition shadow-inner">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white group-hover:text-purple-300">{step.name}</span>
                        <span className="text-[10px] font-mono text-purple-400">{step.difficulty}</span>
                      </div>
                      <span className="text-[10px] text-gray-400">{step.category}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: GRAPH TOPOLOGY & DEGREE ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-800/40 text-xs text-emerald-200 leading-relaxed shadow-sm">
            <span className="font-bold text-emerald-300 block mb-1">Graph Centrality Insights:</span>
            Identifies core foundational skills vs high-leverage advanced tech nodes.
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">Top Foundational Gateways (In-Degree)</h4>
            <div className="space-y-2">
              {[
                { name: 'Python Programming', count: '12 Unlocks', category: 'Core Programming' },
                { name: 'Data Structures & Algorithms', count: '9 Unlocks', category: 'Core Programming' },
                { name: 'SQL & Relational DBs', count: '7 Unlocks', category: 'Core Programming' },
                { name: 'Deep Learning & Neural Networks', count: '6 Unlocks', category: 'AI & ML' },
                { name: 'Docker & Containerization', count: '5 Unlocks', category: 'Backend & Cloud' },
              ].map(item => (
                <div key={item.name} className="p-2.5 rounded-xl bg-gray-900/90 border border-gray-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-white block">{item.name}</span>
                    <span className="text-[10px] text-gray-400">{item.category}</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* DOMAIN FILTER LEGEND */}
      <div className="p-3.5 border-t border-gray-800/80 bg-gray-950/60 shrink-0">
        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Filter Graph Domains</span>
        <div className="grid grid-cols-2 gap-1.5 text-xs">
          {[
            { label: 'AI & ML', color: 'bg-purple-500' },
            { label: 'Backend & Cloud', color: 'bg-cyan-500' },
            { label: 'Frontend', color: 'bg-emerald-500' },
            { label: 'Data Engineering', color: 'bg-rose-500' },
            { label: 'Core Programming', color: 'bg-indigo-500' },
          ].map(cat => (
            <label key={cat.label} className="flex items-center gap-2 text-gray-300 cursor-pointer hover:text-white">
              <input
                type="checkbox"
                checked={selectedCategories.includes(cat.label)}
                onChange={() => onToggleCategory(cat.label)}
                className="accent-indigo-500 rounded"
              />
              <span className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${cat.color}`}></span> {cat.label}
              </span>
            </label>
          ))}
        </div>
      </div>
    </aside>
  );
};
