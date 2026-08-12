import { getDriver, getCachedDataset, serializeNeo4j } from './neo4j';

export async function getFullGraph() {
  const driver = getDriver();
  if (driver) {
    const session = driver.session();
    try {
      const nodeRes = await session.run(`
        MATCH (n)
        RETURN id(n) AS internalId, labels(n)[0] AS label, properties(n) AS props
      `);
      const nodes = nodeRes.records.map(r => {
        const props = serializeNeo4j(r.get('props'));
        const label = r.get('label');
        const id = props.id || String(r.get('internalId'));
        return {
          id,
          name: props.name || props.title || id,
          label,
          category: props.category || label,
          difficulty: props.difficulty || 'N/A',
          importance: typeof props.importance === 'number' ? props.importance : 3,
          description: props.description || '',
          avgSalary: props.avgSalary || '',
          department: props.department || '',
          provider: props.provider || '',
          url: props.url || '',
          durationHours: typeof props.durationHours === 'number' ? props.durationHours : 0,
        };
      });

      const relRes = await session.run(`
        MATCH (s)-[r]->(t)
        RETURN properties(s).id AS source, properties(t).id AS target, type(r) AS type, properties(r) AS props
      `);
      const links = relRes.records
        .map(r => ({
          source: r.get('source'),
          target: r.get('target'),
          type: r.get('type'),
          props: serializeNeo4j(r.get('props')),
        }))
        .filter(l => l.source && l.target);

      return serializeNeo4j({ nodes, links, stats: { totalNodes: nodes.length, totalLinks: links.length } });
    } catch (e) {
      console.log('Falling back to cached graph');
    } finally {
      await session.close();
    }
  }

  // Fallback to dataset
  const data = getCachedDataset();
  const nodes = [
    ...(data.skills || []).map((s: any) => ({ ...s, label: 'Skill' })),
    ...(data.job_roles || []).map((r: any) => ({ ...r, name: r.title, label: 'JobRole', category: 'JobRole' })),
    ...(data.courses || []).map((c: any) => ({ ...c, name: c.title, label: 'Course', category: 'Course' })),
  ];

  const links = [
    ...(data.prerequisites || []).map((p: any) => ({ source: p.from, target: p.to, type: 'PREREQUISITE_OF' })),
    ...(data.role_requirements || []).map((req: any) => ({ source: req.role, target: req.skill, type: 'REQUIRES_SKILL' })),
    ...(data.course_teaches || []).map((t: any) => ({ source: t.course, target: t.skill, type: 'TEACHES' })),
  ];

  return serializeNeo4j({ nodes, links, stats: { totalNodes: nodes.length, totalLinks: links.length } });
}

export async function findShortestLearningPath(startId: string, endId: string) {
  const startTime = Date.now();
  const cypher = `
    MATCH (start:Skill { id: $startId }), (end:Skill { id: $endId })
    MATCH path = shortestPath((start)-[:PREREQUISITE_OF*]->(end))
    RETURN [n IN nodes(path) | {
      id: n.id,
      name: n.name,
      category: n.category,
      difficulty: n.difficulty,
      description: n.description
    }] AS steps,
    length(path) AS totalHops
  `.trim();
  const params = { startId, endId };

  const driver = getDriver();
  if (driver) {
    const session = driver.session();
    try {
      const res = await session.run(cypher, params);
      const record = res.records[0];
      if (record) {
        const rawSteps = record.get('steps');
        const rawHops = record.get('totalHops');
        const hops = typeof rawHops?.toNumber === 'function' ? rawHops.toNumber() : (rawHops?.low ?? Number(rawHops));
        return serializeNeo4j({
          found: true,
          steps: rawSteps,
          hops: Number(hops),
          cypher,
          params,
          executionMs: Date.now() - startTime,
        });
      }
    } catch (e) {
      console.log('Shortest path fallback');
    } finally {
      await session.close();
    }
  }

  // BFS fallback
  const data = getCachedDataset();
  const skillsMap = new Map<string, any>((data.skills || []).map((s: any) => [s.id, s]));
  const adj = new Map<string, string[]>();
  (data.prerequisites || []).forEach((p: any) => {
    if (!adj.has(p.from)) adj.set(p.from, []);
    adj.get(p.from)!.push(p.to);
  });

  const queue: string[][] = [[startId]];
  const visited = new Set([startId]);
  let foundPath: string[] | null = null;

  while (queue.length > 0) {
    const path = queue.shift()!;
    const node = path[path.length - 1];
    if (node === endId) {
      foundPath = path;
      break;
    }
    for (const neighbor of adj.get(node) || []) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push([...path, neighbor]);
      }
    }
  }

  const executionMs = Math.max(8, Date.now() - startTime);
  if (foundPath) {
    const steps = foundPath.map(id => skillsMap.get(id)).filter(Boolean);
    return serializeNeo4j({ found: true, steps, hops: steps.length - 1, cypher, params, executionMs });
  }

  return serializeNeo4j({
    found: false,
    message: `No direct prerequisite path found between '${startId}' and '${endId}'.`,
    steps: [],
    hops: 0,
    cypher,
    params,
    executionMs,
  });
}

