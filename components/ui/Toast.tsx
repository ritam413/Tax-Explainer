"use client";

import React, { useEffect } from "react";
import { AlertCircle, X } from "lucide-react";

export interface ToastProps {
  message: string;
  type?: "error" | "info" | "success";
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, type = "error", onClose, duration = 4000 }: ToastProps) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-[#181818] border border-[#485346] shadow-[0_10px_25px_rgba(0,0,0,0.6)] text-[#ddffdc] animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#ea4335]/20 text-[#ea4335]">
        <AlertCircle className="w-5 h-5" />
      </div>
      <span className="text-sm font-medium pr-2 text-[#ddffdc]">{message}</span>
      <button
        onClick={onClose}
        className="p-1 rounded-full text-[#8cab87] hover:text-[#ddffdc] hover:bg-[#212525] transition-colors"
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

