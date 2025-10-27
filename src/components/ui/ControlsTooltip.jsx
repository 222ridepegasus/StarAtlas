import { useState, useRef, useEffect } from 'react';

export default function ControlsTooltip({ 
  children, 
  delay = 500,
  position = 'bottom'
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState(null);
  const tooltipRef = useRef(null);

  const showTooltip = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    const id = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    setTimeoutId(id);
  };

  const hideTooltip = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    setIsVisible(false);
  };

  const keyboardControls = [
    { key: 'W', action: 'Move Forward' },
    { key: 'A', action: 'Move Left' },
    { key: 'S', action: 'Move Back' },
    { key: 'D', action: 'Move Right' },
    { key: 'P', action: 'Move Up' },
    { key: 'L', action: 'Move Down' },
    { key: 'Q', action: 'Orbit Right' },
    { key: 'E', action: 'Orbit Left' },
    { key: '+', action: 'Zoom In' },
    { key: '-', action: 'Zoom Out' },
    { key: 'F', action: 'Focus on Star' },
    { key: 'Z', action: 'Zoom to Star' },
    { key: 'G', action: 'Reset Camera' },
    { key: 'ESC', action: 'Reset Map' }
  ];

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
    >
      {children}
      
      {isVisible && (
        <div
          ref={tooltipRef}
          className={`absolute z-50 bg-grey-500 text-grey-200 rounded-md shadow-md border border-grey-600 px-3 py-1.5 min-w-[128px] ${
            position === 'bottom' ? 'top-full mt-2' : 
            position === 'top' ? 'bottom-full mb-2' :
            position === 'left' ? 'right-full mr-2' :
            'left-full ml-2'
          }`}
          style={{
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)'
          }}
        >
          <div className="text-[11px] font-medium text-grey-100 mb-2 text-left">
            Keyboard Controls:
          </div>
          <div className="space-y-1 text-left">
            {keyboardControls.map((control, index) => (
              <div key={index} className="flex items-center">
                <span className="text-[11px] font-bold text-grey-200 text-left w-7">
                  {control.key}
                </span>
                <span className="text-[11px] text-grey-300 text-left">
                  {control.action}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
