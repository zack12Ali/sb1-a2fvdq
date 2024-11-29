import React, { useState, useEffect } from 'react';
import { Settings, LogOut, Grid, User as UserIcon, Cog } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { signOut } from '../services/authService';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import UpdateProfileModal from '../components/modals/UpdateProfileModal';
import ChangePasswordModal from '../components/modals/ChangePasswordModal';
import NotificationSettingsModal from '../components/modals/NotificationSettingsModal';
import { getPosts, type Post } from '../services/postService';
import PostCard from '../components/PostCard';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'posts' | 'settings'>('posts');
  const [showUpdateProfile, setShowUpdateProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadUserPosts();
    }
  }, [user]);

  const loadUserPosts = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const posts = await getPosts();
      // Filter posts by current user
      setUserPosts(posts.filter(post => post.authorId === user.uid));
    } catch (error) {
      toast.error('Failed to load posts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Profile Header */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 mb-6">
        <div className="flex items-center space-x-4">
          <div className="w-24 h-24 bg-cyan-500/20 rounded-full flex items-center justify-center">
            <span className="text-4xl text-cyan-400 font-bold">
              {user.displayName?.[0]?.toUpperCase() || 'U'}
            </span>
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-cyan-100">
              {user.displayName || 'User'}
            </h1>
            <p className="text-cyan-300/70 mt-1">
              {user.bio || 'No bio yet'}
            </p>
          </div>
          <button
            onClick={() => setShowUpdateProfile(true)}
            className="p-2 text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-cyan-500/20 mb-6">
        <button
          onClick={() => setActiveTab('posts')}
          className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
            activeTab === 'posts'
              ? 'text-cyan-400 border-b-2 border-cyan-400'
              : 'text-cyan-300/70 hover:text-cyan-400'
          }`}
        >
          <Grid className="w-5 h-5" />
          Posts
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
            activeTab === 'settings'
              ? 'text-cyan-400 border-b-2 border-cyan-400'
              : 'text-cyan-300/70 hover:text-cyan-400'
          }`}
        >
          <Cog className="w-5 h-5" />
          Settings
        </button>
      </div>

      {/* Content Area */}
      {activeTab === 'posts' ? (
        <div className="space-y-6">
          {isLoading ? (
            <div className="text-center py-8">
              <LoadingSpinner size="lg" />
            </div>
          ) : userPosts.length === 0 ? (
            <div className="text-center py-8 text-cyan-300/70">
              No posts yet. Share your first startup idea!
            </div>
          ) : (
            userPosts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                onUpdate={loadUserPosts}
              />
            ))
          )}
        </div>
      ) : (
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
          <div className="space-y-4">
            <button
              onClick={() => setShowUpdateProfile(true)}
              className="w-full text-left px-4 py-3 bg-white/5 hover:bg-white/10 rounded-lg text-cyan-100 transition-colors flex items-center gap-3"
            >
              <UserIcon className="w-5 h-5" />
              Update Profile
            </button>
            <button
              onClick={() => setShowChangePassword(true)}
              className="w-full text-left px-4 py-3 bg-white/5 hover:bg-white/10 rounded-lg text-cyan-100 transition-colors flex items-center gap-3"
            >
              <Settings className="w-5 h-5" />
              Change Password
            </button>
            <button
              onClick={() => setShowNotificationSettings(true)}
              className="w-full text-left px-4 py-3 bg-white/5 hover:bg-white/10 rounded-lg text-cyan-100 transition-colors flex items-center gap-3"
            >
              <Settings className="w-5 h-5" />
              Notification Settings
            </button>
            <button 
              onClick={handleSignOut}
              className="w-full text-left px-4 py-3 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-red-400 transition-colors flex items-center gap-3"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      {showUpdateProfile && (
        <UpdateProfileModal
          onClose={() => setShowUpdateProfile(false)}
          currentName={user.displayName || ''}
          currentBio={user.bio || ''}
          userId={user.uid}
        />
      )}

      {showChangePassword && (
        <ChangePasswordModal
          onClose={() => setShowChangePassword(false)}
        />
      )}

      {showNotificationSettings && (
        <NotificationSettingsModal
          onClose={() => setShowNotificationSettings(false)}
          userId={user.uid}
        />
      )}
    </div>
  );
}