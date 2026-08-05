'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Sparkles, PieChart, Layers, SlidersHorizontal, ArrowRight } from 'lucide-react';

interface NavbarProps {
  onToggleMobileMenu: () => void;
  isMobileMenuOpen: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleMobileMenu,
  isMobileMenuOpen,
}) => {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 w-full bg-[#212525]/90 backdrop-blur-md border-b border-[#1f2a33]">
      <nav className="h-[64px] max-w-[1280px] mx-auto px-6 flex items-center justify-between">
        {/* Left: Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-3.5 h-3.5 rounded-[2px] bg-[#7fee64] shadow-[0_0_10px_rgba(127,238,100,0.5)] transition-transform group-hover:scale-110" />
          <span className="font-manrope font-bold text-[18px] tracking-tight text-[#ddffdc]">
            Tx Expliner
          </span>
        </Link>

        {/* Center: In-nav Announcement Pill */}
        <div className="hidden md:flex items-center gap-2 bg-[#181818] border border-[#485346] px-3.5 py-1 rounded-full text-[12px] font-medium text-[#aed2a4]">
          <span className="bg-[#7fee64] text-[#181818] px-2 py-[2px] rounded-full text-[10px] font-bold tracking-wider uppercase">
            Live 2026
          </span>
          <span>India Union Budget Snapshot</span>
          <Sparkles className="w-3.5 h-3.5 text-[#7fee64]" />
        </div>

        <div className="hidden lg:flex items-center gap-7 text-[14px] font-medium text-[#ddffdc]">
          <Link href="/" className={`hover:text-[#7fee64] transition-colors flex items-center gap-1.5 ${pathname === '/' ? 'font-semibold text-[#7fee64]' : 'text-[#8cab87]'}`}>
            <PieChart className={`w-4 h-4 ${pathname === '/' ? 'text-[#7fee64]' : 'text-[#677d64]'}`} />
            Dashboard
          </Link>
          <Link href="/budgets" className={`hover:text-[#7fee64] transition-colors flex items-center gap-1.5 ${pathname === '/budgets' ? 'font-semibold text-[#7fee64]' : 'text-[#8cab87]'}`}>
            <Layers className={`w-4 h-4 ${pathname === '/budgets' ? 'text-[#7fee64]' : 'text-[#677d64]'}`} />
            Sectors
          </Link>
          <Link href="/compare" className={`hover:text-[#7fee64] transition-colors flex items-center gap-1.5 ${pathname === '/compare' ? 'font-semibold text-[#7fee64]' : 'text-[#8cab87]'}`}>
            <SlidersHorizontal className={`w-4 h-4 ${pathname === '/compare' ? 'text-[#7fee64]' : 'text-[#677d64]'}`} />
            Compare
          </Link>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          <Link
            href="#simulator"
            className="hidden sm:inline-flex items-center gap-1.5 text-[14px] font-medium text-[#8cab87] hover:text-[#ddffdc] transition-colors px-3 py-1.5"
          >
            Explore AI
          </Link>

          {/* Modal Accent Pill CTA */}
          <Link
            href="/budgets"
            className="bg-[#7fee64] hover:bg-[#9bf387] text-[#181818] font-semibold text-[14px] rounded-full px-4 py-1.5 flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(127,238,100,0.3)]"
          >
            <span>View Sectors</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-1.5 rounded-md text-[#ddffdc] hover:bg-[#181818] transition-colors"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>
    </header>
  );
};
