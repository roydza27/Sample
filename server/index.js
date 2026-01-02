// server/index.js  (non-native, no C++ rebuild)
const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Helper to run git commands
function runGit(cmd, cwd) {
  exec(cmd, { cwd }, (error, stdout, stderr) => {
    if (error) {
      return { success: false, output: '', error: error.message, stderr };
    }
    return { success: true, output: stdout.trim(), error: stderr.trim() };
  });
}

// Detect Git repo
app.post('/api/repo/detect', async (req, res) => {
  const { workspacePath } = req.body;
  const gitFolder = path.join(workspacePath, '.git');

  if (!fs.existsSync(gitFolder)) {
    return res.json({ isRepo: false, message: 'No Git repo found here.' });
  }

  const repoName = path.basename(workspacePath);
  const branch = execSync('git rev-parse --abbrev-ref HEAD', { cwd: workspacePath }).toString().trim();
  const remote = execSync('git remote get-url origin', { cwd: workspacePath }).toString().trim();

  const branches = execSync('git branch', { cwd: workspacePath }).toString()
    .split('\n').map(b => b.trim().replace('* ', '')).filter(Boolean);

  res.json({ isRepo: true, repoName, currentBranch: branch, remoteUrl: remote, branches });
});

// Initialize repo
app.post('/api/repo/init', (req, res) => {
  const { workspacePath } = req.body;
  const result = runGit('git init', workspacePath);

  if (result.success) {
    return res.json({ success: true, message: 'Repo initialized!' });
  }
  return res.status(500).json({ success: false, error: result.error });
});

// Analytics mock endpoint
app.get('/api/analytics', (req, res) => {
  res.json({
    totalCommits: 42,
    timeSavedSeconds: 3600,
    commitStreak: 5,
    pushSuccessRate: 95,
    successfulPushes: 40,
    totalFilesChanged: 120,
    linesAdded: 1000,
    linesRemoved: 200,
    remoteSwitches: 3,
    lastCommit: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 RepoSense backend running on port ${PORT}`);
});
