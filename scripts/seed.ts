import neo4j from 'neo4j-driver';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.COGNODB_URI || 'bolt+s://db-b7f0532c.databases.cognodb.com:7687';
const user = process.env.COGNODB_USER || 'cognodb';
const password = process.env.COGNODB_PASSWORD || '97c955d5a2f3a93650dce2aaa7240a86';

async function seed() {
  console.log(`Connecting to CognoDB Cloud at ${uri}...`);
  const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
  const session = driver.session();

  try {
    const rawData = fs.readFileSync(path.join(__dirname, '../data/dataset.json'), 'utf-8');
    const data = JSON.parse(rawData);

    console.log('Clearing old graph...');
    await session.run('MATCH (n) DETACH DELETE n');

    console.log(`Inserting ${data.skills.length} (:Skill) nodes...`);
    await session.run(
      `UNWIND $skills AS s
       CREATE (skill:Skill {
         id: s.id, name: s.name, category: s.category,
         difficulty: s.difficulty, importance: s.importance, description: s.description
       })`,
      { skills: data.skills }
    );

    console.log(`Inserting ${data.job_roles.length} (:JobRole) nodes...`);
    await session.run(
      `UNWIND $roles AS r
       CREATE (role:JobRole {
         id: r.id, title: r.title, department: r.department,
         avgSalary: r.avgSalary, description: r.description
       })`,
      { roles: data.job_roles }
    );

    console.log(`Inserting ${data.courses.length} (:Course) nodes...`);
    await session.run(
      `UNWIND $courses AS c
       CREATE (course:Course {
         id: c.id, title: c.title, provider: c.provider,
         url: c.url, durationHours: c.durationHours
       })`,
      { courses: data.courses }
    );

    console.log(`Creating ${data.prerequisites.length} [:PREREQUISITE_OF] relationships...`);
    await session.run(
      `UNWIND $prereqs AS p
       MATCH (fromSkill:Skill { id: p.from }), (toSkill:Skill { id: p.to })
       MERGE (fromSkill)-[:PREREQUISITE_OF]->(toSkill)`,
      { prereqs: data.prerequisites }
    );

    console.log(`Creating ${data.role_requirements.length} [:REQUIRES_SKILL] relationships...`);
    await session.run(
      `UNWIND $reqs AS req
       MATCH (role:JobRole { id: req.role }), (skill:Skill { id: req.skill })
       MERGE (role)-[:REQUIRES_SKILL]->(skill)`,
      { reqs: data.role_requirements }
    );

    console.log(`Creating ${data.course_teaches.length} [:TEACHES] relationships...`);
    await session.run(
      `UNWIND $teaches AS t
       MATCH (course:Course { id: t.course }), (skill:Skill { id: t.skill })
       MERGE (course)-[:TEACHES]->(skill)`,
      { teaches: data.course_teaches }
    );

    const nodeRes = await session.run('MATCH (n) RETURN count(n) AS c');
    const relRes = await session.run('MATCH ()-[r]->() RETURN count(r) AS c');
    const nodes = nodeRes.records[0].get('c').toNumber();
    const rels = relRes.records[0].get('c').toNumber();

    console.log('==========================================');
    console.log('🎉 Graph Seeded Successfully in CognoDB!');
    console.log(`📊 Nodes: ${nodes} | Relationships: ${rels}`);
    console.log('==========================================');
  } finally {
    await session.close();
    await driver.close();
  }
}

seed().catch(console.error);
