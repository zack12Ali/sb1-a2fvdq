import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { getPosts } from '../services/postService';
import type { Post } from '../services/postService';
import CreatePost from '../components/CreatePost';
import PostCard from '../components/PostCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { Plus } from 'lucide-react';

export default function Community() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreatePost, setShowCreatePost] = useState(false);

  const loadPosts = async () => {
    try {
      const fetchedPosts = await getPosts();
      setPosts(fetchedPosts);
    } catch (error) {
      toast.error('Failed to load posts');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handlePostCreated = () => {
    loadPosts();
    setShowCreatePost(false);
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-cyan-300/70">Loading posts...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-cyan-200 text-transparent bg-clip-text">
          Startup Community
        </h1>
        <button
          onClick={() => setShowCreatePost(true)}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-gray-900 rounded-lg hover:bg-cyan-400 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Post
        </button>
      </div>

      {showCreatePost && (
        <CreatePost onPostCreated={handlePostCreated} />
      )}

      <div className="space-y-6">
        {posts.length === 0 ? (
          <div className="text-center py-8 text-cyan-300/70">
            No posts yet. Be the first to share your startup idea!
          </div>
        ) : (
          posts.map((post) => (
            <PostCard 
              key={post.id} 
              post={post} 
              onUpdate={loadPosts}
            />
          ))
        )}
      </div>
    </div>
  );
}