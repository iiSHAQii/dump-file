# Complete Setup Checklist

Follow this checklist step-by-step to deploy Dump It using GitHub Student Pack services.

## ✅ Pre-Setup

- [ ] Verify GitHub Student Pack access at [education.github.com/pack](https://education.github.com/pack)
- [ ] Have your GitHub account ready
- [ ] Have a text editor ready to save credentials (DON'T commit to Git!)

---

## 📦 Part 1: MongoDB Atlas Setup

- [ ] Go to GitHub Education and claim MongoDB Atlas offer
- [ ] Create MongoDB Atlas account
- [ ] Create M0 FREE cluster (wait 3-5 minutes)
- [ ] Create database user (save username and password!)
- [ ] Configure network access (allow from anywhere for now)
- [ ] Get connection string
- [ ] **SAVE CONNECTION STRING** (you'll need it later)

**Connection String Format:**
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/dumpit?retryWrites=true&w=majority
```

---

## ☁️ Part 2: Cloudflare R2 Setup (Recommended)

- [ ] Create Cloudflare account (free, no credit card)
- [ ] Enable R2 in dashboard
- [ ] Create bucket named `dump-it-files`
- [ ] Create API token with Object Read & Write permissions
- [ ] **SAVE THESE VALUES:**
  - [ ] Access Key ID
  - [ ] Secret Access Key
  - [ ] Bucket Name
  - [ ] Endpoint URL

**OR Alternative: AWS S3**
- [ ] Claim AWS credits from GitHub Student Pack
- [ ] Create S3 bucket
- [ ] Create IAM user with S3 access
- [ ] **SAVE THESE VALUES:**
  - [ ] Access Key ID
  - [ ] Secret Access Key
  - [ ] Bucket Name
  - [ ] Region

---

## 🚂 Part 3: Render Backend Setup (Recommended - Truly Free)

- [ ] Create Render account (sign up with GitHub)
- [ ] Create new Web Service
- [ ] Connect GitHub repository
- [ ] Configure service:
  - [ ] Name: `dump-it-backend`
  - [ ] Environment: `Node`
  - [ ] Build command: `npm install && cd client && npm install && npm run build`
  - [ ] Start command: `npm start`
  - [ ] Plan: **Free** (no credit card needed!)
- [ ] Add environment variables:
  - [ ] `NODE_ENV=production`
  - [ ] `PORT=5000`
  - [ ] `MONGODB_URI=your_connection_string_from_part_1`
  - [ ] `R2_ACCESS_KEY_ID=your_r2_key` (or AWS keys if using S3)
  - [ ] `R2_SECRET_ACCESS_KEY=your_r2_secret` (or AWS secret if using S3)
  - [ ] `R2_BUCKET_NAME=dump-it-files` (or `AWS_S3_BUCKET` if using S3)
  - [ ] `R2_ENDPOINT_URL=your_r2_endpoint` (or `AWS_REGION` if using S3)
- [ ] Deploy (takes 5-10 minutes first time)
- [ ] **COPY BACKEND URL** (e.g., `https://dump-it-backend.onrender.com`)

**OR Alternative: Railway (Limited Free)**
- [ ] Create Railway account (sign up with GitHub)
- [ ] Create new project from GitHub repo
- [ ] Wait for initial deployment
- [ ] Go to Variables tab
- [ ] Add same environment variables as above
- [ ] Railway will auto-redeploy
- [ ] **COPY BACKEND URL** (e.g., `https://your-app.up.railway.app`)
- [ ] ⚠️ Note: Railway free tier is limited ($1/month after trial)

**OR Alternative: Fly.io (Also Free)**
- [ ] Create Fly.io account
- [ ] Install Fly CLI
- [ ] Run `fly launch` in project directory
- [ ] Set secrets: `fly secrets set MONGODB_URI=...` etc.
- [ ] Deploy: `fly deploy`
- [ ] **COPY BACKEND URL** (e.g., `https://your-app.fly.dev`)

---

## ⚡ Part 4: Vercel Frontend Setup

- [ ] Create Vercel account (sign up with GitHub)
- [ ] Import project from GitHub
- [ ] Configure:
  - [ ] Root Directory: `client`
  - [ ] Framework: React
  - [ ] Build Command: `npm run build` (auto-filled)
  - [ ] Output Directory: `build` (auto-filled)
- [ ] Add environment variable:
  - [ ] `REACT_APP_API_URL=https://your-backend-url.railway.app/api`
  - [ ] (Use your actual backend URL from Part 3!)
- [ ] Deploy
- [ ] **COPY FRONTEND URL** (e.g., `https://dump-it.vercel.app`)

---

## 🔗 Part 5: Connect Frontend to Backend

- [ ] Go back to Railway/Render backend
- [ ] Add environment variable:
  - [ ] `ALLOWED_ORIGINS=https://your-frontend.vercel.app`
  - [ ] (Use your actual frontend URL from Part 4!)
- [ ] Backend will auto-redeploy

---

## 🌐 Part 6: Domain Setup (Optional)

- [ ] Claim free `.me` domain from Namecheap (GitHub Student Pack)
- [ ] In Vercel: Settings → Domains → Add your domain
- [ ] Follow DNS configuration instructions
- [ ] Update `REACT_APP_API_URL` in Vercel to use your domain
- [ ] In Railway/Render: Add custom domain for backend
- [ ] Update `ALLOWED_ORIGINS` in backend

---

## 🧪 Part 7: Testing

- [ ] Open your frontend URL
- [ ] Test uploading a file without PIN
- [ ] Test uploading a file with PIN
- [ ] Test viewing files by PIN
- [ ] Test retroactive PIN assignment
- [ ] Test file download
- [ ] Test sorting (by date, type, name, size)

---

## 📝 Credentials Summary

Create a secure file (NOT in Git!) with all your credentials:

```
=== MONGODB ATLAS ===
Connection String: mongodb+srv://...

=== CLOUDFLARE R2 ===
Access Key ID: ...
Secret Access Key: ...
Bucket Name: dump-it-files
Endpoint: https://xxxxx.r2.cloudflarestorage.com

=== BACKEND (Railway/Render) ===
URL: https://your-backend.railway.app
Admin URL: https://railway.app/project/...

=== FRONTEND (Vercel) ===
URL: https://dump-it.vercel.app
Admin URL: https://vercel.com/your-username/...

=== DOMAIN (if using) ===
Frontend: dumpit.yourdomain.me
Backend: api.yourdomain.me
```

---

## 🐛 Troubleshooting

**Backend won't start:**
- [ ] Check MongoDB connection string is correct
- [ ] Check all environment variables are set
- [ ] Check Railway/Render logs for errors

**Files won't upload:**
- [ ] Check R2/S3 credentials are correct
- [ ] Check bucket name matches
- [ ] Check bucket permissions allow uploads

**Frontend can't connect to backend:**
- [ ] Check `REACT_APP_API_URL` is correct
- [ ] Check `ALLOWED_ORIGINS` includes frontend URL
- [ ] Check backend is actually running (visit backend URL + `/api/health`)

**CORS errors:**
- [ ] Add frontend URL to `ALLOWED_ORIGINS` in backend
- [ ] Redeploy backend after adding

---

## 🎉 You're Done!

Your Dump It application should now be live and accessible from anywhere!

**Next Steps:**
- Share your frontend URL with others
- Test from different devices
- Monitor usage in Railway/Render dashboards
- Set up custom domain (if you haven't already)

