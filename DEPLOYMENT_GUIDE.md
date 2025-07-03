# Shamshiri Kitchen - Cloudflare Pages Deployment Guide

## ✅ Pre-deployment Checklist

Your app is now ready for deployment! All build issues have been resolved.

## 🚀 Deployment Steps

### Option 1: Git Integration (Recommended)

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Ready for Cloudflare Pages deployment"
   git push origin main
   ```

2. **Connect to Cloudflare Pages**
   - Go to [Cloudflare Pages](https://pages.cloudflare.com/)
   - Click "Create a project"
   - Connect your GitHub repository
   - Select your `Kitchen.shamshiri` repository

3. **Build Settings**
   - **Build command**: `npm run build:cf`
   - **Build output directory**: `.next`
   - **Root directory**: `/` (leave empty)
   - **Node.js version**: `18` or `20` (recommended)

### Option 2: Direct Upload

1. **Create a deployment package**
   ```bash
   npm run build:cf
   ```

2. **Upload to Cloudflare Pages**
   - Go to Cloudflare Pages dashboard
   - Click "Upload assets"
   - Upload the `.next` directory

## 🧹 Cache Cleanup Process

The `npm run build:cf` command automatically:
1. Builds your Next.js application
2. Removes large cache files that exceed Cloudflare's 25MB limit
3. Cleans up unnecessary manifest files
4. Optimizes the deployment package to ~1.4MB

## 🔧 Environment Variables

Set these in your Cloudflare Pages dashboard:

### Required Variables:
- `TWILIO_ACCOUNT_SID`: Your Twilio Account SID
- `TWILIO_AUTH_TOKEN`: Your Twilio Auth Token  
- `TWILIO_PHONE_NUMBER`: +14165784000

### Firebase Variables:
- `NEXT_PUBLIC_FIREBASE_API_KEY`: Your Firebase API key
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`: Your Firebase auth domain
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`: Your Firebase project ID
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`: Your Firebase storage bucket
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`: Your Firebase messaging sender ID
- `NEXT_PUBLIC_FIREBASE_APP_ID`: Your Firebase app ID

## 📁 Files Automatically Excluded

The build process automatically removes:
- `.next/cache/` - Build cache files (31.7MB+)
- `.next/server/` - Server-side files
- `.next/trace` - Build trace files
- Various manifest files that aren't needed for deployment

**Result**: Deployment package is only ~1.4MB (well under 25MB limit)

## 🔄 Automatic Deployments

Once connected to GitHub, Cloudflare Pages will automatically:
- Deploy on every push to main branch
- Run `npm run build:cf` in their environment
- Handle SSL certificates
- Provide CDN distribution

## 📱 PWA Features

Your app includes:
- Service Worker for offline functionality
- Web App Manifest for mobile installation
- Optimized for mobile devices

## 🎯 Post-Deployment

After deployment:
1. Test the login functionality
2. Verify SMS and email notifications work
3. Test the ordering flow
4. Check PWA installation on mobile devices

## 🐛 Troubleshooting

### If you still get the 25MB error:
1. Make sure you're using `npm run build:cf` instead of `npm run build`
2. Check that the cache cleanup script ran successfully
3. Verify no large files exist in `.next/` directory

### Other issues:
1. Check the build logs in Cloudflare Pages dashboard
2. Verify environment variables are set correctly
3. Ensure Firebase and Twilio credentials are valid
4. Check that your domain is properly configured

## 📞 Support

Your Shamshiri Kitchen app is now deployment-ready! 🎉

**Build Command**: `npm run build:cf`
**Deployment Size**: ~1.4MB
**Status**: Ready for Cloudflare Pages ✅ 