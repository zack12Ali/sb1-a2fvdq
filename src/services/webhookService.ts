import { toast } from 'react-hot-toast';
import { triggerConfetti } from '../utils/confetti';
import { WebhookResponse, WebhookRequest } from '../types/webhook';
import { API_CONFIG } from './api/config';
import { fetchWithTimeout } from './api/fetcher';
import { saveGeneratedIdea } from './firebaseService';

function validateResponse(data: any): WebhookResponse {
  if (!data) {
    throw new Error('Empty response received');
  }

  let startupIdea, recommendations;

  try {
    // Handle string response
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch {
        // If it's not JSON, use the entire string as startupIdea
        return {
          startupIdea: data,
          recommendations: 'No recommendations available'
        };
      }
    }

    // Handle array response
    if (Array.isArray(data)) {
      return {
        startupIdea: String(data[0] || ''),
        recommendations: String(data[1] || 'No recommendations available')
      };
    }

    // Handle object response
    if (typeof data === 'object') {
      startupIdea = data.startupIdea || data.idea || data.content || data.response || '';
      recommendations = data.recommendations || data.advice || data.details || '';
    }

    if (!startupIdea && !recommendations) {
      console.log('Received data:', data);
      throw new Error('No valid data found in response');
    }

    return {
      startupIdea: startupIdea || 'No startup idea generated',
      recommendations: recommendations || 'No recommendations available'
    };
  } catch (error) {
    console.error('Response validation error:', error);
    throw new Error('Invalid response format');
  }
}

export async function sendToWebhook(data: WebhookRequest): Promise<WebhookResponse> {
  try {
    const response = await fetchWithTimeout(API_CONFIG.WEBHOOK_URL, {
      method: 'POST',
      headers: API_CONFIG.HEADERS,
      body: JSON.stringify(data)
    });

    let result;
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      result = await response.json();
    } else {
      result = await response.text();
    }

    console.log('Webhook response:', result);
    const formattedResponse = validateResponse(result);
    
    if (formattedResponse.startupIdea || formattedResponse.recommendations) {
      // Save to Firebase
      await saveGeneratedIdea(data, formattedResponse);
      triggerConfetti();
      return formattedResponse;
    } else {
      throw new Error('No valid data in response');
    }
  } catch (error: any) {
    console.error('Webhook error:', error);
    
    const errorMessage = error.message === 'Failed to fetch' 
      ? 'Unable to reach the server. Please check your connection.'
      : error.message || 'Failed to generate startup idea';
    
    toast.error(errorMessage);
    throw error;
  }
}