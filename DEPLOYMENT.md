# Smart CDSS Deployment Guide

This guide provides multiple options for deploying the Smart CDSS application to public URLs.

## 🚀 Quick Deploy Options

### Option 1: Render.com (Recommended - Free & Easy)

1. **Create a Render account** at [render.com](https://render.com)
2. **Connect your GitHub repository**
3. **Create a new Web Service**
4. **Configure the service:**
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment: `Node`
   - Plan: `Free`
5. **Deploy** - Your app will be available at `https://your-app-name.onrender.com`

### Option 2: Railway (Free Tier)

1. **Create a Railway account** at [railway.app](https://railway.app)
2. **Connect your GitHub repository**
3. **Deploy** - Automatic deployment with zero configuration
4. **Your app will be available** at `https://your-app-name.railway.app`

### Option 3: Vercel (Serverless)

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel --prod
   ```

3. **Your app will be available** at `https://your-app-name.vercel.app`

### Option 4: Netlify (Serverless)

1. **Install Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   ```

2. **Deploy:**
   ```bash
   netlify deploy --prod
   ```

3. **Your app will be available** at `https://your-app-name.netlify.app`

### Option 5: Heroku (Classic)

1. **Install Heroku CLI** from [heroku.com](https://heroku.com)

2. **Login and create app:**
   ```bash
   heroku login
   heroku create your-app-name
   ```

3. **Deploy:**
   ```bash
   git push heroku main
   ```

4. **Your app will be available** at `https://your-app-name.herokuapp.com`

## 🔧 Configuration Files

The following configuration files have been created for different platforms:

- `Dockerfile` - For containerized deployment
- `vercel.json` - Vercel configuration
- `netlify.toml` - Netlify configuration
- `render.yaml` - Render configuration
- `app.json` - Heroku configuration
- `netlify/functions/server.js` - Netlify serverless function

## 📋 Pre-deployment Checklist

- [ ] All dependencies are in `package.json`
- [ ] Environment variables are configured
- [ ] Static files are in the `public` directory
- [ ] Health check endpoint is working (`/health`)
- [ ] FHIR data files are included in `generated-data/`

## 🌐 Environment Variables

Set these environment variables in your deployment platform:

```bash
NODE_ENV=production
PORT=3000
OPENAI_API_KEY=your_openai_api_key_here  # Optional
```

## 🔍 Testing Your Deployment

After deployment, test these endpoints:

1. **Health Check:** `https://your-app-url.com/health`
2. **Main App:** `https://your-app-url.com/`
3. **API:** `https://your-app-url.com/api/patients`

## 📊 Platform Comparison

| Platform | Free Tier | Ease of Use | Performance | Custom Domain |
|----------|-----------|-------------|-------------|---------------|
| Render   | ✅ Yes    | ⭐⭐⭐⭐⭐   | ⭐⭐⭐⭐     | ✅ Yes        |
| Railway  | ✅ Yes    | ⭐⭐⭐⭐⭐   | ⭐⭐⭐⭐     | ✅ Yes        |
| Vercel   | ✅ Yes    | ⭐⭐⭐⭐     | ⭐⭐⭐⭐⭐   | ✅ Yes        |
| Netlify  | ✅ Yes    | ⭐⭐⭐⭐     | ⭐⭐⭐⭐     | ✅ Yes        |
| Heroku   | ❌ No     | ⭐⭐⭐      | ⭐⭐⭐      | ✅ Yes        |

## 🎯 Recommended Approach

**For Demo/Development:** Use **Render.com** - it's free, easy, and handles Node.js apps perfectly.

**For Production:** Use **Railway** or **Render** with a custom domain.

## 🔧 Troubleshooting

### Common Issues:

1. **Build Failures:**
   - Check Node.js version (requires 18+)
   - Ensure all dependencies are listed in `package.json`

2. **Runtime Errors:**
   - Check application logs in the platform dashboard
   - Verify environment variables are set correctly

3. **Static Files Not Loading:**
   - Ensure files are in the `public` directory
   - Check file paths in HTML

### Getting Help:

- Check platform-specific documentation
- Review application logs
- Test locally first with `npm start`

## 🚀 Next Steps

1. Choose your preferred deployment platform
2. Follow the specific deployment steps
3. Configure your custom domain (optional)
4. Set up monitoring and analytics
5. Share your public URL!

Your Smart CDSS application will be publicly accessible and ready for demonstrations! 