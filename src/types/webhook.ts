export interface WebhookRequest {
  prompt: string;
  timestamp: string;
}

export interface WebhookResponse {
  startupIdea: string;
  recommendations: string;
}

export interface WebhookError {
  message: string;
  code?: string;
  status?: number;
}