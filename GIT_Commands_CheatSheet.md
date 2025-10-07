# 🧭 GIT Commands — Quick Reference

### 🚀 Navigation / Info
```bash
git status             # Show changed and untracked files
git log --oneline      # View recent commits (compact)
git branch             # List all branches
git remote -v          # Show GitHub remotes
```

---

### 💾 Basic Commit Flow
```bash
git add .                                  # Stage all changes
git commit -m "Your message here"          # Commit staged files
git push origin main                       # Push to GitHub (main branch)
```

---

### 🌱 Branch Workflow
```bash
git checkout -b feature/your-branch-name   # Create and switch to new branch
git checkout main                          # Switch back to main
git merge feature/your-branch-name         # Merge branch into main
git branch -d feature/your-branch-name     # Delete local branch
git push origin --delete feature/your-branch-name  # Delete remote branch
```

---

### 🔄 Syncing & Updates
```bash
git pull origin main                       # Get latest changes from GitHub
git fetch --all                            # Fetch all branches (no merge)
git reset --hard origin/main               # Reset local to match remote (⚠️ destructive)
```

---

### 🧹 Fixing & Undoing
```bash
git restore .                              # Discard unstaged local changes
git restore --staged <file>                # Unstage a file
git commit --amend -m "New message"        # Edit last commit message
git revert <commit-hash>                   # Undo a specific commit (safe)
```

---

### 🌐 Setup / Remote
```bash
git init -b main                           # Create new repo with main branch
git remote add origin https://github.com/username/repo.git
git push -u origin main                    # First-time push
```

---

⭐ **Tip:** Keep `main` clean — work in feature branches, merge after testing, and use clear commit messages.
