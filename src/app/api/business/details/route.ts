import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    console.log('Session in API:', session);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { businessId, updates } = await req.json();
    console.log('Received PUT request for businessId:', businessId, 'with updates:', updates);
    if (!businessId || !updates || typeof updates !== 'object') {
      return NextResponse.json({ error: 'businessId and updates object are required' }, { status: 400 });
    }
    const validFields = ['name', 'description', 'location', 'website', 'business_street', 'business_city', 'business_state', 'business_zip_code', 'business_country', 'contact_phone', 'contact_email', 'contact_person', 'tagline', 'industry'];
    const updateData: Record<string, any> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (validFields.includes(key)) {
        updateData[key] = value;
        console.log(`Preparing to update field: ${key} with value: ${value}`);
      } else {
        console.log(`Invalid field attempted: ${key}`);
      }
    }
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }
    try {
      const setClauses = Object.keys(updateData).map((key, i) => `${key} = $${i + 1}`).join(', '); 
      const query = `UPDATE businesses SET ${setClauses} WHERE id = $${Object.keys(updateData).length + 1} AND owner_id = $${Object.keys(updateData).length + 2} RETURNING *`;
      const values = [...Object.values(updateData), businessId, session.user.id];
      const result = await db.query(query, values);
      if (result.rowCount === 0) {
        console.log('No business found or no permission to update for businessId:', businessId);
        return NextResponse.json({ error: 'No business found or no permission' }, { status: 404 });
      }
      console.log('Updated business successfully:', result.rows[0]);
      return NextResponse.json({ success: true, data: result.rows[0] }, { status: 200 });
    } catch (dbError) {
      console.error('Database error during update:', dbError);
      return NextResponse.json({ error: 'Database error occurred' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in PUT /api/business/details:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}