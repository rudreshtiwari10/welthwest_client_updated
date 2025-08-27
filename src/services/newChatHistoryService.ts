// New Chat History Service - Session-based conversation management
// This service runs in parallel with the existing system for safe testing

import { userDataService } from './api';

// Types for new chat history system
export interface ChatSession {
  id: string;
  title: string;
  timestamp: string;
  lastMessage: string;
  messageCount: number;
  model: string;
  isActive: boolean;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  contentType?: 'text' | 'chart' | 'table' | 'image' | 'cards' | 'technical';
  metadata?: any;
}

export interface ConversationSession {
  sessionId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
  model: string;
  metadata: {
    totalMessages: number;
    userMessages: number;
    assistantMessages: number;
    lastActivity: string;
  };
}

class NewChatHistoryService {
  private currentSession: ConversationSession | null = null;
  private sessionStorageKey = 'welthchatbot_current_session';
  private readonly MAX_MESSAGES_PER_SESSION = 25; // Maximum messages per session
  private readonly WARNING_THRESHOLD = 20; // Show warning at this threshold

  constructor() {
    this.loadCurrentSession();
  }

  // Create a new chat session with date/time naming
  createNewSession(title?: string): ConversationSession {
    // Auto-save current session if it exists and has messages
    if (this.currentSession && this.currentSession.messages.length > 0) {
      this.saveCurrentSession();
    }

    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    
    const session: ConversationSession = {
      sessionId,
      title: title || this.generateDefaultTitle(now),
      createdAt: now,
      updatedAt: now,
      messages: [],
      model: 'openrouter', // Default model
      metadata: {
        totalMessages: 0,
        userMessages: 0,
        assistantMessages: 0,
        lastActivity: now
      }
    };

    this.currentSession = session;
    this.saveCurrentSessionToLocalStorage();
    return session;
  }

  // Add a message to the current session
  addMessage(message: ChatMessage): { success: boolean; limitReached: boolean; warningThreshold: boolean } {
    if (!this.currentSession) {
      this.createNewSession();
    }

    if (this.currentSession) {
      // Check if we're at the limit
      if (this.currentSession.messages.length >= this.MAX_MESSAGES_PER_SESSION) {
        return { success: false, limitReached: true, warningThreshold: false };
      }

      this.currentSession.messages.push(message);
      this.currentSession.updatedAt = new Date().toISOString();
      this.currentSession.metadata.lastActivity = new Date().toISOString();
      this.currentSession.metadata.totalMessages = this.currentSession.messages.length;
      
      if (message.sender === 'user') {
        this.currentSession.metadata.userMessages++;
      } else {
        this.currentSession.metadata.assistantMessages++;
      }

      this.saveCurrentSessionToLocalStorage();

      // Check if we're approaching the limit
      const warningThreshold = this.currentSession.messages.length >= this.WARNING_THRESHOLD;
      
      return { 
        success: true, 
        limitReached: false, 
        warningThreshold 
      };
    }

    return { success: false, limitReached: false, warningThreshold: false };
  }

  // Check if current session is at limit
  isSessionAtLimit(): boolean {
    return this.currentSession ? this.currentSession.messages.length >= this.MAX_MESSAGES_PER_SESSION : false;
  }

  // Check if current session is approaching limit
  isSessionNearLimit(): boolean {
    return this.currentSession ? this.currentSession.messages.length >= this.WARNING_THRESHOLD : false;
  }

  // Get remaining messages for current session
  getRemainingMessages(): number {
    if (!this.currentSession) return this.MAX_MESSAGES_PER_SESSION;
    return Math.max(0, this.MAX_MESSAGES_PER_SESSION - this.currentSession.messages.length);
  }

  // Get the current session
  getCurrentSession(): ConversationSession | null {
    return this.currentSession;
  }

  // Set the current session (for external use)
  setCurrentSession(session: ConversationSession): void {
    this.currentSession = session;
    this.saveCurrentSessionToLocalStorage();
  }

