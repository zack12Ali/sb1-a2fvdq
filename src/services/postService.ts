import { collection, addDoc, getDocs, query, orderBy, serverTimestamp, DocumentData, limit, updateDoc, doc, arrayUnion, increment, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { toast } from 'react-hot-toast';

export interface NewPost {
  title: string;
  description: string;
  authorName?: string;
  authorPhotoURL?: string;
}

export interface Comment {
  id: string;
  authorId: string;
  content: string;
  createdAt: any;
}

export interface Post extends DocumentData {
  id: string;
  title: string;
  description: string;
  authorId: string;
  authorName: string;
  authorPhotoURL: string;
  createdAt: any;
  likes: number;
  likedBy: string[];
  comments: number;
  tags: string[];
}

export async function createPost(post: NewPost, userId: string) {
  try {
    const tags = post.description
      .split(' ')
      .filter(word => word.startsWith('#'))
      .map(tag => tag.slice(1));

    const postData = {
      title: post.title,
      description: post.description,
      authorId: userId,
      authorName: post.authorName || 'Anonymous',
      authorPhotoURL: post.authorPhotoURL || `https://ui-avatars.com/api/?name=${post.authorName || 'A'}&background=0D9488&color=fff`,
      createdAt: serverTimestamp(),
      likes: 0,
      likedBy: [],
      comments: 0,
      tags: tags.length > 0 ? tags : ['startup']
    };

    const docRef = await addDoc(collection(db, 'posts'), postData);
    return { id: docRef.id, ...postData };
  } catch (error: any) {
    console.error('Error creating post:', error);
    throw new Error('Failed to create post. Please try again');
  }
}

export async function getPosts(): Promise<Post[]> {
  try {
    const postsQuery = query(
      collection(db, 'posts'),
      orderBy('createdAt', 'desc'),
      limit(20)
    );
    
    const snapshot = await getDocs(postsQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Post[];
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw new Error('Failed to fetch posts');
  }
}

export async function deletePost(postId: string, userId: string) {
  try {
    const postRef = doc(db, 'posts', postId);
    const postDoc = await getDoc(postRef);
    
    if (!postDoc.exists()) {
      throw new Error('Post not found');
    }
    
    if (postDoc.data().authorId !== userId) {
      throw new Error('Unauthorized to delete this post');
    }
    
    await deleteDoc(postRef);
    return true;
  } catch (error) {
    console.error('Error deleting post:', error);
    throw error;
  }
}

export async function editPost(postId: string, userId: string, updates: Partial<NewPost>) {
  try {
    const postRef = doc(db, 'posts', postId);
    const postDoc = await getDoc(postRef);
    
    if (!postDoc.exists()) {
      throw new Error('Post not found');
    }
    
    if (postDoc.data().authorId !== userId) {
      throw new Error('Unauthorized to edit this post');
    }
    
    const tags = updates.description
      ? updates.description
          .split(' ')
          .filter(word => word.startsWith('#'))
          .map(tag => tag.slice(1))
      : undefined;

    await updateDoc(postRef, {
      ...updates,
      ...(tags && { tags }),
      updatedAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error('Error editing post:', error);
    throw error;
  }
}

export async function likePost(postId: string, userId: string) {
  try {
    const postRef = doc(db, 'posts', postId);
    const postSnap = await getDoc(postRef);
    
    if (!postSnap.exists()) {
      throw new Error('Post not found');
    }

    const post = postSnap.data();
    const isLiked = post.likedBy?.includes(userId);

    await updateDoc(postRef, {
      likes: isLiked ? increment(-1) : increment(1),
      likedBy: isLiked 
        ? post.likedBy.filter((id: string) => id !== userId)
        : arrayUnion(userId)
    });

    return !isLiked;
  } catch (error) {
    console.error('Error liking post:', error);
    throw error;
  }
}

export async function addComment(postId: string, userId: string, content: string) {
  try {
    const commentData = {
      authorId: userId,
      content,
      createdAt: serverTimestamp()
    };

    const commentRef = await addDoc(
      collection(db, 'posts', postId, 'comments'),
      commentData
    );

    await updateDoc(doc(db, 'posts', postId), {
      comments: increment(1)
    });

    return { id: commentRef.id, ...commentData };
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
}

export async function getComments(postId: string): Promise<Comment[]> {
  try {
    const commentsQuery = query(
      collection(db, 'posts', postId, 'comments'),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(commentsQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Comment[];
  } catch (error) {
    console.error('Error fetching comments:', error);
    throw error;
  }
}