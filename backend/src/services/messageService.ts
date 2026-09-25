const conversations = new Map();
const messages = new Map();
let messageId = 1;

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  timestamp: Date;
  read: boolean;
}

export interface Conversation {
  id: string;
  job_id: string;
  participant_ids: string[];
  created_at: Date;
  updated_at: Date;
}

export const createConversation = async (jobId: string, participantIds: string[]): Promise<Conversation> => {
  const id = `conv_${jobId}_${Date.now()}`;
  const conv: Conversation = { id, job_id: jobId, participant_ids: participantIds, created_at: new Date(), updated_at: new Date() };
  conversations.set(id, conv);
  return conv;
};

export const sendMessage = async (conversationId: string, senderId: string, content: string): Promise<Message> => {
  const id = String(messageId++);
  const msg: Message = { id, conversation_id: conversationId, sender_id: senderId, content, timestamp: new Date(), read: false };
  messages.set(id, msg);
  return msg;
};

export const getMessages = async (conversationId: string): Promise<Message[]> => {
  return Array.from(messages.values()).filter(m => m.conversation_id === conversationId).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
};

export const markAsRead = async (messageId: string): Promise<void> => {
  const msg = messages.get(messageId);
  if (msg) { msg.read = true; messages.set(messageId, msg); }
};

export const getConversation = async (conversationId: string): Promise<Conversation | null> => {
  return conversations.get(conversationId) || null;
};
