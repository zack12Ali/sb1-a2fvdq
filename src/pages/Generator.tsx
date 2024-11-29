import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { toast } from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import { sendToWebhook } from '../services/webhookService';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Generator() {
  const [prompt, setPrompt] = useState('');
  const [startupIdea, setStartupIdea] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async (input?: string) => {
    if (isLoading) return;
    
    setIsLoading(true);
    setStartupIdea('Generating your startup idea...');
    const userPrompt = input?.trim() || prompt.trim() || 'Generate a random startup idea';
    
    try {
      const result = await sendToWebhook({
        prompt: userPrompt,
        timestamp: new Date().toISOString()
      });
      
      if (result.startupIdea) {
        setStartupIdea(result.startupIdea);
        setPrompt('');
        toast.success('Startup idea generated!');
      } else {
        toast.error('No startup idea was generated');
        setStartupIdea('Failed to generate startup idea. Please try again.');
      }
    } catch (error) {
      console.error('Generation error:', error);
      setStartupIdea('Failed to generate startup idea. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-xl mx-auto space-y-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 space-y-4">
          <div className="relative">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter your startup idea prompt..."
              className="w-full p-4 bg-white/5 border border-cyan-500/20 rounded-lg text-cyan-100 placeholder-cyan-300/30"
              disabled={isLoading}
            />
            <button
              onClick={() => handleGenerate(prompt)}
              disabled={isLoading}
              className="absolute right-2 top-2 p-2 bg-cyan-500 hover:bg-cyan-400 text-gray-900 rounded-lg transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <LoadingSpinner size="sm" className="mx-auto" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>

          <div className="bg-white/5 border border-cyan-500/20 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-cyan-100 mb-4">Generated Startup Idea</h2>
            <div className="prose prose-invert max-w-none prose-sm">
              {isLoading ? (
                <div className="flex items-center gap-3 text-cyan-300/70">
                  <LoadingSpinner />
                  <span>Generating your startup idea...</span>
                </div>
              ) : (
                <ReactMarkdown>{startupIdea || 'Your generated startup idea will appear here...'}</ReactMarkdown>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}