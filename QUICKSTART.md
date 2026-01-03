# RepoSense Quick Start Guide

Get up and running with RepoSense in under 5 minutes!

---

## ⚡ Prerequisites Check

Before starting, ensure you have:

```bash
# Check Node.js (need 16+)
node --version

# Check npm
npm --version

# Check Git installation
git --version
```

If any command fails, install the missing tool first.

---

## 🚀 5-Minute Setup

### Step 1: Install Dependencies (2 minutes)

```bash
cd reposense-web
npm install
```

This installs all required packages for both frontend and backend.

### Step 2: Start the Application (1 minute)

```bash
npm run dev
```

This starts both servers:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

### Step 3: Open in Browser (30 seconds)

Navigate to: **http://localhost:3000**

### Step 4: Configure Workspace (1 minute)

1. Enter your Git repository path in the input field
   - Example: `/Users/yourname/projects/my-repo`
   - Or: `C:\Users\YourName\Documents\my-repo`

2. Click "Set Path"

### Step 5: Set Git Identity (30 seconds)

1. Click the ⚙️ Settings icon
2. Enter your name and email
3. Click "Save Identity"

**Done! You're ready to use RepoSense! 🎉**

---

## 🎯 Your First Commit

### Option A: Make Changes First

1. Edit some files in your repository (use your code editor)
2. Return to RepoSense - it will auto-detect changes
3. Click "AI Suggest" to get a commit message
4. Click "Commit & Push"

### Option B: Quick Test Commit

1. Create a test file:
   ```bash
   echo "test" > test.txt
   ```
2. In RepoSense, click "AI Suggest"
3. Review the suggested message
4. Click "Commit & Push"

---

## 📊 View Your Analytics

1. Click the "Analytics" tab at the top
2. See your productivity metrics:
   - Time saved
   - Commit streak
   - Lines of code changed
   - Push success rate

---

## 🔧 Common First-Time Tasks

### Switching Branches

1. Go to the Repository panel (left side)
2. Select a branch from the dropdown
3. Click "Switch"

### Changing Remote URL

1. Go to the Repository panel
2. Edit the Remote URL field
3. Click "Update URL"
4. Click "Test" to verify it works

### Creating a New Branch

1. Repository panel → "Create New Branch"
2. Enter branch name (e.g., `feature/my-feature`)
3. Click "Create"

---

## ⚠️ Troubleshooting

### "No Git repository found"

**Solution:** Make sure you've entered the correct path to a folder that contains a `.git` directory.

```bash
# Check if your folder is a Git repo
cd /your/repo/path
ls -la | grep .git
```

If no `.git` folder exists, either:
- Initialize a new repo: Click "Initialize Repository" in RepoSense
- Or clone an existing one: Use RepoSense's clone feature

### "Permission denied" when pushing

**Solution:** Configure your Git credentials.

**For HTTPS:**
```bash
git config credential.helper store
git push origin main
# Enter credentials once
```

**For SSH:**
```bash
# Check if you have SSH keys
ls ~/.ssh/id_rsa.pub

# If not, generate them
ssh-keygen -t rsa -b 4096 -C "your.email@example.com"

# Add to GitHub
cat ~/.ssh/id_rsa.pub
# Copy and paste to GitHub → Settings → SSH Keys
```

### Port already in use

**Solution:** Change the ports in `package.json`:

```json
"scripts": {
  "server": "PORT=3002 node server/index.js",
  "client": "PORT=3001 vite"
}
```

### Database errors

**Solution:** Delete the database and restart:

```bash
rm server/reposense.db
npm run dev
```

---

## 💡 Pro Tips

### Tip 1: Keep RepoSense Open
Leave RepoSense running in your browser while you code. It will detect changes automatically.

### Tip 2: Use Keyboard Shortcuts
- Press `Enter` in the commit message box to commit
- Press `Escape` to cancel branch creation

### Tip 3: Check the Activity Feed
The right panel shows all operations. Use it to verify what happened.

### Tip 4: Auto-Push Toggle
If you want to review commits before pushing, turn off "Auto-push after commit"

### Tip 5: Test Remote Connection
Before making important commits, click "Test" on the remote URL to ensure it's reachable.

---

## 🎓 Learning Path

### Week 1: Basic Operations
- Make daily commits
- Practice branch switching
- Build your commit streak

### Week 2: Advanced Features
- Try changing remote URLs
- Experiment with AI suggestions
- Create feature branches

### Week 3: Analytics Focus
- Track your time saved
- Optimize your workflow
- Share your streak achievements

---

## 📚 Next Steps

Now that you're set up, explore:

1. **README.md** - Full feature documentation
2. **ARCHITECTURE.md** - How RepoSense works internally
3. **IMPLEMENTATION.md** - Customize and extend features
4. **FEATURES.md** - Complete feature list

---

## 🆘 Getting Help

### Check the Activity Feed
Most issues are logged in the activity feed with helpful messages.

### Review the Logs
Look for error messages marked with ✗ in the activity feed.

### Common Error Explanations

| Error | Meaning | Solution |
|-------|---------|----------|
| "Permission denied" | Authentication failed | Check Git credentials |
| "Could not resolve host" | Network issue | Check internet connection |
| "Push rejected" | Remote has newer commits | Pull first, then push |
| "Not a git repository" | Invalid workspace path | Check the path or initialize repo |

### Still Stuck?

1. Check that Git CLI works: `git status`
2. Verify your workspace path is correct
3. Look at the browser console (F12) for errors
4. Check the terminal where you ran `npm run dev` for backend errors

---

## 🎉 Success Checklist

Mark off each item as you complete it:

- [ ] Installed dependencies
- [ ] Started the application
- [ ] Set workspace path
- [ ] Configured Git identity
- [ ] Made first commit
- [ ] Viewed analytics
- [ ] Switched branches
- [ ] Tested remote connection
- [ ] Built a commit streak
- [ ] Explored all features

---

## 🚀 You're All Set!

Welcome to RepoSense! You now have a powerful Git control center that will:

✅ Save you time on every commit  
✅ Help you build consistent commit habits  
✅ Track your productivity with real metrics  
✅ Make Git feel effortless  

**Happy coding!** 🎊

---

**Need more help?** Check the other documentation files in this repository.
