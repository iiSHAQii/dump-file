const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs-extra');

// Database: Choose MongoDB or SQLite
let dbModule;
if (process.env.MONGODB_URI || process.env.DATABASE_URL) {
  dbModule = require('./database-mongodb');
  console.log('Using MongoDB database');
} else {
  dbModule = require('./database');
  console.log('Using SQLite database');
}

const { initDatabase, saveFile, getFilesByPin, assignPinToFiles, getAllFiles } = dbModule;

// Storage: Choose Cloudflare R2, AWS S3, or Local
let storageModule = null;
let useCloudStorage = false;

if (process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY) {
  storageModule = require('./storage-cloudflare-r2');
  console.log('Using Cloudflare R2 storage');
} else if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
  storageModule = require('./storage-aws-s3');
  console.log('Using AWS S3 storage');
} else {
  console.log('Using local file storage');
}

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3000'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize storage
let storageInitialized = false;
if (storageModule) {
  storageInitialized = storageModule.initStorage();
  useCloudStorage = storageModule.isCloudStorage();
}

// Local storage setup (fallback)
const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!useCloudStorage) {
  fs.ensureDirSync(UPLOADS_DIR);
  // Serve uploaded files locally
  app.use('/uploads', express.static(UPLOADS_DIR));
}

// Configure multer for file uploads
let upload;
if (useCloudStorage) {
  // For cloud storage, use memory storage
  upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
  });
} else {
  // For local storage, use disk storage
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, UPLOADS_DIR);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  });
  upload = multer({ 
    storage: storage,
    limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
  });
}

// Serve static files from React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

// Routes

// Upload file(s) - can be anonymous or with PIN
app.post('/api/upload', upload.array('files'), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const pin = req.body.pin || null;
    const uploadedFiles = [];

    for (const file of req.files) {
      let filename, filePath, size, mimetype;

      if (useCloudStorage && storageModule) {
        // Upload to cloud storage
        const cloudResult = await storageModule.uploadFile(file, file.originalname);
        filename = cloudResult.filename;
        filePath = cloudResult.path;
        size = cloudResult.size;
        mimetype = cloudResult.mimetype;
      } else {
        // Local storage
        filename = file.filename;
        filePath = file.path;
        size = file.size;
        mimetype = file.mimetype;
      }

      const fileData = {
        originalName: file.originalname,
        filename: filename,
        path: filePath,
        size: size,
        mimetype: mimetype,
        uploadDate: new Date().toISOString(),
        pin: pin
      };

      const savedFile = await saveFile(fileData);
      
      // Add download URL
      if (useCloudStorage && storageModule) {
        savedFile.downloadUrl = await storageModule.getFileUrl(filename);
      } else {
        savedFile.downloadUrl = `/uploads/${filename}`;
      }
      
      uploadedFiles.push(savedFile);
    }

    res.json({ 
      success: true, 
      files: uploadedFiles,
      message: `${uploadedFiles.length} file(s) uploaded successfully`
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload files: ' + error.message });
  }
});

// Get files by PIN
app.get('/api/files/:pin', async (req, res) => {
  try {
    const { pin } = req.params;
    const { sortBy = 'date', order = 'desc' } = req.query;
    
    const files = await getFilesByPin(pin, sortBy, order);
    
    // Update download URLs for cloud storage
    if (useCloudStorage && storageModule) {
      for (const file of files) {
        file.downloadUrl = await storageModule.getFileUrl(file.filename);
      }
    }
    
    res.json({ success: true, files });
  } catch (error) {
    console.error('Get files error:', error);
    res.status(500).json({ error: 'Failed to retrieve files' });
  }
});

// Assign PIN to anonymous files (retroactive)
app.post('/api/assign-pin', async (req, res) => {
  try {
    const { pin, fileIds } = req.body;
    
    if (!pin) {
      return res.status(400).json({ error: 'PIN is required' });
    }

    if (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0) {
      return res.status(400).json({ error: 'File IDs are required' });
    }

    const result = await assignPinToFiles(pin, fileIds);
    
    // Update download URLs for cloud storage
    if (useCloudStorage && storageModule) {
      for (const file of result.files) {
        file.downloadUrl = await storageModule.getFileUrl(file.filename);
      }
    }
    
    res.json({ 
      success: true, 
      message: `PIN assigned to ${result.count} file(s)`,
      files: result.files
    });
  } catch (error) {
    console.error('Assign PIN error:', error);
    res.status(500).json({ error: 'Failed to assign PIN' });
  }
});

// Get all anonymous files (for retroactive PIN assignment)
app.get('/api/anonymous-files', async (req, res) => {
  try {
    const files = await getAllFiles(null);
    
    // Update download URLs for cloud storage
    if (useCloudStorage && storageModule) {
      for (const file of files) {
        file.downloadUrl = await storageModule.getFileUrl(file.filename);
      }
    }
    
    res.json({ success: true, files });
  } catch (error) {
    console.error('Get anonymous files error:', error);
    res.status(500).json({ error: 'Failed to retrieve anonymous files' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    version: 2.0, // <-- ADD THIS LINE
    database: process.env.MONGODB_URI ? 'MongoDB' : 'SQLite',
    storage: useCloudStorage ? (process.env.R2_ACCESS_KEY_ID ? 'Cloudflare R2' : 'AWS S3') : 'Local'
  });
});

// Catch all handler for React app
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
}

// Start server after database is ready
initDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  })
  .catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
