'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X, LayoutDashboard, Search, SlidersHorizontal, ArrowLeftRight, Bookmark, Sparkles } from 'lucide-react';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();

  const navLinkClass = "flex items-center gap-3 px-4 py-3 rounded-[8px] font-medium text-[15px]";
  const activeClass = "bg-[#212525] text-[#7fee64] font-semibold border border-[#7fee64]/30";
  const inactiveClass = "text-[#8cab87] hover:bg-[#212525] hover:text-[#ddffdc]";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Menu */}
      <div className="relative w-full max-w-[320px] bg-[#181818] border-l border-[#485346] h-full p-6 shadow-2xl flex flex-col justify-between z-10 animate-in slide-in-from-right duration-200">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-6 border-b border-[#1f2a33] mb-6">
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded-[2px] bg-[#7fee64]" />
              <span className="font-manrope font-bold text-[18px] text-[#ddffdc]">
                Tx Expliner
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md hover:bg-[#212525] text-[#ddffdc]"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Links */}
          <div className="space-y-2">
            <Link
              href="/"
              onClick={onClose}
              className={`${navLinkClass} ${pathname === '/' ? activeClass : inactiveClass}`}
            >
              <LayoutDashboard className={`w-4 h-4 ${pathname === '/' ? 'text-[#7fee64]' : 'text-[#677d64]'}`} />
              Dashboard
            </Link>
            <Link
              href="/budgets"
              onClick={onClose}
              className={`${navLinkClass} ${pathname === '/budgets' ? activeClass : inactiveClass}`}
            >
              <Search className={`w-4 h-4 ${pathname === '/budgets' ? 'text-[#7fee64]' : 'text-[#677d64]'}`} />
              Budget Search
            </Link>
            <Link
              href="#simulator"
              onClick={onClose}
              className={`${navLinkClass} ${inactiveClass}`}
            >
              <SlidersHorizontal className="w-4 h-4 text-[#677d64]" />
              AI Simulator
            </Link>
            <Link
              href="/compare"
              onClick={onClose}
              className={`${navLinkClass} ${pathname === '/compare' ? activeClass : inactiveClass}`}
            >
              <ArrowLeftRight className={`w-4 h-4 ${pathname === '/compare' ? 'text-[#7fee64]' : 'text-[#677d64]'}`} />
              Year Compare
            </Link>
            <Link
              href="#bookmarks"
              onClick={onClose}
              className={`${navLinkClass} ${inactiveClass}`}
            >
              <Bookmark className="w-4 h-4 text-[#677d64]" />
              Saved Sectors
            </Link>
          </div>
        </div>

        {/* Footer Badge */}
        <div className="bg-[#212525] border border-[#485346] p-4 rounded-[8px] text-center">
          <div className="flex items-center justify-center gap-1.5 text-[12px] font-semibold text-[#ddffdc] mb-1">
            <Sparkles className="w-4 h-4 text-[#7fee64]" />
            <span>India Union Budget 2026</span>
          </div>
          <p className="text-[11px] text-[#8cab87]">Sub-2s cached rendering enabled.</p>
        </div>
      </div>
    </div>
  );
};
