const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const { upload, cloudinary, cloudinaryConfigured } = require('../middleware/upload');
const { protect } = require('../middleware/auth');

// ── Sharp: compress image buffer to WebP ──────────────────────────────────
async function compressImage(inputBuffer) {
  return sharp(inputBuffer)
    .resize(1600, 1200, { fit: 'inside', withoutEnlargement: true }) // max 1600×1200, never upscale
    .webp({ quality: 82 })                                            // convert to WebP, ~82% quality
    .toBuffer();
}

// @POST /api/upload — upload + compress images (admin)
router.post('/', protect, upload.array('images', 50), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    let urls = [];

    if (cloudinaryConfigured) {
      // Cloudinary: files are already uploaded and URLs returned in file.path
      urls = req.files.map((file) => file.path);
      console.log(`✅ Uploaded ${urls.length} image(s) to Cloudinary CDN`);
    } else {
      // Local disk: files already saved — now compress each one in place
      const uploadDir = path.join(__dirname, '../uploads');

      for (const file of req.files) {
        const originalPath = file.path;
        const originalSize = file.size;

        try {
          // Read original, compress, overwrite with .webp extension
          const originalBuffer = fs.readFileSync(originalPath);
          const compressedBuffer = await compressImage(originalBuffer);

          // Build new filename with .webp extension
          const newFilename = path.basename(originalPath, path.extname(originalPath)) + '.webp';
          const newPath = path.join(uploadDir, newFilename);

          // Write compressed file, delete original if different name
          fs.writeFileSync(newPath, compressedBuffer);
          if (originalPath !== newPath && fs.existsSync(originalPath)) {
            fs.unlinkSync(originalPath);
          }

          const savedKB = Math.round((originalSize - compressedBuffer.length) / 1024);
          console.log(`📦 Compressed: ${file.originalname} → ${newFilename} (saved ~${savedKB}KB)`);
          urls.push(`/uploads/${newFilename}`);
        } catch (compressErr) {
          // If compression fails, keep the original file as-is
          console.warn(`⚠️ Compression failed for ${file.originalname}, keeping original:`, compressErr.message);
          urls.push(`/uploads/${file.filename}`);
        }
      }

      console.log(`✅ Uploaded & compressed ${urls.length} image(s) to local disk`);
    }

    res.json({ urls, message: `${urls.length} image(s) uploaded successfully` });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: error.message });
  }
});

// @DELETE /api/upload — delete image (admin)
router.delete('/', protect, async (req, res) => {
  try {
    const { filename, url } = req.body;

    if (cloudinaryConfigured && url) {
      // Extract public_id from Cloudinary URL
      try {
        const urlParts = url.split('/');
        const folderIndex = urlParts.findIndex((p) => p === 'upload');
        if (folderIndex !== -1) {
          const afterUpload = urlParts.slice(folderIndex + 2).join('/');
          const publicId = afterUpload.replace(/\.[^/.]+$/, '');
          await cloudinary.uploader.destroy(publicId);
          console.log(`🗑️ Deleted from Cloudinary: ${publicId}`);
        }
      } catch (cloudErr) {
        console.warn('⚠️ Cloudinary delete notice:', cloudErr.message);
      }
      return res.json({ message: 'Image deleted from Cloudinary' });
    }

    // Local disk deletion
    if (!filename) return res.status(400).json({ message: 'Filename or URL required' });
    const filepath = path.join(__dirname, '../uploads', path.basename(filename));
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
      res.json({ message: 'File deleted successfully' });
    } else {
      res.status(404).json({ message: 'File not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @GET /api/upload/status — check storage mode (admin diagnostic)
router.get('/status', protect, (req, res) => {
  res.json({
    mode: cloudinaryConfigured ? 'cloudinary' : 'local',
    compression: 'sharp (WebP, max 1600px, quality 82)',
    cloudinary: cloudinaryConfigured ? { cloudName: process.env.CLOUDINARY_CLOUD_NAME } : null,
    message: cloudinaryConfigured
      ? '✅ Cloudinary CDN active — images are fast, permanent, and auto-compressed'
      : 'ℹ️ Local disk with Sharp compression. Add CLOUDINARY_* env vars for CDN.',
  });
});

module.exports = router;