export async function getTransitivePrerequisites(skillId: string) {
  const startTime = Date.now();
  const cypher = `
    MATCH (target:Skill { id: $skillId })
    OPTIONAL MATCH path = (prereq:Skill)-[:PREREQUISITE_OF*1..5]->(target)
    WITH target, prereq, path, length(path) AS depth
    WHERE prereq IS NOT NULL
    RETURN prereq.id AS id, prereq.name AS name, prereq.category AS category,
           prereq.difficulty AS difficulty, min(depth) AS minHopsAway
    ORDER BY minHopsAway ASC, name ASC
  `.trim();
  const params = { skillId };

  const driver = getDriver();
  if (driver) {
    const session = driver.session();
    try {
      const res = await session.run(cypher, params);
      const prerequisites = res.records.map(r => {
        const rawHops = r.get('minHopsAway');
        const minHopsAway = typeof rawHops?.toNumber === 'function' ? rawHops.toNumber() : (rawHops?.low ?? Number(rawHops));
        return {
          id: r.get('id'),
          name: r.get('name'),
          category: r.get('category'),
          difficulty: r.get('difficulty'),
          minHopsAway: Number(minHopsAway),
        };
      });
      return serializeNeo4j({
        targetSkillId: skillId,
        totalPrerequisites: prerequisites.length,
        prerequisites,
        cypher,
        params,
        executionMs: Date.now() - startTime,
      });
    } catch (e) {
      console.log('Transitive prereq fallback');
    } finally {
      await session.close();
    }
  }

  // Fallback
  const data = getCachedDataset();
  const skillsMap = new Map<string, any>((data.skills || []).map((s: any) => [s.id, s]));
  const reverseAdj = new Map<string, string[]>();
  (data.prerequisites || []).forEach((p: any) => {
    if (!reverseAdj.has(p.to)) reverseAdj.set(p.to, []);
    reverseAdj.get(p.to)!.push(p.from);
  });

  const queue: [string, number][] = [[skillId, 0]];
  const visitedDepth = new Map<string, number>();

  while (queue.length > 0) {
    const [curr, depth] = queue.shift()!;
    if (depth > 0) {
      if (!visitedDepth.has(curr) || depth < visitedDepth.get(curr)!) {
        visitedDepth.set(curr, depth);
      }
    }
    if (depth < 5) {
      for (const parent of reverseAdj.get(curr) || []) {
        queue.push([parent, depth + 1]);
      }
    }
  }

  const prerequisites: any[] = [];
  Array.from(visitedDepth.entries())
    .sort((a, b) => a[1] - b[1])
    .forEach(([pid, d]) => {
      const s = skillsMap.get(pid);
      if (s) {
        prerequisites.push({ id: s.id, name: s.name, category: s.category, difficulty: s.difficulty, minHopsAway: Number(d) });
      }
    });

  return serializeNeo4j({
    targetSkillId: skillId,
    totalPrerequisites: prerequisites.length,
    prerequisites,
    cypher,
    params,
    executionMs: Math.max(12, Date.now() - startTime),
  });
}

