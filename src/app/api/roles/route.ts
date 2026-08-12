import { NextResponse } from 'next/server';
import { getAllRolesList } from '@/lib/queries';

export async function GET() {
  return NextResponse.json(getAllRolesList());
}
