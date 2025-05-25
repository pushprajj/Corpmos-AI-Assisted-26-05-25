// src/app/api/auth/signup/route.ts
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import pool from '@/lib/db';

export async function POST(req: NextRequest) {
  const { email, password, businessName, contactPersonName } = await req.json();

  const client = await pool.connect();
  try {
    const userRes = await client.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userRes.rows.length > 0) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const username = email.split('@')[0];

    const newUserRes = await client.query(
      'INSERT INTO users (email, password, username) VALUES ($1, $2, $3) RETURNING id',
      [email, hashedPassword, username]
    );
    const userId = newUserRes.rows[0].id;

    await client.query(
      'INSERT INTO businesses (name, owner_id, contact_person_name) VALUES ($1, $2, $3)',
      [businessName, userId, contactPersonName]
    );

    return NextResponse.json({ email, businessName, contactPersonName }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  } finally {
    client.release();
  }
}