export default function SectionHeader({ title, value = null }) {
  return (
    <div className="h-8 px-2 flex items-center justify-between">
      <h3 className="text-[11px] font-bold text-white">{title}</h3>
      {value && <span className="text-[11px] font-bold text-white">{value}</span>}
    </div>
  );
}

