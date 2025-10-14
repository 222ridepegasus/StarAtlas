import { useState } from 'react';
import CheckboxColor from './CheckboxColor';

export default function StarClassItem({ 
  type, // e.g., "O", "B", "A", etc.
  color, // e.g., "spectral-O", "spectral-B", etc.
  isChecked = true,
  onChange = null
}) {
  const [checked, setChecked] = useState(isChecked);

  const handleToggle = () => {
    const newChecked = !checked;
    setChecked(newChecked);
    if (onChange) {
      onChange(type, newChecked);
    }
  };

  return (
    <div className="flex items-center justify-between py-1">
      <div className="flex items-center gap-2">
        {/* Colored circle with outer and inner ellipses */}
        <div className="w-4 h-4 relative flex items-center justify-center">
          {/* Outer ellipse - 16px x 16px at 50% opacity */}
          <div 
            className="w-4 h-4 rounded-full absolute"
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
          {/* Inner ellipse - 10px x 10px at 100% opacity, centered */}
          <div 
            className="w-2.5 h-2.5 rounded-full absolute"
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
        <span className="text-[11px] text-grey-200">{type} Type</span>
      </div>
      
      {/* Checkbox */}
      <CheckboxColor 
        color={color}
        isChecked={checked}
        onClick={handleToggle}
      />
    </div>
  );
}
