'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lock,
  LayoutDashboard,
  Package,
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  Loader2,
  Star,
  StarOff,
  Upload,
  Eye,
  LogOut,
  ChevronDown,
  AlertTriangle,
} from 'lucide-react';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadImages,
  formatPrice,
  Product,
} from '@/lib/api';

const CATEGORIES = ['Birthday', 'Wedding', 'Anniversary', 'Corporate', 'Baby Shower', 'Engagement', 'Other'];
const BUDGET_TAGS = ['Pocket', 'Premium', 'Luxury'];

const emptyForm = {
  title: '',
  category: '',
  price: '',
  discount: '0',
  budgetTag: '',
  description: '',
  includes: [''],
  excludes: [''],
  featured: false,
  images: [] as string[],
};

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Check localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('teg_admin_auth');
      if (stored === 'true') setAuthed(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    if (password === 'teg-admin-2024') {
      localStorage.setItem('teg_admin_auth', 'true');
      setAuthed(true);
      setAuthError('');
    } else {
      setAuthError('Incorrect password. Try: teg-admin-2024');
    }
    setAuthLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('teg_admin_auth');
    setAuthed(false);
    setPassword('');
  };

  if (!authed) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-3xl p-8 shadow-[0_24px_64px_rgba(0,0,0,0.2)]">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-dark flex items-center justify-center mx-auto mb-4">
                <Lock className="w-7 h-7 text-gold" />
              </div>
              <h1 className="font-playfair text-2xl font-bold text-dark mb-1">Admin Panel</h1>
              <p className="font-inter text-sm text-dark/50">The Event Gardener — Internal Portal</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-xs font-inter font-medium text-dark/60 uppercase tracking-wide mb-2">
                  Admin Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="w-full px-4 py-3.5 rounded-xl bg-light border border-dark/10 text-dark font-inter text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/50 transition-all"
                  autoFocus
                />
              </div>

              {authError && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-500 text-xs font-inter flex items-center gap-1.5"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {authError}
                </motion.p>
              )}

              <button
                type="submit"
                disabled={authLoading || !password}
                className="w-full flex items-center justify-center gap-2 btn-gold text-dark font-inter font-semibold py-3.5 rounded-xl text-sm disabled:opacity-50"
              >
                {authLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                {authLoading ? 'Verifying...' : 'Sign In'}
              </button>
            </form>

            <p className="text-center text-xs font-inter text-dark/30 mt-6">
              Default password: teg-admin-2024
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return <AdminDashboard onLogout={handleLogout} />;
}

