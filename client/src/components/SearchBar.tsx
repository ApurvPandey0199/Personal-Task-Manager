import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onSearch: (val: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ value, onSearch }) => {
  const [searchTerm, setSearchTerm] = useState(value);

  // Sync internal state with external changes (e.g., reset)
  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  // Handle 300ms debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      onSearch(searchTerm);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, onSearch]);

  return (
    <div className="relative w-full border border-card-border bg-card/85 backdrop-blur-md rounded-2xl shadow-sm p-3 mb-6 transition-all duration-300">
      <div className="relative w-full">
        <input
          type="text"
          placeholder="Filter tasks by title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex h-10 w-full rounded-xl border border-card-border bg-transparent pl-10 pr-4 py-2 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-foreground placeholder:text-muted"
        />
        <div className="absolute left-3.5 top-3 text-muted pointer-events-none">
          <Search size={16} />
        </div>
      </div>
    </div>
  );
};
