export interface Message {
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  attachments?: Array<{
    name: string;
    url: string;
    type: string;
  }>;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}