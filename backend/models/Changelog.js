const mongoose = require('mongoose');

const ChangelogSchema = new mongoose.Schema({
  changelogId: { type: String, required: true, unique: true },
  issueId: { type: String, required: true },
  changes: { type: Object },
  createdAt: { type: Date },
  raw: { type: Object },
});

module.exports = mongoose.model('Changelog', ChangelogSchema); 