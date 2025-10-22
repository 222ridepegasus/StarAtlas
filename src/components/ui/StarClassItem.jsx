import { useState } from 'react';
import CheckboxColor from './CheckboxColor';

export default function StarClassItem({ 
  type, // e.g., "O", "B", "A", etc.
  color, // e.g., "spectral-O", "spectral-B", etc.
  isChecked = true,
  onChange = null,
  size = "default" // "default" (16px) or "large" (24px for mobile)
}) {
  const [checked, setChecked] = useState(isChecked);

  const handleToggle = () => {
    const newChecked = !checked;
    setChecked(newChecked);
    if (onChange) {
      onChange(type, newChecked);
    }
  };

  const iconSize = size === "large" ? "w-6 h-6" : "w-4 h-4";
  const innerIconSize = size === "large" ? "w-4 h-4" : "w-2.5 h-2.5";
  const textSize = size === "large" ? "text-xs" : "text-[11px]"; // 12px for mobile, 11px for desktop

  return (
    <div className="flex items-center justify-between py-1">
      <div className="flex items-center gap-2">
        {/* Colored circle with outer and inner ellipses */}
        <div className={`${iconSize} relative flex items-center justify-center`}>
          {/* Outer ellipse - responsive size at 50% opacity */}
          <div 
            className={`${iconSize} rounded-full absolute`}
            style={{ 
              backgroundColor: color === 'spectral-O' ? '#9bb0ff' :
                             color === 'spectral-B' ? '#aabfff' :
                             color === 'spectral-A' ? '#f8f7ff' :
                             color === 'spectral-F' ? '#fff4e8' :
                             color === 'spectral-G' ? '#fff5b8' :
                             color === 'spectral-K' ? '#ffc870' :
                             color === 'spectral-M' ? '#ff6b4a' :
                             color === 'spectral-L' ? '#c45530' :
                             color === 'spectral-T' ? '#a855f7' :
                             color === 'spectral-Y' ? '#7c3aed' :
                             color === 'spectral-D' ? '#e0e7ff' : '#9bb0ff',
              opacity: 0.5
            }}
          />
          {/* Inner ellipse - responsive size at 100% opacity, centered */}
          <div 
            className={`${innerIconSize} rounded-full absolute`}
            style={{ 
              backgroundColor: color === 'spectral-O' ? '#9bb0ff' :
                             color === 'spectral-B' ? '#aabfff' :
                             color === 'spectral-A' ? '#f8f7ff' :
                             color === 'spectral-F' ? '#fff4e8' :
                             color === 'spectral-G' ? '#fff5b8' :
                             color === 'spectral-K' ? '#ffc870' :
                             color === 'spectral-M' ? '#ff6b4a' :
                             color === 'spectral-L' ? '#c45530' :
                             color === 'spectral-T' ? '#a855f7' :
                             color === 'spectral-Y' ? '#7c3aed' :
                             color === 'spectral-D' ? '#e0e7ff' : '#9bb0ff',
              opacity: 1
            }}
          />
        </div>
        {/* Star type label */}
        <span className={`${textSize} text-grey-200`}>{type} Type</span>
      </div>
      
      {/* Checkbox */}
      <CheckboxColor 
        color={color}
        isChecked={checked}
        onClick={handleToggle}
        size={size}
      />
    </div>
  );
}
