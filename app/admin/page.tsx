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
  AlertTriangle,
  Tag,
  ImagePlus,
  Copy,
  Calendar,
  MapPin,
  Clock,
  Zap,
  Theater,
} from 'lucide-react';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadImages,
  formatPrice,
  Product,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  Category,
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  Event,
} from '@/lib/api';
import { GENDER_OPTIONS, BUDGET_TAGS } from '@/lib/categories';

const emptyForm = {
  title: '',
  section: '',
  category: '',
  subCategory: '',
  gender: 'Unisex' as string,
  price: '',
  discount: '0',
  budgetTag: '',
  description: '',
  includes: [''],
  excludes: [''],
  featured: false,
  images: [] as string[],
};

// ── Auth screen ────────────────────────────────────────────────────────────
export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('teg_admin_auth') === 'true') setAuthed(true);
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
                <label className="block text-xs font-inter font-medium text-dark/60 uppercase tracking-wide mb-2">Admin Password</label>
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
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-xs font-inter flex items-center gap-1.5">
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
            <p className="text-center text-xs font-inter text-dark/30 mt-6">Default password: teg-admin-2024</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return <AdminDashboard onLogout={handleLogout} />;
}

// ── Dashboard ──────────────────────────────────────────────────────────────
const SECTIONS_LIST = ['Social & Home Celebrations', 'Signature Events'] as const;
const ACCENT_PRESETS = ['#C6A769', '#e879f9', '#f87171', '#86efac', '#c4b5fd', '#c084fc', '#f472b6', '#60a5fa', '#fbbf24', '#fb923c', '#a78bfa'];

const emptyCatForm = {
  name: '',
  section: 'Social & Home Celebrations' as string,
  subCategories: [''] as string[],
  tagline: '',
  detail: '',
  accent: '#C6A769',
  image: null as string | null,
};

const emptyEventForm = {
  title: '',
  description: '',
  startDate: '',
  endDate: '',
  time: '',
  duration: '',
  ageLimit: '',
  language: '',
  genre: '',
  venue: '',
  otherVenues: [''] as string[],
  price: '',
  tags: [''] as string[],
  featured: false,
  fillingFast: false,
  images: [] as string[],
};

