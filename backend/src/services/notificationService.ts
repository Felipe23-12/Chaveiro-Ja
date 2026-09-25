const deviceTokens = new Map<string, string[]>();
const notifications = new Map();
let notificationId = 1;

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  data?: Record<string, string>;
  read: boolean;
  created_at: Date;
}

export const registerDeviceToken = async (userId: string, token: string): Promise<void> => {
  const tokens = deviceTokens.get(userId) || [];
  if (!tokens.includes(token)) {
    tokens.push(token);
    deviceTokens.set(userId, tokens);
  }
};

export const sendNotification = async (
  userId: string,
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<Notification> => {
  const id = String(notificationId++);
  const notification: Notification = {
    id,
    user_id: userId,
    title,
    body,
    data,
    read: false,
    created_at: new Date(),
  };

  notifications.set(id, notification);

  // Em produção, integrar com Firebase Admin SDK
  // const message = { notification: { title, body }, data, tokens: deviceTokens.get(userId) };
  // await admin.messaging().sendMulticast(message);

  return notification;
};

export const sendJobNotification = async (
  userId: string,
  jobId: string,
  status: string
): Promise<Notification> => {
  const messages: Record<string, { title: string; body: string }> = {
    offered: {
      title: 'Novo Pedido Disponível!',
      body: 'Um cliente solicita seu serviço',
    },
    accepted: {
      title: 'Pedido Aceito!',
      body: 'Seu serviço foi aceito',
    },
    en_route: {
      title: 'A Caminho',
      body: 'Chaveiro saiu para atender',
    },
    arrived: {
      title: 'Chegou!',
      body: 'Chaveiro chegou no local',
    },
    completed: {
      title: 'Serviço Concluído',
      body: 'Avalie seu atendimento',
    },
  };

  const msg = messages[status] || { title: 'Atualização', body: 'Status do pedido atualizado' };

  return sendNotification(userId, msg.title, msg.body, { job_id: jobId, status });
};

export const getNotifications = async (userId: string): Promise<Notification[]> => {
  return Array.from(notifications.values()).filter(n => n.user_id === userId);
};

export const markAsRead = async (notificationId: string): Promise<void> => {
  const notification = notifications.get(notificationId);
  if (notification) {
    notification.read = true;
    notifications.set(notificationId, notification);
  }
};
