import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST() {
  const client = await pool.connect();
  try {
    // Use CASCADE to delete all related data
    await client.query('TRUNCATE TABLE businesses CASCADE');
    await client.query('TRUNCATE TABLE users CASCADE');
    return NextResponse.json({ message: 'All data cleaned up successfully' });
  } catch (error: any) {
    console.error('Cleanup error:', error);
    return NextResponse.json({ error: 'Failed to clean up data' }, { status: 500 });
  } finally {
    client.release();
  }
} 