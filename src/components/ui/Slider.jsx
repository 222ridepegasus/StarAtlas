import { useState, useEffect } from 'react';

export default function Slider({ 
  value = 20, 
  min = 4, 
  max = 32, 
  step = 4,
  onChange = null,
  width = "132px",
  thumbSize = 16 // 16px for desktop, 20px for mobile
}) {
  const [currentValue, setCurrentValue] = useState(value);

  // Sync internal state with external value prop
  useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  const handleChange = (e) => {
    const newValue = parseInt(e.target.value);
    setCurrentValue(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };

  const percentage = ((currentValue - min) / (max - min)) * 100;
  
  const thumbSizeClass = thumbSize === 20 ? 'w-5 h-5' : 'w-4 h-4';
  const containerHeight = thumbSize === 20 ? 'h-5' : 'h-4';
  
  // Clamp thumb position to stay within bounds
  // At 0%, thumb left edge at 0. At 100%, thumb right edge at 100%
  const clampedPercentage = Math.min(Math.max(percentage, 0), 100);

  return (
    <div className={`relative ${containerHeight}`} style={{ width }}>
      {/* Track */}
      <div className="absolute top-1/2 left-0 right-0 h-1.5 bg-grey-600 rounded-full transform -translate-y-1/2"></div>
      
      {/* Fill */}
      <div 
        className="absolute top-1/2 left-0 h-1.5 bg-grey-500 rounded-full transform -translate-y-1/2"
        style={{ width: `${clampedPercentage}%` }}
      ></div>
      
      {/* Thumb - use calc to keep within bounds */}
      <div 
        className={`absolute top-1/2 ${thumbSizeClass} bg-grey-800 border border-grey-400 rounded-full transform -translate-y-1/2`}
        style={{ left: `calc(${clampedPercentage}% - ${(clampedPercentage / 100) * thumbSize}px)` }}
      ></div>
      
      {/* Hidden input for accessibility */}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={currentValue}
        onChange={handleChange}
        className={`absolute inset-0 w-full ${containerHeight} opacity-0 cursor-pointer`}
      />
    </div>
  );
}
