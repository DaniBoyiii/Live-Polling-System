import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const QuestionAnswer = ({ socket }) => {
  const [questionData, setQuestionData] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [timer, setTimer] = useState(60);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();
  const studentName = sessionStorage.getItem('studentName');
  const timerRef = useRef(null);

  // Flag to avoid repeated join_poll emits
  const hasJoinedPollRef = React.useRef(false);

  useEffect(() => {
    if (!socket) return;

    async function fetchActivePoll() {
      try {
        const res = await fetch('http://localhost:5001/api/polls/active');
        if (res.ok) {
          const data = await res.json();
          if (data.poll) {
            setQuestionData(data.poll);
            sessionStorage.setItem('pollId', data.poll._id);
          } else {
            setQuestionData(null);
          }
        }
      } catch {
        setQuestionData(null);
      }
    }

    fetchActivePoll();
  }, [socket]);

  // Emit join_poll once when questionData updates and once only
  useEffect(() => {
    if (questionData && socket && !hasJoinedPollRef.current) {
      socket.emit('join_poll', questionData._id);
      hasJoinedPollRef.current = true;
      setSubmitted(false);
      setSelectedIndex(null);
      setTimer(computeInitialTimer(questionData.expiresAt));
    }
  }, [questionData, socket]);

  // Handle socket events for poll updates and new question
  useEffect(() => {
    if (!socket) return;

    const handleNewQuestion = (data) => {
      hasJoinedPollRef.current = false; // reset for new poll
      setQuestionData(data);
      setSelectedIndex(null);
      setSubmitted(false);
      setTimer(computeInitialTimer(data.expiresAt));
      navigate('/student/answer');
    };

    const handlePollEnded = () => {
      navigate('/student/result', { state: { pollId: questionData?._id || sessionStorage.getItem('pollId'), studentName } });
    };

    socket.on('new_question', handleNewQuestion);
    socket.on('poll_ended', handlePollEnded);

    return () => {
      socket.off('new_question', handleNewQuestion);
      socket.off('poll_ended', handlePollEnded);
    };
  }, [socket, navigate, questionData, studentName]);

  // Timer logic controlling countdown and auto-submit on expiry
  useEffect(() => {
    if (!questionData || submitted) return;
    if (!questionData.expiresAt) return;

    const expireTime = new Date(questionData.expiresAt).getTime();

    const updateTimer = () => {
      const now = Date.now();
      const remainingSeconds = Math.max(0, Math.floor((expireTime - now) / 1000));
      setTimer(remainingSeconds);

      if (remainingSeconds === 0 && !submitted) {
        handleSubmit();
      }
    };

    updateTimer();
    timerRef.current = setInterval(updateTimer, 1000);

    return () => clearInterval(timerRef.current);
  }, [questionData, submitted]);

  // Helper to compute initial timer
  const computeInitialTimer = (expiresAt) => {
    if (!expiresAt) return 60;
    const expireTime = new Date(expiresAt).getTime();
    const now = Date.now();
    const seconds = Math.max(0, Math.floor((expireTime - now) / 1000));
    return seconds || 60;
  };

  // Handle vote submission
  const handleSubmit = async () => {
    if (submitted || selectedIndex === null || !studentName || !questionData) return;

    setSubmitted(true);

    try {
      const response = await fetch(`http://localhost:5001/api/polls/${questionData._id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: studentName,
          selectedOptionIndex: selectedIndex,
        }),
      });

      if (response.ok) {
        const updatedPoll = await response.json();
        socket.emit('vote_cast', {
          pollId: questionData._id,
          studentId: studentName,
          updatedPoll,
        });
        sessionStorage.setItem('pollId', questionData._id);
        navigate('/student/result', { state: { pollId: questionData._id, studentName } });
      } else {
        const data = await response.json();
        alert(data.message || 'Something went wrong');
        setSubmitted(false);
      }
    } catch {
      alert('Server error');
      setSubmitted(false);
    }
  };

  // Format timer display MM:SS
  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (!questionData) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Waiting for the teacher to ask a question...
      </div>
    );
  }

  const pollExpired = timer === 0;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-backgroundLight px-4">
      <div className="max-w-xl w-full">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-lg">Question 1</h3>
          <div className={`font-mono font-semibold text-lg ${pollExpired ? 'text-red-600' : 'text-black'}`}>
            {formatTimer(timer)}
          </div>
        </div>
        <div className="bg-gray-700 text-white rounded-t-xl py-3 px-6 font-semibold">
          {questionData.question}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!pollExpired) {
              handleSubmit();
            } else {
              alert('Poll has expired and cannot be answered.');
            }
          }}
          className="bg-white border border-gray-300 rounded-b-xl px-6 py-5"
        >
          <div className="space-y-3">
            {questionData.options.map((option, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => !submitted && !pollExpired && setSelectedIndex(idx)}
                  disabled={submitted || pollExpired}
                  className={`w-full flex items-center gap-4 rounded-md border-2 px-4 py-3 text-left ${
                    isSelected
                      ? 'border-primaryDark ring-1 ring-primaryDark bg-white'
                      : 'border-gray-200 bg-backgroundLight'
                  } focus:outline-none transition`}
                >
                  <div
                    className={`h-8 w-8 flex justify-center items-center rounded-full font-bold ${
                      isSelected ? 'bg-primaryLight border-primaryDark text-white' : 'bg-gray-300 border-gray-300 text-gray-700'
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <span>{option.text}</span>
                </button>
              );
            })}
          </div>
          <button
            type="submit"
            disabled={selectedIndex === null || submitted || pollExpired}
            className={`mt-6 w-full rounded-full py-3 text-white font-semibold shadow-lg ${
              selectedIndex !== null && !submitted && !pollExpired
                ? 'bg-gradient-to-r from-primaryLight to-primaryDark hover:brightness-110 cursor-pointer'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            Submit
          </button>
          {pollExpired && (
            <p className="mt-3 text-red-600 font-semibold text-center">Poll expired. You cannot submit now.</p>
          )}
        </form>
      </div>
    </div>
  );
};

export default QuestionAnswer;
