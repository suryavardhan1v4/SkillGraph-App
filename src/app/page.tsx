'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/Header';
import { ControlSidebar } from '@/components/ControlSidebar';
import { GraphCanvas } from '@/components/GraphCanvas';
import { NodeInspector } from '@/components/NodeInspector';
import { CypherBar } from '@/components/CypherBar';
import { SchemaModal } from '@/components/SchemaModal';

export default function HomePage() {
  const [dbHealth, setDbHealth] = useState<{ status: string; nodeCount?: number; relationshipCount?: number; latencyMs?: number; mode?: string }>({
    status: 'connecting',
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
  const [isSeeding, setIsSeeding] = useState(false);
  const [isSchemaModalOpen, setIsSchemaModalOpen] = useState(false);

  // 1. Fetch Health
  const fetchHealth = useCallback(async () => {
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      setDbHealth(data);
    } catch {
      setDbHealth({ status: 'offline' });
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
      } else {
        clearHighlights();
      }
    } catch (err) {
      console.error('Path error:', err);
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
  };

  const handleSeed = async () => {
    setIsSeeding(true);
    try {
      const res = await fetch('/api/seed', { method: 'POST' });
      if (res.ok) {
        await Promise.all([fetchHealth(), fetchGraphData(), fetchMetadata()]);
        alert('🎉 Graph successfully seeded in CognoDB Cloud!');
      } else {
        alert('Seeding failed. Check CognoDB credentials.');
      }
    } catch (e: any) {
      alert(`Error: ${e.message}`);
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden">
      <Header
        dbHealth={dbHealth}
        onSeed={handleSeed}
        onOpenModal={() => setIsSchemaModalOpen(true)}
        isSeeding={isSeeding}
      />

      <div className="flex-1 flex overflow-hidden relative">
        <ControlSidebar
          roles={roles}
          skills={skills}
          selectedRole={selectedRole}
          onSelectRole={handleSelectRole}
          onComputePath={handleComputePath}
          pathResult={pathResult}
          onSelectSkillForInspection={(id: string) => setInspectedSkillId(id)}
          selectedCategories={selectedCategories}
          onToggleCategory={handleToggleCategory}
        />

        <GraphCanvas
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
            onSelectSkill={(id: string) => setInspectedSkillId(id)}
            graphData={rawGraphData}
            onUpdateCypher={(cypher, latency) => {
              setCypherQuery(cypher);
              setCypherLatency(latency);
            }}
          />
        )}
      </div>

      <CypherBar cypher={cypherQuery} latencyMs={cypherLatency} />

      <SchemaModal isOpen={isSchemaModalOpen} onClose={() => setIsSchemaModalOpen(false)} />
    </div>
  );
}
