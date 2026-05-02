'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  Send,
  Loader2,
  Leaf,
} from 'lucide-react';

const EVENT_TYPES = ['Birthday', 'Wedding', 'Anniversary', 'Corporate', 'Baby Shower', 'Engagement', 'Other'];
const BUDGET_OPTIONS = [
  { label: 'Pocket Friendly (under ₹30,000)', value: 'pocket' },
  { label: 'Premium (₹30,000 - ₹1,00,000)', value: 'premium' },
  { label: 'Luxury (₹1,00,000+)', value: 'luxury' },
];

interface FormData {
  name: string;
  email: string;
  phone: string;
  eventType: string;
  budget: string;
  date: string;
  message: string;
}

export default function ContactPage() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    eventType: '',
    budget: '',
    date: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '918307068864';
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hi, I would like to plan an event with TEG. Please get in touch.')}`;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    // Simulate async submission
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setSubmitting(false);
    setSubmitted(true);
  };

  const generateWhatsAppFromForm = () => {
    const msg = `Hi, I'd like to plan an event with TEG.\n\nName: ${formData.name}\nEvent Type: ${formData.eventType || 'Not specified'}\nBudget: ${formData.budget || 'Not specified'}\nDate: ${formData.date || 'TBD'}\nPhone: ${formData.phone}\n\nMessage: ${formData.message || 'Please contact me with details.'}`;
    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="min-h-screen bg-light pt-20">
      {/* Header */}
      <div className="bg-dark py-16 px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <p className="font-inter text-xs text-gold tracking-widest uppercase mb-3">Get in Touch</p>
          <h1 className="font-playfair text-4xl md:text-5xl font-bold text-white mb-4">
            Let&apos;s Plan Together
          </h1>
          <p className="font-inter text-white/50 max-w-xl mx-auto">
            Every extraordinary event starts with a conversation. Tell us your vision.
          </p>
        </motion.div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* LEFT: Brand + Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            {/* Logo */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Leaf className="w-5 h-5 text-primary" />
              </div>
              <div>
                <span className="font-playfair text-xl font-bold text-dark tracking-wider">TEG</span>
                <p className="text-[10px] text-dark/40 font-inter tracking-widest uppercase">The Event Gardener</p>
              </div>
            </div>

            <h2 className="font-cormorant text-3xl md:text-4xl font-light text-dark mb-4 leading-snug">
              Luxury events for those who{' '}
              <em className="text-gold not-italic">demand the extraordinary</em>
            </h2>

            <p className="font-inter text-dark/60 leading-relaxed mb-8">
              Whether you&apos;re planning an intimate birthday or a grand wedding, our team is
              dedicated to creating bespoke experiences that leave lasting impressions.
              Reach out — we&apos;d love to hear your story.
            </p>

            {/* Contact Cards */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white shadow-luxury">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-inter text-dark/40 uppercase tracking-wide mb-0.5">Call Us</p>
                  <a href="tel:+918307068864" className="font-inter font-medium text-dark hover:text-primary transition-colors">
                    +91 83070 68864
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white shadow-luxury">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-inter text-dark/40 uppercase tracking-wide mb-0.5">Email Us</p>
                  <a href="mailto:support@theeventgardener.in" className="font-inter font-medium text-dark hover:text-primary transition-colors">
                    support@theeventgardener.in
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white shadow-luxury">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-inter text-dark/40 uppercase tracking-wide mb-0.5">We Serve</p>
                  <p className="font-inter font-medium text-dark">10+ cities across India</p>
                </div>
              </div>
            </div>

            {/* WhatsApp CTA */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#20c05e] text-white font-inter font-semibold px-6 py-4 rounded-2xl transition-all duration-300 hover:shadow-[0_4px_24px_rgba(37,211,102,0.4)] text-sm w-full"
            >
              <MessageCircle className="w-5 h-5 fill-white" />
              Chat Directly on WhatsApp
            </a>

            <p className="text-center text-xs font-inter text-dark/30 mt-3">
              Fastest response — we reply within minutes
            </p>
          </motion.div>

          {/* RIGHT: Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            <div className="bg-white rounded-3xl p-8 shadow-luxury">
              <AnimatePresence mode="wait">
                {submitted ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                      className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6"
                    >
                      <CheckCircle2 className="w-10 h-10 text-green-500" />
                    </motion.div>
                    <h3 className="font-playfair text-2xl font-semibold text-dark mb-3">
                      Message Received!
                    </h3>
                    <p className="font-inter text-dark/60 mb-6 leading-relaxed">
                      Thank you for reaching out. Our team will get back to you within 24 hours.
                      For faster response, WhatsApp us directly!
                    </p>
                    <a
                      href={generateWhatsAppFromForm()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2.5 bg-[#25D366] hover:bg-[#20c05e] text-white font-inter font-semibold px-6 py-3.5 rounded-xl transition-all duration-300 text-sm"
                    >
                      <MessageCircle className="w-4 h-4 fill-white" />
                      Continue on WhatsApp
                    </a>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    onSubmit={handleSubmit}
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-5"
                  >
                    <div>
                      <h3 className="font-playfair text-2xl font-semibold text-dark mb-1">
                        Tell Us Your Vision
                      </h3>
                      <p className="font-inter text-sm text-dark/50">
                        Fill in the details and we&apos;ll craft something extraordinary together.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-inter font-medium text-dark/60 uppercase tracking-wide mb-1.5">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          name="name"
                          required
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Your name"
                          className="w-full px-4 py-3 rounded-xl bg-light border border-dark/10 text-dark placeholder:text-dark/30 font-inter text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/50 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-inter font-medium text-dark/60 uppercase tracking-wide mb-1.5">
                          Phone *
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          required
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="+91 XXXXX XXXXX"
                          className="w-full px-4 py-3 rounded-xl bg-light border border-dark/10 text-dark placeholder:text-dark/30 font-inter text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/50 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-inter font-medium text-dark/60 uppercase tracking-wide mb-1.5">
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="your@email.com"
                        className="w-full px-4 py-3 rounded-xl bg-light border border-dark/10 text-dark placeholder:text-dark/30 font-inter text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/50 transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-inter font-medium text-dark/60 uppercase tracking-wide mb-1.5">
                          Event Type *
                        </label>
                        <select
                          name="eventType"
                          required
                          value={formData.eventType}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-xl bg-light border border-dark/10 text-dark font-inter text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/50 transition-all appearance-none cursor-pointer"
                        >
                          <option value="">Select type</option>
                          {EVENT_TYPES.map((t) => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-inter font-medium text-dark/60 uppercase tracking-wide mb-1.5">
                          Event Date
                        </label>
                        <input
                          type="date"
                          name="date"
                          value={formData.date}
                          onChange={handleChange}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full px-4 py-3 rounded-xl bg-light border border-dark/10 text-dark font-inter text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/50 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-inter font-medium text-dark/60 uppercase tracking-wide mb-1.5">
                        Budget Range
                      </label>
                      <select
                        name="budget"
                        value={formData.budget}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl bg-light border border-dark/10 text-dark font-inter text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/50 transition-all appearance-none cursor-pointer"
                      >
                        <option value="">Select budget</option>
                        {BUDGET_OPTIONS.map((b) => (
                          <option key={b.value} value={b.value}>{b.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-inter font-medium text-dark/60 uppercase tracking-wide mb-1.5">
                        Tell Us More
                      </label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        rows={4}
                        placeholder="Describe your dream event — theme, guest count, special requests..."
                        className="w-full px-4 py-3 rounded-xl bg-light border border-dark/10 text-dark placeholder:text-dark/30 font-inter text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/50 transition-all resize-none"
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="flex-1 flex items-center justify-center gap-2.5 btn-gold text-dark font-inter font-semibold px-6 py-4 rounded-xl text-sm disabled:opacity-60"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            Send Enquiry
                          </>
                        )}
                      </button>

                      <a
                        href={generateWhatsAppFromForm()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2.5 bg-[#25D366] hover:bg-[#20c05e] text-white font-inter font-semibold px-6 py-4 rounded-xl text-sm transition-all duration-300"
                      >
                        <MessageCircle className="w-4 h-4 fill-white" />
                        Send via WhatsApp
                      </a>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
