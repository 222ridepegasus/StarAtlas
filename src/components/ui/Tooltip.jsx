import { useState, useRef } from 'react';

export default function Tooltip({ 
  children, 
  content, 
  delay = 500,
  disabled = false 
}) {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef(null);

  const showTooltip = () => {
    if (disabled) return;
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
    >
      {children}
      
      {isVisible && (
        <div className="absolute z-50 top-full left-5 mt-1">
          <div className="px-2 py-1 rounded-md bg-grey-500 text-[11px] text-grey-200 whitespace-nowrap shadow-md">
            {content}
          </div>
        </div>
      )}
    </div>
  );
}
