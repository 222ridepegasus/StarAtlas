import { useEffect, useState } from 'react';

const ToggleButton = ({ label, selected, onClick, title }) => (
  <button
    title={title}
    onClick={onClick}
    style={{
      width: '36px',
      height: '36px',
      borderRadius: '6px',
      border: selected ? '1px solid #60a5fa' : '1px solid #374151',
      backgroundColor: selected ? 'rgba(37, 99, 235, 0.2)' : 'rgba(17, 24, 39, 0.8)',
      color: selected ? '#e5e7eb' : '#9ca3af',
      fontWeight: 700,
      fontFamily: 'monospace',
      cursor: 'pointer'
    }}
  >{label}</button>
);

const CheckboxButton = ({ label, checked, onClick, title }) => (
  <button
    title={title}
    onClick={onClick}
    style={{
      padding: '0 10px',
      height: '36px',
      borderRadius: '6px',
      border: checked ? '1px solid #10b981' : '1px solid #374151',
      backgroundColor: checked ? 'rgba(16, 185, 129, 0.25)' : 'rgba(17, 24, 39, 0.8)',
      color: checked ? '#e5e7eb' : '#9ca3af',
      fontWeight: 700,
      fontFamily: 'monospace',
      cursor: 'pointer'
    }}
  >{label}</button>
);

const EyeIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 5c5.523 0 9.75 5 9.75 7s-4.227 7-9.75 7S2.25 14 2.25 12 6.477 5 12 5Z" stroke="#e5e7eb" strokeWidth="1.5"/>
    <circle cx="12" cy="12" r="3" stroke="#e5e7eb" strokeWidth="1.5"/>
  </svg>
);

const FilterIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 7h18M6 12h12M9 17h6" stroke="#e5e7eb" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="3" cy="7" r="2" fill="#e5e7eb"/>
    <circle cx="6" cy="12" r="2" fill="#e5e7eb"/>
    <circle cx="9" cy="17" r="2" fill="#e5e7eb"/>
  </svg>
);

const CloseIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 6l12 12M18 6L6 18" stroke="#e5e7eb" strokeWidth="1.6" strokeLinecap="round"/>
  </svg>
);

const KeyBadge = ({ children }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: '24px', height: '24px', borderRadius: '6px',
    backgroundColor: 'rgba(55, 65, 81, 0.9)', color: '#e5e7eb',
    fontFamily: 'monospace', fontSize: '12px', fontWeight: 700,
    border: '1px solid #374151'
  }}>{children}</span>
);

