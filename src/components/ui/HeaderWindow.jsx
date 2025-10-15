import ButtonIconSmall from './ButtonIconSmall';

export default function HeaderWindow({ 
  title, 
  onClose 
}) {
  return (
    <div className="flex justify-between items-center self-stretch flex-grow-0 flex-shrink-0 h-9 relative pl-3 pr-3 rounded-tl-lg rounded-tr-lg bg-grey-650">
      <p className="flex-grow-0 flex-shrink-0 text-[13px] font-semibold text-left text-white font-sans">
        {title}
      </p>
      <ButtonIconSmall 
        icon="/icons/ui/Icon_UI_Close_01.svg"
        alt="Close"
        onClick={onClose}
        size="small"
      />
    </div>
  );
}
