import { useState, useEffect } from 'react';

// Star color mapping (from visual config)
const SPECTRAL_COLORS = {
  O: '#3399ff',
  B: '#66ccff',
  A: '#ffffff',
  F: '#ffff99',
  G: '#ffff33',
  K: '#ff9900',
  M: '#ff3300',
  L: '#996633',
  T: '#9933cc',
  Y: '#330033',
  D: '#ffffff'
};

const Sidebar = ({ 
  onViewDistanceChange, 
  onSpectralFilterChange,
  onOpenFilters,
  isOpen: externalIsOpen,
  stars = [],
  onStarSelect
}) => {
  const [viewDistance, setViewDistance] = useState(20);
  const [spectralFilter, setSpectralFilter] = useState({
    O: true, B: true, A: true, F: true, G: true, K: true, M: true, L: true, T: true, Y: true, D: true
  });
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  
  // Use external state if provided, otherwise use internal state
  const sidebarIsOpen = externalIsOpen !== undefined ? externalIsOpen : isOpen;
  const setSidebarIsOpen = externalIsOpen !== undefined ? onOpenFilters : setIsOpen;

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setIsOpen(true);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleViewDistanceChange = (distance) => {
    const numDistance = Number(distance);
    setViewDistance(numDistance);
    onViewDistanceChange(numDistance);
  };

  const handleSpectralFilterToggle = (spectralClass) => {
    const newFilter = { ...spectralFilter, [spectralClass]: !spectralFilter[spectralClass] };
    setSpectralFilter(newFilter);
    onSpectralFilterChange(newFilter);
  };

  // Search functionality
  const handleSearchChange = (query) => {
    setSearchQuery(query);
    
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const results = stars.filter(star => 
      star.name.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 10); // Limit to 10 results
    
    setSearchResults(results);
  };

  const handleStarSelect = (star) => {
    setSearchQuery('');
    setSearchResults([]);
    if (onStarSelect) {
      onStarSelect(star);
    }
  };


  const shouldShowSidebar = !isMobile || sidebarIsOpen;

  return (
    <>
      {/* Mobile button removed - now handled by ViewBar filter button */}

      {shouldShowSidebar && (
        <div style={{
          position: 'fixed',
          top: isMobile ? '0' : '16px',
          left: isMobile ? '0' : '16px',
          right: isMobile ? '0' : 'auto',
          bottom: isMobile ? '0' : 'auto',
          width: isMobile ? '100%' : 'auto',
          maxWidth: isMobile ? '100%' : '280px',
          backgroundColor: 'rgba(17, 24, 39, 0.95)',
          backdropFilter: 'blur(8px)',
          border: isMobile ? 'none' : '1px solid rgba(55, 65, 81, 1)',
          borderRadius: isMobile ? '0' : '8px',
          padding: isMobile ? '20px' : '16px',
          color: 'white',
          fontFamily: 'monospace',
          fontSize: '14px',
          zIndex: 9999,
          maxHeight: isMobile ? '100vh' : 'calc(100vh - 32px)',
          overflowY: 'auto',
          boxSizing: 'border-box'
        }}>
      <h2 style={{ 
        fontSize: '18px', 
        fontWeight: 'bold', 
        marginBottom: '16px',
        color: '#d1d5db'
      }}>
        Controls
      </h2>
      
      <div style={{ marginBottom: '16px' }}>
        <div style={{ 
          marginBottom: '8px',
          color: '#9ca3af',
          fontSize: '12px'
        }}>
          View Distance: {viewDistance} LY
        </div>
        <input
          type="range"
          min="4"
          max="32"
          step="4"
          value={viewDistance}
          onChange={(e) => handleViewDistanceChange(e.target.value)}
          style={{
            width: '100%',
            height: '6px',
            borderRadius: '3px',
            background: `linear-gradient(to right, #059669 0%, #059669 ${((viewDistance - 4) / 28) * 100}%, #374151 ${((viewDistance - 4) / 28) * 100}%, #374151 100%)`,
            outline: 'none',
            cursor: 'pointer',
            WebkitAppearance: 'none',
            appearance: 'none'
          }}
        />
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '4px',
          fontSize: '10px',
          color: '#6b7280'
        }}>
          <span>4</span>
          <span>16</span>
          <span>32</span>
        </div>
      </div>

      {/* Search Section */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ 
          marginBottom: '8px',
          color: '#9ca3af',
          fontSize: '12px',
          fontWeight: 'bold'
        }}>
          Search Stars
        </div>
        <input
          type="text"
          placeholder="Search by star name..."
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          style={{
            width: '100%',
            padding: '8px 12px',
            backgroundColor: 'rgba(31, 41, 55, 0.8)',
            border: '1px solid rgba(55, 65, 81, 1)',
            borderRadius: '6px',
            color: '#e5e7eb',
            fontSize: '14px',
            fontFamily: 'monospace',
            outline: 'none',
            transition: 'border-color 0.2s',
            boxSizing: 'border-box'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#60a5fa';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'rgba(55, 65, 81, 1)';
          }}
        />
        
        {/* Search Results */}
        {searchResults.length > 0 && (
          <div style={{
            marginTop: '8px',
            maxHeight: '200px',
            overflowY: 'auto',
            backgroundColor: 'rgba(31, 41, 55, 0.9)',
            border: '1px solid rgba(55, 65, 81, 1)',
            borderRadius: '6px',
            padding: '4px'
          }}>
            {searchResults.map((star, index) => (
              <div
                key={star.name}
                onClick={() => handleStarSelect(star)}
                style={{
                  padding: '8px 12px',
                  cursor: 'pointer',
                  borderRadius: '4px',
                  fontSize: '13px',
                  color: '#e5e7eb',
                  transition: 'background-color 0.2s',
                  borderBottom: index < searchResults.length - 1 ? '1px solid rgba(55, 65, 81, 0.5)' : 'none'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'rgba(59, 130, 246, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                }}
              >
                {star.name}
                <div style={{
                  fontSize: '11px',
                  color: '#9ca3af',
                  marginTop: '2px'
                }}>
                  {star.distance_ly.toFixed(1)} LY
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ paddingTop: '8px', borderTop: '1px solid rgba(55, 65, 81, 1)' }}>
        <div style={{ 
          marginBottom: '8px',
          color: '#9ca3af',
          fontSize: '12px',
          fontWeight: 'bold'
        }}>
          Spectral Class Filter
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
          {Object.keys(spectralFilter).map(spectralClass => (
            <label 
              key={spectralClass}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                cursor: 'pointer',
                userSelect: 'none',
                padding: '4px',
                borderRadius: '4px',
                backgroundColor: spectralFilter[spectralClass] 
                  ? `${SPECTRAL_COLORS[spectralClass]}22` 
                  : 'transparent',
                border: `1px solid ${spectralFilter[spectralClass] 
                  ? SPECTRAL_COLORS[spectralClass] 
                  : 'rgba(55, 65, 81, 1)'}`,
                transition: 'all 0.2s'
              }}
            >
              <input
                type="checkbox"
                checked={spectralFilter[spectralClass]}
                onChange={() => handleSpectralFilterToggle(spectralClass)}
                style={{
                  marginRight: '6px',
                  cursor: 'pointer',
                  width: '14px',
                  height: '14px',
                  accentColor: SPECTRAL_COLORS[spectralClass]
                }}
              />
              <span style={{ 
                fontSize: '13px',
                color: spectralFilter[spectralClass] ? '#ffffff' : '#9ca3af'
              }}>
                {spectralClass}
              </span>
            </label>
          ))}
        </div>
      </div>


      {/* Only filtering controls below */}
    </div>
      )}
    </>
  );
};

export default Sidebar;