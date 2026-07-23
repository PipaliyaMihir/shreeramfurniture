const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { upload, cloudinary, cloudinaryConfigured } = require('../middleware/upload');
const { protect } = require('../middleware/auth');

// @POST /api/upload — upload images (admin)
router.post('/', protect, upload.array('images', 50), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    let urls;

    if (cloudinaryConfigured) {
      // Cloudinary returns the full CDN URL directly in file.path
      urls = req.files.map((file) => file.path);
    } else {
      // Local disk — return server-relative path
      urls = req.files.map((file) => `/uploads/${file.filename}`);
    }

    console.log(`✅ Uploaded ${urls.length} image(s) via ${cloudinaryConfigured ? 'Cloudinary' : 'local disk'}`);
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
      // URL format: https://res.cloudinary.com/<cloud>/image/upload/v123456/shreeramfurniture/filename.jpg
      try {
        const urlParts = url.split('/');
        const folderIndex = urlParts.findIndex((p) => p === 'upload');
        if (folderIndex !== -1) {
          // public_id is everything after /upload/v<version>/ without extension
          const afterUpload = urlParts.slice(folderIndex + 2).join('/');
          const publicId = afterUpload.replace(/\.[^/.]+$/, ''); // remove extension
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
    cloudinary: cloudinaryConfigured
      ? { cloudName: process.env.CLOUDINARY_CLOUD_NAME }
      : null,
    message: cloudinaryConfigured
      ? '✅ Cloudinary CDN is active — images are fast and permanent'
      : 'ℹ️ Using local disk — images will be lost on Render redeploy. Add CLOUDINARY_* env vars.',
  });
});

module.exports = router;
