'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Search,
  SlidersHorizontal,
  ArrowLeftRight,
  Bookmark,
  Settings,
  HelpCircle,
  Activity,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Remember collapsed preference in localStorage
  useEffect(() => {
    const saved = localStorage.getItem('tx_sidebar_collapsed');
    if (saved !== null) {
      setIsCollapsed(saved === 'true');
    }
  }, []);

  const toggleCollapse = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    localStorage.setItem('tx_sidebar_collapsed', String(next));
  };

  const navLinkClass =
    'flex items-center gap-3 px-3.5 py-2.5 rounded-[8px] font-medium text-[14px] transition-all duration-200';
  const activeClass = 'bg-[var(--bg-hover)] text-[var(--accent-pulse)] font-semibold border border-[var(--border-color)]';
  const inactiveClass = 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]';

  return (
    <aside
      className={`hidden lg:flex flex-col bg-[var(--bg-card)] rounded-[8px] border border-[var(--border-color)] shadow-lg h-[calc(100vh-6rem)] sticky top-20 transition-all duration-300 ${
        isCollapsed ? 'w-[72px] p-3' : 'w-[260px] p-5'
      }`}
    >
      {/* Header & Collapse Toggle */}
      <div className="flex items-center justify-between mb-6 pb-2 border-b border-[var(--border-subtle)]">
        {!isCollapsed && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--badge-bg)] border border-[var(--badge-border)] text-[var(--accent-pulse)] text-[11px] font-bold tracking-wide w-fit">
            <span className="w-2 h-2 rounded-full bg-[var(--accent-pulse)] animate-pulse" />
            <span>REDIS CACHE</span>
          </div>
        )}

        <button
          onClick={toggleCollapse}
          className={`p-1.5 rounded-md bg-[var(--bg-hover)] border border-[var(--border-color)] text-[var(--text-primary)] hover:border-[var(--accent-pulse)] hover:text-[var(--accent-pulse)] transition-all cursor-pointer ${
            isCollapsed ? 'mx-auto' : ''
          }`}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {!isCollapsed && (
        <h2 className="text-[11px] font-bold uppercase tracking-[0.6px] text-[var(--text-secondary)] px-3 mb-2">
          Navigation
        </h2>
      )}

      {/* Main Nav Links */}
      <nav className="flex-1 space-y-1">
        <Link
          href="/"
          title="Dashboard"
          className={`${navLinkClass} ${pathname === '/' ? activeClass : inactiveClass} ${
            isCollapsed ? 'justify-center px-0' : ''
          }`}
        >
          <LayoutDashboard className={`w-4 h-4 shrink-0 ${pathname === '/' ? 'text-[var(--accent-pulse)]' : 'text-[var(--text-muted)]'}`} />
          {!isCollapsed && <span>Dashboard</span>}
        </Link>

        <Link
          href="/budgets"
          title="Budget Search"
          className={`${navLinkClass} ${pathname === '/budgets' ? activeClass : inactiveClass} ${
            isCollapsed ? 'justify-center px-0' : ''
          }`}
        >
          <Search className={`w-4 h-4 shrink-0 ${pathname === '/budgets' ? 'text-[var(--accent-pulse)]' : 'text-[var(--text-muted)]'}`} />
          {!isCollapsed && <span>Budget Search</span>}
        </Link>

        <Link
          href="/simulator"
          title="AI Simulator"
          className={`${navLinkClass} ${pathname === '/simulator' ? activeClass : inactiveClass} ${
            isCollapsed ? 'justify-center px-0' : ''
          }`}
        >
          <SlidersHorizontal className={`w-4 h-4 shrink-0 ${pathname === '/simulator' ? 'text-[var(--accent-pulse)]' : 'text-[var(--text-muted)]'}`} />
          {!isCollapsed && <span>AI Simulator</span>}
        </Link>

        <Link
          href="/compare"
          title="Year Compare"
          className={`${navLinkClass} ${pathname === '/compare' ? activeClass : inactiveClass} ${
            isCollapsed ? 'justify-center px-0' : ''
          }`}
        >
          <ArrowLeftRight className={`w-4 h-4 shrink-0 ${pathname === '/compare' ? 'text-[var(--accent-pulse)]' : 'text-[var(--text-muted)]'}`} />
          {!isCollapsed && <span>Year Compare</span>}
        </Link>

        <Link
          href="/bookmarks"
          title="Saved Bookmarks"
          className={`${navLinkClass} ${pathname === '/bookmarks' ? activeClass : inactiveClass} ${
            isCollapsed ? 'justify-center px-0' : ''
          }`}
        >
          <Bookmark className={`w-4 h-4 shrink-0 ${pathname === '/bookmarks' ? 'text-[var(--accent-pulse)]' : 'text-[var(--text-muted)]'}`} />
          {!isCollapsed && <span>Saved Bookmarks</span>}
        </Link>
      </nav>

      {/* Bottom Quick Info & Settings */}
      <div className="pt-4 border-t border-[var(--border-subtle)] space-y-3">
        {!isCollapsed && (
          <div className="bg-[var(--bg-hover)] border border-[var(--border-color)] rounded-[8px] p-3 text-[12px] text-[var(--text-primary)]">
            <div className="flex items-center gap-1.5 font-semibold mb-1 text-[var(--accent-pulse)]">
              <Activity className="w-3.5 h-3.5 text-[var(--accent-pulse)]" />
              <span>Target Latency</span>
            </div>
            <p className="text-[11px] text-[var(--text-secondary)]">Sub-2s initial load with 24h Redis TTL caching.</p>
          </div>
        )}

        <div
          className={`flex items-center text-[13px] text-[var(--text-muted)] ${
            isCollapsed ? 'flex-col gap-3 justify-center' : 'justify-between px-2'
          }`}
        >
          <Link
            href="/profile"
            title="Settings & Profile"
            className={`flex items-center gap-1.5 transition-colors ${
              pathname === '/profile' || pathname === '/settings'
                ? 'text-[var(--accent-pulse)] font-semibold'
                : 'hover:text-[var(--text-primary)] text-[var(--text-secondary)]'
            }`}
          >
            <Settings className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>Settings</span>}
          </Link>
          <button
            title="Docs"
            className="flex items-center gap-1.5 hover:text-[var(--text-primary)] text-[var(--text-secondary)] transition-colors cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>Docs</span>}
          </button>
        </div>
      </div>
    </aside>
  );
};


