import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const roles = [
  {
    key: 'student',
    title: "I'm a Student",
    description: "Submit answers and view live poll results in real-time.",
    bg: 'bg-primaryDark',           // Deep purple (#4F0DCE)
    border: 'border-primaryDark',
  },
  {
    key: 'teacher',
    title: "I'm a Teacher",
    description: "Create polls and manage them, view live results in real-time.",
    bg: 'bg-primaryLight',          // Light purple (#7765DA)
    border: 'border-primaryLight',
  },
];

const RoleSelection = () => {
  const [selectedRole, setSelectedRole] = useState(null);
  const navigate = useNavigate();

  const handleContinue = () => {
    if (selectedRole === 'student') {
      navigate('/student/name');
    } else if (selectedRole === 'teacher') {
      navigate('/teacher');
    }
  };

  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-backgroundLight px-4">
      {/* Add sharp text class to fix blurry text issue */}
      <style>
        {`
          .text-sharp {
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            transform: translateZ(0);
          }
        `}
      </style>

      <div className="max-w-xl w-full text-center">
        <div className="inline-block mb-4 px-3 py-1 rounded-full text-sm font-medium text-white bg-primaryDark shadow text-sharp">
          Intervue Poll
        </div>

        <h1 className="text-3xl font-extrabold mb-2 tracking-tight text-sharp">
          Welcome to the <span className="font-black">Live Polling System</span>
        </h1>

        <p className="mb-8 text-base text-textGray text-sharp">
          Please select the role that best describes you to begin using the live polling system
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-6 mb-10">
          {roles.map(({ key, title, description, bg, border }) => {
            const isSelected = selectedRole === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedRole(key)}
                className={`
                  flex-1 min-w-[180px] max-w-xs px-6 py-6 rounded-2xl
                  ${bg} ${isSelected ? 'ring-4 ring-primary' : ''}
                  border-2 ${border} shadow-md
                  flex flex-col items-start justify-center transition-all duration-150
                  text-white cursor-pointer
                  hover:opacity-100 hover:scale-105 text-sharp
                `}
                style={{ outline: isSelected ? undefined : 'none' }}
                tabIndex={0}
              >
                <div className="text-lg font-semibold mb-1">{title}</div>
                <div className="text-sm font-normal opacity-90">{description}</div>
              </button>
            );
          })}
        </div>

        <button
          onClick={handleContinue}
          disabled={!selectedRole}
          className={`block w-full sm:w-64 mx-auto py-3 rounded-full mt-0 text-white font-semibold text-lg shadow-lg transition ${
            selectedRole
              ? 'bg-gradient-to-r from-primaryLight to-primaryDark hover:from-primary hover:to-primaryDark cursor-pointer'
              : 'bg-gray-300 cursor-not-allowed'
          } text-sharp`}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default RoleSelection;
