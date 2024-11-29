import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Users, Briefcase, MessageSquare, User } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-hot-toast';

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const navItems = [
    { path: '/', label: 'Generator', icon: Home, public: true },
    { path: '/community', label: 'Community', icon: Users },
    { path: '/jobs', label: 'Jobs', icon: Briefcase },
    { path: '/messages', label: 'Messages', icon: MessageSquare },
    { path: '/profile', label: 'Profile', icon: User },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleNavigation = (path: string, isPublic?: boolean) => {
    if (!user && !isPublic) {
      toast.error('Please sign in to access this feature');
      navigate('/auth');
      return;
    }
    navigate(path);
  };
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-900/80 backdrop-blur-lg border-t border-cyan-500/20 safe-area-bottom z-50">
      <div className="grid grid-cols-5 max-w-lg mx-auto">
        {navItems.map(({ path, label, icon: Icon, public: isPublic }) => (
          <button
            key={path}
            onClick={() => handleNavigation(path, isPublic)}
            className={`flex flex-col items-center justify-center py-2 ${
              isActive(path)
                ? 'text-cyan-400'
                : 'text-gray-400 hover:text-cyan-400'
            }`}
          >
            <Icon className="w-5 h-5 mb-1" />
            <span className="text-xs">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

export default Navbar;