import { NextResponse } from 'next/server';
import { checkConnection } from '@/lib/neo4j';

export async function GET() {
  const result = await checkConnection();
  return NextResponse.json(result);
}
