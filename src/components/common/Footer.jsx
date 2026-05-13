import React from 'react';
import { Globe } from 'lucide-react';
import logo from '../../assets/logo.png';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-stone-50 dark:bg-[#0A0A09] border-t border-black/[0.04] dark:border-white/[0.05] py-12 px-6 md:px-12 transition-colors duration-200 mt-20">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
        <div>
          <div className="flex items-center mb-4 select-none">
            <img 
              src={logo} 
              alt="CRAVE Logo" 
              className="h-[32px] w-auto object-contain transition-transform duration-300 hover:scale-[1.02]"
            />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 max-w-xs leading-relaxed">
            Premium, lightning-fast food delivery app connecting you with the finest culinary treasures in your city.
          </p>
          <div className="flex space-x-3">
            {/* Facebook custom SVG */}
            <a href="#facebook" className="text-gray-400 hover:text-brand transition-colors" aria-label="Facebook">
              <svg className="w-[18px] h-[18px] fill-current" viewBox="0 0 24 24">
                <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.8c4.56-.93 8-4.96 8-9.8z"/>
              </svg>
            </a>
            {/* Twitter custom SVG */}
            <a href="#twitter" className="text-gray-400 hover:text-brand transition-colors" aria-label="Twitter">
              <svg className="w-[18px] h-[18px] fill-current" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
            </a>
            {/* Instagram custom SVG */}
            <a href="#instagram" className="text-gray-400 hover:text-brand transition-colors" aria-label="Instagram">
              <svg className="w-[18px] h-[18px] fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
              </svg>
            </a>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 uppercase tracking-wider mb-4">Company</h3>
          <ul className="space-y-2.5 text-sm">
            <li><a href="#careers" className="text-gray-500 dark:text-gray-400 hover:text-brand transition-colors">Careers</a></li>
            <li><a href="#blog" className="text-gray-500 dark:text-gray-400 hover:text-brand transition-colors">Blog</a></li>
            <li><a href="#investors" className="text-gray-500 dark:text-gray-400 hover:text-brand transition-colors">Investor Relations</a></li>
            <li><a href="#press" className="text-gray-500 dark:text-gray-400 hover:text-brand transition-colors">Press & Media</a></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 uppercase tracking-wider mb-4">Legal</h3>
          <ul className="space-y-2.5 text-sm">
            <li><a href="#terms" className="text-gray-500 dark:text-gray-400 hover:text-brand transition-colors">Terms of Service</a></li>
            <li><a href="#privacy" className="text-gray-500 dark:text-gray-400 hover:text-brand transition-colors">Privacy Policy</a></li>
            <li><a href="#security" className="text-gray-500 dark:text-gray-400 hover:text-brand transition-colors">Security Information</a></li>
            <li><a href="#refund" className="text-gray-500 dark:text-gray-400 hover:text-brand transition-colors">Refund & Cancellation</a></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 uppercase tracking-wider mb-4">Support</h3>
          <ul className="space-y-2.5 text-sm">
            <li><a href="#help" className="text-gray-500 dark:text-gray-400 hover:text-brand transition-colors">Help Center</a></li>
            <li><a href="#partner" className="text-gray-500 dark:text-gray-400 hover:text-brand transition-colors">Partner with Us</a></li>
            <li><a href="#ride" className="text-gray-500 dark:text-gray-400 hover:text-brand transition-colors">Ride with Us</a></li>
            <li><a href="#corporate" className="text-gray-500 dark:text-gray-400 hover:text-brand transition-colors">Corporate Orders</a></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 border-t border-black/[0.05] dark:border-white/[0.05] flex flex-col md:flex-row justify-between items-center text-sm text-gray-500 dark:text-gray-400 gap-4">
        <div className="flex items-center space-x-1">
          <Globe size={16} />
          <span>English (India)</span>
        </div>
        <p>&copy; {currentYear} Crave Food Technologies Private Limited. All rights reserved.</p>
      </div>
    </footer>
  );
}
