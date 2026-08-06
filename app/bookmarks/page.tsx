'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Bookmark,
  Search,
  Trash2,
  ExternalLink,
  PieChart,
  ArrowLeftRight,
  ShieldAlert,
  Sparkles,
  ArrowLeft,
  UserCheck,
} from 'lucide-react';
import { Navbar } from '@/components/nav/Navbar';
import { Sidebar } from '@/components/nav/Sidebar';
import { MobileMenu } from '@/components/nav/MobileMenu';
import { useBookmarks } from '@/components/providers/BookmarkProvider';
import { useAuth } from '@/components/providers/AuthProvider';
import { BookmarkItem } from '@/types/budget';

export default function BookmarksPage() {
  const { bookmarks, loading, removeBookmarkById, lastErrorMessage } = useBookmarks();
  const { user, isLoggedIn, openAuthModal, loginDemoUser } = useAuth();

  const [activeFilter, setActiveFilter] = useState<'all' | 'sector' | 'comparison'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const sectorBookmarks = bookmarks.filter((bm) => bm.item_type === 'sector');
  const comparisonBookmarks = bookmarks.filter((bm) => bm.item_type === 'comparison');

  const filteredBookmarks = bookmarks.filter((bm) => {
    // Filter by type
    if (activeFilter !== 'all' && bm.item_type !== activeFilter) {
      return false;
    }
    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = (bm.title || '').toLowerCase().includes(q);
      const matchSubtitle = (bm.subtitle || '').toLowerCase().includes(q);
      const matchCategory = (bm.metadata?.category || '').toLowerCase().includes(q);
      return matchTitle || matchSubtitle || matchCategory;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] flex flex-col font-inter-variable antialiased pb-16 transition-colors duration-200">
      {/* Global Navigation Shell */}
      <Navbar
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        isMobileMenuOpen={isMobileMenuOpen}
      />
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      <main className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 mt-6 flex gap-8 flex-1">
        <Sidebar />

        <div className="flex-1 space-y-8 min-w-0">
          {/* Header Section */}
          <header className="pt-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-[var(--accent-pulse)] hover:text-[var(--text-primary)] text-sm font-semibold mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                    Cross-Device Persistence
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[var(--badge-bg)] border border-[var(--badge-border)] text-[var(--accent-pulse)] text-[11px] font-mono">
                    {bookmarks.length} Saved
                  </span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)] font-goga">
                  Saved Bookmarks &amp; Comparisons
                </h1>
              </div>

              {/* Auth status indicator */}
              {!isLoggedIn ? (
                <div className="flex items-center gap-3 modal-card p-3">
                  <div className="text-xs text-[var(--text-secondary)]">
                    <span className="text-amber-500 font-semibold">Guest Session</span>
                    <p className="text-[11px]">Sign in to sync across devices</p>
                  </div>
                  <button
                    onClick={openAuthModal}
                    className="lime-pill-cta px-3 py-1.5 text-xs font-bold cursor-pointer"
                  >
                    Sign In
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2.5 modal-card px-4 py-2 text-xs">
                  <UserCheck className="w-4 h-4 text-[var(--accent-pulse)]" />
                  <div>
                    <span className="font-bold text-[var(--text-primary)]">{user?.name}</span>
                    <span className="block text-[11px] text-[var(--text-secondary)]">{user?.email}</span>
                  </div>
                </div>
              )}
            </div>

            <p className="text-sm text-[var(--text-secondary)] max-w-3xl mt-3">
              Access your bookmarked budget sectors, custom allocation snapshots, and year-over-year comparisons for instant retrieval.
            </p>
          </header>

          {/* Rollback Error Alert Banner */}
          {lastErrorMessage && (
            <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 flex items-center justify-between text-xs text-rose-400">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{lastErrorMessage}</span>
              </div>
            </div>
          )}

          {/* Search & Filter Controls */}
          <div className="modal-card p-4 shadow-lg space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {/* Filter Tabs */}
              <div className="flex items-center gap-1 bg-[var(--bg-hover)] p-1 rounded-lg border border-[var(--border-color)] text-xs">
                <button
                  onClick={() => setActiveFilter('all')}
                  className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                    activeFilter === 'all'
                      ? 'bg-[var(--accent-bg)] text-[var(--accent-text)] font-bold'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  All ({bookmarks.length})
                </button>
                <button
                  onClick={() => setActiveFilter('sector')}
                  className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                    activeFilter === 'sector'
                      ? 'bg-[var(--accent-bg)] text-[var(--accent-text)] font-bold'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  Sectors ({sectorBookmarks.length})
                </button>
                <button
                  onClick={() => setActiveFilter('comparison')}
                  className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                    activeFilter === 'comparison'
                      ? 'bg-[var(--accent-bg)] text-[var(--accent-text)] font-bold'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  Comparisons ({comparisonBookmarks.length})
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <input
                  type="text"
                  placeholder="Filter saved bookmarks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 text-xs bg-[var(--bg-hover)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] placeholder:[var(--text-muted)] focus:outline-none focus:border-[var(--accent-pulse)]"
                />
              </div>
            </div>
          </div>

          {/* Bookmarks List Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-36 modal-card rounded-xl animate-pulse" />
              ))}
            </div>
          ) : filteredBookmarks.length === 0 ? (
            /* Empty State */
            <div className="modal-card p-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-[var(--bg-hover)] border border-[var(--border-color)] flex items-center justify-center mx-auto text-[var(--text-muted)]">
                <Bookmark className="w-6 h-6" />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h3 className="font-manrope text-lg font-bold text-[var(--text-primary)]">
                  {bookmarks.length === 0 ? 'No Saved Bookmarks Yet' : 'No Bookmarks Match Your Filter'}
                </h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  {bookmarks.length === 0
                    ? 'Explore federal budget sectors or perform year-over-year comparisons to save items for instant retrieval.'
                    : 'Try clearing your search query or selecting a different tab filter.'}
                </p>
              </div>

              {bookmarks.length === 0 && (
                <div className="flex flex-wrap justify-center gap-3 pt-2">
                  <Link
                    href="/budgets"
                    className="lime-pill-cta px-4 py-2 font-manrope font-bold text-xs"
                  >
                    Explore Budget Sectors
                  </Link>
                  <Link
                    href="/compare"
                    className="px-4 py-2 bg-[var(--bg-hover)] border border-[var(--border-color)] text-[var(--text-primary)] font-manrope font-semibold text-xs rounded-full hover:border-[var(--accent-pulse)] transition-colors"
                  >
                    Compare Budgets
                  </Link>
                  {!isLoggedIn && (
                    <button
                      onClick={loginDemoUser}
                      className="px-4 py-2 bg-[var(--badge-bg)] border border-[var(--badge-border)] text-[var(--accent-pulse)] font-manrope font-semibold text-xs rounded-full transition-colors cursor-pointer"
                    >
                      Demo Sign-In
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredBookmarks.map((bm: BookmarkItem) => {
                const isOrphaned = bm.metadata?.isOrphaned;

                return (
                  <div
                    key={bm.id}
                    className="group modal-card hover:border-[var(--accent-pulse)]/60 rounded-xl p-5 shadow-lg transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      {/* Top Header Row */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 rounded-lg bg-[var(--badge-bg)] border border-[var(--badge-border)] text-[var(--accent-pulse)]">
                            {bm.item_type === 'sector' ? (
                              <PieChart className="w-4 h-4" />
                            ) : (
                              <ArrowLeftRight className="w-4 h-4" />
                            )}
                          </div>
                          <div>
                            <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-secondary)]">
                              {bm.item_type}
                            </span>
                            <h3 className="font-manrope font-bold text-base text-[var(--text-primary)] leading-tight">
                              {bm.title}
                            </h3>
                          </div>
                        </div>

                        {/* Quick Delete Action */}
                        <button
                          onClick={() => removeBookmarkById(bm.id)}
                          className="p-1.5 text-[var(--text-muted)] hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                          title="Remove bookmark"
                          aria-label={`Remove ${bm.title}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Subtitle / Description */}
                      <p className="text-xs text-[var(--text-secondary)] line-clamp-2">
                        {bm.subtitle || bm.metadata?.description || 'Saved budget item snapshot.'}
                      </p>

                      {/* Metadata Pill Stats */}
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        {bm.metadata?.allocatedAmount !== undefined && (
                          <span className="px-2.5 py-1 bg-[var(--bg-hover)] border border-[var(--border-color)] rounded-md text-xs font-mono text-[var(--text-primary)]">
                            {bm.metadata.currency || '₹'}
                            {bm.metadata.allocatedAmount.toFixed(2)} {bm.metadata.unit || 'Lakh Cr'}
                          </span>
                        )}

                        {bm.metadata?.percentageOfTotal !== undefined && (
                          <span className="px-2 py-1 bg-[var(--badge-bg)] border border-[var(--badge-border)] rounded-md text-xs font-mono text-[var(--accent-pulse)]">
                            {bm.metadata.percentageOfTotal}% of budget
                          </span>
                        )}

                        {bm.metadata?.totalDelta !== undefined && (
                          <span className="px-2 py-1 bg-[var(--badge-bg)] border border-[var(--badge-border)] rounded-md text-xs font-mono text-[var(--accent-pulse)]">
                            Delta: {bm.metadata.totalDelta >= 0 ? '+' : ''}
                            {bm.metadata.totalDelta.toFixed(2)} Lakh Cr
                          </span>
                        )}
                      </div>

                      {/* Edge Case Alert: Deleted / Updated Budget Item */}
                      {isOrphaned && (
                        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-start gap-2 text-xs text-amber-400">
                          <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold">Underlying budget data updated or removed</span>
                            <p className="text-[11px] opacity-90 mt-0.5">
                              {bm.metadata.statusNote || 'The original budget sector was updated in a recent dataset revision.'}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Bottom CTA Row */}
                    <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--text-muted)]">
                      <span>Saved {new Date(bm.created_at).toLocaleDateString()}</span>

                      {bm.item_type === 'sector' ? (
                        <Link
                          href={`/budgets?query=${encodeURIComponent(bm.metadata?.category || bm.title)}`}
                          className="inline-flex items-center gap-1.5 text-[var(--accent-pulse)] hover:text-[var(--text-primary)] font-medium transition-colors"
                        >
                          <span>Explore Sector</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      ) : (
                        <Link
                          href="/compare"
                          className="inline-flex items-center gap-1.5 text-[var(--accent-pulse)] hover:text-[var(--text-primary)] font-medium transition-colors"
                        >
                          <span>View Comparison</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
