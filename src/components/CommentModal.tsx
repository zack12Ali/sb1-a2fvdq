import React, { useState, useEffect } from 'react';
import { X, Send } from 'lucide-react';
import { format } from 'date-fns';
import { addComment, getComments, type Comment } from '../services/postService';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from './LoadingSpinner';
import { toast } from 'react-hot-toast';

interface CommentModalProps {
  postId: string;
  onClose: () => void;
  onUpdate: () => void;
}

export default function CommentModal({ postId, onClose, onUpdate }: CommentModalProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadComments();
  }, [postId]);

  const loadComments = async () => {
    try {
      const fetchedComments = await getComments(postId);
      setComments(fetchedComments);
    } catch (error) {
      toast.error('Failed to load comments');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await addComment(postId, user.uid, newComment.trim());
      setNewComment('');
      loadComments();
      onUpdate();
    } catch (error) {
      toast.error('Failed to add comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center overflow-y-auto">
      <div className="relative w-full max-w-2xl mx-auto my-8 px-4">
        <div className="bg-gray-900 rounded-xl shadow-xl">
          <div className="p-4 border-b border-cyan-500/20 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-cyan-100">Comments</h2>
            <button
              onClick={onClose}
              className="p-2 text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-4">
                <LoadingSpinner size="lg" />
              </div>
            ) : comments.length === 0 ? (
              <p className="text-center text-cyan-300/70">No comments yet. Be the first to comment!</p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="bg-white/5 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-cyan-500/20 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-cyan-400">
                        {comment.authorId.slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-cyan-100">
                        User {comment.authorId.slice(0, 8)}
                      </p>
                      <p className="text-xs text-cyan-300/70">
                        {format(comment.createdAt.toDate(), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                  </div>
                  <p className="text-cyan-100 pl-11">{comment.content}</p>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleSubmit} className="p-4 border-t border-cyan-500/20">
            <div className="flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 px-4 py-2 bg-white/5 border border-cyan-500/20 rounded-lg text-cyan-100 placeholder-cyan-300/30"
                disabled={isSubmitting}
              />
              <button
                type="submit"
                disabled={isSubmitting || !newComment.trim()}
                className="px-4 py-2 bg-cyan-500 text-gray-900 rounded-lg hover:bg-cyan-400 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}