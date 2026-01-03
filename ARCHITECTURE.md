# RepoSense Architecture Document

## System Overview

RepoSense is a full-stack web application that provides a visual control center for Git operations with integrated analytics and AI assistance.

---

## Architecture Diagram

```
┌───────────────────────────────────────────────────────────────────┐
│                        USER INTERFACE LAYER                        │
│                      (React + Tailwind CSS)                        │
│                                                                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │ Repo Panel   │  │ Commit Panel │  │ Analytics Dashboard  │   │
│  │              │  │              │  │                      │   │
│  │ - Repo Info  │  │ - File Diff  │  │ - Metrics Display    │   │
│  │ - Branches   │  │ - Commit UI  │  │ - Time Saved         │   │
│  │ - Remote     │  │ - AI Suggest │  │ - Streak Counter     │   │
│  └──────────────┘  └──────────────┘  └──────────────────────┘   │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │              Activity Feed (Real-time Logs)              │    │
│  └──────────────────────────────────────────────────────────┘    │
└────────────────────────────┬──────────────────────────────────────┘
                             │
                             │ HTTP/REST API
                             │
┌────────────────────────────▼──────────────────────────────────────┐
│                      APPLICATION LAYER                             │
│                    (Express.js Server)                             │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │              REST API Endpoints                           │    │
│  │  - /api/repo/*     (Repository operations)                │    │
│  │  - /api/analytics  (Metrics retrieval)                    │    │
│  │  - /api/ai/*       (AI assistance)                        │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │          Business Logic Layer                             │    │
│  │                                                           │    │
│  │  ┌────────────────┐  ┌──────────────┐  ┌─────────────┐  │    │
│  │  │ Git Commander  │  │ AI Assistant │  │ Analytics   │  │    │
│  │  │                │  │              │  │ Engine      │  │    │
│  │  │ - Exec Git CLI │  │ - Suggest    │  │ - Calculate │  │    │
│  │  │ - Parse Output │  │ - Explain    │  │ - Store     │  │    │
│  │  │ - Error Handle │  │ - Generate   │  │ - Retrieve  │  │    │
│  │  └────────────────┘  └──────────────┘  └─────────────┘  │    │
│  └──────────────────────────────────────────────────────────┘    │
└────────────────────────────┬──────────────────────────────────────┘
                             │
                             │
┌────────────────────────────▼──────────────────────────────────────┐
│                        DATA LAYER                                  │
│                                                                    │
│  ┌──────────────────────┐         ┌─────────────────────────┐    │
│  │  SQLite Database     │         │  Git CLI (System)       │    │
│  │                      │         │                         │    │
│  │  - analytics table   │         │  - git status           │    │
│  │  - commits table     │         │  - git add/commit       │    │
│  │  - config table      │         │  - git push/pull        │    │
│  │                      │         │  - git branch/remote    │    │
│  └──────────────────────┘         └─────────────────────────┘    │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │           Local File System                               │    │
│  │           - User's Git Repository                         │    │
│  └──────────────────────────────────────────────────────────┘    │
└────────────────────────────────────────────────────────────────────┘
```

---

## Component Specifications

### Frontend Components

#### 1. **App.jsx** (Main Container)
**Responsibilities:**
- Application state management
- Workspace path handling
- Tab navigation (Dashboard/Analytics)
- Log aggregation
- Component orchestration

**Key State:**
- `workspacePath`: Current repository path
- `repoData`: Repository metadata
- `logs`: Activity feed entries
- `analytics`: Productivity metrics

#### 2. **RepoPanel.jsx** (Repository Control)
**Responsibilities:**
- Repository detection and validation
- Remote URL management
- Branch switching and creation
- Remote reachability testing

**Key Features:**
- Auto-detect `.git` folder
- Test remote connectivity
- Branch dropdown with current selection
- Create new branch inline

#### 3. **CommitPanel.jsx** (Commit Interface)
**Responsibilities:**
- File change detection
- Diff summary display
- Commit message input
- Commit and push execution

**Key Features:**
- Show modified files with status
- Display lines added/removed
- AI commit message suggestions
- Auto-push toggle
- Push retry button

#### 4. **AnalyticsPanel.jsx** (Metrics Dashboard)
**Responsibilities:**
- Display productivity metrics
- Visualize data with progress bars
- Show streak information
- Calculate insights

**Metrics Displayed:**
- Total commits
- Time saved (estimated)
- Commit streak
- Push success rate
- Files changed
- Lines added/removed
- Remote switches

#### 5. **ActivityFeed.jsx** (Log Viewer)
**Responsibilities:**
- Display real-time activity logs
- Show success/error indicators
- Timestamp each entry
- Auto-scroll to latest

**Log Types:**
- Info (blue)
- Success (green checkmark)
- Error (red X)

#### 6. **SettingsModal.jsx** (Configuration)
**Responsibilities:**
- Workspace path configuration
- Git identity management
- About information

**Settings:**
- Change workspace path
- Set Git username
- Set Git email

---

### Backend API Design

#### Repository Operations

**POST /api/repo/detect**
```json
Request:
{
  "workspacePath": "/path/to/repo"
}

Response:
{
  "isRepo": true,
  "repoName": "my-project",
  "currentBranch": "main",
  "remoteUrl": "https://github.com/user/repo.git",
  "branches": ["main", "develop", "feature/x"]
}
```

**POST /api/repo/commit-push**
```json
Request:
{
  "workspacePath": "/path/to/repo",
  "message": "Update components",
  "autoPush": true
}

Response:
{
  "success": true,
  "committed": true,
  "pushed": true,
  "commitHash": "abc123",
  "filesChanged": 3,
  "linesAdded": 45,
  "linesRemoved": 12
}
```

