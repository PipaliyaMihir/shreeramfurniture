const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const path = require('path');
const fs = require('fs');

// ── Configure Cloudinary (uses env vars set in Render dashboard) ──────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ── Check if Cloudinary is configured ─────────────────────────────────────
const cloudinaryConfigured =
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET;

let upload;

if (cloudinaryConfigured) {
  // ── CLOUDINARY STORAGE (Production on Render) ──────────────────────────
  console.log('✅ Upload: Using Cloudinary CDN storage');
  const cloudinaryStorage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: 'shreeramfurniture', // All images go into this folder in Cloudinary
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
      transformation: [
        { quality: 'auto', fetch_format: 'auto' }, // Auto convert to WebP, auto compress
        { width: 1920, crop: 'limit' },             // Max width 1920px, never upscale
      ],
    },
  });

  upload = multer({
    storage: cloudinaryStorage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB per file
  });
} else {
  // ── LOCAL DISK STORAGE (Local development without Cloudinary) ─────────
  console.log('ℹ️ Upload: Using local disk storage (set CLOUDINARY_* env vars for CDN)');
  const uploadDir = path.join(__dirname, '../uploads');
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  const diskStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    },
  });

  const fileFilter = (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) return cb(null, true);
    cb(new Error('Only image files are allowed!'));
  };

  upload = multer({
    storage: diskStorage,
    fileFilter,
    limits: { fileSize: 50 * 1024 * 1024 },
  });
}

module.exports = { upload, cloudinary, cloudinaryConfigured };
