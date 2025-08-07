import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const TeacherResults = ({ socket }) => {
  const navigate = useNavigate();
  const [pollData, setPollData] = useState(null);
  const [pollEnded, setPollEnded] = useState(false);
  const [loading, setLoading] = useState(true);

  const pollDataRef = useRef(pollData);
  pollDataRef.current = pollData;

  useEffect(() => {
    let isMounted = true;

    async function loadActivePoll() {
      try {
        const res = await fetch('http://localhost:5001/api/polls/active');
        const data = await res.json();
        if (isMounted && data.poll) {
          setPollData(data.poll);
          setLoading(false);
          socket.emit('join_poll', data.poll._id);
          socket.emit('get_latest_poll');
        } else if (isMounted) {
          setLoading(false);
          setPollData(null);
        }
      } catch (error) {
        if (isMounted) {
          setLoading(false);
          setPollData(null);
        }
      }
    }

    loadActivePoll();

    const onPollUpdated = (data) => setPollData(data);
    const onNewQuestion = (data) => {
      setPollData(data);
      setPollEnded(false);
      socket.emit('join_poll', data._id);
      socket.emit('get_latest_poll');
    };
    const onPollEnded = ({ pollId }) => {
      if (pollDataRef.current && pollId === pollDataRef.current._id) setPollEnded(true);
    };

    socket.on('poll_updated', onPollUpdated);
    socket.on('new_question', onNewQuestion);
    socket.on('poll_ended', onPollEnded);

    return () => {
      isMounted = false;
      socket.off('poll_updated', onPollUpdated);
      socket.off('new_question', onNewQuestion);
      socket.off('poll_ended', onPollEnded);
    };
  }, [socket, navigate]);

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center text-gray-600">
        Loading active poll results...
      </div>
    );

  if (!pollData)
    return (
      <div className="h-screen flex flex-col items-center justify-center text-gray-600">
        <p>No active poll available.</p>
        <button
          onClick={() => navigate('/teacher')}
          className="mt-4 px-8 py-3 rounded-full font-semibold text-white bg-gradient-to-r from-[#7765DA] to-[#4F0DCE] hover:brightness-110"
        >
          + Ask a new question
        </button>
      </div>
    );

  const votes = pollData.options.map(opt => opt.votes || 0);
  const totalVotes = votes.reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-white relative">
      {/* Poll History Button */}
      <button
        onClick={() => navigate('/teacher/history')}
        className="absolute top-16 right-32 px-7 py-2 bg-[#9B7CFA] text-white font-semibold rounded-full shadow text-base hover:brightness-110 transition"
        style={{ minWidth: 180 }}
      >
        <span className="mr-2 align-middle">👁‍🗨</span> View Poll history
      </button>

      <div className="flex flex-col items-center w-full">
        <div className="font-bold text-xl mb-4 text-left w-[640px] max-w-full" style={{marginLeft:"15px"}}>Question</div>
        <div className="mx-auto bg-white rounded-xl shadow-lg border border-[#E5E7EB] w-[640px] max-w-full overflow-visible">
          {/* Question header */}
          <div className="bg-[#373737] rounded-t-xl py-3 px-6 text-white font-semibold text-left text-base">
            {pollData.question}
          </div>
          <div className="bg-white px-6 pt-7 pb-3 space-y-4">
            {pollData.options.map((opt, idx) => {
              const voteCount = votes[idx];
              const percent = totalVotes ? ((voteCount / totalVotes) * 100).toFixed(0) : 0;
              return (
                <div
                  key={idx}
                  className="flex items-center bg-[#F6F6FA] rounded-lg h-12 mb-2 border border-[#E5E7EB] relative"
                  style={{ minHeight: 48 }}
                >
                  {/* Number badge */}
                  <div className="flex justify-center items-center font-bold text-white w-10 h-10 rounded-full bg-[#847BCE] ml-4">
                    {idx + 1}
                  </div>
                  {/* Option bar */}
                  <div className="relative flex-1 ml-4 mr-4 h-10 flex items-center">
                    <div
                      className="absolute left-0 top-0 h-10 rounded-md bg-[#847BCE] transition-all duration-300"
                      style={{
                        width: `${percent}%`,
                        zIndex: 1,
                        opacity: percent > 0 ? 1 : 0.05,
                        borderRadius: '0.6rem'
                      }}
                    />
                    <span className="relative z-10 font-semibold text-base pl-5" style={{ color: percent > 0 ? '#fff' : '#373737' }}>
                      {opt.text}
                    </span>
                  </div>
                  <div className="w-16 text-right pr-6 font-semibold text-[#847BCE] text-lg">
                    {percent}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Ask Question Button, bottom right of card */}
        <div className="w-[640px] max-w-full flex justify-end mt-8">
          <button
            onClick={() => navigate('/teacher')}
            className="px-12 py-3 bg-gradient-to-r from-[#9487f2] to-[#8875e9] text-white rounded-full font-bold shadow-lg text-lg hover:brightness-110"
          >
            + Ask a new question
          </button>
        </div>

        {pollEnded && (
          <div className="mb-8 mt-10 text-center font-semibold text-red-600 text-base">
            Poll has ended.
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherResults;
