import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
});

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;

    // Fetch business_id for this user
    const businessRes = await pool.query('SELECT id FROM businesses WHERE owner_id = $1', [userId]);
    const business = businessRes.rows[0];
    if (!business) {
      return NextResponse.json({ error: 'No business found for user' }, { status: 400 });
    }
    const business_id = business.id;

    const body = await req.json();
    const {
      name,
      description,
      quantity,
      cost,
      price,
      photo_url,
      availability,
      sku,
      category,
    } = body;

    const result = await pool.query(
      `INSERT INTO products (name, description, quantity, cost, price, photo_url, availability, business_id, sku, category)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [name, description, quantity, cost, price, photo_url, availability, business_id, sku, category]
    );

    return NextResponse.json({ product: result.rows[0] }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if a specific business_id is requested
    const { searchParams } = new URL(req.url);
    let business_id = searchParams.get('business_id');
    
    // If no business_id is provided, use the logged-in user's business
    if (!business_id) {
      const userId = session.user.id;
      const businessRes = await pool.query('SELECT id FROM businesses WHERE owner_id = $1', [userId]);
      const business = businessRes.rows[0];
      if (!business) {
        return NextResponse.json({ error: 'No business found for user' }, { status: 400 });
      }
      business_id = business.id;
    }

    // Fetch products for the specified business
    const result = await pool.query('SELECT * FROM products WHERE business_id = $1 ORDER BY id DESC', [business_id]);
    return NextResponse.json({ products: result.rows }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
