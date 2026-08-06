'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X, LayoutDashboard, Search, SlidersHorizontal, ArrowLeftRight, Bookmark, Settings, Sparkles } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();

  const navLinkClass = "flex items-center gap-3 px-4 py-3 rounded-[8px] font-medium text-[15px]";
  const activeClass = "bg-[var(--bg-hover)] text-[var(--accent-pulse)] font-semibold border border-[var(--border-color)]";
  const inactiveClass = "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Menu */}
      <div className="relative w-full max-w-[320px] bg-[var(--bg-card)] border-l border-[var(--border-color)] h-full p-6 shadow-2xl flex flex-col justify-between z-10 animate-in slide-in-from-right duration-200">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-6 border-b border-[var(--border-subtle)] mb-6">
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded-[2px] bg-[var(--accent-pulse)]" />
              <span className="font-manrope font-bold text-[18px] text-[var(--text-primary)]">
                FiscalQuant
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md hover:bg-[var(--bg-hover)] text-[var(--text-primary)]"
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
              <LayoutDashboard className={`w-4 h-4 ${pathname === '/' ? 'text-[var(--accent-pulse)]' : 'text-[var(--text-muted)]'}`} />
              Dashboard
            </Link>
            <Link
              href="/budgets"
              onClick={onClose}
              className={`${navLinkClass} ${pathname === '/budgets' ? activeClass : inactiveClass}`}
            >
              <Search className={`w-4 h-4 ${pathname === '/budgets' ? 'text-[var(--accent-pulse)]' : 'text-[var(--text-muted)]'}`} />
              Budget Search
            </Link>
            <Link
              href="/simulator"
              onClick={onClose}
              className={`${navLinkClass} ${pathname === '/simulator' ? activeClass : inactiveClass}`}
            >
              <SlidersHorizontal className={`w-4 h-4 ${pathname === '/simulator' ? 'text-[var(--accent-pulse)]' : 'text-[var(--text-muted)]'}`} />
              AI Simulator
            </Link>
            <Link
              href="/compare"
              onClick={onClose}
              className={`${navLinkClass} ${pathname === '/compare' ? activeClass : inactiveClass}`}
            >
              <ArrowLeftRight className={`w-4 h-4 ${pathname === '/compare' ? 'text-[var(--accent-pulse)]' : 'text-[var(--text-muted)]'}`} />
              Year Compare
            </Link>
            <Link
              href="/bookmarks"
              onClick={onClose}
              className={`${navLinkClass} ${pathname === '/bookmarks' ? activeClass : inactiveClass}`}
            >
              <Bookmark className={`w-4 h-4 ${pathname === '/bookmarks' ? 'text-[var(--accent-pulse)]' : 'text-[var(--text-muted)]'}`} />
              Saved Bookmarks
            </Link>
            <Link
              href="/profile"
              onClick={onClose}
              className={`${navLinkClass} ${pathname === '/profile' || pathname === '/settings' ? activeClass : inactiveClass}`}
            >
              <Settings className={`w-4 h-4 ${pathname === '/profile' || pathname === '/settings' ? 'text-[var(--accent-pulse)]' : 'text-[var(--text-muted)]'}`} />
              Profile & Settings
            </Link>
          </div>
        </div>

        {/* Footer Badge & Theme Switcher */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs text-[var(--text-secondary)] font-medium">Theme Mode</span>
            <ThemeToggle showLabel />
          </div>

          <div className="bg-[var(--bg-hover)] border border-[var(--border-color)] p-4 rounded-[8px] text-center">
            <div className="flex items-center justify-center gap-1.5 text-[12px] font-semibold text-[var(--text-primary)] mb-1">
              <Sparkles className="w-4 h-4 text-[var(--accent-pulse)]" />
              <span>India Union Budget 2026</span>
            </div>
            <p className="text-[11px] text-[var(--text-secondary)]">Sub-2s cached rendering enabled.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

