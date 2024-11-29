import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential
} from 'firebase/auth';
import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { toast } from 'react-hot-toast';

export async function signUp(email: string, password: string) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Create user document in Firestore
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      email,
      createdAt: new Date().toISOString(),
      bio: '',
      notificationSettings: {
        emailNotifications: true,
        pushNotifications: true,
        newMessages: true,
        newComments: true,
        jobApplications: true,
        marketingEmails: false
      }
    });

    return userCredential.user;
  } catch (error: any) {
    handleAuthError(error);
    throw error;
  }
}

export async function signIn(email: string, password: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    handleAuthError(error);
    throw error;
  }
}

export async function signOut() {
  try {
    await firebaseSignOut(auth);
    toast.success('Signed out successfully');
  } catch (error: any) {
    console.error('Sign out error:', error);
    toast.error('Failed to sign out');
    throw error;
  }
}

export async function updateUserProfile(userId: string, data: { name?: string; bio?: string }) {
  try {
    const userRef = doc(db, 'users', userId);
    
    // Update Firestore document
    await updateDoc(userRef, {
      ...(data.name && { displayName: data.name }),
      ...(data.bio !== undefined && { bio: data.bio })
    });

    // Update Firebase Auth profile if name is provided
    if (data.name && auth.currentUser) {
      await updateProfile(auth.currentUser, { displayName: data.name });
    }

    return true;
  } catch (error: any) {
    console.error('Update profile error:', error);
    throw error;
  }
}

export async function changePassword(currentPassword: string, newPassword: string) {
  try {
    const user = auth.currentUser;
    if (!user || !user.email) throw new Error('No user logged in');

    // Re-authenticate user before changing password
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);

    // Change password
    await updatePassword(user, newPassword);
    return true;
  } catch (error: any) {
    console.error('Change password error:', error);
    if (error.code === 'auth/wrong-password') {
      throw new Error('Current password is incorrect');
    }
    throw error;
  }
}

export async function updateNotificationSettings(userId: string, settings: any) {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { notificationSettings: settings });
    return true;
  } catch (error: any) {
    console.error('Update notification settings error:', error);
    throw error;
  }
}

function handleAuthError(error: any) {
  console.error('Auth error:', error);
  
  switch (error.code) {
    case 'auth/email-already-in-use':
      toast.error('Email already registered. Please sign in instead.');
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
    case 'auth/too-many-requests':
      toast.error('Too many attempts. Please try again later.');
      break;
    default:
      toast.error('Authentication failed. Please try again.');
  }
}