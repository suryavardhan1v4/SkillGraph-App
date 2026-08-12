import { NextRequest, NextResponse } from 'next/server';
import { getTransitivePrerequisites } from '@/lib/queries';

export async function GET(req: NextRequest, { params }: { params: { skillId: string } }) {
  const { skillId } = params;
  if (!skillId) {
    return NextResponse.json({ error: 'Skill ID required.' }, { status: 400 });
  }

  const result = await getTransitivePrerequisites(skillId);
  return NextResponse.json(result);
}
