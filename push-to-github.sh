#!/bin/bash

echo "========================================="
echo "GitHub Push Script"
echo "========================================="
echo ""
echo "Before running this script:"
echo "1. Create a GitHub repository at https://github.com/new"
echo "2. Name it: lead-generator"
echo "3. Keep it PRIVATE"
echo "4. DON'T initialize with README/gitignore/license"
echo ""
echo "5. Create a Personal Access Token:"
echo "   - Go to https://github.com/settings/tokens"
echo "   - Click 'Generate new token (classic)'"
echo "   - Check the 'repo' box"
echo "   - Copy the token"
echo ""
read -p "Press Enter when you've completed the above steps..."

echo ""
read -p "Enter your GitHub username: " GITHUB_USERNAME

echo ""
echo "Adding remote repository..."
git remote add origin "https://github.com/$GITHUB_USERNAME/lead-generator.git"

echo ""
echo "Pushing to GitHub..."
echo "When prompted for password, paste your Personal Access Token (not your GitHub password!)"
echo ""

git branch -M main
git push -u origin main

echo ""
echo "========================================="
echo "✅ Done! Your code is now on GitHub!"
echo "========================================="
echo ""
echo "Next step: Deploy to Railway"
echo "Visit: https://railway.app"
