# Code Updates for MongoDB and Cloud Storage

The codebase has been updated to support:
- **MongoDB** (via `database-mongodb.js`)
- **SQLite** (original `database.js` - fallback)
- **Cloudflare R2** (via `storage-cloudflare-r2.js`)
- **AWS S3** (via `storage-aws-s3.js`)
- **Local Storage** (fallback)

## How It Works

The server automatically detects which services to use based on environment variables:

### Database Detection
- If `MONGODB_URI` or `DATABASE_URL` is set → Uses MongoDB
- Otherwise → Uses SQLite

### Storage Detection
- If `R2_ACCESS_KEY_ID` and `R2_SECRET_ACCESS_KEY` are set → Uses Cloudflare R2
- Else if `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` are set → Uses AWS S3
- Otherwise → Uses local file storage

## Environment Variables

### For MongoDB
```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dumpit
```

### For Cloudflare R2
```env
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET_NAME=dump-it-files
R2_ENDPOINT_URL=https://xxxxx.r2.cloudflarestorage.com
```

### For AWS S3
```env
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=dump-it-files
```

### For CORS (Production)
```env
ALLOWED_ORIGINS=https://your-frontend.vercel.app,https://yourdomain.com
```

## Testing Locally

1. **Test with SQLite (default):**
   ```bash
   npm run dev
   ```
   No environment variables needed!

2. **Test with MongoDB:**
   ```bash
   # Create .env file
   MONGODB_URI=your_connection_string
   npm run dev
   ```

3. **Test with Cloud Storage:**
   ```bash
   # Add R2 or S3 credentials to .env
   npm run dev
   ```

## Migration Notes

- The code is backward compatible - if no cloud credentials are provided, it uses local storage
- Database automatically switches based on `MONGODB_URI` presence
- All existing functionality remains the same

