export default function CheckboxColor({ 
  color = "spectral-O", // spectral color or "neutral"
  isChecked = false,
  onClick,
  size = "default" // "default" (16px) or "large" (24px for mobile)
}) {
  const getColorSuffix = () => {
    if (color === "neutral") return "Default";
    
    // Map spectral colors to type names
    const colorMap = {
      "spectral-O": "OType",
      "spectral-B": "BType", 
      "spectral-A": "AType",
      "spectral-F": "FType",
      "spectral-G": "GType",
      "spectral-K": "KType",
      "spectral-M": "MType",
      "spectral-L": "LType",
      "spectral-T": "TType",
      "spectral-Y": "YType",
      "spectral-D": "DType"
    };

    return colorMap[color] || "Default";
  };

  const sizeClass = size === "large" ? "w-6 h-6" : "w-4 h-4";

  const colorSuffix = getColorSuffix();
  const iconPath = isChecked 
    ? `/icons/ui/Icon_UI_CheckboxOn_${colorSuffix}_01.svg`
    : `/icons/ui/Icon_UI_CheckboxOff_Default_01.svg`;

  return (
    <button
      className={`${sizeClass} transition-all duration-200 cursor-pointer`}
      onClick={onClick}
      aria-label={`Toggle ${color}`}
    >
      <img 
        src={iconPath}
        alt={`Checkbox ${isChecked ? 'checked' : 'unchecked'}`}
        className="w-full h-full object-contain"
      />
    </button>
  );
}
