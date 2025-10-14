import { useState } from 'react';

export default function SearchResults({ 
  isVisible = false,
  results = [],
  onStarSelect = null,
  onClose = null
}) {
  if (!isVisible || results.length === 0) return null;

  return (
    <div className="fixed top-20 left-4 w-80 bg-grey-700 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
      {/* Header */}
      <div className="flex justify-between items-center p-3 border-b border-grey-600">
        <h3 className="text-sm font-inter font-medium text-grey-100">
          Search Results ({results.length})
        </h3>
        <button
          onClick={onClose}
          className="text-grey-400 hover:text-grey-200 transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Results List */}
      <div className="p-2">
        {results.map((star, index) => (
          <div
            key={index}
            onClick={() => onStarSelect && onStarSelect(star)}
            className="flex items-center gap-3 p-2 rounded-md hover:bg-grey-600 cursor-pointer transition-colors"
          >
            {/* Star Color Indicator */}
            <div className="w-3 h-3 rounded-full bg-blue-400"></div>
            
            {/* Star Info */}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-inter font-medium text-grey-100 truncate">
                {star.name}
              </div>
              <div className="text-xs text-grey-400">
                {star.distance_ly.toFixed(1)} LY • {star.ra} • {star.dec}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
