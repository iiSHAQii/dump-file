const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');
const path = require('path');

const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const AWS_REGION = process.env.AWS_REGION || 'us-east-1';
const AWS_S3_BUCKET = process.env.AWS_S3_BUCKET;

let s3Client = null;

function initStorage() {
  if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY || !AWS_S3_BUCKET) {
    console.warn('AWS S3 credentials not provided, using local storage');
    return false;
  }

  s3Client = new S3Client({
    region: AWS_REGION,
    credentials: {
      accessKeyId: AWS_ACCESS_KEY_ID,
      secretAccessKey: AWS_SECRET_ACCESS_KEY,
    },
  });

  console.log('AWS S3 storage initialized');
  return true;
}

async function uploadFile(file, originalName) {
  if (!s3Client) {
    throw new Error('S3 storage not initialized');
  }

  const fileExtension = path.extname(originalName);
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
  const filename = uniqueSuffix + fileExtension;

  // Handle both memory storage (buffer) and disk storage (path)
  let fileBody;
  if (file.buffer) {
    fileBody = file.buffer;
  } else if (file.path) {
    fileBody = require('fs').createReadStream(file.path);
  } else {
    throw new Error('File must have either buffer or path');
  }

  const upload = new Upload({
    client: s3Client,
    params: {
      Bucket: AWS_S3_BUCKET,
      Key: filename,
      Body: fileBody,
      ContentType: file.mimetype,
    },
  });

  await upload.done();

  return {
    filename: filename,
    path: filename, // For S3, path is just the key
    size: file.size,
    mimetype: file.mimetype
  };
}

async function getFileUrl(filename) {
  if (!s3Client) {
    return `/uploads/${filename}`;
  }

  // Construct public URL (if bucket is public)
  // Or use signed URL for private buckets
  const publicUrl = `https://${AWS_S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com/${filename}`;
  return publicUrl;
}

function isCloudStorage() {
  return s3Client !== null;
}

module.exports = {
  initStorage,
  uploadFile,
  getFileUrl,
  isCloudStorage
};

