export default function SearchResultsListItem({ 
  star, 
  onClick = null 
}) {
  // Get spectral color based on star's spectral type
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

  // Get spectral type from components array if it exists
  const spectralType = star.spectral_type || star.components?.[0]?.star_type || 'O';
  const spectralColor = getSpectralColor(spectralType);

  return (
    <div
      className="flex flex-col justify-start items-start self-stretch flex-grow-0 flex-shrink-0 h-12 gap-[3px] p-2 rounded-md bg-[#333347] border border-transparent hover:bg-[#1a1a2e] hover:border hover:border-[#6b6b7b] transition-colors cursor-pointer"
      onClick={onClick}
    >
      {/* Top Section - Star Name and Icon */}
      <div className="flex justify-start items-center self-stretch flex-grow-0 flex-shrink-0 relative gap-1.5">
        {/* Star Class Icon - Reusing from StarClassItem */}
        <div className="w-4 h-4 relative flex items-center justify-center">
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
        
        {/* Star Name */}
        <p className="flex-grow w-[126px] text-[11px] font-semibold text-left text-white truncate">
          {star.name}
        </p>
      </div>
      
      {/* Bottom Section - Distance */}
      <div className="flex justify-center items-center self-stretch flex-grow-0 flex-shrink-0 relative gap-2">
        <p className="flex-grow w-[148px] text-[11px] text-left text-[#f5f5f9]/70">
          {star.distance_ly.toFixed(1)} LY
        </p>
      </div>
    </div>
  );
}
