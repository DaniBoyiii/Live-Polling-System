// backend/sockets/chatSocket.js

module.exports = (io) => {
  // Map of connected users: socket.id => { username, role }
  const connectedUsers = new Map();

  io.on('connection', (socket) => {
    console.log('🟢 Chat user connected:', socket.id);

    // Handle joining chat with username and role
    socket.on('join_chat', ({ username, role }) => {
      // Check for duplicate username across connected users (case-insensitive)
      const isDuplicate = [...connectedUsers.values()].some(
        (user) => user.username.toLowerCase() === username.toLowerCase()
      );

      if (isDuplicate) {
        // Notify the client that username is taken
        socket.emit('username_taken', { message: 'Username already taken, please choose another.' });
        console.log(`Username taken attempt: ${username}`);
        return;
      }

      // Save connected user info
      connectedUsers.set(socket.id, { username, role });
      socket.join('global_chat_room');

      // Emit success confirmation to joining client
      socket.emit('join_success');

      // Broadcast updated users list
      const usersList = [...connectedUsers.entries()].map(([id, user]) => ({
        socketId: id,
        username: user.username,
        role: user.role,
      }));

      io.to('global_chat_room').emit('chat_users', usersList);

      console.log(`${username} joined as ${role}`);
    });

    // Chat message forwarding
    socket.on('chat_message', (data) => {
      io.to('global_chat_room').emit('chat_message', data);
    });

    // Kick out user functionality only for teachers
    socket.on('kick_user', ({ socketId }) => {
      const requester = connectedUsers.get(socket.id);
      if (!requester || requester.role !== 'teacher') {
        console.log('Kick attempt denied: not a teacher');
        return;
      }

      const targetSocket = io.sockets.sockets.get(socketId);
      if (targetSocket) {
        targetSocket.emit('kicked_out');
        targetSocket.disconnect();

        connectedUsers.delete(socketId);

        // Broadcast updated users list
        const usersList = [...connectedUsers.entries()].map(([id, user]) => ({
          socketId: id,
          username: user.username,
          role: user.role,
        }));

        io.to('global_chat_room').emit('chat_users', usersList);

        console.log(`User with socketId ${socketId} kicked out by teacher`);
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      connectedUsers.delete(socket.id);

      const usersList = [...connectedUsers.entries()].map(([id, user]) => ({
        socketId: id,
        username: user.username,
        role: user.role,
      }));

      io.to('global_chat_room').emit('chat_users', usersList);

      console.log('User disconnected:', socket.id);
    });
  });
};