const ViewBar = ({
  gridMode,
  showGrid,
  lineMode,
  showLabels,
  showAxes,
  measureMode,
  onGridChange,
  onLineModeChange,
  onToggleLabels,
  onToggleAxes,
  onToggleMeasure,
  onOpenFilters,
  onCloseFilters,
  filterOpen: externalFilterOpen
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [open, setOpen] = useState(true);
  const [panelOpen, setPanelOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  
  // Use external state if provided, otherwise use internal state
  const isFilterOpen = externalFilterOpen !== undefined ? externalFilterOpen : filterOpen;

  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      setOpen(!mobile);
    };
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const GridBtns = () => (
    <div style={{ display: 'flex', gap: '8px' }}>
      <ToggleButton label="R" title="Radial grid" selected={showGrid && gridMode === 'circular'} onClick={() => { onGridChange('circular'); }} />
      <ToggleButton label="S" title="Square grid" selected={showGrid && gridMode === 'square'} onClick={() => { onGridChange('square'); }} />
      <ToggleButton label="N" title="Hide grid" selected={!showGrid} onClick={() => { onGridChange('none'); }} />
    </div>
  );

  const LineBtns = () => (
    <div style={{ display: 'flex', gap: '8px' }}>
      <ToggleButton label="C" title="Connections" selected={lineMode === 'connections'} onClick={() => onLineModeChange('connections')} />
      <ToggleButton label="S" title="Stalks" selected={lineMode === 'stalks'} onClick={() => onLineModeChange('stalks')} />
      <ToggleButton label="N" title="Stars only" selected={lineMode === 'none'} onClick={() => onLineModeChange('none')} />
    </div>
  );



  return (
    <>
      {isMobile ? (
        <>
          {/* Floating icon buttons - side by side */}
          <div style={{ position: 'fixed', top: '12px', right: '12px', display: 'flex', gap: '4px', zIndex: 10000 }}>
            <button
              onClick={() => setOpen(!open)}
              style={{ width: '40px', height: '40px', borderRadius: '8px', border: '1px solid #374151', background: 'rgba(17,24,39,0.9)', display: 'grid', placeItems: 'center' }}
            >
              <EyeIcon />
            </button>
            <button
              onClick={() => {
                if (isFilterOpen) {
                  if (onCloseFilters) {
                    onCloseFilters();
                  } else {
                    setFilterOpen(false);
                  }
                } else {
                  if (onOpenFilters) {
                    onOpenFilters();
                  } else {
                    setFilterOpen(true);
                  }
                }
              }}
              style={{ width: '40px', height: '40px', borderRadius: '8px', border: '1px solid #374151', background: 'rgba(17,24,39,0.9)', display: 'grid', placeItems: 'center' }}
            >
              {isFilterOpen ? <CloseIcon /> : <FilterIcon />}
            </button>
          </div>

          {/* Mobile vertical stack */}
          {open && (
            <div style={{
              position: 'fixed', top: '56px', left: '50%', transform: 'translateX(-50%)',
              display: 'flex', flexDirection: 'column', gap: '8px',
              backgroundColor: 'rgba(17, 24, 39, 0.85)', border: '1px solid #374151', borderRadius: '8px',
              padding: '12px', zIndex: 9999
            }}>
              {/* Grid Options Row */}
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                <GridBtns />
              </div>
              
              {/* Horizontal Separator */}
              <div style={{ width: '100%', height: '1px', background: '#374151' }} />
              
              {/* Line Options Row */}
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                <LineBtns />
              </div>
              
              {/* Horizontal Separator */}
              <div style={{ width: '100%', height: '1px', background: '#374151' }} />
              
              {/* Toggle Options Row */}
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                <CheckboxButton label="Lbl" title="Labels" checked={showLabels} onClick={() => onToggleLabels(!showLabels)} />
                <CheckboxButton label="Ax" title="Axes" checked={showAxes} onClick={() => onToggleAxes(!showAxes)} />
                <CheckboxButton label="M" title="Measure" checked={measureMode} onClick={() => onToggleMeasure(!measureMode)} />
              </div>
            </div>
          )}
        </>
      ) : (
        open && (
          <div style={{
            position: 'fixed', top: '12px', left: '50%', transform: 'translateX(-50%)',
            display: 'flex', gap: '12px', alignItems: 'center',
            backgroundColor: 'rgba(17, 24, 39, 0.85)', border: '1px solid #374151', borderRadius: '8px',
            padding: '8px 10px', zIndex: 9999
          }}>
            <GridBtns />
            <div style={{ width: '1px', height: '24px', background: '#374151' }} />
            <LineBtns />
            <div style={{ width: '1px', height: '24px', background: '#374151' }} />
            <div style={{ display: 'flex', gap: '8px' }}>
              <CheckboxButton label="Lbl" title="Labels" checked={showLabels} onClick={() => onToggleLabels(!showLabels)} />
              <CheckboxButton label="Ax" title="Axes" checked={showAxes} onClick={() => onToggleAxes(!showAxes)} />
              <CheckboxButton label="M" title="Measure" checked={measureMode} onClick={() => onToggleMeasure(!measureMode)} />
            </div>
          </div>
        )
      )}
    </>
  );
};

export default ViewBar;


