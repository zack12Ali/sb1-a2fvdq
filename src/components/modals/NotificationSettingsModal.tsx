import React, { useState } from 'react';
import { X, Check, Bell } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { updateNotificationSettings } from '../../services/authService';
import LoadingSpinner from '../LoadingSpinner';

interface NotificationSettingsModalProps {
  onClose: () => void;
  userId: string;
}

export default function NotificationSettingsModal({ onClose, userId }: NotificationSettingsModalProps) {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    newMessages: true,
    newComments: true,
    jobApplications: true,
    marketingEmails: false
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await updateNotificationSettings(userId, settings);
      toast.success('Notification settings updated');
      onClose();
    } catch (error) {
      toast.error('Failed to update notification settings');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="relative w-full max-w-md mx-auto px-4">
        <div className="bg-gray-900 rounded-xl shadow-xl">
          <div className="p-4 border-b border-cyan-500/20 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-cyan-100">Notification Settings</h2>
            <button
              onClick={onClose}
              className="p-2 text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            <div className="space-y-3">
              <label className="flex items-center justify-between">
                <span className="text-cyan-100">Email Notifications</span>
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                  className="w-5 h-5 rounded border-cyan-500/20 text-cyan-500 focus:ring-cyan-500"
                />
              </label>

              <label className="flex items-center justify-between">
                <span className="text-cyan-100">Push Notifications</span>
                <input
                  type="checkbox"
                  checked={settings.pushNotifications}
                  onChange={(e) => setSettings({ ...settings, pushNotifications: e.target.checked })}
                  className="w-5 h-5 rounded border-cyan-500/20 text-cyan-500 focus:ring-cyan-500"
                />
              </label>

              <label className="flex items-center justify-between">
                <span className="text-cyan-100">New Messages</span>
                <input
                  type="checkbox"
                  checked={settings.newMessages}
                  onChange={(e) => setSettings({ ...settings, newMessages: e.target.checked })}
                  className="w-5 h-5 rounded border-cyan-500/20 text-cyan-500 focus:ring-cyan-500"
                />
              </label>

              <label className="flex items-center justify-between">
                <span className="text-cyan-100">New Comments</span>
                <input
                  type="checkbox"
                  checked={settings.newComments}
                  onChange={(e) => setSettings({ ...settings, newComments: e.target.checked })}
                  className="w-5 h-5 rounded border-cyan-500/20 text-cyan-500 focus:ring-cyan-500"
                />
              </label>

              <label className="flex items-center justify-between">
                <span className="text-cyan-100">Job Applications</span>
                <input
                  type="checkbox"
                  checked={settings.jobApplications}
                  onChange={(e) => setSettings({ ...settings, jobApplications: e.target.checked })}
                  className="w-5 h-5 rounded border-cyan-500/20 text-cyan-500 focus:ring-cyan-500"
                />
              </label>

              <label className="flex items-center justify-between">
                <span className="text-cyan-100">Marketing Emails</span>
                <input
                  type="checkbox"
                  checked={settings.marketingEmails}
                  onChange={(e) => setSettings({ ...settings, marketingEmails: e.target.checked })}
                  className="w-5 h-5 rounded border-cyan-500/20 text-cyan-500 focus:ring-cyan-500"
                />
              </label>
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
                  <span>Save Settings</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}