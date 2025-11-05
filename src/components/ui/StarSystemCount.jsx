export default function StarSystemCount({ count }) {
  return (
    <div className="flex justify-center items-center h-8 relative gap-1 px-4 py-2 rounded-[256px] bg-[#252538] font-sans select-none">
      <p className="flex-grow-0 flex-shrink-0 text-[11px] text-left text-white/70">
        <span className="flex-grow-0 flex-shrink-0 text-[11px] text-left text-white/70">Showing </span>
        <span className="flex-grow-0 flex-shrink-0 text-[11px] font-semibold text-left text-white/70">
          {count}
        </span>
        <span className="flex-grow-0 flex-shrink-0 text-[11px] text-left text-white/70"> Star Systems</span>
      </p>
    </div>
  );
}

