import React, { useState, useRef, useEffect } from 'react';

const ChatPopup = ({ socket, username, role, users = [], messages = [], onClose }) => {
  const [activeTab, setActiveTab] = useState('chat');
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeTab]);

  const sendMessage = () => {
    if (message.trim() === '') return;
    const msgData = {
      username,
      role,
      message: message.trim(),
      timestamp: new Date().toISOString(),
    };
    socket.emit('chat_message', msgData);
    setMessage('');
  };

  const handleKickOut = (socketId, usernameToKick) => {
    if (window.confirm(`Are you sure you want to kick out ${usernameToKick}?`)) {
      socket.emit('kick_user', { socketId });
    }
  };

  return (
    <div className="fixed bottom-16 right-6 w-80 bg-white shadow-lg rounded-lg border border-gray-300 flex flex-col overflow-hidden z-50">
      <div className="flex border-b border-gray-200 justify-between items-center px-2">
        <div className="flex w-full">
          <button
            className={`flex-1 py-2 text-center font-semibold ${
              activeTab === 'chat' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-400'
            }`}
            onClick={() => setActiveTab('chat')}
          >
            Chat
          </button>
          <button
            className={`flex-1 py-2 text-center font-semibold ${
              activeTab === 'users' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-400'
            }`}
            onClick={() => setActiveTab('users')}
          >
            Participants
          </button>
        </div>
        <button
          className="p-1 text-gray-400 hover:text-gray-600"
          aria-label="Close"
          onClick={onClose}
          title="Close"
        >
          ✕
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-64 bg-white">
        {activeTab === 'chat' && (!messages || messages.length === 0) && (
          <div className="text-gray-600 text-center text-sm select-none">No messages yet</div>
        )}
        {activeTab === 'chat' &&
          messages &&
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`p-1 rounded ${
                msg.role === 'teacher' ? 'bg-purple-100 text-purple-900' : 'bg-gray-100 text-gray-900'
              }`}
            >
              <div className="text-xs font-bold">{msg.username}:</div>
              <div className="text-sm break-words">{msg.message}</div>
            </div>
          ))}

        {activeTab === 'users' && (
          <ul className="divide-y divide-gray-200">
            {users &&
              users.map((user, idx) => (
                <li
                  key={user.socketId || idx}
                  className="flex justify-between items-center px-2 py-1"
                >
                  <span>
                    {user.username} {user.role === 'teacher' && <strong>(Teacher)</strong>}
                  </span>
                  {role === 'teacher' && user.role !== 'teacher' && (
                    <button
                      className="text-red-600 text-sm hover:underline"
                      onClick={() => handleKickOut(user.socketId, user.username)}
                    >
                      Kick out
                    </button>
                  )}
                </li>
              ))}
          </ul>
        )}
        <div ref={messagesEndRef} />
      </div>

      {activeTab === 'chat' && (
        <div className="flex border-t border-gray-200">
          <textarea
            className="flex-grow p-2 outline-none text-sm resize-none"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            rows={2}
          />
          <button
            className="bg-purple-600 text-white px-3 disabled:opacity-50"
            onClick={sendMessage}
            disabled={message.trim() === ''}
          >
            Send
          </button>
        </div>
      )}
    </div>
  );
};

export default ChatPopup;
