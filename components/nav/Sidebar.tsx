'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Search, SlidersHorizontal, ArrowLeftRight, Bookmark, Settings, HelpCircle, Activity } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  
  const navLinkClass = "flex items-center gap-3 px-3.5 py-2.5 rounded-[8px] font-medium text-[14px] transition-colors";
  const activeClass = "bg-[#212525] text-[#7fee64] font-semibold border border-[#7fee64]/30";
  const inactiveClass = "text-[#8cab87] hover:bg-[#212525] hover:text-[#ddffdc]";

  return (
    <aside className="hidden lg:flex flex-col w-[260px] bg-[#181818] rounded-[8px] border border-[#485346] p-5 shadow-lg h-[calc(100vh-6rem)] sticky top-20">
      {/* Sidebar Header & Status */}
      <div className="mb-6">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#7fee64]/10 border border-[#7fee64]/30 text-[#7fee64] text-[11px] font-bold tracking-wide w-fit mb-3">
          <span className="w-2 h-2 rounded-full bg-[#7fee64] animate-pulse" />
          <span>REDIS CACHE ACTIVE</span>
        </div>
        <h2 className="text-[11px] font-bold uppercase tracking-[0.6px] text-[#9cbf93] px-3">
          Navigation
        </h2>
      </div>

      {/* Main Nav Links */}
      <nav className="flex-1 space-y-1">
        <Link
          href="/"
          className={`${navLinkClass} ${pathname === '/' ? activeClass : inactiveClass}`}
        >
          <LayoutDashboard className={`w-4 h-4 ${pathname === '/' ? 'text-[#7fee64]' : 'text-[#677d64]'}`} />
          Dashboard
        </Link>
        <Link
          href="/budgets"
          className={`${navLinkClass} ${pathname === '/budgets' ? activeClass : inactiveClass}`}
        >
          <Search className={`w-4 h-4 ${pathname === '/budgets' ? 'text-[#7fee64]' : 'text-[#677d64]'}`} />
          Budget Search
        </Link>
        <Link
          href="#simulator"
          className={`${navLinkClass} ${inactiveClass}`}
        >
          <SlidersHorizontal className="w-4 h-4 text-[#677d64]" />
          AI Simulator
        </Link>
        <Link
          href="/compare"
          className={`${navLinkClass} ${pathname === '/compare' ? activeClass : inactiveClass}`}
        >
          <ArrowLeftRight className={`w-4 h-4 ${pathname === '/compare' ? 'text-[#7fee64]' : 'text-[#677d64]'}`} />
          Year Compare
        </Link>
        <Link
          href="#bookmarks"
          className={`${navLinkClass} ${inactiveClass}`}
        >
          <Bookmark className="w-4 h-4 text-[#677d64]" />
          Saved Sectors
        </Link>
      </nav>

      {/* Bottom Quick Info & Settings */}
      <div className="pt-4 border-t border-[#1f2a33] space-y-3">
        <div className="bg-[#212525] border border-[#485346] rounded-[8px] p-3 text-[12px] text-[#ddffdc]">
          <div className="flex items-center gap-1.5 font-semibold mb-1 text-[#7fee64]">
            <Activity className="w-3.5 h-3.5 text-[#7fee64]" />
            <span>Target Latency</span>
          </div>
          <p className="text-[11px] text-[#8cab87]">Sub-2s initial load with 24h Redis TTL caching.</p>
        </div>

        <div className="flex items-center justify-between text-[13px] text-[#677d64] px-2">
          <button className="flex items-center gap-1.5 hover:text-[#ddffdc] transition-colors">
            <Settings className="w-3.5 h-3.5" />
            Settings
          </button>
          <button className="flex items-center gap-1.5 hover:text-[#ddffdc] transition-colors">
            <HelpCircle className="w-3.5 h-3.5" />
            Docs
          </button>
        </div>
      </div>
    </aside>
  );
};
