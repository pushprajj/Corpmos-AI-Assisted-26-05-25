import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import pool from '@/lib/db';

// Toggle like status for a post
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;
    const { postId } = await req.json();
    
    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }
    
    const client = await pool.connect();
    
    try {
      // Begin transaction
      await client.query('BEGIN');
      
      // Check if the user has already liked the post
      const checkResult = await client.query(
        'SELECT id FROM likes WHERE post_id = $1 AND user_id = $2',
        [postId, userId]
      );
      
      let action: 'added' | 'removed';
      
      if (checkResult.rows.length > 0) {
        // User already liked the post, so remove the like
        await client.query(
          'DELETE FROM likes WHERE post_id = $1 AND user_id = $2',
          [postId, userId]
        );
        action = 'removed';
      } else {
        // User hasn't liked the post, so add a like
        await client.query(
          'INSERT INTO likes (post_id, user_id) VALUES ($1, $2)',
          [postId, userId]
        );
        action = 'added';
      }
      
      // Update the likes count in the posts table
      const updateResult = await client.query(
        'UPDATE posts SET likes_count = (SELECT COUNT(*) FROM likes WHERE post_id = $1) WHERE id = $1 RETURNING likes_count',
        [postId]
      );
      
      // Commit transaction
      await client.query('COMMIT');
      
      return NextResponse.json({ 
        success: true, 
        action,
        likesCount: updateResult.rows[0].likes_count 
      });
    } catch (error) {
      // Rollback transaction on error
      await client.query('ROLLBACK');
      console.error('Error toggling like:', error);
      return NextResponse.json({ error: 'Failed to toggle like status' }, { status: 500 });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error in like API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
