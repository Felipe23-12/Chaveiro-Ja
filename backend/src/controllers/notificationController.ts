import { Request, Response } from 'express';
import {
  registerDeviceToken,
  sendNotification,
  sendJobNotification,
  getNotifications,
  markAsRead,
} from '../services/notificationService.js';

export const registerToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.body;
    const userId = req.user?.id;
    if (!token || !userId) {
      res.status(400).json({ success: false, error: 'Token e usuário obrigatórios' });
      return;
    }
    await registerDeviceToken(userId, token);
    res.status(200).json({ success: true, message: 'Token registrado' });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
};

export const getMyNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Não autenticado' });
      return;
    }
    const notifications = await getNotifications(userId);
    res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
};

export const markNotificationAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const { notification_id } = req.params;
    await markAsRead(notification_id);
    res.status(200).json({ success: true, message: 'Notificação marcada como lida' });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
};
