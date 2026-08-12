import neo4j from 'neo4j-driver';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const uri = process.env.COGNODB_URI;
const user = process.env.COGNODB_USER || 'cognodb';
const password = process.env.COGNODB_PASSWORD;

if (!uri || !password) {
  console.error('❌ Error: Missing COGNODB_URI or COGNODB_PASSWORD in .env.local');
  process.exit(1);
}

async function seed() {
  const dataPath = path.join(process.cwd(), 'data', 'dataset.json');
  if (!fs.existsSync(dataPath)) {
    console.error('❌ dataset.json not found at:', dataPath);
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  console.log(`Connecting to CognoDB Cloud at ${uri}...`);

  const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
  const session = driver.session();

  try {
    console.log('Clearing old graph...');
    await session.run('MATCH (n) DETACH DELETE n');

    console.log(`Inserting ${data.skills.length} (:Skill) nodes...`);
    for (const skill of data.skills) {
      await session.run(
        `
        MERGE (s:Skill { id: $id })
        SET s.name = $name,
            s.category = $category,
            s.difficulty = $difficulty,
            s.importance = $importance,
            s.description = $description
        `,
        skill
      );
    }

    console.log(`Inserting ${data.job_roles.length} (:JobRole) nodes...`);
    for (const role of data.job_roles) {
      await session.run(
        `
        MERGE (r:JobRole { id: $id })
        SET r.title = $title,
            r.department = $department,
            r.avgSalary = $avgSalary,
            r.description = $description
        `,
        role
      );
    }

    console.log(`Inserting ${data.courses.length} (:Course) nodes...`);
    for (const course of data.courses) {
      await session.run(
        `
        MERGE (c:Course { id: $id })
        SET c.title = $title,
            c.provider = $provider,
            c.url = $url,
            c.durationHours = $durationHours
        `,
        course
      );
    }

    console.log(`Creating ${data.prerequisites.length} [:PREREQUISITE_OF] relationships...`);
    for (const p of data.prerequisites) {
      await session.run(
        `
        MATCH (from:Skill { id: $from }), (to:Skill { id: $to })
        MERGE (from)-[:PREREQUISITE_OF]->(to)
        `,
        p
      );
    }

    console.log(`Creating ${data.role_requirements.length} [:REQUIRES_SKILL] relationships...`);
    for (const req of data.role_requirements) {
      await session.run(
        `
        MATCH (r:JobRole { id: $role }), (s:Skill { id: $skill })
        MERGE (r)-[:REQUIRES_SKILL]->(s)
        `,
        req
      );
    }

    console.log(`Creating ${data.course_teaches.length} [:TEACHES] relationships...`);
    for (const t of data.course_teaches) {
      await session.run(
        `
        MATCH (c:Course { id: $course }), (s:Skill { id: $skill })
        MERGE (c)-[:TEACHES]->(s)
        `,
        t
      );
    }

    const countRes = await session.run('MATCH (n) RETURN count(n) AS nodes');
    const relRes = await session.run('MATCH ()-[r]->() RETURN count(r) AS rels');

    console.log('==========================================');
    console.log('🎉 Graph Seeded Successfully in CognoDB!');
    console.log(`📊 Nodes: ${countRes.records[0].get('nodes')} | Relationships: ${relRes.records[0].get('rels')}`);
    console.log('==========================================');
  } catch (err) {
    console.error('❌ Seeding failed:', err);
  } finally {
    await session.close();
    await driver.close();
  }
}

seed();
