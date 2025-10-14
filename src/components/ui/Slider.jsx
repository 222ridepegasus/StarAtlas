import { useState } from 'react';

export default function Slider({ 
  value = 50, 
  min = 0, 
  max = 100, 
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
        style={{ left: `${percentage}%` }}
      ></div>
      
      {/* Hidden input for accessibility */}
      <input
        type="range"
        min={min}
        max={max}
        value={currentValue}
        onChange={handleChange}
        className="absolute inset-0 w-full h-4 opacity-0 cursor-pointer"
      />
    </div>
  );
}
