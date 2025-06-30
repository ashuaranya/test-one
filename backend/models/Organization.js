const mongoose = require('mongoose');

const OrganizationSchema = new mongoose.Schema({
  orgId: { type: String, required: true, unique: true },
  name: { type: String },
  description: { type: String },
  url: { type: String },
  avatarUrl: { type: String },
  raw: { type: Object },
});

module.exports = mongoose.model('Organization', OrganizationSchema); 