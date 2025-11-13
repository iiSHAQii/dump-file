# Quick Start Guide

Get Dump It running in 5 minutes!

## Step 1: Install Dependencies

```bash
# Install root dependencies
npm install

# Install client dependencies
cd client
npm install
cd ..
```

## Step 2: Run the Application

```bash
# Development mode (runs both frontend and backend)
npm run dev
```

This will start:
- **Backend API** at `http://localhost:5000`
- **React Frontend** at `http://localhost:3000`

## Step 3: Use the App

1. Open `http://localhost:3000` in your browser
2. Enter a PIN code (or leave blank for anonymous upload)
3. Upload files by clicking or dragging into the upload area
4. View your files sorted by date, type, name, or size

## What Gets Created

- `server/dumpit.db` - SQLite database (created automatically)
- `server/uploads/` - Directory for uploaded files (created automatically)

## Production Build

```bash
# Build React app
cd client
npm run build
cd ..

# Start production server
npm start
```

The production server will serve the React app from the `client/build` directory.

## Troubleshooting

**Port already in use?**
- Change `PORT` in `.env` or set `PORT=5001 npm run dev`

**Database errors?**
- Delete `server/dumpit.db` and restart (will recreate)

**Upload fails?**
- Check that `server/uploads/` directory exists and is writable

## Next Steps

- See `README.md` for full documentation
- See `DEPLOYMENT.md` for hosting options
- Configure your domain and hosting services

