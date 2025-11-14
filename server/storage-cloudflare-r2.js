const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');
const path = require('path');
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

// Cloudflare R2 is S3-compatible, so we use AWS SDK
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;
const R2_ENDPOINT_URL = process.env.R2_ENDPOINT_URL;

let s3Client = null;

function initStorage() {
  console.log('--- STORAGE-R2-FILE v3.0 (with forcePathStyle) LOADED ---');
  if (!R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME || !R2_ENDPOINT_URL) {
    console.warn('R2 credentials not provided, using local storage');
    return false;
  }

  s3Client = new S3Client({
    region: 'auto', // R2 uses 'auto' for region
    endpoint: R2_ENDPOINT_URL,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
    forcePathStyle: true,
  });

  console.log('Cloudflare R2 storage initialized');
  return true;
}

async function uploadFile(file, originalName) {
  if (!s3Client) {
    throw new Error('R2 storage not initialized');
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
      Bucket: R2_BUCKET_NAME,
      Key: filename,
      Body: fileBody,
      ContentType: file.mimetype,
    },
  });

  await upload.done();

  return {
    filename: filename,
    path: filename, // For R2, path is just the key
    size: file.size,
    mimetype: file.mimetype
  };
}

// async function getFileUrl(filename) {
//   if (!s3Client) {
//     return `/uploads/${filename}`;
//   }

//   console.log('DEBUG: R2_ENDPOINT_URL is:', R2_ENDPOINT_URL);

//   // For R2, you can generate a signed URL or use public URL
//   // If bucket is public, you can construct URL directly
//   const publicUrl = `${R2_ENDPOINT_URL}/${R2_BUCKET_NAME}/${filename}`;
//   return publicUrl;
// }
async function getFileUrl(filename) {
  if (!s3Client) {
    return `/uploads/${filename}`;
  }

  // This is the fix:
  // We create a command to get the object...
  const command = new GetObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: filename,
    // This part tells the browser to "download" the file
    // instead of trying to "view" it (optional but good)
    ResponseContentDisposition: `attachment; filename="${filename}"`
  });

  // ...then we create a temporary, secure URL that expires
  // (default is 3600 seconds / 1 hour)
  try {
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    return signedUrl;
  } catch (err) {
    console.error("Error creating signed URL", err);
    return null; // Or handle the error as you see fit
  }
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

