import { NextResponse } from 'next/server';
import { getAllSkillsList } from '@/lib/queries';

export async function GET() {
  return NextResponse.json(getAllSkillsList());
}
