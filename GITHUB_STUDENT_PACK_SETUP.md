# GitHub Student Pack - Complete Setup Guide

This guide will walk you through setting up Dump It using services available in the GitHub Student Pack.

## Recommended Service Stack

- **Database**: MongoDB Atlas (Free tier - 512MB)
- **File Storage**: Cloudflare R2 (Free tier - 10GB, no egress fees) OR AWS S3 (with student credits)
- **Backend Hosting**: Render (Free tier - truly free) OR Railway (Limited free - $1/month credit)
- **Frontend Hosting**: Vercel (Free tier - excellent for React)

### ⚠️ Railway Free Tier Note
Railway offers:
- $5 one-time credit for 30 days (trial)
- After trial: $1/month credit (may not be enough for continuous hosting)
- **Recommendation**: Use Render for a truly free option, or Railway's trial for testing

---

## Part 1: MongoDB Atlas (Database)

### Step 1: Claim MongoDB Atlas from GitHub Student Pack

1. Go to [GitHub Education](https://education.github.com/pack)
2. Sign in with your GitHub account
3. Find "MongoDB Atlas" in the list
4. Click "Get your pack" and follow the redemption process

### Step 2: Create MongoDB Atlas Account

1. Visit [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Sign up with your email (use the same email as your GitHub Student Pack)
3. Verify your email address

### Step 3: Create a Free Cluster

1. After logging in, click **"Build a Database"**
2. Choose **"M0 FREE"** tier (512MB storage)
3. Select a cloud provider and region (choose closest to you):
   - AWS, Google Cloud, or Azure
   - Recommended: AWS in your region
4. Click **"Create"** (takes 3-5 minutes)

### Step 4: Create Database User

1. Go to **"Database Access"** in the left sidebar
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Enter a username (e.g., `dumpit-admin`)
5. Click **"Autogenerate Secure Password"** and **COPY IT** (you'll need it!)
6. Under "Database User Privileges", select **"Atlas admin"**
7. Click **"Add User"**

dumpit-admin
HH6QHIpQdZbJ1Gra password

### Step 5: Configure Network Access

1. Go to **"Network Access"** in the left sidebar
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (for now - you can restrict later)
4. Click **"Confirm"**

### Step 6: Get Connection String

1. Go to **"Database"** in the left sidebar
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Select **"Node.js"** and version **"5.5 or later"**
5. **COPY the connection string** - it looks like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority

   mongodb+srv://dumpit-admin:HH6QHIpQdZbJ1Gra@cluster0.5bpn3fo.mongodb.net/?appName=Cluster0
   ```
6. Replace `<username>` with your database username
7. Replace `<password>` with your database password (the one you copied earlier)
8. Add database name at the end: `?retryWrites=true&w=majority` → `?retryWrites=true&w=majority&appName=DumpIt`

**Your final connection string should look like:**
```
mongodb+srv://dumpit-admin:YourPassword123@cluster0.xxxxx.mongodb.net/dumpit?retryWrites=true&w=majority
```

### Step 7: Save Connection String

Save this connection string - you'll use it in Part 4 when deploying!
mongodb+srv://dumpit-admin:HH6QHIpQdZbJ1Gra@cluster0.5bpn3fo.mongodb.net/?appName=Cluster0

---

## Part 2: Cloudflare R2 (File Storage) - RECOMMENDED

### Step 1: Create Cloudflare Account

1. Go to [Cloudflare](https://dash.cloudflare.com/sign-up)
2. Sign up for a free account (no credit card required)

### Step 2: Enable R2

1. In Cloudflare dashboard, click **"R2"** in the left sidebar
2. Click **"Create bucket"**
3. Enter bucket name: `dump-it-files` (or any name you like)
4. Choose a location (select closest to you)
5. Click **"Create bucket"**

### Step 3: Create API Token

1. Click **"Manage R2 API Tokens"** (top right)
2. Click **"Create API token"**
3. Enter token name: `dump-it-storage`
4. Under "Permissions", select:
   - **Object Read & Write**
5. Under "TTL", leave as "Never expire" (or set expiration if preferred)
6. Click **"Create API Token"**
7. **COPY BOTH VALUES:**
   - **Access Key ID**  99369ebddc3e9e18e87d347063c7e706
   - **Secret Access Key**  c18e6bd8eea3abf53cfad7b3211df9bd8005c583045598ad8cab939fc0958569
   Save these - you'll need them!

### Step 4: Get R2 Endpoint URL

1. Go back to your R2 bucket
2. Click on your bucket name
3. Under "Settings", find **"S3 API"**
4. **COPY the endpoint URL** - it looks like:
   ```
   https://xxxxx.r2.cloudflarestorage.com
   ```

### Step 5: Save R2 Credentials

Save these values:
- **Access Key ID**
- **Secret Access Key**
- **Bucket Name**: `dump-it-files` (or whatever you named it)
- **Endpoint URL**: `https://xxxxx.r2.cloudflarestorage.com`

---

## Part 2 Alternative: AWS S3 (File Storage)

If you prefer AWS S3 (you get $75-200 in credits with GitHub Student Pack):

### Step 1: Claim AWS Credits

1. Go to [GitHub Education](https://education.github.com/pack)
2. Find "AWS Educate" or "AWS Credits"
3. Follow the redemption process

### Step 2: Create S3 Bucket

1. Log into [AWS Console](https://console.aws.amazon.com)
2. Go to **S3** service
3. Click **"Create bucket"**
4. Enter bucket name: `dump-it-files-yourname` (must be globally unique)
5. Choose region (closest to you)
6. Uncheck **"Block all public access"** (or configure CORS later)
7. Click **"Create bucket"**

### Step 3: Create IAM User for S3 Access

1. Go to **IAM** service
2. Click **"Users"** → **"Create user"**
3. Username: `dump-it-s3-user`
4. Check **"Provide user access to the AWS Management Console"** → **"I want to create an IAM user"**
5. Click **"Next"**
6. Under "Set permissions", select **"Attach policies directly"**
7. Search for and select **"AmazonS3FullAccess"**
8. Click **"Next"** → **"Create user"**
9. **COPY the Access Key ID and Secret Access Key** (save these!)

### Step 4: Save S3 Credentials

Save these values:
- **Access Key ID**
- **Secret Access Key**
- **Bucket Name**
- **Region** (e.g., `us-east-1`)

---

## Part 3: Render (Backend Hosting) - RECOMMENDED (Truly Free)

### Step 1: Create Render Account

1. Go to [Render](https://render.com)
2. Click **"Get Started for Free"**
3. Sign up with **GitHub** (recommended - connects automatically)

### Step 2: Create New Web Service

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Select your repository

### Step 3: Configure Service

1. **Name**: `dump-it-backend` (or any name you like)
2. **Environment**: `Node`
3. **Build Command**: `npm install && cd client && npm install && npm run build`
4. **Start Command**: `npm start`
5. **Plan**: Select **"Free"** (truly free, no credit card needed!)

### Step 4: Add Environment Variables

Click **"Advanced"** → **"Add Environment Variable"** and add:

```
NODE_ENV=production
PORT=5000
MONGODB_URI=your_mongodb_connection_string_from_part_1
R2_ACCESS_KEY_ID=your_r2_access_key
R2_SECRET_ACCESS_KEY=your_r2_secret_key
R2_BUCKET_NAME=dump-it-files
R2_ENDPOINT_URL=your_r2_endpoint_url
```

OR if using AWS S3:

```
NODE_ENV=production
PORT=5000
MONGODB_URI=your_mongodb_connection_string
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=dump-it-files-yourname
```

### Step 5: Deploy

1. Click **"Create Web Service"**
2. Render will build and deploy automatically (takes 5-10 minutes first time)
3. Once deployed, you'll get a URL like: `https://dump-it-backend.onrender.com`
4. **COPY THIS URL** - this is your backend API URL!

### ⚠️ Render Free Tier Notes:
- Service may spin down after 15 minutes of inactivity (takes ~30 seconds to wake up)
- This is fine for personal use - first request will be slower, then it's fast
- No credit card required
- Truly free forever (within limits)

---

## Part 3 Alternative: Railway (Backend Hosting) - Limited Free

### Step 1: Create Railway Account

1. Go to [Railway](https://railway.app)
2. Click **"Start a New Project"**
3. Sign up with **GitHub** (recommended - connects automatically)

### Step 2: Create New Project

1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Authorize Railway to access your GitHub
4. Select your repository (or create one first)

### Step 3: Configure Environment Variables

1. In your Railway project, click on your service
2. Go to **"Variables"** tab
3. Add the same environment variables as Render (see above)

### Step 4: Configure Build Settings

1. Go to **"Settings"** tab
2. Set **"Root Directory"** to: `server` (if deploying only backend)
   OR leave blank if deploying full-stack
3. Set **"Start Command"** to: `node index.js`
4. Railway will auto-detect Node.js and install dependencies

### Step 5: Deploy

1. Railway will automatically deploy when you push to GitHub
2. Or click **"Deploy"** button
3. Wait for deployment (2-5 minutes)
4. Once deployed, Railway will give you a URL like: `https://your-app.up.railway.app`
5. **COPY THIS URL** - this is your backend API URL!

### ⚠️ Railway Free Tier Limitations:
- $5 one-time credit for 30 days (trial period)
- After trial: Only $1/month credit (may not be enough for continuous hosting)
- **Recommendation**: Use for testing, switch to Render for production

---

## Part 3 Alternative: Fly.io (Backend Hosting) - Also Free

### Step 1: Create Fly.io Account

1. Go to [Fly.io](https://fly.io)
2. Sign up with **GitHub** (recommended)
3. Install Fly CLI: `curl -L https://fly.io/install.sh | sh`

### Step 2: Create App

1. In your project directory, run: `fly launch`
2. Follow prompts to create app
3. Select free regions

### Step 3: Configure Environment Variables

1. Set secrets: `fly secrets set MONGODB_URI=... R2_ACCESS_KEY_ID=...` etc.
2. Or use `fly.toml` configuration file

### Step 4: Deploy

1. Run: `fly deploy`
2. Get URL: `https://your-app.fly.dev`

### ⚠️ Fly.io Free Tier:
- 3 shared-cpu VMs
- 3GB persistent volumes
- 160GB outbound data transfer
- Good for small apps

---

## Part 4: Vercel (Frontend Hosting)

### Step 1: Create Vercel Account

1. Go to [Vercel](https://vercel.com)
2. Sign up with **GitHub** (recommended)

### Step 2: Import Project

1. Click **"Add New..."** → **"Project"**
2. Select your GitHub repository
3. Vercel will auto-detect React

### Step 3: Configure Project

1. **Framework Preset**: React
2. **Root Directory**: `client`
3. **Build Command**: `npm run build` (auto-filled)
4. **Output Directory**: `build` (auto-filled)
5. **Install Command**: `npm install` (auto-filled)

### Step 4: Add Environment Variables

Click **"Environment Variables"** and add:

```
REACT_APP_API_URL=https://your-backend.onrender.com/api
```

Replace with your actual backend URL from Part 3! (Use your Render, Railway, or Fly.io URL)

### Step 5: Deploy

1. Click **"Deploy"**
2. Wait 1-2 minutes
3. Vercel will give you a URL like: `https://dump-it.vercel.app`
4. **COPY THIS URL** - this is your frontend URL!

### Step 6: Update Backend CORS (Important!)

1. Go back to your backend hosting (Render/Railway/Fly.io)
2. Update environment variable to allow your Vercel domain:

In Render/Railway, add environment variable:
```
ALLOWED_ORIGINS=https://dump-it.vercel.app
```

**Note**: If using multiple origins, separate with commas:
```
ALLOWED_ORIGINS=https://dump-it.vercel.app,https://yourdomain.com
```

---

## Part 5: Connect Your Domain (Optional)

### Step 1: Claim Free Domain from Namecheap

1. Go to [GitHub Education](https://education.github.com/pack)
2. Find "Namecheap" offer
3. Claim your free `.me` domain for 1 year

### Step 2: Configure Domain in Vercel

1. In Vercel project, go to **"Settings"** → **"Domains"**
2. Add your domain: `dumpit.yourdomain.me`
3. Follow DNS configuration instructions
4. Update `REACT_APP_API_URL` to use your domain

### Step 3: Configure Domain in Render/Railway/Fly.io

1. In Render: Go to **"Settings"** → **"Custom Domains"** → Add domain
2. In Railway: Go to **"Settings"** → **"Domains"** → Add custom domain
3. In Fly.io: Use `fly certs add yourdomain.com`
4. Update DNS records as instructed

---

## Part 6: Update Code for MongoDB and Cloud Storage

The code needs to be updated to use MongoDB and cloud storage. See the next section for code changes.

---

## Quick Reference: All Your Credentials

Create a secure file (don't commit to Git!) with:

```
=== MONGODB ===
Connection String: mongodb+srv://...

=== CLOUDFLARE R2 ===
Access Key ID: ...
Secret Access Key: ...
Bucket Name: dump-it-files
Endpoint: https://xxxxx.r2.cloudflarestorage.com

=== BACKEND (Render/Railway/Fly.io) ===
URL: https://your-backend.onrender.com
(OR https://your-app.up.railway.app if using Railway)
(OR https://your-app.fly.dev if using Fly.io)

=== FRONTEND (Vercel) ===
URL: https://dump-it.vercel.app

=== DOMAIN (if using) ===
Frontend: dumpit.yourdomain.me
Backend: api.yourdomain.me
```

---

## Next Steps

1. Update the code to use MongoDB (see code updates)
2. Update the code to use cloud storage (see code updates)
3. Push code to GitHub
4. Services will auto-deploy
5. Test your application!