function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [formData, setFormData] = useState({ ...emptyForm });
  const [formLoading, setFormLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await getProducts({ limit: 100 });
      setProducts(res.data);
    } catch (err: any) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openAddForm = () => {
    setEditingProduct(null);
    setFormData({ ...emptyForm });
    setFormError('');
    setShowForm(true);
  };

  const openEditForm = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      title: product.title,
      category: product.category,
      price: String(product.price),
      discount: String(product.discount || 0),
      budgetTag: product.budgetTag,
      description: product.description || '',
      includes: product.includes?.length ? product.includes : [''],
      excludes: product.excludes?.length ? product.excludes : [''],
      featured: product.featured || false,
      images: product.images || [],
    });
    setFormError('');
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p._id !== id));
      setDeleteConfirm(null);
      showSuccess('Product deleted successfully');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleImageUpload = async (files: FileList) => {
    if (!files.length) return;
    setUploadLoading(true);
    try {
      const res = await uploadImages(Array.from(files));
      setFormData((prev) => ({ ...prev, images: [...prev.images, ...res.urls] }));
    } catch (err: any) {
      setFormError('Image upload failed: ' + err.message);
    } finally {
      setUploadLoading(false);
    }
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  const addListItem = (field: 'includes' | 'excludes') => {
    setFormData((prev) => ({ ...prev, [field]: [...prev[field], ''] }));
  };

  const updateListItem = (field: 'includes' | 'excludes', index: number, value: string) => {
    setFormData((prev) => {
      const arr = [...prev[field]];
      arr[index] = value;
      return { ...prev, [field]: arr };
    });
  };

  const removeListItem = (field: 'includes' | 'excludes', index: number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');

    const payload: Partial<Product> = {
      title: formData.title.trim(),
      category: formData.category as Product['category'],
      price: Number(formData.price),
      discount: Number(formData.discount) || 0,
      budgetTag: formData.budgetTag as Product['budgetTag'],
      description: formData.description.trim(),
      includes: formData.includes.filter((i) => i.trim()),
      excludes: formData.excludes.filter((i) => i.trim()),
      featured: formData.featured,
      images: formData.images,
    };

    try {
      if (editingProduct) {
        const res = await updateProduct(editingProduct._id, payload);
        setProducts((prev) => prev.map((p) => (p._id === editingProduct._id ? res.data : p)));
        showSuccess('Product updated successfully');
      } else {
        const res = await createProduct(payload);
        setProducts((prev) => [res.data, ...prev]);
        showSuccess('Product created successfully');
      }
      setShowForm(false);
    } catch (err: any) {
      setFormError(err.message || 'Something went wrong');
    } finally {
      setFormLoading(false);
    }
  };

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  // Stats
  const stats = {
    total: products.length,
    categories: products.map((p) => p.category).filter((v, i, a) => a.indexOf(v) === i).length,
    featured: products.filter((p) => p.featured).length,
  };

  return (
    <div className="min-h-screen bg-light">
      {/* Success Toast */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-green-500 text-white px-5 py-3 rounded-full shadow-lg font-inter text-sm"
          >
            <Check className="w-4 h-4" />
            {successMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Admin Header */}
      <div className="bg-dark border-b border-white/10 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="w-5 h-5 text-gold" />
            <h1 className="font-playfair text-lg font-semibold text-white">Admin Dashboard</h1>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 text-white/40 hover:text-white text-xs font-inter transition-colors px-3 py-1.5 rounded-lg hover:bg-white/10"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Products', value: stats.total, icon: Package, color: 'bg-primary/10 text-primary' },
            { label: 'Categories', value: stats.categories, icon: LayoutDashboard, color: 'bg-gold/10 text-gold' },
            { label: 'Featured', value: stats.featured, icon: Star, color: 'bg-yellow-50 text-yellow-600' },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="bg-white rounded-2xl p-5 shadow-luxury">
                <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
                  <Icon className="w-5 h-5" />
                </div>
                <p className="font-playfair text-2xl font-bold text-dark">{stat.value}</p>
                <p className="font-inter text-xs text-dark/50 mt-0.5">{stat.label}</p>
              </div>
            );
          })}
        </div>

        {/* Products Section */}
        <div className="bg-white rounded-3xl shadow-luxury overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-dark/5">
            <h2 className="font-playfair text-xl font-semibold text-dark">Products</h2>
            <button
              onClick={openAddForm}
              className="flex items-center gap-2 btn-gold text-dark font-inter font-medium text-sm px-4 py-2.5 rounded-xl"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16">
              <Package className="w-12 h-12 text-dark/20 mx-auto mb-4" />
              <p className="font-inter text-dark/50 mb-4">No products yet</p>
              <button onClick={openAddForm} className="text-primary font-inter text-sm hover:underline">
                Add your first product
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-dark/5">
                    <th className="text-left px-6 py-3 text-xs font-inter font-semibold text-dark/40 uppercase tracking-wide">Product</th>
                    <th className="text-left px-4 py-3 text-xs font-inter font-semibold text-dark/40 uppercase tracking-wide hidden md:table-cell">Category</th>
                    <th className="text-left px-4 py-3 text-xs font-inter font-semibold text-dark/40 uppercase tracking-wide">Price</th>
                    <th className="text-left px-4 py-3 text-xs font-inter font-semibold text-dark/40 uppercase tracking-wide hidden lg:table-cell">Tag</th>
                    <th className="text-center px-4 py-3 text-xs font-inter font-semibold text-dark/40 uppercase tracking-wide hidden lg:table-cell">Featured</th>
                    <th className="text-right px-6 py-3 text-xs font-inter font-semibold text-dark/40 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product, i) => (
                    <motion.tr
                      key={product._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b border-dark/5 hover:bg-light/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {product.images?.[0] && (
                            <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 relative">
                              <Image src={product.images[0]} alt={product.title} fill className="object-cover" sizes="40px" />
                            </div>
                          )}
                          <div>
                            <p className="font-inter font-medium text-dark text-sm line-clamp-1">{product.title}</p>
                            <p className="font-inter text-xs text-dark/40">{product.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 hidden md:table-cell">
                        <span className="font-inter text-xs text-dark/60 bg-light px-2.5 py-1 rounded-full">{product.category}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="font-inter font-semibold text-sm text-gold">{formatPrice(product.price)}</span>
                        {product.discount > 0 && (
                          <span className="font-inter text-xs text-green-600 ml-1.5">-{product.discount}%</span>
                        )}
                      </td>
                      <td className="px-4 py-4 hidden lg:table-cell">
                        <span className={`text-xs font-inter px-2.5 py-1 rounded-full ${
                          product.budgetTag === 'Luxury' ? 'bg-gold/10 text-gold' :
                          product.budgetTag === 'Premium' ? 'bg-blue-50 text-blue-600' :
                          'bg-green-50 text-green-600'
                        }`}>
                          {product.budgetTag}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center hidden lg:table-cell">
                        {product.featured ? (
                          <Star className="w-4 h-4 text-gold fill-gold mx-auto" />
                        ) : (
                          <StarOff className="w-4 h-4 text-dark/20 mx-auto" />
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <a
                            href={`/product/${product.slug || product._id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg text-dark/30 hover:text-primary hover:bg-primary/10 transition-all"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </a>
                          <button
                            onClick={() => openEditForm(product)}
                            className="p-1.5 rounded-lg text-dark/30 hover:text-gold hover:bg-gold/10 transition-all"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(product._id)}
                            className="p-1.5 rounded-lg text-dark/30 hover:text-red-500 hover:bg-red-50 transition-all"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-dark/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="font-playfair text-xl font-semibold text-dark mb-2">Delete Product?</h3>
              <p className="font-inter text-sm text-dark/60 mb-6">
                This action cannot be undone. The product will be permanently removed.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-3 rounded-xl border border-dark/10 font-inter text-sm text-dark/60 hover:bg-light transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-inter font-medium text-sm transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add/Edit Product Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-dark/60 backdrop-blur-sm z-50 flex items-start justify-center p-4 pt-20 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-3xl w-full max-w-2xl shadow-xl mb-8"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Form Header */}
              <div className="flex items-center justify-between px-7 py-5 border-b border-dark/10">
                <h2 className="font-playfair text-xl font-semibold text-dark">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="p-2 rounded-xl text-dark/30 hover:text-dark hover:bg-light transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-7 space-y-6">
                {formError && (
                  <div className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-inter">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    {formError}
                  </div>
                )}

                {/* Title */}
                <div>
                  <label className="block text-xs font-inter font-semibold text-dark/60 uppercase tracking-wide mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Royal Garden Birthday Extravaganza"
                    className="w-full px-4 py-3 rounded-xl bg-light border border-dark/10 text-dark font-inter text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/50 transition-all"
                  />
                </div>

                {/* Category + Budget Tag */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-inter font-semibold text-dark/60 uppercase tracking-wide mb-2">
                      Category *
                    </label>
                    <select
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-light border border-dark/10 text-dark font-inter text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/50 transition-all appearance-none cursor-pointer"
                    >
                      <option value="">Select...</option>
                      {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-inter font-semibold text-dark/60 uppercase tracking-wide mb-2">
                      Budget Tag *
                    </label>
                    <select
                      required
                      value={formData.budgetTag}
                      onChange={(e) => setFormData({ ...formData, budgetTag: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-light border border-dark/10 text-dark font-inter text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/50 transition-all appearance-none cursor-pointer"
                    >
                      <option value="">Select...</option>
                      {BUDGET_TAGS.map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                </div>

                {/* Price + Discount */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-inter font-semibold text-dark/60 uppercase tracking-wide mb-2">
                      Price (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="e.g. 85000"
                      className="w-full px-4 py-3 rounded-xl bg-light border border-dark/10 text-dark font-inter text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/50 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-inter font-semibold text-dark/60 uppercase tracking-wide mb-2">
                      Discount (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.discount}
                      onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                      placeholder="0"
                      className="w-full px-4 py-3 rounded-xl bg-light border border-dark/10 text-dark font-inter text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/50 transition-all"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-inter font-semibold text-dark/60 uppercase tracking-wide mb-2">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe this event setup..."
                    className="w-full px-4 py-3 rounded-xl bg-light border border-dark/10 text-dark font-inter text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/50 transition-all resize-none"
                  />
                </div>

                {/* Includes */}
                <div>
                  <label className="block text-xs font-inter font-semibold text-dark/60 uppercase tracking-wide mb-2">
                    Package Includes
                  </label>
                  <div className="space-y-2">
                    {formData.includes.map((item, i) => (
                      <div key={i} className="flex gap-2">
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => updateListItem('includes', i, e.target.value)}
                          placeholder={`Include item ${i + 1}`}
                          className="flex-1 px-4 py-2.5 rounded-xl bg-light border border-dark/10 text-dark font-inter text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/50 transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => removeListItem('includes', i)}
                          className="p-2.5 rounded-xl text-dark/30 hover:text-red-500 hover:bg-red-50 transition-all"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => addListItem('includes')}
                    className="mt-2 flex items-center gap-1.5 text-xs font-inter text-primary hover:text-dark transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add item
                  </button>
                </div>

                {/* Excludes */}
                <div>
                  <label className="block text-xs font-inter font-semibold text-dark/60 uppercase tracking-wide mb-2">
                    What&apos;s Excluded
                  </label>
                  <div className="space-y-2">
                    {formData.excludes.map((item, i) => (
                      <div key={i} className="flex gap-2">
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => updateListItem('excludes', i, e.target.value)}
                          placeholder={`Exclude item ${i + 1}`}
                          className="flex-1 px-4 py-2.5 rounded-xl bg-light border border-dark/10 text-dark font-inter text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/50 transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => removeListItem('excludes', i)}
                          className="p-2.5 rounded-xl text-dark/30 hover:text-red-500 hover:bg-red-50 transition-all"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => addListItem('excludes')}
                    className="mt-2 flex items-center gap-1.5 text-xs font-inter text-primary hover:text-dark transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add item
                  </button>
                </div>

                {/* Images */}
                <div>
                  <label className="block text-xs font-inter font-semibold text-dark/60 uppercase tracking-wide mb-2">
                    Images
                  </label>

                  {/* Image Previews */}
                  {formData.images.length > 0 && (
                    <div className="flex flex-wrap gap-3 mb-3">
                      {formData.images.map((url, i) => (
                        <div key={i} className="relative group">
                          <div className="w-20 h-20 rounded-xl overflow-hidden border border-dark/10 relative">
                            <Image src={url} alt={`Image ${i + 1}`} fill className="object-cover" sizes="80px" />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeImage(i)}
                            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                          >
                            <X className="w-3 h-3 text-white" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Upload Button */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadLoading}
                    className="flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-dark/15 text-dark/50 hover:border-gold/40 hover:text-gold font-inter text-sm transition-all w-full justify-center"
                  >
                    {uploadLoading ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</>
                    ) : (
                      <><Upload className="w-4 h-4" /> Upload Images (requires Cloudinary setup)</>
                    )}
                  </button>
                  <p className="text-xs font-inter text-dark/40 mt-1.5">
                    Or paste image URL directly in the includes field. Max 10 images.
                  </p>
                </div>

                {/* Featured Toggle */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-light border border-dark/5">
                  <div>
                    <p className="font-inter font-medium text-sm text-dark">Featured Product</p>
                    <p className="font-inter text-xs text-dark/50">Show on homepage highlights</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, featured: !formData.featured })}
                    className={`w-11 h-6 rounded-full transition-all duration-300 relative ${
                      formData.featured ? 'bg-gold' : 'bg-dark/20'
                    }`}
                  >
                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-300 ${
                      formData.featured ? 'left-5.5 translate-x-0.5' : 'left-0.5'
                    }`} style={{ left: formData.featured ? '22px' : '2px' }} />
                  </button>
                </div>

                {/* Submit */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 py-3.5 rounded-xl border border-dark/10 font-inter text-sm text-dark/60 hover:bg-light transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="flex-1 flex items-center justify-center gap-2 btn-gold text-dark font-inter font-semibold py-3.5 rounded-xl text-sm disabled:opacity-60"
                  >
                    {formLoading ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                    ) : (
                      <><Check className="w-4 h-4" /> {editingProduct ? 'Update Product' : 'Create Product'}</>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
