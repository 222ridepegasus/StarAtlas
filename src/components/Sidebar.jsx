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
  onToggleGrid, 
  onViewDistanceChange, 
  onToggleGridVisibility, 
  onToggleLabelsVisibility, 
  onToggleAxesHelper,
  onLineModeChange,
  onSpectralFilterChange 
}) => {
  const [viewDistance, setViewDistance] = useState(20);
  const [gridDisplay, setGridDisplay] = useState('circular');
  const [showLabels, setShowLabels] = useState(true);
  const [showAxes, setShowAxes] = useState(false);
  const [lineMode, setLineMode] = useState('connections');
  const [spectralFilter, setSpectralFilter] = useState({
    O: true, B: true, A: true, F: true, G: true, K: true, M: true, L: true, T: true, Y: true, D: true
  });
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

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
    setViewDistance(distance);
    onViewDistanceChange(distance);
  };

  const handleGridDisplayChange = (mode) => {
    setGridDisplay(mode);
    if (mode === 'none') {
      onToggleGridVisibility(false);
    } else {
      // Call both synchronously - Starfield will handle the state updates
      onToggleGrid(mode);
      onToggleGridVisibility(true);
    }
  };

  const handleToggleLabelsVisibility = () => {
    const newValue = !showLabels;
    setShowLabels(newValue);
    onToggleLabelsVisibility(newValue);
  };

  const handleToggleAxesHelper = () => {
    const newValue = !showAxes;
    setShowAxes(newValue);
    onToggleAxesHelper(newValue);
  };

  const handleLineModeChange = (mode) => {
    setLineMode(mode);
    onLineModeChange(mode);
  };

  const handleSpectralFilterToggle = (spectralClass) => {
    const newFilter = { ...spectralFilter, [spectralClass]: !spectralFilter[spectralClass] };
    setSpectralFilter(newFilter);
    onSpectralFilterChange(newFilter);
  };

  const viewDistances = [8, 12, 16, 20];
  const shouldShowSidebar = !isMobile || isOpen;

  return (
    <>
      {isMobile && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            position: 'fixed',
            top: '16px',
            right: '16px',
            width: '48px',
            height: '48px',
            backgroundColor: 'rgba(17, 24, 39, 0.9)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(55, 65, 81, 1)',
            borderRadius: '8px',
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: isOpen ? '24px' : '28px',
            zIndex: 10000,
            transition: 'background-color 0.2s'
          }}
          onMouseDown={(e) => e.target.style.backgroundColor = 'rgba(55, 65, 81, 1)'}
          onMouseUp={(e) => e.target.style.backgroundColor = 'rgba(17, 24, 39, 0.9)'}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(17, 24, 39, 0.9)'}
        >
          {isOpen ? '✕' : '⚙'}
        </button>
      )}

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
        <div style={{ display: 'flex', gap: '4px' }}>
          {viewDistances.map(distance => (
            <button
              key={distance}
              onClick={() => handleViewDistanceChange(distance)}
              style={{
                flex: 1,
                padding: '6px',
                backgroundColor: viewDistance === distance ? '#059669' : '#374151',
                border: 'none',
                borderRadius: '4px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '12px',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => {
                if (viewDistance !== distance) {
                  e.target.style.backgroundColor = '#4b5563';
                }
              }}
              onMouseLeave={(e) => {
                if (viewDistance !== distance) {
                  e.target.style.backgroundColor = '#374151';
                }
              }}
            >
              {distance}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '16px', paddingTop: '8px', borderTop: '1px solid rgba(55, 65, 81, 1)' }}>
        <div style={{ 
          marginBottom: '8px',
          color: '#9ca3af',
          fontSize: '12px',
          fontWeight: 'bold'
        }}>
          Grid Display
        </div>
        
        <label style={{ 
          display: 'flex', 
          alignItems: 'center', 
          cursor: 'pointer',
          userSelect: 'none',
          marginBottom: '6px'
        }}>
          <input
            type="radio"
            name="gridDisplay"
            value="circular"
            checked={gridDisplay === 'circular'}
            onChange={(e) => handleGridDisplayChange(e.target.value)}
            style={{
              marginRight: '8px',
              cursor: 'pointer',
              width: '16px',
              height: '16px',
              accentColor: '#2563eb'
            }}
          />
          <span>Show Radial</span>
        </label>

        <label style={{ 
          display: 'flex', 
          alignItems: 'center', 
          cursor: 'pointer',
          userSelect: 'none',
          marginBottom: '6px'
        }}>
          <input
            type="radio"
            name="gridDisplay"
            value="square"
            checked={gridDisplay === 'square'}
            onChange={(e) => handleGridDisplayChange(e.target.value)}
            style={{
              marginRight: '8px',
              cursor: 'pointer',
              width: '16px',
              height: '16px',
              accentColor: '#2563eb'
            }}
          />
          <span>Show Square</span>
        </label>

        <label style={{ 
          display: 'flex', 
          alignItems: 'center', 
          cursor: 'pointer',
          userSelect: 'none'
        }}>
          <input
            type="radio"
            name="gridDisplay"
            value="none"
            checked={gridDisplay === 'none'}
            onChange={(e) => handleGridDisplayChange(e.target.value)}
            style={{
              marginRight: '8px',
              cursor: 'pointer',
              width: '16px',
              height: '16px',
              accentColor: '#2563eb'
            }}
          />
          <span>Hide Grid</span>
        </label>
      </div>

      <div style={{ marginBottom: '16px', paddingTop: '8px', borderTop: '1px solid rgba(55, 65, 81, 1)' }}>
        <div style={{ 
          marginBottom: '8px',
          color: '#9ca3af',
          fontSize: '12px',
          fontWeight: 'bold'
        }}>
          Line Display
        </div>
        
        <label style={{ 
          display: 'flex', 
          alignItems: 'center', 
          cursor: 'pointer',
          userSelect: 'none',
          marginBottom: '6px'
        }}>
          <input
            type="radio"
            name="lineMode"
            value="connections"
            checked={lineMode === 'connections'}
            onChange={(e) => handleLineModeChange(e.target.value)}
            style={{
              marginRight: '8px',
              cursor: 'pointer',
              width: '16px',
              height: '16px',
              accentColor: '#2563eb'
            }}
          />
          <span>Show Connections</span>
        </label>

        <label style={{ 
          display: 'flex', 
          alignItems: 'center', 
          cursor: 'pointer',
          userSelect: 'none',
          marginBottom: '6px'
        }}>
          <input
            type="radio"
            name="lineMode"
            value="stalks"
            checked={lineMode === 'stalks'}
            onChange={(e) => handleLineModeChange(e.target.value)}
            style={{
              marginRight: '8px',
              cursor: 'pointer',
              width: '16px',
              height: '16px',
              accentColor: '#2563eb'
            }}
          />
          <span>Show Stalks</span>
        </label>

        <label style={{ 
          display: 'flex', 
          alignItems: 'center', 
          cursor: 'pointer',
          userSelect: 'none'
        }}>
          <input
            type="radio"
            name="lineMode"
            value="none"
            checked={lineMode === 'none'}
            onChange={(e) => handleLineModeChange(e.target.value)}
            style={{
              marginRight: '8px',
              cursor: 'pointer',
              width: '16px',
              height: '16px',
              accentColor: '#2563eb'
            }}
          />
          <span>Stars Only</span>
        </label>
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

      <div style={{ paddingTop: '8px', borderTop: '1px solid rgba(55, 65, 81, 1)' }}>
        <div style={{ marginBottom: '8px' }}>
          <label style={{ 
            display: 'flex', 
            alignItems: 'center', 
            cursor: 'pointer',
            userSelect: 'none'
          }}>
            <input
              type="checkbox"
              checked={showLabels}
              onChange={handleToggleLabelsVisibility}
              style={{
                marginRight: '8px',
                cursor: 'pointer',
                width: '16px',
                height: '16px'
              }}
            />
            <span>Show Labels</span>
          </label>
        </div>

        <div>
          <label style={{ 
            display: 'flex', 
            alignItems: 'center', 
            cursor: 'pointer',
            userSelect: 'none'
          }}>
            <input
              type="checkbox"
              checked={showAxes}
              onChange={handleToggleAxesHelper}
              style={{
                marginRight: '8px',
                cursor: 'pointer',
                width: '16px',
                height: '16px'
              }}
            />
            <span>Show Axes</span>
          </label>
        </div>
      </div>
    </div>
      )}
    </>
  );
};

export default Sidebar;