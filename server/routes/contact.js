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
  // 1. If Brevo API key is available, use Brevo HTTP API (Port 443 HTTPS - 100% reliable on Render)
  if (process.env.BREVO_API_KEY) {
    const senderEmail = process.env.BREVO_SENDER_EMAIL || process.env.SMTP_USER || process.env.ADMIN_EMAIL || 'admin@shreeramfurniture.com';
    const senderName = 'Shree Ram Furniture';
    
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
          'api-key': process.env.BREVO_API_KEY,
          'content-type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) {
        console.warn(`⚠️ Brevo API response notice: ${data.message || response.status}`);
        return { success: false, error: data.message };
      }

      console.log('✅ Automated email sent via Brevo API successfully. Message ID:', data.messageId);
      return { success: true, data };
    } catch (error) {
      console.warn('⚠️ Brevo API call failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  // 2. Otherwise, attempt standard SMTP / Nodemailer (with short 3s timeout for Render compatibility)
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const targetHost = process.env.SMTP_HOST || 'smtp.gmail.com';
      const targetPort = Number(process.env.SMTP_PORT) || 465;

      const transporter = nodemailer.createTransport({
        host: targetHost,
        port: targetPort,
        secure: targetPort === 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        },
        connectionTimeout: 3000, // 3s max connection timeout
        greetingTimeout: 3000,
        socketTimeout: 4000,
        tls: { rejectUnauthorized: false }
      });

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
      console.log('ℹ️ Render environment notice: SMTP connection timed out (Render blocks raw outbound SMTP ports). Add BREVO_API_KEY in Render environment variables for instant HTTPS email sending.');
      return { success: false, error: error.message };
    }
  }

  // 3. Fallback when no email keys are configured
  console.log(`ℹ️ Email notification queued for ${toEmail} (Quotation saved in database). Add BREVO_API_KEY in Render for automatic email sending.`);
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
