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

export default function Toolbar({ 
  onSearchChange = null,
  onExportSVG = null,
  onExportPNG = null
}) {
  // View Options Grid tabs
  const viewGridTabs = [
    { id: 'gridRadial', icon: '/icons/ui/Icon_UI_GridRadial_01.svg', alt: 'Grid Radial' },
    { id: 'gridSquare', icon: '/icons/ui/Icon_UI_GridSquarel_01.svg', alt: 'Grid Square' },
    { id: 'gridNone', icon: '/icons/ui/Icon_UI_GridNone_01.svg', alt: 'Show None' },
  ];

  // View Options Display tabs
  const viewDisplayTabs = [
    { id: 'starsOnly', icon: '/icons/ui/Icon_UI_StarsOnly_01.svg', alt: 'Stars Only' },
    { id: 'stalks', icon: '/icons/ui/Icon_UI_Stalks_01.svg', alt: 'Stalks' },
    { id: 'connections', icon: '/icons/ui/Icon_UI_Connections_01.svg', alt: 'Connections' },
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

  const handleGridChange = (gridId) => {
    console.log('Grid changed to:', gridId);
  };

  const handleDisplayChange = (displayId) => {
    console.log('Display changed to:', displayId);
  };

  const handleDistanceChange = (distance) => {
    console.log('Distance changed to:', distance);
  };

  const handleLabelsToggle = () => {
    console.log('Labels toggled');
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

  const handleExportPNG = () => {
    if (onExportPNG) {
      onExportPNG();
    } else {
      console.log('Export PNG clicked');
    }
  };

  const handleSearchChange = (searchTerm) => {
    if (onSearchChange) {
      onSearchChange(searchTerm);
    }
  };

  return (
    <div className="fixed top-4 left-4 font-sans">
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
              defaultActive="starsOnly"
              columns={3}
            />
          </div>
        </section>

        <Separator />

        <section>
          <SectionHeader title="Distance" value="16 LY" />
          
          {/* Slider wrapper for manual padding control */}
          <div className="px-2 py-2 pb-5">
            <Slider 
              value={16}
              min={0}
              max={50}
              onChange={handleDistanceChange}
              width="132px"
            />
          </div>
        </section>

        <Separator />

        <section>
          <SectionHeader title="Overlays" />
          
          {/* Labels button wrapper for manual padding control */}
          <div className="px-2 pt-1 pb-4">
            <div className="flex items-center gap-2">
              <ButtonIcon 
                icon="/icons/ui/Icon_UI_Labels_01.svg"
                alt="Toggle Labels"
                isActive={true}
                onClick={handleLabelsToggle}
                width="32px"
              />
              <span className="text-[11px] font-normal text-grey-200">Labels</span>
            </div>
          </div>
        </section>
      </div>

      {/* Star Class Block */}
      <div className="bg-grey-700 rounded-lg mb-2">
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
                  isChecked={true}
                  onChange={handleStarClassChange}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Export Block */}
      <div className="bg-grey-700 rounded-lg">
        <section>
          <CollapsibleHeader 
            title="Export"
            isCollapsed={isExportCollapsed}
            onToggle={handleExportToggle}
          />
          
          {!isExportCollapsed && (
            <div className="px-2 py-2 space-y-2">
              <ButtonTextSmall 
                text="Export SVG"
                onClick={handleExportSVG}
              />
              <ButtonTextSmall 
                text="Export PNG"
                onClick={handleExportPNG}
              />
            </div>
          )}
        </section>
      </div>

    </div>
  );
}

