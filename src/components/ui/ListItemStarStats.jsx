export default function ListItemStarStats({ 
  label,
  value 
}) {
  return (
    <div className="flex justify-start items-start self-stretch flex-grow-0 flex-shrink-0 relative gap-2">
      <span className="flex-1 text-[12px] text-left text-grey-300 opacity-90 font-sans">{label}:</span>
      <span className="flex-1 text-[12px] font-medium text-right text-grey-100 opacity-90 font-sans">{value}</span>
    </div>
  );
}
