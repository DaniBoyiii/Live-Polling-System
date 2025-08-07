// backend/sockets/pollSocket.js

const connectedStudents = {}; // pollId -> Set of student socket IDs
const pollVoteCounts = {};    // pollId -> Set of studentIds who voted

const mongoose = require('mongoose'); // Only once here for id validation

function isValidPollId(id) {
  // Filter out non-ObjectId rooms like "global_chat_room"
  return mongoose.Types.ObjectId.isValid(id);
}

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('🟢 A user connected:', socket.id);

    socket.on('join_poll', (pollId) => {
      console.log(`🧑‍🎓 User ${socket.id} attempting to join poll room: ${pollId} (type ${typeof pollId})`);
      socket.join(pollId);

      if (!connectedStudents[pollId]) {
        connectedStudents[pollId] = new Set();
      }
      connectedStudents[pollId].add(socket.id);

      console.log(`🧑‍🎓 User ${socket.id} joined poll room: ${pollId}`);
    });

    socket.on('vote_cast', ({ pollId, studentId, updatedPoll }) => {
      console.log(`📨 Vote received from ${studentId} in poll ${pollId}`);

      if (!pollVoteCounts[pollId]) {
        pollVoteCounts[pollId] = new Set();
      }
      if (pollVoteCounts[pollId].has(studentId)) {
        console.log(`⚠️ Duplicate vote from ${studentId} ignored`);
        return;
      }

      pollVoteCounts[pollId].add(studentId);

      io.to(pollId).emit('poll_updated', updatedPoll);

      const totalStudents = connectedStudents[pollId]?.size || 0;
      const totalVotes = pollVoteCounts[pollId]?.size || 0;

      console.log(`📊 ${totalVotes}/${totalStudents} students have voted`);

      if (totalVotes >= totalStudents && totalStudents > 0) {
        console.log(`✅ All students voted in poll ${pollId}, ending poll`);
        io.to(pollId).emit('poll_ended', { pollId });
      }
    });

    socket.on('get_latest_poll', async () => {
      // Only include rooms that are valid Mongo ObjectIds (i.e., real poll rooms)
      const pollRooms = Array.from(socket.rooms).filter(
        (room) => room !== socket.id && isValidPollId(room)
      );
      const pollId = pollRooms[0];
      if (!pollId) return;
      try {
        const Poll = require('../models/Poll');
        const poll = await Poll.findById(pollId);
        if (poll) {
          socket.emit('poll_updated', poll);
        }
      } catch (error) {
        console.error('❌ Error fetching poll in get_latest_poll:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log('🔴 A user disconnected:', socket.id);
      for (const pollId in connectedStudents) {
        connectedStudents[pollId].delete(socket.id);
      }
    });
  });
};

// Export state for use in controller
module.exports.connectedStudents = connectedStudents;
module.exports.pollVoteCounts = pollVoteCounts;
