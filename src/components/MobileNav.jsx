import { useState, useRef } from 'react';
import ButtonMobileIcon from './ui/ButtonMobileIcon.jsx';
import SearchInput from './ui/SearchInput.jsx';
import SearchResults from './ui/SearchResults.jsx';
import CheckboxColor from './ui/CheckboxColor.jsx';
import StarClassItem from './ui/StarClassItem.jsx';
import Slider from './ui/Slider.jsx';
import ButtonIconSmall from './ui/ButtonIconSmall.jsx';
import Separator from './ui/Separator.jsx';

export default function MobileNav({
  // Search props
  searchQuery,
  onSearchChange,
  searchResults,
  onStarClick,
  
  // Filter props
  starClassFilters,
  onFilterToggle,
  
  // View/Distance/Overlays props
  gridMode,
  showGrid,
  onGridModeChange,
  viewDistance,
  onViewDistanceChange,
  showLabels,
  onShowLabelsChange,
  showConnections,
  onShowConnectionsChange,
  showStalks,
  onShowStalksChange,
  
  // Onboarding props
  showOnboarding,
  onToggleOnboarding
}) {
  const [activePanel, setActivePanel] = useState(null); // 'menu', 'filter', 'search', or null

  // Star Class data with colors
  const starClasses = [
    { type: 'O', color: 'spectral-O' },
    { type: 'B', color: 'spectral-B' },
    { type: 'A', color: 'spectral-A' },
    { type: 'F', color: 'spectral-F' },
    { type: 'G', color: 'spectral-G' },
    { type: 'K', color: 'spectral-K' },
    { type: 'M', color: 'spectral-M' },
    { type: 'L', color: 'spectral-L' },
    { type: 'T', color: 'spectral-T' },
    { type: 'Y', color: 'spectral-Y' },
    { type: 'D', color: 'spectral-D' }
  ];

  const togglePanel = (panelName) => {
    if (panelName === 'info') {
      // Info button opens the onboarding panel
      onToggleOnboarding();
      setActivePanel(null); // Close any other panels
    } else {
      setActivePanel(activePanel === panelName ? null : panelName);
    }
  };

  const closePanel = () => {
    setActivePanel(null);
  };

  const clearSearch = () => {
    onSearchChange(''); // Clear the search query
  };


  return (
    <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
      {/* Top Button Bar */}
      <div className="flex items-center justify-between px-4 pt-3 gap-3 pointer-events-auto bg-gradient-to-b from-grey-900/95 to-grey-900/0">
        {/* Left: Hamburger Menu */}
        <ButtonMobileIcon
          icon={activePanel === 'menu' ? '/icons/ui/Icon_UI_Close_01.svg' : '/icons/ui/Icon_UI_Menu_01.svg'}
          alt={activePanel === 'menu' ? 'Close menu' : 'Open menu'}
          isActive={activePanel === 'menu'}
          onClick={() => togglePanel('menu')}
        />

        {/* Center-Right: Info, Filter, and Search */}
        <div className="flex items-center gap-3">
          <ButtonMobileIcon
            icon={showOnboarding ? '/icons/ui/Icon_UI_Close_01.svg' : '/icons/ui/Icon_UI_Info_01.svg'}
            alt={showOnboarding ? 'Close info' : 'About Starscape'}
            isActive={showOnboarding}
            onClick={() => togglePanel('info')}
          />
          <ButtonMobileIcon
            icon={activePanel === 'filter' ? '/icons/ui/Icon_UI_Close_01.svg' : '/icons/ui/Icon_UI_Filter_01.svg'}
            alt={activePanel === 'filter' ? 'Close filter' : 'Open filter'}
            isActive={activePanel === 'filter'}
            onClick={() => togglePanel('filter')}
          />
          <ButtonMobileIcon
            icon={activePanel === 'search' ? '/icons/ui/Icon_UI_Close_01.svg' : '/icons/ui/Icon_UI_Search_01.svg'}
            alt={activePanel === 'search' ? 'Close search' : 'Open search'}
            isActive={activePanel === 'search'}
            onClick={() => togglePanel('search')}
          />
        </div>
      </div>

      {/* Menu Panel (left side) */}
      <div
        className={`
          absolute left-4 top-[68px] w-[160px]
          transition-all duration-300 ease-out pointer-events-auto
          ${activePanel === 'menu' ? 'max-h-[70vh] opacity-100' : 'max-h-0 opacity-0'}
          overflow-hidden rounded-lg
        `}
      >
        {activePanel === 'menu' && (
          <div className="bg-grey-700 overflow-y-auto max-h-[70vh] rounded-lg">
            <div className="">
              {/* View Section */}
              <div>
                <div className="text-white text-[11px] font-medium h-8 px-2 flex items-center tracking-wider">View</div>
                <div className="flex mx-2 mb-2 bg-grey-600 rounded-md overflow-hidden gap-0">
                  <ButtonMobileIcon
                    icon="/icons/ui/Icon_UI_GridRadial_01.svg"
                    alt="Grid Radial"
                    isActive={gridMode === 'circular' && showGrid}
                    onClick={() => onGridModeChange('gridRadial')}
                    width="48px"
                  />
                  <ButtonMobileIcon
                    icon="/icons/ui/Icon_UI_GridSquarel_01.svg"
                    alt="Grid Square"
                    isActive={gridMode === 'square' && showGrid}
                    onClick={() => onGridModeChange('gridSquare')}
                    width="48px"
                  />
                  <ButtonMobileIcon
                    icon="/icons/ui/Icon_UI_GridNone_01.svg"
                    alt="Grid None"
                    isActive={!showGrid}
                    onClick={() => onGridModeChange('gridNone')}
                    width="48px"
                  />
                </div>
              </div>

              {/* Display Section */}
              <div>
                <div className="flex mx-2 mb-4 bg-grey-600 rounded-md overflow-hidden gap-0">
                  <ButtonMobileIcon
                    icon="/icons/ui/Icon_UI_Connections_01.svg"
                    alt="Connections"
                    isActive={showConnections}
                    onClick={() => onShowConnectionsChange(true)}
                    width="48px"
                  />
                  <ButtonMobileIcon
                    icon="/icons/ui/Icon_UI_Stalks_01.svg"
                    alt="Stalks"
                    isActive={showStalks}
                    onClick={() => onShowStalksChange(true)}
                    width="48px"
                  />
                  <ButtonMobileIcon
                    icon="/icons/ui/Icon_UI_StarsOnly_01.svg"
                    alt="Stars Only"
                    isActive={!showConnections && !showStalks}
                    onClick={() => {
                      onShowConnectionsChange(false);
                      onShowStalksChange(false);
                    }}
                    width="48px"
                  />
                </div>
              </div>

              <Separator />

              {/* Distance Slider */}
              <div>
                <div className="text-white text-[11px] font-medium h-8 px-2 flex items-center justify-between tracking-wide">
                  <span>Distance</span>
                  <span>{viewDistance} LY</span>
                </div>
                <div className="mx-2 mt-0 mb-4">
                  <Slider
                    value={viewDistance}
                    onChange={onViewDistanceChange}
                    min={4}
                    max={32}
                    step={4}
                    width="100%"
                    thumbSize={20}
                  />
                </div>
              </div>

              <Separator />

              {/* Overlays Section */}
              <div>
               
                <div className="flex items-center gap-2 px-2 mt-3 mb-3">
                  <ButtonMobileIcon
                    icon="/icons/ui/Icon_UI_Labels_01.svg"
                    alt="Labels"
                    isActive={showLabels}
                    onClick={onShowLabelsChange}
                  />
                  <span className="text-white/70 text-[11px] font-normal">Labels</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filter Panel (right side) */}
      <div
        className={`
          absolute right-4 top-[68px] w-[160px]
          transition-all duration-300 ease-out pointer-events-auto
          ${activePanel === 'filter' ? 'max-h-[70vh] opacity-100' : 'max-h-0 opacity-0'}
          overflow-hidden rounded-lg
        `}
      >
        {activePanel === 'filter' && (
          <div className="bg-grey-700 overflow-y-auto max-h-[70vh] pb-4 rounded-lg">
            
            <div className="text-white text-[11px] font-medium h-8 px-2 flex items-center tracking-wide">Star Class</div>
               <div className="space-y-1.5 px-2">
                  {starClasses.map((starClass) => (
                    <StarClassItem
                      key={starClass.type}
                      type={starClass.type}
                      color={starClass.color}
                      isChecked={starClassFilters.find(f => f.type === starClass.type)?.enabled || false}
                      onChange={() => onFilterToggle(starClass.type)}
                      size="large"
                    />
                  ))}
                </div>
            
          </div>
        )}
      </div>

      {/* Search Panel (right side) */}
      <div
        className={`
          absolute right-4 top-[68px] w-[192px]
          transition-all duration-300 ease-out pointer-events-auto
          ${activePanel === 'search' ? 'max-h-[70vh] opacity-100' : 'max-h-0 opacity-0'}
          overflow-hidden rounded-lg
        `}
      >
        {activePanel === 'search' && (
          <div className="bg-grey-700 overflow-y-auto max-h-[70vh] rounded-lg">
            <div className="">
              <div className="px-2 py-2 overflow-hidden">
              <SearchInput
                value={searchQuery}
                onChange={onSearchChange}
                placeholder="Search Stars..."
                width="100%"
                height="36px"
                fontSize="12px"
                iconSize={18}
              />
              </div>
                {searchResults.length > 0 && (
                  <div className="pb-3">
                    <Separator />
                    <div className="px-2">
                      <SearchResults
                        isVisible={true}
                        results={searchResults}
                        onStarSelect={(star) => {
                          onStarClick(star);
                          closePanel();
                        }}
                        onClose={clearSearch}
                        isMobile={true}
                      />
                    </div>
                  </div>
                )}
            </div>
          </div>
        )}
      </div>


    </div>
  );
}

