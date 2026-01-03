import express from 'express';
import cors from 'cors';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';

const execAsync = promisify(exec);
const app = express();
const PORT = 3001;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());

// Initialize SQLite database for analytics
const db = new Database(path.join(__dirname, 'reposense.db'));

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS analytics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    repo_path TEXT,
    timestamp TEXT,
    action TEXT,
    files_changed INTEGER,
    lines_added INTEGER,
    lines_removed INTEGER,
    success INTEGER,
    error_message TEXT
  );

  CREATE TABLE IF NOT EXISTS commits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    repo_path TEXT,
    commit_hash TEXT,
    commit_message TEXT,
    timestamp TEXT,
    files_count INTEGER,
    push_success INTEGER
  );

  CREATE TABLE IF NOT EXISTS config (
    key TEXT PRIMARY KEY,
    value TEXT
  );
`);

// Helper function to execute git commands
async function executeGit(command, cwd = null) {
  try {
    const options = cwd ? { cwd } : {};
    const { stdout, stderr } = await execAsync(command, options);
    return { success: true, output: stdout.trim(), error: stderr.trim() };
  } catch (error) {
    return { 
      success: false, 
      output: '', 
      error: error.message,
      stderr: error.stderr || ''
    };
  }
}

// API: Check if workspace is a Git repo
app.post('/api/repo/detect', async (req, res) => {
  const { workspacePath } = req.body;
  
  try {
    const gitPath = path.join(workspacePath, '.git');
    const exists = await fs.access(gitPath).then(() => true).catch(() => false);
    
    if (!exists) {
      return res.json({ isRepo: false, message: 'No .git directory found' });
    }

    // Get repo name
    const repoName = path.basename(workspacePath);
    
    // Get current branch
    const branchResult = await executeGit('git rev-parse --abbrev-ref HEAD', workspacePath);
    const currentBranch = branchResult.success ? branchResult.output : 'unknown';

    // Get remote URL
    const remoteResult = await executeGit('git remote get-url origin', workspacePath);
    const remoteUrl = remoteResult.success ? remoteResult.output : 'Not configured';

    // Get all branches
    const branchesResult = await executeGit('git branch', workspacePath);
    const branches = branchesResult.success 
      ? branchesResult.output.split('\n').map(b => b.trim().replace('* ', ''))
      : [];

    res.json({
      isRepo: true,
      repoName,
      currentBranch,
      remoteUrl,
      branches
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API: Initialize new Git repo
app.post('/api/repo/init', async (req, res) => {
  const { workspacePath } = req.body;
  
  const result = await executeGit('git init', workspacePath);
  
  if (result.success) {
    res.json({ success: true, message: 'Repository initialized successfully' });
  } else {
    res.status(500).json({ success: false, error: result.error });
  }
});

// API: Clone repository
app.post('/api/repo/clone', async (req, res) => {
  const { url, targetPath } = req.body;
  
  const result = await executeGit(`git clone ${url} ${targetPath}`);
  
  if (result.success) {
    res.json({ success: true, message: 'Repository cloned successfully' });
  } else {
    res.status(500).json({ success: false, error: result.error });
  }
});

// API: Check remote reachability
app.post('/api/repo/check-remote', async (req, res) => {
  const { workspacePath } = req.body;
  
  const result = await executeGit('git ls-remote origin', workspacePath);
  
  res.json({
    reachable: result.success,
    message: result.success ? 'Remote is reachable' : 'Remote is not reachable',
    error: result.success ? null : result.error
  });
});

// API: Set Git identity
app.post('/api/repo/set-identity', async (req, res) => {
  const { workspacePath, name, email } = req.body;
  
  const nameResult = await executeGit(`git config user.name "${name}"`, workspacePath);
  const emailResult = await executeGit(`git config user.email "${email}"`, workspacePath);
  
  if (nameResult.success && emailResult.success) {
    // Store in config
    db.prepare('INSERT OR REPLACE INTO config (key, value) VALUES (?, ?)').run('git_name', name);
    db.prepare('INSERT OR REPLACE INTO config (key, value) VALUES (?, ?)').run('git_email', email);
    
    res.json({ success: true, message: 'Git identity configured' });
  } else {
    res.status(500).json({ success: false, error: 'Failed to set Git identity' });
  }
});

// API: Get Git identity
app.post('/api/repo/get-identity', async (req, res) => {
  const { workspacePath } = req.body;
  
  const nameResult = await executeGit('git config user.name', workspacePath);
  const emailResult = await executeGit('git config user.email', workspacePath);
  
  res.json({
    name: nameResult.success ? nameResult.output : '',
    email: emailResult.success ? emailResult.output : ''
  });
});

// API: Change remote URL
app.post('/api/repo/set-remote', async (req, res) => {
  const { workspacePath, url } = req.body;
  
  // Check if origin exists
  const checkResult = await executeGit('git remote get-url origin', workspacePath);
  
  let result;
  if (checkResult.success) {
    // Update existing origin
    result = await executeGit(`git remote set-url origin ${url}`, workspacePath);
  } else {
    // Add new origin
    result = await executeGit(`git remote add origin ${url}`, workspacePath);
  }
  
  if (result.success) {
    // Log remote switch
    db.prepare(`
      INSERT INTO analytics (repo_path, timestamp, action, success)
      VALUES (?, ?, ?, ?)
    `).run(workspacePath, new Date().toISOString(), 'remote_switch', 1);
    
    res.json({ success: true, message: 'Remote URL updated successfully' });
  } else {
    res.status(500).json({ success: false, error: result.error });
  }
});

// API: Get repository status
app.post('/api/repo/status', async (req, res) => {
  const { workspacePath } = req.body;
  
  const statusResult = await executeGit('git status --porcelain', workspacePath);
  
  if (!statusResult.success) {
    return res.status(500).json({ error: statusResult.error });
  }

  const files = statusResult.output
    .split('\n')
    .filter(line => line.trim())
    .map(line => {
      const status = line.substring(0, 2);
      const filepath = line.substring(3);
      return { status, filepath };
    });

  res.json({ files });
});

// API: Get diff summary
app.post('/api/repo/diff', async (req, res) => {
  const { workspacePath } = req.body;
  
  const diffResult = await executeGit('git diff --shortstat', workspacePath);
  const diffOutput = diffResult.success ? diffResult.output : '';
  
  // Parse stats
  let filesChanged = 0, linesAdded = 0, linesRemoved = 0;
  
  if (diffOutput) {
    const match = diffOutput.match(/(\d+) file[s]? changed(?:, (\d+) insertion[s]?\(\+\))?(?:, (\d+) deletion[s]?\(-\))?/);
    if (match) {
      filesChanged = parseInt(match[1]) || 0;
      linesAdded = parseInt(match[2]) || 0;
      linesRemoved = parseInt(match[3]) || 0;
    }
  }

  res.json({
    filesChanged,
    linesAdded,
    linesRemoved,
    summary: diffOutput || 'No changes'
  });
});

// API: Switch branch
app.post('/api/repo/checkout', async (req, res) => {
  const { workspacePath, branch } = req.body;
  
  const result = await executeGit(`git checkout ${branch}`, workspacePath);
  
  if (result.success) {
    res.json({ success: true, message: `Switched to branch ${branch}` });
  } else {
    res.status(500).json({ success: false, error: result.error });
  }
});

// API: Create new branch
app.post('/api/repo/create-branch', async (req, res) => {
  const { workspacePath, branchName } = req.body;
  
  const result = await executeGit(`git checkout -b ${branchName}`, workspacePath);
  
  if (result.success) {
    res.json({ success: true, message: `Branch ${branchName} created and checked out` });
  } else {
    res.status(500).json({ success: false, error: result.error });
  }
});

// API: Delete branch
app.post('/api/repo/delete-branch', async (req, res) => {
  const { workspacePath, branchName } = req.body;
  
  const result = await executeGit(`git branch -d ${branchName}`, workspacePath);
  
  if (result.success) {
    res.json({ success: true, message: `Branch ${branchName} deleted` });
  } else {
    res.status(500).json({ success: false, error: result.error });
  }
});

// API: Commit and push
app.post('/api/repo/commit-push', async (req, res) => {
  const { workspacePath, message, autoPush } = req.body;
  
  try {
    // Stage all changes
    const addResult = await executeGit('git add .', workspacePath);
    if (!addResult.success) {
      throw new Error('Failed to stage files: ' + addResult.error);
    }

    // Get diff stats before commit
    const diffResult = await executeGit('git diff --cached --shortstat', workspacePath);
    let filesChanged = 0, linesAdded = 0, linesRemoved = 0;
    
    if (diffResult.output) {
      const match = diffResult.output.match(/(\d+) file[s]? changed(?:, (\d+) insertion[s]?\(\+\))?(?:, (\d+) deletion[s]?\(-\))?/);
      if (match) {
        filesChanged = parseInt(match[1]) || 0;
        linesAdded = parseInt(match[2]) || 0;
        linesRemoved = parseInt(match[3]) || 0;
      }
    }

    // Commit
    const commitResult = await executeGit(`git commit -m "${message}"`, workspacePath);
    if (!commitResult.success) {
      if (commitResult.error.includes('nothing to commit')) {
        return res.json({ 
          success: true, 
          committed: false,
          message: 'Nothing to commit, working tree clean' 
        });
      }
      throw new Error('Failed to commit: ' + commitResult.error);
    }

    // Get commit hash
    const hashResult = await executeGit('git rev-parse HEAD', workspacePath);
    const commitHash = hashResult.success ? hashResult.output : 'unknown';

    // Save commit to database
    db.prepare(`
      INSERT INTO commits (repo_path, commit_hash, commit_message, timestamp, files_count, push_success)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(workspacePath, commitHash, message, new Date().toISOString(), filesChanged, 0);

    let pushResult = { success: false };
    if (autoPush) {
      // Try to push
      const branchResult = await executeGit('git rev-parse --abbrev-ref HEAD', workspacePath);
      const currentBranch = branchResult.success ? branchResult.output : 'main';
      
      pushResult = await executeGit(`git push origin ${currentBranch}`, workspacePath);
      
      // Update push success in database
      if (pushResult.success) {
        db.prepare('UPDATE commits SET push_success = 1 WHERE commit_hash = ?').run(commitHash);
      }
    }

    // Log analytics
    db.prepare(`
      INSERT INTO analytics (repo_path, timestamp, action, files_changed, lines_added, lines_removed, success)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      workspacePath, 
      new Date().toISOString(), 
      'commit_push', 
      filesChanged, 
      linesAdded, 
      linesRemoved, 
      pushResult.success ? 1 : 0
    );

    res.json({
      success: true,
      committed: true,
      pushed: pushResult.success,
      commitHash,
      filesChanged,
      linesAdded,
      linesRemoved,
      pushError: pushResult.success ? null : pushResult.error
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// API: Push only
app.post('/api/repo/push', async (req, res) => {
  const { workspacePath } = req.body;
  
  const branchResult = await executeGit('git rev-parse --abbrev-ref HEAD', workspacePath);
  const currentBranch = branchResult.success ? branchResult.output : 'main';
  
  const pushResult = await executeGit(`git push origin ${currentBranch}`, workspacePath);
  
  if (pushResult.success) {
    res.json({ success: true, message: 'Pushed successfully' });
  } else {
    res.status(500).json({ 
      success: false, 
      error: pushResult.error,
      friendlyError: explainGitError(pushResult.error + ' ' + pushResult.stderr)
    });
  }
});

// API: Get analytics
app.get('/api/analytics', (req, res) => {
  try {
    // Get total commits
    const totalCommits = db.prepare('SELECT COUNT(*) as count FROM commits').get();
    
    // Get successful pushes
    const successfulPushes = db.prepare('SELECT COUNT(*) as count FROM commits WHERE push_success = 1').get();
    
    // Get total files changed
    const totalFiles = db.prepare("SELECT SUM(files_changed) as total FROM analytics WHERE action = 'commit_push'").get();
    
    // Get total lines
    const totalLines = db.prepare(`
      SELECT SUM(lines_added) as added, SUM(lines_removed) as removed 
      FROM analytics WHERE action = 'commit_push'
    `).get();
    
    // Get remote switches
    const remoteSwitches = db.prepare("SELECT COUNT(*) as count FROM analytics WHERE action = 'remote_switch'").get();
    
    // Get commit streak (simplified)
    const recentCommits = db.prepare(`
      SELECT DATE(timestamp) as date 
      FROM commits 
      ORDER BY timestamp DESC 
      LIMIT 30
    `).all();
    
    let streak = 0;
    if (recentCommits.length > 0) {
      let lastDate = new Date().toISOString().split('T')[0];
      
      for (const commit of recentCommits) {
        if (commit.date === lastDate) {
          streak++;
          const date = new Date(lastDate);
          date.setDate(date.getDate() - 1);
          lastDate = date.toISOString().split('T')[0];
        } else {
          break;
        }
      }
    }
    
    // Estimate time saved (6 seconds per commit cycle)
    const timeSaved = (totalCommits.count || 0) * 6;
    
    // Calculate success rate
    const pushSuccessRate = totalCommits.count > 0 
      ? ((successfulPushes.count / totalCommits.count) * 100).toFixed(1)
      : '0';

    res.json({
      totalCommits: totalCommits?.count || 0,
      successfulPushes: successfulPushes?.count || 0,
      totalFilesChanged: totalFiles?.total || 0, // Ensure this isn't null
      linesAdded: totalLines?.added || 0,       // Ensure this isn't null
      linesRemoved: totalLines?.removed || 0,   // Ensure this isn't null
      remoteSwitches: remoteSwitches?.count || 0,
      commitStreak: streak,
      timeSavedSeconds: timeSaved,
      pushSuccessRate: pushSuccessRate,
      lastCommit: recentCommits.length > 0 ? recentCommits[0].date : null
    });
  } catch (error) {
    console.error('Analytics error:', error);
    // Return empty analytics on error instead of failing
    res.json({
      totalCommits: 0,
      successfulPushes: 0,
      totalFilesChanged: 0,
      linesAdded: 0,
      linesRemoved: 0,
      remoteSwitches: 0,
      commitStreak: 0,
      timeSavedSeconds: 0,
      pushSuccessRate: '0',
      lastCommit: null,
      error: error.message
    });
  }
});

// API: Get activity logs
app.get('/api/logs', (req, res) => {
  try {
    const logs = db.prepare(`
      SELECT * FROM analytics 
      ORDER BY timestamp DESC 
      LIMIT 50
    `).all();
    
    res.json({ logs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API: Suggest commit message (AI simulation)
app.post('/api/ai/suggest-commit', async (req, res) => {
  const { workspacePath } = req.body;
  
  // Get changed files
  const statusResult = await executeGit('git status --porcelain', workspacePath);
  
  if (!statusResult.success || !statusResult.output) {
    return res.json({ suggestion: 'Update files' });
  }

  const files = statusResult.output.split('\n').filter(line => line.trim());
  
  // Simple AI logic
  let suggestion = '';
  
  if (files.length === 1) {
    const file = files[0].substring(3);
    const ext = path.extname(file);
    
    if (ext === '.js' || ext === '.jsx' || ext === '.ts' || ext === '.tsx') {
      suggestion = `Update ${path.basename(file)} component`;
    } else if (ext === '.css' || ext === '.scss') {
      suggestion = `Style ${path.basename(file, ext)}`;
    } else if (ext === '.md') {
      suggestion = `Update documentation`;
    } else {
      suggestion = `Update ${path.basename(file)}`;
    }
  } else if (files.length <= 3) {
    suggestion = `Update ${files.length} files`;
  } else {
    const hasNew = files.some(f => f.startsWith('A ') || f.startsWith('??'));
    const hasModified = files.some(f => f.startsWith('M '));
    const hasDeleted = files.some(f => f.startsWith('D '));
    
    if (hasNew && hasModified) {
      suggestion = 'Add new features and update existing code';
    } else if (hasNew) {
      suggestion = 'Add new files and features';
    } else if (hasModified) {
      suggestion = 'Update multiple files';
    } else if (hasDeleted) {
      suggestion = 'Clean up and remove unused files';
    } else {
      suggestion = 'Update project files';
    }
  }

  res.json({ suggestion });
});

// API: Generate .gitignore
app.post('/api/ai/generate-gitignore', async (req, res) => {
  const { workspacePath, template } = req.body;
  
  const templates = {
    node: `node_modules/
dist/
build/
.env
.env.local
*.log
.DS_Store`,
    python: `__pycache__/
*.py[cod]
*$py.class
venv/
env/
.env
*.log`,
    react: `node_modules/
build/
dist/
.env.local
.env.development.local
.env.test.local
.env.production.local
*.log`,
    general: `.DS_Store
Thumbs.db
*.log
.env
.vscode/
.idea/`
  };

  const content = templates[template] || templates.general;
  
  try {
    await fs.writeFile(path.join(workspacePath, '.gitignore'), content);
    res.json({ success: true, message: '.gitignore created' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Helper: Explain Git errors in friendly language
function explainGitError(error) {
  const errorLower = error.toLowerCase();
  
  if (errorLower.includes('permission denied') || errorLower.includes('403')) {
    return 'Authentication failed. Check your GitHub credentials or access token.';
  }
  
  if (errorLower.includes('could not resolve host') || errorLower.includes('network')) {
    return 'Network error. Check your internet connection.';
  }
  
  if (errorLower.includes('failed to push') || errorLower.includes('rejected')) {
    return 'Push rejected. Pull latest changes first or force push if needed.';
  }
  
  if (errorLower.includes('not a git repository')) {
    return 'This folder is not a Git repository. Initialize one first.';
  }
  
  if (errorLower.includes('nothing to commit')) {
    return 'No changes to commit. All files are up to date.';
  }
  
  if (errorLower.includes('merge conflict')) {
    return 'Merge conflict detected. Resolve conflicts manually first.';
  }
  
  return 'Git operation failed. Check the error details above.';
}

// API: Explain error
app.post('/api/ai/explain-error', (req, res) => {
  const { error } = req.body;
  const explanation = explainGitError(error);
  res.json({ explanation });
});

app.listen(PORT, () => {
  console.log(`✅ RepoSense server running on http://localhost:${PORT}`);
});