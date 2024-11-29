import { useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

interface UserData extends User {
  bio?: string;
  notificationSettings?: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    newMessages: boolean;
    newComments: boolean;
    jobApplications: boolean;
    marketingEmails: boolean;
  };
}

export function useAuth() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Subscribe to user document in Firestore
        const userDoc = doc(db, 'users', firebaseUser.uid);
        const unsubscribeFirestore = onSnapshot(userDoc, (doc) => {
          const userData = doc.data();
          setUser({
            ...firebaseUser,
            bio: userData?.bio,
            notificationSettings: userData?.notificationSettings
          } as UserData);
          setLoading(false);
        });

        return () => unsubscribeFirestore();
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  return { user, loading };
}