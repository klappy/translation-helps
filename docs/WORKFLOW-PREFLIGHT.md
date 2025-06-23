# 🛑 WORKFLOW PREFLIGHT CHECKLIST

## THIS DOCUMENT SUPERSEDES ALL OTHER WORKFLOW INSTRUCTIONS

### 🚨 STOP! Before ANY Code Changes

**DO NOT PROCEED WITHOUT COMPLETING THIS CHECKLIST**

### Step 1: Check Your Current Branch

```bash
git branch --show-current
```

**Results:**
- ✅ Shows `feature/*` or `bugfix/*` or `hotfix/*` → Proceed to Step 4
- ❌ Shows `dev` → Go to Step 2
- ❌ Shows `main` → Go to Step 2
- ❌ Shows `staging` → Go to Step 2
- ❌ Shows `production` → Go to Step 2

### Step 2: Create Feature Branch (MANDATORY if on dev/main)

```bash
# Get latest dev branch
git checkout dev
git pull origin dev

# Create your feature branch
git checkout -b feature/[descriptive-name]
```

**Naming Examples:**
- `feature/add-splash-screen`
- `feature/improve-navigation`
- `bugfix/fix-loading-state`
- `hotfix/critical-api-error`

### Step 3: Verify Branch

```bash
git branch --show-current
```

**Must show:** `feature/your-branch-name` (or bugfix/hotfix)

### Step 4: Proceed With Implementation

Now you may:
- Write code
- Make commits
- Push changes

### Step 5: Create Pull Request

```bash
# Push your branch
git push origin feature/your-branch-name

# Go to GitHub and create PR: feature/your-branch → dev
```

---

## 🚫 COMMON VIOLATIONS AND CONSEQUENCES

### Violation: Working directly on dev
**Consequence:** Your commits will be rejected in code review
**Fix:** Create a feature branch and cherry-pick your commits

### Violation: Working directly on main
**Consequence:** Immediate revert of all changes
**Fix:** Never do this. Create hotfix branch if emergency

### Violation: Unclear branch names
**Consequence:** PR rejection until renamed
**Fix:** Use descriptive names: `feature/what-it-does`

---

## 📋 Quick Reference Card

```bash
# EVERY TIME - NO EXCEPTIONS
git checkout dev                    # Start from dev
git pull origin dev                 # Get latest
git checkout -b feature/my-feature  # Create feature branch
# ... do work ...
git push origin feature/my-feature  # Push feature branch
# Create PR on GitHub
```

---

## 🎯 Why This Matters

1. **Protects Production** - Bad code can't accidentally go live
2. **Enables Rollback** - Each feature is isolated
3. **Allows Parallel Work** - Multiple features don't conflict
4. **Maintains History** - Clear record of what changed when
5. **Facilitates Review** - PRs show exactly what one feature changed

---

## 🤖 For AI Assistants

**MANDATORY BEHAVIOR:**
1. Always run `git branch --show-current` before any code changes
2. If not on a feature branch, create one immediately
3. Include the branch creation commands in your response
4. Never assume you're on the correct branch

**RESPONSE TEMPLATE:**
```
I need to implement [feature]. Let me first check the current branch:

[Run: git branch --show-current]

I see we're on [branch]. I'll create a feature branch:

[Run: git checkout dev && git pull origin dev && git checkout -b feature/name]

Now I'm on the feature branch and can proceed with implementation...
```

---

**THIS IS NOT OPTIONAL. THIS IS MANDATORY.**
