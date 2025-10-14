export default function ButtonIconSmall({ 
  icon, 
  alt = "Icon", 
  onClick,
  size = "default" // "default" or "small"
}) {
  const sizeClasses = size === "small" 
    ? "w-[14px] h-[14px] rounded-sm" 
    : "w-6 h-6 rounded-md";
  
  const iconSizeClasses = size === "small"
    ? "w-3.5 h-3.5"
    : "w-4 h-4";
    
  const baseClasses = `${sizeClasses} transition-all duration-200 flex items-center justify-center cursor-pointer opacity-60 hover:opacity-100 hover:bg-grey-600`;

  return (
    <button
      className={baseClasses}
      onClick={onClick}
      aria-label={alt}
    >
      <img 
        src={icon} 
        alt={alt} 
        className={`${iconSizeClasses} object-contain`}
        style={{ filter: 'brightness(0) invert(1)' }} // Make SVGs white
      />
    </button>
  );
}
