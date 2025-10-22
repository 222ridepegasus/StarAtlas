import { useState, useEffect } from 'react';
import HeaderWindow from './ui/HeaderWindow';
import ButtonTextSmall from './ui/ButtonTextSmall';
import ButtonStar from './ui/ButtonStar';
import InfoSnippet from './ui/InfoSnippet';
import ListItemStarStats from './ui/ListItemStarStats';
import Separator from '../components/ui/Separator';
import CheckboxColor from './ui/CheckboxColor';

const InfoPanel = ({ star, onClose, onFocus, onZoom, onReset, isFocused, autoFocusOnClick, onAutoFocusChange }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState(0);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
    <div className={`fixed ${isMobile ? 'bottom-4 left-4 right-4' : 'top-4 right-4'} w-[346px] max-h-[calc(100vh-32px)] bg-grey-700 rounded-lg text-grey-100 text-sm z-40 overflow-y-auto box-border font-sans select-none`}>
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

      {/* Auto Focus on Click Checkbox */}
      <div className="flex items-center gap-2 px-4 pt-3.5 pb-1">
        <CheckboxColor 
          color="neutral"
          isChecked={autoFocusOnClick}
          onClick={() => onAutoFocusChange && onAutoFocusChange(!autoFocusOnClick)}
        />
        <p className="text-[11px] text-grey-200">
          Auto Focus on Click
        </p>
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
        {/* <ListItemStarStats 
          label="Visibility" 
          value={currentComponent?.visibility || "--"}
        /> */}
        {/* <ListItemStarStats 
          label="Alternate Names" 
          value={currentComponent?.alternate_names || "--"}
        /> */}
      </div>
    </div>
  );
};

export default InfoPanel;