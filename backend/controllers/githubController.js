const Integration = require('../models/Integration');
const Organization = require('../models/Organization');
const Repository = require('../models/Repository');
const Commit = require('../models/Commit');
const Pull = require('../models/Pull');
const Issue = require('../models/Issue');
const Changelog = require('../models/Changelog');
const User = require('../models/User');
const { getGitHubData } = require('../helpers/githubApi');

// Helper to get access token from session
async function getAccessToken(req) {
  if (!req.user) throw new Error('Not authenticated');
  const integration = await Integration.findOne({ provider: 'github', userId: req.user.id });
  if (!integration) throw new Error('No integration found');
  return integration.accessToken;
}

// Helper function to build query with filters and pagination
function buildQuery(filters = {}, page = 1, limit = 10, sort = {}) {
  const query = {};
  
  // Apply filters
  Object.keys(filters).forEach(key => {
    if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
      if (typeof filters[key] === 'string') {
        query[key] = { $regex: filters[key], $options: 'i' }; // Case-insensitive search
      } else {
        query[key] = filters[key];
      }
    }
  });

  return {
    query,
    options: {
      skip: (page - 1) * limit,
      limit: parseInt(limit),
      sort: sort
    }
  };
}

// Helper function to get pagination metadata
function getPaginationMetadata(page, limit, total) {
  return {
    page: parseInt(page),
    limit: parseInt(limit),
    total,
    totalPages: Math.ceil(total / limit),
    hasNext: page * limit < total,
    hasPrev: page > 1
  };
}

