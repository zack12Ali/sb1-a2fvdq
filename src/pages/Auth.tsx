import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Github } from 'lucide-react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, GithubAuthProvider } from 'firebase/auth';
import { auth } from '../config/firebase';
import { toast } from 'react-hot-toast';

export default function Auth() {
  const navigate = useNavigate();
  const [isSignIn, setIsSignIn] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);

    try {
      if (isSignIn) {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success('Welcome back!');
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        toast.success('Account created successfully!');
      }
      navigate('/');
    } catch (error: any) {
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
        default:
          toast.error('Authentication failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast.success('Welcome!');
      navigate('/');
    } catch (error: any) {
      if (error.code !== 'auth/popup-closed-by-user') {
        toast.error('Failed to sign in with Google');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGithubSignIn = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const provider = new GithubAuthProvider();
      await signInWithPopup(auth, provider);
      toast.success('Welcome!');
      navigate('/');
    } catch (error: any) {
      if (error.code !== 'auth/popup-closed-by-user') {
        toast.error('Failed to sign in with Github');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-cyan-400 mb-2">StartupAI</h1>
          <p className="text-cyan-300/70">Your AI-powered startup companion</p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8">
          <div className="flex gap-4 mb-8">
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

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-cyan-400 text-sm mb-1 block">Email</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-800/50 border border-cyan-500/20 rounded-lg px-4 py-3 pl-10 text-cyan-500 placeholder-cyan-500/30 focus:outline-none focus:border-cyan-500"
                  placeholder="name@example.com"
                  required
                  disabled={isLoading}
                />
                <Mail className="absolute left-3 top-3.5 w-5 h-5 text-cyan-500/50" />
              </div>
            </div>

            <div>
              <label className="text-cyan-400 text-sm mb-1 block">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-800/50 border border-cyan-500/20 rounded-lg px-4 py-3 pl-10 text-cyan-500 placeholder-cyan-500/30 focus:outline-none focus:border-cyan-500"
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                  minLength={6}
                />
                <Lock className="absolute left-3 top-3.5 w-5 h-5 text-cyan-500/50" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-cyan-500/50 hover:text-cyan-500"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-cyan-500 hover:bg-cyan-400 text-gray-900 font-bold py-3 rounded-lg transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Processing...' : isSignIn ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-900 text-cyan-400/60">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <button
                onClick={handleGithubSignIn}
                disabled={isLoading}
                className="flex items-center justify-center gap-2 px-4 py-2 border border-cyan-500/20 rounded-lg text-cyan-500 hover:bg-cyan-500/10 transition-colors disabled:opacity-50"
              >
                <Github className="w-5 h-5" />
                Github
              </button>
              <button
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="flex items-center justify-center gap-2 px-4 py-2 border border-cyan-500/20 rounded-lg text-cyan-500 hover:bg-cyan-500/10 transition-colors disabled:opacity-50"
              >
                <Mail className="w-5 h-5" />
                Google
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}