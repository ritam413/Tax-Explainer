'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { Bookmark, ShieldCheck, X, Sparkles, UserCheck } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, loginDemoUser, login } = useAuth();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isAuthModalOpen) {
        closeAuthModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthModalOpen, closeAuthModal]);

  if (!isAuthModalOpen) return null;

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    const userName = name.trim() || email.split('@')[0];
    login({
      id: `usr_${Date.now()}`,
      name: userName,
      email: email.trim(),
    });
    setEmail('');
    setName('');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div className="relative w-full max-w-[440px] bg-[#181818] border border-[#485346] rounded-[8px] p-6 shadow-2xl space-y-5 text-[#ddffdc]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#485346]">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-[#7fee64]/10 border border-[#7fee64]/30 text-[#7fee64]">
              <Bookmark className="w-5 h-5" />
            </div>
            <div>
              <h2 id="auth-modal-title" className="font-manrope text-[18px] font-bold text-white leading-tight">
                Save & Sync Bookmarks
              </h2>
              <p className="text-[12px] text-[#8cab87]">Sign in to access your saved budgets cross-device</p>
            </div>
          </div>
          <button
            onClick={closeAuthModal}
            className="p-1.5 rounded-lg text-[#8cab87] hover:text-white hover:bg-[#212525] transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Benefits banner */}
        <div className="p-3 bg-[#212525] border border-[#485346] rounded-[8px] space-y-2 text-[13px] text-[#8cab87]">
          <div className="flex items-center space-x-2 text-[#7fee64]">
            <Sparkles className="w-4 h-4 shrink-0" />
            <span className="font-medium text-white">Guest Bookmark Notice</span>
          </div>
          <p className="text-[12px] leading-relaxed">
            Bookmarks require an active user session to persist cross-device and protect your saved custom budget allocations.
          </p>
        </div>

        {/* Quick Demo Sign In Action */}
        <div className="space-y-2">
          <label className="text-[11px] font-mono tracking-wider uppercase text-[#8cab87]">
            Instant Evaluation Access
          </label>
          <button
            onClick={loginDemoUser}
            className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-[#7fee64] hover:bg-[#6ed956] text-[#000000] font-manrope font-bold text-[14px] rounded-full transition-all duration-200 shadow-[0_0_15px_rgba(127,238,100,0.3)] hover:shadow-[0_0_20px_rgba(127,238,100,0.5)] cursor-pointer"
          >
            <UserCheck className="w-4 h-4" />
            <span>1-Click Demo Sign In</span>
          </button>
        </div>

        <div className="flex items-center my-3">
          <div className="flex-1 border-t border-[#485346]" />
          <span className="px-3 text-[11px] font-mono text-[#677d64] uppercase">Or Sign In with Email</span>
          <div className="flex-1 border-t border-[#485346]" />
        </div>

        {/* Custom Login Form */}
        <form onSubmit={handleCustomLogin} className="space-y-3">
          <div>
            <label className="block text-[12px] font-medium text-[#8cab87] mb-1">Your Name</label>
            <input
              type="text"
              placeholder="e.g. Alex Morgan"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-[#000000] border border-[#485346] rounded-[8px] text-[13px] text-[#ddffdc] placeholder-[#677d64] focus:outline-none focus:border-[#7fee64] transition-colors"
            />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-[#8cab87] mb-1">Email Address</label>
            <input
              type="email"
              required
              placeholder="analyst@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-[#000000] border border-[#485346] rounded-[8px] text-[13px] text-[#ddffdc] placeholder-[#677d64] focus:outline-none focus:border-[#7fee64] transition-colors"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2.5 px-4 bg-[#212525] hover:bg-[#2c3232] border border-[#485346] text-[#ddffdc] font-manrope font-semibold text-[13px] rounded-[8px] transition-colors cursor-pointer"
          >
            Continue with Email
          </button>
        </form>

        {/* Footer */}
        <div className="pt-2 flex items-center justify-between text-[11px] text-[#677d64] border-t border-[#485346]/50">
          <div className="flex items-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#7fee64]" />
            <span>Secure Client Session</span>
          </div>
          <button
            onClick={closeAuthModal}
            className="hover:text-[#8cab87] transition-colors cursor-pointer underline underline-offset-2"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
