const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');
const { protect } = require('../middleware/auth');
const EmailConfig = require('../models/EmailConfig');
const Quotation = require('../models/Quotation');

// Multer Config for PDF Catalog
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const pdfStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, 'catalog-' + Date.now() + '.pdf');
  },
});

const pdfFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed!'), false);
  }
};

const uploadPdf = multer({
  storage: pdfStorage,
  fileFilter: pdfFilter,
  limits: { fileSize: 25 * 1024 * 1024 }
});

// Helper: send automated email
async function sendAutomatedEmail(toEmail, subject, textBody, pdfPath) {
  let transporter;
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    let smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
    
    // Resolve SMTP host to IPv4 to prevent IPv6 ENETUNREACH errors on cloud hosting
    try {
      const dns = require('dns').promises;
      const result = await dns.lookup(smtpHost, { family: 4 });
      if (result && result.address) {
        console.log(`Resolved SMTP host ${smtpHost} to IPv4 address: ${result.address}`);
        smtpHost = result.address;
      }
    } catch (dnsErr) {
      console.warn(`DNS lookup failed for ${smtpHost}, trying resolve4 fallback:`, dnsErr.message);
      try {
        const dns = require('dns').promises;
        const ips = await dns.resolve4(smtpHost);
        if (ips && ips.length > 0) {
          console.log(`Resolved SMTP host ${smtpHost} via resolve4 fallback to IPv4: ${ips[0]}`);
          smtpHost = ips[0];
        }
      } catch (dns2Err) {
        console.warn(`DNS resolve4 fallback failed for ${smtpHost}, falling back to hostname:`, dns2Err.message);
      }
    }

    transporter = nodemailer.createTransport({
      host: smtpHost,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      },
      tls: {
        // Must specify servername when host is an IP address to pass TLS validation
        servername: process.env.SMTP_HOST || 'smtp.gmail.com'
      }
    });
  } else {
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
      console.log('✉️ SMTP credentials not found in .env. Using temporary Ethereal test account:', testAccount.user);
    } catch (err) {
      console.error('❌ Failed to create ethereal test account, using mock logger transporter:', err);
      transporter = {
        sendMail: async (options) => {
          console.log('✉️ MOCK EMAIL SENT:', options);
          return { messageId: 'mock-id' };
        }
      };
    }
  }

  const mailOptions = {
    from: `"Shree Ram Furniture" <${process.env.SMTP_FROM || process.env.SMTP_USER || 'no-reply@shreeramfurniture.com'}>`,
    to: toEmail,
    replyTo: process.env.SMTP_USER || 'mpipaliya550@rku.ac.in',
    subject: subject,
    text: textBody,
  };

  if (pdfPath) {
    if (pdfPath.startsWith('data:application/pdf;base64,')) {
      const base64Data = pdfPath.split(';base64,').pop();
      mailOptions.attachments = [
        {
          filename: 'brochure.pdf',
          content: Buffer.from(base64Data, 'base64')
        }
      ];
    } else {
      const fullPath = path.resolve(__dirname, '..', pdfPath.replace(/^\//, ''));
      if (fs.existsSync(fullPath)) {
        mailOptions.attachments = [
          {
            filename: 'price.pdf',
            path: fullPath
          }
        ];
      } else {
        console.warn('⚠️ PDF attachment not found at path:', fullPath);
      }
    }
  }

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Automated email sent successfully. Message ID:', info.messageId);
    if (transporter.options && transporter.options.host === 'smtp.ethereal.email') {
      console.log('👉 View ethereal test mail at:', nodemailer.getTestMessageUrl(info));
    }
    return info;
  } catch (error) {
    console.error('❌ Error sending automated email:', error);
    throw error;
  }
}

