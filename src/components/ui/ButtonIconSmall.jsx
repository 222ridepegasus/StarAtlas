export default function ButtonIconSmall({ 
  icon, 
  alt = "Icon", 
  onClick
}) {
  const baseClasses = "w-6 h-6 rounded-md transition-all duration-200 flex items-center justify-center cursor-pointer opacity-60 hover:opacity-100 hover:bg-grey-600";

  return (
    <button
      className={baseClasses}
      onClick={onClick}
      aria-label={alt}
    >
      <img 
        src={icon} 
        alt={alt} 
        className="w-4 h-4 object-contain"
        style={{ filter: 'brightness(0) invert(1)' }} // Make SVGs white
      />
    </button>
  );
}
