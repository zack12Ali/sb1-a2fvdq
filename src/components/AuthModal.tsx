import React, { useState } from 'react';
import { X, Github, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  GithubAuthProvider,
  AuthError 
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isSignIn, setIsSignIn] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleAuthSuccess = () => {
    toast.success(isSignIn ? 'Welcome back!' : 'Account created successfully!');
    onClose();
    navigate('/', { replace: true });
  };

  const handleAuthError = (error: AuthError) => {
    console.error('Auth error:', error);
    setIsLoading(false);
    
    switch (error.code) {
      case 'auth/email-already-in-use':
        toast.error('Email already registered. Please sign in instead.');
        setIsSignIn(true);
        break;
      case 'auth/invalid-email':
        toast.error('Invalid email address.');
        break;
      case 'auth/weak-password':
        toast.error('Password should be at least 6 characters.');
        break;
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        toast.error('Invalid email or password.');
        break;
      case 'auth/popup-closed-by-user':
        // User closed the popup, no need to show error
        break;
      default:
        toast.error(error.message || 'Authentication failed. Please try again.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading || !email || !password) return;
    
    setIsLoading(true);
    try {
      if (isSignIn) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      handleAuthSuccess();
    } catch (error: any) {
      handleAuthError(error);
    }
  };

  const handleGoogleSignIn = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
      handleAuthSuccess();
    } catch (error: any) {
      handleAuthError(error);
    }
  };

  const handleGithubSignIn = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const provider = new GithubAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
      handleAuthSuccess();
    } catch (error: any) {
      handleAuthError(error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center overflow-y-auto">
      <div className="min-h-screen py-8 px-4 flex items-center justify-center w-full">
        <div className="bg-gray-900 w-full max-w-md rounded-lg p-6 sm:p-8 relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-cyan-500 hover:text-cyan-400 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-cyan-500/10 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <Lock className="w-8 h-8 text-cyan-500" />
            </div>
            <h2 className="text-2xl font-bold text-cyan-500 mb-2">Welcome to StartupAI</h2>
            <p className="text-cyan-400/60 text-sm">Join our community of innovators</p>
          </div>

          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setIsSignIn(true)}
              className={`flex-1 pb-2 border-b-2 transition-colors ${
                isSignIn ? 'border-cyan-500 text-cyan-500' : 'border-gray-700 text-gray-500 hover:text-cyan-400'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsSignIn(false)}
              className={`flex-1 pb-2 border-b-2 transition-colors ${
                !isSignIn ? 'border-cyan-500 text-cyan-500' : 'border-gray-700 text-gray-500 hover:text-cyan-400'
              }`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-cyan-400 text-sm mb-1 block">Email</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-800/50 border border-cyan-500/20 rounded-lg px-4 py-2.5 pl-10 text-cyan-500 placeholder-cyan-500/30 focus:outline-none focus:border-cyan-500"
                  placeholder="name@example.com"
                  required
                  disabled={isLoading}
                />
                <Mail className="absolute left-3 top-3 w-5 h-5 text-cyan-500/50" />
              </div>
            </div>

            <div>
              <label className="text-cyan-400 text-sm mb-1 block">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-800/50 border border-cyan-500/20 rounded-lg px-4 py-2.5 pl-10 text-cyan-500 placeholder-cyan-500/30 focus:outline-none focus:border-cyan-500"
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                  minLength={6}
                />
                <Lock className="absolute left-3 top-3 w-5 h-5 text-cyan-500/50" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-cyan-500/50 hover:text-cyan-500"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-cyan-500 hover:bg-cyan-400 text-gray-900 font-bold py-2.5 rounded-lg transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Processing...' : isSignIn ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-900 text-cyan-400/60">Or continue with</span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                onClick={handleGithubSignIn}
                disabled={isLoading}
                className="flex items-center justify-center gap-2 px-3 py-2 border border-cyan-500/20 rounded-lg text-cyan-500 hover:bg-cyan-500/10 transition-colors disabled:opacity-50"
              >
                <Github className="w-5 h-5" />
                <span className="text-sm">GitHub</span>
              </button>
              <button
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="flex items-center justify-center gap-2 px-3 py-2 border border-cyan-500/20 rounded-lg text-cyan-500 hover:bg-cyan-500/10 transition-colors disabled:opacity-50"
              >
                <Mail className="w-5 h-5" />
                <span className="text-sm">Google</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}