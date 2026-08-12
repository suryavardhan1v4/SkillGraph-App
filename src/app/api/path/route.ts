import { NextRequest, NextResponse } from 'next/server';
import { findShortestLearningPath } from '@/lib/queries';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const start = searchParams.get('start');
  const end = searchParams.get('end');

  if (!start || !end) {
    return NextResponse.json({ error: 'Start and end skills required.' }, { status: 400 });
  }

  const result = await findShortestLearningPath(start, end);
  return NextResponse.json(result);
}