**POST /api/repo/set-remote**
```json
Request:
{
  "workspacePath": "/path/to/repo",
  "url": "https://github.com/user/new-repo.git"
}

Response:
{
  "success": true,
  "message": "Remote URL updated successfully"
}
```

#### Analytics Operations

**GET /api/analytics**
```json
Response:
{
  "totalCommits": 45,
  "successfulPushes": 42,
  "totalFilesChanged": 156,
  "linesAdded": 2340,
  "linesRemoved": 890,
  "remoteSwitches": 3,
  "commitStreak": 7,
  "timeSavedSeconds": 270,
  "pushSuccessRate": 93.3,
  "lastCommit": "2026-01-01"
}
```

#### AI Operations

**POST /api/ai/suggest-commit**
```json
Request:
{
  "workspacePath": "/path/to/repo"
}

Response:
{
  "suggestion": "Update components and fix styling"
}
```

**POST /api/ai/explain-error**
```json
Request:
{
  "error": "Permission denied (publickey)"
}

Response:
{
  "explanation": "Authentication failed. Check your GitHub credentials or access token."
}
```

---

## Data Models

### SQLite Schema

#### analytics Table
```sql
CREATE TABLE analytics (
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
```

#### commits Table
```sql
CREATE TABLE commits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  repo_path TEXT,
  commit_hash TEXT,
  commit_message TEXT,
  timestamp TEXT,
  files_count INTEGER,
  push_success INTEGER
);
```

#### config Table
```sql
CREATE TABLE config (
  key TEXT PRIMARY KEY,
  value TEXT
);
```

---

## Git Command Integration

### Core Git Commands Used

**Repository Detection:**
```bash
git rev-parse --git-dir
git rev-parse --abbrev-ref HEAD
git remote get-url origin
git branch
```

**File Operations:**
```bash
git status --porcelain
git diff --shortstat
git diff --cached --shortstat
git add .
```

**Commit Operations:**
```bash
git commit -m "message"
git push origin <branch>
git rev-parse HEAD
```

**Branch Operations:**
```bash
git checkout <branch>
git checkout -b <new-branch>
git branch -d <branch>
```

**Remote Operations:**
```bash
git remote -v
git remote set-url origin <url>
git remote add origin <url>
git ls-remote origin
```

---

## Security Considerations

### 1. **Input Validation**
- Sanitize workspace paths
- Validate commit messages
- Check branch names for valid characters

### 2. **Command Injection Prevention**
- Never use user input directly in shell commands
- Use parameterized execution
- Validate all file paths

### 3. **File System Access**
- Restrict operations to specified workspace
- Validate path existence before operations
- Handle permission errors gracefully

### 4. **Error Handling**
- Never expose system paths in errors
- Log errors server-side only
- Provide user-friendly error messages

---

## Performance Optimization

### 1. **Caching Strategy**
- Cache repository metadata
- Store diff results temporarily
- Debounce file system checks

### 2. **Database Optimization**
- Index on timestamp and repo_path
- Limit query results (50 logs max)
- Archive old analytics data

### 3. **UI Performance**
- Virtual scrolling for long logs
- Lazy load analytics charts
- Debounce refresh actions

---

## Error Handling Strategy

### Frontend Error Handling
```javascript
try {
  const response = await fetch(endpoint);
  const data = await response.json();
  
  if (data.success) {
    // Handle success
  } else {
    // Show error to user
    onLog(`✗ ${data.error}`, 'error');
  }
} catch (error) {
  // Network or parsing error
  onLog(`✗ Connection error: ${error.message}`, 'error');
}
```

### Backend Error Handling
```javascript
async function executeGit(command, cwd) {
  try {
    const { stdout, stderr } = await execAsync(command, { cwd });
    return { success: true, output: stdout, error: stderr };
  } catch (error) {
    return { 
      success: false, 
      output: '', 
      error: error.message,
      stderr: error.stderr 
    };
  }
}
```

---

## Deployment Strategy

### Local Development
- React dev server on port 3000
- Node.js server on port 3001
- SQLite database in server directory

### Production Build
1. Build React app: `npm run build`
2. Serve static files from Express
3. Single port deployment
4. Environment-based configuration

### VS Code Extension (Future)
- Package as `.vsix`
- Use Webview API
- Access VS Code workspace API
- Publish to marketplace

---

## Testing Strategy

### Unit Tests
- Test Git command parsing
- Test analytics calculations
- Test error explanation logic

### Integration Tests
- Test API endpoints
- Test database operations
- Test Git CLI integration

### E2E Tests
- Test complete commit flow
- Test branch switching
- Test remote operations

---

## Monitoring & Logging

### Application Logs
- All Git commands executed
- API request/response times
- Error occurrences

### Analytics Tracking
- Feature usage statistics
- Common error patterns
- User workflow patterns

### Performance Metrics
- API response times
- Git operation duration
- Database query performance

---

## Future Architecture Enhancements

### Phase 2: VS Code Extension
- Migrate to Webview API
- Integrate with VS Code workspace
- Use VS Code's Git API where possible

### Phase 3: Cloud Integration
- Optional cloud backup
- Cross-device sync
- Team collaboration features

### Phase 4: Plugin System
- Plugin API specification
- Community plugin marketplace
- Custom automation scripts

---

**Document Version:** 1.0.0  
**Last Updated:** January 2026  
**Author:** RepoSense Development Team
