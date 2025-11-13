const { MongoClient } = require('mongodb');

let client = null;
let db = null;
let collection = null;

const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL;
const DB_NAME = process.env.MONGODB_DB_NAME || 'dumpit';
const COLLECTION_NAME = 'files';

async function initDatabase() {
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is required');
  }

  try {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db(DB_NAME);
    collection = db.collection(COLLECTION_NAME);

    // Create index on pin for faster queries
    await collection.createIndex({ pin: 1 });
    await collection.createIndex({ upload_date: -1 });

    console.log('MongoDB database initialized');
    return true;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

async function saveFile(fileData) {
  const { originalName, filename, path: filePath, size, mimetype, uploadDate, pin } = fileData;
  
  const document = {
    original_name: originalName,
    filename: filename,
    path: filePath,
    size: size,
    mimetype: mimetype,
    upload_date: uploadDate,
    pin: pin || null
  };

  const result = await collection.insertOne(document);
  
  return {
    id: result.insertedId.toString(),
    originalName,
    filename,
    size,
    mimetype,
    uploadDate,
    pin
  };
}

async function getFilesByPin(pin, sortBy = 'date', order = 'desc') {
  const sortOptions = {};
  
  switch (sortBy) {
    case 'type':
      sortOptions.mimetype = order === 'asc' ? 1 : -1;
      break;
    case 'name':
      sortOptions.original_name = order === 'asc' ? 1 : -1;
      break;
    case 'size':
      sortOptions.size = order === 'asc' ? 1 : -1;
      break;
    case 'date':
    default:
      sortOptions.upload_date = order === 'asc' ? 1 : -1;
      break;
  }

  const files = await collection
    .find({ pin: pin })
    .sort(sortOptions)
    .toArray();

  return files.map(file => ({
    id: file._id.toString(),
    originalName: file.original_name,
    filename: file.filename,
    size: file.size,
    mimetype: file.mimetype,
    uploadDate: file.upload_date,
    pin: file.pin,
    downloadUrl: `/uploads/${file.filename}`
  }));
}

async function getAllFiles(pin = null) {
  const query = pin === null ? { pin: null } : { pin: pin };
  
  const files = await collection
    .find(query)
    .sort({ upload_date: -1 })
    .toArray();

  return files.map(file => ({
    id: file._id.toString(),
    originalName: file.original_name,
    filename: file.filename,
    size: file.size,
    mimetype: file.mimetype,
    uploadDate: file.upload_date,
    pin: file.pin,
    downloadUrl: `/uploads/${file.filename}`
  }));
}

async function assignPinToFiles(pin, fileIds) {
  const objectIds = fileIds.map(id => {
    // Handle both string and ObjectId
    if (typeof id === 'string') {
      const { ObjectId } = require('mongodb');
      return new ObjectId(id);
    }
    return id;
  });

  const result = await collection.updateMany(
    { _id: { $in: objectIds } },
    { $set: { pin: pin } }
  );

  // Get updated files
  const files = await collection
    .find({ _id: { $in: objectIds } })
    .toArray();

  return {
    count: result.modifiedCount,
    files: files.map(file => ({
      id: file._id.toString(),
      originalName: file.original_name,
      filename: file.filename,
      size: file.size,
      mimetype: file.mimetype,
      uploadDate: file.upload_date,
      pin: file.pin,
      downloadUrl: `/uploads/${file.filename}`
    }))
  };
}

// Close connection gracefully
async function closeConnection() {
  if (client) {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

module.exports = {
  initDatabase,
  saveFile,
  getFilesByPin,
  getAllFiles,
  assignPinToFiles,
  closeConnection
};

