import React, { useEffect, useState } from 'react';
import socket from '../socket';

function StudentPollView() {
  const [poll, setPoll] = useState(null);
  const [pollEnded, setPollEnded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [studentId, setStudentId] = useState(sessionStorage.getItem('studentName') || '');

  useEffect(() => {
    async function fetchActivePoll() {
      try {
        const res = await fetch('http://localhost:5001/api/polls/active');
        const data = await res.json();

        if (data.pollId) {
          setPoll(data.poll);
          sessionStorage.setItem('pollId', data.pollId);
          socket.emit('join_poll', data.pollId);
          setPollEnded(false);
        } else {
          setPoll(null);
          setPollEnded(false);
        }
      } catch (error) {
        console.error('Error fetching active poll:', error);
      }
      setLoading(false);
    }

    fetchActivePoll();

    const handleNewQuestion = (newPoll) => {
      console.log('Received new_question event:', newPoll);
      setPoll(newPoll);
      sessionStorage.setItem('pollId', newPoll._id);
      socket.emit('join_poll', newPoll._id);
      setPollEnded(false);
    };

    const handlePollUpdated = (updatedPoll) => {
      console.log('Received poll_updated event:', updatedPoll);
      if (poll && updatedPoll._id === poll._id) {
        setPoll(updatedPoll);
      }
    };

    const handlePollEnded = ({ pollId }) => {
      console.log('Received poll_ended event:', pollId);
      if (poll && poll._id === pollId) {
        setPollEnded(true);
      }
    };

    socket.on('new_question', handleNewQuestion);
    socket.on('poll_updated', handlePollUpdated);
    socket.on('poll_ended', handlePollEnded);

    return () => {
      socket.off('new_question', handleNewQuestion);
      socket.off('poll_updated', handlePollUpdated);
      socket.off('poll_ended', handlePollEnded);
    };
  }, [poll]);

  const handleVote = async (selectedOptionIndex) => {
    if (!studentId.trim()) {
      alert('Please enter your name in the Enter Name page first.');
      return;
    }
    if (pollEnded) {
      alert('Poll has ended. Voting is closed.');
      return;
    }
    const pollId = sessionStorage.getItem('pollId');
    if (!pollId) {
      alert('No active poll to vote on.');
      return;
    }

    try {
      const res = await fetch(`http://localhost:5001/api/polls/${pollId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, selectedOptionIndex }),
      });
      if (res.ok) {
        console.log('Vote submitted');
      } else {
        const errorData = await res.json();
        alert(errorData.message || 'Error submitting vote');
      }
    } catch (err) {
      console.error('Error submitting vote:', err);
    }
  };

  if (loading) {
    return <p>Loading poll data...</p>;
  }

  if (!poll) {
    return <p>No active poll at the moment. Please wait for the teacher.</p>;
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>📊 Live Poll (Student View)</h2>
      <h3>{poll.question}</h3>
      <ul>
        {poll.options.map((opt, idx) => (
          <li key={idx}>
            <button onClick={() => handleVote(idx)} disabled={pollEnded}>
              {opt.text}
            </button>{' '}
            <strong>({opt.votes} votes)</strong>
          </li>
        ))}
      </ul>
      {pollEnded && <p style={{ color: 'red' }}>⏰ Poll ended. Thank you for participating!</p>}
      <p><em>Created by: {poll.createdBy}</em></p>
    </div>
  );
}

export default StudentPollView;
