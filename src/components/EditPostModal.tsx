import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { editPost } from '../services/postService';
import type { Post } from '../services/postService';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from './LoadingSpinner';

interface EditPostModalProps {
  post: Post;
  onClose: () => void;
  onUpdate: () => void;
}

export default function EditPostModal({ post, onClose, onUpdate }: EditPostModalProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState(post.title);
  const [description, setDescription] = useState(post.description);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    try {
      await editPost(post.id, user.uid, { title, description });
      toast.success('Post updated successfully');
      onUpdate();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update post');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="relative w-full max-w-2xl mx-auto px-4">
        <div className="bg-gray-900 rounded-xl shadow-xl">
          <div className="p-4 border-b border-cyan-500/20 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-cyan-100">Edit Post</h2>
            <button
              onClick={onClose}
              className="p-2 text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-cyan-300 mb-1">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 bg-white/5 border border-cyan-500/20 rounded-lg text-cyan-100 placeholder-cyan-300/30"
                placeholder="Your post title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-cyan-300 mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 bg-white/5 border border-cyan-500/20 rounded-lg text-cyan-100 placeholder-cyan-300/30 h-32 resize-none"
                placeholder="Describe your post... Use #tags to categorize"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-2 bg-cyan-500 text-gray-900 rounded-lg hover:bg-cyan-400 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  <span>Update Post</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}