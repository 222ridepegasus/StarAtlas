import { useState, useEffect, useRef, useCallback } from 'react';
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
  
  // Mobile swipe states - start in peek mode
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [dragCurrentY, setDragCurrentY] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  
  const panelRef = useRef(null);
  const touchStartRef = useRef(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Optimized touch gesture handlers with useCallback
  const handleTouchStart = useCallback((e) => {
    if (!isMobile) return;
    const touch = e.touches[0];
    touchStartRef.current = touch.clientY;
    setDragStartY(touch.clientY);
    setDragCurrentY(touch.clientY);
    setIsDragging(true);
    setDragOffset(0);
  }, [isMobile]);

  const handleTouchMove = useCallback((e) => {
    if (!isMobile || !isDragging) return;
    e.preventDefault();
    
    const touch = e.touches[0];
    const deltaY = touch.clientY - touchStartRef.current;
    
    // Only update if delta is significant to reduce re-renders
    if (Math.abs(deltaY - dragOffset) > 2) {
      setDragCurrentY(touch.clientY);
      setDragOffset(deltaY);
    }
  }, [isMobile, isDragging, dragOffset]);

  const handleTouchEnd = useCallback((e) => {
    if (!isMobile || !isDragging) return;
    
    const deltaY = dragCurrentY - dragStartY;
    const threshold = 20; // Lower threshold for better responsiveness
    
    // Determine final state based on distance and current state
    if (Math.abs(deltaY) > threshold) {
      if (deltaY < 0) {
        // Swipe up - expand
        setIsExpanded(true);
      } else {
        // Swipe down - collapse  
        setIsExpanded(false);
      }
    } else {
      // Small movement - snap to current state
      if (isExpanded) {
        setIsExpanded(true);
      } else {
        setIsExpanded(false);
      }
    }
    
    // Reset drag state
    setIsDragging(false);
    setDragOffset(0);
  }, [isMobile, isDragging, dragCurrentY, dragStartY, isExpanded]);

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

  // Calculate mobile panel transform for smooth performance
  const getMobilePanelStyle = () => {
    if (!isMobile) return {};
    
    const screenHeight = window.innerHeight;
    const peekHeight = 140; // Height visible in peek mode (drag handle + header + buttons)
    const expandedHeight = screenHeight * 0.7; // 70% of screen height when expanded
    const hideAmount = expandedHeight - peekHeight; // Amount to hide in peek mode
    
    let translateY = hideAmount; // Start hidden (peek mode)
    
    if (isDragging) {
      // During drag, follow finger with bounds
      // Negative drag = swipe up = reduce translateY (show more)
      // Positive drag = swipe down = increase translateY (show less)
      const draggedTranslate = hideAmount - dragOffset;
      translateY = Math.max(0, Math.min(hideAmount, draggedTranslate));
    } else if (isExpanded) {
      // Expanded state - fully visible
      translateY = 0;
    } else {
      // Peek state - mostly hidden
      translateY = hideAmount;
    }
    
    return {
      height: `${expandedHeight}px`,
      transform: `translateY(${translateY}px)`,
      transition: isDragging ? 'none' : 'transform 0.3s ease-out'
    };
  };

  return (
    <div 
      ref={panelRef}
      className={`fixed ${isMobile ? 'bottom-0 left-0 right-0' : 'top-4 right-4'} ${isMobile ? 'w-full' : 'w-[346px]'} ${isMobile ? 'max-h-none' : 'max-h-[calc(100vh-32px)]'} bg-grey-700 ${isMobile ? 'rounded-t-lg' : 'rounded-lg'} text-grey-100 text-sm z-40 ${isMobile ? 'overflow-hidden flex flex-col' : 'overflow-y-auto'} box-border font-sans select-none`}
      style={isMobile ? getMobilePanelStyle() : {}}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Mobile Drag Handle */}
      {isMobile && (
        <div 
          className="flex justify-center py-2 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="w-8 h-1 bg-grey-500 rounded-full"></div>
        </div>
      )}

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

      {/* Mobile Scrollable Content Container */}
      {isMobile ? (
        <div className="flex-1 overflow-y-auto">
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
      ) : (
        <>
          {/* Auto Focus on Click Checkbox - Desktop */}
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

          {/* StarTab Group - Desktop */}
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

          {/* InfoSnippet - Desktop */}
          <InfoSnippet text={currentComponent?.description || "Coming soon..."} />

          {/* Star Stats - Desktop */}
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
        </>
      )}
    </div>
  );
};

export default InfoPanel;