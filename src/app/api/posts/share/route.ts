import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import pool from '@/lib/db';

// Record a share of a post
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;
    const { postId, sharedTo } = await req.json();
    
    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }
    
    const client = await pool.connect();
    
    try {
      // Begin transaction
      await client.query('BEGIN');
      
      // Record the share
      await client.query(
        'INSERT INTO shares (post_id, user_id, shared_to) VALUES ($1, $2, $3)',
        [postId, userId, sharedTo || null]
      );
      
      // Update the shares count in the posts table
      const updateResult = await client.query(
        'UPDATE posts SET shares_count = (SELECT COUNT(*) FROM shares WHERE post_id = $1) WHERE id = $1 RETURNING shares_count',
        [postId]
      );
      
      // Commit transaction
      await client.query('COMMIT');
      
      return NextResponse.json({ 
        success: true, 
        sharesCount: updateResult.rows[0].shares_count 
      });
    } catch (error) {
      // Rollback transaction on error
      await client.query('ROLLBACK');
      console.error('Error recording share:', error);
      return NextResponse.json({ error: 'Failed to record share' }, { status: 500 });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error in share API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
