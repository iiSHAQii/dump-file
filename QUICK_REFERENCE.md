# Quick Reference Card

## Service URLs & Credentials

### MongoDB Atlas
- Dashboard: https://cloud.mongodb.com
- Connection String: `mongodb+srv://...`

### Cloudflare R2
- Dashboard: https://dash.cloudflare.com → R2
- Endpoint: `https://xxxxx.r2.cloudflarestorage.com`

### Render (Recommended - Truly Free)
- Dashboard: https://dashboard.render.com
- Backend URL: `https://your-app.onrender.com`

### Railway (Limited Free)
- Dashboard: https://railway.app
- Backend URL: `https://your-app.up.railway.app`
- Note: $1/month credit after trial (may not be enough)

### Fly.io (Also Free)
- Dashboard: https://fly.io/dashboard
- Backend URL: `https://your-app.fly.dev`

### Vercel
- Dashboard: https://vercel.com/dashboard
- Frontend URL: `https://your-app.vercel.app`

---

## Environment Variables Quick Reference

### Backend (Render/Railway/Fly.io)
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=dump-it-files
R2_ENDPOINT_URL=https://...
ALLOWED_ORIGINS=https://your-frontend.vercel.app
```

### Frontend (Vercel)
```env
REACT_APP_API_URL=https://your-backend.railway.app/api
```

---

## Common Commands

### Local Development
```bash
npm install
cd client && npm install && cd ..
npm run dev
```

### Production Build
```bash
cd client && npm run build && cd ..
npm start
```

### Check Health
```bash
# Render
curl https://your-backend.onrender.com/api/health

# Railway
curl https://your-app.up.railway.app/api/health

# Fly.io
curl https://your-app.fly.dev/api/health
```

---

## Troubleshooting Quick Fixes

**Backend won't start:**
- Check MongoDB connection string
- Check all env vars are set
- Check logs in Render/Railway/Fly.io dashboard
- For Render: Wait 30 seconds if service spun down (first request is slow)

**CORS errors:**
- Add frontend URL to `ALLOWED_ORIGINS`
- Redeploy backend

**Files won't upload:**
- Check R2/S3 credentials
- Check bucket name matches
- Check bucket permissions

**Frontend can't connect:**
- Check `REACT_APP_API_URL` is correct
- Check backend is running: `/api/health`
- Check CORS settings

---

## Support Links

- [GitHub Student Pack](https://education.github.com/pack)
- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com)
- [Cloudflare R2 Docs](https://developers.cloudflare.com/r2)
- [Railway Docs](https://docs.railway.app)
- [Vercel Docs](https://vercel.com/docs)

