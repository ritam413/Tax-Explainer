'use client';

import React from 'react';
import Link from 'next/link';
import { Menu, X, Sparkles, ArrowRight, User } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

interface NavbarProps {
  onToggleMobileMenu: () => void;
  isMobileMenuOpen: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleMobileMenu,
  isMobileMenuOpen,
}) => {
  const { user, isLoggedIn, openAuthModal } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full bg-[var(--bg-hover)]/90 backdrop-blur-md border-b border-[var(--border-subtle)] transition-colors duration-200">
      <nav className="h-[64px] max-w-[1280px] mx-auto px-6 flex items-center justify-between">
        {/* Left: Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-3.5 h-3.5 rounded-[2px] bg-[var(--accent-pulse)] shadow-[0_0_10px_rgba(127,238,100,0.5)] transition-transform group-hover:scale-110" />
          <span className="font-manrope font-bold text-[18px] tracking-tight text-[var(--text-primary)]">
            Tx Expliner
          </span>
        </Link>

        {/* Center: In-nav Announcement Pill */}
        <div className="hidden md:flex items-center gap-2 bg-[var(--bg-card)] border border-[var(--border-color)] px-3.5 py-1 rounded-full text-[12px] font-medium text-[var(--badge-text)]">
          <span className="bg-[var(--accent-bg)] text-[var(--accent-text)] px-2 py-[2px] rounded-full text-[10px] font-bold tracking-wider uppercase">
            Live 2026
          </span>
          <span>India Union Budget Snapshot</span>
          <Sparkles className="w-3.5 h-3.5 text-[var(--accent-pulse)]" />
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          {/* Theme Switcher */}
          <ThemeToggle />

          {/* User Auth / Profile Link Button */}
          {isLoggedIn ? (
            <Link
              href="/profile"
              className="hidden sm:inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--text-primary)] bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[var(--accent-pulse)] transition-colors px-3 py-1.5 rounded-full"
            >
              <User className="w-3.5 h-3.5 text-[var(--accent-pulse)]" />
              <span className="truncate max-w-[110px]">{user?.name}</span>
            </Link>
          ) : (
            <button
              onClick={openAuthModal}
              className="hidden sm:inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--text-secondary)] hover:text-[var(--accent-pulse)] transition-colors px-3 py-1.5 cursor-pointer"
            >
              <User className="w-3.5 h-3.5 text-[var(--text-muted)]" />
              <span>Sign In</span>
            </button>
          )}

          {/* CTA Pill */}
          <Link
            href="/budgets"
            className="lime-pill-cta font-semibold text-[14px] px-4 py-1.5 flex items-center gap-1.5"
          >
            <span>View Sectors</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-1.5 rounded-md text-[var(--text-primary)] hover:bg-[var(--bg-card)] transition-colors"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>
    </header>
  );
};

