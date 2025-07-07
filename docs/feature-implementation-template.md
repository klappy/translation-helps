# Feature Implementation Template

<!--
This template ENFORCES proper git workflow and prevents process violations.
Copy this template for every new feature and follow ALL steps in order.
-->

## 🚨 **CRITICAL: Pre-Flight Checklist**

### **Step 0: Git Workflow Verification (MANDATORY)**

Before ANY code changes, complete this checklist:

```bash
# 1. Verify current branch and status
git status
git branch

# 2. Ensure you're starting from clean dev branch
git checkout dev
git pull origin dev

# 3. Create feature branch (REQUIRED - NO EXCEPTIONS)
git checkout -b feature/[descriptive-name]

# 4. Verify you're on the feature branch
git branch  # Should show * feature/[descriptive-name]
```

**🛑 STOP: Do not proceed until you have:**
- [ ] Verified you're on the feature branch (not dev/staging/production)
- [ ] Confirmed git status is clean
- [ ] Created branch with descriptive name following convention

### **Step 1: Feature Planning**

- [ ] **Feature Name**: `feature/[descriptive-name]`
- [ ] **Purpose**: Brief description of what this feature accomplishes
- [ ] **Primary Audience**: Who will use this feature
- [ ] **Success Criteria**: How we'll know it's complete

### **Step 2: Implementation Phases**

Break work into logical phases:
- [ ] **Phase 1**: Foundation/Setup
- [ ] **Phase 2**: Core Implementation  
- [ ] **Phase 3**: Polish/Testing
- [ ] **Phase 4**: Documentation

### **Step 3: Technical Checklist**

- [ ] Dependencies identified and documented
- [ ] Component structure planned
- [ ] File naming follows conventions
- [ ] CSS modules planned
- [ ] Testing approach defined

### **Step 4: Development Workflow**

- [ ] Regular commits with descriptive messages
- [ ] Branch stays focused on single feature
- [ ] No unrelated changes included
- [ ] Testing performed locally

### **Step 5: Completion Checklist**

- [ ] Feature functionality complete
- [ ] Version bump applied (if required)
- [ ] CHANGELOG.md updated
- [ ] Documentation updated
- [ ] Mobile responsiveness verified
- [ ] Accessibility tested

### **Step 6: Deployment Preparation**

- [ ] Final testing in development environment
- [ ] Ready for merge request/pull request
- [ ] Branch pushed to origin: `git push origin feature/[descriptive-name]`
- [ ] Merge request created targeting `dev` branch

## 📋 **Implementation Notes**

### **Architecture Decisions**
- Document any significant architectural choices
- Explain why certain approaches were chosen
- Note any trade-offs or alternatives considered

### **Dependencies**
- List any new dependencies added
- Explain why each dependency was necessary
- Document any version constraints

### **Testing Strategy**
- Unit tests added/modified
- Integration tests planned
- E2E scenarios covered
- Manual testing checklist

## 🚨 **Red Flags - Stop If You See These**

- Working directly on `dev`, `staging`, `production`, or `master` branch
- Making unrelated changes outside feature scope
- Skipping version bump when required by user preferences
- Missing CHANGELOG.md entry for user-facing changes
- No testing performed
- Documentation not updated

## 🎯 **Success Metrics**

Define how you'll measure success:
- [ ] Functionality works as designed
- [ ] Performance meets requirements
- [ ] User experience is intuitive
- [ ] Code quality meets standards
- [ ] Documentation is complete

---

**Template Version**: 1.0  
**Created**: 2025-01-08  
**Based on Lesson**: Showcase Feature Branching Oversight  
**Purpose**: Prevent process violations through systematic enforcement 