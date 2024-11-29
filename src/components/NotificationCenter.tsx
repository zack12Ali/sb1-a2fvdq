import React, { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { format } from 'date-fns';
import { getNotifications, markAsRead } from '../services/notificationService';
import { cn } from '../utils/cn';

interface NotificationCenterProps {
  onClose?: () => void;
}

function NotificationCenter({ onClose }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const loadNotifications = async () => {
      const data = await getNotifications();
      setNotifications(data);
      setUnreadCount(data.filter((n: any) => !n.read).length);
    };

    loadNotifications();
  }, []);

  const handleMarkAsRead = async (notificationId: string) => {
    await markAsRead(notificationId);
    setNotifications(notifications.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    ));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end md:pt-16">
      <div className="bg-black/50 absolute inset-0" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-gray-900 shadow-xl">
        <div className="p-4 border-b border-cyan-500/20">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-cyan-400">Notifications</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-cyan-400" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(100vh-120px)]">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-400">
              No notifications yet
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  "p-4 border-b border-cyan-500/20 hover:bg-white/5 transition-colors cursor-pointer",
                  !notification.read && "bg-cyan-500/5"
                )}
                onClick={() => handleMarkAsRead(notification.id)}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <p className="text-cyan-100 mb-1">{notification.message}</p>
                    <p className="text-xs text-cyan-300/70">
                      {format(new Date(notification.timestamp), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                  {!notification.read && (
                    <span className="w-2 h-2 rounded-full bg-cyan-400 mt-2" />
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default NotificationCenter;