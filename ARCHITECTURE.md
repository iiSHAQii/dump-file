# Architecture Overview

## System Architecture

```
┌─────────────────┐
│   User Browser  │
└────────┬────────┘
         │
         │ HTTPS
         ▼
┌─────────────────┐
│  Vercel (React) │  ← Frontend Hosting
│   Frontend App  │
└────────┬────────┘
         │
         │ API Calls
         ▼
┌─────────────────┐
│ Railway/Render  │  ← Backend Hosting
│  Express API    │
└─────┬───────┬───┘
      │       │
      │       │
      ▼       ▼
┌─────────┐ ┌──────────────┐
│ MongoDB │ │ Cloudflare R2│
│  Atlas  │ │  (or AWS S3) │
│         │ │              │
│ Metadata│ │  File Storage│
│ & PINs  │ │              │
└─────────┘ └──────────────┘
```

## Data Flow

### File Upload Flow
```
1. User selects files in React frontend
2. Frontend sends POST /api/upload with files + PIN (optional)
3. Backend receives files via Multer
4. Backend uploads files to Cloudflare R2 (or stores locally)
5. Backend saves metadata to MongoDB
6. Backend returns file info to frontend
7. Frontend displays success message
```

### File Retrieval Flow
```
1. User enters PIN in frontend
2. Frontend sends GET /api/files/:pin?sortBy=date
3. Backend queries MongoDB for files with that PIN
4. Backend sorts results
5. Backend generates download URLs (R2 URLs or local paths)
6. Backend returns file list to frontend
7. Frontend displays files with download buttons
```

## Technology Stack

### Frontend
- **React 18** - UI framework
- **Axios** - HTTP client
- **Vercel** - Hosting & CDN

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **Multer** - File upload handling
- **Railway/Render** - Hosting

### Database
- **MongoDB Atlas** - Document database (production)
- **SQLite** - Fallback for local development

### Storage
- **Cloudflare R2** - Object storage (production, recommended)
- **AWS S3** - Alternative object storage
- **Local Filesystem** - Fallback for development

## Environment Detection

The application automatically detects which services to use:

```javascript
// Database Detection
if (process.env.MONGODB_URI) {
  use MongoDB
} else {
  use SQLite
}

// Storage Detection
if (process.env.R2_ACCESS_KEY_ID) {
  use Cloudflare R2
} else if (process.env.AWS_ACCESS_KEY_ID) {
  use AWS S3
} else {
  use Local Storage
}
```

## File Structure

```
dump-file/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── App.js         # Main component
│   │   └── App.css        # Styles
│   └── package.json
├── server/                 # Express backend
│   ├── index.js           # Main server file
│   ├── database.js        # SQLite adapter
│   ├── database-mongodb.js # MongoDB adapter
│   ├── storage-cloudflare-r2.js # R2 adapter
│   ├── storage-aws-s3.js  # S3 adapter
│   └── uploads/           # Local storage (dev only)
├── package.json
└── [config files]
```

## API Endpoints

### `POST /api/upload`
- Upload one or more files
- Optional PIN parameter
- Returns file metadata

### `GET /api/files/:pin`
- Get all files for a PIN
- Query params: `sortBy` (date|type|name|size), `order` (asc|desc)
- Returns file list with download URLs

### `POST /api/assign-pin`
- Assign PIN to anonymous files (retroactive)
- Body: `{ pin: "1234", fileIds: [1, 2, 3] }`
- Returns updated files

### `GET /api/anonymous-files`
- Get all files without PIN
- Returns file list for retroactive PIN assignment

### `GET /api/health`
- Health check endpoint
- Returns service status

## Security Considerations

⚠️ **This app prioritizes simplicity over security:**

- PINs stored in plain text
- No rate limiting
- No file type restrictions
- No encryption
- CORS configured but permissive

**For production improvements:**
- Add rate limiting
- Validate file types
- Hash PINs (if desired)
- Add HTTPS enforcement
- Restrict CORS origins

## Scalability

### Current Setup (Free Tier)
- **MongoDB**: 512MB storage (~100k file records)
- **R2**: 10GB storage (~10,000 files at 1MB avg)
- **Railway**: $5/month credit (~500 hours)
- **Vercel**: Unlimited requests (within limits)

### Scaling Options
- Upgrade MongoDB to paid tier
- Upgrade R2 storage plan
- Upgrade Railway plan
- Add CDN for file downloads
- Implement file compression

## Monitoring

### Health Checks
- Backend: `GET /api/health`
- Returns: Database type, Storage type, Status

### Logs
- **Railway**: Built-in logs dashboard
- **Render**: Logs in dashboard
- **Vercel**: Function logs in dashboard

### Metrics to Watch
- File upload success rate
- Database connection status
- Storage usage
- API response times

