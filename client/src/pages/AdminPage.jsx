import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import toast, { Toaster } from 'react-hot-toast';
import {
  LayoutDashboard, Tag, Image, LogOut, Menu, X,
  Plus, Pencil, Trash2, Upload, Check, Star, Eye, EyeOff,
  Search, ArrowUpRight, Building2, Mail, FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  getProducts, createProduct, updateProduct, deleteProduct,
  getCategories, createCategory, updateCategory, deleteCategory,
  getAllHeroSlides, createHeroSlide, updateHeroSlide, deleteHeroSlide,
  uploadImages, getEmailConfig, updateEmailConfig, uploadQuotationPdf, getQuotations, deleteQuotation,
  getHeroConfig, updateHeroConfig
} from '../api';

// ───────────────── Sidebar ─────────────────
function Sidebar({ active, setActive, sidebarOpen, setSidebarOpen }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'projects', label: 'Projects', icon: Building2 },
    { id: 'categories', label: 'Categories', icon: Tag },
    { id: 'hero', label: 'Hero Slides', icon: Image },
    { id: 'quotations', label: 'Quotations', icon: FileText },
    { id: 'settings', label: 'Email Settings', icon: Mail },
  ];

  const handleLogout = () => { logout(); navigate('/admin/login', { replace: true }); };

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed top-0 left-0 h-full w-64 bg-charcoal z-40 flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-wood-dark rounded-xl flex items-center justify-center">
              <span className="text-white font-bold font-display">SR</span>
            </div>
            <div className="text-left">
              <p className="text-white font-bold font-display text-sm text-left">Shree Ram</p>
              <p className="text-primary-400 text-xs text-left">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {links.map((link) => {
            const isActive = active === link.id;
            return (
              <button
                key={link.id}
                onClick={() => { setActive(link.id); setSidebarOpen(false); }}
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive ? 'text-gold-500 bg-gold-400/10 border border-gold-400/20 font-semibold' : 'text-white/60 hover:text-white hover:bg-white/10'}`}
              >
                <link.icon size={18} />
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* User */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 mb-2">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
              {user?.name?.[0] || 'A'}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-white text-sm font-medium truncate text-left">{user?.name}</p>
              <p className="text-white/40 text-xs truncate text-left">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-red-300 hover:bg-red-500/10 hover:text-red-200 transition-all duration-200"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}

// Upload files to server as real files (multipart/form-data).
// Returns array of URL strings like ["/uploads/1234567890.jpg"]
const uploadFilesToServer = async (files) => {
  if (!files || files.length === 0) return [];
  const formData = new FormData();
  for (const file of files) {
    formData.append('images', file);
  }
  const res = await uploadImages(formData);
  return res.data?.urls || [];
};

// Build a full displayable URL from a stored path.
// Handles: "/uploads/..." paths, full http URLs, and legacy base64 data URLs.
const getImageSrc = (img) => {
  if (!img || typeof img !== 'string') return '';
  if (img.startsWith('http') || img.startsWith('data:')) return img;
  // Relative server path like "/uploads/filename.jpg"
  const base = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://127.0.0.1:5001'
    : '';
  return `${base}${img}`;
};

// Lightweight File Item Row (No lag, loads image only on eye click)
function FileItemRow({ img, filename, index, onDelete }) {
  const [showPreview, setShowPreview] = useState(false);
  const src = getImageSrc(img);
  const cleanName = filename.length > 28
    ? filename.substring(0, 12) + '...' + filename.substring(filename.length - 10)
    : filename;

  return (
    <div className="flex flex-col gap-1.5 p-2.5 rounded-xl bg-dark-900 border border-white/[0.06] text-xs transition-colors">
      <div className="flex items-center justify-between gap-2 min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <Image size={15} className="text-gold-400 shrink-0" />
          <span className="text-gray-300 font-medium truncate" title={filename}>
            {cleanName}
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="p-1 text-gray-400 hover:text-gold-400 hover:bg-gold-400/10 rounded transition-colors"
            title={showPreview ? 'Hide preview' : 'Quick preview'}
          >
            {showPreview ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(img)}
              className="p-1 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
              title="Remove image"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      {showPreview && (
        <div className="relative w-full aspect-[16/9] rounded-lg overflow-hidden border border-gold-400/20 bg-black/40 mt-1">
          <img
            src={src}
            alt=""
            loading="lazy"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=800&q=80';
            }}
            className="w-full h-full object-cover"
          />
        </div>
      )}
    </div>
  );
}

// ───────────────── Image Uploader ─────────────────
// Uploads files directly to /api/upload and displays lightweight file items.
function ImageUploader({ onUploaded, existing = [], onDelete }) {
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles) => {
    if (!acceptedFiles.length) return;
    setUploading(true);
    try {
      const urls = await uploadFilesToServer(acceptedFiles);
      if (urls.length > 0) {
        toast.success(`${urls.length} image(s) uploaded!`);
        onUploaded(urls);
      } else {
        toast.error('Upload failed — no files returned from server');
      }
    } catch (err) {
      console.error('Upload error:', err);
      const msg = err?.response?.data?.message || err?.message || 'Upload failed';
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  }, [onUploaded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.gif'] },
    multiple: true,
    maxSize: 50 * 1024 * 1024,
  });

  return (
    <div className="space-y-3">
      <div {...getRootProps()} className={`upload-zone py-5 bg-dark-900 border-white/[0.05] rounded-xl ${isDragActive ? 'dragover' : ''}`}>
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-1.5">
          <Upload size={22} className="text-primary-400" />
          {uploading ? (
            <p className="text-xs text-gray-500 animate-pulse">Uploading to server...</p>
          ) : isDragActive ? (
            <p className="text-xs text-primary-400 font-medium">Drop images here!</p>
          ) : (
            <>
              <p className="text-xs font-medium text-gray-400">Drag &amp; drop files, or <span className="text-gold-400 underline">browse</span></p>
              <p className="text-[10px] text-gray-600">JPG, PNG, WebP · up to 50 MB each</p>
            </>
          )}
        </div>
      </div>

      {existing.length > 0 && (
        <div className="space-y-2 mt-2">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-400 px-1">
            <span>Uploaded Files ({existing.length})</span>
            <span className="text-[10px] text-gold-400/80 font-normal">✨ Fast Mode (No Lag)</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
            {existing.map((img, i) => {
              const filename = typeof img === 'string'
                ? img.split('/').pop() || `Image ${i + 1}`
                : `Image ${i + 1}`;

              return (
                <FileItemRow
                  key={img + i}
                  img={img}
                  filename={filename}
                  index={i}
                  onDelete={onDelete}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ───────────────── Product Modal (Completed Site Form) ─────────────────
function ProductModal({ product, categories, onClose, onSaved }) {
  const isEdit = !!product?._id;
  const [form, setForm] = useState({
    name: product?.name || '',
    description: product?.description || '',
    featured: product?.featured || false,
  });
  const [coverImage, setCoverImage] = useState(
    product?.coverImage || product?.images?.[0] || ''
  );
  const [selectedCategories, setSelectedCategories] = useState(() => {
    if (!product?.categories) return [];
    return product.categories.map(cat => typeof cat === 'string' ? cat : cat.name || '');
  });
  const [categoryImages, setCategoryImages] = useState(() => {
    const mapping = {};
    if (product?.categories) {
      product.categories.forEach(cat => {
        const catName = typeof cat === 'string' ? cat : cat.name || '';
        const catImages = typeof cat === 'string' ? product.images || [] : cat.images || [];
        if (catName) {
          mapping[catName] = catImages;
        }
      });
    }
    return mapping;
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validCategories = Array.from(new Set(
      selectedCategories.filter(catName => typeof catName === 'string' && catName.trim() !== '')
    ));

    if (validCategories.length === 0) {
      toast.error('Please select at least one valid category');
      return;
    }

    // Verify that every selected category has at least one image
    for (let catName of validCategories) {
      const imgs = (categoryImages[catName] || []).filter(img => typeof img === 'string' && img.trim() !== '');
      if (imgs.length === 0) {
        toast.error(`Please upload at least one photo for the "${catName}" category`);
        return;
      }
    }

    setSaving(true);
    let chosenCover = coverImage && typeof coverImage === 'string' ? coverImage.trim() : '';

    // Build categories payload — images are sent exactly as uploaded, no compression
    const categoriesPayload = validCategories.map((catName) => {
      const imgs = (categoryImages[catName] || []).filter(img => typeof img === 'string' && img.trim() !== '');
      return {
        name: catName.trim(),
        images: imgs,
      };
    });

    // If no explicit cover chosen, use first category image as default
    if (!chosenCover) {
      const firstCatImg = categoriesPayload.find(cat => cat.images && cat.images.length > 0)?.images[0];
      if (firstCatImg) chosenCover = firstCatImg;
    }

    const payload = {
      name: String(form.name || '').trim(),
      description: String(form.description || '').trim(),
      coverImage: chosenCover,
      categories: categoriesPayload,
      featured: !!form.featured,
      price: 0,
      originalPrice: 0,
    };

    try {
      if (isEdit) {
        await updateProduct(product._id, payload);
        toast.success('Project updated successfully!');
      } else {
        await createProduct(payload);
        toast.success('Project created successfully!');
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Error saving project');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="modal-content text-left bg-dark-800 border-dark-600/35 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-6 border-b border-dark-600/10">
          <h2 className="font-display text-xl font-bold text-dark-400">
            {isEdit ? 'Edit Completed Project Site' : 'Add New Completed Project Site'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-dark-600/30 text-gray-500 hover:text-dark-400 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-1 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-500 mb-1">Project / Site Name *</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g., Nand Prime Bungalow" className="input-field" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-500 mb-1">Scope of Work Overview *</label>
              <textarea required rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Describe the overall scope of carpentry work done at this site (e.g. customized living room desks, dining setup)..." className="input-field resize-none" />
            </div>

            {/* Dedicated Cover Image Section */}
            <div className="p-4 border border-gold-400/25 bg-dark-900/80 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-display font-semibold text-sm text-gold-400 flex items-center gap-2">
                    <Star size={16} className="fill-gold-400 text-gold-400" />
                    <span>Project Cover Image (Main Showcase Thumbnail)</span>
                  </h4>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Upload a dedicated cover photo to showcase on the main project cards and detail banner.
                  </p>
                </div>
                {coverImage && (
                  <button
                    type="button"
                    onClick={() => setCoverImage('')}
                    className="text-xs font-semibold text-red-400 hover:text-red-300 transition-colors"
                  >
                    Clear Cover
                  </button>
                )}
              </div>

              {coverImage ? (
                <div className="relative group w-48 aspect-[16/10] rounded-xl overflow-hidden border-2 border-gold-400 bg-dark-900 shadow-glow">
                  <img
                    src={getImageSrc(coverImage)}
                    alt="Cover Preview"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=800&q=80';
                    }}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-1.5 left-1.5 bg-gold-400 text-dark-900 text-[10px] font-bold px-2 py-0.5 rounded shadow flex items-center gap-1 z-10">
                    <Star size={10} className="fill-dark-900 text-dark-900" /> Cover Image
                  </div>
                  <button
                    type="button"
                    onClick={() => setCoverImage('')}
                    className="absolute top-1.5 right-1.5 bg-black/75 hover:bg-red-600 text-white p-1 rounded transition-colors z-20"
                    title="Remove Cover Image"
                  >
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-amber-300 font-medium">
                    💡 Upload your project cover photo directly below.
                  </p>
                  <ImageUploader
                    existing={[]}
                    onUploaded={(urls) => {
                      if (urls.length > 0 && urls[0]) setCoverImage(urls[0]);
                    }}
                  />
                </div>
              )}
            </div>

            {/* Category selection - Clean checkboxes */}
            <div>
              <label className="block text-sm font-semibold text-gray-500 mb-2">Project Categories (Select all that apply) *</label>
              <div className="flex flex-wrap gap-2.5">
                {categories.map((c) => {
                  const catName = typeof c === 'string' ? c : c.name || '';
                  if (!catName) return null;
                  const isChecked = selectedCategories.includes(catName);
                  return (
                    <label key={catName} className={`flex items-center gap-2 cursor-pointer px-4 py-2 rounded-xl border text-sm font-medium transition-all ${isChecked ? 'bg-gold-500/10 border-gold-400 text-gold-600 shadow-glow' : 'bg-dark-900 border-dark-600/20 text-gray-500 hover:bg-dark-700/60'}`}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCategories([...selectedCategories, catName]);
                            if (!categoryImages[catName]) {
                              setCategoryImages(prev => ({ ...prev, [catName]: [] }));
                            }
                          } else {
                            setSelectedCategories(selectedCategories.filter(name => name !== catName));
                          }
                        }}
                        className="hidden"
                      />
                      <span>{catName}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Photo Upload Card for EACH Selected Category */}
            {selectedCategories.length > 0 && (
              <div className="space-y-4 pt-2 border-t border-dark-600/10">
                <label className="block text-sm font-bold text-dark-400">Category-Specific Photos *</label>
                <div className="space-y-4">
                  {selectedCategories.map((catName) => {
                    const icon = categories.find(c => (typeof c === 'string' ? c : c.name) === catName)?.icon || '🛋️';
                    return (
                      <div key={catName} className="p-4 border border-dark-600/20 bg-dark-900 rounded-2xl space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-display font-semibold text-sm text-dark-400 flex items-center gap-2">
                            <span>{icon}</span>
                            <span>{catName} Photos</span>
                          </h4>
                          <button
                            type="button"
                            onClick={() => setSelectedCategories(selectedCategories.filter(name => name !== catName))}
                            className="text-xs font-semibold text-red-500 hover:text-red-600 hover:bg-red-500/10 px-2 py-1 rounded-lg transition-all"
                          >
                            Disable Category
                          </button>
                        </div>
                        <ImageUploader
                          existing={categoryImages[catName] || []}
                          onUploaded={(urls) => {
                            setCategoryImages(prev => ({
                              ...prev,
                              [catName]: [...(prev[catName] || []), ...urls]
                            }));
                          }}
                          onDelete={(img) => {
                            setCategoryImages(prev => ({
                              ...prev,
                              [catName]: (prev[catName] || []).filter((u) => u !== img)
                            }));
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex gap-6 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                  className="w-4 h-4 accent-primary-500 rounded bg-white border-dark-600/30" />
                <span className="text-sm font-semibold text-gray-500">Featured Project (Showcase on Top)</span>
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-dark-600/15">
            <button type="button" onClick={onClose} className="btn-outline flex-1 justify-center py-2.5">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center py-2.5 disabled:opacity-70 font-semibold text-sm">
              {saving ? <><div className="w-4 h-4 border-2 border-dark-900 border-t-transparent rounded-full animate-spin" /> Saving...</> : <><Check size={16} /> {isEdit ? 'Update Project' : 'Create Project'}</>}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ───────────────── Dashboard Tab ─────────────────
function DashboardTab({ products, categories, slides }) {
  const stats = [
    { label: 'Total Projects', value: products.length, icon: Building2, color: 'from-blue-500 to-indigo-500' },
    { label: 'Categories', value: categories.length, icon: Tag, color: 'from-primary-500 to-wood-mid' },
    { label: 'Hero Slides', value: slides.length, icon: Image, color: 'from-green-500 to-emerald-500' },
    { label: 'Featured Projects', value: products.filter((p) => p.featured).length, icon: Star, color: 'from-amber-500 to-orange-500' },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-dark-400 mb-2">Dashboard</h1>
      <p className="text-gray-500 mb-8">Welcome back! Here&apos;s an overview of your website projects.</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {stats.map((s) => (
          <div key={s.label} className="admin-card bg-dark-800 border-dark-600/35 p-6 rounded-2xl">
            <div className={`w-12 h-12 bg-gradient-to-br ${s.color} rounded-xl flex items-center justify-center mb-4`}>
              <s.icon size={22} className="text-white" />
            </div>
            <p className="text-2xl font-bold text-dark-400 font-display">{s.value}</p>
            <p className="text-gray-500 text-sm mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Projects */}
      <div className="admin-card bg-dark-800 border-dark-600/35">
        <h3 className="font-semibold text-dark-400 mb-4">Recent Projects</h3>
        <div className="space-y-3">
          {products.slice(0, 5).map((p) => (
            <div key={p._id} className="flex items-center gap-3 p-3 rounded-xl bg-dark-900 border border-dark-600/20 hover:bg-dark-700/60 transition-colors">
              <div className="w-10 h-10 bg-dark-800 rounded-lg flex items-center justify-center text-lg overflow-hidden shrink-0 border border-dark-600/10">
                {(p.coverImage || p.images?.[0]) ? (
                  <img src={getImageSrc(p.coverImage || p.images[0])} alt="" className="w-full h-full object-cover" />
                ) : '🏠'}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-semibold text-dark-400 truncate">{p.name}</p>
                <p className="text-xs text-gray-500 truncate text-left">
                  {(p.categories || []).map(c => typeof c === 'string' ? c : c.name || '').join(' · ')}
                </p>
              </div>
              <div className="text-right flex flex-col items-end gap-1 shrink-0">
                <div className="flex items-center gap-0.5 text-xs text-amber-500 font-semibold">
                  <Star size={12} className="fill-amber-500 text-amber-500" />
                  <span>{(p.rating || 5).toFixed(1)}</span>
                </div>
                <span className="text-[10px] text-gray-500 bg-dark-750 px-2 py-0.5 rounded-full border border-dark-600/15">
                  {p.categories?.length || 0} Categories
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ───────────────── Projects Tab ─────────────────
function ProductsTab({ products, categories, onRefresh }) {
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null); // null | 'new' | project object
  const [deleting, setDeleting] = useState(null);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this completed project site?')) return;
    setDeleting(id);
    try {
      await deleteProduct(id);
      toast.success('Project deleted');
      onRefresh();
    } catch {
      toast.error('Delete failed');
    } finally {
      setDeleting(null);
    }
  };

  const filtered = products.filter((p) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    const matchName = p.name?.toLowerCase().includes(q);
    const matchDesc = p.description?.toLowerCase().includes(q);
    const matchCat = p.categories?.some((c) => {
      const name = typeof c === 'string' ? c : c.name || '';
      return name.toLowerCase().includes(q);
    });
    return matchName || matchDesc || matchCat;
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-dark-400">Completed Projects</h1>
          <p className="text-gray-500 text-sm">{products.length} total projects</p>
        </div>
        <button onClick={() => setModal('new')} className="btn-primary py-2.5">
          <Plus size={18} /> Add Project
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gold-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search completed sites..."
          className="input-field-dark pl-11 text-white placeholder-gray-500"
        />
      </div>

      {/* Table */}
      <div className="admin-card overflow-hidden p-0 bg-dark-800 border-dark-600/35">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-dark-900/60 border-b border-dark-600/10">
              <tr>
                {['Project / Site', 'Completed Categories', 'Overview Description', 'Photos Count', 'Featured', 'Actions'].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-600/10">
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-500 bg-dark-800">No projects found</td></tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p._id} className="hover:bg-dark-900/40 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-dark-900 rounded-lg flex items-center justify-center text-lg overflow-hidden shrink-0 border border-dark-600/20 relative">
                          {(p.coverImage || p.images?.[0]) ? (
                            <img src={getImageSrc(p.coverImage || p.images[0])} alt="" className="w-full h-full object-cover rounded-lg" onError={(e) => { e.target.style.display='none'; }} />
                          ) : '🏠'}
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-semibold text-dark-400 truncate max-w-[180px] text-left">{p.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-left">
                      <div className="flex flex-wrap gap-1.5 max-w-[220px]">
                        {p.categories?.map((cat, i) => {
                          const catName = typeof cat === 'string' ? cat : cat.name || '';
                          return (
                            <span key={i} className="text-[10px] font-bold text-gold-600 bg-gold-400/10 border border-gold-400/20 px-2 py-0.5 rounded-md uppercase">
                              {catName}
                            </span>
                          );
                        }) || '—'}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500 max-w-[250px] truncate text-left">
                      {p.description || 'No description'}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500 font-semibold text-left">
                      {p.images?.length || 0} photos
                    </td>
                    <td className="px-5 py-4 text-left">
                      {p.featured ? <Star size={16} className="text-amber-500 fill-amber-500 animate-pulse" /> : <span className="text-gray-400 text-sm">—</span>}
                    </td>
                    <td className="px-5 py-4 text-left">
                      <div className="flex items-center gap-2">
                        <button onClick={() => setModal(p)} className="p-1.5 text-gold-500 hover:bg-gold-400/10 rounded-lg transition-colors">
                           <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(p._id)}
                          disabled={deleting === p._id}
                          className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {modal && (
          <ProductModal
            product={modal === 'new' ? null : modal}
            categories={categories}
            onClose={() => setModal(null)}
            onSaved={onRefresh}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ───────────────── Categories Tab ─────────────────
function CategoriesTab({ categories = [], onRefresh }) {
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', icon: '🛋️', order: (categories.length + 1) || 1 });
  const [editForm, setEditForm] = useState({ name: '', description: '', icon: '🛋️', order: 1 });
  const [saving, setSaving] = useState(false);

  const sortedCategories = [...categories].sort((a, b) => (Number(a.order || 0) - Number(b.order || 0)));

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createCategory({ ...form, order: Number(form.order || 0) });
      toast.success('Category created!');
      setForm({ name: '', description: '', icon: '🛋️', order: categories.length + 2 });
      setShowForm(false);
      onRefresh();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Error creating category');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenEdit = (cat) => {
    setEditingCategory(cat);
    setEditForm({
      name: cat.name || '',
      description: cat.description || '',
      icon: cat.icon || '🛋️',
      order: cat.order !== undefined ? Number(cat.order) : 1,
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingCategory) return;
    setSaving(true);
    try {
      await updateCategory(editingCategory._id, { ...editForm, order: Number(editForm.order || 0) });
      toast.success('Category updated successfully!');
      setEditingCategory(null);
      onRefresh();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Error updating category');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await deleteCategory(id);
      toast.success('Category deleted');
      onRefresh();
    } catch {
      toast.error('Delete failed');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-dark-400">Categories & Ordering</h1>
          <p className="text-gray-500 text-sm">Manage category names, icons, descriptions, and display position order (1, 2, 3...).</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary py-2.5">
          <Plus size={18} /> Add Category
        </button>
      </div>

      {/* New Category Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="admin-card mb-6 bg-dark-800 border-dark-600/35 text-left p-6 rounded-2xl"
          >
            <h3 className="font-semibold text-dark-400 mb-4">New Category</h3>
            <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-500 mb-1">Category Name *</label>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Guest Bedroom" className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-500 mb-1">Icon (emoji)</label>
                <input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })}
                  placeholder="🛏️" className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gold-500 mb-1">Display Position Order (#) *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={form.order}
                  onChange={(e) => setForm({ ...form, order: e.target.value })}
                  placeholder="1, 2, 3..."
                  className="input-field"
                />
              </div>
              <div className="sm:col-span-3">
                <label className="block text-sm font-semibold text-gray-500 mb-1">Description / Subtitle</label>
                <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="e.g. Cozy and Guest Ready Space" className="input-field" />
              </div>
              <div className="sm:col-span-3 flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-outline">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary py-2 disabled:opacity-70">
                  {saving ? 'Saving...' : <><Plus size={16} /> Create Category</>}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Category Modal */}
      <AnimatePresence>
        {editingCategory && (
          <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setEditingCategory(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="modal-content bg-dark-800 border-dark-600/35 text-left max-w-md w-full p-6 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-dark-600/15 pb-3">
                <h3 className="font-display text-lg font-bold text-dark-400 flex items-center gap-2">
                  <Pencil size={18} className="text-gold-400" /> Edit Category
                </h3>
                <button onClick={() => setEditingCategory(null)} className="p-1 hover:bg-dark-600/30 text-gray-500 rounded-lg">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Category Name *</label>
                  <input
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">Icon (emoji)</label>
                    <input
                      value={editForm.icon}
                      onChange={(e) => setEditForm({ ...editForm, icon: e.target.value })}
                      placeholder="🛋️"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gold-500 mb-1">Position Order (#) *</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={editForm.order}
                      onChange={(e) => setEditForm({ ...editForm, order: e.target.value })}
                      placeholder="1"
                      className="input-field font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Description / Subtitle</label>
                  <textarea
                    rows={3}
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    placeholder="Category subtitle overview..."
                    className="input-field resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setEditingCategory(null)} className="btn-outline flex-1 justify-center py-2 text-xs">
                    Cancel
                  </button>
                  <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center py-2 text-xs font-semibold">
                    {saving ? 'Saving...' : <><Check size={16} /> Save Changes</>}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Category List Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {sortedCategories.map((cat) => (
          <div key={cat._id} className="admin-card flex items-center justify-between bg-dark-800 border-dark-600/35 p-4 rounded-2xl relative">
            <div className="flex items-center gap-3 min-w-0 pr-2">
              <span className="text-3xl shrink-0">{cat.icon}</span>
              <div className="text-left min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-gold-500 bg-gold-400/10 px-2 py-0.5 rounded-full border border-gold-400/20">
                    Pos #{cat.order ?? 0}
                  </span>
                  <p className="font-semibold text-dark-400 text-left truncate">{cat.name}</p>
                </div>
                <p className="text-xs text-gray-500 text-left line-clamp-2 mt-0.5">{cat.description || 'No description'}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => handleOpenEdit(cat)}
                className="p-2 text-gold-400 hover:bg-gold-400/10 rounded-lg transition-colors"
                title="Edit Category & Order Position"
              >
                <Pencil size={16} />
              </button>
              <button
                onClick={() => handleDelete(cat._id)}
                className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                title="Delete Category"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ───────────────── Hero Slides Tab ─────────────────
function HeroTab({ slides, onRefresh }) {
  const [config, setConfig] = useState({ title: '', subtitle: '', ctaText: '', ctaLink: '' });
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [savingConfig, setSavingConfig] = useState(false);
  const [showAddImage, setShowAddImage] = useState(false);
  const [imageForm, setImageForm] = useState({ image: '', order: 0, active: true });
  const [uploadedImg, setUploadedImg] = useState([]);
  const [savingImage, setSavingImage] = useState(false);

  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await getHeroConfig();
        if (res.data) setConfig(res.data);
      } catch {
        toast.error('Failed to load Hero text config');
      } finally {
        setLoadingConfig(false);
      }
    }
    loadConfig();
  }, []);

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    setSavingConfig(true);
    try {
      await updateHeroConfig(config);
      toast.success('Hero text settings updated!');
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setSavingConfig(false);
    }
  };

  const handleCreateImage = async (e) => {
    e.preventDefault();
    const imageUrl = uploadedImg[0] || imageForm.image;
    if (!imageUrl) { toast.error('Please upload or provide an image URL'); return; }
    setSavingImage(true);
    try {
      await createHeroSlide({ 
        title: 'Background Image', 
        subtitle: '', 
        ctaText: '', 
        ctaLink: '', 
        image: imageUrl, 
        order: imageForm.order, 
        active: imageForm.active 
      });
      toast.success('Background image added!');
      setImageForm({ image: '', order: 0, active: true });
      setUploadedImg([]);
      setShowAddImage(false);
      onRefresh();
    } catch {
      toast.error('Error adding image');
    } finally {
      setSavingImage(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this background slide image?')) return;
    try {
      await deleteHeroSlide(id);
      toast.success('Slide image deleted');
      onRefresh();
    } catch {
      toast.error('Delete failed');
    }
  };

  const toggleActive = async (slide) => {
    try {
      await updateHeroSlide(slide._id, { active: !slide.active });
      onRefresh();
    } catch {
      toast.error('Update failed');
    }
  };

  if (loadingConfig) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-8 h-8 border-3 border-gold-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-dark-400">Hero Section Settings</h1>
          <p className="text-gray-500 text-sm">Manage the fixed text settings and sliding background images separately.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
        {/* Left Side: Static Text Config */}
        <div className="lg:col-span-1 space-y-6">
          <div className="admin-card bg-dark-800 border-dark-600/35 p-6 rounded-2xl">
            <h3 className="text-lg font-bold text-dark-400 mb-4 border-b border-dark-600/10 pb-2">Hero Text Overlay</h3>
            <form onSubmit={handleSaveConfig} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-500 mb-1">Title Overlay *</label>
                <textarea
                  required
                  rows={3}
                  value={config.title}
                  onChange={(e) => setConfig({ ...config, title: e.target.value })}
                  placeholder="Use \n for line breaks&#10;e.g. Crafted with Passion,\nBuilt to Last"
                  className="input-field resize-none text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-500 mb-1">Subtitle Overlay *</label>
                <textarea
                  required
                  rows={3}
                  value={config.subtitle}
                  onChange={(e) => setConfig({ ...config, subtitle: e.target.value })}
                  placeholder="Enter slide subtitle..."
                  className="input-field resize-none text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-500 mb-1">CTA Button Text *</label>
                <input
                  required
                  type="text"
                  value={config.ctaText}
                  onChange={(e) => setConfig({ ...config, ctaText: e.target.value })}
                  placeholder="e.g. Explore Our Work"
                  className="input-field text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-500 mb-1">CTA Link *</label>
                <input
                  required
                  type="text"
                  value={config.ctaLink}
                  onChange={(e) => setConfig({ ...config, ctaLink: e.target.value })}
                  placeholder="e.g. #projects"
                  className="input-field text-sm"
                />
              </div>

              <button type="submit" disabled={savingConfig} className="w-full btn-primary justify-center py-2.5 disabled:opacity-75 font-semibold text-sm">
                {savingConfig ? 'Saving...' : 'Save Text Settings'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Background Image Slider */}
        <div className="lg:col-span-2 space-y-6">
          <div className="admin-card bg-dark-800 border-dark-600/35 p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-4 border-b border-dark-600/10 pb-2">
              <h3 className="text-lg font-bold text-dark-400">Background Slide Images</h3>
              <button
                onClick={() => setShowAddImage(!showAddImage)}
                className="btn-primary py-1.5 px-4 text-xs flex items-center gap-1.5"
              >
                <Plus size={14} /> Add Background
              </button>
            </div>

            <AnimatePresence>
              {showAddImage && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 border border-dark-600/20 bg-dark-900 rounded-2xl mb-6 space-y-4 overflow-hidden"
                >
                  <h4 className="font-display font-semibold text-sm text-dark-400">Upload New Background Slide</h4>
                  <form onSubmit={handleCreateImage} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-500 mb-1">Display Order</label>
                        <input
                          type="number"
                          value={imageForm.order}
                          onChange={(e) => setImageForm({ ...imageForm, order: e.target.value })}
                          className="input-field"
                        />
                      </div>
                      <div className="flex items-center gap-2 pt-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={imageForm.active}
                            onChange={(e) => setImageForm({ ...imageForm, active: e.target.checked })}
                            className="w-4 h-4 accent-primary-500 rounded bg-white border-dark-600/30"
                          />
                          <span className="text-sm font-semibold text-gray-500">Active Slide (Visible)</span>
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-500 mb-2">Slide Image *</label>
                      <ImageUploader
                        existing={uploadedImg}
                        onUploaded={(urls) => setUploadedImg(urls)}
                        onDelete={() => setUploadedImg([])}
                      />
                      <p className="text-xs text-gray-500 mt-1">Or enter image URL:</p>
                      <input
                        value={imageForm.image}
                        onChange={(e) => setImageForm({ ...imageForm, image: e.target.value })}
                        placeholder="https://example.com/image.jpg"
                        className="input-field mt-1"
                      />
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button type="button" onClick={() => setShowAddImage(false)} className="btn-outline py-2">Cancel</button>
                      <button type="submit" disabled={savingImage} className="btn-primary py-2 disabled:opacity-70">
                        {savingImage ? 'Saving...' : <><Plus size={16} /> Add Image</>}
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {slides.map((slide) => (
                <div key={slide._id} className="relative group overflow-hidden rounded-2xl bg-dark-900 border border-dark-600/20 flex flex-col justify-between">
                  <div className="relative h-44 overflow-hidden bg-dark-800">
                    <img
                      src={slide.image?.startsWith('http') ? slide.image : slide.image}
                      alt="Background Slide"
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=60'; }}
                    />
                  </div>
                  <div className="p-3 flex items-center justify-between border-t border-dark-600/10">
                    <div className="flex items-center gap-1.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${slide.active ? 'bg-green-50 text-green-600 border border-green-200' : 'bg-dark-750 text-gray-500 border border-dark-600/15'}`}>
                        {slide.active ? 'Active' : 'Hidden'}
                      </span>
                      <span className="text-xs text-gray-500 font-semibold">Order: {slide.order}</span>
                    </div>
                    <div className="flex gap-0.5">
                      <button
                        onClick={() => toggleActive(slide)}
                        className="p-1.5 text-gold-500 hover:bg-gold-400/10 rounded-lg transition-colors"
                        title={slide.active ? 'Hide Slide' : 'Show Slide'}
                      >
                        {slide.active ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      <button
                        onClick={() => handleDelete(slide._id)}
                        className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Delete Slide"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ───────────────── Quotations Tab ─────────────────
function QuotationModal({ quotation, onClose }) {
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="modal-content text-left max-w-lg w-full p-6 space-y-6"
      >
        <div className="flex items-center justify-between pb-4 border-b border-dark-600/20">
          <h2 className="font-display text-xl font-bold text-dark-400">
            Quotation Request Details
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-dark-700 text-gray-500 hover:text-dark-400 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gold-500 uppercase tracking-wider mb-1.5">Client Name</label>
            <p className="text-sm font-semibold text-dark-400 bg-dark-700 px-4 py-3 rounded-xl border border-dark-600/30">{quotation.name}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gold-500 uppercase tracking-wider mb-1.5">Email Address</label>
              <a href={`mailto:${quotation.email}`} className="block text-sm font-semibold text-gold-600 hover:text-gold-500 transition-colors bg-dark-700 px-4 py-3 rounded-xl border border-dark-600/30 truncate">{quotation.email}</a>
            </div>
            <div>
              <label className="block text-xs font-bold text-gold-500 uppercase tracking-wider mb-1.5">Phone Number</label>
              <a href={quotation.phone ? `tel:${quotation.phone}` : '#'} className="block text-sm font-semibold text-dark-400 bg-dark-700 px-4 py-3 rounded-xl border border-dark-600/30">{quotation.phone || '—'}</a>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gold-500 uppercase tracking-wider mb-1.5">Submitted Date</label>
            <p className="text-sm font-semibold text-dark-400 bg-dark-700 px-4 py-3 rounded-xl border border-dark-600/30">
              {new Date(quotation.createdAt).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-gold-500 uppercase tracking-wider mb-1.5">Message / Requirements</label>
            <div className="text-sm text-dark-400 bg-dark-700 px-4 py-3 rounded-xl border border-dark-600/30 min-h-[120px] whitespace-pre-line leading-relaxed">
              {quotation.message}
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t border-dark-600/20">
          <button type="button" onClick={onClose} className="btn-primary w-full justify-center py-2.5">Close</button>
        </div>
      </motion.div>
    </div>
  );
}

function QuotationsTab() {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchQuotations = async () => {
    try {
      const res = await getQuotations();
      setQuotations(res.data);
    } catch {
      toast.error('Failed to load quotation requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, []);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this quotation request?')) return;
    setDeletingId(id);
    try {
      await deleteQuotation(id);
      toast.success('Quotation request deleted successfully!');
      setQuotations(prev => prev.filter(q => q._id !== id));
    } catch {
      toast.error('Failed to delete quotation request');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-8 h-8 border-3 border-gold-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-white mb-2">Quotation Requests</h1>
      <p className="text-gray-400 mb-8">View all submitted quotation requests and contact forms completed by potential clients.</p>

      <div className="admin-card overflow-hidden p-0 bg-dark-800 border-dark-600/35">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-dark-900/60 border-b border-dark-600/10">
              <tr>
                {['Client Name', 'Email', 'Phone', 'Requirement / Message', 'Date Submitted', 'Actions'].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-600/10">
              {quotations.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-500 bg-dark-800">No quotation requests received yet</td></tr>
              ) : (
                quotations.map((q) => (
                  <tr
                    key={q._id}
                    onClick={() => setSelectedQuote(q)}
                    className="hover:bg-dark-900/40 transition-colors cursor-pointer"
                  >
                    <td className="px-5 py-4 text-sm font-semibold text-white text-left">{q.name}</td>
                    <td className="px-5 py-4 text-sm text-gray-500 text-left">{q.email}</td>
                    <td className="px-5 py-4 text-sm text-gray-500 text-left">{q.phone || '—'}</td>
                    <td className="px-5 py-4 text-sm text-gray-500 max-w-[200px] truncate text-left">{q.message}</td>
                    <td className="px-5 py-4 text-sm text-gray-500 text-left">
                      {new Date(q.createdAt).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-5 py-4 text-left">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedQuote(q)}
                          className="p-1.5 text-gold-500 hover:bg-gold-400/10 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={(e) => handleDelete(e, q._id)}
                          disabled={deletingId === q._id}
                          className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                          title="Delete Request"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {selectedQuote && (
          <QuotationModal
            quotation={selectedQuote}
            onClose={() => setSelectedQuote(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ───────────────── Email Settings Tab ─────────────────
function SettingsTab() {
  const [config, setConfig] = useState({ subject: '', body: '', pdfUrl: '', logoUrl: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await getEmailConfig();
        setConfig(res.data);
      } catch {
        toast.error('Failed to load email configuration');
      } finally {
        setLoading(false);
      }
    }
    loadConfig();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateEmailConfig(config);
      toast.success('Email settings updated!');
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (PNG/JPG/SVG/WebP)');
      return;
    }

    setUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append('images', file);
      const res = await uploadImages(formData);
      const urls = res.data?.urls || res.urls || [];
      if (!urls.length) throw new Error('No logo URL returned');
      const logoUrl = urls[0];
      const updatedConfig = { ...config, logoUrl };
      await updateEmailConfig(updatedConfig);
      setConfig(updatedConfig);
      toast.success('Email Header Logo updated successfully!');
    } catch (err) {
      console.error('Logo upload error:', err);
      toast.error(err?.response?.data?.message || 'Logo upload failed');
    } finally {
      setUploadingLogo(false);
      e.target.value = '';
    }
  };

  const handlePdfUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file only');
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      toast.error('PDF file size must be less than 25MB');
      return;
    }

    setUploadingPdf(true);
    try {
      // Upload PDF via multipart form (dedicated endpoint — avoids MongoDB 16MB doc limit)
      const formData = new FormData();
      formData.append('pdf', file);
      const uploadRes = await uploadQuotationPdf(formData);
      const pdfUrl = uploadRes.data?.pdfUrl || uploadRes.pdfUrl;
      if (!pdfUrl) throw new Error('No PDF URL returned from server');
      // Save the URL reference into the email config
      const updatedConfig = { ...config, pdfUrl };
      await updateEmailConfig(updatedConfig);
      setConfig(updatedConfig);
      toast.success('PDF Brochure uploaded successfully!');
    } catch (err) {
      console.error('PDF upload error:', err);
      toast.error(err?.response?.data?.message || 'Brochure upload failed. Try again.');
    } finally {
      setUploadingPdf(false);
      // Reset the file input so same file can be re-uploaded if needed
      e.target.value = '';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-8 h-8 border-3 border-gold-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-white mb-2">Email Settings</h1>
      <p className="text-gray-400 mb-8">Customize the automatic quotation email, header logo image, and PDF attachment catalog sent to clients.</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Settings Form */}
        <div className="lg:col-span-2 admin-card bg-dark-800 border-dark-600/35 p-6 rounded-2xl text-left">
          <form onSubmit={handleSave} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-500 mb-1">Email Subject *</label>
              <input
                required
                type="text"
                value={config.subject}
                onChange={(e) => setConfig({ ...config, subject: e.target.value })}
                className="input-field"
                placeholder="e.g. Shree Ram Furniture - Quotation Catalog"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-500 mb-1">Email Body Text *</label>
              <textarea
                required
                rows={8}
                value={config.body}
                onChange={(e) => setConfig({ ...config, body: e.target.value })}
                className="input-field resize-none"
                placeholder="Enter email message body..."
              />
            </div>

            <button type="submit" disabled={saving} className="btn-primary px-6 py-2.5 disabled:opacity-75">
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </form>
        </div>

        {/* Right Side Cards: Logo Image & PDF Attachment */}
        <div className="space-y-6">
          {/* Email Logo Card */}
          <div className="admin-card bg-dark-800 border-dark-600/35 p-6 rounded-2xl flex flex-col justify-between text-left">
            <div>
              <h3 className="text-lg font-bold text-white mb-2">Header Email Logo</h3>
              <p className="text-gray-400 text-xs leading-relaxed mb-4">
                This logo image will appear at the top of all automated quotation emails sent to clients.
              </p>

              <div className="p-4 bg-dark-900 border border-dark-600/20 rounded-xl mb-4 text-center flex flex-col items-center justify-center">
                {config.logoUrl ? (
                  <div>
                    <img
                      src={config.logoUrl}
                      alt="Email Logo Preview"
                      className="w-16 h-16 object-contain rounded-lg border border-gold-400/30 bg-white p-1 mb-2 mx-auto"
                    />
                    <a
                      href={config.logoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-gold-500 hover:underline block truncate max-w-[200px]"
                    >
                      View Current Logo
                    </a>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-xs text-gray-500 italic mb-1">Using default website logo</p>
                    <span className="text-[10px] text-gold-500 bg-gold-400/10 px-2 py-0.5 rounded">Default Active</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="btn-outline w-full justify-center py-2.5 rounded-xl cursor-pointer block text-center text-xs font-semibold uppercase tracking-wider">
                {uploadingLogo ? 'Uploading Logo...' : 'Upload / Change Email Logo'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  disabled={uploadingLogo}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* PDF Attachment Card */}
          <div className="admin-card bg-dark-800 border-dark-600/35 p-6 rounded-2xl flex flex-col justify-between text-left">
            <div>
              <h3 className="text-lg font-bold text-white mb-2">Brochure PDF Attachment</h3>
              <p className="text-gray-400 text-xs leading-relaxed mb-4">
                This PDF catalog will be attached to emails & downloadable via a button. Max size 25MB.
              </p>

              <div className="p-4 bg-dark-900 border border-dark-600/20 rounded-xl mb-4 text-center">
                {config.pdfUrl ? (
                  <div>
                    <p className="text-sm font-semibold text-gold-600 truncate mb-1">Catalog PDF</p>
                    <a
                      href={config.pdfUrl.startsWith('http') ? config.pdfUrl : config.pdfUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-gold-500 hover:underline inline-block"
                    >
                      View Current PDF Catalog
                    </a>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">No PDF attached yet</p>
                )}
              </div>
            </div>

            <div>
              <label className="btn-outline w-full justify-center py-2.5 rounded-xl cursor-pointer block text-center text-xs font-semibold uppercase tracking-wider">
                {uploadingPdf ? 'Uploading PDF...' : 'Upload New Catalog PDF'}
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handlePdfUpload}
                  disabled={uploadingPdf}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



// ───────────────── Main Admin Page ─────────────────
export default function AdminPage() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  // Restore active tab from sessionStorage on refresh (cleared when tab is closed)
  const [active, setActive] = useState(
    () => sessionStorage.getItem('admin_active_tab') || 'dashboard'
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);

  // Save active tab on every change
  const handleSetActive = (tab) => {
    sessionStorage.setItem('admin_active_tab', tab);
    setActive(tab);
    setSidebarOpen(false);
  };

  useEffect(() => {
    if (!isAdmin) navigate('/admin/login', { replace: true });
  }, [isAdmin]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [p, c, s] = await Promise.all([
        getProducts({ limit: 100 }),
        getCategories(),
        getAllHeroSlides(),
      ]);
      setProducts(p.data.products || []);
      setCategories(c.data || []);
      setSlides(s.data || []);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (isAdmin) fetchAll(); }, [isAdmin]);

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-dark-900 text-dark-400 flex">
      <Toaster position="top-right" />
      <Sidebar active={active} setActive={handleSetActive} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen bg-dark-950">
        {/* Top bar */}
        <header className="bg-dark-900 border-b border-dark-600/10 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 hover:bg-dark-600/30 text-gray-500 hover:text-dark-400 rounded-lg transition-colors"
          >
            <Menu size={20} />
          </button>
          <div className="flex-1 lg:flex-none text-left">
            <h2 className="font-semibold text-dark-400 capitalize text-sm lg:text-base text-left">
              {active === 'dashboard' ? '👋 Good day, Admin!' : active}
            </h2>
          </div>
          <a href="/" target="_blank" className="flex items-center gap-2 text-sm text-gold-600 hover:text-gold-700 font-medium">
            View Website
            <ArrowUpRight size={16} />
          </a>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 lg:p-8">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-3 border-gold-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {active === 'dashboard' && <DashboardTab products={products} categories={categories} slides={slides} />}
                {active === 'projects' && <ProductsTab products={products} categories={categories} onRefresh={fetchAll} />}
                {active === 'categories' && <CategoriesTab categories={categories} onRefresh={fetchAll} />}
                {active === 'hero' && <HeroTab slides={slides} onRefresh={fetchAll} />}
                {active === 'quotations' && <QuotationsTab />}
                {active === 'settings' && <SettingsTab />}
              </motion.div>
            </AnimatePresence>
          )}
        </main>
      </div>
    </div>
  );
}
