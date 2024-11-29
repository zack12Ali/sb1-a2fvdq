import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Sparkles, Mail, Lock, Eye, EyeOff, User } from 'lucide-react';
import { auth, db } from '../config/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Landing() {
  const [isSignIn, setIsSignIn] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading || !email || !password || (!isSignIn && !name)) return;
    
    setIsLoading(true);
    try {
      if (isSignIn) {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success('Welcome back!');
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        // Update profile with name
        await updateProfile(userCredential.user, {
          displayName: name
        });

        // Store additional user data in Firestore
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          name,
          email,
          createdAt: new Date().toISOString()
        });

        toast.success('Account created successfully!');
      }
    } catch (error: any) {
      console.error('Auth error:', error);
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

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 pt-8 pb-20 md:pt-20">
        <nav className="flex justify-between items-center mb-16">
          <div className="text-2xl font-bold text-cyan-400 flex items-center gap-2">
            <Sparkles className="w-6 h-6" />
            StartupAI
          </div>
        </nav>

        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-cyan-200 mb-2">
              Welcome to StartupAI
            </h1>
            <p className="text-cyan-100/70">Join our community of innovators</p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-cyan-500/20">
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
              {!isSignIn && (
                <div>
                  <label className="text-cyan-400 text-sm mb-1 block">Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-gray-800/50 border border-cyan-500/20 rounded-lg px-4 py-2.5 pl-10 text-cyan-500 placeholder-cyan-500/30"
                      placeholder="Your name"
                      required={!isSignIn}
                      disabled={isLoading}
                    />
                    <User className="absolute left-3 top-3 w-5 h-5 text-cyan-500/50" />
                  </div>
                </div>
              )}

              <div>
                <label className="text-cyan-400 text-sm mb-1 block">Email</label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-gray-800/50 border border-cyan-500/20 rounded-lg px-4 py-2.5 pl-10 text-cyan-500 placeholder-cyan-500/30"
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
                    className="w-full bg-gray-800/50 border border-cyan-500/20 rounded-lg px-4 py-2.5 pl-10 text-cyan-500 placeholder-cyan-500/30"
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
                className="w-full bg-cyan-500 hover:bg-cyan-400 text-gray-900 font-bold py-2.5 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {isLoading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  isSignIn ? 'Sign In' : 'Create Account'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}