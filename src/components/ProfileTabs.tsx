// src/components/ProfileTabs.tsx
// src/components/ProfileTabs.tsx
'use client';
import { useState, useEffect } from 'react';
import { useSessionBusiness } from './useSessionBusiness';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FaBriefcase, FaMapMarkerAlt, FaGlobe, FaEdit, FaCamera, FaPhone, FaEnvelope, FaClock, FaUser, FaFacebook, FaLinkedin, FaInstagram, FaVideo, FaPen, FaThumbsUp, FaComment, FaShare, FaTrash, FaTwitter, FaPlus, FaImage, FaFileAlt, FaCheck, FaTimes, FaPaperPlane, FaReply } from 'react-icons/fa';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXTwitter } from '@fortawesome/free-brands-svg-icons';
import ImageUploadModal from './ImageUploadModal';
import EditBusinessNameModal from './EditBusinessNameModal';
import EditBusinessInfoModal from './EditBusinessInfoModal';
import EditTaglineModal from './EditTaglineModal';
import EditAboutModal from './EditAboutModal';

import dynamic from 'next/dynamic';
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';

// Add type declaration for window.google to avoid property access errors
import ProfilePostsFeed from './ProfilePostsFeed';
declare global {
  interface Window {
    google: any;
  }
}

interface Product {
  id?: string;
  name: string;
  description: string;
  quantity: number;
  cost: number;
  price: number;
  photo_url: string;
  availability: string;
  business_id: string;
}

type UserData = {
  id: string;
  name?: string;
  image?: string;
  full_name?: string;
  username?: string;
};

type BusinessData = {
  id: string;
  name?: string;
  description?: string;
  industry?: string;
  location?: string;
  website?: string;
  background_image?: string;
  contact_person_name?: string;
  logo?: string;
  tagline?: string;
  size?: string;
  founded_year?: string;
  hours?: string;
  contact_phone?: string;
  contact_email?: string;
  business_street?: string;
  business_city?: string;
  business_state?: string;
  business_zip_code?: string;
  business_country?: string;
};

