import { Request, Response } from 'express';
import { sendMessage, getMessages, markAsRead, createConversation, getConversation } from '../services/messageService.js';

export const createConv = async (req: Request, res: Response): Promise<void> => {
  try {
    const { job_id, participant_ids } = req.body;
    if (!job_id || !participant_ids) {
      res.status(400).json({ success: false, error: 'job_id e participant_ids obrigatórios' });
      return;
    }
    const conv = await createConversation(job_id, participant_ids);
    res.status(201).json({ success: true, data: conv });
  } catch (error) {
    res.status(400).json({ success: false, error: (error as Error).message });
  }
};

export const send = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Não autenticado' });
      return;
    }
    const { conversation_id, content } = req.body;
    if (!conversation_id || !content) {
      res.status(400).json({ success: false, error: 'Campos obrigatórios' });
      return;
    }
    const msg = await sendMessage(conversation_id, req.user.id, content);
    res.status(201).json({ success: true, data: msg });
  } catch (error) {
    res.status(400).json({ success: false, error: (error as Error).message });
  }
};

export const getConvMessages = async (req: Request, res: Response): Promise<void> => {
  try {
    const { conversation_id } = req.params;
    const msgs = await getMessages(conversation_id);
    res.status(200).json({ success: true, data: msgs });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
};

export const markRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const { message_id } = req.body;
    await markAsRead(message_id);
    res.status(200).json({ success: true, message: 'Marcado como lido' });
  } catch (error) {
    res.status(400).json({ success: false, error: (error as Error).message });
  }
};
