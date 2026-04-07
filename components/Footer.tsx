'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Leaf, MessageCircle, Instagram, Facebook, Mail, Phone } from 'lucide-react';

const quickLinks = [
  { label: 'Home', href: '/' },
  { label: 'Collections', href: '/collections' },
  { label: 'Contact', href: '/contact' },
  { label: 'Admin', href: '/admin' },
];

const categories = [
  { label: 'Birthday', href: '/collections?category=Birthday' },
  { label: 'Wedding', href: '/collections?category=Wedding' },
  { label: 'Anniversary', href: '/collections?category=Anniversary' },
  { label: 'Corporate', href: '/collections?category=Corporate' },
  { label: 'Baby Shower', href: '/collections?category=Baby Shower' },
  { label: 'Engagement', href: '/collections?category=Engagement' },
];

export default function Footer() {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919999999999';
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hi, I would like to know more about your event planning services.')}`;

  return (
    <footer className="bg-dark text-white">
      {/* Top CTA Strip */}
      <div className="bg-gold/10 border-t border-b border-gold/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="font-cormorant text-xl text-white/80 italic">
              Ready to create something extraordinary?
            </p>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#25D366] hover:bg-[#20c05e] text-white px-6 py-3 rounded-full font-inter font-medium text-sm transition-all duration-300 hover:shadow-[0_4px_20px_rgba(37,211,102,0.4)] hover:-translate-y-0.5"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-4 group">
              <div className="w-10 h-10 rounded-full bg-gold/20 border border-gold/40 flex items-center justify-center">
                <Leaf className="w-5 h-5 text-gold" />
              </div>
              <div>
                <span className="font-playfair text-2xl font-bold text-gold tracking-wider">TEG</span>
                <p className="text-[10px] text-white/40 font-inter tracking-widest uppercase">
                  The Event Gardener
                </p>
              </div>
            </Link>
            <p className="font-inter text-white/50 text-sm leading-relaxed mt-4">
              Luxury event design for those who demand the extraordinary. Every detail crafted with intention.
            </p>
            <div className="flex items-center gap-3 mt-6">
              <a
                href="#"
                className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-gold hover:border-gold/40 transition-all duration-300"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-gold hover:border-gold/40 transition-all duration-300"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href={`mailto:hello@theeventgardener.com`}
                className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-gold hover:border-gold/40 transition-all duration-300"
                aria-label="Email"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-playfair text-lg font-medium text-white mb-6 relative">
              Quick Links
              <span className="absolute -bottom-2 left-0 w-8 h-0.5 bg-gold" />
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-inter text-sm text-white/50 hover:text-gold transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Event Categories */}
          <div>
            <h3 className="font-playfair text-lg font-medium text-white mb-6 relative">
              Event Categories
              <span className="absolute -bottom-2 left-0 w-8 h-0.5 bg-gold" />
            </h3>
            <ul className="space-y-3">
              {categories.map((cat) => (
                <li key={cat.href}>
                  <Link
                    href={cat.href}
                    className="font-inter text-sm text-white/50 hover:text-gold transition-colors duration-300"
                  >
                    {cat.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-playfair text-lg font-medium text-white mb-6 relative">
              Get in Touch
              <span className="absolute -bottom-2 left-0 w-8 h-0.5 bg-gold" />
            </h3>
            <div className="space-y-4">
              <a
                href={`tel:+919999999999`}
                className="flex items-center gap-3 text-white/50 hover:text-gold transition-colors duration-300 group"
              >
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-gold/10 transition-colors">
                  <Phone className="w-3.5 h-3.5" />
                </div>
                <span className="font-inter text-sm">+91 99999 99999</span>
              </a>
              <a
                href="mailto:hello@theeventgardener.com"
                className="flex items-center gap-3 text-white/50 hover:text-gold transition-colors duration-300 group"
              >
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-gold/10 transition-colors">
                  <Mail className="w-3.5 h-3.5" />
                </div>
                <span className="font-inter text-sm">hello@theeventgardener.com</span>
              </a>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-white/50 hover:text-[#25D366] transition-colors duration-300 group"
              >
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#25D366]/10 transition-colors">
                  <MessageCircle className="w-3.5 h-3.5" />
                </div>
                <span className="font-inter text-sm">WhatsApp Us</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-inter text-xs text-white/30">
            © {new Date().getFullYear()} The Event Gardener. All rights reserved.
          </p>
          <p className="font-cormorant text-sm text-white/40 italic">
            Crafted with love for luxury events
          </p>
        </div>
      </div>
    </footer>
  );
}
