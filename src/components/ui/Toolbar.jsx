import { useState } from 'react';
import SectionHeader from './SectionHeader';
import TabGroup from './TabGroup';
import Separator from './Separator';
import Slider from './Slider';
import ButtonIcon from './ButtonIcon';
import CollapsibleHeader from './CollapsibleHeader';
import StarClassItem from './StarClassItem';
import ButtonTextSmall from './ButtonTextSmall';
import SearchInput from './SearchInput';
import SearchResults from './SearchResults';
import Tooltip from './Tooltip';

export default function Toolbar({ 
  onSearchChange = null,
  onExportSVG = null,
  searchResults = [],
  showSearchResults = false,
  onSearchResultSelect = null,
  onCloseSearchResults = null,
  // State props
  gridMode = 'circular',
  lineMode = 'connections',
  showLabels = true,
  keyboardControlsEnabled = false,
  viewDistance = 20,
  spectralFilter = {},
  // Callback props
  onGridChange = null,
  onLineModeChange = null,
  onToggleLabels = null,
  onToggleKeyboardControls = null,
  onViewDistanceChange = null,
  onSpectralFilterChange = null
}) {
  // View Options Grid tabs
  const viewGridTabs = [
    { id: 'gridRadial', icon: '/icons/ui/Icon_UI_GridRadial_01.svg', alt: 'Show radial grid' },
    { id: 'gridSquare', icon: '/icons/ui/Icon_UI_GridSquarel_01.svg', alt: 'Show square grid' },
    { id: 'gridNone', icon: '/icons/ui/Icon_UI_GridNone_01.svg', alt: 'Hide grid' },
  ];

  // View Options Display tabs
  const viewDisplayTabs = [
    { id: 'connections', icon: '/icons/ui/Icon_UI_Connections_01.svg', alt: 'Show star connections' },
    { id: 'stalks', icon: '/icons/ui/Icon_UI_Stalks_01.svg', alt: 'Show star stalks' },
    { id: 'starsOnly', icon: '/icons/ui/Icon_UI_StarsOnly_01.svg', alt: 'Show stars only' },
  ];

  // Star Class collapse state
  const [isStarClassCollapsed, setIsStarClassCollapsed] = useState(false);
  
  // Export collapse state (closed by default)
  const [isExportCollapsed, setIsExportCollapsed] = useState(true);

  // Star Class data
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
    { type: 'D', color: 'spectral-D' },
  ];


  const handleLabelsToggle = () => {
    if (onToggleLabels) {
      onToggleLabels();
    }
  };

  const handleKeyboardControlsToggle = () => {
    if (onToggleKeyboardControls) {
      onToggleKeyboardControls();
    }
  };

  const handleGridChange = (mode) => {
    if (onGridChange) {
      onGridChange(mode);
    }
  };

  const handleLineModeChange = (mode) => {
    if (onLineModeChange) {
      onLineModeChange(mode);
    }
  };

  const handleDistanceChange = (distance) => {
    if (onViewDistanceChange) {
      onViewDistanceChange(distance);
    }
  };

  const handleSpectralFilterChange = (spectralClass) => {
    if (onSpectralFilterChange) {
      const newFilter = { ...spectralFilter, [spectralClass]: !spectralFilter[spectralClass] };
      onSpectralFilterChange(newFilter);
    }
  };

  const handleStarClassToggle = () => {
    setIsStarClassCollapsed(!isStarClassCollapsed);
  };

  const handleStarClassChange = (type, isChecked) => {
    console.log(`Star class ${type} ${isChecked ? 'enabled' : 'disabled'}`);
  };

  const handleExportToggle = () => {
    setIsExportCollapsed(!isExportCollapsed);
  };

  const handleExportSVG = () => {
    if (onExportSVG) {
      onExportSVG();
    } else {
      console.log('Export SVG clicked');
    }
  };


  const handleSearchChange = (searchTerm) => {
    if (onSearchChange) {
      onSearchChange(searchTerm);
    }
  };

  return (
    <div className="fixed top-4 left-4 font-sans z-50 select-none">
      {/* Master Wrap - no styling, just positioning */}
      
      {/* Controls Block */}
      <div className="bg-grey-700 rounded-lg mb-2">
        {/* Search Section */}
        <div className="px-2 pt-3 pb-3">
          <SearchInput 
            placeholder="Search Stars"
            onChange={handleSearchChange}
          />
        </div>

        <Separator />
        {/* View Section */}
        <section>
          <SectionHeader title="View" />
          
          {/* Grid Options - 8px bottom padding */}
          <div className="pb-2 px-2">
            <TabGroup 
              tabs={viewGridTabs}
              defaultActive="gridRadial"
              onChange={handleGridChange}
              columns={3}
            />
          </div>

          {/* Display Options - 16px bottom padding */}
          <div className="pb-4 px-2">
            <TabGroup
              tabs={viewDisplayTabs}
              defaultActive="connections"
              columns={3}
              onChange={handleLineModeChange}
            />
          </div>
        </section>

        <Separator />

        <section>
          <SectionHeader title="Distance" value={`${viewDistance} LY`} />
          
          {/* Slider wrapper for manual padding control */}
          <div className="px-2 py-2 pb-5">
            <Slider 
              value={viewDistance}
              min={4}
              max={32}
              step={4}
              onChange={handleDistanceChange}
              width="132px"
            />
          </div>
        </section>

        <Separator />

        <section>
          {/* Labels and Keyboard Controls buttons wrapper for manual padding control */}
          <div className="px-2 pt-3 pb-3">
            <div className="flex flex-col gap-2">
              {/* Labels button */}
              <div className="flex items-center gap-2">
                <Tooltip content="Toggle star labels on/off" delay={1000}>
                  <ButtonIcon 
                    icon="/icons/ui/Icon_UI_Labels_01.svg"
                    alt="Toggle Labels"
                    isActive={showLabels}
                    onClick={handleLabelsToggle}
                    width="32px"
                  />
                </Tooltip>
                <span className="text-[11px] font-normal text-grey-200">Labels</span>
              </div>
              
              {/* Keyboard Controls button */}
              <div className="flex items-center gap-2">
                <Tooltip content="Enable/disable keyboard controls (WASD, P/L, Q/E, +/-, G, F, Z, ESC)" delay={1000}>
                  <ButtonIcon 
                    icon="/icons/ui/Icon_UI_Keyboard_01.svg"
                    alt="Toggle Keyboard Controls"
                    isActive={keyboardControlsEnabled}
                    onClick={handleKeyboardControlsToggle}
                    width="32px"
                  />
                </Tooltip>
                <span className="text-[11px] font-normal text-grey-200">Controls</span>
              </div>
            </div>
          </div>
        </section>

        <Separator />
      
        <section>
          <CollapsibleHeader 
            title="Star Class"
            isCollapsed={isStarClassCollapsed}
            onToggle={handleStarClassToggle}
          />
          
          {!isStarClassCollapsed && (
            <div className="px-2 pb-3">
              {starClasses.map((starClass) => (
                <StarClassItem
                  key={starClass.type}
                  type={starClass.type}
                  color={starClass.color}
                  isChecked={spectralFilter[starClass.type] || false}
                  onChange={() => handleSpectralFilterChange(starClass.type)}
                />
              ))}
            </div>
          )}
        </section>

        {/* <Separator />
      
        <section>
          <CollapsibleHeader 
            title="Export"
            isCollapsed={isExportCollapsed}
            onToggle={handleExportToggle}
          />
          
          {!isExportCollapsed && (
            <div className="flex justify-center items-center flex-grow px-2 py-2 pb-3">
                <ButtonTextSmall
                  text="Export SVG"
                  onClick={handleExportSVG}
                />
            </div>
          )}
        </section> */}
      </div>
      
      {/* Search Results Panel - Positioned 8px to the right */}
      <div className="absolute top-0 left-full ml-2">
        <SearchResults
          isVisible={showSearchResults}
          results={searchResults}
          onStarSelect={onSearchResultSelect}
          onClose={onCloseSearchResults}
        />
      </div>

    </div>
  );
}