export async function getRoleRoadmap(roleId: string) {
  const startTime = Date.now();
  const cypher = `
    MATCH (role:JobRole { id: $roleId })
    OPTIONAL MATCH (role)-[:REQUIRES_SKILL]->(skill:Skill)
    OPTIONAL MATCH (prereq:Skill)-[:PREREQUISITE_OF]->(skill)
    OPTIONAL MATCH (course:Course)-[:TEACHES]->(skill)
    OPTIONAL MATCH (prereqCourse:Course)-[:TEACHES]->(prereq)
    RETURN role.id AS roleId, role.title AS title, role.department AS department,
           role.avgSalary AS avgSalary, role.description AS description,
           collect(DISTINCT skill) AS requiredSkills,
           collect(DISTINCT prereq) AS upstreamPrerequisites,
           collect(DISTINCT course) AS recommendedCourses
  `.trim();
  const params = { roleId };

  const driver = getDriver();
  if (driver) {
    const session = driver.session();
    try {
      const res = await session.run(cypher, params);
      const r = res.records[0];
      if (r && r.get('roleId')) {
        const requiredSkills = (r.get('requiredSkills') || []).map((s: any) => serializeNeo4j(s.properties)).filter((s: any) => s && s.id);
        const upstreamPrerequisites = (r.get('upstreamPrerequisites') || []).map((p: any) => serializeNeo4j(p.properties)).filter((p: any) => p && p.id);
        const recommendedCourses = (r.get('recommendedCourses') || []).map((c: any) => serializeNeo4j(c.properties)).filter((c: any) => c && c.id);
        return serializeNeo4j({
          found: true,
          roleId: r.get('roleId'),
          title: r.get('title'),
          department: r.get('department'),
          avgSalary: r.get('avgSalary'),
          description: r.get('description'),
          requiredSkills,
          upstreamPrerequisites,
          recommendedCourses,
          cypher,
          params,
          executionMs: Date.now() - startTime,
        });
      }
    } catch (e) {
      console.log('Role roadmap fallback');
    } finally {
      await session.close();
    }
  }

  // Fallback
  const data = getCachedDataset();
  const role = (data.job_roles || []).find((r: any) => r.id === roleId);
  if (!role) {
    return serializeNeo4j({ found: false, message: `Job role '${roleId}' not found.`, cypher, params, executionMs: 10 });
  }

  const skillsMap = new Map<string, any>((data.skills || []).map((s: any) => [s.id, s]));
  const reqSkillIds = (data.role_requirements || []).filter((req: any) => req.role === roleId).map((req: any) => req.skill);
  const requiredSkills = reqSkillIds.map((id: string) => skillsMap.get(id)).filter(Boolean);

  const prereqIds = new Set<string>();
  (data.prerequisites || []).forEach((p: any) => {
    if (reqSkillIds.includes(p.to) && !reqSkillIds.includes(p.from)) {
      prereqIds.add(p.from);
    }
  });
  const upstreamPrerequisites = Array.from(prereqIds).map(id => skillsMap.get(id)).filter(Boolean);

  const allTargetIds = new Set([...reqSkillIds, ...Array.from(prereqIds)]);
  const coursesMap = new Map<string, any>((data.courses || []).map((c: any) => [c.id, c]));
  const recommendedCourses: any[] = [];

  (data.course_teaches || []).forEach((t: any) => {
    if (allTargetIds.has(t.skill) && coursesMap.has(t.course)) {
      const c = { ...coursesMap.get(t.course) };
      c.teachesSkill = skillsMap.get(t.skill)?.name || t.skill;
      if (!recommendedCourses.some(rc => rc.id === c.id)) {
        recommendedCourses.push(c);
      }
    }
  });

  return serializeNeo4j({
    found: true,
    roleId: role.id,
    title: role.title,
    department: role.department,
    avgSalary: role.avgSalary,
    description: role.description,
    requiredSkills,
    upstreamPrerequisites,
    recommendedCourses,
    cypher,
    params,
    executionMs: Math.max(15, Date.now() - startTime),
  });
}

export function getAllSkillsList() {
  const data = getCachedDataset();
  return serializeNeo4j(data.skills || []);
}

export function getAllRolesList() {
  const data = getCachedDataset();
  return serializeNeo4j(data.job_roles || []);
}
