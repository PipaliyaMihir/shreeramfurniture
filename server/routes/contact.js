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

const dns = require('dns');

// Force IPv4 lookup function for Nodemailer to prevent ENETUNREACH IPv6 errors
const ipv4Lookup = (hostname, options, callback) => {
  return dns.lookup(hostname, { family: 4 }, callback);
};

// Helper: send automated email
async function sendAutomatedEmail(toEmail, subject, textBody, pdfPath) {
  const brevoKey = (
    process.env.BREVO_API_KEY ||
    process.env.BREVO_KEY ||
    process.env.BREVO_APIKEY ||
    process.env.SENDINBLUE_API_KEY ||
    process.env.BREVO_SMTP_KEY ||
    ''
  ).trim().replace(/^["']|["']$/g, '');

  console.log(`[Email System] BREVO_API_KEY configured: ${brevoKey ? 'YES (' + brevoKey.substring(0, 6) + '...)' : 'NO'}`);

  // 1. If Brevo API key is available, use Brevo HTTP API (Port 443 HTTPS - 100% reliable on Render)
  if (brevoKey) {
    const senderEmail = (
      process.env.BREVO_SENDER_EMAIL ||
      process.env.SMTP_USER ||
      process.env.ADMIN_EMAIL ||
      'admin@shreeramfurniture.com'
    ).trim().replace(/^["']|["']$/g, '');
    const senderName = 'Shree Ram Furniture';
    
    console.log(`✉️ Sending email via Brevo HTTP API to ${toEmail} (Sender: ${senderEmail})...`);

    const payload = {
      sender: { name: senderName, email: senderEmail },
      to: [{ email: toEmail }],
      subject: subject,
      textContent: textBody,
    };

    if (pdfPath) {
      if (pdfPath.startsWith('data:application/pdf;base64,')) {
        const base64Data = pdfPath.split(';base64,').pop();
        payload.attachment = [{ name: 'brochure.pdf', content: base64Data }];
      } else {
        const fullPath = path.resolve(__dirname, '..', pdfPath.replace(/^\//, ''));
        if (fs.existsSync(fullPath)) {
          try {
            const fileBuffer = fs.readFileSync(fullPath);
            payload.attachment = [{ name: 'price.pdf', content: fileBuffer.toString('base64') }];
          } catch (readErr) {
            console.error('⚠️ Failed to read PDF catalog for Brevo:', readErr.message);
          }
        }
      }
    }

    try {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': brevoKey,
          'content-type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) {
        console.warn(`⚠️ Brevo API error response (${response.status}):`, data.message || JSON.stringify(data));
        return { success: false, error: data.message || `Brevo status ${response.status}` };
      }

      console.log('✅ Automated email sent via Brevo API successfully. Message ID:', data.messageId);
      return { success: true, data };
    } catch (error) {
      console.warn('⚠️ Brevo API call failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  // 2. Otherwise, attempt standard SMTP / Nodemailer (resolving explicit IPv4 to prevent ENETUNREACH IPv6 on Render)
  const smtpUser = (process.env.SMTP_USER || '').trim();
  const smtpPass = (process.env.SMTP_PASS || '').trim();

  if (smtpUser && smtpPass) {
    try {
      const rawHost = (process.env.SMTP_HOST || 'smtp.gmail.com').trim();
      const targetPort = Number(process.env.SMTP_PORT) || 465;

      // Force DNS to return IPv4 address directly so Nodemailer NEVER attempts IPv6 (2404:6800...)
      let resolvedHost = rawHost;
      try {
        const dnsPromises = require('dns').promises;
        const lookupRes = await dnsPromises.lookup(rawHost, { family: 4 });
        if (lookupRes && lookupRes.address) {
          resolvedHost = lookupRes.address;
        }
      } catch (dnsErr) {
        console.log('ℹ️ DNS lookup notice:', dnsErr.message);
      }

      console.log(`✉️ Attempting SMTP send via ${rawHost} (${resolvedHost}:${targetPort})...`);

      const transporter = nodemailer.createTransport({
        host: resolvedHost,
        port: targetPort,
        secure: targetPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass
        },
        connectionTimeout: 4000,
        greetingTimeout: 4000,
        socketTimeout: 5000,
        tls: {
          servername: rawHost,
          rejectUnauthorized: false
        }
      });

      const mailOptions = {
        from: `"Shree Ram Furniture" <${(process.env.SMTP_FROM || smtpUser || 'no-reply@shreeramfurniture.com').trim()}>`,
        to: toEmail,
        replyTo: smtpUser || 'admin@shreeramfurniture.com',
        subject: subject,
        text: textBody,
      };

      if (pdfPath) {
        if (pdfPath.startsWith('data:application/pdf;base64,')) {
          const base64Data = pdfPath.split(';base64,').pop();
          mailOptions.attachments = [{ filename: 'brochure.pdf', content: Buffer.from(base64Data, 'base64') }];
        } else {
          const fullPath = path.resolve(__dirname, '..', pdfPath.replace(/^\//, ''));
          if (fs.existsSync(fullPath)) {
            mailOptions.attachments = [{ filename: 'price.pdf', path: fullPath }];
          }
        }
      }

      const info = await transporter.sendMail(mailOptions);
      console.log('✅ Automated email sent via SMTP successfully. Message ID:', info.messageId);
      return { success: true, info };
    } catch (error) {
      console.log('ℹ️ Render environment notice: SMTP send notice:', error.message);
      return { success: false, error: error.message };
    }
  }

  // 3. Fallback when no email keys are configured
  console.log(`ℹ️ Email notification request received for ${toEmail} (Quotation saved in database).`);
  return { success: true, mocked: true };
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

    // Send auto-reply email to the client in the background without unhandled rejection errors
    sendAutomatedEmail(email, config.subject, personalizedBody, config.pdfUrl)
      .then(res => {
        if (!res.success && res.error) {
          console.log('ℹ️ Auto-reply background notice:', res.error);
        }
      })
      .catch(err => console.log('ℹ️ Auto-reply background notice:', err.message));

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
  const toEmail = req.query.to || process.env.SMTP_USER || process.env.ADMIN_EMAIL || 'admin@shreeramfurniture.com';
  const brevoKey = (
    process.env.BREVO_API_KEY ||
    process.env.BREVO_KEY ||
    process.env.BREVO_APIKEY ||
    process.env.SENDINBLUE_API_KEY ||
    process.env.BREVO_SMTP_KEY ||
    ''
  ).trim();

  try {
    console.log(`[Diagnostic] Attempting to send test email to: ${toEmail}`);
    const result = await sendAutomatedEmail(
      toEmail,
      'Shree Ram Furniture Diagnostic Test',
      'This is a diagnostic email from your website to verify if email sending is working correctly.'
    );

    res.json({
      status: result.success !== false ? 'success' : 'warning',
      message: `Test email process executed for ${toEmail}`,
      brevoConfigured: !!brevoKey,
      brevoKeyPrefix: brevoKey ? brevoKey.substring(0, 8) + '...' : 'NOT_FOUND',
      senderEmail: process.env.BREVO_SENDER_EMAIL || process.env.SMTP_USER || process.env.ADMIN_EMAIL || 'admin@shreeramfurniture.com',
      resultDetails: result
    });
  } catch (error) {
    console.error('[Diagnostic] Test email failed:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to send test email',
      error: error.message,
      brevoConfigured: !!brevoKey
    });
  }
});

module.exports = router;
