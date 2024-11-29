import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  where,
  serverTimestamp,
  getDoc,
  doc,
  getDocs,
  deleteDoc,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { toast } from 'react-hot-toast';

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Timestamp;
  read: boolean;
}

export interface ChatUser {
  id: string;
  name: string;
  avatar: string;
  lastSeen?: Date;
  lastMessage?: string;
}

export const sendMessage = async (senderId: string, receiverId: string, content: string) => {
  try {
    const messageData = {
      senderId,
      receiverId,
      content,
      timestamp: serverTimestamp(),
      read: false,
    };

    const docRef = await addDoc(collection(db, 'messages'), messageData);
    
    // Update last message in chat
    const chatId = [senderId, receiverId].sort().join('_');
    const chatRef = doc(db, 'chats', chatId);
    await getDoc(chatRef).then(async (chatDoc) => {
      if (!chatDoc.exists()) {
        await chatRef.set({
          participants: [senderId, receiverId],
          lastMessage: content,
          lastMessageTimestamp: serverTimestamp(),
          messages: [docRef.id]
        });
      } else {
        await chatRef.update({
          lastMessage: content,
          lastMessageTimestamp: serverTimestamp(),
          messages: [...chatDoc.data().messages, docRef.id]
        });
      }
    });

    return { id: docRef.id, ...messageData };
  } catch (error) {
    console.error('Error sending message:', error);
    throw new Error('Failed to send message');
  }
};

export const deleteMessage = async (messageId: string, userId: string) => {
  try {
    const messageRef = doc(db, 'messages', messageId);
    const messageDoc = await getDoc(messageRef);
    
    if (!messageDoc.exists()) {
      throw new Error('Message not found');
    }

    const messageData = messageDoc.data();
    if (messageData.senderId !== userId) {
      throw new Error('Unauthorized to delete this message');
    }

    await deleteDoc(messageRef);
    toast.success('Message deleted');
    return true;
  } catch (error) {
    console.error('Error deleting message:', error);
    throw error;
  }
};

export const subscribeToMessages = (userId: string, chatUserId: string, callback: (messages: Message[]) => void) => {
  const chatId = [userId, chatUserId].sort().join('_');
  
  // Query messages between these two users
  const q = query(
    collection(db, 'messages'),
    where('senderId', 'in', [userId, chatUserId]),
    where('receiverId', 'in', [userId, chatUserId]),
    orderBy('timestamp', 'asc')
  );

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Message[];
    callback(messages);
  });
};

export const getUserChats = async (userId: string): Promise<ChatUser[]> => {
  try {
    // Query chats where user is a participant
    const chatsQuery = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', userId)
    );
    
    const snapshot = await getDocs(chatsQuery);
    const chats = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const chatData = doc.data();
        const otherUserId = chatData.participants.find((id: string) => id !== userId);
        
        // Get other user's details
        const userDoc = await getDoc(doc(db, 'users', otherUserId));
        const userData = userDoc.data();

        return {
          id: otherUserId,
          name: userData?.displayName || 'User',
          avatar: userData?.photoURL || `https://ui-avatars.com/api/?name=${userData?.displayName || 'U'}&background=0D9488&color=fff`,
          lastSeen: userData?.lastSeen?.toDate(),
          lastMessage: chatData.lastMessage
        };
      })
    );

    return chats;
  } catch (error) {
    console.error('Error fetching user chats:', error);
    throw error;
  }
};

export const markMessagesAsRead = async (userId: string, chatUserId: string) => {
  try {
    const q = query(
      collection(db, 'messages'),
      where('senderId', '==', chatUserId),
      where('receiverId', '==', userId),
      where('read', '==', false)
    );

    const snapshot = await getDocs(q);
    const batch = db.batch();

    snapshot.docs.forEach((doc) => {
      batch.update(doc.ref, { read: true });
    });

    await batch.commit();
  } catch (error) {
    console.error('Error marking messages as read:', error);
  }
};