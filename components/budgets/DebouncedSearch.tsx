"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Loader2 } from "lucide-react";

interface DebouncedSearchProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
}

export function DebouncedSearch({ onSearch, isLoading = false }: DebouncedSearchProps) {
  const [inputValue, setInputValue] = useState("");
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(() => {
      onSearch(inputValue);
    }, 300);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [inputValue, onSearch]);

  return (
    <div className="relative w-full max-w-xl">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type="text"
        className="block w-full pl-10 pr-10 py-2 border border-circuit-border rounded-md leading-5 bg-ground-iron text-phosphor-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-lime-pulse focus:border-lime-pulse sm:text-sm transition duration-150 ease-in-out"
        placeholder="Search budget categories..."
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
      />
      {isLoading && (
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <Loader2 className="h-5 w-5 text-lime-pulse animate-spin" />
        </div>
      )}
    </div>
  );
}
