import React, { useEffect, useState } from 'react';
import { FiHeart, FiMessageCircle, FiSend, FiThumbsUp } from 'react-icons/fi';

interface PostMedia {
  id: number;
  post_id: number;
  media_url: string;
  media_type: string;
}

interface Post {
  id: number;
  business_id: number;
  content: string;
  post_type: string;
  media: PostMedia[] | null;
  likes_count: number;
  liked?: boolean;
  comments_count: number;
  created_at: string;
}

interface Comment {
  id: number;
  post_id: number;
  user_id: number;
  content: string;
  parent_id?: number | null;
  created_at: string;
  likes_count: number;
  liked?: boolean;
  user_name?: string;
  replies?: Comment[];
}

interface ProfilePostsFeedProps {
  profileId: number | string;
}

const ProfilePostsFeed: React.FC<ProfilePostsFeedProps> = ({ profileId }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activePostId, setActivePostId] = useState<number | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentInput, setCommentInput] = useState('');
  const [replyInput, setReplyInput] = useState<{ [commentId: number]: string }>({});
  const [replyingTo, setReplyingTo] = useState<number | null>(null);

  // Fetch posts for this profile
  useEffect(() => {
    setLoading(true);
    fetch(`/api/posts?profileId=${profileId}`)
      .then(res => res.json())
      .then(data => {
        setPosts(data.posts || []);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load posts.');
        setLoading(false);
      });
  }, [profileId]);

  // Fetch comments for a post
  const openComments = (postId: number) => {
    if (activePostId === postId) {
      setActivePostId(null);
      setComments([]);
      return;
    }
    setActivePostId(postId);
    setComments([]);
    fetch(`/api/posts/comment?postId=${postId}`)
      .then(res => res.json())
      .then(data => setComments(data.comments || []));
  };

  // Like/unlike a post
  const handleLikePost = async (postId: number) => {
    setPosts(prev => prev.map(post => post.id === postId
      ? { ...post, liked: !post.liked, likes_count: post.likes_count + (post.liked ? -1 : 1) }
      : post
    ));
    await fetch('/api/posts/like', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId })
    });
  };

  // Like/unlike a comment
  const handleLikeComment = async (commentId: number) => {
    setComments(prev => prev.map(comment => comment.id === commentId
      ? { ...comment, liked: !comment.liked, likes_count: comment.likes_count + (comment.liked ? -1 : 1) }
      : comment
    ));
    await fetch('/api/posts/comment/like', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ commentId })
    });
  };

  // Add a comment
  const handleAddComment = async (postId: number) => {
    if (!commentInput.trim()) return;
    const res = await fetch('/api/posts/comment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId, content: commentInput })
    });
    if (res.ok) {
      openComments(postId);
      setCommentInput('');
    }
  };

  // Add a reply (single-level only)
  const handleAddReply = async (parentId: number, postId: number) => {
    if (!replyInput[parentId]?.trim()) return;
    const res = await fetch('/api/posts/comment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId, content: replyInput[parentId], parent_id: parentId })
    });
    if (res.ok) {
      openComments(postId);
      setReplyInput(prev => ({ ...prev, [parentId]: '' }));
      setReplyingTo(null);
    }
  };

  return (
    <div className="space-y-6">
      {loading && <div>Loading posts...</div>}
      {error && <div className="text-red-500">{error}</div>}
      {posts.map(post => (
        <div key={post.id} className="bg-white rounded-lg shadow p-4">
          <div className="mb-2 text-gray-900 whitespace-pre-line">{post.content}</div>
          {post.media && post.media.length > 0 && (
            <div className="flex gap-2 mb-2">
              {post.media.map(m => (
                <img key={m.id} src={m.media_url} alt="media" className="w-24 h-24 object-cover rounded" />
              ))}
            </div>
          )}
          <div className="flex items-center gap-6 text-gray-600 mt-2">
            <button
              className={`flex items-center gap-1 hover:text-pink-500 ${post.liked ? 'text-pink-500 font-semibold' : ''}`}
              onClick={() => handleLikePost(post.id)}
              aria-label={post.liked ? 'Unlike post' : 'Like post'}
            >
              <FiHeart />
              <span>{post.likes_count}</span>
            </button>
            <button
              className="flex items-center gap-1 hover:text-blue-500"
              onClick={() => openComments(post.id)}
              aria-label="Show comments"
            >
              <FiMessageCircle />
              <span>{post.comments_count}</span>
            </button>
          </div>
          {/* Comments Section */}
          {activePostId === post.id && (
            <div className="mt-4 border-t pt-4 space-y-4">
              <div className="space-y-2">
                {comments.length === 0 && <div className="text-sm text-gray-500">No comments yet.</div>}
                {comments.filter(c => !c.parent_id).map(comment => (
                  <div key={comment.id} className="">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-800">{comment.user_name || 'User'}</span>
                      <span className="text-xs text-gray-400">{new Date(comment.created_at).toLocaleString()}</span>
                    </div>
                    <div className="ml-1 text-gray-800 mb-1">{comment.content}</div>
                    <div className="flex items-center gap-4 ml-1">
                      <button
                        className={`flex items-center gap-1 hover:text-blue-500 ${comment.liked ? 'text-blue-500 font-semibold' : ''}`}
                        onClick={() => handleLikeComment(comment.id)}
                        aria-label={comment.liked ? 'Unlike comment' : 'Like comment'}
                      >
                        <FiThumbsUp />
                        <span>{comment.likes_count}</span>
                      </button>
                      <button
                        className="flex items-center gap-1 hover:text-gray-700"
                        onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                        aria-label="Reply to comment"
                      >
                        <FiSend />
                        <span>Reply</span>
                      </button>
                    </div>
                    {/* Reply input */}
                    {replyingTo === comment.id && (
                      <div className="mt-2 ml-6">
                        <input
                          type="text"
                          className="border rounded px-2 py-1 w-64"
                          placeholder="Write a reply..."
                          value={replyInput[comment.id] || ''}
                          onChange={e => setReplyInput(prev => ({ ...prev, [comment.id]: e.target.value }))}
                          onKeyDown={e => { if (e.key === 'Enter') handleAddReply(comment.id, post.id); }}
                        />
                        <button
                          className="ml-2 px-2 py-1 bg-blue-500 text-white rounded"
                          onClick={() => handleAddReply(comment.id, post.id)}
                        >Reply</button>
                      </div>
                    )}
                    {/* Replies (single-level only) */}
                    {comments.filter(r => r.parent_id === comment.id).length > 0 && (
                      <div className="ml-8 mt-2 space-y-2">
                        {comments.filter(r => r.parent_id === comment.id).map(reply => (
                          <div key={reply.id} className="bg-gray-50 rounded p-2">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-700">{reply.user_name || 'User'}</span>
                              <span className="text-xs text-gray-400">{new Date(reply.created_at).toLocaleString()}</span>
                            </div>
                            <div className="ml-1 text-gray-700 mb-1">{reply.content}</div>
                            <div className="flex items-center gap-4 ml-1">
                              <button
                                className={`flex items-center gap-1 hover:text-blue-500 ${reply.liked ? 'text-blue-500 font-semibold' : ''}`}
                                onClick={() => handleLikeComment(reply.id)}
                                aria-label={reply.liked ? 'Unlike reply' : 'Like reply'}
                              >
                                <FiThumbsUp />
                                <span>{reply.likes_count}</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {/* Add comment input */}
              <div className="flex items-center gap-2 mt-4">
                <input
                  type="text"
                  className="border rounded px-2 py-1 w-full"
                  placeholder="Write a comment..."
                  value={commentInput}
                  onChange={e => setCommentInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleAddComment(post.id); }}
                />
                <button
                  className="px-3 py-1 bg-blue-500 text-white rounded"
                  onClick={() => handleAddComment(post.id)}
                >Comment</button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ProfilePostsFeed;
