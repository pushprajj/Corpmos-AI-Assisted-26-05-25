import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  const client = await pool.connect();
  try {
    const { username } = params;
    console.log('Fetching user with username:', username);

    // First, let's check the actual columns in the users table
    const columnsResult = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users'
    `);
    console.log('Available columns:', columnsResult.rows.map(col => col.column_name));

    // Query the database for the specific user with the correct columns
    const result = await client.query(
      'SELECT id, username, email, full_name FROM users WHERE LOWER(username) = LOWER($1)',
      [username]
    );

    console.log('Query result:', result.rows);

    if (result.rows.length === 0) {
      console.log('User not found');
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const user = result.rows[0];
    console.log('Found user:', user);
    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
} 