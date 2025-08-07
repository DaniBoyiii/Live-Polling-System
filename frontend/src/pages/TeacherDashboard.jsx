import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ChatPopup from "../components/ChatPopup"; // Adjust import path if needed
import socket from "../socket";

const DEFAULT_TIMER = 60; // default timer in seconds

const timerOptions = [
  { label: "30 seconds", value: 30 },
  { label: "45 seconds", value: 45 },
  { label: "60 seconds", value: 60 },
  { label: "90 seconds", value: 90 },
  { label: "120 seconds", value: 120 },
];

const TeacherDashboard = () => {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState([
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
  ]);
  const [timer, setTimer] = useState(DEFAULT_TIMER);
  const [error, setError] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [pollStatus, setPollStatus] = useState({
    active: false,
    allVoted: false,
    expired: true,
  });

  const navigate = useNavigate();

  // Replace with actual logged-in teacher's username, here hardcoded for demo
  const username = "Teacher";
  const role = "teacher";

  // Fetch active poll status from backend
  const fetchPollStatus = async () => {
    try {
      const res = await axios.get("http://localhost:5001/api/polls/status");
      if (res.status === 200) {
        setPollStatus(res.data);
      } else {
        setPollStatus({ active: false, allVoted: false, expired: true });
      }
    } catch (err) {
      setPollStatus({ active: false, allVoted: false, expired: true });
    }
  };

  // Poll status fetch on load + poll every 10 seconds to keep updated
  useEffect(() => {
    fetchPollStatus();
    const interval = setInterval(fetchPollStatus, 10000); // every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const handleOptionText = (index, value) => {
    const updated = options.map((opt, i) =>
      i === index ? { ...opt, text: value } : opt
    );
    setOptions(updated);
  };

  const handleCorrect = (index, value) => {
    const updated = options.map((opt, i) =>
      i === index ? { ...opt, isCorrect: value } : opt
    );
    setOptions(updated);
  };

  const addOption = () => {
    if (options.length >= 6) return;
    setOptions([...options, { text: "", isCorrect: false }]);
  };

  const removeOption = (index) => {
    if (options.length <= 2) return;
    setOptions(options.filter((_, i) => i !== index));
  };

  const validOptions = options.filter((opt) => opt.text.trim());
  const canSubmit =
    question.trim() && validOptions.length >= 2 && validOptions.some((o) => o.isCorrect);

  // Enable Ask Question button only when allowed
  const canAskQuestion = !pollStatus.active || pollStatus.allVoted || pollStatus.expired;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!canSubmit) {
      setError("Enter question, at least 2 options, and a correct answer.");
      return;
    }
    if (!canAskQuestion) {
      setError("Cannot ask a new question until current poll ends or all students have voted.");
      return;
    }
    try {
      const response = await axios.post("http://localhost:5001/api/polls/create", {
        question: question.trim(),
        options: options.map((opt) => ({
          text: opt.text.trim(),
          isCorrect: !!opt.isCorrect,
          votes: 0,
        })),
        createdBy: "teacher",
        expiresAt: new Date(Date.now() + timer * 1000),
      });
      const poll = response.data;
      const pollId = poll._id;
      localStorage.setItem("pollId", pollId);
      socket.emit("join_poll", pollId);
      setTimeout(() => {
        navigate("/teacher/results");
      }, 300);
    } catch (err) {
      setError("Failed to create poll");
    }
  };

  return (
    <>
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F9FAFB]">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-md px-10 pb-16 pt-8 relative">
          <span className="inline-block mb-4 px-4 py-1 rounded-full bg-[#7765DA] text-white font-semibold text-sm shadow">
            ★ Intervue Poll
          </span>
          <h2 className="text-3xl font-black mb-2">
            Let’s <span className="text-black font-extrabold">Get Started</span>
          </h2>
          <div className="mb-8 text-[#868686] text-base">
            you’ll have the ability to create and manage polls, ask questions, and monitor your students' responses in real-time.
          </div>
          <form onSubmit={handleSubmit}>
            <div className="flex justify-between items-center mb-3">
              <label className="text-base font-bold mb-1">Enter your question</label>
              <select
                value={timer}
                onChange={(e) => setTimer(Number(e.target.value))}
                className="border border-[#D9DBE9] rounded-lg px-3 py-1 bg-white text-sm text-[#7765DA] font-semibold focus:outline-none"
              >
                {timerOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="relative mb-8">
              <textarea
                maxLength={100}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                rows={3}
                className="w-full bg-[#F5F6FA] resize-none border-none outline-none py-4 px-4 text-base rounded-lg focus:ring-[#7765DA] focus:ring-2"
                placeholder="Enter your question here"
              />
              <span className="absolute bottom-2 right-3 text-xs text-[#868686]">{question.length}/100</span>
            </div>
            <label className="text-base font-bold mb-3 block">Edit Options</label>
            <div className="grid grid-cols-7 items-center text-[15px] font-medium mb-2">
              <div className="col-span-3"> </div>
              <div className="col-span-4 text-center">Is it Correct?</div>
            </div>
            <div className="space-y-3 mb-4">
              {options.map((opt, idx) => (
                <div key={idx} className="grid grid-cols-7 gap-2 items-center">
                  <span className="flex items-center justify-center col-span-1 h-10 w-10 bg-[#7765DA] text-white rounded-full font-bold">{idx + 1}</span>
                  <input
                    type="text"
                    value={opt.text}
                    maxLength={50}
                    onChange={(e) => handleOptionText(idx, e.target.value)}
                    className="col-span-2 h-10 w-full px-4 bg-[#F5F6FA] rounded-lg border border-[#D9DBE9] focus:outline-none focus:ring-[#7765DA] focus:ring-2"
                    placeholder={`Option ${idx + 1}`}
                  />
                  <div className="col-span-4 flex gap-6 justify-center">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name={`isCorrect_${idx}`}
                        checked={opt.isCorrect === true}
                        onChange={() => handleCorrect(idx, true)}
                        className="accent-[#7765DA]"
                      />
                      <span className="text-[#7765DA] font-semibold">Yes</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name={`isCorrect_${idx}`}
                        checked={opt.isCorrect === false}
                        onChange={() => handleCorrect(idx, false)}
                        className="accent-[#B1B1B1]"
                      />
                      <span className="text-[#B1B1B1] font-semibold">No</span>
                    </label>
                    {options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(idx)}
                        className="ml-3 text-[#D7263D] text-xl font-bold"
                        title="Remove option"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {options.length < 6 && (
              <button
                type="button"
                onClick={addOption}
                className="block mt-2 ml-1 text-[#7765DA] hover:text-[#4F0DCE] text-sm font-semibold border border-[#7765DA] rounded-lg px-3 py-1"
              >
                + Add More option
              </button>
            )}
            {error && <p className="mt-4 text-red-500">{error}</p>}
            <button
              type="submit"
              disabled={!canAskQuestion || !canSubmit}
              className={`fixed right-16 bottom-10 px-7 py-2 rounded-full text-white font-bold text-lg shadow-lg transition ${
                canAskQuestion && canSubmit
                  ? "bg-gradient-to-r from-[#7765DA] to-[#4F0DCE] hover:opacity-90 cursor-pointer"
                  : "bg-gray-300 cursor-not-allowed"
              }`}
              style={{ zIndex: 50 }}
            >
              Ask Question
            </button>
          </form>
          
        </div>
      </div>

      {/* Chat Toggle Button */}
      <button
        className="fixed bottom-6 right-6 bg-purple-600 text-white p-4 rounded-full shadow-lg hover:brightness-90 z-50"
        onClick={() => setShowChat((prev) => !prev)}
        title="Toggle Chat"
      >
        💬
      </button>

      {/* Chat Popup */}
      {showChat && <ChatPopup socket={socket} username={username} role={role} onClose={() => setShowChat(false)} />}
    </>
  );
};

export default TeacherDashboard;
