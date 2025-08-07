import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const PollHistory = () => {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchPolls() {
      try {
        const res = await axios.get("http://localhost:5001/api/polls/history");
        setPolls(res.data.polls || []);
      } catch (err) {
        setPolls([]);
      } finally {
        setLoading(false);
      }
    }
    fetchPolls();
  }, []);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Loading poll history...
      </div>
    );

  return (
    <div className="max-w-2xl mx-auto py-10 px-4 min-h-screen bg-white">
      <h1 className="text-3xl font-bold mb-8">
        View <span className="font-black">Poll History</span>
      </h1>
      {polls.map((poll, idx) => {
        const totalVotes = poll.options.reduce((a, opt) => a + (opt.votes || 0), 0) || 1;
        return (
          <div key={poll._id} className="mb-12">
            <div className="mb-2 font-bold text-lg">{`Question ${idx + 1}`}</div>
            <div className="bg-white rounded-xl shadow-md border border-[#E5E7EB] max-w-xl">
              <div className="bg-[#373737] rounded-t-xl py-3 px-6 text-white font-semibold">
                {poll.question}
              </div>
              <div className="bg-white px-6 pt-7 pb-3 space-y-4">
                {poll.options.map((opt, j) => {
                  const percent = ((opt.votes || 0) / totalVotes) * 100;
                  return (
                    <div
                      key={j}
                      className="flex items-center bg-[#F6F6FA] rounded-lg h-12 mb-2 border border-[#E5E7EB] relative"
                      style={{ minHeight: 48 }}
                    >
                      <div className="flex justify-center items-center font-bold text-white w-10 h-10 rounded-full bg-[#847BCE] ml-4">
                        {j + 1}
                      </div>
                      <div className="relative flex-1 ml-4 mr-4 h-10 flex items-center">
                        <div
                          className="absolute left-0 top-0 h-10 rounded-md bg-[#847BCE] transition-all duration-300"
                          style={{
                            width: `${percent}%`,
                            zIndex: 1,
                            opacity: percent > 0 ? 1 : 0.1,
                            borderRadius: "0.6rem"
                          }}
                        />
                        <span className="relative z-10 font-semibold text-base pl-5" style={{ color: percent > 0 ? "#fff" : "#373737" }}>
                          {opt.text}
                        </span>
                      </div>
                      <div className="w-16 text-right pr-6 font-semibold text-[#847BCE] text-lg">
                        {Math.round(percent)}%
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
      {/* Add New Question Button */}
      <div className="w-full flex justify-center mt-16 mb-6">
        <button
          onClick={() => navigate('/teacher')}
          className="px-12 py-3 bg-gradient-to-r from-[#9487f2] to-[#8875e9] text-white rounded-full font-bold shadow-lg text-lg hover:brightness-110"
        >
          + Ask a new question
        </button>
      </div>
    </div>
  );
};

export default PollHistory;
