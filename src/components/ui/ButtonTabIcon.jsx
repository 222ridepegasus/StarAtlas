export default function ButtonTabIcon({ 
  icon, 
  alt = "Icon", 
  isActive = false, 
  onClick,
  width = "44px" // "44px" or "32px"
}) {
  const widthClasses = width === "32px" ? "w-8" : "w-11";
  const baseClasses = `${widthClasses} h-8 rounded-md transition-all duration-200 flex items-center justify-center cursor-pointer`;
  
  const stateClasses = isActive
    ? "bg-grey-800 border border-grey-400"
    : "bg-transparent border-0 opacity-60";

  return (
    <button
      className={`${baseClasses} ${stateClasses}`}
      onClick={onClick}
      aria-label={alt}
    >
      <img 
        src={icon} 
        alt={alt} 
        className="w-[16px] h-[16px] object-contain"
        style={{ filter: 'brightness(0) invert(1)' }} // Make SVGs white
      />
    </button>
  );
}

