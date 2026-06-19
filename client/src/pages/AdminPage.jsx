import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import toast, { Toaster } from 'react-hot-toast';
import {
  LayoutDashboard, Package, Tag, Image, LogOut, Menu, X,
  Plus, Pencil, Trash2, Upload, Check, Star, Eye, EyeOff,
  ChevronDown, Search, ArrowUpRight, TrendingUp, Users, ShoppingBag
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  getProducts, createProduct, updateProduct, deleteProduct,
  getCategories, createCategory, deleteCategory,
  getAllHeroSlides, createHeroSlide, updateHeroSlide, deleteHeroSlide,
  uploadImages, deleteImage,
} from '../api';

// ───────────────── Sidebar ─────────────────
function Sidebar({ active, setActive, sidebarOpen, setSidebarOpen }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'categories', label: 'Categories', icon: Tag },
    { id: 'hero', label: 'Hero Slides', icon: Image },
  ];

  const handleLogout = () => { logout(); navigate('/admin/login'); };

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
            <div>
              <p className="text-white font-bold font-display text-sm">Shree Ram</p>
              <p className="text-primary-400 text-xs">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {links.map((link) => (
            <button
              key={link.id}
              onClick={() => { setActive(link.id); setSidebarOpen(false); }}
              className={`sidebar-link w-full ${active === link.id ? 'active' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
            >
              <link.icon size={18} />
              {link.label}
            </button>
          ))}
        </nav>

        {/* User */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 mb-2">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
              {user?.name?.[0] || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{user?.name}</p>
              <p className="text-gray-400 text-xs truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="sidebar-link w-full text-red-400 hover:bg-red-500/10 hover:text-red-300"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}

// ───────────────── Image Uploader ─────────────────
function ImageUploader({ onUploaded, existing = [], onDelete }) {
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles) => {
    if (!acceptedFiles.length) return;
    setUploading(true);
    const formData = new FormData();
    acceptedFiles.forEach((f) => formData.append('images', f));
    try {
      const res = await uploadImages(formData);
      toast.success(`${res.data.urls.length} image(s) uploaded!`);
      onUploaded(res.data.urls);
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  }, [onUploaded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.gif'] },
    multiple: true,
    maxSize: 10 * 1024 * 1024,
  });

  return (
    <div className="space-y-3">
      <div {...getRootProps()} className={`upload-zone ${isDragActive ? 'dragover' : ''}`}>
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2">
          <Upload size={32} className="text-primary-400" />
          {uploading ? (
            <p className="text-sm text-gray-500">Uploading...</p>
          ) : isDragActive ? (
            <p className="text-sm text-primary-600 font-medium">Drop images here!</p>
          ) : (
            <>
              <p className="text-sm font-medium text-gray-700">Drag & drop images, or click to browse</p>
              <p className="text-xs text-gray-400">PNG, JPG, WEBP up to 10MB each</p>
            </>
          )}
        </div>
      </div>

      {existing.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {existing.map((img, i) => {
            const src = img.startsWith('http') ? img : img;
            return (
              <div key={i} className="relative group rounded-xl overflow-hidden aspect-square bg-gray-100">
                <img src={src} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => onDelete(img)}
                  className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                >
                  <Trash2 size={16} className="text-white" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ───────────────── Product Modal ─────────────────
function ProductModal({ product, categories, onClose, onSaved }) {
  const isEdit = !!product?._id;
  const [form, setForm] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || '',
    originalPrice: product?.originalPrice || '',
    category: product?.category || '',
    material: product?.material || '',
    dimensions: product?.dimensions || '',
    featured: product?.featured || false,
    inStock: product?.inStock ?? true,
    images: product?.images || [],
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEdit) {
        await updateProduct(product._id, form);
        toast.success('Product updated!');
      } else {
        await createProduct(form);
        toast.success('Product created!');
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Error saving product');
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
        className="modal-content"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="font-display text-xl font-bold text-gray-800">
            {isEdit ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Royal Comfort Sofa" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label>
              <input required type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="45000" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Original Price (₹)</label>
              <input type="number" value={form.originalPrice} onChange={(e) => setForm({ ...form, originalPrice: e.target.value })}
                placeholder="55000" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <select required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input-field">
                <option value="">Select Category</option>
                {categories.map((c) => <option key={c._id} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Material</label>
              <input value={form.material} onChange={(e) => setForm({ ...form, material: e.target.value })}
                placeholder="Teak Wood" className="input-field" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Dimensions</label>
              <input value={form.dimensions} onChange={(e) => setForm({ ...form, dimensions: e.target.value })}
                placeholder="220cm x 90cm x 85cm" className="input-field" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <textarea required rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Describe the product..." className="input-field resize-none" />
            </div>

            <div className="sm:col-span-2 flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                  className="w-4 h-4 accent-primary-600" />
                <span className="text-sm font-medium text-gray-700">Featured Product</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.inStock} onChange={(e) => setForm({ ...form, inStock: e.target.checked })}
                  className="w-4 h-4 accent-primary-600" />
                <span className="text-sm font-medium text-gray-700">In Stock</span>
              </label>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Product Images</label>
              <ImageUploader
                existing={form.images}
                onUploaded={(urls) => setForm({ ...form, images: [...form.images, ...urls] })}
                onDelete={(img) => setForm({ ...form, images: form.images.filter((i) => i !== img) })}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-outline flex-1 justify-center">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center disabled:opacity-70">
              {saving ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</> : <><Check size={16} /> {isEdit ? 'Update Product' : 'Create Product'}</>}
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
    { label: 'Total Products', value: products.length, icon: Package, color: 'from-blue-500 to-indigo-500' },
    { label: 'Categories', value: categories.length, icon: Tag, color: 'from-primary-500 to-wood-mid' },
    { label: 'Hero Slides', value: slides.length, icon: Image, color: 'from-green-500 to-emerald-500' },
    { label: 'Featured', value: products.filter((p) => p.featured).length, icon: Star, color: 'from-amber-500 to-orange-500' },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-gray-800 mb-2">Dashboard</h1>
      <p className="text-gray-500 mb-8">Welcome back! Here's an overview of your store.</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {stats.map((s) => (
          <div key={s.label} className="admin-card">
            <div className={`w-12 h-12 bg-gradient-to-br ${s.color} rounded-xl flex items-center justify-center mb-4`}>
              <s.icon size={22} className="text-white" />
            </div>
            <p className="text-2xl font-bold text-gray-800 font-display">{s.value}</p>
            <p className="text-gray-500 text-sm mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Products */}
      <div className="admin-card">
        <h3 className="font-semibold text-gray-800 mb-4">Recent Products</h3>
        <div className="space-y-3">
          {products.slice(0, 5).map((p) => (
            <div key={p._id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-primary-50 transition-colors">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center text-lg">🪑</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{p.name}</p>
                <p className="text-xs text-gray-400">{p.category}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-primary-600">₹{p.price?.toLocaleString('en-IN')}</p>
                <p className={`text-xs ${p.inStock ? 'text-green-500' : 'text-red-400'}`}>{p.inStock ? 'In Stock' : 'Out of Stock'}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ───────────────── Products Tab ─────────────────
function ProductsTab({ products, categories, onRefresh }) {
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null); // null | 'new' | product object
  const [deleting, setDeleting] = useState(null);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    setDeleting(id);
    try {
      await deleteProduct(id);
      toast.success('Product deleted');
      onRefresh();
    } catch {
      toast.error('Delete failed');
    } finally {
      setDeleting(null);
    }
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-800">Products</h1>
          <p className="text-gray-500 text-sm">{products.length} total products</p>
        </div>
        <button onClick={() => setModal('new')} className="btn-primary">
          <Plus size={18} /> Add Product
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          className="input-field pl-11"
        />
      </div>

      {/* Table */}
      <div className="admin-card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Product', 'Category', 'Price', 'Status', 'Featured', 'Actions'].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400">No products found</td></tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center text-lg overflow-hidden flex-shrink-0">
                          {p.images?.[0] ? (
                            <img src={p.images[0].startsWith('http') ? p.images[0] : p.images[0]} alt="" className="w-full h-full object-cover rounded-lg" onError={(e) => { e.target.style.display='none'; }} />
                          ) : '🪑'}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800 truncate max-w-[180px]">{p.name}</p>
                          <p className="text-xs text-gray-400">{p.material}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs font-medium text-primary-700 bg-primary-50 px-2.5 py-1 rounded-full">{p.category}</span>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm font-bold text-gray-800">₹{p.price?.toLocaleString('en-IN')}</p>
                      {p.originalPrice > p.price && <p className="text-xs text-gray-400 line-through">₹{p.originalPrice?.toLocaleString('en-IN')}</p>}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`badge ${p.inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                        {p.inStock ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {p.featured ? <Star size={16} className="text-amber-400 fill-amber-400" /> : <span className="text-gray-300 text-sm">—</span>}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => setModal(p)} className="p-1.5 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(p._id)}
                          disabled={deleting === p._id}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
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
function CategoriesTab({ categories, onRefresh }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', icon: '🛋️', order: 0 });
  const [saving, setSaving] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createCategory(form);
      toast.success('Category created!');
      setForm({ name: '', description: '', icon: '🛋️', order: 0 });
      setShowForm(false);
      onRefresh();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Error creating category');
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
          <h1 className="font-display text-2xl font-bold text-gray-800">Categories</h1>
          <p className="text-gray-500 text-sm">{categories.length} categories</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          <Plus size={18} /> Add Category
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="admin-card mb-6"
          >
            <h3 className="font-semibold text-gray-800 mb-4">New Category</h3>
            <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Sofa & Seating" className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Icon (emoji)</label>
                <input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })}
                  placeholder="🛋️" className="input-field" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Category description" className="input-field" />
              </div>
              <div className="sm:col-span-2 flex gap-3">
                <button type="button" onClick={() => setShowForm(false)} className="btn-outline">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary disabled:opacity-70">
                  {saving ? 'Saving...' : <><Plus size={16} /> Create</>}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {categories.map((cat) => (
          <div key={cat._id} className="admin-card flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{cat.icon}</span>
              <div>
                <p className="font-semibold text-gray-800">{cat.name}</p>
                <p className="text-xs text-gray-400">{cat.description || 'No description'}</p>
              </div>
            </div>
            <button
              onClick={() => handleDelete(cat._id)}
              className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ───────────────── Hero Slides Tab ─────────────────
function HeroTab({ slides, onRefresh }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', subtitle: '', image: '', ctaText: 'Shop Now', ctaLink: '#products', order: 0, active: true });
  const [saving, setSaving] = useState(false);
  const [uploadedImg, setUploadedImg] = useState([]);

  const handleCreate = async (e) => {
    e.preventDefault();
    const imageUrl = uploadedImg[0] || form.image;
    if (!imageUrl) { toast.error('Please upload or provide an image URL'); return; }
    setSaving(true);
    try {
      await createHeroSlide({ ...form, image: imageUrl });
      toast.success('Hero slide created!');
      setForm({ title: '', subtitle: '', image: '', ctaText: 'Shop Now', ctaLink: '#products', order: 0, active: true });
      setUploadedImg([]);
      setShowForm(false);
      onRefresh();
    } catch {
      toast.error('Error creating slide');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this hero slide?')) return;
    try {
      await deleteHeroSlide(id);
      toast.success('Slide deleted');
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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-800">Hero Slides</h1>
          <p className="text-gray-500 text-sm">{slides.length} slides</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          <Plus size={18} /> Add Slide
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="admin-card mb-6"
          >
            <h3 className="font-semibold text-gray-800 mb-4">New Hero Slide</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="Beautiful Furniture" className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                  <input value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                    placeholder="Subtitle text" className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CTA Button Text</label>
                  <input value={form.ctaText} onChange={(e) => setForm({ ...form, ctaText: e.target.value })}
                    placeholder="Shop Now" className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                  <input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })}
                    className="input-field" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Slide Image *</label>
                <ImageUploader
                  existing={uploadedImg}
                  onUploaded={(urls) => setUploadedImg(urls)}
                  onDelete={() => setUploadedImg([])}
                />
                <p className="text-xs text-gray-400 mt-1">Or enter image URL:</p>
                <input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })}
                  placeholder="https://example.com/image.jpg" className="input-field mt-1" />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowForm(false)} className="btn-outline">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary disabled:opacity-70">
                  {saving ? 'Saving...' : <><Plus size={16} /> Create Slide</>}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {slides.map((slide) => (
          <div key={slide._id} className="admin-card overflow-hidden p-0">
            <div className="relative h-40 overflow-hidden">
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=60'; }}
              />
              <div className="absolute inset-0 bg-charcoal/50" />
              <div className="absolute inset-0 p-4 flex flex-col justify-end">
                <p className="text-white font-bold text-sm">{slide.title}</p>
                <p className="text-white/70 text-xs">{slide.subtitle}</p>
              </div>
            </div>
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`badge ${slide.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {slide.active ? 'Active' : 'Hidden'}
                </span>
                <span className="text-xs text-gray-400">Order: {slide.order}</span>
              </div>
              <div className="flex gap-1">
                <button onClick={() => toggleActive(slide)} className="p-1.5 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors" title={slide.active ? 'Hide' : 'Show'}>
                  {slide.active ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                <button onClick={() => handleDelete(slide._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ───────────────── Main Admin Page ─────────────────
export default function AdminPage() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [active, setActive] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) navigate('/admin/login');
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
    <div className="min-h-screen bg-gray-50 flex">
      <Toaster position="top-right" />
      <Sidebar active={active} setActive={setActive} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu size={20} />
          </button>
          <div className="flex-1 lg:flex-none">
            <h2 className="font-semibold text-gray-800 capitalize text-sm lg:text-base">
              {active === 'dashboard' ? '👋 Good day, Admin!' : active}
            </h2>
          </div>
          <a href="/" target="_blank" className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-medium">
            View Website
            <ArrowUpRight size={16} />
          </a>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 lg:p-8">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin" />
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
                {active === 'products' && <ProductsTab products={products} categories={categories} onRefresh={fetchAll} />}
                {active === 'categories' && <CategoriesTab categories={categories} onRefresh={fetchAll} />}
                {active === 'hero' && <HeroTab slides={slides} onRefresh={fetchAll} />}
              </motion.div>
            </AnimatePresence>
          )}
        </main>
      </div>
    </div>
  );
}
