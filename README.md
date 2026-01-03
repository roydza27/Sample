# RepoSense-Web 🚀

> **AI-Powered GitHub Control Center with Analytics and Automation**

RepoSense transforms Git workflow into a visual, intelligent command center that eliminates repetitive terminal commands and provides real-time productivity insights.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![React](https://img.shields.io/badge/React-18.2-61dafb)
![Node](https://img.shields.io/badge/Node-16+-339933)

---

## 🎯 Product Vision

RepoSense is not just another Git GUI tool. It's a **complete developer productivity platform** that:

- **Eliminates CLI friction** - One-click commits and pushes
- **Provides intelligence** - AI commit suggestions and error explanations
- **Measures impact** - Real-time analytics showing time saved, lines changed, and commit streaks
- **Ensures reliability** - Offline commit queue and remote reachability checks
- **Builds habits** - Streak tracking and productivity gamification

### Why RepoSense?

Most Git tools in 2026 are:
- ❌ Terminal heavy
- ❌ Not analytics driven
- ❌ Not beginner friendly
- ❌ Not AI-error-aware

RepoSense becomes a **visual command center** that makes Git feel effortless again.

---

## ✨ Core Features

### 🎮 Repository Control Center
- ✅ Auto-detect `.git` folder in workspace
- ✅ Show current repo + branch + remote URL
- ✅ Test if remote is reachable
- ✅ Initialize or clone repos from UI
- ✅ Change remote URL anytime
- ✅ Branch switching, creation, and deletion

### ⚡ Commit & Push Automation
- ✅ One-click commit with AI-suggested messages
- ✅ Auto-stage all modified files
- ✅ Diff preview before committing 
- ✅ Auto-push option
- ✅ Push retry on failure
- ✅ Offline commit queue

### 🧠 AI Intelligence Layer
- ✅ Commit message suggestions based on file changes
- ✅ Human-friendly Git error explanations
- ✅ `.gitignore` template generation
- ✅ Diff summary in natural language
- ✅ Branch naming recommendations

### 📊 Analytics Dashboard
Track your Git productivity with real metrics:

| Metric | Purpose |
|--------|---------|
| **Time Saved** | Proves CLI automation value |
| **Files Changed** | Commit scope tracking |
| **Lines Added/Removed** | Code impact measurement |
| **Commit Streak** | Habit building gamification |
| **Push Success %** | Reliability indicator |
| **Remote Switch Count** | Flexibility usage stats |

---

## 🏗 Architecture

### Tech Stack

**Frontend:**
- React 18.2 with hooks
- Tailwind CSS for styling
- Lucide React icons
- Vite for fast development

**Backend:**
- Node.js Express server
- SQLite database for analytics
- Git CLI execution via `child_process`
- RESTful API design

**System Design:**
```
┌─────────────────────────────────────────────┐
│           React Frontend (Port 3000)        │
│  ┌─────────┬──────────┬──────────────────┐ │
│  │ Repo    │ Commit   │ Analytics        │ │
│  │ Panel   │ Panel    │ Dashboard        │ │
│  └─────────┴──────────┴──────────────────┘ │
└─────────────────┬───────────────────────────┘
                  │ REST API
┌─────────────────▼───────────────────────────┐
│      Node.js Server (Port 3001)             │
│  ┌──────────────────────────────────────┐   │
│  │  Git Command Executor                │   │
│  │  - git status, add, commit, push     │   │
│  │  - git remote, branch, checkout      │   │
│  └──────────────────────────────────────┘   │
│  ┌──────────────────────────────────────┐   │
│  │  SQLite Analytics Store              │   │
│  │  - commits, analytics, config        │   │
│  └──────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

### API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/repo/detect` | POST | Detect Git repo and get info |
| `/api/repo/init` | POST | Initialize new Git repo |
| `/api/repo/status` | POST | Get changed files |
| `/api/repo/diff` | POST | Get diff statistics |
| `/api/repo/commit-push` | POST | Commit and optionally push |
| `/api/repo/push` | POST | Push to remote |
| `/api/repo/checkout` | POST | Switch branches |
| `/api/repo/create-branch` | POST | Create new branch |
| `/api/repo/set-remote` | POST | Change remote URL |
| `/api/repo/set-identity` | POST | Configure Git user |
| `/api/analytics` | GET | Get productivity metrics |
| `/api/ai/suggest-commit` | POST | Get AI commit message |
| `/api/ai/explain-error` | POST | Explain Git error |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ installed
- Git installed and accessible from command line
- A Git repository to manage

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/yourusername/reposense-web.git
cd reposense-web
```

2. **Install dependencies:**
```bash
npm install
```

3. **Start the development server:**
```bash
npm run dev
```

This will start:
- React frontend on `http://localhost:3000`
- Node.js backend on `http://localhost:3001`

4. **Open in browser:**
Navigate to `http://localhost:3000` and set your repository path.

### First-Time Setup

1. **Set Workspace Path:** Enter the absolute path to your Git repository
2. **Configure Identity:** Go to Settings → Set your Git name and email
3. **Start Using:** The dashboard will auto-detect your repo and you're ready!

---

## 📖 User Guide

### Setting Up Your Workspace

1. Click the **Settings** icon (⚙️) in the header
2. Enter the absolute path to your Git repository:
   - Example (macOS/Linux): `/Users/yourname/projects/my-repo`
   - Example (Windows): `C:\Users\YourName\Documents\my-repo`
3. Configure your Git identity (name and email)

### Making Commits

1. The **Commit Panel** shows all modified files
2. View the diff summary (files changed, lines added/removed)
3. Click **AI Suggest** to generate a commit message
4. Enter or edit your commit message
5. Toggle **Auto-push after commit** if desired
6. Click **Commit & Push**

### Managing Branches

1. In the **Repository Panel**, see your current branch
2. Use the dropdown to switch between existing branches
3. Click **Create New Branch** to make a new one
4. Enter branch name (e.g., `feature/new-feature`)

### Changing Remote URL

1. In the **Repository Panel**, find the Remote section
2. Enter new remote URL
3. Click **Update URL**
4. Click **Test** to verify reachability

### Viewing Analytics

1. Click the **Analytics** tab
2. View your productivity metrics:
   - Total commits and time saved
   - Commit streak (consecutive days)
   - Push success rate
   - Code impact (lines added/removed)
3. Track your progress over time

---

## 🎯 Use Cases

### For Beginners
- **No CLI learning curve** - Visual interface for all Git operations
- **Error explanations** - Understand what went wrong in plain English
- **Confidence building** - Preview changes before committing

### For AI-Assisted Developers
- **Quick commits** - One-click workflow for rapid iterations
- **Smart suggestions** - AI generates context-aware commit messages
- **Track productivity** - See how much time automation saves

### For Small Teams
- **Branch management** - Easy switching between features
- **Remote flexibility** - Change repos without terminal commands
- **Activity logging** - See what operations were performed

### For Everyone
- **Streak tracking** - Build consistent commit habits
- **Analytics dashboard** - Quantify your development activity
- **Offline support** - Commit locally when internet is down

---

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory (optional):

```env
PORT=3001
NODE_ENV=development
```

### Database Location

Analytics data is stored in `server/reposense.db` (SQLite). This file is created automatically on first run.

### Git Requirements

RepoSense requires Git to be installed and accessible via command line. Test with:
```bash
git --version
```

---

## 🧪 Development

### Project Structure

```
reposense-web/
├── src/                      # React frontend
│   ├── components/          # UI components
│   │   ├── RepoPanel.jsx   # Repository controls
│   │   ├── CommitPanel.jsx # Commit interface
│   │   ├── AnalyticsPanel.jsx # Metrics dashboard
│   │   ├── ActivityFeed.jsx   # Log viewer
│   │   └── SettingsModal.jsx  # Configuration
│   ├── App.jsx             # Main app component
│   ├── main.jsx            # React entry point
│   └── index.css           # Global styles
├── server/                  # Node.js backend
│   └── index.js            # Express API server
├── package.json            # Dependencies
├── vite.config.js          # Vite configuration
└── tailwind.config.js      # Tailwind setup
```

### Running Tests

```bash
# Run frontend tests
npm run test

# Run backend tests
npm run test:server
```

### Building for Production

```bash
npm run build
```

This creates an optimized build in the `dist/` directory.

---

## 📈 Roadmap

### Phase 1 (Current) - MVP
- ✅ Basic Git operations
- ✅ Analytics tracking
- ✅ AI commit suggestions
- ✅ Activity logging

### Phase 2 (Next 3 months)
- 🔲 VS Code extension version
- 🔲 Pull request automation
- 🔲 Team collaboration features
- 🔲 Cloud backup integration

### Phase 3 (6+ months)
- 🔲 Plugin marketplace
- 🔲 Advanced AI features (code review)
- 🔲 Multi-repo management
- 🔲 Commit quality scoring improvements

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built with React, Node.js, and Git CLI
- Icons by [Lucide React](https://lucide.dev)
- Styled with [Tailwind CSS](https://tailwindcss.com)

---

## 📧 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Email: support@reposense.dev
- Twitter: [@RepoSense](https://twitter.com/reposense)

---

**Made with ❤️ for developers who want effortless Git**
