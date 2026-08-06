'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { BookmarkItem, BookmarkItemType, BookmarkItemMetadata } from '@/types/budget';
import { useAuth } from './AuthProvider';

interface ToggleBookmarkInput {
  item_type: BookmarkItemType;
  item_id: string;
  title: string;
  subtitle?: string;
  metadata?: BookmarkItemMetadata;
}

interface BookmarkContextType {
  bookmarks: BookmarkItem[];
  loading: boolean;
  isBookmarked: (itemId: string) => boolean;
  toggleBookmark: (input: ToggleBookmarkInput) => Promise<boolean>;
  removeBookmarkById: (id: string) => Promise<boolean>;
  refreshBookmarks: () => Promise<void>;
  lastErrorMessage: string | null;
}

const BookmarkContext = createContext<BookmarkContextType | undefined>(undefined);

export const BookmarkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoggedIn, openAuthModal } = useAuth();
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [lastErrorMessage, setLastErrorMessage] = useState<string | null>(null);

  // Fetch bookmarks from API when logged-in user changes
  const fetchBookmarks = useCallback(async () => {
    if (!user || !user.id) {
      setBookmarks([]);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/bookmark?user_id=${encodeURIComponent(user.id)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.bookmarks)) {
          setBookmarks(data.bookmarks);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch bookmarks from server', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  const isBookmarked = useCallback(
    (itemId: string): boolean => {
      if (!itemId) return false;
      return bookmarks.some((bm) => bm.item_id === itemId || bm.id === itemId);
    },
    [bookmarks]
  );

  const toggleBookmark = async (input: ToggleBookmarkInput): Promise<boolean> => {
    // 1. Unauthenticated check edge case
    if (!isLoggedIn || !user) {
      openAuthModal();
      return false;
    }

    const previousBookmarks = [...bookmarks];
    const existing = bookmarks.find(
      (bm) => bm.item_id === input.item_id || bm.id === input.item_id
    );

    setLastErrorMessage(null);

    if (existing) {
      // Optimistic deletion
      const updated = bookmarks.filter((bm) => bm.id !== existing.id && bm.item_id !== input.item_id);
      setBookmarks(updated);

      try {
        const res = await fetch(
          `/api/bookmark?user_id=${encodeURIComponent(user.id)}&id=${encodeURIComponent(existing.id)}`,
          { method: 'DELETE' }
        );

        if (!res.ok) {
          throw new Error(`Server returned status ${res.status}`);
        }
        return true;
      } catch (err: any) {
        // Optimistic UI Rollback on network error or server failure
        console.error('Bookmark deletion failed, rolling back optimistic UI:', err);
        setBookmarks(previousBookmarks);
        setLastErrorMessage('Failed to remove bookmark due to a network error. Action reverted.');
        return false;
      }
    } else {
      // Optimistic creation
      const tempId = `temp-${Date.now()}`;
      const optimisticBookmark: BookmarkItem = {
        id: tempId,
        user_id: user.id,
        item_type: input.item_type,
        item_id: input.item_id,
        title: input.title,
        subtitle: input.subtitle || '',
        created_at: new Date().toISOString(),
        metadata: input.metadata || {},
      };

      setBookmarks([optimisticBookmark, ...previousBookmarks]);

      try {
        const res = await fetch('/api/bookmark', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: user.id,
            item_type: input.item_type,
            item_id: input.item_id,
            title: input.title,
            subtitle: input.subtitle || '',
            metadata: input.metadata || {},
          }),
        });

        if (!res.ok) {
          throw new Error(`Server returned status ${res.status}`);
        }

        const data = await res.json();
        if (data.success && data.bookmark) {
          // Replace temp item with confirmed server item
          setBookmarks((current) =>
            current.map((bm) => (bm.id === tempId ? data.bookmark : bm))
          );
        }
        return true;
      } catch (err: any) {
        // Optimistic UI Rollback on network error or server failure
        console.error('Bookmark creation failed, rolling back optimistic UI:', err);
        setBookmarks(previousBookmarks);
        setLastErrorMessage('Failed to save bookmark due to a network error. Action reverted.');
        return false;
      }
    }
  };

  const removeBookmarkById = async (id: string): Promise<boolean> => {
    if (!user || !user.id) return false;

    const target = bookmarks.find((bm) => bm.id === id || bm.item_id === id);
    if (!target) return false;

    return toggleBookmark({
      item_type: target.item_type,
      item_id: target.item_id,
      title: target.title,
    });
  };

  return (
    <BookmarkContext.Provider
      value={{
        bookmarks,
        loading,
        isBookmarked,
        toggleBookmark,
        removeBookmarkById,
        refreshBookmarks: fetchBookmarks,
        lastErrorMessage,
      }}
    >
      {children}
    </BookmarkContext.Provider>
  );
};

export const useBookmarks = () => {
  const context = useContext(BookmarkContext);
  if (!context) {
    throw new Error('useBookmarks must be used within a BookmarkProvider');
  }
  return context;
};
