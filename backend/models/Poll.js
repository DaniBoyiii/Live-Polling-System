// backend/models/Poll.js

const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  votes: { type: Number, default: 0 },
});

const responseSchema = new mongoose.Schema({
  studentId: { type: String, required: true },
  selectedOptionIndex: { type: Number, required: true },
});

const pollSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: { type: [optionSchema], required: true },
  createdBy: { type: String, required: true },
  expiresAt: { type: Date },
  responses: { type: [responseSchema], default: [] },
}, { timestamps: true }); // ✅ Adds createdAt and updatedAt automatically

module.exports = mongoose.model('Poll', pollSchema);
