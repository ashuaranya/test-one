const express = require('express');
const router = express.Router();
const githubController = require('../controllers/githubController');

// Data sync endpoints
router.get('/sync', githubController.syncAllData);

// Get all collections with counts
router.get('/collections', githubController.getAllCollections);

// CRUD endpoints for each entity with enhanced query parameters
router.get('/organizations', githubController.getOrganizations);
router.get('/repositories', githubController.getRepositories);
router.get('/commits', githubController.getCommits);
router.get('/pulls', githubController.getPulls);
router.get('/issues', githubController.getIssues);
router.get('/changelogs', githubController.getChangelogs);
router.get('/users', githubController.getUsers);
router.get('/integration', githubController.getIntegrationData);

module.exports = router; 