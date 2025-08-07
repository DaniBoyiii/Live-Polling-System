const express = require('express');
const {
  createPoll,
  votePoll,
  getPolls,
  getActivePoll,
  getPollHistory,
  getPollById,
  getPollStatus  // <-- Add this here!
} = require('../controllers/pollController');

module.exports = (io) => {
  const router = express.Router();

  router.get('/test', (req, res) => {
    res.json({ message: 'Test route is working' });
  });

  router.post('/create', createPoll);
  router.post('/:pollId/vote', votePoll);
  router.get('/', getPolls);
  router.get('/active', getActivePoll);
  router.get('/history', getPollHistory);
  router.get('/status', getPollStatus);  // <-- Your new route

  // Route to fetch poll by ID
  router.get('/:pollId', getPollById);

  return router;
};