exports.syncAllData = async (req, res) => {
  try {
    const accessToken = await getAccessToken(req);
    // 1. Get user info
    const user = await getGitHubData('https://api.github.com/user', accessToken);
    await User.findOneAndUpdate(
      { userId: user.id },
      { userId: user.id, login: user.login, name: user.name, avatarUrl: user.avatar_url, email: user.email, raw: user },
      { upsert: true }
    );
    // 2. Get orgs
    const orgs = await getGitHubData('https://api.github.com/user/orgs', accessToken);
    for (const org of orgs) {
      await Organization.findOneAndUpdate(
        { orgId: org.id },
        { orgId: org.id, name: org.login, description: org.description, url: org.url, avatarUrl: org.avatar_url, raw: org },
        { upsert: true }
      );
      // 3. Get repos for org
      const repos = await getGitHubData(`https://api.github.com/orgs/${org.login}/repos?per_page=100`, accessToken);
      // for (const repo of repos) {
        // Move all repo processing to threads (Promise.all) and respond after all are done

        // Collect all repo processing promises
        const repoPromises = repos.map(async (repo) => {
          console.log('repo name', repo.name);
          await Repository.findOneAndUpdate(
            { repoId: repo.id },
            { repoId: repo.id, orgId: org.id, name: repo.name, fullName: repo.full_name, description: repo.description, url: repo.html_url, raw: repo },
            { upsert: true }
          );

          // 4. Get commits for repo (bulk upsert)
          let pageCommits = [];
          let page = 1;
          do {
            pageCommits = await getGitHubData(`https://api.github.com/repos/${org.login}/${repo.name}/commits?per_page=100&page=${page}`, accessToken);
            if (pageCommits.length > 0) {
              const bulkOps = pageCommits.map(commit => ({
                updateOne: {
                  filter: { commitId: commit.sha },
                  update: {
                    $set: {
                      commitId: commit.sha,
                      repoId: repo.id,
                      author: commit.author,
                      message: commit.commit.message,
                      date: commit.commit.author.date,
                      raw: commit
                    }
                  },
                  upsert: true
                }
              }));
              if (bulkOps.length > 0) {
                await Commit.bulkWrite(bulkOps);
              }
            }
            page++;
          } while (pageCommits.length === 100);

          // 5. Get pulls for repo
          let pagePulls = [];
          let pullsPage = 1;
          do {
            pagePulls = await getGitHubData(`https://api.github.com/repos/${org.login}/${repo.name}/pulls?state=all&per_page=100&page=${pullsPage}`, accessToken);
            // Use Promise.all for pull upserts
            await Promise.all(pagePulls.map(pull =>
              Pull.findOneAndUpdate(
                { pullId: pull.id },
                { pullId: pull.id, repoId: repo.id, title: pull.title, user: pull.user, state: pull.state, createdAt: pull.created_at, mergedAt: pull.merged_at, raw: pull },
                { upsert: true }
              )
            ));
            pullsPage++;
          } while (pagePulls.length === 100);

          // 6. Get issues for repo
          let pageIssues = [];
          let issuesPage = 1;
          do {
            pageIssues = await getGitHubData(`https://api.github.com/repos/${org.login}/${repo.name}/issues?state=all&per_page=100&page=${issuesPage}`, accessToken);
            // For each issue, process in parallel
            await Promise.all(pageIssues.map(async (issue) => {
              await Issue.findOneAndUpdate(
                { issueId: issue.id },
                { issueId: issue.id, repoId: repo.id, title: issue.title, user: issue.user, state: issue.state, createdAt: issue.created_at, closedAt: issue.closed_at, raw: issue },
                { upsert: true }
              );

              // 7. Get all changelogs for issue (timeline), handling pagination
              let changelogsPage = [];
              let changelogPageNum = 1;
              do {
                changelogsPage = await getGitHubData(
                  `https://api.github.com/repos/${org.login}/${repo.name}/issues/${issue.number}/timeline?per_page=100&page=${changelogPageNum}`,
                  accessToken
                );
                // Upsert all changelogs in parallel
                await Promise.all(changelogsPage.map(changelog =>
                  Changelog.findOneAndUpdate(
                    { changelogId: changelog.id },
                    { changelogId: changelog.id, issueId: issue.id, changes: changelog, createdAt: changelog.created_at, raw: changelog },
                    { upsert: true }
                  )
                ));
                changelogPageNum++;
              } while (changelogsPage.length === 100);
            }));
            issuesPage++;
          } while (pageIssues.length === 100);

          // Store last sync details and sync type for this repo/org
          await Integration.findOneAndUpdate(
            { provider: 'github', userId: req.user.id },
            { lastSynced: new Date(), syncType: 'full' },
            { upsert: true }
          );
        });

        // Wait for all repo threads to finish before continuing
        await Promise.all(repoPromises);

        // }
      }
    
    const integration = await Integration.findOne({ provider: 'github', userId: req.user.id });

    res.json({ success: true, message: 'Data synced from GitHub', data: integration });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all collections with counts
exports.getAllCollections = async (req, res) => {
  try {
    const collections = await Promise.all([
      Organization.countDocuments(),
      Repository.countDocuments(),
      Commit.countDocuments(),
      Pull.countDocuments(),
      Issue.countDocuments(),
      Changelog.countDocuments(),
      User.countDocuments()
    ]);

    const collectionData = {
      organizations: { 
        count: collections[0], 
        name: 'Organizations',
        columns: [
          { field: 'orgId', headerName: 'ID', type: 'string',  sortable: true },
          { field: 'name', headerName: 'Name', type: 'string',  sortable: true, searchable: true },
          { field: 'description', headerName: 'Description', type: 'string', sortable: false, searchable: true },
          { field: 'url', headerName: 'URL', type: 'url',  sortable: false },
          { field: 'avatarUrl', headerName: 'Avatar', type: 'image',  sortable: false }
        ]
      },
      repositories: { 
        count: collections[1], 
        name: 'Repositories',
        columns: [
          { field: 'repoId', headerName: 'ID', type: 'string',  sortable: true },
          { field: 'orgId', headerName: 'Org ID', type: 'string',  sortable: true, filterable: true },
          { field: 'name', headerName: 'Name', type: 'string',  sortable: true, searchable: true },
          { field: 'fullName', headerName: 'Full Name', type: 'string',  sortable: true, searchable: true },
          { field: 'description', headerName: 'Description', type: 'string', sortable: false, searchable: true },
          { field: 'url', headerName: 'URL', type: 'url',  sortable: false }
        ]
      },
      commits: { 
        count: collections[2], 
        name: 'Commits',
        columns: [
          { field: 'commitId', headerName: 'Commit ID', type: 'string',  sortable: true },
          { field: 'repoId', headerName: 'Repo ID', type: 'string',  sortable: true, filterable: true },
          { field: 'message', headerName: 'Message', type: 'string',  sortable: false, searchable: true },
          { field: 'author.login', headerName: 'Author', type: 'string',  sortable: false, searchable: true, filterable: true },
          { field: 'author.avatar_url', headerName: 'Author Avatar', type: 'image',  sortable: false },
          { field: 'date', headerName: 'Date', type: 'date',  sortable: true }
        ]
      },
      pulls: { 
        count: collections[3], 
        name: 'Pull Requests',
        columns: [
          { field: 'pullId', headerName: 'PR ID', type: 'string',  sortable: true },
          { field: 'repoId', headerName: 'Repo ID', type: 'string',  sortable: true, filterable: true },
          { field: 'title', headerName: 'Title', type: 'string', sortable: false, searchable: true },
          { field: 'user.login', headerName: 'Author', type: 'string',  sortable: false, searchable: true },
          { field: 'user.avatar_url', headerName: 'Author Avatar', type: 'image',  sortable: false },
          { field: 'state', headerName: 'State', type: 'string',  sortable: true, filterable: true },
          { field: 'createdAt', headerName: 'Created', type: 'date',  sortable: true },
          { field: 'mergedAt', headerName: 'Merged', type: 'date',  sortable: true }
        ]
      },
      issues: { 
        count: collections[4], 
        name: 'Issues',
        columns: [
          { field: 'issueId', headerName: 'Issue ID', type: 'string',  sortable: true },
          { field: 'repoId', headerName: 'Repo ID', type: 'string',  sortable: true, filterable: true },
          { field: 'title', headerName: 'Title', type: 'string', sortable: false, searchable: true },
          { field: 'user.login', headerName: 'Author', type: 'string',  sortable: false, searchable: true },
          { field: 'user.avatar_url', headerName: 'Author Avatar', type: 'image',  sortable: false },
          { field: 'state', headerName: 'State', type: 'string',  sortable: true, filterable: true },
          { field: 'createdAt', headerName: 'Created', type: 'date',  sortable: true },
          { field: 'closedAt', headerName: 'Closed', type: 'date',  sortable: true }
        ]
      },
      changelogs: { 
        count: collections[5], 
        name: 'Changelogs',
        columns: [
          { field: 'changelogId', headerName: 'Changelog ID', type: 'string',  sortable: true },
          { field: 'issueId', headerName: 'Issue ID', type: 'string',  sortable: true, filterable: true },
          { field: 'changes.event', headerName: 'Event', type: 'string',  sortable: false },
          { field: 'changes.actor.login', headerName: 'Actor', type: 'string',  sortable: false },
          { field: 'changes.actor.avatar_url', headerName: 'Actor Avatar', type: 'image',  sortable: false },
          { field: 'createdAt', headerName: 'Created', type: 'date',  sortable: true }
        ]
      },
      users: { 
        count: collections[6], 
        name: 'Users',
        columns: [
          { field: 'userId', headerName: 'User ID', type: 'string',  sortable: true },
          { field: 'login', headerName: 'Login', type: 'string',  sortable: true, searchable: true },
          { field: 'name', headerName: 'Name', type: 'string',  sortable: true, searchable: true },
          { field: 'email', headerName: 'Email', type: 'string',  sortable: false, searchable: true },
          { field: 'avatarUrl', headerName: 'Avatar', type: 'image',  sortable: false }
        ]
      }
    };

    res.json({
      success: true,
      data: collectionData,
      totalCollections: 7
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getOrganizations = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, sortBy = 'name', sortOrder = 'asc' } = req.query;
    
    const filters = {};
    if (search) {
      filters.$or = [
        { name: { $regex: search, $options: 'i' } },
        { login: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
    const { query, options } = buildQuery(filters, page, limit, sort);

    const [orgs, total] = await Promise.all([
      Organization.find(query, null, options),
      Organization.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: orgs,
      pagination: getPaginationMetadata(page, limit, total)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getRepositories = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, orgId, sortBy = 'name', sortOrder = 'asc' } = req.query;
    
    const filters = {};
    if (search) {
      filters.$or = [
        { name: { $regex: search, $options: 'i' } },
        { fullName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (orgId) filters.orgId = orgId;

    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
    const { query, options } = buildQuery(filters, page, limit, sort);

    const [repos, total] = await Promise.all([
      Repository.find(query, null, options),
      Repository.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: repos,
      pagination: getPaginationMetadata(page, limit, total)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCommits = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, repoId, author, sortBy = 'date', sortOrder = 'desc' } = req.query;
    
    const filters = {};
    if (search) {
      filters.$or = [
        { message: { $regex: search, $options: 'i' } },
        { 'author.login': { $regex: search, $options: 'i' } }
      ];
    }
    if (repoId) filters.repoId = repoId;
    if (author) filters['author.login'] = { $regex: author, $options: 'i' };

    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
    const { query, options } = buildQuery(filters, page, limit, sort);

    const [commits, total] = await Promise.all([
      Commit.find(query, null, options),
      Commit.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: commits,
      pagination: getPaginationMetadata(page, limit, total)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPulls = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, repoId, state, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    const filters = {};
    if (search) {
      filters.$or = [
        { title: { $regex: search, $options: 'i' } },
        { 'user.login': { $regex: search, $options: 'i' } }
      ];
    }
    if (repoId) filters.repoId = repoId;
    if (state) filters.state = state;

    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
    const { query, options } = buildQuery(filters, page, limit, sort);

    const [pulls, total] = await Promise.all([
      Pull.find(query, null, options),
      Pull.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: pulls,
      pagination: getPaginationMetadata(page, limit, total)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getIssues = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, repoId, state, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    const filters = {};
    if (search) {
      filters.$or = [
        { title: { $regex: search, $options: 'i' } },
        { 'user.login': { $regex: search, $options: 'i' } }
      ];
    }
    if (repoId) filters.repoId = repoId;
    if (state) filters.state = state;

    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
    const { query, options } = buildQuery(filters, page, limit, sort);

    const [issues, total] = await Promise.all([
      Issue.find(query, null, options),
      Issue.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: issues,
      pagination: getPaginationMetadata(page, limit, total)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getChangelogs = async (req, res) => {
  try {
    const { page = 1, limit = 10, issueId, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    const filters = {};
    if (issueId) filters.issueId = issueId;

    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
    const { query, options } = buildQuery(filters, page, limit, sort);

    const [changelogs, total] = await Promise.all([
      Changelog.find(query, null, options),
      Changelog.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: changelogs,
      pagination: getPaginationMetadata(page, limit, total)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, sortBy = 'login', sortOrder = 'asc' } = req.query;
    
    const filters = {};
    if (search) {
      filters.$or = [
        { login: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
    const { query, options } = buildQuery(filters, page, limit, sort);

    const [users, total] = await Promise.all([
      User.find(query, null, options),
      User.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: users,
      pagination: getPaginationMetadata(page, limit, total)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 

exports.getIntegrationData = async (req, res) => {
  try {
    const integration = await Integration.findOne({ provider: 'github', userId: req.user.id });
    res.json(integration);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};