import { NextResponse } from 'next/server';
import { getFullGraph } from '@/lib/queries';

export async function GET() {
  const data = await getFullGraph();
  return NextResponse.json(data);
}
