// frontend/src/components/CreatePollForm.jsx

import React, { useState } from 'react';
import axios from 'axios';

function CreatePollForm() {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [createdBy, setCreatedBy] = useState('');

  const handleOptionChange = (index, value) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  const addOption = () => {
    if (options.length < 5) setOptions([...options, '']);
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  const pollData = {
    question,
    options: options.filter(opt => opt.trim() !== ''),
    createdBy,
  };

  try {
    const res = await fetch('http://localhost:5001/api/polls/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pollData),
    });

    const data = await res.json();
    console.log('✅ Poll created:', data);

    // Clear form
    setQuestion('');
    setOptions(['', '']);
    setCreatedBy('');

    alert('Poll created successfully!');
  } catch (err) {
    console.error('❌ Error creating poll:', err);
  }
};

  return (
    <div style={{ marginTop: '30px', textAlign: 'center' }}>
      <h2>Create a New Poll</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter your name (teacher)"
          value={createdBy}
          onChange={(e) => setCreatedBy(e.target.value)}
          required
        /><br /><br />

        <input
          type="text"
          placeholder="Poll question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          required
        /><br /><br />

        {options.map((opt, idx) => (
          <div key={idx}>
            <input
              type="text"
              placeholder={`Option ${idx + 1}`}
              value={opt}
              onChange={(e) => handleOptionChange(idx, e.target.value)}
              required
            /><br /><br />
          </div>
        ))}

        {options.length < 5 && (
          <button type="button" onClick={addOption}>
            ➕ Add Option
          </button>
        )}
        <br /><br />

        <button type="submit">🚀 Create Poll</button>
      </form>
    </div>
  );
}

export default CreatePollForm;
