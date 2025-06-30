const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// /api/auth/github
router.get('/github', authController.githubLogin);
// /api/auth/github/callback
router.get('/github/callback', authController.githubCallback);
// /api/auth/remove
router.post('/remove', authController.removeIntegration);

module.exports = router; 