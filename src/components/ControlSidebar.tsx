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
  Sparkles,
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
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const toggleKnownSkill = (skillId: string) => {
    setKnownSkills(prev => {
      const next = new Set(prev);
      if (next.has(skillId)) next.delete(skillId);
      else next.add(skillId);
      return next;
    });
  };

  const requiredSkillIds = selectedRole?.requiredSkills?.map((s: any) => s.id) || [];
  const matchedSkillsCount = requiredSkillIds.filter((id: string) => knownSkills.has(id)).length;
  const readinessPercent = requiredSkillIds.length > 0 ? Math.round((matchedSkillsCount / requiredSkillIds.length) * 100) : 0;

  return (
    <aside className="w-96 bg-white border-r border-slate-200 flex flex-col z-20 shrink-0 shadow-sm h-full max-h-full min-h-0 overflow-hidden">
      {/* MODE TABS */}
      <div className="p-3 border-b border-slate-200 grid grid-cols-3 gap-1 bg-slate-50 shrink-0">
        <button
          onClick={() => setActiveTab('role')}
          className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'role'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>Roadmaps</span>
        </button>

        <button
          onClick={() => setActiveTab('path')}
          className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'path'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <GitCommit className="w-3.5 h-3.5" />
          <span>Path Finder</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'analytics'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Insights</span>
        </button>
      </div>

      {/* TAB 1: CAREER ROLE & READINESS ANALYZER */}
      {activeTab === 'role' && (
        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 pb-16">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Target Career Pathway
            </label>
            <div className="relative">
              <select
                value={selectedRole?.roleId || ''}
                onChange={e => onSelectRole(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 appearance-none font-semibold pr-8 shadow-sm"
              >
                <option value="">-- Select Target Career Goal --</option>
                {roles.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.title} ({r.avgSalary})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>

          {selectedRole && selectedRole.found && (
            <>
              {/* Role Overview Card */}
              <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200/80 space-y-2 shadow-sm">
                <div className="flex items-start justify-between">
                  <h3 className="text-sm font-extrabold text-slate-900 leading-tight">{selectedRole.title}</h3>
                  <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300">
                    {selectedRole.avgSalary}
                  </span>
                </div>
                <p className="text-[11px] text-indigo-700 font-semibold">{selectedRole.department}</p>
                <p className="text-xs text-slate-600 leading-relaxed">{selectedRole.description}</p>
              </div>

              {/* Interactive Career Readiness Meter */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 shadow-sm">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    Career Readiness Score
                  </span>
                  <span className="font-mono font-extrabold text-emerald-700 text-sm">{readinessPercent}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="h-2.5 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 transition-all duration-500"
                    style={{ width: `${readinessPercent}%` }}
                  ></div>
                </div>
                <p className="text-[10px] text-slate-500">
                  {matchedSkillsCount} of {requiredSkillIds.length} required competencies mastered.
                </p>
              </div>

              {/* Multi-Hop Breakdown */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Multi-Hop Traversal (3 Hops)</span>
                  <span className="text-[10px] font-mono text-emerald-700 font-bold">⚡ {selectedRole.executionMs}ms in CognoDB</span>
                </div>

                {/* Direct Requirements Checklist */}
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-indigo-700 mb-2">
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
                          className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-indigo-300 transition text-xs"
                        >
                          <button
                            onClick={() => onSelectSkillForInspection(skill.id)}
                            className="font-semibold text-slate-800 hover:text-indigo-600 text-left"
                          >
                            {skill.name}
                          </button>
                          <button
                            onClick={() => toggleKnownSkill(skill.id)}
                            className={`px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold transition flex items-center gap-1 ${
                              isKnown
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-300 shadow-sm'
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
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-700 mb-2">
                    <Layers className="w-3.5 h-3.5" />
                    <span>Upstream Dependencies (Hop 2)</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedRole.upstreamPrerequisites?.map((prereq: any) => (
                      <button
                        key={prereq.id}
                        onClick={() => onSelectSkillForInspection(prereq.id)}
                        className="text-[11px] px-3 py-1 rounded-xl bg-purple-50 text-purple-800 border border-purple-200 font-medium hover:bg-purple-100 transition shadow-sm"
                      >
                        {prereq.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Recommended Courses (Hop 3) */}
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 mb-2">
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>Accredited Courses (Hop 3)</span>
                  </div>
                  <div className="space-y-2">
                    {selectedRole.recommendedCourses?.slice(0, 4).map((course: any) => (
                      <div
                        key={course.id}
                        className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-emerald-300 transition text-xs space-y-1"
                      >
                        <div className="flex items-start justify-between">
                          <a
                            href={course.url}
                            target="_blank"
                            rel="noreferrer"
                            className="font-bold text-slate-900 hover:text-emerald-700 flex items-center gap-1 leading-snug"
                          >
                            <span>{course.title}</span>
                            <ExternalLink className="w-3 h-3 shrink-0" />
                          </a>
                          <span className="text-[10px] text-slate-500 font-mono shrink-0">
                            {Number(course.durationHours?.low ?? course.durationHours) || 0}h
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500">
                          <span className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-medium">{course.provider}</span>
                          <span>
                            Teaches: <strong className="text-indigo-700">{course.teachesSkill}</strong>
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
        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 pb-16">
          <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200 text-xs text-purple-900 leading-relaxed shadow-sm">
            <span className="font-bold text-purple-800 flex items-center gap-1 mb-1">
              <Zap className="w-3.5 h-3.5 text-purple-600" />
              openCypher shortestPath():
            </span>
            Calculates the mathematical shortest sequence of prerequisites connecting any two skill concepts.
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">1. Starting Skill (Where You Are)</label>
              <select
                value={startSkill}
                onChange={e => setStartSkill(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-purple-600 font-medium shadow-sm"
              >
                {skills.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.category})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">2. Target Goal Skill (Where You Want To Go)</label>
              <select
                value={endSkill}
                onChange={e => setEndSkill(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-purple-600 font-medium shadow-sm"
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
              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-extrabold shadow-md shadow-purple-600/20 transition flex items-center justify-center gap-2 active:scale-95"
            >
              <Zap className="w-4 h-4" />
              <span>Simulate Learning Sequence</span>
            </button>
          </div>

          {pathResult && (
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 border-b border-slate-200 pb-2">
                <span>Computed Sequence</span>
                <span className="font-mono text-purple-700 font-bold">
                  {pathResult.found ? `${pathResult.hops} Hops • ${pathResult.executionMs}ms` : 'No Path'}
                </span>
              </div>
              <div className="space-y-2 relative before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200 pb-6">
                {pathResult.steps?.map((step: any, idx: number) => (
                  <div
                    key={step.id}
                    onClick={() => onSelectSkillForInspection(step.id)}
                    className="relative flex items-center gap-3 pl-1 text-xs cursor-pointer group"
                  >
                    <div className="w-6 h-6 rounded-full bg-purple-600 text-white font-mono text-[10px] font-bold flex items-center justify-center shrink-0 z-10 group-hover:scale-110 transition shadow-md">
                      {idx + 1}
                    </div>
                    <div className="flex-1 p-2.5 rounded-xl bg-slate-50 border border-slate-200 group-hover:border-purple-500 transition shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 group-hover:text-purple-700">{step.name}</span>
                        <span className="text-[10px] font-mono text-purple-700 font-bold">{step.difficulty}</span>
                      </div>
                      <span className="text-[10px] text-slate-500">{step.category}</span>
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
        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 pb-16">
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 leading-relaxed shadow-sm">
            <span className="font-bold text-emerald-800 block mb-1">Graph Centrality Insights:</span>
            Identifies core foundational skills vs high-leverage advanced tech nodes.
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Top Foundational Gateways (In-Degree)</h4>
            <div className="space-y-2">
              {[
                { name: 'Python Programming', count: '12 Unlocks', category: 'Core Programming' },
                { name: 'Data Structures & Algorithms', count: '9 Unlocks', category: 'Core Programming' },
                { name: 'SQL & Relational DBs', count: '7 Unlocks', category: 'Core Programming' },
                { name: 'Deep Learning & Neural Networks', count: '6 Unlocks', category: 'AI & ML' },
                { name: 'Docker & Containerization', count: '5 Unlocks', category: 'Backend & Cloud' },
              ].map(item => (
                <div key={item.name} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900 block">{item.name}</span>
                    <span className="text-[10px] text-slate-500">{item.category}</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700 border border-indigo-200">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* DOMAIN FILTER ACCORDION FOOTER */}
      <div className="border-t border-slate-200 bg-slate-50 shrink-0">
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="w-full px-3.5 py-2 flex items-center justify-between text-[11px] font-bold text-slate-700 hover:text-indigo-600 transition"
        >
          <span className="flex items-center gap-1.5 uppercase tracking-wider">
            <span>Filter Domains</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-100 text-indigo-700">
              {selectedCategories.length}/5
            </span>
          </span>
          <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${isFilterOpen ? 'rotate-180' : ''}`} />
        </button>

        {isFilterOpen && (
          <div className="px-3.5 pb-3 pt-1 border-t border-slate-200/60 grid grid-cols-2 gap-1.5 text-xs">
            {[
              { label: 'AI & ML', color: 'bg-purple-500' },
              { label: 'Backend & Cloud', color: 'bg-cyan-500' },
              { label: 'Frontend', color: 'bg-emerald-500' },
              { label: 'Data Engineering', color: 'bg-rose-500' },
              { label: 'Core Programming', color: 'bg-indigo-500' },
            ].map(cat => (
              <label key={cat.label} className="flex items-center gap-2 text-slate-700 cursor-pointer hover:text-slate-900">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(cat.label)}
                  onChange={() => onToggleCategory(cat.label)}
                  className="accent-indigo-600 rounded"
                />
                <span className="flex items-center gap-1.5 text-[11px]">
                  <span className={`w-2 h-2 rounded-full ${cat.color}`}></span> {cat.label}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
};