// @POST /api/contact/quotation (public submission)
router.post('/quotation', async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Name, email, and message are required' });
    }

    // Save quotation request
    const quotation = await Quotation.create({ name, email, phone, message });

    // Fetch Email config
    let config = await EmailConfig.findOne();
    if (!config) {
      config = await EmailConfig.create({
        subject: 'Thank you for contacting Shree Ram Furniture!',
        body: 'Hello,\n\nThank you for reaching out to us. We have received your request for a custom furniture quotation. Please find attached our pricing catalog/brochure.\n\nBest regards,\nShree Ram Furniture Team',
        pdfUrl: ''
      });
    }

    // Personalize email body with client name
    let personalizedBody = config.body || '';
    if (personalizedBody.includes('{name}')) {
      personalizedBody = personalizedBody.replace(/{name}/g, name);
    } else if (personalizedBody.includes('Hello,')) {
      personalizedBody = personalizedBody.replace('Hello,', `Hello ${name},`);
    } else if (personalizedBody.includes('Hello')) {
      personalizedBody = personalizedBody.replace('Hello', `Hello ${name}`);
    }

    // Send auto-reply email to the client in the background
    sendAutomatedEmail(email, config.subject, personalizedBody, config.pdfUrl)
      .catch(err => console.error('Error sending auto-reply email to client:', err));



    res.status(201).json({ message: 'Quotation request submitted successfully!', quotation });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @GET /api/contact/config (admin)
router.get('/config', protect, async (req, res) => {
  try {
    let config = await EmailConfig.findOne();
    if (!config) {
      config = await EmailConfig.create({
        subject: 'Thank you for contacting Shree Ram Furniture!',
        body: 'Hello,\n\nThank you for reaching out to us. We have received your request for a custom furniture quotation. Please find attached our pricing catalog/brochure.\n\nBest regards,\nShree Ram Furniture Team',
        pdfUrl: ''
      });
    }
    res.json(config);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @PUT /api/contact/config (admin)
router.put('/config', protect, async (req, res) => {
  try {
    const { subject, body, pdfUrl } = req.body;
    let config = await EmailConfig.findOne();
    if (!config) {
      config = await EmailConfig.create({
        subject: subject || 'Thank you for requesting a quotation from Shree Ram Furniture!',
        body: body || '',
        pdfUrl: pdfUrl || ''
      });
    } else {
      const updateData = {};
      if (subject !== undefined) updateData.subject = subject;
      if (body !== undefined) updateData.body = body;
      if (pdfUrl !== undefined) updateData.pdfUrl = pdfUrl;
      config = await EmailConfig.findByIdAndUpdate(config._id, updateData, { new: true });
    }
    res.json(config);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @POST /api/contact/config/pdf (admin)
router.post('/config/pdf', protect, uploadPdf.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No PDF file uploaded' });
    }
    const pdfUrl = `/uploads/${req.file.filename}`;
    res.json({ pdfUrl, message: 'PDF catalog uploaded successfully!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @GET /api/contact/quotations (admin - to review submissions)
router.get('/quotations', protect, async (req, res) => {
  try {
    const quotations = await Quotation.find().sort({ createdAt: -1 });
    res.json(quotations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @DELETE /api/contact/quotations/:id (admin)
router.delete('/quotations/:id', protect, async (req, res) => {
  try {
    const quotation = await Quotation.findByIdAndDelete(req.params.id);
    if (!quotation) return res.status(404).json({ message: 'Quotation request not found' });
    res.json({ message: 'Quotation request deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @GET /api/contact/test-email (public diagnostic)
router.get('/test-email', async (req, res) => {
  const toEmail = req.query.to || process.env.SMTP_USER || 'mpipaliya550@rku.ac.in';
  try {
    console.log(`[Diagnostic] Attempting to send test email to: ${toEmail}`);
    const info = await sendAutomatedEmail(
      toEmail,
      'Shree Ram Furniture Diagnostic Test',
      'This is a diagnostic email from your website to verify if SMTP is working correctly.'
    );
    res.json({
      status: 'success',
      message: `Test email sent successfully to ${toEmail}`,
      messageId: info.messageId,
      smtpConfig: {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || 587,
        user: process.env.SMTP_USER,
        hasPass: !!process.env.SMTP_PASS
      }
    });
  } catch (error) {
    console.error('[Diagnostic] Test email failed:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to send test email',
      error: error.message,
      stack: error.stack,
      smtpConfig: {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || 587,
        user: process.env.SMTP_USER,
        hasPass: !!process.env.SMTP_PASS
      }
    });
  }
});

module.exports = router;
