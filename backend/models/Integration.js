const mongoose = require('mongoose');

const IntegrationSchema = new mongoose.Schema({
  provider: { type: String, required: true },
  userId: { type: String, required: true },
  syncType: { type: String },
  lastSynced: { type: Date },
  accessToken: { type: String, required: true },
  refreshToken: { type: String },
  profile: { type: Object },
  connectedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Integration', IntegrationSchema, 'github-integration'); 