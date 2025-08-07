// src/pages/LiveResults.jsx

import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const LiveResults = ({ socket }) => {
  const [questionData, setQuestionData] = useState(null);
  const [answerCounts, setAnswerCounts] = useState({});
  const [totalResponses, setTotalResponses] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  const pollId = new URLSearchParams(location.search).get('pollId');

  useEffect(() => {
    if (!socket || !pollId) return;

    socket.emit('join_poll', pollId); // ✅ Join room to receive updates

    socket.on('new_question', (data) => {
      console.log("🟢 Received new_question:", data);
      setQuestionData(data);
      setAnswerCounts({});
      setTotalResponses(0);
    });

    socket.on('poll_updated', (updatedPoll) => {
      console.log("📥 Received poll_updated:", updatedPoll);

      const answerTally = {};
      let total = 0;

      updatedPoll.answers?.forEach(ans => {
        const selectedText = updatedPoll.options[ans.selectedOptionIndex]?.text;
        if (selectedText) {
          answerTally[selectedText] = (answerTally[selectedText] || 0) + 1;
          total++;
        }
      });

      setAnswerCounts(answerTally);
      setTotalResponses(total);
    });

    return () => {
      socket.off('new_question');
      socket.off('poll_updated');
    };
  }, [socket, pollId]);

  if (!questionData || !Array.isArray(questionData.options) || questionData.options.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center text-xl text-gray-600">
        Waiting to start poll...
      </div>
    );
  }

  const renderBar = (optionObj, idx) => {
    const label = optionObj?.text || optionObj;
    const count = answerCounts[label] || 0;
    const percent = totalResponses > 0 ? (count / totalResponses) * 100 : 0;

    return (
      <div key={idx} className="mb-4">
        <div className="text-sm font-medium mb-1">{label}</div>
        <div className="w-full bg-gray-200 rounded-full h-5 overflow-hidden">
          <div
            className="bg-blue-600 h-full text-white text-xs flex items-center justify-center rounded-full"
            style={{ width: `${percent}%`, transition: 'width 0.5s' }}
          >
            {count}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F9FAFB] px-4">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-2xl">
        <h2 className="text-2xl font-bold mb-6">{questionData.question}</h2>
        <div className="mb-6">
          {questionData.options?.map((opt, idx) => renderBar(opt, idx))}
        </div>
        <div className="text-sm text-gray-500">Total Responses: {totalResponses}</div>
        <button
          className="mt-6 py-2 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          onClick={() => navigate('/teacher')}
        >
          Ask New Question
        </button>
      </div>
    </div>
  );
};

export default LiveResults;
