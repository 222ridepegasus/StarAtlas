export default function ButtonMobileIcon({ 
  icon, 
  alt = "Icon", 
  isActive = false, 
  onClick,
  width = "44px" // "44px" (square) or "48px" (wide for tab groups)
}) {
  const widthClass = width === "48px" ? "w-12" : "w-11";
  const baseClasses = `${widthClass} h-11 rounded-md transition-all duration-200 flex items-center justify-center cursor-pointer`;
  
  const stateClasses = isActive
    ? "bg-grey-800 border border-grey-400"
    : "bg-grey-600 border border-transparent";

  const iconOpacity = isActive ? 1.0 : 0.6;

  return (
    <button
      className={`${baseClasses} ${stateClasses}`}
      onClick={onClick}
      aria-label={alt}
    >
      <img 
        src={icon} 
        alt={alt} 
        className="w-[20px] h-[20px] object-contain transition-opacity duration-200"
        style={{ 
          filter: 'brightness(0) invert(1)',
          opacity: iconOpacity
        }}
      />
    </button>
  );
}

