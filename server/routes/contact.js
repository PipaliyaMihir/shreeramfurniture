const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const dns = require('dns');
const nodemailer = require('nodemailer');
const { protect } = require('../middleware/auth');
const EmailConfig = require('../models/EmailConfig');
const Quotation = require('../models/Quotation');

// ── Multer Config for PDF Catalog ──────────────────────────────────────────
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const pdfStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, 'catalog-' + Date.now() + '.pdf'),
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
  limits: { fileSize: 25 * 1024 * 1024 },
});

// ── Email Helper ───────────────────────────────────────────────────────────
async function sendAutomatedEmail(toEmail, subject, textBody, pdfPath) {
  // Read Brevo API key — check all common env var names and strip quotes/spaces
  const brevoKey = (
    process.env.BREVO_API_KEY ||
    process.env.BREVO_KEY ||
    process.env.BREVO_APIKEY ||
    process.env.SENDINBLUE_API_KEY ||
    ''
  ).trim().replace(/^["']|["']$/g, '');

  console.log(`[Email] BREVO_API_KEY set: ${brevoKey ? 'YES (' + brevoKey.substring(0, 8) + '...)' : 'NO'}`);

  // ── PATH 1: Brevo HTTP API (Port 443 HTTPS — works 100% on Render) ────────
  if (brevoKey) {
    const senderEmail = (
      process.env.BREVO_SENDER_EMAIL ||
      process.env.SMTP_USER ||
      process.env.ADMIN_EMAIL ||
      'admin@shreeramfurniture.com'
    ).trim().replace(/^["']|["']$/g, '');

    console.log(`✉️ Sending via Brevo API to ${toEmail} (from: ${senderEmail})...`);

    const payload = {
      sender: { name: 'Shree Ram Furniture', email: senderEmail },
      to: [{ email: toEmail }],
      subject,
      textContent: textBody,
    };

    // Attach PDF if configured
    if (pdfPath && pdfPath.trim()) {
      if (pdfPath.startsWith('data:application/pdf;base64,')) {
        payload.attachment = [{ name: 'catalog.pdf', content: pdfPath.split(';base64,').pop() }];
      } else {
        const fullPath = path.resolve(__dirname, '..', pdfPath.replace(/^\//, ''));
        if (fs.existsSync(fullPath)) {
          try {
            const fileBuffer = fs.readFileSync(fullPath);
            payload.attachment = [{ name: 'catalog.pdf', content: fileBuffer.toString('base64') }];
          } catch (readErr) {
            console.warn('⚠️ PDF read error:', readErr.message);
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
          'content-type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        console.warn(`⚠️ Brevo API error (${response.status}): ${data.message || JSON.stringify(data)}`);
        return { success: false, error: data.message || `Brevo status ${response.status}` };
      }

      console.log(`✅ Email sent via Brevo! Message ID: ${data.messageId}`);
      return { success: true, messageId: data.messageId };
    } catch (err) {
      console.warn('⚠️ Brevo API fetch failed:', err.message);
      return { success: false, error: err.message };
    }
  }

  // ── PATH 2: SMTP via Nodemailer (resolves IPv4 explicitly to avoid ENETUNREACH) ──
  const smtpUser = (process.env.SMTP_USER || '').trim();
  const smtpPass = (process.env.SMTP_PASS || '').trim();

  if (smtpUser && smtpPass) {
    const rawHost = (process.env.SMTP_HOST || 'smtp.gmail.com').trim();
    const targetPort = Number(process.env.SMTP_PORT) || 465;

    // Resolve to explicit IPv4 address so Nodemailer never tries IPv6 on Render
    let resolvedHost = rawHost;
    try {
      const lookupResult = await dns.promises.lookup(rawHost, { family: 4 });
      if (lookupResult && lookupResult.address) resolvedHost = lookupResult.address;
    } catch (_) {}

    console.log(`✉️ Sending via SMTP ${rawHost} → ${resolvedHost}:${targetPort}...`);

    try {
      const transporter = nodemailer.createTransport({
        host: resolvedHost,
        port: targetPort,
        secure: targetPort === 465,
        auth: { user: smtpUser, pass: smtpPass },
        connectionTimeout: 5000,
        greetingTimeout: 5000,
        socketTimeout: 6000,
        tls: { servername: rawHost, rejectUnauthorized: false },
      });

      const mailOptions = {
        from: `"Shree Ram Furniture" <${smtpUser}>`,
        to: toEmail,
        subject,
        text: textBody,
      };

      if (pdfPath && pdfPath.trim()) {
        if (pdfPath.startsWith('data:application/pdf;base64,')) {
          mailOptions.attachments = [{ filename: 'catalog.pdf', content: Buffer.from(pdfPath.split(';base64,').pop(), 'base64') }];
        } else {
          const fullPath = path.resolve(__dirname, '..', pdfPath.replace(/^\//, ''));
          if (fs.existsSync(fullPath)) {
            mailOptions.attachments = [{ filename: 'catalog.pdf', path: fullPath }];
          }
        }
      }

      const info = await transporter.sendMail(mailOptions);
      console.log(`✅ Email sent via SMTP! Message ID: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (err) {
      console.log(`ℹ️ SMTP send failed: ${err.message}`);
      return { success: false, error: err.message };
    }
  }

  // ── PATH 3: No email configured — quotation saved to DB only ──────────────
  console.log(`ℹ️ No email provider configured. Quotation for ${toEmail} saved to database.`);
  return { success: true, mocked: true };
}

// ── Routes ─────────────────────────────────────────────────────────────────

// @POST /api/contact/quotation — submit quotation (public)
router.post('/quotation', async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Name, email, and message are required' });
    }

    // Always save quotation to DB first
    const quotation = await Quotation.create({ name, email, phone, message });

    // Fetch email config or create default
    let config = await EmailConfig.findOne();
    if (!config) {
      config = await EmailConfig.create({
        subject: 'Thank you for contacting Shree Ram Furniture!',
        body: 'Hello,\n\nThank you for reaching out to us. We have received your request for a custom furniture quotation.\n\nWe will get back to you shortly with our catalog and pricing.\n\nBest regards,\nShree Ram Furniture Team',
        pdfUrl: '',
      });
    }

    // Personalise body
    let personalizedBody = config.body || '';
    if (personalizedBody.includes('{name}')) {
      personalizedBody = personalizedBody.replace(/{name}/g, name);
    } else if (personalizedBody.includes('Hello,')) {
      personalizedBody = personalizedBody.replace('Hello,', `Hello ${name},`);
    } else if (personalizedBody.includes('Hello')) {
      personalizedBody = personalizedBody.replace('Hello', `Hello ${name}`);
    }

    // Send email in background — never block the response
    sendAutomatedEmail(email, config.subject, personalizedBody, config.pdfUrl)
      .then((result) => {
        if (!result.success && result.error) {
          console.log('ℹ️ Background email notice:', result.error);
        }
      })
      .catch((err) => console.log('ℹ️ Background email notice:', err.message));

    res.status(201).json({ message: 'Quotation request submitted successfully!', quotation });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @GET /api/contact/config — get email config (admin)
router.get('/config', protect, async (req, res) => {
  try {
    let config = await EmailConfig.findOne();
    if (!config) {
      config = await EmailConfig.create({
        subject: 'Thank you for contacting Shree Ram Furniture!',
        body: 'Hello,\n\nThank you for reaching out to us. We have received your request for a custom furniture quotation.\n\nBest regards,\nShree Ram Furniture Team',
        pdfUrl: '',
      });
    }
    res.json(config);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @PUT /api/contact/config — update email config (admin)
router.put('/config', protect, async (req, res) => {
  try {
    const { subject, body, pdfUrl } = req.body;
    let config = await EmailConfig.findOne();
    if (!config) {
      config = await EmailConfig.create({ subject: subject || '', body: body || '', pdfUrl: pdfUrl || '' });
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

// @POST /api/contact/config/pdf — upload PDF catalog (admin)
router.post('/config/pdf', protect, uploadPdf.single('pdf'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No PDF file uploaded' });
    const pdfUrl = `/uploads/${req.file.filename}`;
    res.json({ pdfUrl, message: 'PDF catalog uploaded successfully!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @GET /api/contact/quotations — list all quotations (admin)
router.get('/quotations', protect, async (req, res) => {
  try {
    const quotations = await Quotation.find().sort({ createdAt: -1 });
    res.json(quotations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @DELETE /api/contact/quotations/:id — delete quotation (admin)
router.delete('/quotations/:id', protect, async (req, res) => {
  try {
    const quotation = await Quotation.findByIdAndDelete(req.params.id);
    if (!quotation) return res.status(404).json({ message: 'Quotation not found' });
    res.json({ message: 'Quotation deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @GET /api/contact/test-email — diagnostic endpoint (public)
router.get('/test-email', async (req, res) => {
  const toEmail = req.query.to || process.env.BREVO_SENDER_EMAIL || process.env.SMTP_USER || process.env.ADMIN_EMAIL || 'admin@shreeramfurniture.com';
  const brevoKey = (process.env.BREVO_API_KEY || process.env.BREVO_KEY || '').trim();

  try {
    const result = await sendAutomatedEmail(
      toEmail,
      'Shree Ram Furniture — Email Test',
      'This is a test email to verify your email configuration is working correctly.'
    );
    res.json({
      status: result.success !== false ? 'success' : 'warning',
      to: toEmail,
      brevoConfigured: !!brevoKey,
      brevoKeyPrefix: brevoKey ? brevoKey.substring(0, 8) + '...' : 'NOT SET',
      senderEmail: process.env.BREVO_SENDER_EMAIL || process.env.SMTP_USER || 'not configured',
      result,
    });
  } catch (error) {
    res.status(500).json({ status: 'error', error: error.message, brevoConfigured: !!brevoKey });
  }
});

module.exports = router;
