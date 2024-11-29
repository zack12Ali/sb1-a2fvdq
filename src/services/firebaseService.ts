import { db } from '../config/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import type { WebhookRequest, WebhookResponse } from '../types/webhook';

export async function saveGeneratedIdea(
  prompt: WebhookRequest,
  response: WebhookResponse
) {
  try {
    const docRef = await addDoc(collection(db, 'generated-ideas'), {
      prompt: prompt.prompt,
      startupIdea: response.startupIdea,
      timestamp: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving to Firebase:', error);
    // Don't throw error to prevent disrupting the main flow
    return null;
  }
}