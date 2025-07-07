# AI Assistant Development Guidelines

## 🤖 **For AI Assistants Working on Translation Helps**

### **CRITICAL: Always Check Git Status First**

Before making ANY code changes, you MUST:

```bash
# 1. Check current git status
git status
git branch

# 2. Verify branch - Should NOT be dev/staging/production/master
# If on wrong branch, STOP and create proper feature branch
```

### **🚨 Red Alert: Stop Immediately If**

- User is on `dev`, `staging`, `production`, or `master` branch
- Git status shows uncommitted changes to existing files
- About to start implementation without proper feature branch

### **✅ Proper Workflow Enforcement**

1. **Always start with**: "Let me check your current git status first..."
2. **Verify proper branch**: Must be `feature/descriptive-name`
3. **Create feature branch if missing**:
   ```bash
   git checkout dev
   git pull origin dev
   git checkout -b feature/descriptive-name
   ```

### **🎯 Implementation Order (NEVER DEVIATE)**

1. **Git workflow verification** (use commands above)
2. **Feature planning** (scope, phases, success criteria)
3. **Technical implementation** (code changes)
4. **Testing and verification** (functionality works)
5. **Documentation updates** (version bump, changelog, README)
6. **Deployment preparation** (ready for merge)

### **📋 Mandatory Checklist for Every Feature**

- [ ] Git branch verified/created properly
- [ ] Implementation stays focused on single feature
- [ ] Version bump applied (if user preference requires it)
- [ ] CHANGELOG.md updated with comprehensive entry
- [ ] README.md updated if feature affects user-facing functionality
- [ ] Testing performed and verified
- [ ] Mobile responsiveness checked
- [ ] Documentation updated

### **🚫 Never Skip These Steps**

- **Branch creation**: Even for "small" changes
- **Version bumps**: User preferences require this for all commits
- **Changelog updates**: Document every change comprehensively
- **Process verification**: Better to be redundant than sorry

### **📚 Learning from the Showcase Oversight**

On 2025-01-08, during showcase implementation, proper feature branching was skipped. This violated established workflow despite clear documentation. The lesson:

> **Process discipline is as important as technical excellence.**

### **🛠️ Quick Reference Templates**

Use these templates for common scenarios:

#### **Starting New Feature**
```markdown
Before we begin implementation, let me verify your git status:

```bash
git status
git branch
```

I notice you're on the `dev` branch. Let's create a proper feature branch:

```bash
git checkout dev
git pull origin dev
git checkout -b feature/[descriptive-name]
git branch  # Verify you're on the feature branch
```

Now we can proceed with implementation.
```

#### **Implementation Complete**
```markdown
The feature is now complete! Let's finish with proper documentation:

1. Version bump applied ✅
2. CHANGELOG.md updated ✅  
3. README.md updated ✅
4. Testing verified ✅

Ready for merge request to `dev` branch.
```

### **🎯 Success Metrics for AI Assistants**

- **100% compliance** with feature branch workflow
- **Zero commits** directly to dev/staging/production/master
- **Complete documentation** for every feature
- **User satisfaction** with both results AND process

---

**Guidelines Version**: 1.0  
**Created**: 2025-01-08  
**Purpose**: Prevent workflow violations and maintain development discipline  
**Based on**: Showcase Feature Branching Oversight case study 