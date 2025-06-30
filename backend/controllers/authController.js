const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const Integration = require('../models/Integration');

passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((obj, done) => {
  done(null, obj);
});

passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: process.env.GITHUB_CALLBACK_URL || 'http://localhost:3000/api/auth/github/callback',
  scope: ['read:user', 'read:org', 'repo'],
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Save or update integration in DB
    await Integration.findOneAndUpdate(
      { provider: 'github', userId: profile.id },
      {
        provider: 'github',
        userId: profile.id,
        accessToken,
        refreshToken,
        profile,
        connectedAt: new Date(),
      },
      { upsert: true, new: true }
    );
    return done(null, profile);
  } catch (err) {
    return done(err);
  }
}));

exports.githubLogin = passport.authenticate('github', { session: true });

exports.githubCallback = [
  passport.authenticate('github', { failureRedirect: '/?auth=failed', session: true }),
  async (req, res) => {
    // On success, redirect to frontend with success status
    res.redirect(process.env.FRONTEND_URL || 'http://localhost:4200/github-connect?auth=success');
  }
];

exports.removeIntegration = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    req.logout(() => {
      res.json({ success: true, message: 'GitHub integration removed' });
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove integration' });
  }
}; 