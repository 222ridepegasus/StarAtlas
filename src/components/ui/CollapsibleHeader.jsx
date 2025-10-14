import ButtonIconSmall from './ButtonIconSmall';

export default function CollapsibleHeader({ title, isCollapsed, onToggle }) {
  const chevronIcon = isCollapsed 
    ? '/icons/ui/Icon_UI_ChevronDown_01.svg'
    : '/icons/ui/Icon_UI_ChevronUp_01.svg';

  return (
    <div className="h-8 pl-2 pr-1 flex items-center justify-between">
      <h3 className="text-[11px] font-bold text-white">{title}</h3>
      <ButtonIconSmall 
        icon={chevronIcon}
        alt={isCollapsed ? "Expand" : "Collapse"}
        onClick={onToggle}
      />
    </div>
  );
}