function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'events'>('products');

  // Products state
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

  // Categories state
  const [categories, setCategories] = useState<Category[]>([]);
  const [catsLoading, setCatsLoading] = useState(true);
  const [showCatForm, setShowCatForm] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [catFormData, setCatFormData] = useState({ ...emptyCatForm });
  const [catFormLoading, setCatFormLoading] = useState(false);
  const [catUploadLoading, setCatUploadLoading] = useState(false);
  const [catFormError, setCatFormError] = useState('');
  const [deleteCatConfirm, setDeleteCatConfirm] = useState<string | null>(null);
  const catFileInputRef = useRef<HTMLInputElement>(null);

  // Events state
  const [events, setEvents] = useState<Event[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [deleteEventConfirm, setDeleteEventConfirm] = useState<string | null>(null);
  const [eventFormData, setEventFormData] = useState({ ...emptyEventForm });
  const [eventFormLoading, setEventFormLoading] = useState(false);
  const [eventUploadLoading, setEventUploadLoading] = useState(false);
  const [eventFormError, setEventFormError] = useState('');
  const eventFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchProducts(); fetchCategories(); fetchEventsData(); }, []);

  useEffect(() => {
    const open = showForm || !!deleteConfirm || showCatForm || !!deleteCatConfirm || showEventForm || !!deleteEventConfirm;
    document.documentElement.style.overflow = open ? 'hidden' : '';
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    };
  }, [showForm, deleteConfirm, showCatForm, deleteCatConfirm, showEventForm, deleteEventConfirm]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await getProducts({ limit: 500 });
      setProducts(res.data);
    } catch (err: any) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const fetchCategories = async () => {
    setCatsLoading(true);
    try {
      const res = await getCategories();
      setCategories(res.data);
    } catch (err: any) {
      console.error(err.message);
    } finally {
      setCatsLoading(false);
    }
  };

  const fetchEventsData = async () => {
    setEventsLoading(true);
    try {
      const res = await getEvents({ limit: 500 });
      setEvents(res.data);
    } catch (err: any) {
      console.error(err.message);
    } finally {
      setEventsLoading(false);
    }
  };

  const openAddEventForm = () => {
    setEditingEvent(null);
    setEventFormData({ ...emptyEventForm });
    setEventFormError('');
    setShowEventForm(true);
  };

  const openEditEventForm = (ev: Event) => {
    setEditingEvent(ev);
    setEventFormData({
      title: ev.title,
      description: ev.description || '',
      startDate: ev.startDate || '',
      endDate: ev.endDate || '',
      time: ev.time || '',
      duration: ev.duration || '',
      ageLimit: ev.ageLimit || '',
      language: ev.language || '',
      genre: ev.genre || '',
      venue: ev.venue || '',
      otherVenues: ev.otherVenues?.length ? ev.otherVenues : [''],
      price: String(ev.price),
      tags: ev.tags?.length ? ev.tags : [''],
      featured: ev.featured || false,
      fillingFast: ev.fillingFast || false,
      images: ev.images || [],
    });
    setEventFormError('');
    setShowEventForm(true);
  };

  const handleEventImageUpload = async (files: FileList) => {
    if (!files.length) return;
    setEventUploadLoading(true);
    try {
      const res = await uploadImages(Array.from(files));
      setEventFormData((prev) => ({ ...prev, images: [...prev.images, ...res.urls] }));
    } catch (err: any) {
      setEventFormError('Image upload failed: ' + err.message);
    } finally {
      setEventUploadLoading(false);
    }
  };

  const removeEventImage = (index: number) =>
    setEventFormData((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));

  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEventFormLoading(true);
    setEventFormError('');
    const payload: Partial<Event> = {
      title: eventFormData.title.trim(),
      description: eventFormData.description.trim(),
      startDate: eventFormData.startDate.trim(),
      endDate: eventFormData.endDate.trim() || undefined,
      time: eventFormData.time.trim(),
      duration: eventFormData.duration.trim(),
      ageLimit: eventFormData.ageLimit.trim(),
      language: eventFormData.language.trim(),
      genre: eventFormData.genre.trim(),
      venue: eventFormData.venue.trim(),
      otherVenues: eventFormData.otherVenues.filter((v) => v.trim()),
      price: Number(eventFormData.price),
      tags: eventFormData.tags.filter((t) => t.trim()),
      featured: eventFormData.featured,
      fillingFast: eventFormData.fillingFast,
      images: eventFormData.images,
    };
    try {
      if (editingEvent) {
        const res = await updateEvent(editingEvent._id, payload);
        setEvents((prev) => prev.map((ev) => (ev._id === editingEvent._id ? res.data : ev)));
        showSuccess('Event updated successfully');
      } else {
        const res = await createEvent(payload);
        setEvents((prev) => [res.data, ...prev]);
        showSuccess('Event created successfully');
      }
      setShowEventForm(false);
    } catch (err: any) {
      setEventFormError(err.message || 'Something went wrong');
    } finally {
      setEventFormLoading(false);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      await deleteEvent(id);
      setEvents((prev) => prev.filter((ev) => ev._id !== id));
      setDeleteEventConfirm(null);
      showSuccess('Event deleted successfully');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const openAddCatForm = () => {
    setEditingCat(null);
    setCatFormData({ ...emptyCatForm });
    setCatFormError('');
    setShowCatForm(true);
  };

  const openEditCatForm = (cat: Category) => {
    setEditingCat(cat);
    setCatFormData({
      name: cat.name,
      section: cat.section,
      subCategories: cat.subCategories.length ? cat.subCategories : [''],
      tagline: cat.tagline || '',
      detail: cat.detail || '',
      accent: cat.accent || '#C6A769',
      image: cat.image || null,
    });
    setCatFormError('');
    setShowCatForm(true);
  };

  const handleCatImageUpload = async (files: FileList) => {
    if (!files.length) return;
    setCatUploadLoading(true);
    try {
      const res = await uploadImages([files[0]]);
      setCatFormData((prev) => ({ ...prev, image: res.urls[0] }));
    } catch (err: any) {
      setCatFormError('Image upload failed: ' + err.message);
    } finally {
      setCatUploadLoading(false);
    }
  };

  const handleCatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCatFormLoading(true);
    setCatFormError('');
    const payload = {
      name: catFormData.name.trim(),
      section: catFormData.section as Category['section'],
      subCategories: catFormData.subCategories.filter((s) => s.trim()),
      tagline: catFormData.tagline.trim(),
      detail: catFormData.detail.trim(),
      accent: catFormData.accent,
      image: catFormData.image || null,
    };
    try {
      if (editingCat) {
        const res = await updateCategory(editingCat._id, payload);
        setCategories((prev) => prev.map((c) => (c._id === editingCat._id ? res.data : c)));
        showSuccess('Category updated');
      } else {
        const res = await createCategory(payload);
        setCategories((prev) => [...prev, res.data]);
        showSuccess('Category created');
      }
      setShowCatForm(false);
    } catch (err: any) {
      setCatFormError(err.message || 'Something went wrong');
    } finally {
      setCatFormLoading(false);
    }
  };

  const handleDeleteCat = async (id: string) => {
    try {
      await deleteCategory(id);
      setCategories((prev) => prev.filter((c) => c._id !== id));
      setDeleteCatConfirm(null);
      showSuccess('Category deleted');
    } catch (err: any) {
      alert(err.message);
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
      section: product.section || '',
      category: product.category,
      subCategory: product.subCategory || '',
      gender: product.gender || 'Unisex',
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

  const openDuplicateForm = (product: Product) => {
    setEditingProduct(null);
    setFormData({
      title: product.title + ' (Copy)',
      section: product.section || '',
      category: product.category,
      subCategory: product.subCategory || '',
      gender: product.gender || 'Unisex',
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

  const removeImage = (index: number) =>
    setFormData((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));

  const addListItem = (field: 'includes' | 'excludes') =>
    setFormData((prev) => ({ ...prev, [field]: [...prev[field], ''] }));

  const updateListItem = (field: 'includes' | 'excludes', index: number, value: string) =>
    setFormData((prev) => { const arr = [...prev[field]]; arr[index] = value; return { ...prev, [field]: arr }; });

  const removeListItem = (field: 'includes' | 'excludes', index: number) =>
    setFormData((prev) => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');
    const payload: Partial<Product> = {
      title: formData.title.trim(),
      section: formData.section as Product['section'] || undefined,
      category: formData.category,
      subCategory: formData.subCategory || undefined,
      gender: formData.gender as Product['gender'],
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

  const stats = {
    total: products.length,
    sections: products.filter((p) => p.section).map((p) => p.section).filter((v, i, a) => a.indexOf(v) === i).length,
    featured: products.filter((p) => p.featured).length,
  };

  // Dynamic categories from DB
  const availableCategories = formData.section
    ? categories.filter((c) => c.section === formData.section).map((c) => c.name)
    : categories.map((c) => c.name);

  const availableSubCategories = categories.find((c) => c.name === formData.category)?.subCategories || [];

  return (
    <div className="min-h-screen bg-light">
      {/* Toast */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-green-500 text-white px-5 py-3 rounded-full shadow-lg font-inter text-sm"
          >
            <Check className="w-4 h-4" />
            {successMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="bg-dark border-b border-white/10 sticky top-0 z-30">
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

        {/* Tab switcher */}
        <div className="flex items-center gap-1 bg-white rounded-2xl p-1 shadow-luxury mb-8 w-fit">
          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-inter text-sm font-medium transition-all duration-300 ${activeTab === 'products' ? 'bg-dark text-white shadow-sm' : 'text-dark/50 hover:text-dark'}`}
          >
            <Package className="w-4 h-4" />
            Products
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-inter text-sm font-medium transition-all duration-300 ${activeTab === 'categories' ? 'bg-dark text-white shadow-sm' : 'text-dark/50 hover:text-dark'}`}
          >
            <Tag className="w-4 h-4" />
            Categories
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-inter text-sm font-medium transition-all duration-300 ${activeTab === 'events' ? 'bg-dark text-white shadow-sm' : 'text-dark/50 hover:text-dark'}`}
          >
            <Calendar className="w-4 h-4" />
            Events
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6 sm:mb-8">
          {[
            { label: 'Total Products', value: stats.total, icon: Package, color: 'bg-primary/10 text-primary' },
            { label: 'Sections Active', value: stats.sections, icon: LayoutDashboard, color: 'bg-gold/10 text-gold' },
            { label: 'Featured', value: stats.featured, icon: Star, color: 'bg-yellow-50 text-yellow-600' },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-luxury">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl ${stat.color} flex items-center justify-center mb-2 sm:mb-3`}>
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <p className="font-playfair text-xl sm:text-2xl font-bold text-dark">{stat.value}</p>
                <p className="font-inter text-[10px] sm:text-xs text-dark/50 mt-0.5 leading-tight">{stat.label}</p>
              </div>
            );
          })}
        </div>

        {/* Products table */}
        {activeTab === 'products' && <div className="bg-white rounded-3xl shadow-luxury overflow-hidden">
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
              <button onClick={openAddForm} className="text-primary font-inter text-sm hover:underline">Add your first product</button>
            </div>
          ) : (
            <>
              {/* Mobile card list */}
              <div className="md:hidden divide-y divide-dark/5">
                {products.map((product, i) => (
                  <motion.div key={product._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="flex items-center gap-3 px-4 py-3">
                    {product.images?.[0] ? (
                      <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 relative">
                        <Image src={product.images[0]} alt={product.title} fill className="object-cover" sizes="48px" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-light shrink-0 flex items-center justify-center">
                        <Package className="w-5 h-5 text-dark/20" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-inter font-semibold text-dark text-sm line-clamp-1">{product.title}</p>
                      <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                        <span className="font-inter text-[10px] text-dark/50 bg-light px-2 py-0.5 rounded-full">{product.category}</span>
                        {product.featured && <Star className="w-3 h-3 text-gold fill-gold" />}
                      </div>
                      <p className="font-playfair font-bold text-gold text-sm mt-1">
                        {formatPrice(product.price)}
                        {product.discount > 0 && <span className="font-inter text-[10px] text-green-600 font-normal ml-1">-{product.discount}%</span>}
                      </p>
                    </div>
                    <div className="flex items-center gap-0.5 shrink-0">
                      <button onClick={() => openDuplicateForm(product)} className="p-2 rounded-lg text-dark/25 hover:text-primary hover:bg-primary/10 transition-all" title="Duplicate"><Copy className="w-3.5 h-3.5" /></button>
                      <button onClick={() => openEditForm(product)} className="p-2 rounded-lg text-dark/25 hover:text-gold hover:bg-gold/10 transition-all"><Pencil className="w-3.5 h-3.5" /></button>
                      <button onClick={() => setDeleteConfirm(product._id)} className="p-2 rounded-lg text-dark/25 hover:text-red-500 hover:bg-red-50 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-dark/5">
                      <th className="text-left px-6 py-3 text-xs font-inter font-semibold text-dark/40 uppercase tracking-wide">Product</th>
                      <th className="text-left px-4 py-3 text-xs font-inter font-semibold text-dark/40 uppercase tracking-wide">Category</th>
                      <th className="text-left px-4 py-3 text-xs font-inter font-semibold text-dark/40 uppercase tracking-wide hidden lg:table-cell">Section</th>
                      <th className="text-left px-4 py-3 text-xs font-inter font-semibold text-dark/40 uppercase tracking-wide">Price</th>
                      <th className="text-left px-4 py-3 text-xs font-inter font-semibold text-dark/40 uppercase tracking-wide hidden lg:table-cell">Tag</th>
                      <th className="text-center px-4 py-3 text-xs font-inter font-semibold text-dark/40 uppercase tracking-wide hidden lg:table-cell">Featured</th>
                      <th className="text-right px-6 py-3 text-xs font-inter font-semibold text-dark/40 uppercase tracking-wide">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product, i) => (
                      <motion.tr key={product._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="border-b border-dark/5 hover:bg-light/50 transition-colors">
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
                        <td className="px-4 py-4">
                          <span className="font-inter text-xs text-dark/70 bg-light px-2.5 py-1 rounded-full">{product.category}</span>
                          {product.subCategory && <p className="font-inter text-[10px] text-dark/35 mt-1 pl-0.5">{product.subCategory}</p>}
                        </td>
                        <td className="px-4 py-4 hidden lg:table-cell">
                          {product.section ? (
                            <span className={`font-inter text-[10px] px-2 py-1 rounded-full ${product.section === 'Signature Events' ? 'bg-gold/10 text-gold' : 'bg-primary/10 text-primary'}`}>
                              {product.section === 'Signature Events' ? 'Signature' : 'Social'}
                            </span>
                          ) : <span className="font-inter text-[10px] text-dark/30">—</span>}
                        </td>
                        <td className="px-4 py-4">
                          <span className="font-inter font-semibold text-sm text-gold">{formatPrice(product.price)}</span>
                          {product.discount > 0 && <span className="font-inter text-xs text-green-600 ml-1.5">-{product.discount}%</span>}
                        </td>
                        <td className="px-4 py-4 hidden lg:table-cell">
                          <span className={`text-xs font-inter px-2.5 py-1 rounded-full ${product.budgetTag === 'Luxury' ? 'bg-gold/10 text-gold' : product.budgetTag === 'Premium' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>{product.budgetTag}</span>
                        </td>
                        <td className="px-4 py-4 text-center hidden lg:table-cell">
                          {product.featured ? <Star className="w-4 h-4 text-gold fill-gold mx-auto" /> : <StarOff className="w-4 h-4 text-dark/20 mx-auto" />}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <a href={`/product/${product.slug || product._id}`} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg text-dark/30 hover:text-primary hover:bg-primary/10 transition-all"><Eye className="w-4 h-4" /></a>
                            <button onClick={() => openDuplicateForm(product)} className="p-1.5 rounded-lg text-dark/30 hover:text-primary hover:bg-primary/10 transition-all" title="Duplicate"><Copy className="w-4 h-4" /></button>
                            <button onClick={() => openEditForm(product)} className="p-1.5 rounded-lg text-dark/30 hover:text-gold hover:bg-gold/10 transition-all"><Pencil className="w-4 h-4" /></button>
                            <button onClick={() => setDeleteConfirm(product._id)} className="p-1.5 rounded-lg text-dark/30 hover:text-red-500 hover:bg-red-50 transition-all"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>}

        {/* Events tab */}
        {activeTab === 'events' && (
          <div className="bg-white rounded-3xl shadow-luxury overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-dark/5">
              <h2 className="font-playfair text-xl font-semibold text-dark">Events</h2>
              <button
                onClick={openAddEventForm}
                className="flex items-center gap-2 btn-gold text-dark font-inter font-medium text-sm px-4 py-2.5 rounded-xl"
              >
                <Plus className="w-4 h-4" />
                Add Event
              </button>
            </div>

            {eventsLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-16">
                <Calendar className="w-12 h-12 text-dark/20 mx-auto mb-4" />
                <p className="font-inter text-dark/50 mb-4">No events yet</p>
                <button onClick={openAddEventForm} className="text-primary font-inter text-sm hover:underline">Add your first event</button>
              </div>
            ) : (
              <>
                {/* Mobile list */}
                <div className="md:hidden divide-y divide-dark/5">
                  {events.map((ev, i) => (
                    <motion.div key={ev._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="flex items-center gap-3 px-4 py-3">
                      {ev.images?.[0] ? (
                        <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 relative">
                          <Image src={ev.images[0]} alt={ev.title} fill className="object-cover" sizes="48px" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-light shrink-0 flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-dark/20" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-inter font-semibold text-dark text-sm line-clamp-1">{ev.title}</p>
                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                          {ev.genre && <span className="font-inter text-[10px] text-dark/50 bg-light px-2 py-0.5 rounded-full">{ev.genre}</span>}
                          {ev.featured && <Star className="w-3 h-3 text-gold fill-gold" />}
                          {ev.fillingFast && <Zap className="w-3 h-3 text-red-500 fill-red-500" />}
                        </div>
                        <p className="font-playfair font-bold text-gold text-sm mt-1">{formatPrice(ev.price)} <span className="font-inter font-normal text-[10px] text-dark/40">onwards</span></p>
                      </div>
                      <div className="flex items-center gap-0.5 shrink-0">
                        <button onClick={() => openEditEventForm(ev)} className="p-2 rounded-lg text-dark/25 hover:text-gold hover:bg-gold/10 transition-all"><Pencil className="w-3.5 h-3.5" /></button>
                        <button onClick={() => setDeleteEventConfirm(ev._id)} className="p-2 rounded-lg text-dark/25 hover:text-red-500 hover:bg-red-50 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Desktop table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-dark/5">
                        <th className="text-left px-6 py-3 text-xs font-inter font-semibold text-dark/40 uppercase tracking-wide">Event</th>
                        <th className="text-left px-4 py-3 text-xs font-inter font-semibold text-dark/40 uppercase tracking-wide hidden lg:table-cell">Date</th>
                        <th className="text-left px-4 py-3 text-xs font-inter font-semibold text-dark/40 uppercase tracking-wide">Venue</th>
                        <th className="text-left px-4 py-3 text-xs font-inter font-semibold text-dark/40 uppercase tracking-wide">Price</th>
                        <th className="text-left px-4 py-3 text-xs font-inter font-semibold text-dark/40 uppercase tracking-wide hidden lg:table-cell">Genre</th>
                        <th className="text-center px-4 py-3 text-xs font-inter font-semibold text-dark/40 uppercase tracking-wide hidden lg:table-cell">Status</th>
                        <th className="text-right px-6 py-3 text-xs font-inter font-semibold text-dark/40 uppercase tracking-wide">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {events.map((ev, i) => (
                        <motion.tr key={ev._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="border-b border-dark/5 hover:bg-light/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {ev.images?.[0] ? (
                                <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 relative">
                                  <Image src={ev.images[0]} alt={ev.title} fill className="object-cover" sizes="40px" />
                                </div>
                              ) : (
                                <div className="w-10 h-10 rounded-lg bg-light shrink-0 flex items-center justify-center">
                                  <Calendar className="w-4 h-4 text-dark/20" />
                                </div>
                              )}
                              <div>
                                <p className="font-inter font-medium text-dark text-sm line-clamp-1">{ev.title}</p>
                                <p className="font-inter text-xs text-dark/40">{ev.slug}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 hidden lg:table-cell">
                            <span className="font-inter text-xs text-dark/70">{ev.startDate || '—'}</span>
                            {ev.time && <p className="font-inter text-[10px] text-dark/40 mt-0.5">{ev.time}</p>}
                          </td>
                          <td className="px-4 py-4">
                            <span className="font-inter text-xs text-dark/70 line-clamp-1 max-w-[160px] block">{ev.venue || '—'}</span>
                          </td>
                          <td className="px-4 py-4">
                            <span className="font-inter font-semibold text-sm text-gold">{formatPrice(ev.price)}</span>
                            <span className="font-inter text-[10px] text-dark/40 ml-1">onwards</span>
                          </td>
                          <td className="px-4 py-4 hidden lg:table-cell">
                            {ev.genre ? (
                              <span className="font-inter text-xs px-2.5 py-1 rounded-full bg-dark/5 text-dark/60">{ev.genre}</span>
                            ) : <span className="text-dark/30">—</span>}
                          </td>
                          <td className="px-4 py-4 text-center hidden lg:table-cell">
                            <div className="flex items-center justify-center gap-1.5">
                              {ev.featured && <Star className="w-4 h-4 text-gold fill-gold" title="Featured" />}
                              {ev.fillingFast && <Zap className="w-4 h-4 text-red-500 fill-red-500" title="Filling Fast" />}
                              {!ev.featured && !ev.fillingFast && <span className="text-dark/20 text-xs">—</span>}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <a href={`/events/${ev.slug || ev._id}`} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg text-dark/30 hover:text-primary hover:bg-primary/10 transition-all"><Eye className="w-4 h-4" /></a>
                              <button onClick={() => openEditEventForm(ev)} className="p-1.5 rounded-lg text-dark/30 hover:text-gold hover:bg-gold/10 transition-all"><Pencil className="w-4 h-4" /></button>
                              <button onClick={() => setDeleteEventConfirm(ev._id)} className="p-1.5 rounded-lg text-dark/30 hover:text-red-500 hover:bg-red-50 transition-all"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {/* Categories tab */}
        {activeTab === 'categories' && (
          <div className="bg-white rounded-3xl shadow-luxury overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-dark/5">
              <h2 className="font-playfair text-xl font-semibold text-dark">Categories</h2>
              <button onClick={openAddCatForm} className="flex items-center gap-2 btn-gold text-dark font-inter font-medium text-sm px-4 py-2.5 rounded-xl">
                <Plus className="w-4 h-4" />
                Add Category
              </button>
            </div>
            {catsLoading ? (
              <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>
            ) : (
              <div className="divide-y divide-dark/5">
                {(['Social & Home Celebrations', 'Signature Events'] as const).map((section) => {
                  const sectionCats = categories.filter((c) => c.section === section);
                  return (
                    <div key={section}>
                      <div className="px-6 py-3 bg-light/60">
                        <p className="font-inter text-xs font-semibold text-dark/40 uppercase tracking-wider">{section}</p>
                      </div>
                      {sectionCats.length === 0 ? (
                        <p className="px-6 py-4 font-inter text-sm text-dark/30">No categories yet</p>
                      ) : (
                        sectionCats.map((cat) => (
                          <div key={cat._id} className="flex items-center gap-4 px-6 py-4 hover:bg-light/40 transition-colors">
                            <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 relative bg-dark/5">
                              {cat.image ? (
                                <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${cat.gradientFrom}, ${cat.gradientTo})` }}>
                                  <span className="w-2 h-2 rounded-full" style={{ background: cat.accent }} />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-inter font-semibold text-sm text-dark">{cat.name}</p>
                              <p className="font-inter text-xs text-dark/40 truncate">{cat.tagline || '—'}</p>
                              {cat.subCategories.length > 0 && (
                                <p className="font-inter text-[10px] text-dark/30 mt-0.5">{cat.subCategories.length} sub-categories</p>
                              )}
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <div className="w-3 h-3 rounded-full border border-dark/10" style={{ background: cat.accent }} title={cat.accent} />
                              <button onClick={() => openEditCatForm(cat)} className="p-1.5 rounded-lg text-dark/30 hover:text-gold hover:bg-gold/10 transition-all ml-2">
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button onClick={() => setDeleteCatConfirm(cat._id)} className="p-1.5 rounded-lg text-dark/30 hover:text-red-500 hover:bg-red-50 transition-all">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete event modal */}
      <AnimatePresence>
        {deleteEventConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-dark/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setDeleteEventConfirm(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
              <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center mb-4"><AlertTriangle className="w-6 h-6 text-red-500" /></div>
              <h3 className="font-playfair text-xl font-semibold text-dark mb-2">Delete Event?</h3>
              <p className="font-inter text-sm text-dark/60 mb-6">This action cannot be undone. The event and its images will be permanently removed.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteEventConfirm(null)} className="flex-1 py-3 rounded-xl border border-dark/10 font-inter text-sm text-dark/60 hover:bg-light transition-colors">Cancel</button>
                <button onClick={() => handleDeleteEvent(deleteEventConfirm)} className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-inter font-medium text-sm transition-colors">Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add/Edit event modal */}
      <AnimatePresence>
        {showEventForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-dark/60 backdrop-blur-sm z-50 flex flex-col justify-end md:items-center md:justify-center md:p-4"
            onClick={() => setShowEventForm(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="bg-white rounded-t-3xl md:rounded-3xl w-full md:max-w-2xl shadow-xl flex flex-col overflow-hidden"
              style={{ maxHeight: '92vh' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-10 h-1 bg-dark/15 rounded-full mx-auto mt-3 mb-1 shrink-0 md:hidden" />
              <div className="flex items-center justify-between px-5 py-4 md:px-7 md:py-5 border-b border-dark/10 shrink-0">
                <h2 className="font-playfair text-lg md:text-xl font-semibold text-dark">
                  {editingEvent ? 'Edit Event' : 'Add New Event'}
                </h2>
                <button onClick={() => setShowEventForm(false)} className="p-2 rounded-xl text-dark/30 hover:text-dark hover:bg-light transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleEventSubmit} className="flex flex-col flex-1 min-h-0">
                <div className="flex-1 overflow-y-auto min-h-0 p-5 md:p-7 space-y-5 md:space-y-6">
                  {eventFormError && (
                    <div className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-inter">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      {eventFormError}
                    </div>
                  )}

                  {/* Title */}
                  <div>
                    <label className="block text-xs font-inter font-semibold text-dark/60 uppercase tracking-wide mb-2">Title *</label>
                    <input type="text" required value={eventFormData.title} onChange={(e) => setEventFormData({ ...eventFormData, title: e.target.value })} placeholder="e.g. Rock Bottom — A Standup Comedy Special" className="w-full px-4 py-3 rounded-xl bg-light border border-dark/10 text-dark font-inter text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/50 transition-all" />
                  </div>

                  {/* Date range */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-inter font-semibold text-dark/60 uppercase tracking-wide mb-2">Start Date *</label>
                      <input type="text" required value={eventFormData.startDate} onChange={(e) => setEventFormData({ ...eventFormData, startDate: e.target.value })} placeholder="e.g. Sun 3 May 2026" className="w-full px-4 py-3 rounded-xl bg-light border border-dark/10 text-dark font-inter text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/50 transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-inter font-semibold text-dark/60 uppercase tracking-wide mb-2">End Date</label>
                      <input type="text" value={eventFormData.endDate} onChange={(e) => setEventFormData({ ...eventFormData, endDate: e.target.value })} placeholder="e.g. Sun 5 Jul 2026" className="w-full px-4 py-3 rounded-xl bg-light border border-dark/10 text-dark font-inter text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/50 transition-all" />
                    </div>
                  </div>

                  {/* Time + Duration */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-inter font-semibold text-dark/60 uppercase tracking-wide mb-2">Time</label>
                      <input type="text" value={eventFormData.time} onChange={(e) => setEventFormData({ ...eventFormData, time: e.target.value })} placeholder="e.g. 8:00 PM" className="w-full px-4 py-3 rounded-xl bg-light border border-dark/10 text-dark font-inter text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/50 transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-inter font-semibold text-dark/60 uppercase tracking-wide mb-2">Duration</label>
                      <input type="text" value={eventFormData.duration} onChange={(e) => setEventFormData({ ...eventFormData, duration: e.target.value })} placeholder="e.g. 1 hour 15 minutes" className="w-full px-4 py-3 rounded-xl bg-light border border-dark/10 text-dark font-inter text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/50 transition-all" />
                    </div>
                  </div>

                  {/* Age limit + Language */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-inter font-semibold text-dark/60 uppercase tracking-wide mb-2">Age Limit</label>
                      <input type="text" value={eventFormData.ageLimit} onChange={(e) => setEventFormData({ ...eventFormData, ageLimit: e.target.value })} placeholder="e.g. 16yrs +" className="w-full px-4 py-3 rounded-xl bg-light border border-dark/10 text-dark font-inter text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/50 transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-inter font-semibold text-dark/60 uppercase tracking-wide mb-2">Language</label>
                      <input type="text" value={eventFormData.language} onChange={(e) => setEventFormData({ ...eventFormData, language: e.target.value })} placeholder="e.g. Hindi, English" className="w-full px-4 py-3 rounded-xl bg-light border border-dark/10 text-dark font-inter text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/50 transition-all" />
                    </div>
                  </div>

                  {/* Genre + Price */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-inter font-semibold text-dark/60 uppercase tracking-wide mb-2">Genre</label>
                      <input type="text" value={eventFormData.genre} onChange={(e) => setEventFormData({ ...eventFormData, genre: e.target.value })} placeholder="e.g. Comedy" className="w-full px-4 py-3 rounded-xl bg-light border border-dark/10 text-dark font-inter text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/50 transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-inter font-semibold text-dark/60 uppercase tracking-wide mb-2">Price (₹) *</label>
                      <input type="number" required min="0" value={eventFormData.price} onChange={(e) => setEventFormData({ ...eventFormData, price: e.target.value })} placeholder="e.g. 399" className="w-full px-4 py-3 rounded-xl bg-light border border-dark/10 text-dark font-inter text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/50 transition-all" />
                    </div>
                  </div>

                  {/* Venue */}
                  <div>
                    <label className="block text-xs font-inter font-semibold text-dark/60 uppercase tracking-wide mb-2">Venue *</label>
                    <input type="text" required value={eventFormData.venue} onChange={(e) => setEventFormData({ ...eventFormData, venue: e.target.value })} placeholder="e.g. The Laughter Foyer: Gurugram" className="w-full px-4 py-3 rounded-xl bg-light border border-dark/10 text-dark font-inter text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/50 transition-all" />
                  </div>

                  {/* Other venues */}
                  <div>
                    <label className="block text-xs font-inter font-semibold text-dark/60 uppercase tracking-wide mb-2">Other Venues</label>
                    <div className="space-y-2">
                      {eventFormData.otherVenues.map((v, i) => (
                        <div key={i} className="flex gap-2">
                          <input value={v} onChange={(e) => { const arr = [...eventFormData.otherVenues]; arr[i] = e.target.value; setEventFormData({ ...eventFormData, otherVenues: arr }); }} placeholder={`Venue ${i + 1}`} className="flex-1 px-4 py-2.5 rounded-xl bg-light border border-dark/10 text-dark font-inter text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/50 transition-all" />
                          <button type="button" onClick={() => setEventFormData({ ...eventFormData, otherVenues: eventFormData.otherVenues.filter((_, j) => j !== i) })} className="p-2.5 rounded-xl text-dark/30 hover:text-red-500 hover:bg-red-50 transition-all"><X className="w-4 h-4" /></button>
                        </div>
                      ))}
                      <button type="button" onClick={() => setEventFormData({ ...eventFormData, otherVenues: [...eventFormData.otherVenues, ''] })} className="flex items-center gap-1.5 text-xs font-inter text-primary hover:text-dark transition-colors mt-1">
                        <Plus className="w-3.5 h-3.5" /> Add venue
                      </button>
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-xs font-inter font-semibold text-dark/60 uppercase tracking-wide mb-2">Tags</label>
                    <div className="space-y-2">
                      {eventFormData.tags.map((tag, i) => (
                        <div key={i} className="flex gap-2">
                          <input value={tag} onChange={(e) => { const arr = [...eventFormData.tags]; arr[i] = e.target.value; setEventFormData({ ...eventFormData, tags: arr }); }} placeholder={`e.g. Stand up Comedy`} className="flex-1 px-4 py-2.5 rounded-xl bg-light border border-dark/10 text-dark font-inter text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/50 transition-all" />
                          <button type="button" onClick={() => setEventFormData({ ...eventFormData, tags: eventFormData.tags.filter((_, j) => j !== i) })} className="p-2.5 rounded-xl text-dark/30 hover:text-red-500 hover:bg-red-50 transition-all"><X className="w-4 h-4" /></button>
                        </div>
                      ))}
                      <button type="button" onClick={() => setEventFormData({ ...eventFormData, tags: [...eventFormData.tags, ''] })} className="flex items-center gap-1.5 text-xs font-inter text-primary hover:text-dark transition-colors mt-1">
                        <Plus className="w-3.5 h-3.5" /> Add tag
                      </button>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-inter font-semibold text-dark/60 uppercase tracking-wide mb-2">Description</label>
                    <textarea rows={4} value={eventFormData.description} onChange={(e) => setEventFormData({ ...eventFormData, description: e.target.value })} placeholder="Describe this event..." className="w-full px-4 py-3 rounded-xl bg-light border border-dark/10 text-dark font-inter text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/50 transition-all resize-none" />
                  </div>

                  {/* Images */}
                  <div>
                    <label className="block text-xs font-inter font-semibold text-dark/60 uppercase tracking-wide mb-2">Images</label>
                    {eventFormData.images.length > 0 && (
                      <div className="flex flex-wrap gap-3 mb-3">
                        {eventFormData.images.map((url, i) => (
                          <div key={i} className="relative group">
                            <div className="w-20 h-20 rounded-xl overflow-hidden border border-dark/10 relative">
                              <Image src={url} alt={`Image ${i + 1}`} fill className="object-cover" sizes="80px" />
                            </div>
                            <button type="button" onClick={() => removeEventImage(i)} className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                              <X className="w-3 h-3 text-white" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <input ref={eventFileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => e.target.files && handleEventImageUpload(e.target.files)} />
                    <button type="button" onClick={() => eventFileInputRef.current?.click()} disabled={eventUploadLoading} className="flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-dark/15 text-dark/50 hover:border-gold/40 hover:text-gold font-inter text-sm transition-all w-full justify-center">
                      {eventUploadLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</> : <><Upload className="w-4 h-4" /> Upload Images</>}
                    </button>
                  </div>

                  {/* Featured + Filling Fast toggles */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-light border border-dark/5">
                      <div>
                        <p className="font-inter font-medium text-sm text-dark">Featured Event</p>
                        <p className="font-inter text-xs text-dark/50">Highlight on the events page</p>
                      </div>
                      <button type="button" onClick={() => setEventFormData({ ...eventFormData, featured: !eventFormData.featured })} className={`w-11 h-6 rounded-full transition-all duration-300 relative ${eventFormData.featured ? 'bg-gold' : 'bg-dark/20'}`}>
                        <div className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-300" style={{ left: eventFormData.featured ? '22px' : '2px' }} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-xl bg-light border border-dark/5">
                      <div>
                        <p className="font-inter font-medium text-sm text-dark">Filling Fast</p>
                        <p className="font-inter text-xs text-dark/50">Show urgency badge on the card</p>
                      </div>
                      <button type="button" onClick={() => setEventFormData({ ...eventFormData, fillingFast: !eventFormData.fillingFast })} className={`w-11 h-6 rounded-full transition-all duration-300 relative ${eventFormData.fillingFast ? 'bg-red-500' : 'bg-dark/20'}`}>
                        <div className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-300" style={{ left: eventFormData.fillingFast ? '22px' : '2px' }} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="px-5 pb-5 pt-4 md:px-7 md:pb-6 border-t border-dark/8 shrink-0">
                  <div className="flex gap-3">
                    <button type="button" onClick={() => setShowEventForm(false)} className="flex-1 py-3.5 rounded-xl border border-dark/10 font-inter text-sm text-dark/60 hover:bg-light transition-colors">Cancel</button>
                    <button type="submit" disabled={eventFormLoading} className="flex-1 flex items-center justify-center gap-2 btn-gold text-dark font-inter font-semibold py-3.5 rounded-xl text-sm disabled:opacity-60">
                      {eventFormLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Check className="w-4 h-4" /> {editingEvent ? 'Update Event' : 'Create Event'}</>}
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete category modal */}
      <AnimatePresence>
        {deleteCatConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-dark/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setDeleteCatConfirm(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
              <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center mb-4"><AlertTriangle className="w-6 h-6 text-red-500" /></div>
              <h3 className="font-playfair text-xl font-semibold text-dark mb-2">Delete Category?</h3>
              <p className="font-inter text-sm text-dark/60 mb-6">Existing products in this category will not be deleted, but the category will no longer appear in dropdowns or on the landing page.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteCatConfirm(null)} className="flex-1 py-3 rounded-xl border border-dark/10 font-inter text-sm text-dark/60 hover:bg-light transition-colors">Cancel</button>
                <button onClick={() => handleDeleteCat(deleteCatConfirm)} className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-inter font-medium text-sm transition-colors">Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add/Edit category modal */}
      <AnimatePresence>
        {showCatForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-dark/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowCatForm(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0 }} transition={{ duration: 0.3 }} className="bg-white rounded-3xl w-full max-w-lg shadow-xl flex flex-col overflow-hidden" style={{ maxHeight: '90vh' }} onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between px-7 py-5 border-b border-dark/10 shrink-0">
                <h2 className="font-playfair text-xl font-semibold text-dark">{editingCat ? 'Edit Category' : 'Add Category'}</h2>
                <button onClick={() => setShowCatForm(false)} className="p-2 rounded-xl text-dark/30 hover:text-dark hover:bg-light transition-all"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleCatSubmit} className="flex flex-col flex-1 min-h-0">
                <div className="flex-1 overflow-y-auto min-h-0 p-7 space-y-6">
                  {catFormError && <div className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-inter"><AlertTriangle className="w-4 h-4 shrink-0" />{catFormError}</div>}

                  {/* Name */}
                  <div>
                    <label className="block text-xs font-inter font-semibold text-dark/60 uppercase tracking-wide mb-2">Category Name *</label>
                    <input required value={catFormData.name} onChange={(e) => setCatFormData({ ...catFormData, name: e.target.value })} placeholder="e.g. Festival Decor" className="w-full px-4 py-3 rounded-xl bg-light border border-dark/10 text-dark font-inter text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/50 transition-all" />
                  </div>

                  {/* Section */}
                  <div>
                    <label className="block text-xs font-inter font-semibold text-dark/60 uppercase tracking-wide mb-2">Section *</label>
                    <div className="grid grid-cols-2 gap-3">
                      {SECTIONS_LIST.map((s) => (
                        <button key={s} type="button" onClick={() => setCatFormData({ ...catFormData, section: s })} className={`px-4 py-2.5 rounded-xl font-inter text-xs font-medium transition-all border text-left ${catFormData.section === s ? (s === 'Signature Events' ? 'bg-gold/10 border-gold/40 text-gold' : 'bg-primary/10 border-primary/30 text-primary') : 'bg-light border-dark/10 text-dark/60 hover:border-dark/20'}`}>
                          {s === 'Signature Events' ? '✦ Signature Events' : '🏠 Social & Home'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tagline + Detail */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-inter font-semibold text-dark/60 uppercase tracking-wide mb-2">Tagline</label>
                      <input value={catFormData.tagline} onChange={(e) => setCatFormData({ ...catFormData, tagline: e.target.value })} placeholder="Celebrate years of love" className="w-full px-4 py-3 rounded-xl bg-light border border-dark/10 text-dark font-inter text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/50 transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-inter font-semibold text-dark/60 uppercase tracking-wide mb-2">Detail line</label>
                      <input value={catFormData.detail} onChange={(e) => setCatFormData({ ...catFormData, detail: e.target.value })} placeholder="Candles · Rose showers" className="w-full px-4 py-3 rounded-xl bg-light border border-dark/10 text-dark font-inter text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/50 transition-all" />
                    </div>
                  </div>

                  {/* Accent color */}
                  <div>
                    <label className="block text-xs font-inter font-semibold text-dark/60 uppercase tracking-wide mb-2">Accent Color</label>
                    <div className="flex items-center gap-3 flex-wrap">
                      {ACCENT_PRESETS.map((color) => (
                        <button key={color} type="button" onClick={() => setCatFormData({ ...catFormData, accent: color })} className="w-7 h-7 rounded-full border-2 transition-all" style={{ background: color, borderColor: catFormData.accent === color ? '#000' : 'transparent' }} />
                      ))}
                      <input type="color" value={catFormData.accent} onChange={(e) => setCatFormData({ ...catFormData, accent: e.target.value })} className="w-8 h-8 rounded-full cursor-pointer border-0 bg-transparent" title="Custom color" />
                    </div>
                  </div>

                  {/* Sub-categories */}
                  <div>
                    <label className="block text-xs font-inter font-semibold text-dark/60 uppercase tracking-wide mb-2">Sub-categories</label>
                    <div className="space-y-2">
                      {catFormData.subCategories.map((sub, i) => (
                        <div key={i} className="flex gap-2">
                          <input value={sub} onChange={(e) => { const arr = [...catFormData.subCategories]; arr[i] = e.target.value; setCatFormData({ ...catFormData, subCategories: arr }); }} placeholder={`Sub-category ${i + 1}`} className="flex-1 px-4 py-2.5 rounded-xl bg-light border border-dark/10 text-dark font-inter text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/50 transition-all" />
                          <button type="button" onClick={() => setCatFormData({ ...catFormData, subCategories: catFormData.subCategories.filter((_, j) => j !== i) })} className="p-2.5 rounded-xl text-dark/30 hover:text-red-500 hover:bg-red-50 transition-all"><X className="w-4 h-4" /></button>
                        </div>
                      ))}
                      <button type="button" onClick={() => setCatFormData({ ...catFormData, subCategories: [...catFormData.subCategories, ''] })} className="flex items-center gap-1.5 text-xs font-inter text-primary hover:text-dark transition-colors mt-1">
                        <Plus className="w-3.5 h-3.5" /> Add sub-category
                      </button>
                    </div>
                  </div>

                  {/* Image */}
                  <div>
                    <label className="block text-xs font-inter font-semibold text-dark/60 uppercase tracking-wide mb-2">Category Image (shown on landing page)</label>
                    {catFormData.image ? (
                      <div className="relative w-full h-40 rounded-xl overflow-hidden group">
                        <img src={catFormData.image} alt="category" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-dark/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                          <button type="button" onClick={() => catFileInputRef.current?.click()} className="px-3 py-1.5 rounded-lg bg-white text-dark text-xs font-inter font-medium"><ImagePlus className="w-3.5 h-3.5 inline mr-1" />Change</button>
                          <button type="button" onClick={() => setCatFormData({ ...catFormData, image: null })} className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-inter font-medium">Remove</button>
                        </div>
                      </div>
                    ) : (
                      <button type="button" onClick={() => catFileInputRef.current?.click()} disabled={catUploadLoading} className="w-full h-32 rounded-xl border-2 border-dashed border-dark/15 hover:border-gold/40 flex flex-col items-center justify-center gap-2 transition-all text-dark/30 hover:text-gold">
                        {catUploadLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Upload className="w-6 h-6" /><span className="font-inter text-xs">Upload image</span></>}
                      </button>
                    )}
                    <input ref={catFileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files && handleCatImageUpload(e.target.files)} />
                  </div>
                </div>
                <div className="px-7 pb-6 pt-4 border-t border-dark/8 shrink-0 flex gap-3">
                  <button type="button" onClick={() => setShowCatForm(false)} className="flex-1 py-3 rounded-xl border border-dark/10 font-inter text-sm text-dark/60 hover:bg-light transition-colors">Cancel</button>
                  <button type="submit" disabled={catFormLoading} className="flex-1 py-3 rounded-xl btn-gold text-dark font-inter font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-60">
                    {catFormLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    {editingCat ? 'Save Changes' : 'Create Category'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete modal */}
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
              <p className="font-inter text-sm text-dark/60 mb-6">This action cannot be undone. The product will be permanently removed.</p>
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

      {/* Add/Edit product modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-dark/60 backdrop-blur-sm z-50 flex flex-col justify-end md:items-center md:justify-center md:p-4"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="bg-white rounded-t-3xl md:rounded-3xl w-full md:max-w-2xl shadow-xl flex flex-col overflow-hidden"
              style={{ maxHeight: '92vh' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-10 h-1 bg-dark/15 rounded-full mx-auto mt-3 mb-1 shrink-0 md:hidden" />
              {/* Modal header */}
              <div className="flex items-center justify-between px-5 py-4 md:px-7 md:py-5 border-b border-dark/10 shrink-0">
                <h2 className="font-playfair text-lg md:text-xl font-semibold text-dark">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h2>
                <button onClick={() => setShowForm(false)} className="p-2 rounded-xl text-dark/30 hover:text-dark hover:bg-light transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
              <div className="flex-1 overflow-y-auto min-h-0 p-5 md:p-7 space-y-5 md:space-y-6">
                {formError && (
                  <div className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-inter">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    {formError}
                  </div>
                )}

                {/* Title */}
                <div>
                  <label className="block text-xs font-inter font-semibold text-dark/60 uppercase tracking-wide mb-2">Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Royal Garden Birthday Extravaganza"
                    className="w-full px-4 py-3 rounded-xl bg-light border border-dark/10 text-dark font-inter text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/50 transition-all"
                  />
                </div>

                {/* Section */}
                <div>
                  <label className="block text-xs font-inter font-semibold text-dark/60 uppercase tracking-wide mb-2">Section</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {(['', ...SECTIONS_LIST] as const).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setFormData({ ...formData, section: s, category: '', subCategory: '' })}
                        className={`px-4 py-2.5 rounded-xl font-inter text-sm font-medium transition-all duration-200 border text-left ${
                          formData.section === s
                            ? s === 'Signature Events'
                              ? 'bg-gold/10 border-gold/40 text-gold'
                              : s === 'Social & Home Celebrations'
                              ? 'bg-primary/10 border-primary/30 text-primary'
                              : 'bg-dark text-white border-dark'
                            : 'bg-light border-dark/10 text-dark/60 hover:border-dark/20'
                        }`}
                      >
                        {s === '' ? 'No Section' : s === 'Signature Events' ? '✦ Signature Events' : '🏠 Social & Home'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category + Sub-category */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-inter font-semibold text-dark/60 uppercase tracking-wide mb-2">Category *</label>
                    <select
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value, subCategory: '' })}
                      className="w-full px-4 py-3 rounded-xl bg-light border border-dark/10 text-dark font-inter text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/50 transition-all appearance-none cursor-pointer"
                    >
                      <option value="">Select category...</option>
                      {formData.section ? (
                        availableCategories.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))
                      ) : (
                        SECTIONS_LIST.map((sec) => (
                          <optgroup key={sec} label={sec}>
                            {categories.filter((c) => c.section === sec).map((c) => (
                              <option key={c._id} value={c.name}>{c.name}</option>
                            ))}
                          </optgroup>
                        ))
                      )}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-inter font-semibold text-dark/60 uppercase tracking-wide mb-2">
                      Sub-category
                      {availableSubCategories.length === 0 && formData.category && (
                        <span className="text-dark/30 normal-case ml-1 font-normal">(none)</span>
                      )}
                    </label>
                    <select
                      value={formData.subCategory}
                      onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                      disabled={availableSubCategories.length === 0}
                      className="w-full px-4 py-3 rounded-xl bg-light border border-dark/10 text-dark font-inter text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/50 transition-all appearance-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <option value="">None</option>
                      {availableSubCategories.map((sub) => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Gender + Budget Tag */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-inter font-semibold text-dark/60 uppercase tracking-wide mb-2">For (Gender)</label>
                    <div className="flex gap-2">
                      {GENDER_OPTIONS.map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setFormData({ ...formData, gender: g })}
                          className={`flex-1 py-2.5 rounded-xl font-inter text-xs font-medium transition-all duration-200 border ${
                            formData.gender === g
                              ? 'bg-dark text-white border-dark'
                              : 'bg-light text-dark/60 border-dark/10 hover:border-dark/20'
                          }`}
                        >
                          {g === 'Male' ? '♂' : g === 'Female' ? '♀' : '⚤'} {g}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-inter font-semibold text-dark/60 uppercase tracking-wide mb-2">Budget Tag *</label>
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
                    <label className="block text-xs font-inter font-semibold text-dark/60 uppercase tracking-wide mb-2">Price (₹) *</label>
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
                    <label className="block text-xs font-inter font-semibold text-dark/60 uppercase tracking-wide mb-2">Discount (%)</label>
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
                  <label className="block text-xs font-inter font-semibold text-dark/60 uppercase tracking-wide mb-2">Description</label>
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
                  <label className="block text-xs font-inter font-semibold text-dark/60 uppercase tracking-wide mb-2">Package Includes</label>
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
                        <button type="button" onClick={() => removeListItem('includes', i)} className="p-2.5 rounded-xl text-dark/30 hover:text-red-500 hover:bg-red-50 transition-all">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button type="button" onClick={() => addListItem('includes')} className="mt-2 flex items-center gap-1.5 text-xs font-inter text-primary hover:text-dark transition-colors">
                    <Plus className="w-3.5 h-3.5" />
                    Add item
                  </button>
                </div>

                {/* Excludes */}
                <div>
                  <label className="block text-xs font-inter font-semibold text-dark/60 uppercase tracking-wide mb-2">What&apos;s Excluded</label>
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
                        <button type="button" onClick={() => removeListItem('excludes', i)} className="p-2.5 rounded-xl text-dark/30 hover:text-red-500 hover:bg-red-50 transition-all">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button type="button" onClick={() => addListItem('excludes')} className="mt-2 flex items-center gap-1.5 text-xs font-inter text-primary hover:text-dark transition-colors">
                    <Plus className="w-3.5 h-3.5" />
                    Add item
                  </button>
                </div>

                {/* Images */}
                <div>
                  <label className="block text-xs font-inter font-semibold text-dark/60 uppercase tracking-wide mb-2">Images</label>
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
                      <><Upload className="w-4 h-4" /> Upload Images</>
                    )}
                  </button>
                  <p className="text-xs font-inter text-dark/40 mt-1.5">Max 10 images per product.</p>
                </div>

                {/* Featured toggle */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-light border border-dark/5">
                  <div>
                    <p className="font-inter font-medium text-sm text-dark">Featured Product</p>
                    <p className="font-inter text-xs text-dark/50">Show on homepage highlights</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, featured: !formData.featured })}
                    className={`w-11 h-6 rounded-full transition-all duration-300 relative ${formData.featured ? 'bg-gold' : 'bg-dark/20'}`}
                  >
                    <div
                      className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-300"
                      style={{ left: formData.featured ? '22px' : '2px' }}
                    />
                  </button>
                </div>

              </div>

              {/* Sticky footer */}
              <div className="px-5 pb-5 pt-4 md:px-7 md:pb-6 border-t border-dark/8 shrink-0">
                <div className="flex gap-3">
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
              </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
