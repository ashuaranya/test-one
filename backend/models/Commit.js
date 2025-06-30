const mongoose = require('mongoose');

const CommitSchema = new mongoose.Schema({
  commitId: { type: String, required: true, unique: true },
  repoId: { type: String, required: true },
  author: { type: Object },
  message: { type: String },
  date: { type: Date },
  raw: { type: Object },
});

module.exports = mongoose.model('Commit', CommitSchema); 