import { NextResponse } from 'next/server';
import { getDriver, getCachedDataset, checkConnection } from '@/lib/neo4j';

export async function POST() {
  const driver = getDriver();
  if (!driver) {
    return NextResponse.json({ error: 'Database driver not configured' }, { status: 500 });
  }

  const session = driver.session();
  try {
    const data = getCachedDataset();

    // 1. Clear old graph
    await session.run('MATCH (n) DETACH DELETE n');

    // 2. Ingest Skills
    await session.run(
      `UNWIND $skills AS s
       CREATE (skill:Skill {
         id: s.id, name: s.name, category: s.category,
         difficulty: s.difficulty, importance: s.importance, description: s.description
       })`,
      { skills: data.skills }
    );

    // 3. Ingest Roles
    await session.run(
      `UNWIND $roles AS r
       CREATE (role:JobRole {
         id: r.id, title: r.title, department: r.department,
         avgSalary: r.avgSalary, description: r.description
       })`,
      { roles: data.job_roles }
    );

    // 4. Ingest Courses
    await session.run(
      `UNWIND $courses AS c
       CREATE (course:Course {
         id: c.id, title: c.title, provider: c.provider,
         url: c.url, durationHours: c.durationHours
       })`,
      { courses: data.courses }
    );

    // 5. Ingest Prerequisites
    await session.run(
      `UNWIND $prereqs AS p
       MATCH (fromSkill:Skill { id: p.from }), (toSkill:Skill { id: p.to })
       MERGE (fromSkill)-[:PREREQUISITE_OF]->(toSkill)`,
      { prereqs: data.prerequisites }
    );

    // 6. Ingest Role Requirements
    await session.run(
      `UNWIND $reqs AS req
       MATCH (role:JobRole { id: req.role }), (skill:Skill { id: req.skill })
       MERGE (role)-[:REQUIRES_SKILL]->(skill)`,
      { reqs: data.role_requirements }
    );

    // 7. Ingest Course Teaches
    await session.run(
      `UNWIND $teaches AS t
       MATCH (course:Course { id: t.course }), (skill:Skill { id: t.skill })
       MERGE (course)-[:TEACHES]->(skill)`,
      { teaches: data.course_teaches }
    );

    const health = await checkConnection();
    return NextResponse.json({ status: 'success', message: 'Graph seeded in CognoDB', stats: health });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  } finally {
    await session.close();
  }
}
