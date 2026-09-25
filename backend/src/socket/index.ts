import { Server as SocketServer } from 'socket.io';
import { Server as HTTPServer } from 'http';

export function initializeSocket(httpServer: HTTPServer) {
  const io = new SocketServer(httpServer, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
  });

  // ============================================
  // CHAT EVENTS
  // ============================================

  io.on('connection', (socket) => {
    console.log(`📱 Cliente conectado: ${socket.id}`);

    // Entrar em conversa
    socket.on('join-conversation', (conversationId) => {
      socket.join(`conversation-${conversationId}`);
      console.log(`👥 User entrou em conversa: ${conversationId}`);
    });

    // Enviar mensagem
    socket.on('send-message', (data) => {
      io.to(`conversation-${data.conversationId}`).emit('new-message', {
        id: data.id,
        sender_id: data.sender_id,
        content: data.content,
        timestamp: new Date(),
      });
    });

    // ============================================
    // LOCATION EVENTS
    // ============================================

    // Atualizar localização
    socket.on('update-location', (data) => {
      io.to(`job-${data.job_id}`).emit('locksmith-location-updated', {
        locksmith_id: data.locksmith_id,
        latitude: data.latitude,
        longitude: data.longitude,
        timestamp: new Date(),
      });
    });

    // ============================================
    // JOB STATUS EVENTS
    // ============================================

    // Atualizar status do job
    socket.on('job-status-changed', (data) => {
      io.to(`job-${data.job_id}`).emit('status-updated', {
        job_id: data.job_id,
        status: data.status,
        timestamp: new Date(),
      });
    });

    // Job aceito
    socket.on('job-accepted', (data) => {
      io.to(`job-${data.job_id}`).emit('job-accepted', {
        job_id: data.job_id,
        locksmith_id: data.locksmith_id,
        timestamp: new Date(),
      });
    });

    // ============================================
    // DISCONNECT
    // ============================================

    socket.on('disconnect', () => {
      console.log(`❌ Cliente desconectado: ${socket.id}`);
    });
  });

  return io;
}
