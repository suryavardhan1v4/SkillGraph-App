import { NextRequest, NextResponse } from 'next/server';
import { getRoleRoadmap } from '@/lib/queries';

export async function GET(req: NextRequest, { params }: { params: { roleId: string } }) {
  const { roleId } = params;
  if (!roleId) {
    return NextResponse.json({ error: 'Role ID required.' }, { status: 400 });
  }

  const result = await getRoleRoadmap(roleId);
  return NextResponse.json(result);
}
