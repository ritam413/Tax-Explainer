'use client';

import React, { useState, useEffect } from 'react';
import { User, Shield, Moon, Sun, CheckCircle2, UserCheck, AlertCircle, Save, LogOut, Sparkles } from 'lucide-react';
import { Navbar } from '@/components/nav/Navbar';
import { Sidebar } from '@/components/nav/Sidebar';
import { MobileMenu } from '@/components/nav/MobileMenu';
import { useAuth } from '@/components/providers/AuthProvider';
import { useTheme } from '@/components/providers/ThemeProvider';
import { Toast } from '@/components/ui/Toast';

const COUNTRIES = [
  'India',
  'United States',
  'Japan',
  'Russia',
];

const PROFESSIONS = [
  'Senior Economic Analyst',
  'Policy Researcher',
  'Financial Consultant',
  'Journalist / Media',
  'Student / Academic',
  'Government / Public Official',
  'Citizen / Taxpayer',
  'Other',
];

export default function ProfilePage() {
  const { user, isLoggedIn, loginDemoUser, logout, updateProfile, openAuthModal } = useAuth();
  const { theme, setTheme } = useTheme();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [name, setName] = useState('');
  const [country, setCountry] = useState('India');
  const [profession, setProfession] = useState('Senior Economic Analyst');
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  // Load user data or guest profile from localStorage on mount
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setCountry(user.country || 'India');
      setProfession(user.profession || 'Senior Economic Analyst');
    } else {
      try {
        const savedGuest = localStorage.getItem('fiscalquant_guest_profile');
        if (savedGuest) {
          const parsed = JSON.parse(savedGuest);
          setName(parsed.name || 'Guest Explorer');
          setCountry(parsed.country || 'India');
          setProfession(parsed.profession || 'Citizen / Taxpayer');
        } else {
          setName('Guest Explorer');
          setCountry('India');
          setProfession('Citizen / Taxpayer');
        }
      } catch {
        setName('Guest Explorer');
      }
    }
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (isLoggedIn && user) {
        await updateProfile({
          name: name.trim(),
          country,
          profession,
          theme_preference: theme,
        });
        setToastType('success');
        setToastMessage('Profile updated successfully and synced to backend!');
      } else {
        // Save guest profile in localStorage
        const guestData = { name: name.trim(), country, profession };
        localStorage.setItem('fiscalquant_guest_profile', JSON.stringify(guestData));
        setToastType('success');
        setToastMessage('Guest preference saved to local storage!');
      }
    } catch {
      setToastType('error');
      setToastMessage('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] transition-colors duration-200">
      {/* Top Header Navbar */}
      <Navbar
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        isMobileMenuOpen={isMobileMenuOpen}
      />

      {/* Mobile Nav Drawer */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 pt-2 pb-8">
        <div className="flex gap-8">
          {/* Left Desktop Sidebar */}
          <Sidebar />

          {/* Main Profile Content */}
          <main className="flex-1 min-w-0 space-y-6">
            {/* Hero Banner */}
            <div className="modal-card p-6 border border-[var(--border-color)] bg-[var(--bg-card)] rounded-[8px]">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-[var(--badge-bg)] border border-[var(--badge-border)] flex items-center justify-center text-[var(--accent-pulse)]">
                    <User className="w-7 h-7" />
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-2xl font-bold font-manrope text-[var(--text-primary)]">
                      {isLoggedIn ? (user?.name || 'User Profile') : 'Guest Profile & Settings'}
                    </h1>
                    <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5">
                      {isLoggedIn ? user?.email : 'Unauthenticated Guest Session'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isLoggedIn ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[var(--badge-bg)] border border-[var(--badge-border)] text-[var(--accent-pulse)]">
                      <UserCheck className="w-3.5 h-3.5" />
                      Authenticated
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 border border-amber-500/30 text-amber-400">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Guest Mode
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Profile Form & Theme Settings Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Profile Details Form (2 cols) */}
              <div className="lg:col-span-2 modal-card p-6 border border-[var(--border-color)] bg-[var(--bg-card)] rounded-[8px] space-y-6">
                <div>
                  <h2 className="text-lg font-bold font-manrope text-[var(--text-primary)] flex items-center gap-2">
                    <Shield className="w-5 h-5 text-[var(--accent-pulse)]" />
                    Personal Details
                  </h2>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">
                    Manage your profile information for personalized tax insights and country baseline context.
                  </p>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your name"
                      required
                      className="w-full px-3 py-2 text-sm bg-[var(--bg-hover)] border border-[var(--border-color)] rounded-[8px] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-pulse)]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                        Primary Country Context
                      </label>
                      <select
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-[var(--bg-hover)] border border-[var(--border-color)] rounded-[8px] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-pulse)] cursor-pointer"
                      >
                        {COUNTRIES.map((c) => (
                          <option key={c} value={c} className="bg-[var(--bg-card)] text-[var(--text-primary)]">
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                        Profession / Role
                      </label>
                      <select
                        value={profession}
                        onChange={(e) => setProfession(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-[var(--bg-hover)] border border-[var(--border-color)] rounded-[8px] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-pulse)] cursor-pointer"
                      >
                        {PROFESSIONS.map((p) => (
                          <option key={p} value={p} className="bg-[var(--bg-card)] text-[var(--text-primary)]">
                            {p}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={isLoggedIn ? user?.email : 'guest@fiscalquant.org (Guest Mode)'}
                      disabled
                      className="w-full px-3 py-2 text-sm bg-[var(--bg-hover)]/50 border border-[var(--border-subtle)] rounded-[8px] text-[var(--text-muted)] cursor-not-allowed"
                    />
                    <p className="text-[11px] text-[var(--text-muted)] mt-1">
                      {isLoggedIn
                        ? 'Email is managed through your authentication provider.'
                        : 'Log in to link your bookmarks and saved simulations to a permanent email.'}
                    </p>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="lime-pill-cta px-5 py-2 text-xs font-medium flex items-center gap-2 disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      {isSaving ? 'Saving Updates...' : 'Save Profile Changes'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Theme Preference & Auth Status (1 col) */}
              <div className="space-y-6">
                {/* Theme Selector Card */}
                <div className="modal-card p-6 border border-[var(--border-color)] bg-[var(--bg-card)] rounded-[8px] space-y-4">
                  <div>
                    <h2 className="text-lg font-bold font-manrope text-[var(--text-primary)] flex items-center gap-2">
                      <Sun className="w-5 h-5 text-[var(--accent-pulse)]" />
                      Appearance Theme
                    </h2>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">
                      Select your preferred workspace visual theme. Persisted automatically.
                    </p>
                  </div>

                  <div className="space-y-3 pt-1">
                    {/* Dark Theme Button */}
                    <button
                      type="button"
                      onClick={() => setTheme('dark')}
                      className={`w-full p-3 rounded-[8px] border text-left transition-all flex items-center justify-between cursor-pointer ${
                        theme === 'dark'
                          ? 'bg-[#181818] border-[#7fee64] ring-1 ring-[#7fee64] text-[#ddffdc]'
                          : 'bg-[var(--bg-hover)] border-[var(--border-color)] text-[var(--text-primary)] opacity-80 hover:opacity-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#000000] border border-[#485346] flex items-center justify-center text-[#7fee64]">
                          <Moon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold font-manrope text-white">Phosphor Terminal Dark</div>
                          <div className="text-[11px] text-[#8cab87]">Void black, neon lime, high contrast</div>
                        </div>
                      </div>
                      {theme === 'dark' && <CheckCircle2 className="w-4 h-4 text-[#7fee64]" />}
                    </button>

                    {/* Light Theme Button */}
                    <button
                      type="button"
                      onClick={() => setTheme('light')}
                      className={`w-full p-3 rounded-[8px] border text-left transition-all flex items-center justify-between cursor-pointer ${
                        theme === 'light'
                          ? 'bg-[#ffffff] border-[#15803d] ring-1 ring-[#15803d] text-[#111c10]'
                          : 'bg-[var(--bg-hover)] border-[var(--border-color)] text-[var(--text-primary)] opacity-80 hover:opacity-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#f4f7f4] border border-[#c8dac8] flex items-center justify-center text-[#15803d]">
                          <Sun className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold font-manrope text-[#111c10]">Phosphor Mint Light</div>
                          <div className="text-[11px] text-[#3b523a]">Clean mint ice, emerald accent (WCAG AA)</div>
                        </div>
                      </div>
                      {theme === 'light' && <CheckCircle2 className="w-4 h-4 text-[#15803d]" />}
                    </button>
                  </div>
                </div>

                {/* Account Action Card */}
                <div className="modal-card p-6 border border-[var(--border-color)] bg-[var(--bg-card)] rounded-[8px] space-y-4">
                  <h3 className="text-sm font-bold font-manrope text-[var(--text-primary)]">
                    Session & Account
                  </h3>
                  {isLoggedIn ? (
                    <div className="space-y-3">
                      <p className="text-xs text-[var(--text-secondary)]">
                        Logged in as <strong className="text-[var(--text-primary)]">{user?.name}</strong> ({user?.email})
                      </p>
                      <button
                        type="button"
                        onClick={logout}
                        className="w-full px-3 py-2 text-xs font-medium rounded-[8px] border border-rose-500/30 text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 flex items-center justify-center gap-2 cursor-pointer transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-xs text-[var(--text-secondary)]">
                        You are currently in guest mode. Log in to sync bookmarks and preferences across browsers.
                      </p>
                      <div className="space-y-2">
                        <button
                          type="button"
                          onClick={loginDemoUser}
                          className="w-full lime-pill-cta px-4 py-2 text-xs font-medium flex items-center justify-center gap-2"
                        >
                          <Sparkles className="w-4 h-4" />
                          Log In as Demo Analyst
                        </button>
                        <button
                          type="button"
                          onClick={openAuthModal}
                          className="w-full px-4 py-2 text-xs font-medium rounded-full border border-[var(--border-color)] bg-[var(--bg-hover)] text-[var(--text-primary)] hover:border-[var(--accent-pulse)] flex items-center justify-center gap-2 cursor-pointer"
                        >
                          Open Login Options
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Notification Toast */}
      {toastMessage && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setToastMessage(null)}
        />
      )}
    </div>
  );
}
