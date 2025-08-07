import React from "react";
import { useNavigate } from "react-router-dom";

const KickedOut = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-5">
      <div className="px-6 py-2 rounded-full bg-gradient-to-r from-purple-500 to-purple-700 text-white font-semibold mb-4">
        Intervue Poll
      </div>
      <h1 className="text-3xl font-bold mb-2 text-red-600">You&apos;ve been Kicked out!</h1>
      <p className="mb-6 text-gray-600 max-w-md">
        Looks like the teacher removed you from the poll system. Please try again sometime.
      </p>
      <button
        className="bg-purple-600 text-white rounded-full px-8 py-3 text-lg hover:bg-purple-700 transition"
        onClick={() => navigate("/")}
      >
        Go to Home
      </button>
    </div>
  );
};

export default KickedOut;
