'use client';

import React, { useState } from 'react';
import { Briefcase, GitCommit, ChevronDown, CheckCircle2, Layers, GraduationCap, Zap, ExternalLink } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<'role' | 'path'>('role');
  const [startSkill, setStartSkill] = useState('python');
  const [endSkill, setEndSkill] = useState('llm_agents');

  return (
    <aside className="w-96 bg-[#0E1424]/95 border-r border-gray-800/80 flex flex-col z-20 shrink-0 backdrop-blur-sm">
      {/* MODE TABS */}
      <div className="p-3 border-b border-gray-800/80 grid grid-cols-2 gap-1 bg-gray-950/40">
        <button
          onClick={() => setActiveTab('role')}
          className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition ${
            activeTab === 'role' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>Career Role</span>
        </button>
        <button
          onClick={() => setActiveTab('path')}
          className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition ${
            activeTab === 'path' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <GitCommit className="w-3.5 h-3.5" />
          <span>Shortest Path</span>
        </button>
      </div>

      {/* TAB CONTENT: ROLE NAVIGATOR */}
      {activeTab === 'role' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">Select Target Career Goal</label>
            <div className="relative">
              <select
                value={selectedRole?.roleId || ''}
                onChange={e => onSelectRole(e.target.value)}
                className="w-full bg-gray-900/90 border border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 appearance-none font-medium pr-8"
              >
                <option value="">-- Choose a Target Role --</option>
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
              <div className="p-3.5 rounded-xl bg-gradient-to-b from-indigo-950/40 to-gray-900/40 border border-indigo-800/40 space-y-2">
                <div className="flex items-start justify-between">
                  <h3 className="text-sm font-bold text-white leading-tight">{selectedRole.title}</h3>
                  <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {selectedRole.avgSalary}
                  </span>
                </div>
                <p className="text-[11px] text-indigo-300 font-medium">{selectedRole.department}</p>
                <p className="text-xs text-gray-400 leading-relaxed">{selectedRole.description}</p>
              </div>

              {/* Multi-Hop Breakdown */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                  <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">Multi-Hop Traversal (3 Hops)</span>
                  <span className="text-[10px] font-mono text-emerald-400">⚡ {selectedRole.executionMs}ms in CognoDB</span>
                </div>

                {/* Required Skills */}
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400 mb-2">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Direct Core Requirements</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedRole.requiredSkills?.map((skill: any) => (
                      <button
                        key={skill.id}
                        onClick={() => onSelectSkillForInspection(skill.id)}
                        className="text-[11px] px-2.5 py-1 rounded-lg bg-indigo-950/60 text-indigo-200 border border-indigo-800/50 font-medium hover:bg-indigo-900 transition"
                      >
                        {skill.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Upstream Prerequisites (Hop 2) */}
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-400 mb-2">
                    <Layers className="w-3.5 h-3.5" />
                    <span>Upstream Prerequisites (Hop 2)</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedRole.upstreamPrerequisites?.map((prereq: any) => (
                      <button
                        key={prereq.id}
                        onClick={() => onSelectSkillForInspection(prereq.id)}
                        className="text-[11px] px-2.5 py-1 rounded-lg bg-purple-950/60 text-purple-200 border border-purple-800/50 font-medium hover:bg-purple-900 transition"
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
                    <span>Recommended Courses (Hop 3)</span>
                  </div>
                  <div className="space-y-2">
                    {selectedRole.recommendedCourses?.slice(0, 4).map((course: any) => (
                      <div key={course.id} className="p-2.5 rounded-lg bg-gray-900/90 border border-gray-800 hover:border-emerald-700/50 transition text-xs space-y-1">
                        <div className="flex items-start justify-between">
                          <a href={course.url} target="_blank" rel="noreferrer" className="font-bold text-white hover:text-emerald-400 flex items-center gap-1">
                            <span>{course.title}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                          <span className="text-[10px] text-gray-400 font-mono">{course.durationHours}h</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-gray-400">
                          <span className="px-1.5 py-0.5 rounded bg-gray-800 text-gray-300 font-medium">{course.provider}</span>
                          <span>Teaches: <strong className="text-indigo-300">{course.teachesSkill}</strong></span>
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

      {/* TAB CONTENT: SHORTEST PATH FINDER */}
      {activeTab === 'path' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-800/30 text-xs text-purple-200 leading-relaxed">
            <span className="font-bold text-purple-400">openCypher shortestPath():</span> Calculates the exact minimal learning sequence from any foundation skill to advanced concepts.
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">1. Starting Knowledge Base</label>
              <select
                value={startSkill}
                onChange={e => setStartSkill(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              >
                {skills.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.category})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">2. Target Goal Skill</label>
              <select
                value={endSkill}
                onChange={e => setEndSkill(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
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
              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/20 transition flex items-center justify-center gap-2 active:scale-95"
            >
              <Zap className="w-4 h-4" />
              <span>Calculate Learning Path</span>
            </button>
          </div>

          {pathResult && (
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs font-semibold text-gray-300 border-b border-gray-800 pb-2">
                <span>Learning Sequence</span>
                <span className="font-mono text-purple-400">
                  {pathResult.found ? `${pathResult.hops} hops • ${pathResult.executionMs}ms` : 'No Path'}
                </span>
              </div>
              <div className="space-y-2 relative before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gray-800">
                {pathResult.steps?.map((step: any, idx: number) => (
                  <div
                    key={step.id}
                    onClick={() => onSelectSkillForInspection(step.id)}
                    className="relative flex items-center gap-3 pl-1 text-xs cursor-pointer group"
                  >
                    <div className="w-6 h-6 rounded-full bg-purple-600 border-2 border-gray-900 text-white font-mono text-[10px] font-bold flex items-center justify-center shrink-0 z-10 group-hover:scale-110 transition">
                      {idx + 1}
                    </div>
                    <div className="flex-1 p-2 rounded-lg bg-gray-900/80 border border-gray-800 group-hover:border-purple-600 transition">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">{step.name}</span>
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

      {/* DOMAIN FILTER LEGEND */}
      <div className="p-3.5 border-t border-gray-800/80 bg-gray-950/40 shrink-0">
        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Filter Skill Domains</span>
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
