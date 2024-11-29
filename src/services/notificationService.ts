import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  updateDoc,
  doc,
  where,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface Notification {
  id: string;
  userId: string;
  message: string;
  type: 'job' | 'message' | 'system';
  read: boolean;
  timestamp: Date;
  link?: string;
}

// For development, using mock data
const MOCK_NOTIFICATIONS = [
  {
    id: '1',
    userId: 'current-user',
    message: 'New job posting: Senior React Developer at TechCorp',
    type: 'job',
    read: false,
    timestamp: new Date(),
    link: '/jobs'
  },
  {
    id: '2',
    userId: 'current-user',
    message: 'Your job application was received',
    type: 'job',
    read: false,
    timestamp: new Date(Date.now() - 3600000),
    link: '/profile'
  },
  {
    id: '3',
    userId: 'current-user',
    message: 'Welcome to the platform!',
    type: 'system',
    read: true,
    timestamp: new Date(Date.now() - 86400000)
  }
];

export async function getNotifications() {
  try {
    if (process.env.NODE_ENV === 'development') {
      return MOCK_NOTIFICATIONS;
    }

    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('userId', '==', 'current-user'),
      orderBy('timestamp', 'desc'),
      limit(50)
    );
    
    const snapshot = await getDocs(notificationsQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate()
    }));
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return MOCK_NOTIFICATIONS;
  }
}

export async function markAsRead(notificationId: string) {
  try {
    if (process.env.NODE_ENV === 'development') {
      return true;
    }

    const notificationRef = doc(db, 'notifications', notificationId);
    await updateDoc(notificationRef, {
      read: true,
      readAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw new Error('Failed to mark notification as read');
  }
}