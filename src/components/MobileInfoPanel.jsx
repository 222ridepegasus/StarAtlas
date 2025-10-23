import { useState, useRef } from 'react';
import HeaderWindow from './ui/HeaderWindow';
import ButtonTextSmall from './ui/ButtonTextSmall';
import ButtonStar from './ui/ButtonStar';
import InfoSnippet from './ui/InfoSnippet';
import ListItemStarStats from './ui/ListItemStarStats';
import Separator from '../components/ui/Separator';

const MobileInfoPanel = ({ star, onClose, onFocus, onZoom, onReset, isFocused }) => {
  const [selectedComponent, setSelectedComponent] = useState(0);
  
  const panelRef = useRef(null);

  if (!star) return null;

  const currentComponent = star.components && star.components[selectedComponent] 
    ? star.components[selectedComponent] 
    : null;

  const handleComponentSelect = (index) => {
    setSelectedComponent(index);
  };

  const handleFocus = () => {
    if (currentComponent) {
      onFocus({ ...star, selectedComponent: currentComponent });
    } else {
      onFocus(star);
    }
  };

  const handleZoom = () => {
    if (currentComponent) {
      onZoom({ ...star, selectedComponent: currentComponent });
    } else {
      onZoom(star);
    }
  };

  return (
    <div 
      ref={panelRef}
      className="fixed bottom-4 left-4 right-4 w-auto max-h-[calc(100vh-32px)] bg-grey-700 rounded-lg text-grey-100 text-sm z-40 overflow-y-auto box-border font-sans select-none"
      style={{
        textSizeAdjust: 'none',
        WebkitTextSizeAdjust: 'none',
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale'
      }}
    >
      {/* HeaderWindow */}
      <HeaderWindow 
        title={star.name} 
        onClose={onClose}
      />

      <Separator client:load />

      {/* Camera Button Group */}
      <div className="flex gap-1 px-3 pt-3">
        <ButtonTextSmall 
          text={isFocused ? "Focused" : "Focus"} 
          onClick={handleFocus}
          isActive={isFocused}
        />
        <ButtonTextSmall 
          text="Zoom" 
          onClick={handleZoom}
          isActive={false}
        />
        <ButtonTextSmall 
          text="Free Camera" 
          onClick={onReset}
          isActive={false}
        />
      </div>

      {/* StarTab Group */}
      {star.components && star.components.length > 0 && (
        <div className={`px-3 pt-3 ${star.components.length === 1 ? 'grid grid-cols-2' : star.components.length === 2 ? 'grid grid-cols-2' : 'grid grid-cols-2'} gap-1`}>
          {star.components.map((component, index) => (
            <ButtonStar
              key={index}
              name={component.name}
              spectralType={component.star_type}
              isActive={selectedComponent === index}
              onClick={() => handleComponentSelect(index)}
            />
          ))}
        </div>
      )}

      {/* InfoSnippet */}
      <InfoSnippet text={currentComponent?.description || "Coming soon..."} />

      {/* Star Stats */}
      <div className="flex flex-col justify-start items-start self-stretch flex-grow-0 flex-shrink-0 gap-1.5 px-4 pt-2 pb-6">
        <ListItemStarStats 
          label="Distance (from Earth)" 
          value={currentComponent?.distance_ly ? `${currentComponent.distance_ly} LY` : `${star.distance_ly.toFixed(2)} LY`}
        />
        <ListItemStarStats 
          label="Star Type" 
          value={currentComponent?.star_type || "--"}
        />
        <ListItemStarStats 
          label="Mass compared to Sun" 
          value={currentComponent?.mass_compared_to_sun || "--"}
        />
        <ListItemStarStats 
          label="Life Span" 
          value={currentComponent?.life_span || "--"}
        />
        <ListItemStarStats 
          label="Age" 
          value={currentComponent?.age || "--"}
        />
        <ListItemStarStats 
          label="Habitable Zone" 
          value={currentComponent?.habitable_zone || "--"}
        />
        <ListItemStarStats 
          label="Discovered" 
          value={currentComponent?.discovered || "--"}
        />
      </div>
    </div>
  );
};

export default MobileInfoPanel;

