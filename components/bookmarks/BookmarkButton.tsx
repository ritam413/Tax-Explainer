'use client';

import React, { useState } from 'react';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { BookmarkItemType, BookmarkItemMetadata } from '@/types/budget';
import { useBookmarks } from '@/components/providers/BookmarkProvider';
import { cn } from '@/lib/utils/cn';

interface BookmarkButtonProps {
  itemType: BookmarkItemType;
  itemId: string;
  title: string;
  subtitle?: string;
  metadata?: BookmarkItemMetadata;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export const BookmarkButton: React.FC<BookmarkButtonProps> = ({
  itemType,
  itemId,
  title,
  subtitle,
  metadata,
  size = 'md',
  showLabel = false,
  className,
}) => {
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const [isPending, setIsPending] = useState(false);

  const active = isBookmarked(itemId);

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (isPending) return;

    setIsPending(true);
    try {
      await toggleBookmark({
        item_type: itemType,
        item_id: itemId,
        title,
        subtitle,
        metadata,
      });
    } finally {
      setIsPending(false);
    }
  };

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const buttonSizes = {
    sm: 'p-1.5 text-[12px]',
    md: 'p-2 text-[13px]',
    lg: 'p-2.5 text-[14px]',
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-label={active ? `Remove ${title} from bookmarks` : `Save ${title} to bookmarks`}
      aria-pressed={active}
      title={active ? 'Bookmarked' : 'Save bookmark'}
      className={cn(
        'inline-flex items-center space-x-1.5 rounded-[8px] border transition-all duration-200 cursor-pointer select-none focus:outline-none focus:ring-1 focus:ring-[#7fee64]',
        active
          ? 'bg-[#7fee64]/15 border-[#7fee64] text-[#7fee64] shadow-[0_0_10px_rgba(127,238,100,0.15)]'
          : 'bg-[#212525]/60 border-[#485346] text-[#8cab87] hover:text-[#7fee64] hover:border-[#7fee64]/60 hover:bg-[#212525]',
        buttonSizes[size],
        isPending && 'opacity-60 cursor-wait animate-pulse',
        className
      )}
    >
      {active ? (
        <BookmarkCheck className={cn(iconSizes[size], 'fill-[#7fee64] text-[#7fee64]')} />
      ) : (
        <Bookmark className={iconSizes[size]} />
      )}
      {showLabel && (
        <span className="font-manrope font-medium">
          {active ? 'Saved' : 'Bookmark'}
        </span>
      )}
    </button>
  );
};
