import { useState } from 'react';

export default function IconButton({ 
  icon, 
  alt = "Icon", 
  isActive = false, 
  onClick,
  size = "default" // "small" or "default"
}) {
  const [isHovered, setIsHovered] = useState(false);

  const sizeClasses = size === "small" 
    ? "w-10 h-10 p-2" 
    : "w-12 h-12 p-3";

  const baseClasses = "rounded-lg transition-all duration-200 flex items-center justify-center cursor-pointer border";
  
  const stateClasses = isActive
    ? "bg-grey-600 border-grey-500"
    : isHovered
    ? "bg-grey-600 border-grey-600"
    : "bg-transparent border-grey-600 hover:border-grey-500";

  return (
    <button
      className={`${baseClasses} ${sizeClasses} ${stateClasses}`}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label={alt}
    >
      <img 
        src={icon} 
        alt={alt} 
        className="w-full h-full object-contain"
        style={{ filter: 'brightness(0) invert(1)' }} // Make SVGs white
      />
    </button>
  );
}

