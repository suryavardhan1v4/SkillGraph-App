'use client';

import React, { useEffect, useState } from 'react';
import { X, Layers, ExternalLink, GraduationCap, ChevronRight, Zap } from 'lucide-react';

interface NodeInspectorProps {
  skillId: string;
  onClose: () => void;
  onSelectSkill: (skillId: string) => void;
  graphData: { nodes: any[]; links: any[] };
  onUpdateCypher?: (cypher: string, latency: number) => void;
}

export const NodeInspector: React.FC<NodeInspectorProps> = ({
  skillId,
  onClose,
  onSelectSkill,
  graphData,
  onUpdateCypher,
}) => {
  const [prereqData, setPrereqData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const skill = graphData.nodes.find(n => n.id === skillId) || {
    id: skillId,
    name: skillId,
    category: 'Skill',
    difficulty: 'Intermediate',
    description: 'Technical competence node in the skill graph.',
    importance: 4,
  };

  useEffect(() => {
    async function fetchPrerequisites() {
      setLoading(true);
      try {
        const res = await fetch(`/api/prerequisites/${skillId}`);
        const data = await res.json();
        setPrereqData(data);
        if (onUpdateCypher && data.cypher) {
          onUpdateCypher(data.cypher, data.executionMs || 15);
        }
      } catch (err) {
        console.error('Prereq error:', err);
      } finally {
        setLoading(false);
      }
    }

    if (skillId) {
      fetchPrerequisites();
    }
  }, [skillId, onUpdateCypher]);

  // Find incoming (what unlocks this skill)
  const incoming = graphData.links.filter(l => {
    const targetId = typeof l.target === 'object' ? l.target.id : l.target;
    return targetId === skillId && l.type === 'PREREQUISITE_OF';
  });

  // Find outgoing (what this skill unlocks)
  const outgoing = graphData.links.filter(l => {
    const sourceId = typeof l.source === 'object' ? l.source.id : l.source;
    return sourceId === skillId && l.type === 'PREREQUISITE_OF';
  });

  // Find teaching courses
  const courses = graphData.links
    .filter(l => {
      const targetId = typeof l.target === 'object' ? l.target.id : l.target;
      return targetId === skillId && l.type === 'TEACHES';
    })
    .map(l => {
      const sourceId = typeof l.source === 'object' ? l.source.id : l.source;
      return graphData.nodes.find(n => n.id === sourceId);
    })
    .filter(Boolean);

  return (
    <aside className="w-84 md:w-96 bg-white border-l border-slate-200 flex flex-col z-20 shrink-0 shadow-xl">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
            {skill.category}
          </span>
          <h2 className="text-base font-extrabold text-slate-900 mt-1 leading-tight">{skill.name}</h2>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-xl hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Skill Card */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
              {skill.difficulty}
            </span>
            <span className="text-[11px] text-amber-500 font-bold">
              {'★'.repeat(Number(skill.importance?.low ?? skill.importance) || 4) +
                '☆'.repeat(5 - (Number(skill.importance?.low ?? skill.importance) || 4))}
            </span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">{skill.description}</p>
        </div>

        {/* Transitive Tree (Variable Depth openCypher) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-indigo-600" />
              <span>Full Dependency Tree (*1..5 Hops)</span>
            </span>
            <span className="text-[10px] font-mono text-emerald-700 font-bold">
              {prereqData ? `⚡ ${prereqData.executionMs}ms` : ''}
            </span>
          </div>

          {loading ? (
            <div className="py-4 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
              <span className="w-3 h-3 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></span>
              <span>Evaluating Cypher transitive closure...</span>
            </div>
          ) : prereqData && prereqData.prerequisites?.length > 0 ? (
            <div className="space-y-1.5">
              {prereqData.prerequisites.map((p: any) => (
                <div
                  key={p.id}
                  onClick={() => onSelectSkill(p.id)}
                  className="p-2 rounded-xl bg-slate-50 border border-slate-200 hover:border-indigo-400 flex items-center justify-between text-xs cursor-pointer transition shadow-sm"
                >
                  <div>
                    <span className="font-semibold text-slate-800 hover:text-indigo-600 block">{p.name}</span>
                    <span className="text-[10px] text-slate-500">{p.category}</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {p.minHopsAway} Hop{p.minHopsAway > 1 ? 's' : ''} Away
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic p-2 bg-slate-50 rounded-xl border border-slate-200">
              No prerequisite dependencies — this is a root foundational technology.
            </p>
          )}
        </div>

        {/* Immediate Unlocks (Outgoing) */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
            <ChevronRight className="w-3.5 h-3.5 text-purple-600" />
            <span>Immediately Unlocks Downstream ({outgoing.length})</span>
          </span>
          <div className="flex flex-wrap gap-1.5">
            {outgoing.length > 0 ? (
              outgoing.map((l: any, idx: number) => {
                const targetId = typeof l.target === 'object' ? l.target.id : l.target;
                const node = graphData.nodes.find(n => n.id === targetId);
                return (
                  <button
                    key={idx}
                    onClick={() => onSelectSkill(targetId)}
                    className="text-[11px] px-2.5 py-1 rounded-xl bg-purple-50 text-purple-800 border border-purple-200 font-semibold hover:bg-purple-100 transition shadow-sm"
                  >
                    {node?.name || targetId}
                  </button>
                );
              })
            ) : (
              <span className="text-xs text-slate-500 italic">No downstream unlocks recorded.</span>
            )}
          </div>
        </div>

        {/* Curated Courses */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
            <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
            <span>Accredited Courses ({courses.length})</span>
          </span>
          <div className="space-y-2">
            {courses.length > 0 ? (
              courses.map((course: any, idx: number) => (
                <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1 shadow-sm">
                  <a
                    href={course.url}
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-slate-900 hover:text-emerald-700 flex items-center gap-1 leading-snug"
                  >
                    <span>{course.name}</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-medium">{course.provider}</span>
                    <span>{Number(course.durationHours?.low ?? course.durationHours) || 0}h duration</span>
                  </div>
                </div>
              ))
            ) : (
              <span className="text-xs text-slate-500 italic">Self-study & documentation recommended.</span>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};
