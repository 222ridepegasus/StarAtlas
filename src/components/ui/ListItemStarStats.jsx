export default function ListItemStarStats({ 
  label,
  value 
}) {
  return (
    <div className="flex justify-start items-start self-stretch flex-grow-0 flex-shrink-0 relative gap-2">
      <span className="flex-1 text-xs text-left text-grey-300 font-sans">{label}:</span>
      <span className="flex-1 text-xs font-semibold text-right text-grey-100 font-sans">{value}</span>
    </div>
  );
}
