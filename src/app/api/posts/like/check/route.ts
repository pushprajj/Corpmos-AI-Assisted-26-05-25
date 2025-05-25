import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import pool from '@/lib/db';

// Check if a user has liked a post
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const url = new URL(req.url);
    const postId = url.searchParams.get('postId');
    const userId = url.searchParams.get('userId') || session.user.id;
    
    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }
    
    const client = await pool.connect();
    
    try {
      // Check if the user has liked the post
      const result = await client.query(
        'SELECT EXISTS(SELECT 1 FROM likes WHERE post_id = $1 AND user_id = $2)',
        [postId, userId]
      );
      
      const liked = result.rows[0].exists;
      
      return NextResponse.json({ 
        success: true, 
        liked
      });
    } catch (error) {
      console.error('Error checking like status:', error);
      return NextResponse.json({ error: 'Failed to check like status' }, { status: 500 });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error in like check API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
