export const initSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 Client connected via Socket.io: ${socket.id}`);

    // Optional: allow clients to request an immediate summary update
    socket.on('request:dashboard:summary', () => {
      // You can add logic here to fetch and emit the summary specifically to this socket
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
    });
  });
};
