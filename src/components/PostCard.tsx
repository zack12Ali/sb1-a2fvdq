import React, { useState } from 'react';
import { MessageSquare, Heart, Share2, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import type { Post } from '../services/postService';
import { likePost, deletePost } from '../services/postService';
import CommentModal from './CommentModal';
import ShareModal from './ShareModal';
import EditPostModal from './EditPostModal';

interface PostCardProps {
  post: Post;
  onUpdate: () => void;
}

export default function PostCard({ post, onUpdate }: PostCardProps) {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(post.likedBy?.includes(user?.uid || ''));
  const [showComments, setShowComments] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleLike = async () => {
    if (!user) {
      toast.error('Please sign in to like posts');
      return;
    }

    try {
      const newLikedState = await likePost(post.id, user.uid);
      setIsLiked(newLikedState);
      onUpdate();
    } catch (error) {
      toast.error('Failed to like post');
    }
  };

  const handleDelete = async () => {
    if (!user) return;

    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await deletePost(post.id, user.uid);
        toast.success('Post deleted successfully');
        onUpdate();
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete post');
      }
    }
  };

  const isAuthor = user?.uid === post.authorId;

  return (
    <>
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-cover bg-center" style={{
              backgroundImage: `url(${post.authorPhotoURL || `https://ui-avatars.com/api/?name=${post.authorName || 'A'}&background=0D9488&color=fff`})`
            }} />
            <div>
              <h3 className="font-semibold text-cyan-100">{post.authorName || 'Anonymous'}</h3>
              <p className="text-sm text-cyan-300/70">
                {post.createdAt?.toDate ? format(post.createdAt.toDate(), 'MMM d, yyyy') : 'Just now'}
              </p>
            </div>
          </div>

          {isAuthor && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 text-cyan-400 hover:text-cyan-300 transition-colors rounded-lg hover:bg-white/5"
              >
                <MoreVertical className="w-5 h-5" />
              </button>

              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-900 rounded-lg shadow-lg py-1 border border-cyan-500/20">
                  <button
                    onClick={() => {
                      setShowEdit(true);
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-cyan-100 hover:bg-white/5 flex items-center gap-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit Post
                  </button>
                  <button
                    onClick={() => {
                      handleDelete();
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-red-400 hover:bg-white/5 flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Post
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <h2 className="text-xl font-bold text-cyan-100 mb-2">{post.title}</h2>
        <p className="text-cyan-300/70 mb-4">{post.description}</p>

        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map((tag, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-cyan-500/10 text-cyan-300 rounded-full text-sm"
            >
              #{tag}
            </span>
          ))}
        </div>

        <div className="flex items-center space-x-6 text-cyan-300/70">
          <button
            onClick={handleLike}
            className={`flex items-center space-x-2 transition-colors ${
              isLiked ? 'text-cyan-400' : 'hover:text-cyan-400'
            }`}
          >
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
            <span>{post.likes}</span>
          </button>
          <button
            onClick={() => setShowComments(true)}
            className="flex items-center space-x-2 hover:text-cyan-400 transition-colors"
          >
            <MessageSquare className="w-5 h-5" />
            <span>{post.comments}</span>
          </button>
          <button
            onClick={() => setShowShare(true)}
            className="flex items-center space-x-2 hover:text-cyan-400 transition-colors"
          >
            <Share2 className="w-5 h-5" />
            <span>Share</span>
          </button>
        </div>
      </div>

      {showComments && (
        <CommentModal
          postId={post.id}
          onClose={() => setShowComments(false)}
          onUpdate={onUpdate}
        />
      )}

      {showShare && (
        <ShareModal
          postId={post.id}
          title={post.title}
          onClose={() => setShowShare(false)}
        />
      )}

      {showEdit && (
        <EditPostModal
          post={post}
          onClose={() => setShowEdit(false)}
          onUpdate={onUpdate}
        />
      )}
    </>
  );
}