export default function InfoSnippet({ 
  text 
}) {
  return (
    <div className="flex flex-col justify-start items-start self-stretch flex-grow-0 flex-shrink-0 relative gap-1.5 px-4 pt-3 pb-2">
      {text?.split('\n\n').map((paragraph, i) => (
        <p 
          key={i} 
          className="text-[12px] text-left font-normal text-grey-200 opacity-90 leading-relaxed font-sans"
        >
          {paragraph}
        </p>
      ))}
    </div>
  );
}