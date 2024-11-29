import React from 'react';
import { X, Link, Twitter, Facebook, Linkedin } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ShareModalProps {
  postId: string;
  title: string;
  onClose: () => void;
}

export default function ShareModal({ postId, title, onClose }: ShareModalProps) {
  const shareUrl = `${window.location.origin}/post/${postId}`;
  
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Link copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const shareToTwitter = () => {
    const text = encodeURIComponent(`Check out this startup idea: ${title}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(shareUrl)}`);
  };

  const shareToFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`);
  };

  const shareToLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="relative w-full max-w-md mx-auto px-4">
        <div className="bg-gray-900 rounded-xl shadow-xl">
          <div className="p-4 border-b border-cyan-500/20 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-cyan-100">Share Post</h2>
            <button
              onClick={onClose}
              className="p-2 text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-4 space-y-4">
            <button
              onClick={handleCopyLink}
              className="w-full flex items-center gap-3 px-4 py-3 bg-white/5 hover:bg-white/10 rounded-lg text-cyan-100 transition-colors"
            >
              <Link className="w-5 h-5" />
              <span>Copy Link</span>
            </button>

            <button
              onClick={shareToTwitter}
              className="w-full flex items-center gap-3 px-4 py-3 bg-white/5 hover:bg-white/10 rounded-lg text-cyan-100 transition-colors"
            >
              <Twitter className="w-5 h-5" />
              <span>Share on Twitter</span>
            </button>

            <button
              onClick={shareToFacebook}
              className="w-full flex items-center gap-3 px-4 py-3 bg-white/5 hover:bg-white/10 rounded-lg text-cyan-100 transition-colors"
            >
              <Facebook className="w-5 h-5" />
              <span>Share on Facebook</span>
            </button>

            <button
              onClick={shareToLinkedIn}
              className="w-full flex items-center gap-3 px-4 py-3 bg-white/5 hover:bg-white/10 rounded-lg text-cyan-100 transition-colors"
            >
              <Linkedin className="w-5 h-5" />
              <span>Share on LinkedIn</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}