import { useState } from 'react';
import ButtonTabIcon from './ButtonTabIcon';
import Tooltip from './Tooltip';

export default function TabGroup({ 
  tabs, 
  defaultActive = null,
  onChange = null,
  columns = 3 
}) {
  const [activeTab, setActiveTab] = useState(defaultActive);

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    if (onChange) {
      onChange(tabId);
    }
  };

  return (
    <div className="bg-grey-600 rounded-md ">
      <div 
        className="grid"
        style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
      >
        {tabs.map((tab) => (
          <Tooltip key={tab.id} content={tab.alt} delay={1000}>
            <ButtonTabIcon
              icon={tab.icon}
              alt={tab.alt}
              isActive={activeTab === tab.id}
              onClick={() => handleTabClick(tab.id)}
            />
          </Tooltip>
        ))}
      </div>
    </div>
  );
}

