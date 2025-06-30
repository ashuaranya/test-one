const mongoose = require('mongoose');

const PullSchema = new mongoose.Schema({
  pullId: { type: String, required: true, unique: true },
  repoId: { type: String, required: true },
  title: { type: String },
  user: { type: Object },
  state: { type: String },
  createdAt: { type: Date },
  mergedAt: { type: Date },
  raw: { type: Object },
});

module.exports = mongoose.model('Pull', PullSchema); 