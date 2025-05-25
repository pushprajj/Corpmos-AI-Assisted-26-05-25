import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const logo = formData.get('logo') as File;
  const userId = formData.get('userId');

  if (!logo || !userId) {
    return NextResponse.json({ error: 'Logo and userId are required' }, { status: 400 });
  }

  try {
    // Convert the file to a Buffer
    const bytes = await logo.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate a unique filename
    const timestamp = Date.now();
    const filename = `logo-${userId}-${timestamp}.${logo.name.split('.').pop()}`;
    const filepath = join(process.cwd(), 'public', 'uploads', filename);

    // Save the file
    await writeFile(filepath, buffer);

    // Update the database
    const client = await pool.connect();
    try {
      await client.query(
        'UPDATE businesses SET logo = $1 WHERE owner_id = $2',
        [`uploads/${filename}`, userId]
      );
      return NextResponse.json({ success: true, path: `/uploads/${filename}` });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error uploading logo:', error);
    return NextResponse.json({ error: 'Failed to upload logo' }, { status: 500 });
  }
} 