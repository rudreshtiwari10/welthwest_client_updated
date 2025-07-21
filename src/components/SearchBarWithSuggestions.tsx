import React, { useState, useEffect, useRef, useCallback, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { debounce } from 'lodash';
import TypewriterInput from './TypewriterInput';

interface SearchSuggestion {
  symbol: string;
  name: string;
  exchange: string;
  type: string;
}

interface SearchBarWithSuggestionsProps {
  placeholders: string[];
  className?: string;
  onSearch?: (query: string) => void;
}

const SearchIcon: React.FC<{ className?: string; size?: number }> = ({ className = '', size = 20 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const useStockSuggestions = (initialQuery: string = '') => {
  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSuggestions = useCallback(
    debounce(async (searchQuery: string) => {
      if (searchQuery.length < 2) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`http://localhost:8000/api/yahoo-suggest?q=${encodeURIComponent(searchQuery)}`, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Server error: ${errorText}`);
        }
        
        const data = await response.json();
        if (!data.quotes || !Array.isArray(data.quotes)) {
          throw new Error('Invalid response format from server');
        }
        
        setSuggestions(data.quotes);
      } catch (err) {
        console.error('Search suggestion error:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch suggestions');
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    fetchSuggestions(query);
    return () => {
      fetchSuggestions.cancel();
    };
  }, [query, fetchSuggestions]);

  return { query, setQuery, suggestions, isLoading, error };
};

const SearchBarWithSuggestions: React.FC<SearchBarWithSuggestionsProps> = ({
  placeholders,
  className = '',
  onSearch
}) => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  
  const {
    query: searchQuery,
    setQuery: setSearchQuery,
    suggestions,
    isLoading,
    error
  } = useStockSuggestions();

  useEffect(() => {
    const storedSearches = localStorage.getItem('recentSearches');
    if (storedSearches) {
      setRecentSearches(JSON.parse(storedSearches));
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setShowSuggestions(true);
    setSelectedIndex(-1);
  };

  const handleSearch = (query?: string) => {
    const searchTerm = query || searchQuery;
    if (!searchTerm.trim()) return;

    // Update recent searches
    const updatedSearches = [
      searchTerm,
      ...recentSearches.filter(s => s !== searchTerm)
    ].slice(0, 5);
    setRecentSearches(updatedSearches);
    localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));

    // Perform search
    if (onSearch) {
      onSearch(searchTerm);
    } else {
      // Navigate to stock page instead of markets page
      navigate(`/stock/${searchTerm.split('.')[0]}`); // Remove exchange suffix if present
    }

    setShowSuggestions(false);
    setSearchQuery('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const suggestions_length = suggestions.length || recentSearches.length;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions_length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > -1 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          const selected = suggestions[selectedIndex]?.symbol || recentSearches[selectedIndex];
          if (selected) handleSearch(selected);
        } else {
          handleSearch();
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        break;
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setShowSuggestions(true);
  };

  return (
    <div className="relative" ref={containerRef}>
      <div className="relative flex items-center">
        <TypewriterInput
          value={searchQuery}
          onChange={handleInputChange}
          placeholders={placeholders}
          className={`${className} pr-12`}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
        />
        <button
          onClick={() => handleSearch()}
          className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white transition-colors"
          aria-label="Search"
        >
          <SearchIcon size={20} />
        </button>
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && (searchQuery.trim() || recentSearches.length > 0) && (
        <div className="absolute w-full mt-1 bg-[#2a2f3e] border border-gray-600 rounded-md shadow-lg z-50 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-400">
              Loading suggestions...
            </div>
          ) : error ? (
            <div className="p-4 text-center text-red-400">
              {error}
            </div>
          ) : suggestions.length > 0 ? (
            <ul className="py-1">
              {suggestions.map((suggestion, index) => (
                <li
                  key={suggestion.symbol}
                  className={`px-4 py-2 cursor-pointer transition-colors ${
                    index === selectedIndex
                      ? 'bg-purple-600/30 text-white'
                      : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                  }`}
                  onClick={() => handleSearch(suggestion.symbol)}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-medium">{suggestion.symbol}</span>
                      <span className="ml-2 text-sm text-gray-400">{suggestion.name}</span>
                    </div>
                    <span className="text-xs text-gray-500">{suggestion.exchange}</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : searchQuery.trim() ? (
            <div className="p-4 text-center text-gray-400">
              No suggestions found
            </div>
          ) : recentSearches.length > 0 ? (
            <div>
              <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-700">
                Recent Searches
              </div>
              <ul className="py-1">
                {recentSearches.map((search, index) => (
                  <li
                    key={search}
                    className={`px-4 py-2 cursor-pointer transition-colors ${
                      index === selectedIndex
                        ? 'bg-purple-600/30 text-white'
                        : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                    }`}
                    onClick={() => handleSearch(search)}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <div className="flex items-center">
                      <SearchIcon size={16} className="mr-2 text-gray-500" />
                      <span>{search}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default SearchBarWithSuggestions; 