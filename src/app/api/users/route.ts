import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  const { email, username, password, full_name, business_name, industry } = await request.json();
  console.log('Signup request:', { email, username, password: '***', full_name, business_name, industry });

  if (!email || !username || !password || !business_name || !industry) {
    console.log('Missing required fields');
    return NextResponse.json({ error: 'All fields except full name are required' }, { status: 400 });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user with username
    const userRes = await client.query(
      'INSERT INTO users (email, username, password, full_name) VALUES ($1, $2, $3, $4) RETURNING id, email, username',
      [email, username, hashedPassword, full_name || null]
    );
    const user = userRes.rows[0];
    console.log('User inserted:', user);

    // Insert business
    const businessRes = await client.query(
      'INSERT INTO businesses (name, owner_id, website, description) VALUES ($1, $2, $3, $4) RETURNING id',
      [business_name, user.id, null, `Industry: ${industry}`]
    );
    console.log('Business inserted:', businessRes.rows[0]);

    await client.query('COMMIT');
    return NextResponse.json(user, { status: 201 });
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Signup error:', { message: error.message, code: error.code, detail: error.detail });
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Email or username already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: `Invalid data or server error: ${error.message}` }, { status: 400 });
  } finally {
    client.release();
  }
}

export async function GET(request: NextRequest) {
  const client = await pool.connect();
  try {
    // Query the database for all users
    const result = await client.query(
      'SELECT id, username, email, name, business_name FROM users ORDER BY username'
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}