  // Load a session by ID (from backend)
  async loadSession(sessionId: string): Promise<ConversationSession | null> {
    try {
      // Try to load from backend first
      const response = await userDataService.getUserChatHistory();
      
      if (response.success && response.chat_history) {
        const session = response.chat_history.find((chat: any) => 
          chat._id === sessionId || chat.id === sessionId
        );
        
        if (session) {
          return this.convertLegacyChatToSession(session);
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error loading session:', error);
      return null;
    }
  }

  // Save the current session to backend
  async saveCurrentSession(): Promise<boolean> {
    if (!this.currentSession || this.currentSession.messages.length === 0) {
      return false;
    }

    try {
      // Convert to legacy format for backward compatibility
      const legacyFormat = this.convertSessionToLegacy(this.currentSession);
      
      const response = await userDataService.saveChatHistory(legacyFormat);
      
      if (response.success) {
        // Update session ID if it was a new session
        if (response.chat_id && !this.currentSession.sessionId.startsWith('session_')) {
          this.currentSession.sessionId = response.chat_id;
          this.saveCurrentSessionToLocalStorage();
        }
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error saving session:', error);
      return false;
    }
  }

  // Get all sessions (for sidebar)
  async getAllSessions(): Promise<ChatSession[]> {
    try {
      const response = await userDataService.getUserChatHistory();
      
      if (response.success && response.chat_history) {
        return response.chat_history.map((chat: any) => this.convertLegacyChatToChatSession(chat));
      }
      
      return [];
    } catch (error) {
      console.error('Error getting all sessions:', error);
      return [];
    }
  }

  // Update session title
  updateSessionTitle(title: string): void {
    if (this.currentSession) {
      this.currentSession.title = title;
      this.saveCurrentSessionToLocalStorage();
    }
  }

  // Clear current session
  clearCurrentSession(): void {
    this.currentSession = null;
    localStorage.removeItem(this.sessionStorageKey);
  }

  // Generate default title based on timestamp (date and time)
  private generateDefaultTitle(timestamp: string): string {
    const date = new Date(timestamp);
    const timeStr = date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
    const dateStr = date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
    return `Chat ${dateStr} at ${timeStr}`;
  }

  // Convert legacy chat format to new session format
  private convertLegacyChatToSession(legacyChat: any): ConversationSession {
    const sessionId = legacyChat._id || legacyChat.id || `legacy_${Date.now()}`;
    const timestamp = legacyChat.created_at || legacyChat.timestamp || new Date().toISOString();
    
    // Extract messages from legacy format
    let messages: ChatMessage[] = [];
    
    if (legacyChat.conversation && Array.isArray(legacyChat.conversation)) {
      messages = legacyChat.conversation.map((msg: any, index: number) => ({
        id: `msg_${index}_${Date.now()}`,
        text: msg.text || '',
        sender: msg.sender || 'user',
        timestamp: msg.timestamp || timestamp,
        contentType: 'text'
      }));
    } else if (legacyChat.query && legacyChat.response) {
      // Handle single query-response format
      messages = [
        {
          id: `query_${Date.now()}`,
          text: legacyChat.query,
          sender: 'user',
          timestamp: timestamp,
          contentType: 'text'
        },
        {
          id: `response_${Date.now()}`,
          text: legacyChat.response?.analysis || legacyChat.response?.response || 'No response',
          sender: 'assistant',
          timestamp: timestamp,
          contentType: 'text'
        }
      ];
    }

    return {
      sessionId,
      title: legacyChat.title || legacyChat.name || this.generateDefaultTitle(timestamp),
      createdAt: timestamp,
      updatedAt: legacyChat.updated_at || timestamp,
      messages,
      model: legacyChat.model || 'unknown',
      metadata: {
        totalMessages: messages.length,
        userMessages: messages.filter(m => m.sender === 'user').length,
        assistantMessages: messages.filter(m => m.sender === 'assistant').length,
        lastActivity: legacyChat.updated_at || timestamp
      }
    };
  }

  // Convert new session format to legacy format for backend compatibility
  private convertSessionToLegacy(session: ConversationSession): any {
    return {
      title: session.title,
      timestamp: session.createdAt,
      conversation: session.messages.map(msg => ({
        text: msg.text,
        sender: msg.sender,
        timestamp: msg.timestamp
      })),
      model: session.model,
      summary: `Conversation with ${session.metadata.totalMessages} messages`
    };
  }

  // Convert legacy chat to simple chat session for sidebar
  private convertLegacyChatToChatSession(legacyChat: any): ChatSession {
    const id = legacyChat._id || legacyChat.id || `legacy_${Date.now()}`;
    const timestamp = legacyChat.created_at || legacyChat.timestamp || new Date().toISOString();
    
    let lastMessage = 'No messages';
    let messageCount = 0;
    
    if (legacyChat.conversation && Array.isArray(legacyChat.conversation)) {
      messageCount = legacyChat.conversation.length;
      const lastMsg = legacyChat.conversation[legacyChat.conversation.length - 1];
      lastMessage = lastMsg?.text || 'No messages';
    } else if (legacyChat.query) {
      messageCount = 1;
      lastMessage = legacyChat.query;
    }

    return {
      id,
      title: legacyChat.title || legacyChat.name || this.generateDefaultTitle(timestamp),
      timestamp,
      lastMessage: lastMessage.length > 50 ? lastMessage.substring(0, 50) + '...' : lastMessage,
      messageCount,
      model: legacyChat.model || 'unknown',
      isActive: false
    };
  }

  // Save current session to localStorage
  private saveCurrentSessionToLocalStorage(): void {
    if (this.currentSession) {
      try {
        localStorage.setItem(this.sessionStorageKey, JSON.stringify(this.currentSession));
      } catch (error) {
        console.error('Error saving session to localStorage:', error);
      }
    }
  }

  // Load current session from localStorage
  private loadCurrentSession(): void {
    try {
      const saved = localStorage.getItem(this.sessionStorageKey);
      if (saved) {
        this.currentSession = JSON.parse(saved);
      }
    } catch (error) {
      console.error('Error loading session from localStorage:', error);
      this.currentSession = null;
    }
  }
}

// Export singleton instance
export const newChatHistoryService = new NewChatHistoryService();
