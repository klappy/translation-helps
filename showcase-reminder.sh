#!/bin/bash
# Showcase Progress Reminder Script
# Run this daily or add to your shell profile

echo "🚨 SHOWCASE REMINDER 🚨"
echo "====================="
echo "Have you updated the showcase progress today?"
echo ""
echo "1. Check README.md tracking section"
echo "2. Update docs/showcase-implementation-plan.md"
echo "3. Commit your progress"
echo ""
echo "Current status:"
grep -A 1 "Overall:" README.md 2>/dev/null || echo "⚠️  Can't find progress in README!"
echo ""
echo "Press Enter to open the tracking doc..."
read
${EDITOR:-code} docs/showcase-implementation-plan.md
