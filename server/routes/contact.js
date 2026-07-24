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

// Helper to generate fast-loading responsive HTML email layout with Logo -> Text -> Catalog -> Footer
function generateEmailHtml(textBody, pdfPath, customLogoUrl) {
  const paragraphs = textBody
    ? textBody
        .split('\n')
        .map((p) => p.trim())
        .filter((p) => p.length > 0)
        .map((p) => `<p style="margin:0 0 16px 0; line-height:1.75; color:#2e2724; font-size:15px;">${p}</p>`)
        .join('')
    : '<p style="margin:0 0 16px 0; line-height:1.75; color:#2e2724; font-size:15px;">Thank you for contacting Shree Ram Furniture!</p>';

  const serverBaseUrl = (
    process.env.SERVER_URL ||
    process.env.RENDER_EXTERNAL_URL ||
    'https://shreeramfurniture.onrender.com'
  ).replace(/\/$/, '');

  // Resolve Header Logo URL (Custom CDN/Uploaded logo or default site logo)
  let logoUrl = `${serverBaseUrl}/uploads/logo.png`;
  if (customLogoUrl && customLogoUrl.trim()) {
    logoUrl = customLogoUrl.startsWith('http')
      ? customLogoUrl
      : `${serverBaseUrl}${customLogoUrl.startsWith('/') ? '' : '/'}${customLogoUrl}`;
  }

  let catalogHtml = '';
  if (pdfPath && pdfPath.trim()) {
    let downloadLink = pdfPath.startsWith('http')
      ? pdfPath
      : `${serverBaseUrl}${pdfPath.startsWith('/') ? '' : '/'}${pdfPath}`;

    catalogHtml = `
      <tr>
        <td style="padding: 0 30px 30px 30px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #faf8f5; border: 1.5px dashed #d58564; border-radius: 12px; padding: 22px; text-align: center;">
            <tr>
              <td>
                <div style="font-size: 32px; margin-bottom: 8px;">📄</div>
                <h3 style="margin: 0 0 6px 0; color: #2e2724; font-size: 17px; font-weight: 700; font-family: Arial, sans-serif;">Catalog & Pricing Attached</h3>
                <p style="margin: 0 0 16px 0; color: #75655e; font-size: 13px;">Find our catalog attached to this email or download it directly below:</p>
                <a href="${downloadLink}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #d58564 0%, #c86a4b 100%); color: #ffffff; text-decoration: none; font-weight: 700; font-size: 14px; padding: 12px 28px; border-radius: 8px; box-shadow: 0 4px 14px rgba(200,106,75,0.3); font-family: Arial, sans-serif;">
                  📥 Download Price Catalog PDF
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    `;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Shree Ram Furniture</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4efea; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #2e2724;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4efea; padding: 40px 10px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 30px rgba(46,39,36,0.08); border: 1px solid #e5dcd3;">
          
          <!-- ── 1. LOGO & BRAND HEADER ── -->
          <tr>
            <td align="center" style="background-color: #2e2724; padding: 32px 20px; border-bottom: 4px solid #d58564;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <img src="${logoUrl}" alt="Shree Ram Furniture Logo" width="75" height="75" style="display: block; border-radius: 12px; margin-bottom: 12px; border: 2px solid #d58564; object-fit: contain; background-color: #ffffff; padding: 4px;" />
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 800; letter-spacing: 1.5px; font-family: Arial, sans-serif;">
                      SHREE RAM <span style="color: #d58564;">FURNITURE</span>
                    </h1>
                    <p style="margin: 4px 0 0 0; color: #c86a4b; font-size: 11px; font-weight: 700; letter-spacing: 2.5px; text-transform: uppercase; font-family: Arial, sans-serif;">
                      Bespoke On-Site Carpentry & Custom Furniture
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── 2. MESSAGE BODY TEXT ── -->
          <tr>
            <td style="padding: 35px 30px 20px 30px;">
              ${paragraphs}
            </td>
          </tr>

          <!-- ── 3. CATALOG & PRICE LIST SECTION ── -->
          ${catalogHtml}

          <!-- ── 4. FOOTER ── -->
          <tr>
            <td align="center" style="background-color: #2e2724; padding: 26px 20px; color: #a3958c; font-size: 12px; line-height: 1.6;">
              <p style="margin: 0 0 6px 0; color: #ffffff; font-weight: 700; font-size: 14px; letter-spacing: 0.5px;">Shree Ram Furniture</p>
              <p style="margin: 0 0 8px 0; color: #e2dcd0;">📍 Rajkot & Gondal, Gujarat, India</p>
              <p style="margin: 0 0 14px 0; color: #d58564; font-size: 13px; font-weight: 600;">
                📞 +91 99241 01181 &nbsp;|&nbsp; +91 99042 27279
              </p>
              <div style="border-top: 1px solid #423833; padding-top: 12px; margin-top: 10px;">
                <p style="margin: 0; font-size: 11px; color: #7d6f66;">© ${new Date().getFullYear()} Shree Ram Furniture. All rights reserved.</p>
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// Helper to fetch PDF attachment content as base64 string
async function getPdfBase64Attachment(pdfPath) {
  if (!pdfPath || !pdfPath.trim()) return null;

  try {
    // Case A: Base64 data URI
    if (pdfPath.startsWith('data:application/pdf;base64,')) {
      return pdfPath.split(';base64,').pop();
    }

    // Case B: Remote URL (e.g. Cloudinary or HTTPS server)
    if (pdfPath.startsWith('http://') || pdfPath.startsWith('https://')) {
      const response = await fetch(pdfPath);
      if (!response.ok) throw new Error(`HTTP ${response.status} fetching PDF from ${pdfPath}`);
      const arrayBuf = await response.arrayBuffer();
      return Buffer.from(arrayBuf).toString('base64');
    }

    // Case C: Local server file
    const fullPath = path.resolve(__dirname, '..', pdfPath.replace(/^\//, ''));
    if (fs.existsSync(fullPath)) {
      const fileBuffer = fs.readFileSync(fullPath);
      return fileBuffer.toString('base64');
    }
  } catch (err) {
    console.warn('⚠️ PDF attachment resolution notice:', err.message);
  }
  return null;
}

// ── Email Helper ───────────────────────────────────────────────────────────
async function sendAutomatedEmail(toEmail, subject, textBody, pdfPath, logoUrl) {
  const brevoKey = (
    process.env.BREVO_API_KEY ||
    process.env.BREVO_KEY ||
    process.env.BREVO_APIKEY ||
    process.env.SENDINBLUE_API_KEY ||
    ''
  ).trim().replace(/^["']|["']$/g, '');

  console.log(`[Email] BREVO_API_KEY set: ${brevoKey ? 'YES (' + brevoKey.substring(0, 8) + '...)' : 'NO'}`);

  // Generate styled HTML email template
  const htmlBody = generateEmailHtml(textBody, pdfPath, logoUrl);

  // Prepare PDF attachment content (handles local files + Cloudinary CDN URLs)
  const pdfBase64 = await getPdfBase64Attachment(pdfPath);

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
      htmlContent: htmlBody,
      textContent: textBody,
    };

    if (pdfBase64) {
      payload.attachment = [{ name: 'ShreeRamFurniture_Catalog.pdf', content: pdfBase64 }];
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

  // ── PATH 2: SMTP via Nodemailer ──────────────────────────────────────────
  const smtpUser = (process.env.SMTP_USER || '').trim();
  const smtpPass = (process.env.SMTP_PASS || '').trim();

  if (smtpUser && smtpPass) {
    const rawHost = (process.env.SMTP_HOST || 'smtp.gmail.com').trim();
    const targetPort = Number(process.env.SMTP_PORT) || 465;

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
        html: htmlBody,
      };

      if (pdfBase64) {
        mailOptions.attachments = [{
          filename: 'ShreeRamFurniture_Catalog.pdf',
          content: Buffer.from(pdfBase64, 'base64')
        }];
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
        logoUrl: '',
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
    sendAutomatedEmail(email, config.subject, personalizedBody, config.pdfUrl, config.logoUrl)
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
        logoUrl: '',
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
    const { subject, body, pdfUrl, logoUrl } = req.body;
    let config = await EmailConfig.findOne();
    if (!config) {
      config = await EmailConfig.create({
        subject: subject || '',
        body: body || '',
        pdfUrl: pdfUrl || '',
        logoUrl: logoUrl || ''
      });
    } else {
      const updateData = {};
      if (subject !== undefined) updateData.subject = subject;
      if (body !== undefined) updateData.body = body;
      if (pdfUrl !== undefined) updateData.pdfUrl = pdfUrl;
      if (logoUrl !== undefined) updateData.logoUrl = logoUrl;
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
    let config = await EmailConfig.findOne();
    const pdfUrl = config?.pdfUrl || '';
    const logoUrl = config?.logoUrl || '';

    const result = await sendAutomatedEmail(
      toEmail,
      'Shree Ram Furniture — Email Test',
      'This is a test email to verify your email configuration is working correctly.',
      pdfUrl,
      logoUrl
    );
    res.json({
      status: result.success !== false ? 'success' : 'warning',
      to: toEmail,
      brevoConfigured: !!brevoKey,
      brevoKeyPrefix: brevoKey ? brevoKey.substring(0, 8) + '...' : 'NOT SET',
      senderEmail: process.env.BREVO_SENDER_EMAIL || process.env.SMTP_USER || 'not configured',
      pdfUrl,
      logoUrl,
      result,
    });
  } catch (error) {
    res.status(500).json({ status: 'error', error: error.message, brevoConfigured: !!brevoKey });
  }
});

module.exports = router;