function ProductCards({ businessId, limit = 10 }: { businessId: string, limit?: number }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      if (!businessId) return;
      
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/products?business_id=${businessId}`, { credentials: 'include' });
        if (!res.ok) throw new Error('Failed to fetch products');
        const data = await res.json();
        console.log('Fetch products response:', res.status, data);
        // No need to filter by business_id anymore since the API does that for us
        setProducts((data.products || []).slice(0, limit));
      } catch (e) {
        console.error('Error fetching products:', e);
        setError('Failed to load products');
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [businessId, limit]);

  if (loading) return <div className="text-gray-500">Loading products...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!products.length) return <div className="text-gray-500">No products found.</div>;

  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mt-4">
      {products.map(product => (
        <div key={product.id} className="bg-white rounded-lg shadow p-4 flex flex-col hover:shadow-md transition">
          {product.photo_url ? (
            <div className="-mx-4 mb-3">
              <img src={product.photo_url} alt={product.name} className="w-full h-40 object-cover rounded-t-lg" />
            </div>
          ) : (
            <div className="-mx-4 mb-3">
              <div className="w-full h-40 bg-gray-100 rounded-t-lg flex items-center justify-center text-gray-400">No Image</div>
            </div>
          )}
          <h3 className="font-semibold text-lg text-gray-800 mb-1">{product.name}</h3>
          <div className="text-indigo-600 font-bold mb-1">
            {typeof product.price === 'number' && !isNaN(product.price)
              ? `$${product.price.toFixed(2)}`
              : product.price && !isNaN(Number(product.price))
                ? `$${Number(product.price).toFixed(2)}`
                : 'No price'}
          </div>
          <div className="text-gray-600 text-sm line-clamp-3 mb-2">{product.description}</div>
          <div className="mt-auto">
            <span className={`inline-block px-2 py-1 text-xs rounded font-semibold ${product.availability === 'Available' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {product.availability}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

// Define interfaces for type safety
interface CommentUser {
  id: string;
  name?: string;
  username?: string;
  image?: string;
}

interface Comment {
  id: string | number;
  post_id: string | number;
  user_id: string;
  content: string;
  parent_id: string | number | null;
  created_at: string;
  updated_at: string;
  user_name?: string; // Business name of the comment's author
  user_logo?: string; // Business logo of the comment's author
  username?: string;
  user_image?: string;
  replies?: Comment[];
  reply_count?: number;
  isOptimistic?: boolean;
  likes_count?: number;
  liked_by_user?: boolean;
  liked?: boolean; // Alias for liked_by_user for backward compatibility
}

interface PostMedia {
  id: string;
  media_url: string;
  media_type: string;
  uploaded_at: string;
}

interface Post {
  id: string;
  business_id: string;
  content: string;
  post_type: string;
  created_at: string;
  updated_at: string;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  media: PostMedia[] | null;
  liked?: boolean; // Track if the current user has liked this post
}

export default function ProfileTabs({ user, business }: { user: UserData; business: BusinessData }) {
  const { data: session } = useSession();
  const sessionBusiness = useSessionBusiness();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('home');
  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);
  const [isBackgroundModalOpen, setIsBackgroundModalOpen] = useState(false);
  const [businessDescription, setBusinessDescription] = useState(business.description ?? '');
  const [showFullHomeDescription, setShowFullHomeDescription] = useState(false);
  const isOwnProfile = session?.user?.username === user?.username;
  const [isEditNameModalOpen, setIsEditNameModalOpen] = useState(false);
  const [isEditAboutModalOpen, setIsEditAboutModalOpen] = useState(false);
  const [isEditInfoModalOpen, setIsEditInfoModalOpen] = useState(false);
  const [isEditTaglineModalOpen, setIsEditTaglineModalOpen] = useState(false);
  const [businessName, setBusinessName] = useState(business.name ?? '');
  const [businessTagline, setBusinessTagline] = useState(business.tagline ?? '');
  const [businessWebsite, setBusinessWebsite] = useState(business.website ?? '');
  const [businessLocation, setBusinessLocation] = useState(business.location ?? '');
  const [businessIndustry, setBusinessIndustry] = useState(business.industry ?? '');
  const [contact, setContact] = useState({
    contact_person: business.contact_person_name ?? '', // New field for contact person's name
    street: business.business_street ?? '',
    city: business.business_city ?? '',
    state: business.business_state ?? '',
    business_zip_code: business.business_zip_code ?? '',
    country: business.business_country ?? '',
    phone: business.contact_phone ?? '',
    email: business.contact_email ?? '',
    website: business.website ?? ''
  });
  const [editContact, setEditContact] = useState(contact);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<File[]>([]);
  const [mediaPreviewUrls, setMediaPreviewUrls] = useState<string[]>([]);
  const [existingMedia, setExistingMedia] = useState<PostMedia[]>([]);
  const [mediaToDelete, setMediaToDelete] = useState<string[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const [postToEdit, setPostToEdit] = useState<Post | null>(null);

  // State for post interactions
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [shareModalPostId, setShareModalPostId] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [commentText, setCommentText] = useState('');
const [myBusinessLogo, setMyBusinessLogo] = useState<string | null>(null);

// Fetch the business logo for the logged-in user
useEffect(() => {
  if (session?.user?.id) {
    fetch(`/api/business/${session.user.id}`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => setMyBusinessLogo(data.logo || null))
      .catch(() => setMyBusinessLogo(null));
  }
}, [session?.user?.id]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [currentPostComments, setCurrentPostComments] = useState<Comment[]>([]);

  useEffect(() => {
    if (!isContactModalOpen) {
      setContact({
        contact_person: business.contact_person_name ?? '', // New field for contact person's name
        street: business.business_street ?? '',
        city: business.business_city ?? '',
        state: business.business_state ?? '',
        business_zip_code: business.business_zip_code ?? '',
        country: business.business_country ?? '',
        phone: business.contact_phone ?? '',
        email: business.contact_email ?? '',
        website: business.website ?? ''
      });
    }
  }, [business, isContactModalOpen]);

  useEffect(() => {
    console.log('Contact state updated:', contact);
  }, [contact]);

  useEffect(() => {
    console.log('Rendering main header with logo:', business.logo);
  }, [business.logo]);

  const updates: any[] = [
    {
      id: '1',
      title: 'New Product Launch',
      date: '2024-03-15',
      content: 'We are excited to announce our new product line launching next month!',
    },
    {
      id: '2',
      title: 'Company Milestone',
      date: '2024-03-10',
      content: 'We have reached 10,000 customers! Thank you for your support.',
    },
  ];

  const tabs = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'posts', label: 'Posts' },
    { id: 'products', label: 'Products/Services' },
    { id: 'people', label: 'People' },
    { id: 'contact', label: 'Contact' },
  ];

  const defaultBackground = '/default-background.jpg';
  const defaultLogo = '/default-logo.png';

  const fetchBusiness = async () => {
    try {
      const res = await fetch(`/api/business/${user.id}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        console.log('Fetched business data logo:', data.logo); // Log logo path for debugging
        console.log('Fetched business data:', res.status, data);
        setBusinessDescription(data.description ?? '');
        setBusinessName(data.name ?? '');
        setBusinessTagline(data.tagline ?? '');
        setBusinessWebsite(data.website ?? '');
        setBusinessLocation(data.location ?? '');
        setBusinessIndustry(data.industry ?? '');
        setContact({ // Sync contact state with fetched data
          contact_person: data.contact_person_name ?? '', // New field for contact person's name
          street: data.business_street ?? '',
          city: data.business_city ?? '',
          state: data.business_state ?? '',
          business_zip_code: data.business_zip_code ?? '',
          country: data.business_country ?? '',
          phone: data.contact_phone ?? '',
          email: data.contact_email ?? '',
          website: data.website ?? ''
        });
      } else {
        console.error('Fetch failed with status and data:', res.status, await res.json());
      }
    } catch (error) {
      console.error('Error fetching business data:', error);
    }
  };

  useEffect(() => {
    fetchBusiness();
  }, [user.id, fetchBusiness]);

  const handleLogoUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('logo', file);
    formData.append('userId', user.id);
    const response = await fetch('/api/business/logo', {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });
    console.log('Logo upload response:', response.status);
    if (!response.ok) {
      throw new Error('Failed to upload logo');
    }
    // Refresh the page to update the logo image and clear any caching
    window.location.reload();
  };

  const handleBackgroundUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('background', file);
    formData.append('userId', user.id);

    const response = await fetch('/api/business/background', {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });
    console.log('Background upload response:', response.status, await response.json());
    if (!response.ok) {
      throw new Error('Failed to upload background image');
    }

    window.location.reload();
  };

  const handleSaveBusinessName = async (newName: string) => {
    if (!business || !business.id) {
      console.error('Business ID not found');
      return;
    }
    try {
      const response = await fetch('/api/business/details', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ businessId: business.id, updates: { name: newName } }),
      });
      console.log('Update business name response:', response.status, await response.json());
      if (response.ok) {
        await fetchBusiness(); // Re-fetch to ensure latest data
      }
    } catch (error) {
      console.error('Error updating business name:', error);
    }
  };

  const handleSaveBusinessInfo = async (website: string, location: string, industry: string) => {
    if (!business || !business.id) {
      console.error('Business ID not found');
      return;
    }
    try {
      const updates: Record<string, any> = {};
      if (website) updates.website = website;
      if (location) updates.location = location;
      if (industry) updates.industry = industry;
      if (Object.keys(updates).length === 0) return;
      console.log('Sending update request for businessId:', business.id, 'with updates:', updates);
      const response = await fetch('/api/business/details', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ businessId: business.id, updates }),
      });
      console.log('API response status:', response.status, 'response body:', await response.json());
      if (response.ok) {
        await fetchBusiness(); // Re-fetch to ensure latest data
      } else {
        console.error('API update failed with status:', response.status);
      }
    } catch (error) {
      console.error('Error in handleSaveBusinessInfo:', error);
    }
  };

  const handleSaveTagline = async (newTagline: string) => {
    if (!business || !business.id) {
      console.error('Business ID not found');
      return;
    }
    try {
      const response = await fetch('/api/business/details', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ businessId: business.id, updates: { tagline: newTagline } }),
      });
      console.log('Update tagline response:', response.status, await response.json());
      if (response.ok) {
        await fetchBusiness(); // Re-fetch to ensure latest data
      }
    } catch (error) {
      console.error('Error updating tagline:', error);
    }
  };

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      setSelectedMedia(prev => [...prev, ...files]);
      
      // Create preview URLs for the uploaded files
      const newPreviewUrls = files.map(file => URL.createObjectURL(file));
      setMediaPreviewUrls(prev => [...prev, ...newPreviewUrls]);
    }
  };
  
  const removeMedia = (index: number) => {
    setSelectedMedia(prev => prev.filter((_, i) => i !== index));
    
    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(mediaPreviewUrls[index]);
    setMediaPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  // Handle liking a post
  const handleLikePost = async (postId: string) => {
    if (!session?.user?.id) return;
    
    try {
      // Ensure postId is treated as a number for the API call
      const numericPostId = typeof postId === 'string' ? parseInt(postId) : postId;
      
      const response = await fetch('/api/posts/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: numericPostId })
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Update the post in state
        setPosts(prevPosts => prevPosts.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              liked: data.action === 'added',
              likes_count: data.likesCount
            };
          }
          return post;
        }));
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };
  
  // Handle liking a comment
  const handleLikeComment = async (commentId: string | number) => {
    if (!session?.user?.id) return;
    // Optimistically update UI
    setCurrentPostComments(prevComments => prevComments.map(comment => {
      if (comment.id === commentId) {
        return {
          ...comment,
          liked_by_user: !comment.liked_by_user,
          likes_count: (comment.likes_count || 0) + (comment.liked_by_user ? -1 : 1)
        };
      }
      return comment;
    }));
    try {
      const response = await fetch('/api/posts/comment/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentId })
      });
      if (response.ok) {
        const data = await response.json();
        setCurrentPostComments(prevComments => prevComments.map(comment => {
          if (comment.id === commentId) {
            return {
              ...comment,
              liked_by_user: data.liked,
              likes_count: data.likeCount
            };
          }
          return comment;
        }));
      } else {
        throw new Error('Failed to like comment');
      }
    } catch (error) {
      console.error('Error liking comment:', error);
      // Revert optimistic update
      setCurrentPostComments(prevComments => prevComments.map(comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            liked_by_user: !comment.liked_by_user,
            likes_count: (comment.likes_count || 0) + (comment.liked_by_user ? -1 : 1)
          };
        }
        return comment;
      }));
    }
  };

  // Handle opening comments section
  const handleOpenComments = async (postId: string) => {
    try {
      // Toggle comments visibility
      if (activeCommentPostId === postId) {
        setActiveCommentPostId(null);
        setCurrentPostComments([]);
        setCommentError(null);
        return;
      }
      
      // Set loading state
      setActiveCommentPostId(postId);
      setLoadingComments(true);
      setCommentError(null);
      setCurrentPostComments([]);
      
      console.log('Fetching comments for post:', postId);
      
      // Fetch comments for the post
      const numericPostId = typeof postId === 'string' ? parseInt(postId, 10) : postId;
      const response = await fetch(`/api/posts/comment?postId=${numericPostId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        cache: 'no-store',
      });
      
      const result = await response.json();
      console.log('Comments API Response:', result);
      
      if (!response.ok) {
        throw new Error(result.error || `Failed to load comments: ${response.status}`);
      }
      
      if (result.success && Array.isArray(result.comments)) {
  // Process comments to ensure they have all required fields
  const processComment = (comment: any): Comment => {
  return {
    ...comment,
    user_name: comment.user_name || 'Anonymous',
    user_logo: comment.user_logo || '/default-logo.png',
    content: comment.content || '',
    replies: Array.isArray(comment.replies) ? comment.replies.map(processComment) : [],
  };
};
  const processedComments = result.comments.map(processComment);
  console.log('Processed comments:', processedComments);
        
        // Update both the main comments state and current post comments
        setComments(prev => ({
          ...prev,
          [postId]: processedComments
        }));
        setCurrentPostComments(processedComments);
        
        // Update the post's comment count
        const totalComments = result.count + (result.totalReplies || 0);
        
        setPosts(prevPosts => 
          prevPosts.map(post => 
            post.id === postId 
              ? { ...post, comments_count: totalComments } 
              : post
          )
        );
      } else {
        throw new Error(result.error || 'Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      setCommentError(error instanceof Error ? error.message : 'Failed to load comments');
    } finally {
      setLoadingComments(false);
    }
  };
  
  // Handle deleting a comment
  const handleDeleteComment = async (commentId: string, postId: string) => {
  if (!commentId || !session?.user?.id) return;
  setCommentError(null);
  try {
    const response = await fetch(`/api/posts/comment?commentId=${commentId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (!response.ok) {
      throw new Error((await response.json()).error || 'Failed to delete comment');
    }
    // After successful deletion, re-fetch comments for the post to update UI and comment count, but do NOT close the section
    const numericPostId = typeof postId === 'string' ? parseInt(postId, 10) : postId;
    const commentsResponse = await fetch(`/api/posts/comment?postId=${numericPostId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      cache: 'no-store',
    });
    const result = await commentsResponse.json();
    if (!commentsResponse.ok) {
      throw new Error(result.error || `Failed to load comments: ${commentsResponse.status}`);
    }
    if (result.success && Array.isArray(result.comments)) {
      const processComment = (comment: any): Comment => ({
        ...comment,
        user_name: comment.user_name || 'Anonymous',
        user_logo: comment.user_logo || '/default-logo.png',
        content: comment.content || '',
        replies: Array.isArray(comment.replies) ? comment.replies.map(processComment) : [],
      });
      const processedComments = result.comments.map(processComment);
      setComments(prev => ({ ...prev, [postId]: processedComments }));
      setCurrentPostComments(processedComments);
      // Update the post's comment count
      const totalComments = result.count + (result.totalReplies || 0);
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId
            ? { ...post, comments_count: totalComments }
            : post
        )
      );
    } else {
      throw new Error(result.error || 'Invalid response format');
    }
  } catch (error) {
    setCommentError(error instanceof Error ? error.message : 'Failed to delete comment');
  }
};

  // Handle adding a comment
  const handleAddComment = async (postId: string) => {
    const trimmedComment = commentText.trim();
    if (!trimmedComment || !session?.user?.id) return;
    // Create a temporary ID for optimistic update (move outside try for closure)
    const tempId = `temp-${Date.now()}`;
    try {
      setIsSubmittingComment(true);
      setCommentError(null);
      
      const numericPostId = typeof postId === 'string' ? parseInt(postId, 10) : postId;
      const numericUserId = typeof session.user.id === 'string' ? parseInt(session.user.id, 10) : session.user.id;
      const optimisticComment: Comment = {
        id: tempId,
        post_id: numericPostId,
        user_id: numericUserId,
        content: trimmedComment,
        parent_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_name: session.user.name || 'User',
        user_image: session.user.image || '/default-avatar.png',
        username: session.user.email?.split('@')[0] || 'user',
        replies: [],
        isOptimistic: true,
        likes_count: 0,
        liked_by_user: false
      };
      
      // Optimistically update the UI
      setComments(prev => {
        const updatedComments = {
          ...prev,
          [postId]: [
            optimisticComment,
            ...(prev[postId] || [])
          ]
        };
        setCurrentPostComments(updatedComments[postId] || []);
        return updatedComments;
      });
      
      // Clear the input
      setCommentText('');
      
      // Send the request to the server
      console.log('Sending comment for post:', numericPostId, 'Content:', trimmedComment);
      
      const response = await fetch('/api/posts/comment', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        credentials: 'include', // Include credentials for session
        body: JSON.stringify({ 
          postId: numericPostId, 
          content: trimmedComment 
        })
      });
      
      const data = await response.json();
      console.log('Comment API Response:', data);
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }
      
      if (data.success) {
        // Process the new comment to ensure it has all required fields
        const newComment: Comment = {
          ...data.comment,
          user_name: data.comment.user_name || 'Anonymous',
          user_image: data.comment.user_logo || '/default-logo.png',
          likes_count: 0,
          liked_by_user: false
        };
        
        // Remove the temporary comment and add the new one from the server
      setComments(prev => {
        const updatedComments = {
          ...prev,
          [postId]: [
            {
              ...newComment,
              replies: []
            },
            ...(prev[postId] || []).filter(comment => comment.id !== tempId)
          ]
        };
        setCurrentPostComments(updatedComments[postId] || []);
        return updatedComments;
      });
        
        // Update the post's comment count
        setPosts(prevPosts => 
          prevPosts.map(post => 
            post.id === postId 
              ? { ...post, comments_count: (post.comments_count || 0) + 1 } 
              : post
          )
        );
      } else {
        throw new Error(data.error || 'Failed to add comment');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      setCommentError(error instanceof Error ? error.message : 'Failed to add comment');
      
      // Revert the optimistic update after a short delay for better UX
      setTimeout(() => {
        setComments(prev => {
          const updatedComments = {
            ...prev,
            [postId]: (prev[postId] || []).filter(comment => !comment.isOptimistic || comment.id !== tempId)
          };
          setCurrentPostComments(updatedComments[postId] || []);
          return updatedComments;
        });
      }, 500);
    } finally {
      setIsSubmittingComment(false);
    }
  };
  
  // Handle sharing a post
  const handleSharePost = (postId: string) => {
    setShareModalPostId(postId);
  };
  
  // Handle sharing to social media
  const handleShareToSocial = async (postId: string, platform: string) => {
    try {
      // Ensure postId is treated as a number for the API call
      const numericPostId = typeof postId === 'string' ? parseInt(postId) : postId;
      
      // Record the share in the database
      const response = await fetch('/api/posts/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: numericPostId,
          sharedTo: platform
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Update the post in state
        setPosts(prevPosts => prevPosts.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              shares_count: data.sharesCount
            };
          }
          return post;
        }));
        
        // Open the appropriate sharing URL
        const postUrl = `${window.location.origin}/${business.id}/post/${postId}`;
        let shareUrl = '';
        
        switch (platform) {
          case 'facebook':
            shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`;
            break;
          case 'twitter':
            shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(postUrl)}&text=${encodeURIComponent('Check out this post on ConnectSphere!')}`;
            break;
          case 'linkedin':
            shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`;
            break;
          case 'email':
            shareUrl = `mailto:?subject=${encodeURIComponent('Check out this post on ConnectSphere!')}&body=${encodeURIComponent(`I thought you might be interested in this post: ${postUrl}`)}`;
            break;
        }
        
        if (shareUrl) {
          window.open(shareUrl, '_blank');
        }
        
        // Close the share modal
        setShareModalPostId(null);
      }
    } catch (error) {
      console.error('Error sharing post:', error);
    }
  };

  // Function to fetch posts
  const fetchPosts = async () => {
    if (!business || !business.id) return;
    
    setLoadingPosts(true);
    setPostError(null);
    
    try {
      const response = await fetch(`/api/posts?business_id=${business.id}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch posts: ${response.status}`);
      }
      const data = await response.json();
      
      // Check if the user has liked any of the posts
      if (data.posts && data.posts.length > 0 && session?.user?.id) {
        const likeChecks = await Promise.all(data.posts.map(async (post: Post) => {
          try {
            // Ensure post.id is treated as a number for the API call
            const postId = typeof post.id === 'string' ? parseInt(post.id) : post.id;
            const likeResponse = await fetch(`/api/posts/like/check?postId=${postId}`);
            if (likeResponse.ok) {
              const likeData = await likeResponse.json();
              return { ...post, liked: likeData.liked };
            }
            return post;
          } catch (error) {
            console.error('Error checking like status:', error);
            return post;
          }
        }));
        setPosts(likeChecks);
      } else {
        setPosts(data.posts || []);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      setPostError('Failed to load posts. Please try again later.');
    } finally {
      setLoadingPosts(false);
    }
  };

  // Fetch posts when the component mounts or when the business changes
  useEffect(() => {
    fetchPosts();
  }, [business?.id]);

  // Handle post deletion
  const handleDeletePost = async (postId: string) => {
    if (!postId) return;
    
    try {
      setPostToDelete(postId);
      const response = await fetch(`/api/posts?id=${postId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        // Remove post from state
        setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
      } else {
        console.error('Failed to delete post');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
    } finally {
      setPostToDelete(null);
    }
  };

  // Handle post editing
  const handleEditPost = (post: Post) => {
    setPostToEdit(post);
    setNewPostContent(post.content);
    
    // Reset any previous media selections and tracking
    mediaPreviewUrls.forEach(url => URL.revokeObjectURL(url));
    setSelectedMedia([]);
    setMediaPreviewUrls([]);
    setMediaToDelete([]);
    
    // If the post has media, show the existing media
    if (post.media && post.media.length > 0) {
      setExistingMedia(post.media);
    } else {
      setExistingMedia([]);
    }
    
    setIsPostModalOpen(true);
  };

  const handleSavePost = async () => {
    if ((!newPostContent || newPostContent === '<p><br></p>') && selectedMedia.length === 0) return;
    
    // Show immediate feedback by setting submitting state
    setIsSubmitting(true);
    
    const formData = new FormData();
    formData.append('business_id', business.id.toString());
    formData.append('content', newPostContent);
    
    // If editing, include the post ID and media to delete
    if (postToEdit) {
      formData.append('post_id', postToEdit.id);
      
      // Include IDs of media to delete
      if (mediaToDelete.length > 0) {
        mediaToDelete.forEach(mediaId => {
          formData.append('media_to_delete[]', mediaId);
        });
      }
    }
    
    // Determine post type automatically based on media content
    const hasImages = selectedMedia.some(file => file.type.startsWith('image'));
    const hasVideos = selectedMedia.some(file => file.type.startsWith('video'));
    let postType = 'text';
    if (hasImages && hasVideos) postType = 'mixed';
    else if (hasImages) postType = 'photo';
    else if (hasVideos) postType = 'video';
    formData.append('post_type', postType);
    
    selectedMedia.forEach((file) => {
      formData.append('media_urls[]', file);
      formData.append('media_types[]', file.type.split('/')[0]);
    });
    
    try {
      setLoadingPosts(true);
      
      // Use PUT method for editing, POST for creating
      const method = postToEdit ? 'PUT' : 'POST';
      const response = await fetch('/api/posts', {
        method,
        body: formData,
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Close modal and reset form
        setIsPostModalOpen(false);
        setNewPostContent('');
        
        setPostToEdit(null);
        
        // Clean up media previews and tracking
        mediaPreviewUrls.forEach(url => URL.revokeObjectURL(url));
        setSelectedMedia([]);
        setMediaPreviewUrls([]);
        setExistingMedia([]);
        setMediaToDelete([]);
        
        // Refresh posts to show the new/updated post
        fetchPosts();
      } else {
        console.error('Failed to save post', data);
      }
    } catch (error) {
      console.error('Error saving post', error);
    } finally {
      setLoadingPosts(false);
      setIsSubmitting(false);
    }
  };

  const EditButton = ({ onClick }: { onClick: () => void }) => (
    <button
      onClick={onClick}
      className="ml-2 text-gray-400 hover:text-indigo-600 transition-colors"
    >
      <FaEdit className="w-4 h-4" />
    </button>
  );

  return (
    <div className="bg-gray-200 min-h-screen w-full">
      <div className="max-w-[1128px] mx-auto grid grid-cols-12 gap-3 mt-12 pt-2">
        {/* Main Content (Left) */}
        <div className="col-span-12 md:col-span-8 lg:col-span-9 space-y-3">
          <div className="bg-white border-b border-gray-200 rounded-xl overflow-hidden">
            <div className="relative h-48 w-full rounded-t-xl">
              <Image
                src={business.background_image || defaultBackground}
                alt="Background"
                fill
                className="object-cover"
                priority
              />
              {isOwnProfile && (
                <button
                  onClick={() => setIsBackgroundModalOpen(true)}
                  className="absolute top-2 right-2 bg-white p-2 rounded-full shadow-md hover:bg-gray-100"
                >
                  <FaCamera className="w-4 h-4 text-gray-600" />
                </button>
              )}
            </div>
            <div className="relative px-4 pb-4" style={{ zIndex: 0 }}>
              <div className="flex flex-col">
                <div className="relative -mt-20 mb-4 ml-2">
                  <div className="flex justify-start">
                    <div className="relative">
                      <div className="w-36 h-36 rounded-full border-4 border-white shadow-lg overflow-hidden relative">
                        <Image 
                          src={business.logo || defaultLogo}
                          alt="Business Logo" 
                          layout="fill"
                          className="object-cover"
                        />
                      </div>
                      {isOwnProfile && (
                        <button
                          onClick={() => setIsLogoModalOpen(true)}
                          className="absolute top-0 right-0 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 z-10"
                          style={{ transform: 'translate(25%, -25%)' }}
                        >
                          <FaCamera className="w-4 h-4 text-gray-600" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                {/* Business Name */}
                <div className="flex justify-between items-center mb-3">
                  <div className="flex flex-col">
                    <div className="flex items-center mb-2">
                      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">{businessName}</h1>
                      {isOwnProfile && (
                        <button
                          onClick={() => setIsEditNameModalOpen(true)}
                          className="ml-2 text-gray-400 hover:text-indigo-600"
                          aria-label="Edit business name"
                        >
                          <FaEdit className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                    <div className="flex items-center mb-2">
                      <h4 className="text-base font-medium text-gray-600 m-0">{businessTagline || <span className="italic text-gray-400">Add a tagline</span>}</h4>
                      {isOwnProfile && (
                        <button
                          onClick={() => setIsEditTaglineModalOpen(true)}
                          className="ml-2 text-gray-400 hover:text-indigo-600"
                          aria-label="Edit tagline"
                        >
                          <FaEdit className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-gray-600 text-sm">
                      <div className="mt-4 flex items-center">
                        <FaBriefcase className="w-4 h-4 mr-1" /> <span>{businessIndustry}</span>
                      </div>
                      <div className="mt-4 flex items-center">
                        <FaMapMarkerAlt className="w-4 h-4 mr-1" /> <span>{businessLocation}</span>
                      </div>
                      <div className="mt-4 flex items-center">
                        <FaGlobe className="w-4 h-4 mr-1" /> <span>{businessWebsite}</span>
                        {isOwnProfile && (
                          <button
                            onClick={() => setIsEditInfoModalOpen(true)}
                            className="ml-2 text-gray-400 hover:text-indigo-600"
                            aria-label="Edit business info"
                          >
                            <FaEdit className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <div className="mt-4">
                        <div className="flex space-x-4 items-center">
                          <a href="https://facebook.com/dummy" target="_blank" rel="noopener noreferrer" className="text-blue-600"><FaFacebook className="h-5 w-5" /></a>
                          <a href="https://x.com/dummy" target="_blank" rel="noopener noreferrer" className="text-black"><FontAwesomeIcon icon={faXTwitter} className="h-5 w-5" /></a>
                          <a href="https://linkedin.com/company/dummy" target="_blank" rel="noopener noreferrer" className="text-blue-700"><FaLinkedin className="h-5 w-5" /></a>
                          <a href="https://instagram.com/dummy" target="_blank" rel="noopener noreferrer" className="text-pink-500"><FaInstagram className="h-5 w-5" /></a>
                          {isOwnProfile && <FaEdit className="text-gray-500 h-5 w-5 cursor-pointer" onClick={() => alert('Edit social media not implemented')} />}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end text-sm text-gray-500 gap-1.5">
                    <div className="flex items-center space-x-3 mb-1">
                      <span className="whitespace-nowrap">{contact.phone || '123-456-7890'}</span> <FaPhone />
                    </div>
                    <div className="flex items-center space-x-3 mb-1">
                      <span className="whitespace-nowrap">{contact.email || 'info@company.com'}</span> <FaEnvelope />
                    </div>
                    <div className="flex items-center space-x-3 mb-1">
                      <span className="whitespace-nowrap">{contact.street}, {contact.city}, {contact.state} {contact.business_zip_code}, {contact.country}</span> <FaMapMarkerAlt />
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="whitespace-nowrap">{business.hours || 'Mon-Fri: 9 AM - 5 PM'}</span> <FaClock />
                    </div>
                  </div>
                </div>

                {/* Edit Tagline Modal */}
                <EditTaglineModal
                  isOpen={isEditTaglineModalOpen}
                  currentTagline={businessTagline}
                  onClose={() => setIsEditTaglineModalOpen(false)}
                  onSave={handleSaveTagline}
                />

                {/* Edit Business Info Modal */}
                <EditBusinessInfoModal
                  isOpen={isEditInfoModalOpen}
                  onClose={() => setIsEditInfoModalOpen(false)}
                  onSave={handleSaveBusinessInfo}
                  currentWebsite={businessWebsite}
                  currentLocation={businessLocation}
                  currentIndustry={businessIndustry}
                />

                {/* Edit Business Name Modal */}
                <EditBusinessNameModal
                  isOpen={isEditNameModalOpen}
                  currentName={businessName}
                  onClose={() => setIsEditNameModalOpen(false)}
                  onSave={handleSaveBusinessName}
                />

                {/* Edit About Modal */}
                <EditAboutModal
                  isOpen={isEditAboutModalOpen}
                  currentDescription={businessDescription}
                  onClose={() => setIsEditAboutModalOpen(false)}
                  onSave={async (desc: string) => {
                    if (!business || !business.id) {
                      console.error('Business ID not found for description update');
                      return;
                    }
                    try {
                      console.log('Sending description update request for businessId:', business.id, 'with description:', desc);
                      const response = await fetch('/api/business/details', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({ businessId: business.id, updates: { description: desc } }),
                      });
                      console.log('API response for description update: status', response.status, 'body:', await response.json());
                      if (response.ok) {
                        setBusinessDescription(desc);
                        await fetchBusiness(); // Re-fetch to ensure latest data
                      } else {
                        console.error('Description update failed with status:', response.status);
                      }
                    } catch (error) {
                      console.error('Error updating description:', error);
                    }
                  }}
                />

                {/* Edit Contact Modal */}
                {isContactModalOpen && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-4 rounded shadow-lg w-96">
                      <h2 className="text-lg font-bold mb-2">Edit Contact</h2>
                      <input key="contact_person-input" type="text" value={editContact.contact_person} onChange={(e) => { const newValue = e.target.value; console.log('Contact Person changed from', editContact.contact_person, 'to', newValue); setEditContact(prev => ({ ...prev, contact_person: newValue })); }} className="border p-2 w-full mb-2" placeholder="Contact Person" />
                      <input key="street-input" type="text" value={editContact.street} onChange={(e) => { const newValue = e.target.value; console.log('Street changed from', editContact.street, 'to', newValue); setEditContact(prev => ({ ...prev, street: newValue })); }} className="border p-2 w-full mb-2" placeholder="Street" />
                      <input key="city-input" type="text" value={editContact.city} onChange={(e) => { const newValue = e.target.value; console.log('City changed from', editContact.city, 'to', newValue); setEditContact(prev => ({ ...prev, city: newValue })); }} className="border p-2 w-full mb-2" placeholder="City" />
                      <input key="state-input" type="text" value={editContact.state} onChange={(e) => { const newValue = e.target.value; console.log('State changed from', editContact.state, 'to', newValue); setEditContact(prev => ({ ...prev, state: newValue })); }} className="border p-2 w-full mb-2" placeholder="State" />
                      <input key="business_zip_code-input" type="text" value={editContact.business_zip_code} onChange={(e) => { const newValue = e.target.value; console.log('Business Zip Code changed from', editContact.business_zip_code, 'to', newValue); setEditContact(prev => ({ ...prev, business_zip_code: newValue })); }} className="border p-2 w-full mb-2" placeholder="Zip/Post Code" />
                      <input key="country-input" type="text" value={editContact.country} onChange={(e) => { const newValue = e.target.value; console.log('Country changed from', editContact.country, 'to', newValue); setEditContact(prev => ({ ...prev, country: newValue })); }} className="border p-2 w-full mb-2" placeholder="Country" />
                      <input key="phone-input" type="text" value={editContact.phone} onChange={(e) => { const newValue = e.target.value; console.log('Phone changed from', editContact.phone, 'to', newValue); setEditContact(prev => ({ ...prev, phone: newValue })); }} className="border p-2 w-full mb-2" placeholder="Phone" />
                      <input key="email-input" type="text" value={editContact.email} onChange={(e) => { const newValue = e.target.value; console.log('Email changed from', editContact.email, 'to', newValue); setEditContact(prev => ({ ...prev, email: newValue })); }} className="border p-2 w-full mb-2" placeholder="Email" />
                      <input key="website-input" type="text" value={editContact.website} onChange={(e) => { const newValue = e.target.value; console.log('Website changed from', editContact.website, 'to', newValue); setEditContact(prev => ({ ...prev, website: newValue })); }} className="border p-2 w-full mb-2" placeholder="Website" />
                      <button onClick={async () => {
                        console.log('Sending contact update to API:', { businessId: business.id, updates: editContact });
                        try {
                          const response = await fetch('/api/business/details', {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            credentials: 'include',
                            body: JSON.stringify({ businessId: business.id, updates: {
                              contact_person: editContact.contact_person, // Added new field
                              business_street: editContact.street,
                              business_city: editContact.city,
                              business_state: editContact.state,
                              business_zip_code: editContact.business_zip_code,
                              business_country: editContact.country,
                              contact_phone: editContact.phone,
                              contact_email: editContact.email,
                              website: editContact.website
                            } })
                          });
                          const responseData = await response.json();
                          console.log('API response for contact save:', responseData);
                          if (response.ok) {
                            setContact(editContact); // Update main contact state
                            await fetchBusiness(); // Sync with server
                            setIsContactModalOpen(false);
                          } else {
                            console.error('Failed to save contact, status:', response.status, 'data:', responseData);
                            alert('Failed to save contact. Please check console for details.');
                          }
                        } catch (error) {
                          console.error('Error during contact save API call:', error);
                          alert('Error saving contact. Please check console for details.');
                        }
                      }} className="bg-blue-500 text-white px-4 py-2 mr-2">Save</button>
                      <button onClick={() => setIsContactModalOpen(false)} className="bg-gray-300 px-4 py-2">Cancel</button>
                    </div>
                  </div>
                )}
                {!isOwnProfile && (
                  <div className="flex flex-wrap gap-4 mt-4">
                    <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
                      Connect
                    </button>
                    <button className="bg-white text-indigo-600 px-4 py-2 rounded-md border border-indigo-600 hover:bg-indigo-50">
                      Follow
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white border-t border-gray-200 shadow-none rounded-xl">
            <div>
              <nav className="flex items-center px-4 py-2 border-b border-gray-200">
                <div className="flex space-x-4 overflow-x-auto flex-nowrap w-full scrollbar-hide">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 ${activeTab === tab.id ? 'text-black font-semibold border-b-2 border-black' : ''}`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </nav>
            </div>
            <div className="p-3 sm:p-4">
              {activeTab === 'posts' && (
                <div>
                  {/* Modern, clean posts feed with likes and replies */}
                  <ProfilePostsFeed profileId={user?.id || business?.id} />
                </div>
              )}
              {activeTab === 'home' && (
                <div>
                  {/* Existing home tab content */}
                  <div className="space-y-3 mb-4">
                    {/* About Us Section */}
                    <div className="bg-white shadow-sm border border-gray-200 rounded-xl p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Overview</h3>
                      <div className="mb-4">
                        <div
                          className={`text-sm text-gray-600 ${showFullHomeDescription ? '' : 'line-clamp-5'} overflow-hidden`}
                          style={{ display: '-webkit-box', WebkitLineClamp: showFullHomeDescription ? 'none' : 5, WebkitBoxOrient: 'vertical' }}
                          dangerouslySetInnerHTML={{ __html: businessDescription || 'No about info yet.' }}
                        />
                        {businessDescription && (
                          <button
                            className="text-sm text-blue-500 hover:underline mt-1"
                            onClick={() => setShowFullHomeDescription(v => !v)}
                          >
                            {showFullHomeDescription ? 'View less' : 'View more'}
                          </button>
                        )}
                      </div>
                    </div>
                    {/* Updates Section - Now showing actual posts */}
                    <div className="bg-white shadow-sm border border-gray-200 rounded-xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-900">Recent Updates</h3>
                        <button 
                          onClick={() => setActiveTab('posts')}
                          className="text-sm text-blue-600 hover:underline"
                        >
                          View all
                        </button>
                      </div>
                      
                      {loadingPosts ? (
                        <div className="flex justify-center py-4">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        </div>
                      ) : postError ? (
                        <div className="text-red-500 text-center py-4">{postError}</div>
                      ) : posts.length === 0 ? (
                        <div className="text-gray-500 text-center py-4">
                          <p>No posts yet. Create your first post in the Posts tab!</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {posts.slice(0, 8).map((post) => (
                            <div key={post.id} className="border border-gray-200 rounded-xl shadow-sm bg-white overflow-hidden flex flex-col h-full">
                              {/* Post Header - Compact */}
                              <div className="p-3 border-b">
                                <div className="flex items-center space-x-2">
                                  <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
                                    <Image 
                                      src={business.logo || '/default-logo.png'} 
                                      alt="Business Logo" 
                                      width={24} 
                                      height={24} 
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <div className="truncate">
                                    <p className="font-medium text-sm truncate">{business.name}</p>
                                    <p className="text-xs text-gray-500 truncate">
                                      {new Date(post.created_at).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Post Content - Compact */}
                              <div className="p-3 flex-grow">
                                <div 
                                  className="text-sm line-clamp-3 overflow-hidden" 
                                  dangerouslySetInnerHTML={{ __html: post.content }}
                                />
                              </div>
                              
                              {/* Post Media - Compact */}
                              {post.media && post.media.length > 0 && (
                                <div className="w-full aspect-square overflow-hidden">
                                  {post.media[0].media_type === 'image' ? (
                                    <img 
                                      src={post.media[0].media_url} 
                                      alt="Post media" 
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        e.currentTarget.src = '/default-image.png';
                                      }}
                                    />
                                  ) : post.media[0].media_type === 'video' ? (
                                    <video 
                                      src={post.media[0].media_url} 
                                      className="w-full h-full object-cover" 
                                      controls 
                                    />
                                  ) : null}
                                  
                                  {post.media.length > 1 && (
                                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-full">
                                      +{post.media.length - 1}
                                    </div>
                                  )}
                                </div>
                              )}
                              
                              {/* Post Actions - Compact */}
                              <div className="p-2 border-t flex justify-between items-center">
                                <div className="flex space-x-2 text-xs">
                                  <button className="text-gray-500 hover:text-blue-500">
                                    <FaThumbsUp className="inline mr-1" size={12} /> {post.likes_count || 0}
                                  </button>
                                  <button 
                                    className={`text-gray-400 flex items-center hover:text-blue-500 transition-colors ${activeCommentPostId === post.id ? 'text-blue-600' : ''}`}
                                    onClick={() => handleOpenComments(post.id)}
                                    aria-label="Show comments"
                                  >
                                    <FaComment className="inline mr-1" size={12} /> {post.comments_count || 0}
                                  </button>
                                </div>
                                <button 
                                  onClick={() => setActiveTab('posts')}
                                  className="text-xs text-blue-500 hover:underline"
                                >
                                  View
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    {/* Featured Products Section */}
                    <div className="bg-white shadow-sm border border-gray-200 rounded-xl p-6 mt-6">
                      <h2 className="text-lg font-semibold mb-4">Featured Products</h2>
                      <ProductCards businessId={business.id} limit={4} />
                      <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('products'); }} className="text-blue-600 hover:underline mt-2 inline-block">View more</a>
                    </div>
                  </div>
                </div>
              )}
              {activeTab === 'about' && (
                <div>
                  <div className="flex items-center">
                    <h2 className="text-xl font-semibold text-gray-800">Overview</h2>
                    {isOwnProfile && (
                      <button
                        onClick={() => setIsEditAboutModalOpen(true)}
                        className="ml-2 text-gray-400 hover:text-indigo-600"
                        aria-label="Edit about section"
                      >
                        <FaEdit className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 mt-2" dangerouslySetInnerHTML={{ __html: businessDescription || 'No about info yet.' }} />
                </div>
              )}
              {activeTab === 'posts' && (
                <div>
                  {isOwnProfile && (
                    <>
                      <div className="flex items-center space-x-4 p-2">
                        <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                          <Image 
                            src={business.logo || '/default-logo.png'} 
                            alt="Business Logo" 
                            width={40} 
                            height={40}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <input 
                          type="text" 
                          placeholder="Start a post" 
                          className="w-full p-2 border rounded-2xl" 
                          onClick={() => {
                            // Reset edit state when starting a new post
                            setPostToEdit(null);
                            setNewPostContent('');
                            setExistingMedia([]);
                            mediaPreviewUrls.forEach(url => URL.revokeObjectURL(url));
                            setSelectedMedia([]);
                            setMediaPreviewUrls([]);
                            setIsPostModalOpen(true);
                          }} 
                          readOnly 
                        />
                      </div>
                      <div className="flex space-x-4 p-2">
                        <button className="flex items-center space-x-2 text-gray-600 hover:bg-gray-100 p-2 rounded-md">
                          <FaVideo className="text-red-500" /> <span>Video</span>
                        </button>
                        <button className="flex items-center space-x-2 text-gray-600 hover:bg-gray-100 p-2 rounded-md">
                          <FaCamera className="text-blue-500" /> <span>Photo</span>
                        </button>
                        <button className="flex items-center space-x-2 text-gray-600 hover:bg-gray-100 p-2 rounded-md">
                          <FaPen className="text-green-500" /> <span>Write article</span>
                        </button>
                      </div>
                      <hr className="border-t border-gray-300 my-4 w-full" />
                    </>
                  )}
                  
                  {/* Posts List */}
                  {loadingPosts ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                  ) : postError ? (
                    <div className="text-red-500 text-center py-4">{postError}</div>
                  ) : posts.length === 0 ? (
                    <div className="text-gray-500 text-center py-8">
                      <p>No posts yet. Be the first to post!</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {posts.map((post) => (
                        <div key={post.id} className="p-3 border rounded-lg shadow-sm bg-white">
                          {/* Post Header */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                                <Image 
                                  src={business.logo || '/default-logo.png'} 
                                  alt="Post User" 
                                  width={40} 
                                  height={40}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div>
                                <p className="font-semibold">{business.name}</p>
                                <p className="text-sm text-gray-500">
                                  {new Date(post.created_at).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </div>
                            </div>
                            {isOwnProfile && (
                              <div className="flex space-x-2">
                                <button 
                                  onClick={() => handleEditPost(post)} 
                                  className="text-green-500 hover:text-green-700 p-1"
                                  aria-label="Edit post"
                                >
                                  <FaEdit size={16} />
                                </button>
                                <button 
                                  onClick={() => handleDeletePost(post.id)} 
                                  className="text-red-500 hover:text-red-700 p-1"
                                  aria-label="Delete post"
                                  disabled={postToDelete === post.id}
                                >
                                  {postToDelete === post.id ? (
                                    <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                                  ) : (
                                    <FaTrash size={16} />
                                  )}
                                </button>
                              </div>
                            )}
                          </div>
                          
                          {/* Post Content */}
                          <div className="mt-2 text-gray-800" dangerouslySetInnerHTML={{ __html: post.content }} />
                          
                          {/* Post Media */}
                          {post.media && post.media.length > 0 && (
                            <div className="mt-3">
                              <div className={`grid ${post.media.length > 1 ? 'grid-cols-2' : 'grid-cols-1'} gap-2`}>
                                {post.media.map((media, index) => (
                                  <div key={media.id} className="relative overflow-hidden rounded border">
                                    {media.media_type === 'image' ? (
                                      <img 
                                        src={media.media_url} 
                                        alt="Post media" 
                                        className="w-full object-cover" 
                                        style={{ maxHeight: '300px' }}
                                        onError={(e) => {
                                          // If the image fails to load, show a placeholder
                                          e.currentTarget.src = '/default-image.png';
                                          console.error('Image failed to load:', media.media_url);
                                        }}
                                      />
                                    ) : media.media_type === 'video' ? (
                                      <video 
                                        src={media.media_url} 
                                        controls 
                                        className="w-full" 
                                        style={{ maxHeight: '300px' }}
                                        onError={(e) => {
                                          // Log video loading errors
                                          console.error('Video failed to load:', media.media_url);
                                        }}
                                      />
                                    ) : null}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Post Actions */}
                          <div className="flex justify-between mt-4 text-gray-600 border-t pt-3">
                            <button 
                              className={`flex items-center space-x-1 px-4 py-2 rounded-md transition-colors ${post.liked ? 'text-blue-600 bg-blue-50' : 'hover:bg-gray-100'}`}
                              onClick={() => handleLikePost(post.id)}
                            >
                              <FaThumbsUp className={post.liked ? 'text-blue-600' : 'text-blue-500'} size={18} /> 
                              <span>Like{post.likes_count > 0 && ` (${post.likes_count})`}</span>
                            </button>
                            <button 
                              className={`flex items-center space-x-1 px-4 py-2 rounded-md transition-colors ${activeCommentPostId === post.id ? 'text-blue-600 bg-blue-50' : 'hover:bg-gray-100'}`}
                              onClick={() => handleOpenComments(post.id)}
                              aria-label="Show comments"
                            >
                              <FaComment size={18} /> 
                              <span>Comment{post.comments_count > 0 && ` (${post.comments_count})`}</span>
                            </button>
                            <button 
                              className="flex items-center space-x-1 px-4 py-2 rounded-md hover:bg-gray-100 transition-colors"
                              onClick={() => handleSharePost(post.id)}
                            >
                              <FaShare className="text-purple-500" size={18} /> 
                              <span>Share</span>
                            </button>
                          </div>
                          
                          {/* Comments Section */}
                          {activeCommentPostId === post.id && (
                            <div className="mt-4 border-t pt-4">
                              {/* Comment Input */}
                              <div className="mt-4 flex items-start gap-3">
                                <div className="flex-shrink-0">
                                  <div className="relative w-9 h-9 overflow-hidden rounded-full border-2 border-background bg-background shadow-sm">
                                    <Image
  src={sessionBusiness?.logo || '/default-logo.png'}
  alt={sessionBusiness?.name || 'Business Logo'}
  width={36}
  height={36}
  className="h-full w-full object-cover"
  onError={(e) => {
    const target = e.target as HTMLImageElement;
    target.src = '/default-logo.png';
  }}
/>
                                  </div>
                                </div>
                                <div className="relative flex-1 min-w-0">
                                  <div className="relative">
                                    <input
                                      type="text"
                                      id={`comment-input-${post.id}`}
                                      placeholder="Write a comment..."
                                      value={commentText}
                                      onChange={(e) => setCommentText(e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                          e.preventDefault();
                                          handleAddComment(post.id);
                                        }
                                      }}
                                      className="block w-full pl-4 pr-12 py-2.5 text-sm rounded-full bg-muted/50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors duration-200 outline-none"
                                      disabled={isSubmittingComment}
                                    />
                                    <button
                                      onClick={() => handleAddComment(post.id)}
                                      disabled={!commentText.trim() || isSubmittingComment}
                                      className={`absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full transition-colors ${
                                        !commentText.trim() || isSubmittingComment
                                          ? 'text-muted-foreground/50 cursor-not-allowed'
                                          : 'text-primary hover:bg-primary/10'
                                      }`}
                                      aria-label="Post comment"
                                    >
                                      {isSubmittingComment ? (
                                        <svg 
                                          className="h-4 w-4 animate-spin" 
                                          xmlns="http://www.w3.org/2000/svg" 
                                          fill="none" 
                                          viewBox="0 0 24 24"
                                        >
                                          <circle 
                                            className="opacity-25" 
                                            cx="12" 
                                            cy="12" 
                                            r="10" 
                                            stroke="currentColor" 
                                            strokeWidth="4"
                                          ></circle>
                                          <path 
                                            className="opacity-75" 
                                            fill="currentColor" 
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                          ></path>
                                        </svg>
                                      ) : (
                                        <svg 
                                          xmlns="http://www.w3.org/2000/svg" 
                                          className="h-4 w-4" 
                                          viewBox="0 0 20 20" 
                                          fill="currentColor"
                                        >
                                          <path 
                                            fillRule="evenodd" 
                                            d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" 
                                            clipRule="evenodd" 
                                          />
                                        </svg>
                                      )}
                                    </button>
                                  </div>
                                  
                                  {commentError && (
                                    <div className="text-red-500 text-xs mt-1 animate-fade-in">
                                      {commentError}
                                    </div>
                                  )}
                                  
                                  {!session?.user?.id && (
                                    <p className="text-xs text-gray-500 mt-1">
                                      Please sign in to leave a comment.
                                    </p>
                                  )}
                                </div>
                              </div>
                              
                              {/* Comments List */}
                              <div className="max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 dark:hover:scrollbar-thumb-gray-500 scrollbar-track-transparent scrollbar-thumb-rounded-full">
                                {loadingComments ? (
                                  <div className="flex flex-col items-center justify-center py-8 space-y-3">
                                    <div className="relative">
                                      <div className="w-8 h-8 border-2 border-blue-500/30 rounded-full"></div>
                                      <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-blue-500 rounded-full animate-spin"></div>
                                    </div>
                                    <p className="text-sm text-muted-foreground">Loading comments...</p>
                                  </div>
                                ) : commentError ? (
                                  <div className="text-center py-8 px-4 animate-fade-in">
                                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 mb-3">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                      </svg>
                                    </div>
                                    <h4 className="text-lg font-medium text-foreground mb-1">Error loading comments</h4>
                                    <p className="text-muted-foreground text-sm mb-4 max-w-md mx-auto">{commentError}</p>
                                    <button 
                                      onClick={() => handleOpenComments(post.id)}
                                      className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                      </svg>
                                      Try again
                                    </button>
                                  </div>
                                ) : currentPostComments.length > 0 ? (
                                  <div className="space-y-4">
                                    {currentPostComments.map((comment) => (
                                      <div 
                                        key={comment.id} 
                                        className="group relative transition-all duration-200 hover:bg-muted/50 rounded-lg p-2 -mx-2"
                                      >
                                        <div className="flex items-start gap-3">
                                          <div className="flex-shrink-0">
                                            <div className="relative w-8 h-8 overflow-hidden rounded-full border-2 border-background bg-background shadow-sm">
                                              <Image 
                                                src={comment.user_logo || '/default-logo.png'} 
                                                alt={comment.user_name || 'Business Logo'} 
                                                width={32}
                                                height={32}
                                                className="h-full w-full object-cover"
                                                onError={(e) => {
                                                  const target = e.target as HTMLImageElement;
                                                  target.src = '/default-logo.png';
                                                }}
                                              />
                                            </div>
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <div className="bg-muted/30 rounded-lg p-3 transition-colors duration-200 group-hover:bg-muted/50">
                                              <div className="flex items-start justify-between gap-2">
                                                <div className="flex-1 min-w-0">
                                                  <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium text-foreground truncate">
                                                      {comment.user_name || 'Anonymous'}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                                                      {new Date(comment.created_at).toLocaleString(undefined, {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                      })}
                                                    </span>
                                                  </div>
                                                  <p className="mt-1 text-sm text-foreground/90 leading-relaxed">
                                                    {comment.content}
                                                  </p>
                                                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                                    <button 
                                                      onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleLikeComment(comment.id);
                                                      }}
                                                      className={`flex items-center gap-1 hover:text-blue-500 transition-colors ${comment.liked_by_user ? 'text-blue-500' : ''}`}
                                                      aria-label={comment.liked_by_user ? 'Unlike comment' : 'Like comment'}
                                                    >
                                                      <FaThumbsUp className="w-3 h-3" />
                                                      <span>{comment.likes_count || 0}</span>
                                                    </button>
                                                    <button 
                                                      onClick={(e) => {
                                                        e.stopPropagation();
                                                        // Handle reply functionality here
                                                      }}
                                                      className="flex items-center gap-1 hover:text-green-500 transition-colors"
                                                    >
                                                      <FaReply className="w-3 h-3" />
                                                      <span>Reply</span>
                                                    </button>
                                                  </div>
                                                </div>
                                                {String(comment.user_id) === String(session?.user?.id) && (
                                                   <button 
                                                     onClick={() => handleDeleteComment(comment.id, post.id)}
                                                     className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity duration-200 p-1 -mt-1 -mr-1 rounded-full hover:bg-muted"
                                                     aria-label="Delete comment"
                                                   >
                                                     <svg 
                                                       xmlns="http://www.w3.org/2000/svg" 
                                                       width="16" 
                                                       height="16" 
                                                       viewBox="0 0 24 24" 
                                                       fill="none" 
                                                       stroke="currentColor" 
                                                       strokeWidth="2" 
                                                       strokeLinecap="round" 
                                                       strokeLinejoin="round"
                                                     >
                                                       <path d="M3 6h18"></path>
                                                       <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                                                       <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                                                       <line x1="10" y1="11" x2="10" y2="17"></line>
                                                       <line x1="14" y1="11" x2="14" y2="17"></line>
                                                     </svg>
                                                   </button>
                                                 )}
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="text-center py-6">
                                    <p className="text-gray-500">No comments yet. Be the first to comment!</p>
                                    {!session?.user?.id && (
                                      <p className="text-sm text-gray-400 mt-1">Sign in to leave a comment</p>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                          
                          {/* Share Modal */}
                          {shareModalPostId === post.id && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                              <div className="bg-white rounded-lg p-6 w-96 max-w-full relative">
                                <h3 className="text-lg font-semibold mb-4">Share this post</h3>
                                <div className="flex justify-around mb-6">
                                  <button 
                                    onClick={() => handleShareToSocial(post.id, 'facebook')} 
                                    className="p-3 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200"
                                  >
                                    <FaFacebook size={24} />
                                  </button>
                                  <button 
                                    onClick={() => handleShareToSocial(post.id, 'twitter')} 
                                    className="p-3 rounded-full bg-blue-100 text-blue-400 hover:bg-blue-200"
                                  >
                                    <FontAwesomeIcon icon={faXTwitter} size="lg" />
                                  </button>
                                  <button 
                                    onClick={() => handleShareToSocial(post.id, 'linkedin')} 
                                    className="p-3 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200"
                                  >
                                    <FaLinkedin size={24} />
                                  </button>
                                  <button 
                                    onClick={() => handleShareToSocial(post.id, 'email')} 
                                    className="p-3 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
                                  >
                                    <FaEnvelope size={24} />
                                  </button>
                                </div>
                                <div className="mb-4">
                                  <p className="text-sm text-gray-600 mb-2">Or copy link</p>
                                  <div className="flex">
                                    <input 
                                      type="text" 
                                      value={`${window.location.origin}/${business.id}/post/${post.id}`} 
                                      readOnly 
                                      className="flex-1 border rounded-l-md px-3 py-2 bg-gray-50"
                                    />
                                    <button 
                                      onClick={() => {
                                        navigator.clipboard.writeText(`${window.location.origin}/${business.id}/post/${post.id}`);
                                        alert('Link copied to clipboard!');
                                      }} 
                                      className="bg-blue-500 text-white px-4 py-2 rounded-r-md hover:bg-blue-600"
                                    >
                                      Copy
                                    </button>
                                  </div>
                                </div>
                                {/* Cross icon for closing modal */}
                                <button
                                  onClick={() => setShareModalPostId(null)}
                                  className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 p-2 rounded-full z-20"
                                  style={{ lineHeight: 0 }}
                                  aria-label="Close share modal"
                                >
                                  <FaTimes size={22} />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {activeTab === 'products' && (
                <div>
                  <div className="flex items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">Products/Services</h2>
                    {isOwnProfile && (
                      <button
                        onClick={() => router.push('/products') }
                        className="ml-2 text-gray-400 hover:text-indigo-600"
                        aria-label="Edit products/services"
                      >
                        <FaEdit className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <ProductCards businessId={business.id} />
                </div>
              )}
              {activeTab === 'people' && (
                <div>
                  <div className="flex items-center">
                    <h2 className="text-xl font-semibold text-gray-800">People</h2>
                    {isOwnProfile && <EditButton onClick={() => {}} />}
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">{user.full_name || user.username} - Owner</p>
                    {business.contact_person_name && (
                      <p className="text-sm text-gray-600">{business.contact_person_name} - Contact</p>
                    )}
                  </div>
                </div>
              )}
              {activeTab === 'contact' && (
                <div>
                  <div className="space-y-3">
                    <div className="p-6 border border-gray-200 rounded-xl shadow-sm">
                      <h3 className="text-lg font-semibold mb-2 flex items-center">
                        Contact Details
                        {isOwnProfile && (
                          <button
                            onClick={() => { console.log('Opening contact modal, copying current contact:', contact); setEditContact({ ...contact }); setIsContactModalOpen(true); }}
                            className="ml-2 text-gray-500 hover:text-blue-500"
                            aria-label="Edit Contact"
                          >
                            <FaEdit />
                          </button>
                        )}
                      </h3>
                      {business.contact_person_name && (
                        <p className="text-sm text-gray-600 flex items-center mb-1">
                          <FaUser className="mr-1" /> Contact Person: {business.contact_person_name}
                        </p>
                      )}
                      <p className="text-sm text-gray-600 flex items-center space-x-3 mb-1">
                        <FaMapMarkerAlt />
                        <span className="whitespace-nowrap">{contact.street}, {contact.city}, {contact.state} {contact.business_zip_code}, {contact.country}</span>
                      </p>
                      <p className="text-sm text-gray-600 flex items-center space-x-3 mb-1">
                        <FaPhone />
                        <span className="whitespace-nowrap">{contact.phone}</span>
                      </p>
                      <p className="text-sm text-gray-600 flex items-center space-x-3 mb-1">
                        <FaEnvelope />
                        <span className="whitespace-nowrap">{contact.email}</span>
                      </p>
                      <p className="text-sm text-gray-600 flex items-center space-x-3">
                        <FaGlobe />
                        <span className="whitespace-nowrap">{contact.website}</span>
                      </p>
                    </div>
                    <div className="p-4 border rounded shadow-md mt-4">
                      <h3 className="text-lg font-semibold mb-2">Location</h3>
                      <iframe
                        width="100%"
                        height="300"
                        style={{ border: 0 }}
                        loading="lazy"
                        allowFullScreen
                        src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(`${contact.street}, ${contact.city}, ${contact.state}, ${contact.business_zip_code}, ${contact.country}`)}`}
                      ></iframe>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-md mt-6 border border-gray-300">
                      <h3 className="text-lg font-semibold mb-2">Trading Hours</h3>
                      <ul className="list-disc pl-5 text-sm text-gray-600">
                        <li>Monday: 9:00 AM - 5:00 PM</li>
                        <li>Tuesday: 9:00 AM - 5:00 PM</li>
                        <li>Wednesday: 9:00 AM - 5:00 PM</li>
                        <li>Thursday: 9:00 AM - 5:00 PM</li>
                        <li>Friday: 9:00 AM - 5:00 PM</li>
                        <li>Saturday: Closed</li>
                        <li>Sunday: Closed</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Image Upload Modals */}
          {isLogoModalOpen && (
            <ImageUploadModal
              isOpen={isLogoModalOpen}
              onClose={() => setIsLogoModalOpen(false)}
              onUpload={handleLogoUpload}
              currentImage={business.logo}
              title="Update Logo"
              userId={user.id}
            />
          )}
          {isBackgroundModalOpen && (
            <ImageUploadModal
              isOpen={isBackgroundModalOpen}
              onClose={() => setIsBackgroundModalOpen(false)}
              onUpload={handleBackgroundUpload}
              currentImage={business.background_image}
              title="Update Background"
              userId={user.id}
            />
          )}
          {isPostModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl">
                {/* Header */}
                <div className="flex justify-between items-center border-b p-4">
                  <h2 className="text-xl font-bold">{postToEdit ? 'Edit Post' : 'Create New Post'}</h2>
                  <button 
                    onClick={() => {
                      setIsPostModalOpen(false);
                      setNewPostContent('');
                      
                      setPostToEdit(null);
                      // Clean up media previews and tracking
                      mediaPreviewUrls.forEach(url => URL.revokeObjectURL(url));
                      setSelectedMedia([]);
                      setMediaPreviewUrls([]);
                      setExistingMedia([]);
                      setMediaToDelete([]);
                    }} 
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <FaTimes size={20} />
                  </button>
                </div>
                
                {/* Business Info */}
                <div className="flex items-start space-x-3 p-4 border-t">
                  <div className="flex-shrink-0">
                    <Image
                      src={business.logo || '/default-logo.png'}
                      alt={business.name || 'Business'}
                      width={40}
                      height={40}
                      className="rounded-full h-10 w-10 object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-semibold">{business.name}</p>
                    <p className="text-sm text-gray-500">Creating a post</p>
                  </div>
                </div>
                
                {/* Rich Text Editor */}
                <div className="px-4 pb-2">
                  <ReactQuill
                    theme="snow"
                    value={newPostContent}
                    onChange={setNewPostContent}
                    placeholder="What's on your mind?"
                    className="h-40 mb-10" // Extra bottom margin for Quill toolbar
                    modules={{
                      toolbar: [
                        ['bold', 'italic', 'underline'],
                        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                        ['link'],
                        ['clean']
                      ]
                    }}
                  />
                </div>
                
                {/* Media Preview */}
                {(mediaPreviewUrls.length > 0 || existingMedia.length > 0) && (
                  <div className="px-4 pb-4">
                    <p className="text-sm font-medium mb-2">Media Attachments</p>
                    <div className="grid grid-cols-3 gap-2">
                      {/* New media being uploaded */}
                      {mediaPreviewUrls.map((url, index) => (
                        <div key={`new-${index}`} className="relative group">
                          <div className="aspect-square overflow-hidden rounded border">
                            {selectedMedia[index]?.type.startsWith('image') ? (
                              <img src={url} alt="Preview" className="w-full h-full object-cover" />
                            ) : selectedMedia[index]?.type.startsWith('video') ? (
                              <video src={url} className="w-full h-full object-cover" controls />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                <span className="text-sm text-gray-500">File: {selectedMedia[index]?.name}</span>
                              </div>
                            )}
                          </div>
                          <button 
                            onClick={() => removeMedia(index)}
                            className="absolute top-1 right-1 bg-gray-800 bg-opacity-70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <FaTimes size={12} />
                          </button>
                        </div>
                      ))}
                      
                      {/* Existing media when editing */}
                      {existingMedia.map((media, index) => (
                        <div key={`existing-${media.id}`} className="relative group">
                          <div className="aspect-square overflow-hidden rounded border">
                            {media.media_type === 'image' ? (
                              <img 
                                src={media.media_url} 
                                alt="Existing media" 
                                className="w-full h-full object-cover" 
                                onError={(e) => {
                                  e.currentTarget.src = '/default-image.png';
                                }}
                              />
                            ) : media.media_type === 'video' ? (
                              <video 
                                src={media.media_url} 
                                className="w-full h-full object-cover" 
                                controls 
                              />
                            ) : null}
                          </div>
                          <button 
                            onClick={() => {
                              // Track the media ID to be deleted on the server
                              setMediaToDelete(prev => [...prev, media.id]);
                              // Remove from UI
                              setExistingMedia(prev => prev.filter((_, i) => i !== index));
                            }}
                            className="absolute top-1 right-1 bg-gray-800 bg-opacity-70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <FaTimes size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Media Upload and Post Buttons */}
                <div className="border-t p-4 flex flex-wrap items-center justify-between">
                  <div className="flex space-x-4 items-center">
                    <label className="flex items-center space-x-2 text-gray-600 hover:bg-gray-100 p-2 rounded-md cursor-pointer">
                      <FaImage className="text-green-500" />
                      <span>Photo</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        multiple 
                        onChange={handleMediaUpload} 
                        className="hidden" 
                      />
                    </label>
                    <label className="flex items-center space-x-2 text-gray-600 hover:bg-gray-100 p-2 rounded-md cursor-pointer">
                      <FaVideo className="text-red-500" />
                      <span>Video</span>
                      <input 
                        type="file" 
                        accept="video/*" 
                        multiple 
                        onChange={handleMediaUpload} 
                        className="hidden" 
                      />
                    </label>
                  </div>
                  <button 
                    onClick={handleSavePost} 
                    disabled={isSubmitting || ((!newPostContent || newPostContent === '<p><br></p>') && selectedMedia.length === 0)}
                    className={`px-6 py-2 rounded-md flex items-center justify-center min-w-[80px] ${((!newPostContent || newPostContent === '<p><br></p>') && selectedMedia.length === 0) ? 'bg-gray-300 text-gray-500' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : postToEdit ? 'Update' : 'Post'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar (Right) */}
        <aside className="col-span-12 md:col-span-4 lg:col-span-3 space-y-3">
          {/* Removed Updates & Insights section as per user request */}
        </aside>
      </div>
    </div>
  );
}