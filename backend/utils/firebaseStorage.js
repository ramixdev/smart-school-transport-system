const { storage } = require('../config/firebase');
const multer = require('multer');

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

const uploadToFirebase = async (file, path) => {
  try {
    const bucket = storage.bucket();
    const blob = bucket.file(`${path}/${Date.now()}_${file.originalname}`);
    
    const blobStream = blob.createWriteStream({
      metadata: {
        contentType: file.mimetype,
      },
    });

    return new Promise((resolve, reject) => {
      blobStream.on('error', (error) => {
        reject(error);
      });

      blobStream.on('finish', () => {
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
        resolve(publicUrl);
      });

      blobStream.end(file.buffer);
    });
  } catch (error) {
    throw new Error(`Error uploading to Firebase: ${error.message}`);
  }
};

module.exports = {
  upload,
  uploadToFirebase,
}; 