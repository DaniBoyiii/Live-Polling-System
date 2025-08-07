// src/App.jsx
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';

import socket from './socket';

import RoleSelection from './pages/RoleSelection';
import EnterName from './pages/EnterName';
import QuestionAnswer from './pages/QuestionAnswer';
import StudentResult from './pages/StudentResult';
import TeacherDashboard from './pages/TeacherDashboard';
import TeacherResults from './pages/TeacherResults';
import PollHistory from './pages/PollHistory';
import KickedOut from './pages/KickedOut';

import ChatPopup from './components/ChatPopup';

function AppWrapper() {
  const location = useLocation();
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  const chatEnabledPaths = [
    '/student/answer',
    '/student/result',
    '/teacher',
    '/teacher/results',
    '/teacher/history',
  ];

  const showChatOnCurrentPath = chatEnabledPaths.some((path) => location.pathname.startsWith(path));

  const username = sessionStorage.getItem('studentName') || 'Guest';
  const role = location.pathname.startsWith('/teacher') ? 'teacher' : 'student';

  // Setup global socket listeners
  useEffect(() => {
    socket.emit('join_chat', { username, role });

    const onNewMessage = (data) => {
      setMessages((prev) => [...prev, data]);
    };

    const onUsersUpdate = (usersList) => {
      setUsers(usersList);
    };

    const onKickedOut = () => {
      alert("You have been kicked out by the teacher.");
      navigate('/kicked-out');
    };

    socket.on('chat_message', onNewMessage);
    socket.on('chat_users', onUsersUpdate);
    socket.on('kicked_out', onKickedOut);

    return () => {
      socket.off('chat_message', onNewMessage);
      socket.off('chat_users', onUsersUpdate);
      socket.off('kicked_out', onKickedOut);
    };
  }, [username, role, navigate]);

  return (
    <>
      <Routes>
        <Route path="/" element={<RoleSelection />} />
        <Route path="/student/name" element={<EnterName socket={socket} />} />
        <Route path="/student/answer" element={<QuestionAnswer socket={socket} />} />
        <Route path="/student/result" element={<StudentResult socket={socket} />} />
        <Route path="/teacher" element={<TeacherDashboard socket={socket} />} />
        <Route path="/teacher/results" element={<TeacherResults socket={socket} />} />
        <Route path="/teacher/history" element={<PollHistory />} />
        <Route path="/kicked-out" element={<KickedOut />} />
      </Routes>

      {showChatOnCurrentPath && (
        <>
          <button
            className="fixed bottom-6 right-6 bg-purple-600 text-white p-4 rounded-full shadow-lg hover:brightness-90 z-50"
            onClick={() => setShowChat(!showChat)}
            title="Toggle Chat"
          >
            💬
          </button>

          {showChat && (
            <ChatPopup
              socket={socket}
              username={username}
              role={role}
              messages={messages}
              users={users}
              onClose={() => setShowChat(false)}
            />
          )}
        </>
      )}
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
}
