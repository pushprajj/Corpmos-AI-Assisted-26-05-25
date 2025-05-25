import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  const client = await pool.connect();
  try {
    const { userId } = params;
    console.log('Fetching business for user ID:', userId);

    // Query the database for the business
    const result = await client.query(
      `SELECT 
        id, 
        name, 
        description, 
        industry, 
        location, 
        website, 
        logo, 
        background_image, 
        tagline, 
        contact_person, 
        contact_email, 
        contact_phone, 
        business_street, 
        business_city, 
        business_state, 
        business_zip_code, 
        business_country 
      FROM businesses 
      WHERE owner_id = $1`,
      [userId]
    );

    console.log('Business query result:', result.rows);

    if (result.rows.length === 0) {
      console.log('Business not found for user ID:', userId);
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      );
    }

    const business = result.rows[0];
    console.log('Found business:', business);
    
    // Log image paths with more details
    console.log('Logo path:', business.logo);
    console.log('Background image path:', business.background_image);
    
    // Ensure paths start with /
    if (business.logo && !business.logo.startsWith('/')) {
      business.logo = `/${business.logo}`;
    }
    if (business.background_image && !business.background_image.startsWith('/')) {
      business.background_image = `/${business.background_image}`;
    }
    
    return NextResponse.json(business);
  } catch (error) {
    console.error('Error fetching business:', error);
    return NextResponse.json(
      { error: 'Failed to fetch business' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
} 