const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const upload = require('../middleware/upload');
const { protect } = require('../middleware/auth');

// @POST /api/upload (admin)
router.post('/', protect, upload.array('images', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }
    const urls = req.files.map(
      (file) => `/uploads/${file.filename}`
    );
    res.json({ urls, message: `${urls.length} image(s) uploaded successfully` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @DELETE /api/upload (admin) - delete by filename
router.delete('/', protect, (req, res) => {
  try {
    const { filename } = req.body;
    if (!filename) return res.status(400).json({ message: 'Filename required' });
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

module.exports = router;
