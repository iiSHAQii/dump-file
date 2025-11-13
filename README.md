# 🗑️ Dump It - Simple File Dumping Service

A minimal, fast file dumping service with PIN-based authentication. Perfect for quickly saving files on university computers without lengthy sign-up processes.

## Features

- **Simple PIN Authentication**: No email, no passwords - just a PIN code
- **Instant Upload**: Drag and drop or select files to upload immediately
- **File Organization**: Sort files by date, type, name, or size
- **Retroactive PIN Assignment**: Upload files anonymously, then assign a PIN later to organize them
- **Clean UI**: Modern, responsive interface with gradient design

## Tech Stack

- **Frontend**: React.js
- **Backend**: Node.js with Express
- **Database**: SQLite (easily swappable)
- **File Storage**: Local filesystem (can be migrated to cloud storage)

## Installation

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Setup

1. **Install root dependencies:**
   ```bash
   npm install
   ```

2. **Install client dependencies:**
   ```bash
   cd client
   npm install
   cd ..
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```

   This will start:
   - Backend server on `http://localhost:5000`
   - React app on `http://localhost:3000`

## Project Structure

```
dump-file/
├── server/
│   ├── index.js          # Express server and API routes
│   ├── database.js       # SQLite database operations
│   └── uploads/          # Uploaded files storage (created automatically)
├── client/
│   ├── public/
│   ├── src/
│   │   ├── App.js        # Main React component
│   │   ├── App.css       # Styles
│   │   └── index.js      # React entry point
│   └── package.json
├── package.json
└── README.md
```

## API Endpoints

- `POST /api/upload` - Upload files (with optional PIN)
- `GET /api/files/:pin` - Get files by PIN (with sorting)
- `POST /api/assign-pin` - Assign PIN to anonymous files
- `GET /api/anonymous-files` - Get all anonymous files
- `GET /api/health` - Health check

## Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
PORT=5000
NODE_ENV=production
REACT_APP_API_URL=http://localhost:5000/api
```

### Database Options

The app currently uses SQLite for simplicity. To switch to another database:

1. **PostgreSQL/MySQL**: Update `server/database.js` to use the appropriate driver
2. **MongoDB**: Replace SQL queries with MongoDB operations
3. **Cloud Databases**: Update connection strings in environment variables

### File Storage Options

Currently files are stored locally in `server/uploads/`. To use cloud storage:

1. **AWS S3**: Use `aws-sdk` or `@aws-sdk/client-s3`
2. **Google Cloud Storage**: Use `@google-cloud/storage`
3. **Azure Blob Storage**: Use `@azure/storage-blob`

Update the multer configuration in `server/index.js` accordingly.

## Deployment

### Option 1: Traditional Hosting (VPS, Heroku, etc.)

1. **Build the React app:**
   ```bash
   cd client
   npm run build
   cd ..
   ```

2. **Set environment variables:**
   ```bash
   export NODE_ENV=production
   export PORT=5000
   ```

3. **Start the server:**
   ```bash
   npm start
   ```

### Option 2: Separate Frontend/Backend Hosting

**Backend (Node.js):**
- Deploy to: Heroku, Railway, Render, DigitalOcean, AWS EC2, etc.
- Set `REACT_APP_API_URL` to your backend URL

**Frontend (React):**
- Deploy to: Netlify, Vercel, GitHub Pages, etc.
- Update API URL in environment variables

### Database Hosting Options

- **SQLite**: Works for small deployments (file-based)
- **PostgreSQL**: Heroku Postgres, AWS RDS, Supabase, Neon
- **MySQL**: AWS RDS, PlanetScale, DigitalOcean Managed Database
- **MongoDB**: MongoDB Atlas, AWS DocumentDB

### File Storage Hosting Options

- **Local**: Works for small deployments
- **AWS S3**: Scalable, pay-per-use
- **Google Cloud Storage**: Similar to S3
- **Cloudflare R2**: S3-compatible, no egress fees
- **DigitalOcean Spaces**: S3-compatible

## Security Notes

⚠️ **This application prioritizes simplicity over security:**

- PIN codes are stored in plain text
- No rate limiting
- No file type restrictions
- No encryption
- Suitable for personal/internal use only

For production use, consider adding:
- PIN hashing
- Rate limiting
- File size limits
- File type validation
- HTTPS enforcement
- CORS restrictions

## Usage

1. **Enter a PIN code** (or leave blank for anonymous upload)
2. **Upload files** by clicking or dragging into the upload area
3. **View your files** sorted by date, type, name, or size
4. **Assign PIN retroactively** to anonymous files if needed
5. **Download files** by clicking the download button

## License

MIT

