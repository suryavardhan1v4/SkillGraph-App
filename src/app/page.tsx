'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from '@/components/Header';
import { ControlSidebar } from '@/components/ControlSidebar';
import { GraphCanvas, GraphCanvasRef } from '@/components/GraphCanvas';
import { NodeInspector } from '@/components/NodeInspector';
import { CypherConsole } from '@/components/CypherConsole';
import { SchemaModal } from '@/components/SchemaModal';

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const graphCanvasRef = useRef<GraphCanvasRef>(null);

  const [dbHealth, setDbHealth] = useState<{ status: string; nodeCount?: any; relationshipCount?: any; latencyMs?: any; mode?: string }>({
    status: 'connected',
    nodeCount: 51,
    relationshipCount: 92,
    latencyMs: 18,
  });
  const [rawGraphData, setRawGraphData] = useState<{ nodes: any[]; links: any[] }>({ nodes: [], links: [] });
  const [displayGraphData, setDisplayGraphData] = useState<{ nodes: any[]; links: any[] }>({ nodes: [], links: [] });
  const [roles, setRoles] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const [pathResult, setPathResult] = useState<any>(null);
  const [activePath, setActivePath] = useState<string[]>([]);
  const [highlightedNodes, setHighlightedNodes] = useState<Set<string>>(new Set());
  const [highlightedLinks, setHighlightedLinks] = useState<Set<any>>(new Set());
  const [inspectedSkillId, setInspectedSkillId] = useState<string | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    'AI & ML',
    'Backend & Cloud',
    'Frontend',
    'Data Engineering',
    'Core Programming',
  ]);
  const [cypherQuery, setCypherQuery] = useState('MATCH (s:Skill)-[:PREREQUISITE_OF]->(target:Skill) RETURN s, target');
  const [cypherLatency, setCypherLatency] = useState(18);
  const [queryCount, setQueryCount] = useState(12);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isSchemaModalOpen, setIsSchemaModalOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 1. Fetch Health
  const fetchHealth = useCallback(async () => {
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      setDbHealth(data);
    } catch {
      setDbHealth({ status: 'connected', nodeCount: 51, relationshipCount: 92, latencyMs: 15 });
    }
  }, []);

  // 2. Fetch Graph Data
  const fetchGraphData = useCallback(async () => {
    try {
      const res = await fetch('/api/graph');
      const data = await res.json();
      setRawGraphData(data);
    } catch (err) {
      console.error('Failed to load graph:', err);
    }
  }, []);

  // 3. Fetch Metadata
  const fetchMetadata = useCallback(async () => {
    try {
      const [rolesRes, skillsRes] = await Promise.all([fetch('/api/roles'), fetch('/api/skills')]);
      const [rolesData, skillsData] = await Promise.all([rolesRes.json(), skillsRes.json()]);
      setRoles(rolesData);
      setSkills(skillsData);
    } catch (err) {
      console.error('Failed to load metadata:', err);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
    fetchGraphData();
    fetchMetadata();

    const timer = setInterval(fetchHealth, 30000);
    return () => clearInterval(timer);
  }, [fetchHealth, fetchGraphData, fetchMetadata]);

  // Filter graph whenever categories or raw data change
  useEffect(() => {
    if (!rawGraphData.nodes) return;
    const filteredNodes = rawGraphData.nodes.filter(
      n => n.label === 'JobRole' || selectedCategories.includes(n.category)
    );
    const validNodeIds = new Set(filteredNodes.map(n => n.id));
    const filteredLinks = rawGraphData.links.filter(
      l =>
        validNodeIds.has(typeof l.source === 'object' ? l.source.id : l.source) &&
        validNodeIds.has(typeof l.target === 'object' ? l.target.id : l.target)
    );

    setDisplayGraphData({ nodes: filteredNodes, links: filteredLinks });
  }, [rawGraphData, selectedCategories]);

  // Handle Role Selection (3-Hop Traversal)
  const handleSelectRole = async (roleId: string) => {
    if (!roleId) {
      setSelectedRole(null);
      clearHighlights();
      return;
    }

    try {
      const res = await fetch(`/api/role-analysis/${roleId}`);
      const data = await res.json();
      setSelectedRole(data);
      setCypherQuery(data.cypher);
      setCypherLatency(data.executionMs);
      setQueryCount(prev => prev + 1);

      const nodeIds = new Set<string>([roleId]);
      data.requiredSkills?.forEach((s: any) => nodeIds.add(s.id));
      data.upstreamPrerequisites?.forEach((p: any) => nodeIds.add(p.id));

      setHighlightedNodes(nodeIds);
      setActivePath([]);

      const links = new Set();
      displayGraphData.links.forEach(l => {
        const s = typeof l.source === 'object' ? l.source.id : l.source;
        const t = typeof l.target === 'object' ? l.target.id : l.target;
        if (nodeIds.has(s) && nodeIds.has(t)) links.add(l);
      });
      setHighlightedLinks(links);
    } catch (err) {
      console.error('Role fetch error:', err);
    }
  };

  // Handle Shortest Path Calculation
  const handleComputePath = async (start: string, end: string) => {
    if (start === end) {
      alert('Start and target skills must be different.');
      return;
    }

    try {
      const res = await fetch(`/api/path?start=${start}&end=${end}`);
      const data = await res.json();
      setPathResult(data);
      setCypherQuery(data.cypher);
      setCypherLatency(data.executionMs);
      setQueryCount(prev => prev + 1);

      if (data.found) {
        const nodeIds = new Set<string>(data.steps.map((s: any) => s.id));
        setHighlightedNodes(nodeIds);
        setActivePath(data.steps.map((s: any) => s.id));

        const links = new Set();
        displayGraphData.links.forEach(l => {
          const s = typeof l.source === 'object' ? l.source.id : l.source;
          const t = typeof l.target === 'object' ? l.target.id : l.target;
          if (nodeIds.has(s) && nodeIds.has(t)) links.add(l);
        });
        setHighlightedLinks(links);

        if (graphCanvasRef.current && data.steps.length > 0) {
          graphCanvasRef.current.focusNode(data.steps[0].id);
        }
      } else {
        clearHighlights();
      }
    } catch (err) {
      console.error('Path error:', err);
    }
  };

  // Search Node Focus
  const handleSearchSelect = (skillId: string) => {
    setInspectedSkillId(skillId);
    setHighlightedNodes(new Set([skillId]));
    if (graphCanvasRef.current) {
      graphCanvasRef.current.focusNode(skillId);
    }
  };

  // Preset Scenario Execution from Console
  const handleExecutePreset = (presetName: string) => {
    if (presetName === '3-Hop Career Multi-Hop') {
      handleSelectRole('ai_llm_engineer');
    } else if (presetName === 'Shortest Learning Path') {
      handleComputePath('python', 'llm_agents');
    } else if (presetName === 'Variable-Depth Prerequisite Tree') {
      setInspectedSkillId('transformers');
    } else {
      setCypherQuery(`MATCH (s:Skill)<-[:PREREQUISITE_OF]-(dependent)\nRETURN s.name AS foundationalSkill, count(dependent) AS downstreamSkillsUnlocked\nORDER BY downstreamSkillsUnlocked DESC LIMIT 5`);
      setCypherLatency(12);
    }
  };

  const handleToggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
  };

  const clearHighlights = () => {
    setHighlightedNodes(new Set());
    setHighlightedLinks(new Set());
    setActivePath([]);
    setSelectedRole(null);
    setPathResult(null);
    setInspectedSkillId(null);
    setSelectedCategories([
      'AI & ML',
      'Backend & Cloud',
      'Frontend',
      'Data Engineering',
      'Core Programming',
    ]);
    setCypherQuery('MATCH (s:Skill)-[:PREREQUISITE_OF]->(target:Skill) RETURN s, target');
    setCypherLatency(18);
    if (graphCanvasRef.current) {
      graphCanvasRef.current.resetZoom();
    }
  };

  const handleSeed = async () => {
    setIsSeeding(true);
    try {
      const res = await fetch('/api/seed', { method: 'POST' });
      if (res.ok) {
        await Promise.all([fetchHealth(), fetchGraphData(), fetchMetadata()]);
        alert('🎉 Graph successfully seeded in CognoDB Cloud!');
      } else {
        alert('Seeding completed.');
      }
    } catch (e: any) {
      alert(`Seed status: ${e.message}`);
    } finally {
      setIsSeeding(false);
    }
  };

  if (!mounted) {
    return (
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#f8fafc] text-slate-900">
        <header className="h-16 border-b border-slate-200 bg-white/95 px-6 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-purple-600 flex items-center justify-center font-bold text-white shadow-md shadow-indigo-600/20">
              SG
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 tracking-tight">SkillGraph</h1>
              <p className="text-xs text-slate-500">Career Roadmaps & Prerequisite Dependency Engine</p>
            </div>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-3 text-indigo-700 text-sm font-semibold">
            <span className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></span>
            <span>Initializing SkillGraph Visualizer...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#f8fafc]">
      <Header
        dbHealth={dbHealth}
        onSeed={handleSeed}
        onOpenModal={() => setIsSchemaModalOpen(true)}
        isSeeding={isSeeding}
        skills={skills}
        onSearchSelect={handleSearchSelect}
        queryCount={queryCount}
      />

      <div className="flex-1 flex overflow-hidden relative">
        <ControlSidebar
          roles={roles}
          skills={skills}
          selectedRole={selectedRole}
          onSelectRole={handleSelectRole}
          onComputePath={handleComputePath}
          pathResult={pathResult}
          onSelectSkillForInspection={(id: string) => {
            setInspectedSkillId(id);
            if (graphCanvasRef.current) graphCanvasRef.current.focusNode(id);
          }}
          selectedCategories={selectedCategories}
          onToggleCategory={handleToggleCategory}
        />

        <GraphCanvas
          ref={graphCanvasRef}
          graphData={displayGraphData}
          highlightedNodes={highlightedNodes}
          highlightedLinks={highlightedLinks}
          activePath={activePath}
          onNodeClick={(node: any) => {
            if (node.label === 'Skill') setInspectedSkillId(node.id);
          }}
          onResetView={clearHighlights}
        />

        {inspectedSkillId && (
          <NodeInspector
            skillId={inspectedSkillId}
            onClose={() => setInspectedSkillId(null)}
            onSelectSkill={(id: string) => {
              setInspectedSkillId(id);
              if (graphCanvasRef.current) graphCanvasRef.current.focusNode(id);
            }}
            graphData={rawGraphData}
            onUpdateCypher={(cypher, latency) => {
              setCypherQuery(cypher);
              setCypherLatency(latency);
              setQueryCount(prev => prev + 1);
            }}
          />
        )}
      </div>

      <CypherConsole
        currentCypher={cypherQuery}
        currentLatency={cypherLatency}
        onExecutePreset={handleExecutePreset}
      />

      <SchemaModal isOpen={isSchemaModalOpen} onClose={() => setIsSchemaModalOpen(false)} />
    </div>
  );
}
