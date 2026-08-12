'use client';

import React, { useEffect, useState } from 'react';
import { X, CornerLeftDown, Unlock, BookOpen } from 'lucide-react';

interface NodeInspectorProps {
  skillId: string | null;
  onClose: () => void;
  onSelectSkill: (skillId: string) => void;
  graphData: { nodes: any[]; links: any[] };
  onUpdateCypher: (cypher: string, latency: number) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  'AI & ML': '#a855f7',
  'Core Programming': '#6366f1',
  'Backend & Cloud': '#06b6d4',
  'Frontend': '#10b981',
  'Data Engineering': '#f43f5e',
  'JobRole': '#f59e0b',
  'Course': '#3b82f6',
};

export const NodeInspector: React.FC<NodeInspectorProps> = ({
  skillId,
  onClose,
  onSelectSkill,
  graphData,
  onUpdateCypher,
}) => {
  const [prereqData, setPrereqData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const skill = graphData.nodes.find(n => n.id === skillId);

  useEffect(() => {
    if (!skillId) return;

    let isMounted = true;
    setIsLoading(true);

    fetch(`/api/prerequisites/${skillId}`)
      .then(res => res.json())
      .then(data => {
        if (isMounted) {
          setPrereqData(data);
          onUpdateCypher(data.cypher, data.executionMs);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [skillId]);

  if (!skillId || !skill) return null;

  const outgoingLinks = graphData.links.filter(
    l => (typeof l.source === 'object' ? l.source.id : l.source) === skillId && l.type === 'PREREQUISITE_OF'
  );

  const courseLinks = graphData.links.filter(
    l => (typeof l.target === 'object' ? l.target.id : l.target) === skillId && l.type === 'TEACHES'
  );

  return (
    <aside className="w-80 bg-[#0E1424]/95 border-l border-gray-800/80 flex flex-col z-20 shrink-0 backdrop-blur-sm shadow-2xl absolute right-0 top-0 bottom-0">
      <div className="p-4 border-b border-gray-800/80 flex items-center justify-between bg-gray-950/40">
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: CATEGORY_COLORS[skill.category] || '#6366f1' }}
          ></span>
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Skill Details</span>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div>
          <h2 className="text-base font-bold text-white mb-1">{skill.name}</h2>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-gray-800 text-gray-300 border border-gray-700">
              {skill.difficulty}
            </span>
            <span className="text-[11px] text-amber-400">
              {'★'.repeat(skill.importance || 4) + '☆'.repeat(5 - (skill.importance || 4))}
            </span>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">{skill.description}</p>
        </div>

        {/* Incoming Prerequisites (Transitive Tree) */}
        <div className="pt-2 border-t border-gray-800/80">
          <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <CornerLeftDown className="w-3.5 h-3.5 text-indigo-400" />
            <span>Must Learn First (Prerequisites)</span>
          </h3>
          <div className="space-y-1.5">
            {isLoading ? (
              <span className="text-xs text-gray-500">Querying CognoDB...</span>
            ) : prereqData?.prerequisites?.length > 0 ? (
              prereqData.prerequisites.map((p: any) => (
                <button
                  key={p.id}
                  onClick={() => onSelectSkill(p.id)}
                  className="w-full flex items-center justify-between p-2 rounded-lg bg-gray-900 border border-gray-800 text-xs hover:border-indigo-600 transition"
                >
                  <span className="font-medium text-gray-200">{p.name}</span>
                  <span className="text-[10px] font-mono text-indigo-400 bg-indigo-950/60 px-1.5 py-0.5 rounded">
                    {p.minHopsAway} hop{p.minHopsAway > 1 ? 's' : ''} away
                  </span>
                </button>
              ))
            ) : (
              <span className="text-[11px] text-gray-500 italic">No prior prerequisites needed (Foundational Skill).</span>
            )}
          </div>
        </div>

        {/* Outgoing Skills Unlocked */}
        <div className="pt-2 border-t border-gray-800/80">
          <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Unlock className="w-3.5 h-3.5 text-purple-400" />
            <span>Unlocks Next</span>
          </h3>
          <div className="space-y-1.5">
            {outgoingLinks.length > 0 ? (
              outgoingLinks.map((l: any) => {
                const targetId = typeof l.target === 'object' ? l.target.id : l.target;
                const targetNode = graphData.nodes.find(n => n.id === targetId);
                if (!targetNode) return null;
                return (
                  <button
                    key={targetId}
                    onClick={() => onSelectSkill(targetId)}
                    className="w-full p-1.5 rounded-lg bg-gray-900 border border-gray-800 text-xs hover:border-purple-600 transition flex items-center justify-between"
                  >
                    <span className="text-gray-200 font-medium">{targetNode.name}</span>
                    <span className="text-[10px] text-purple-400">{targetNode.difficulty}</span>
                  </button>
                );
              })
            ) : (
              <span className="text-[11px] text-gray-500 italic">No advanced skills depend directly on this.</span>
            )}
          </div>
        </div>

        {/* Associated Courses */}
        <div className="pt-2 border-t border-gray-800/80">
          <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
            <span>Courses & Certifications</span>
          </h3>
          <div className="space-y-2">
            {courseLinks.length > 0 ? (
              courseLinks.map((l: any) => {
                const courseId = typeof l.source === 'object' ? l.source.id : l.source;
                const course = graphData.nodes.find(n => n.id === courseId);
                if (!course) return null;
                return (
                  <div key={courseId} className="p-2 rounded-lg bg-gray-900/90 border border-gray-800 text-xs space-y-1">
                    <a href={course.url} target="_blank" rel="noreferrer" className="font-bold text-white hover:text-emerald-400 block">
                      {course.name}
                    </a>
                    <div className="flex items-center justify-between text-[10px] text-gray-400">
                      <span>{course.provider}</span>
                      <span>{course.durationHours}h</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <span className="text-[11px] text-gray-500 italic">No direct courses listed in catalog.</span>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};
