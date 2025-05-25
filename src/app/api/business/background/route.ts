import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const background = formData.get('background') as File;
  const userId = formData.get('userId');

  if (!background || !userId) {
    return NextResponse.json({ error: 'Background image and userId are required' }, { status: 400 });
  }

  try {
    // Convert the file to a Buffer
    const bytes = await background.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate a unique filename
    const timestamp = Date.now();
    const filename = `background-${userId}-${timestamp}.${background.name.split('.').pop()}`;
    const filepath = join(process.cwd(), 'public', 'uploads', filename);

    // Save the file
    await writeFile(filepath, buffer);

    // Update the database
    const client = await pool.connect();
    try {
      await client.query(
        'UPDATE businesses SET background_image = $1 WHERE owner_id = $2',
        [`uploads/${filename}`, userId]
      );
      return NextResponse.json({ success: true, path: `/uploads/${filename}` });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error uploading background image:', error);
    return NextResponse.json({ error: 'Failed to upload background image' }, { status: 500 });
  }
} 