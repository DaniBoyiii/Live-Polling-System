import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const StudentResult = ({ socket }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Get pollId and studentName from navigation state or sessionStorage
  const storedPollId = location.state?.pollId || sessionStorage.getItem('pollId');
  const storedStudentName = location.state?.studentName || sessionStorage.getItem('studentName');

  const [pollData, setPollData] = useState(null);

  useEffect(() => {
    if (!storedPollId) {
      // Redirect to home if no pollId is found
      navigate('/');
      return;
    }

    // Function to fetch poll data explicitly by pollId
    const fetchPollData = async () => {
      try {
        const response = await fetch(`http://localhost:5001/api/polls/${storedPollId}`);
        if (response.ok) {
          const data = await response.json();
          setPollData(data);
        } else {
          console.error('Failed to fetch poll data');
        }
      } catch (error) {
        console.error('Error fetching poll data:', error);
      }
    };

    // Initial fetch on mount
    fetchPollData();

    // Join poll room to receive live updates
    socket.emit('join_poll', storedPollId);
    socket.emit('get_latest_poll');

    // Listen for poll updates and update state immediately
    const handlePollUpdated = (data) => {
      setPollData(data);
    };

    // If a new question starts, navigate to the answer page
    const handleNewQuestion = () => {
      navigate('/student/answer');
    };

    socket.on('poll_updated', handlePollUpdated);
    socket.on('new_question', handleNewQuestion);

    return () => {
      socket.off('poll_updated', handlePollUpdated);
      socket.off('new_question', handleNewQuestion);
    };
  }, [storedPollId, socket, navigate]);

  if (!pollData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-backgroundLight text-gray-600 p-4">
        Waiting for poll data...
      </div>
    );
  }

  // Calculate votes and percentages
  const votes = pollData.options.map((opt) => opt.votes || 0);
  const totalVotes = votes.reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-backgroundLight px-4">
      <div className="max-w-xl w-full">
        <div className="flex items-center mb-2 ml-1">
          <span className="font-bold text-base">Question</span>
        </div>

        <div className="border border-[#776DA] rounded-2xl overflow-hidden shadow-sm">
          <div className="bg-[#373737] text-white rounded-t-2xl py-3 px-6 font-semibold text-left text-base">
            {pollData.question}
          </div>
          <div className="bg-white py-4 px-4 space-y-3">
            {pollData.options.map((opt, idx) => {
              const voteCount = votes[idx];
              const percent = totalVotes ? (voteCount / totalVotes) * 100 : 0;
              return (
                <div key={idx} className="flex items-center mb-1 last:mb-0">
                  <div className="flex items-center justify-center w-9 h-9 bg-[#776DA] text-white rounded-full font-bold text-base mr-3">
                    {idx + 1}
                  </div>
                  <div className="relative flex-grow min-h-[36px]">
                    <div
                      className="absolute top-0 left-0 h-full rounded-md bg-gradient-to-r from-[#857ED6] to-[#4EACE0] transition-all duration-300"
                      style={{ width: `${percent}%`, opacity: percent > 0 ? 1 : 0 }}
                    />
                    <div
                      className="relative z-10 flex items-center h-full px-4 font-semibold text-base"
                      style={{ color: percent > 0 ? '#fff' : '#373737' }}
                    >
                      {opt.text}
                    </div>
                  </div>
                  <div className="w-14 text-right pr-2 font-semibold text-[#4EACE0] text-base">
                    {Math.round(percent)}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-8 text-center text-lg font-semibold">
          Wait for the next question from the teacher…
        </div>
      </div>
    </div>
  );
};

export default StudentResult;
