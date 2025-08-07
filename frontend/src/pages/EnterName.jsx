import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const EnterName = ({ socket }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState(null);
  const [hasSubmitted, setHasSubmitted] = useState(false); // track submit attempts with rejection
  const navigate = useNavigate();

  useEffect(() => {
    if (!socket) return;

    const onUsernameTaken = (data) => {
      if (hasSubmitted) {
        setError(data.message || 'Username already taken, please choose another.');
      }
    };

    const onJoinSuccess = () => {
      setError(null);
      setHasSubmitted(false);
      sessionStorage.setItem('studentName', name.trim());

      (async () => {
        let pollId = sessionStorage.getItem('pollId');

        if (!pollId) {
          try {
            const res = await fetch('http://localhost:5001/api/polls/active');
            if (res.ok) {
              const data = await res.json();
              pollId = data.poll?._id;
              if (pollId) {
                sessionStorage.setItem('pollId', pollId);
                socket.emit('join_poll', pollId);
              }
            }
          } catch (e) {
            console.error('Error fetching active poll:', e);
          }
        } else {
          socket.emit('join_poll', pollId);
        }
        navigate('/student/answer', { state: { pollId, studentName: name.trim() } });
      })();
    };

    socket.on('username_taken', onUsernameTaken);
    socket.on('join_success', onJoinSuccess);

    return () => {
      socket.off('username_taken', onUsernameTaken);
      socket.off('join_success', onJoinSuccess);
    };
  }, [socket, name, navigate, hasSubmitted]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setHasSubmitted(true);
    setError(null); // clear error on new attempt
    socket.emit('join_chat', { username: name.trim(), role: 'student' });
  };

  const handleChange = (e) => {
    setName(e.target.value);
    setError(null);
    setHasSubmitted(false); // reset error state so no stale error shows
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-backgroundLight px-4">
      <div className="w-full max-w-lg md:max-w-md text-center">
        <span className="inline-block mb-4 px-4 py-1 rounded-full bg-primaryDark text-white font-semibold text-sm shadow">
          Intervue Poll
        </span>
        <h1 className="text-3xl font-extrabold mb-2">
          Let’s <span className="font-black">Get Started</span>
        </h1>
        <p className="mb-8 text-textGray text-base">
          If you’re a student, you’ll be able to{' '}
          <span className="font-bold text-textDark">submit your answers</span>, participate in live polls, and see how your responses compare with your classmates
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col items-center">
          <label className="block w-full max-w-xs mx-auto text-left mb-2 font-semibold text-textDark">
            Enter your Name
          </label>
          <input
            type="text"
            placeholder="Your name"
            value={name}
            maxLength={50}
            onChange={handleChange}
            className="w-full max-w-xs p-3 rounded-md bg-backgroundLight border border-gray-200 mb-8 focus:border-primary focus:outline-none transition placeholder-gray-400"
          />
          {error && <div className="mb-2 text-red-600">{error}</div>}
          <button
            type="submit"
            disabled={!name.trim()}
            className={`w-full max-w-xs py-3 rounded-full font-semibold text-white text-lg shadow transition ${
              name.trim()
                ? 'bg-gradient-to-r from-primaryLight to-primaryDark hover:brightness-105 cursor-pointer'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  );
};

export default EnterName;
