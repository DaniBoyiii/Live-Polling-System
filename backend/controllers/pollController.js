let io;
const Poll = require('../models/Poll');
const pollSocket = require('../sockets/pollSocket');
const connectedStudents = pollSocket.connectedStudents;
const pollVoteCounts = pollSocket.pollVoteCounts;

// 👇 Set the Socket.IO instance
exports.setSocketIO = (ioInstance) => {
  io = ioInstance;
};


// 🔄 Create a new poll
exports.createPoll = async (req, res) => {
  console.log('📥 Received POST /api/polls/create');

  try {
    const { question, options, createdBy, expiresAt } = req.body;

    console.log('📝 Incoming Poll Data:', { question, options, createdBy, expiresAt });

    // Validate incoming data
    if (
      !question ||
      !Array.isArray(options) ||
      options.length < 2 ||
      !createdBy
    ) {
      console.error('❌ Missing required fields or invalid options');
      return res.status(400).json({ error: 'Missing required fields or invalid options' });
    }

    // Format options
    const formattedOptions = options.map((opt) => {
      if (typeof opt === 'string') return { text: opt, votes: 0 };
      if (typeof opt === 'object' && opt.text) return { text: opt.text, votes: 0 };
      return null;
    }).filter(Boolean);

    if (formattedOptions.length < 2) {
      console.error('❌ At least 2 valid options required');
      return res.status(400).json({ error: 'At least 2 valid options required' });
    }

    // Create poll object
    const poll = new Poll({
      question,
      options: formattedOptions,
      createdBy,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
    });

    const savedPoll = await poll.save();
    console.log('✅ Poll saved to MongoDB:', savedPoll._id);

    // Emit to students (if needed)
    if (io) {
      console.log(`[pollController] Emitting new_question event for poll ID: ${savedPoll._id.toString()}`);
      io.emit('new_question', savedPoll);
    }

    res.status(201).json(savedPoll);
  } catch (err) {
    console.error('🔥 Error in createPoll:', err.message);
    res.status(500).json({ error: err.message });
  }
};


// 📋 Get all polls
exports.getPolls = async (req, res) => {
  try {
    const polls = await Poll.find().sort({ createdAt: -1 });
    res.status(200).json(polls);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// 🗳️ Submit vote
exports.votePoll = async (req, res) => {
  try {
    const { pollId } = req.params;
    const { studentId, selectedOptionIndex } = req.body;

    const poll = await Poll.findById(pollId);
    if (!poll) return res.status(404).json({ message: 'Poll not found' });

    if (poll.responses.find((r) => r.studentId === studentId)) {
      return res.status(400).json({ message: 'You have already voted' });
    }

    poll.options[selectedOptionIndex].votes += 1;
    poll.responses.push({ studentId, selectedOptionIndex });

    await poll.save();

    if (io) {
      io.to(pollId).emit('poll_updated', poll);
    }

    res.status(200).json(poll);
  } catch (err) {
    console.error('🔥 Error in votePoll:', err.message);
    res.status(500).json({ error: err.message });
  }
};


// 🟢 Get the latest active poll
exports.getActivePoll = async (req, res) => {
  try {
    const poll = await Poll.findOne().sort({ createdAt: -1 });
    if (poll) {
      res.json({ pollId: poll._id.toString(), poll });
    } else {
      res.json({ pollId: null });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// 🕰️ Get poll history (all polls)
exports.getPollHistory = async (req, res) => {
  try {
    const polls = await Poll.find({}).sort({ createdAt: 1 });
    res.json({ polls });
  } catch (err) {
    console.error('🔥 Error fetching poll history:', err.message);
    res.status(500).json({ error: 'Failed to fetch poll history' });
  }
};


// 🔍 Get poll by ID
exports.getPollById = async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.pollId);
    if (!poll) {
      return res.status(404).json({ message: 'Poll not found' });
    }
    res.json(poll);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ⚙️ New: Get Status of Active Poll (for enabling Ask Question button)
exports.getPollStatus = async (req, res) => {
  try {
    const poll = await Poll.findOne().sort({ createdAt: -1 });
    if (!poll) return res.json({ active: false });

    const pollId = poll._id.toString();
    const totalStudents = connectedStudents[pollId]?.size || 0;
    const totalVotes = pollVoteCounts[pollId]?.size || 0;
    const now = new Date();

    const expired = poll.expiresAt ? poll.expiresAt < now : false;
    const allVoted = totalVotes >= totalStudents && totalStudents > 0;

    res.json({
      active: true,
      pollId,
      question: poll.question,
      totalStudents,
      totalVotes,
      expired,
      allVoted,
      expiresAt: poll.expiresAt,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
