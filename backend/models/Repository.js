const mongoose = require('mongoose');

const RepositorySchema = new mongoose.Schema({
  repoId: { type: String, required: true, unique: true },
  orgId: { type: String, required: true },
  name: { type: String, required: true },
  fullName: { type: String },
  description: { type: String },
  url: { type: String },
  raw: { type: Object },
});

module.exports = mongoose.model('Repository', RepositorySchema); 