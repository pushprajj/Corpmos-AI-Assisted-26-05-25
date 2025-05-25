import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import pool from '@/lib/db';

// Add a comment to a post
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;
    const { postId, content, parentId } = await req.json();
    
    if (!postId || !content) {
      return NextResponse.json({ error: 'Post ID and content are required' }, { status: 400 });
    }
    
    const client = await pool.connect();
    
    try {
      // Begin transaction
      await client.query('BEGIN');
      
      // Insert the comment
      const commentResult = await client.query(
        'INSERT INTO comments (post_id, user_id, content, parent_id) VALUES ($1, $2, $3, $4) RETURNING *',
        [postId, userId, content, parentId || null]
      );
      
      // Update the comments count in the posts table
      const updateResult = await client.query(
        'UPDATE posts SET comments_count = (SELECT COUNT(*) FROM comments WHERE post_id = $1) WHERE id = $1 RETURNING comments_count',
        [postId]
      );
      
      // Commit transaction
      await client.query('COMMIT');
      
      // Get the full comment data with business info (logo and name)
      const commentData = await client.query(
        `SELECT 
           c.id, c.post_id, c.user_id, c.content, c.parent_id, 
           c.created_at, c.updated_at,
           COALESCE(b.logo, '') as user_logo,
           COALESCE(b.name, '') as user_name
         FROM comments c
         JOIN users u ON c.user_id = u.id
         LEFT JOIN businesses b ON b.owner_id = u.id
         WHERE c.id = $1`,
        [commentResult.rows[0].id]
      );
      
      // Return the new comment exactly as fetched from the DB, but add replies: []
      return NextResponse.json({ 
        success: true, 
        comment: { ...commentData.rows[0], replies: [] },
        commentsCount: updateResult.rows[0].comments_count 
      });
    } catch (error) {
      // Rollback transaction on error
      await client.query('ROLLBACK');
      console.error('Error adding comment:', error);
      return NextResponse.json({ 
        success: false,
        error: 'Failed to add comment',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error in comment API:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Get comments for a post
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const url = new URL(req.url);
    const commentId = url.searchParams.get('commentId');
    if (!commentId) {
      return NextResponse.json({ success: false, error: 'Missing commentId' }, { status: 400 });
    }
    const client = await pool.connect();
    try {
      // Check ownership
      const check = await client.query('SELECT user_id, post_id FROM comments WHERE id = $1 AND deleted_at IS NULL', [commentId]);
      if (check.rows.length === 0) {
        return NextResponse.json({ success: false, error: 'Comment not found' }, { status: 404 });
      }
      if (String(check.rows[0].user_id) !== String(session.user.id)) {
        return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
      }
      // Soft delete
      await client.query('UPDATE comments SET deleted_at = NOW() WHERE id = $1', [commentId]);
      // Update comment count
      await client.query('UPDATE posts SET comments_count = (SELECT COUNT(*) FROM comments WHERE post_id = $1 AND deleted_at IS NULL) WHERE id = $1', [check.rows[0].post_id]);
      return NextResponse.json({ success: true });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error deleting comment:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete comment', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ 
        success: false,
        error: 'Unauthorized',
        message: 'You must be logged in to view comments.'
      }, { status: 401 });
    }
    
    const url = new URL(req.url);
    const postId = url.searchParams.get('postId');
    
    if (!postId) {
      return NextResponse.json({ 
        success: false,
        error: 'Post ID is required',
        message: 'Please provide a valid post ID'
      }, { status: 400 });
    }
    
    // Validate post exists and convert postId to number
    const numericPostId = parseInt(postId, 10);
    if (isNaN(numericPostId)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid Post ID',
        message: 'Post ID must be a number'
      }, { status: 400 });
    }
    
    const postExists = await pool.query('SELECT id FROM posts WHERE id = $1', [numericPostId]);
    if (postExists.rows.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Not Found',
        message: 'The requested post does not exist'
      }, { status: 404 });
    }
    
    const client = await pool.connect();
    
    try {
      // Get all root-level comments for the post with user information, likes count, and liked_by_user
      const result = await client.query(
        `SELECT 
          c.id, c.post_id, c.user_id, c.content, c.parent_id, 
          c.created_at, c.updated_at,
          COALESCE(b.logo, '') as user_logo,
          COALESCE(b.name, '') as user_name,
          (SELECT COUNT(*)::int FROM comments r WHERE r.parent_id = c.id AND r.deleted_at IS NULL) as reply_count,
          (SELECT COUNT(*) FROM comment_likes cl WHERE cl.comment_id = c.id) AS likes_count,
          EXISTS (SELECT 1 FROM comment_likes cl WHERE cl.comment_id = c.id AND cl.user_id = $2) AS liked_by_user
        FROM comments c
         JOIN users u ON c.user_id = u.id
         LEFT JOIN businesses b ON b.owner_id = u.id
        WHERE c.post_id = $1 AND c.parent_id IS NULL AND c.deleted_at IS NULL
        ORDER BY c.created_at DESC`,
        [numericPostId, session.user.id]
      );
      console.log('Fetched root comments:', result.rows);
      
      // Get replies for each comment, including likes_count and liked_by_user
      const commentsWithReplies = await Promise.all(result.rows.map(async (comment: any) => {
        const repliesResult = await client.query(
          `SELECT 
             c.id, c.post_id, c.user_id, c.content, c.parent_id, 
             c.created_at, c.updated_at,
             COALESCE(b.logo, '') as user_logo,
             COALESCE(b.name, '') as user_name,
             (SELECT COUNT(*) FROM comment_likes cl WHERE cl.comment_id = c.id) AS likes_count,
             EXISTS (SELECT 1 FROM comment_likes cl WHERE cl.comment_id = c.id AND cl.user_id = $2) AS liked_by_user
           FROM comments c
           JOIN posts p ON c.post_id = p.id
           LEFT JOIN businesses b ON c.user_id = b.id
           WHERE c.parent_id = $1 AND c.deleted_at IS NULL
           ORDER BY c.created_at ASC`,
           [comment.id, session.user.id]
        );
        return {
          ...comment,
          replies: repliesResult.rows,
          reply_count: repliesResult.rows.length
        };
      }));
      return NextResponse.json({ 
        success: true, 
        comments: commentsWithReplies,
        count: commentsWithReplies.length,
        totalReplies: commentsWithReplies.reduce((sum, comment) => sum + (comment.replies?.length || 0), 0)
      });
    } catch (error) {
      console.error('Error fetching comments:', error);
      return NextResponse.json({ 
        success: false,
        error: 'Failed to fetch comments',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error in comment API:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
