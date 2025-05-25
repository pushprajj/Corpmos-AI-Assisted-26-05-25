import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import pool from '@/lib/db';

// Toggle like for a comment
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;
    const { commentId } = await req.json();
    if (!commentId) {
      return NextResponse.json({ error: 'Comment ID is required' }, { status: 400 });
    }
    const client = await pool.connect();
    try {
      // Check if like exists
      const likeRes = await client.query(
        'SELECT id FROM comment_likes WHERE comment_id = $1 AND user_id = $2',
        [commentId, userId]
      );
      let liked;
      if (likeRes.rowCount > 0) {
        // Unlike
        await client.query('DELETE FROM comment_likes WHERE comment_id = $1 AND user_id = $2', [commentId, userId]);
        liked = false;
      } else {
        // Like
        await client.query('INSERT INTO comment_likes (comment_id, user_id) VALUES ($1, $2)', [commentId, userId]);
        liked = true;
      }
      // Get updated like count
      const countRes = await client.query('SELECT COUNT(*) FROM comment_likes WHERE comment_id = $1', [commentId]);
      const likeCount = parseInt(countRes.rows[0].count, 10);
      return NextResponse.json({ liked, likeCount });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to toggle like' }, { status: 500 });
  }
}
