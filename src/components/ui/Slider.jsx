import { useState } from 'react';

export default function Slider({ 
  value = 20, 
  min = 4, 
  max = 32, 
  step = 4,
  onChange = null,
  width = "132px"
}) {
  const [currentValue, setCurrentValue] = useState(value);

  const handleChange = (e) => {
    const newValue = parseInt(e.target.value);
    setCurrentValue(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };

  const percentage = ((currentValue - min) / (max - min)) * 100;
  
  // Calculate thumb position to keep it within track boundaries
  // The thumb is 16px (w-4 h-4) wide, so we need to account for half that (8px) on each side
  const thumbRadius = 8; // 16px / 2
  const trackWidth = parseInt(width.replace('px', '')); // Convert width to number
  const maxLeft = trackWidth - thumbRadius;
  const minLeft = thumbRadius;
  
  // Clamp the thumb position between the track edges
  const thumbLeft = Math.max(minLeft, Math.min(maxLeft, (percentage / 100) * trackWidth));

  return (
    <div className="relative" style={{ width }}>
      {/* Track */}
      <div className="absolute top-1/2 left-0 right-0 h-1.5 bg-grey-600 rounded-full transform -translate-y-1/2"></div>
      
      {/* Fill */}
      <div 
        className="absolute top-1/2 left-0 h-1.5 bg-grey-500 rounded-full transform -translate-y-1/2"
        style={{ width: `${percentage}%` }}
      ></div>
      
      {/* Thumb */}
      <div 
        className="absolute top-1/2 w-4 h-4 bg-grey-800 border border-grey-400 rounded-full transform -translate-y-1/2 -translate-x-1/2"
        style={{ left: `${thumbLeft}px` }}
      ></div>
      
      {/* Hidden input for accessibility */}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={currentValue}
        onChange={handleChange}
        className="absolute inset-0 w-full h-4 opacity-0 cursor-pointer"
      />
    </div>
  );
}
