import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { saveFileToServer } from '@/utils/fileUpload';

// GET: Fetch posts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const businessId = searchParams.get('business_id');

  if (!businessId) {
    return NextResponse.json({ error: 'Business ID is required' }, { status: 400 });
  }

  try {
    // Fetch posts with associated media
    const result = await pool.query(
      `SELECT p.*, 
       COALESCE(
         json_agg(
           json_build_object(
             'id', pm.id,
             'media_url', pm.media_url,
             'media_type', pm.media_type,
             'uploaded_at', pm.uploaded_at
           )
         ) FILTER (WHERE pm.id IS NOT NULL), '[]'
       ) as media
       FROM posts p
       LEFT JOIN post_media pm ON p.id = pm.post_id
       WHERE p.business_id = $1
       GROUP BY p.id
       ORDER BY p.created_at DESC`,
      [businessId]
    );

    return NextResponse.json({ posts: result.rows });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

// POST: Create a new post
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const businessId = formData.get('business_id');
    const content = formData.get('content');
    const postType = formData.get('post_type');

    if (!businessId || !content) {
      return NextResponse.json({ error: 'Business ID and content are required' }, { status: 400 });
    }

    // Start a transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Insert the post
      const postResult = await client.query(
        'INSERT INTO posts (business_id, content, post_type) VALUES ($1, $2, $3) RETURNING id',
        [businessId, content, postType || 'text']
      );

      const postId = postResult.rows[0].id;

      // Process media files if any
      const mediaFiles = formData.getAll('media_urls[]');
      const mediaTypes = formData.getAll('media_types[]');

      if (mediaFiles.length > 0) {
        for (let i = 0; i < mediaFiles.length; i++) {
          const file = mediaFiles[i] as File;
          const mediaType = mediaTypes[i] as string;

          if (file && file instanceof File) {
            // Save file to server
            const mediaUrl = await saveFileToServer(file);

            // Insert media record
            await client.query(
              'INSERT INTO post_media (post_id, media_url, media_type) VALUES ($1, $2, $3)',
              [postId, mediaUrl, mediaType]
            );
          }
        }
      }

      await client.query('COMMIT');

      return NextResponse.json({ success: true, postId });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error creating post:', error);
      return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

// PUT: Update an existing post
export async function PUT(request: Request) {
  try {
    const formData = await request.formData();
    const postId = formData.get('post_id');
    const businessId = formData.get('business_id');
    const content = formData.get('content');
    const postType = formData.get('post_type');
    const mediaToDelete = formData.getAll('media_to_delete[]');
    
    if (!postId || !businessId) {
      return NextResponse.json({ error: 'Post ID and Business ID are required' }, { status: 400 });
    }

    // Start a transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Update the post
      await client.query(
        'UPDATE posts SET content = $1, post_type = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 AND business_id = $4',
        [content, postType, postId, businessId]
      );
      
      // Delete media items that were removed in the UI
      if (mediaToDelete && mediaToDelete.length > 0) {
        for (const mediaId of mediaToDelete) {
          // Get the media URL before deleting to potentially clean up the file
          const mediaResult = await client.query(
            'SELECT media_url FROM post_media WHERE id = $1',
            [mediaId]
          );
          
          if (mediaResult.rows.length > 0) {
            // Delete the media record
            await client.query('DELETE FROM post_media WHERE id = $1', [mediaId]);
            
            // Note: In a production app, you might want to also delete the actual file from storage
            // This would require additional file system operations
          }
        }
      }
      
      // Process new media files if any
      const mediaFiles = formData.getAll('media_urls[]');
      const mediaTypes = formData.getAll('media_types[]');

      if (mediaFiles.length > 0) {
        for (let i = 0; i < mediaFiles.length; i++) {
          const file = mediaFiles[i] as File;
          const mediaType = mediaTypes[i] as string;

          if (file && file instanceof File) {
            // Save file to server
            const mediaUrl = await saveFileToServer(file);

            // Insert media record
            await client.query(
              'INSERT INTO post_media (post_id, media_url, media_type) VALUES ($1, $2, $3)',
              [postId, mediaUrl, mediaType]
            );
          }
        }
      }

      await client.query('COMMIT');

      return NextResponse.json({ success: true, postId });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error updating post:', error);
      return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

// DELETE: Delete a post
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const postId = searchParams.get('post_id');
  const businessId = searchParams.get('business_id');

  if (!postId || !businessId) {
    return NextResponse.json({ error: 'Post ID and Business ID are required' }, { status: 400 });
  }

  // Start a transaction
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Query to check if media exists for this post (for logging purposes)
    await client.query(
      'SELECT COUNT(*) FROM post_media WHERE post_id = $1',
      [postId]
    );

    // Delete post media first (due to foreign key constraints)
    await client.query('DELETE FROM post_media WHERE post_id = $1', [postId]);

    // Delete the post
    await client.query(
      'DELETE FROM posts WHERE id = $1 AND business_id = $2',
      [postId, businessId]
    );

    await client.query('COMMIT');

    // Note: In a production app, you might want to also delete the actual files from storage
    // This would require additional file system operations with the mediaResult.rows

    return NextResponse.json({ success: true });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error deleting post:', error);
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  } finally {
    client.release();
  }
}