import { useState, useEffect, useRef } from 'react';
import SectionHeader from './SectionHeader';
import Separator from './Separator';
import ButtonIconSmall from './ButtonIconSmall';
import SearchResultsListItem from './SearchResultsListItem';

export default function SearchResults({ 
  isVisible = false,
  results = [],
  onStarSelect = null,
  onClose = null
}) {
  const searchResultsRef = useRef(null);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchResultsRef.current && !searchResultsRef.current.contains(event.target)) {
        if (onClose) {
          onClose();
        }
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVisible, onClose]);
  if (!isVisible || results.length === 0) return null;

  return (
    <div ref={searchResultsRef} className="w-[180px] bg-grey-700 rounded-md z-50 max-h-96 overflow-y-auto pb-3 scrollbar-hide">
      {/* Header */}
      <div className="flex justify-start items-center self-stretch flex-grow-0 flex-shrink-0 h-8 relative gap-1 pl-2 pr-1.5">
        <div className="flex justify-start items-center flex-grow relative gap-0.5">
          <p className="flex-grow-0 flex-shrink-0 text-[11px] font-semibold text-left text-white">
            Search Results
          </p>
          <p className="flex-grow-0 flex-shrink-0 text-[11px] font-semibold text-right text-white">
            ({results.length})
          </p>
        </div>
        <ButtonIconSmall
          icon="/icons/ui/Icon_UI_Close_01.svg"
          alt="Close"
          onClick={onClose}
          size="small"
        />
      </div>
      
      <Separator />

      {/* Results List */}
      <div className="p-2 space-y-1">
        {results.map((star, index) => (
          <SearchResultsListItem
            key={index}
            star={star}
            onClick={() => onStarSelect && onStarSelect(star)}
          />
        ))}
      </div>
    </div>
  );
}
