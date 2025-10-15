export default function ButtonTextSmall({ 
  text,
  onClick,
  isActive = false
}) {
  const baseClasses = "flex-1 h-7 rounded-md transition-all duration-200 flex items-center justify-center cursor-pointer border text-[11px] font-normal font-sans";
  
  const stateClasses = isActive
    ? "bg-grey-800 text-grey-100 border-grey-200"
    : "bg-transparent text-grey-200 border-grey-500 hover:text-grey-100 hover:border-grey-200";

  return (
    <button
      className={`${baseClasses} ${stateClasses}`}
      onClick={onClick}
      aria-label={text}
    >
      {text}
    </button>
  );
}
