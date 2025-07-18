#!/bin/bash

echo "🚀 Smart CDSS Deployment Script"
echo "================================"

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "Initializing git repository..."
    git init
    git add .
    git commit -m "Initial commit: Smart CDSS application"
fi

echo ""
echo "Choose your deployment platform:"
echo "1. Render.com (Recommended - Free & Easy)"
echo "2. Railway (Free Tier)"
echo "3. Vercel (Serverless)"
echo "4. Netlify (Serverless)"
echo "5. Deploy to all platforms"
echo ""

read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        echo "🎯 Deploying to Render.com..."
        echo "1. Go to https://render.com and sign up"
        echo "2. Click 'New +' > 'Web Service'"
        echo "3. Connect your GitHub repository"
        echo "4. Configure:"
        echo "   - Build Command: npm install"
        echo "   - Start Command: npm start"
        echo "   - Environment: Node"
        echo "   - Plan: Free"
        echo "5. Click 'Create Web Service'"
        echo ""
        echo "Your app will be available at: https://your-app-name.onrender.com"
        ;;
    2)
        echo "🚄 Deploying to Railway..."
        echo "1. Go to https://railway.app and sign up"
        echo "2. Click 'New Project' > 'Deploy from GitHub repo'"
        echo "3. Select your repository"
        echo "4. Railway will automatically deploy your app"
        echo ""
        echo "Your app will be available at: https://your-app-name.railway.app"
        ;;
    3)
        echo "⚡ Deploying to Vercel..."
        if ! command -v vercel &> /dev/null; then
            echo "Installing Vercel CLI..."
            npm install -g vercel
        fi
        echo "Running Vercel deployment..."
        vercel --prod
        ;;
    4)
        echo "🌐 Deploying to Netlify..."
        if ! command -v netlify &> /dev/null; then
            echo "Installing Netlify CLI..."
            npm install -g netlify-cli
        fi
        echo "Running Netlify deployment..."
        netlify deploy --prod
        ;;
    5)
        echo "🚀 Deploying to all platforms..."
        echo "This will guide you through deploying to multiple platforms."
        echo ""
        echo "1. First, let's deploy to Vercel:"
        if ! command -v vercel &> /dev/null; then
            npm install -g vercel
        fi
        vercel --prod
        echo ""
        echo "2. Now, let's deploy to Netlify:"
        if ! command -v netlify &> /dev/null; then
            npm install -g netlify-cli
        fi
        netlify deploy --prod
        echo ""
        echo "3. For Render and Railway, follow the manual steps in DEPLOYMENT.md"
        ;;
    *)
        echo "Invalid choice. Please run the script again and choose 1-5."
        exit 1
        ;;
esac

echo ""
echo "✅ Deployment process completed!"
echo "📖 Check DEPLOYMENT.md for detailed instructions"
echo "🔍 Test your deployment with the health check endpoint: /health"
echo ""
echo "🎉 Your Smart CDSS application is now publicly accessible!" 