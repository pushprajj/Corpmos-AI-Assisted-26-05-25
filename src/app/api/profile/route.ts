import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'User ID required' }, { status: 400 });
  }

  const client = await pool.connect();
  try {
    const res = await client.query('SELECT * FROM user_profiles WHERE user_id = $1', [userId]);
    const profile = res.rows[0] || {};
    return NextResponse.json(profile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  } finally {
    client.release();
  }
}

export async function POST(request: NextRequest) {
  const { userId, qualifications, skills, experience, bio } = await request.json();

  if (!userId) {
    return NextResponse.json({ error: 'User ID required' }, { status: 400 });
  }

  const client = await pool.connect();
  try {
    const res = await client.query(
      `
      INSERT INTO user_profiles (user_id, qualifications, skills, experience, bio)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (user_id)
      DO UPDATE SET qualifications = $2, skills = $3, experience = $4, bio = $5
      RETURNING *
      `,
      [userId, qualifications || null, skills || [], experience || null, bio || null]
    );
    return NextResponse.json(res.rows[0], { status: 200 });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  } finally {
    client.release();
  }
}