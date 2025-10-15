export default function ButtonStar({ 
  name,
  spectralType,
  isActive = false,
  onClick
}) {
  const baseClasses = "h-8 rounded-md transition-all duration-200 flex items-center cursor-pointer border text-[11px] font-semibold px-2 font-sans";
  
  const stateClasses = isActive
    ? "bg-grey-800 text-white border-grey-300"
    : "bg-transparent text-grey-200 border-grey-500 hover:text-grey-100 hover:border-grey-300";

  // Get spectral color based on star's spectral type (same as SearchResultsListItem)
  const getSpectralColor = (spectralType) => {
    const spectralClass = spectralType?.charAt(0)?.toUpperCase() || 'O';
    return spectralClass === 'O' ? '#9bb0ff' :
           spectralClass === 'B' ? '#aabfff' :
           spectralClass === 'A' ? '#f8f7ff' :
           spectralClass === 'F' ? '#fff4e8' :
           spectralClass === 'G' ? '#fff5b8' :
           spectralClass === 'K' ? '#ffc870' :
           spectralClass === 'M' ? '#ff6b4a' :
           spectralClass === 'L' ? '#c45530' :
           spectralClass === 'T' ? '#a855f7' :
           spectralClass === 'Y' ? '#7c3aed' :
           spectralClass === 'D' ? '#e0e7ff' : '#9bb0ff';
  };

  const spectralColor = getSpectralColor(spectralType);

  return (
    <button
      className={`${baseClasses} ${stateClasses}`}
      onClick={onClick}
      aria-label={name}
    >
      {/* Double ellipse icon - 16x16px */}
      <div className="w-4 h-4 relative flex items-center justify-center mr-2">
        {/* Outer ellipse - 16px x 16px at 50% opacity */}
        <div 
          className="w-4 h-4 rounded-full absolute"
          style={{ 
            backgroundColor: spectralColor,
            opacity: 0.5
          }}
        />
        {/* Inner ellipse - 10px x 10px at 100% opacity, centered */}
        <div 
          className="w-2.5 h-2.5 rounded-full absolute"
          style={{ 
            backgroundColor: spectralColor,
            opacity: 1
          }}
        />
      </div>
      <span className="truncate">{name}</span>
    </button>
  );
}
