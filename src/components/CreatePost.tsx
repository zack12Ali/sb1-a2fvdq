import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { createPost } from '../services/postService';
import LoadingSpinner from './LoadingSpinner';
import { useAuth } from '../hooks/useAuth';

interface CreatePostProps {
  onPostCreated: () => void;
}

export default function CreatePost({ onPostCreated }: CreatePostProps) {
  const { user } = useAuth();
  const [isPosting, setIsPosting] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '',
    description: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please sign in to create a post');
      return;
    }

    if (!newPost.title.trim() || !newPost.description.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsPosting(true);
    try {
      await createPost({
        ...newPost,
        authorName: user.displayName || 'Anonymous',
        authorPhotoURL: user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || 'A'}&background=0D9488&color=fff`
      }, user.uid);
      toast.success('Post created successfully!');
      setNewPost({ title: '', description: '' });
      onPostCreated();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create post');
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
      <h2 className="text-xl font-semibold text-cyan-100 mb-4">Share Your Startup Idea</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            placeholder="Your Startup Title"
            className="w-full px-4 py-2 bg-white/5 border border-cyan-500/20 rounded-lg text-cyan-100 placeholder-cyan-300/30"
            value={newPost.title}
            onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
            disabled={isPosting}
            required
          />
        </div>
        <div>
          <textarea
            placeholder="Describe your startup idea... Use #tags to categorize"
            className="w-full h-32 px-4 py-2 bg-white/5 border border-cyan-500/20 rounded-lg text-cyan-100 placeholder-cyan-300/30 resize-none"
            value={newPost.description}
            onChange={(e) => setNewPost(prev => ({ ...prev, description: e.target.value }))}
            disabled={isPosting}
            required
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2 bg-cyan-500 text-gray-900 rounded-lg hover:bg-cyan-400 transition-colors disabled:opacity-50"
            disabled={isPosting}
          >
            {isPosting ? (
              <>
                <LoadingSpinner size="sm" />
                <span>Creating Post...</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>Post Idea</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}