/**
 * dbStats.js — Show full database stats + uploaded files info
 */
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function showStats() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;

    // DB stats
    const stats = await db.command({ dbStats: 1 });
    console.log('\n═══════════════════════════════════════════');
    console.log('         DATABASE STATS REPORT');
    console.log('═══════════════════════════════════════════');
    console.log(`DB Name        : ${stats.db}`);
    console.log(`Data Size      : ${(stats.dataSize / 1024 / 1024).toFixed(3)} MB`);
    console.log(`Storage Size   : ${(stats.storageSize / 1024 / 1024).toFixed(3)} MB`);
    console.log(`Collections    : ${stats.collections}`);
    console.log(`Total Docs     : ${stats.objects}`);

    // Per collection
    const collections = await db.listCollections().toArray();
    console.log('\n─── Per Collection ───────────────────────');
    for (const col of collections) {
      const cs = await db.command({ collStats: col.name }).catch(() => null);
      const count = await db.collection(col.name).countDocuments();
      const sizeKB = cs ? (cs.size / 1024).toFixed(1) : '?';
      console.log(`  ${col.name.padEnd(16)} | ${String(count).padStart(4)} docs | ${String(sizeKB).padStart(8)} KB`);
    }

    // Products detail
    const products = await db.collection('products').find({}).toArray();
    if (products.length > 0) {
      console.log('\n─── Projects ─────────────────────────────');
      for (const p of products) {
        const allImgs = (p.images || []).length;
        const catImgs = (p.categories || []).reduce((sum, c) => sum + (c.images || []).length, 0);
        console.log(`  "${p.name}"`);
        console.log(`    Cover   : ${p.coverImage ? '✅ YES (' + p.coverImage.substring(0,40) + '...)' : '❌ none'}`);
        console.log(`    Images  : ${allImgs} total | ${catImgs} in categories`);
      }
    } else {
      console.log('\n─── Projects ─────────────────────────────');
      console.log('  (No projects added yet)');
    }

    // Uploads folder
    const uploadsDir = path.join(__dirname, '../uploads');
    const files = fs.existsSync(uploadsDir)
      ? fs.readdirSync(uploadsDir).filter(f => f !== '.gitkeep')
      : [];
    const images = files.filter(f => /\.(jpg|jpeg|png|webp|gif)$/i.test(f));
    const pdfs   = files.filter(f => /\.pdf$/i.test(f));
    let totalBytes = 0;
    const fileDetails = files.map(f => {
      const s = fs.statSync(path.join(uploadsDir, f)).size;
      totalBytes += s;
      return { name: f, mb: (s / 1024 / 1024).toFixed(2) };
    }).sort((a, b) => parseFloat(b.mb) - parseFloat(a.mb));

    console.log('\n─── Uploaded Files (server/uploads/) ─────');
    console.log(`  🖼️  Images  : ${images.length} files`);
    console.log(`  📄 PDFs    : ${pdfs.length} files`);
    console.log(`  📦 Total   : ${files.length} files  |  ${(totalBytes / 1024 / 1024).toFixed(2)} MB on disk`);

    if (fileDetails.length > 0) {
      console.log('\n  File sizes:');
      fileDetails.forEach(f => {
        const ext = path.extname(f.name).toUpperCase().replace('.','');
        console.log(`    [${ext.padEnd(4)}] ${f.name.padEnd(42)} ${String(f.mb).padStart(6)} MB`);
      });
    } else {
      console.log('\n  ✅ Upload folder is clean — no files yet.');
    }

    console.log('\n═══════════════════════════════════════════\n');
  } catch (err) {
    console.error('Error:', err.message);
    console.error(err.stack);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

showStats();
