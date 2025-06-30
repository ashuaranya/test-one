const mongoose = require('mongoose');

const IssueSchema = new mongoose.Schema({
  issueId: { type: String, required: true, unique: true },
  repoId: { type: String, required: true },
  title: { type: String },
  user: { type: Object },
  state: { type: String },
  createdAt: { type: Date },
  closedAt: { type: Date },
  raw: { type: Object },
});

module.exports = mongoose.model('Issue', IssueSchema); 