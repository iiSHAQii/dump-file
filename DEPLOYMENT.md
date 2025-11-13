# Deployment Guide

This guide will help you deploy Dump It to your chosen hosting services.

## Quick Start Checklist

- [ ] Choose database hosting service
- [ ] Choose file storage service (or use local)
- [ ] Choose backend hosting service
- [ ] Choose frontend hosting service
- [ ] Configure environment variables
- [ ] Update database connection
- [ ] Update file storage configuration
- [ ] Deploy backend
- [ ] Deploy frontend
- [ ] Test the application

## Database Setup

### Option 1: Keep SQLite (Simple, Local)

No changes needed. SQLite database file will be created automatically.

**Pros:** Simple, no setup
**Cons:** Not suitable for multiple servers, limited scalability

### Option 2: PostgreSQL

1. **Get PostgreSQL connection string** from your provider (Heroku Postgres, Supabase, Neon, etc.)

2. **Install PostgreSQL driver:**
   ```bash
   npm install pg
   ```

3. **Update `server/database.js`:**
   ```javascript
   const { Pool } = require('pg');
   const pool = new Pool({
     connectionString: process.env.DATABASE_URL
   });
   // Replace SQLite queries with PostgreSQL queries
   ```

### Option 3: MySQL

1. **Get MySQL connection string** from your provider

2. **Install MySQL driver:**
   ```bash
   npm install mysql2
   ```

3. **Update `server/database.js`** to use MySQL connection

### Option 4: MongoDB

1. **Get MongoDB connection string** from MongoDB Atlas

2. **Install MongoDB driver:**
   ```bash
   npm install mongodb
   ```

3. **Update `server/database.js`** to use MongoDB

## File Storage Setup

### Option 1: Local Storage (Current)

Files stored in `server/uploads/` directory.

**For production:** Ensure the directory is writable and has enough space.

### Option 2: AWS S3

1. **Install AWS SDK:**
   ```bash
   npm install @aws-sdk/client-s3 @aws-sdk/lib-storage
   ```

2. **Update `server/index.js`** to use S3 for file storage

3. **Set environment variables:**
   ```env
   AWS_ACCESS_KEY_ID=your_key
   AWS_SECRET_ACCESS_KEY=your_secret
   AWS_REGION=us-east-1
   AWS_S3_BUCKET=your-bucket-name
   ```

### Option 3: Cloudflare R2 (S3-Compatible)

Similar to S3 setup, but use R2 endpoint:
```env
AWS_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
```

### Option 4: Google Cloud Storage

1. **Install GCS SDK:**
   ```bash
   npm install @google-cloud/storage
   ```

2. **Update file storage configuration**

## Backend Deployment

### Heroku

1. **Install Heroku CLI**

2. **Create app:**
   ```bash
   heroku create your-app-name
   ```

3. **Set environment variables:**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set DATABASE_URL=your_database_url
   ```

4. **Deploy:**
   ```bash
   git push heroku main
   ```

### Railway

1. **Connect GitHub repository**

2. **Set environment variables in Railway dashboard**

3. **Deploy automatically on push**

### Render

1. **Create new Web Service**

2. **Connect repository**

3. **Set build command:** `npm install && cd client && npm install && npm run build`

4. **Set start command:** `npm start`

5. **Set environment variables**

### DigitalOcean App Platform

1. **Create new app from GitHub**

2. **Configure build and run commands**

3. **Add environment variables**

### AWS EC2 / VPS

1. **SSH into server**

2. **Install Node.js:**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

3. **Clone repository:**
   ```bash
   git clone your-repo-url
   cd dump-file
   ```

4. **Install dependencies:**
   ```bash
   npm install
   cd client && npm install && npm run build && cd ..
   ```

5. **Install PM2:**
   ```bash
   npm install -g pm2
   ```

6. **Start application:**
   ```bash
   pm2 start server/index.js --name dump-it
   pm2 save
   pm2 startup
   ```

7. **Set up Nginx reverse proxy** (optional but recommended)

## Frontend Deployment

### Netlify

1. **Connect GitHub repository**

2. **Build settings:**
   - Build command: `cd client && npm install && npm run build`
   - Publish directory: `client/build`

3. **Environment variables:**
   - `REACT_APP_API_URL`: Your backend API URL

### Vercel

1. **Import project from GitHub**

2. **Set root directory to `client`**

3. **Build command:** `npm run build`

4. **Output directory:** `build`

5. **Environment variables:** `REACT_APP_API_URL`

### GitHub Pages

1. **Install gh-pages:**
   ```bash
   cd client
   npm install --save-dev gh-pages
   ```

2. **Update `package.json`:**
   ```json
   "homepage": "https://yourusername.github.io/dump-it",
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d build"
   }
   ```

3. **Deploy:**
   ```bash
   npm run deploy
   ```

## Environment Variables Reference

### Backend (.env)

```env
# Server
PORT=5000
NODE_ENV=production

# Database
DATABASE_URL=your_database_connection_string

# File Storage (if using cloud)
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name

# CORS (if needed)
ALLOWED_ORIGINS=https://your-frontend-domain.com
```

### Frontend (.env)

```env
REACT_APP_API_URL=https://your-backend-domain.com/api
```

## Domain Configuration

1. **Point your domain** to your hosting service:
   - **Backend:** `api.yourdomain.com` or `yourdomain.com/api`
   - **Frontend:** `yourdomain.com` or `www.yourdomain.com`

2. **Update CORS settings** in `server/index.js`:
   ```javascript
   app.use(cors({
     origin: 'https://yourdomain.com'
   }));
   ```

3. **Update frontend API URL** to match your backend domain

## Testing Deployment

1. **Test file upload** without PIN
2. **Test file upload** with PIN
3. **Test file retrieval** by PIN
4. **Test retroactive PIN assignment**
5. **Test file download**
6. **Test sorting functionality**

## Troubleshooting

### Files not uploading
- Check file permissions on uploads directory
- Check file size limits
- Check server logs for errors

### Database connection errors
- Verify connection string
- Check database is accessible from your server
- Verify credentials

### CORS errors
- Update CORS configuration in backend
- Check frontend API URL matches backend domain

### Build errors
- Ensure all dependencies are installed
- Check Node.js version compatibility
- Review build logs for specific errors

## Security Recommendations for Production

1. **Add rate limiting:**
   ```bash
   npm install express-rate-limit
   ```

2. **Add file type validation** in upload handler

3. **Add file size limits** (already set to 100MB)

4. **Use HTTPS** (most hosting services provide this)

5. **Add basic PIN hashing** (if desired)

6. **Set up monitoring** (Sentry, LogRocket, etc.)

## Cost Estimates

- **Backend Hosting:** $0-20/month (free tiers available)
- **Frontend Hosting:** $0/month (most services have free tiers)
- **Database:** $0-25/month (free tiers available)
- **File Storage:** $0-10/month (depends on usage)
- **Domain:** $10-15/year

**Total:** ~$0-50/month depending on usage and services chosen

