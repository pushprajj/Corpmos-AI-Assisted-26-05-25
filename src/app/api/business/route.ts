// src/app/api/business/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId');
  if (!userId) return NextResponse.json({ error: 'User ID required' }, { status: 400 });

  const client = await pool.connect();
  try {
    const res = await client.query('SELECT * FROM businesses WHERE owner_id = $1', [userId]);
    return NextResponse.json(res.rows[0] || { name: 'Your Business' }, { status: 200 });
  } finally {
    client.release();
  }
}

export async function PUT(req: NextRequest) {
  try {
    console.log('PUT /api/business: Starting');
    const formData = await req.formData();
    const userId = formData.get('userId') as string;
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const location = formData.get('location') as string;
    const website = formData.get('website') as string;
    const logoFile = formData.get('logo') as File | null;
    const backgroundFile = formData.get('backgroundImage') as File | null;

    console.log('FormData:', { userId, name, description, location, website, logo: logoFile?.name, background: backgroundFile?.name });

    if (!userId || !name) {
      console.log('Missing userId or name');
      return NextResponse.json({ error: 'User ID and name required' }, { status: 400 });
    }

    let logoPath: string | undefined;
    let backgroundPath: string | undefined;

    if (logoFile && logoFile.size > 0) {
      console.log('Processing logo upload:', logoFile.name);
      const bytes = await logoFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      logoPath = `/uploads/logos/${Date.now()}-${logoFile.name}`;
      const fullPath = path.join(process.cwd(), 'public', logoPath);
      console.log('Writing logo to:', fullPath);
      await writeFile(fullPath, buffer);
    }

    if (backgroundFile && backgroundFile.size > 0) {
      console.log('Processing background upload:', backgroundFile.name);
      const bytes = await backgroundFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      backgroundPath = `/uploads/backgrounds/${Date.now()}-${backgroundFile.name}`;
      const fullPath = path.join(process.cwd(), 'public', backgroundPath);
      console.log('Writing background to:', fullPath);
      await writeFile(fullPath, buffer);
    }

    const client = await pool.connect();
    try {
      console.log('Executing query with:', [name, userId, description, location, website, logoPath, backgroundPath]);
      const res = await client.query(
        `INSERT INTO businesses (name, owner_id, description, location, website, logo, background_image)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (owner_id)
         DO UPDATE SET
           name = EXCLUDED.name,
           description = EXCLUDED.description,
           location = EXCLUDED.location,
           website = EXCLUDED.website,
           logo = COALESCE(EXCLUDED.logo, businesses.logo),
           background_image = COALESCE(EXCLUDED.background_image, businesses.background_image)
         RETURNING *`,
        [name, userId, description || null, location || null, website || null, logoPath || null, backgroundPath || null]
      );
      console.log('Query result:', res.rows[0]);
      return NextResponse.json(res.rows[0], { status: 200 });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('PUT /api/business error:', error);
    return NextResponse.json({ error: 'Failed to update business', details: (error as Error).message }, { status: 500 });
  }
}