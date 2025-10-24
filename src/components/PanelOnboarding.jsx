import { useState } from 'react';
import HeaderWindow from './ui/HeaderWindow';
import Separator from './ui/Separator';
import ButtonTextSmall from './ui/ButtonTextSmall';

const PanelOnboarding = ({ onClose, isMobile }) => {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'about', label: 'About' },
    { id: 'feedback', label: 'Feedback' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="px-1 space-y-2.5 pb-2">
            <div>
              <p className="text-grey-100 text-xs leading-relaxed font-medium ">What you're seeing:</p>
              <p className="text-grey-300 text-xs">The nearest stars to Earth within 20 light years.</p>
            </div>
            
            <div>
              <p className="text-grey-100 text-xs leading-relaxed font-medium">How to Explore:</p>
              <p className="text-grey-300 text-xs">Drag to rotate, Scroll to zoom, Click or Tap Stars for details.</p>
            </div>
            
            <div>
              <p className="text-grey-100 text-xs leading-relaxed font-medium">Important Note:</p>
              <p className="text-grey-300 text-xs leading-relaxed ">Data is approximate and continually being refined.</p>
            </div>
          </div>
        );
      
      case 'about':
        return (
          <div className="px-1 space-y-2.5 pb-2">
            <div>
              <p className="text-grey-100 text-xs font-medium leading-relaxed ">About 20LY</p>
              <p className="text-grey-300 text-xs leading-relaxed">20LY is an interactive 3D visualisation of our stellar neighbourhood. Here you can explore all star systems within a 20 light year Radius of Earth, based on actual astronomical data.</p>
              
            </div>

            <div>
              <p className="text-grey-100 text-xs font-medium leading-relaxed ">Disclaimer</p>
              <p className="text-grey-300 text-xs leading-relaxed">Star data is approximate and may contain inaccuracies. Not intended for scientific or navigational use.</p>
              <p className="text-grey-300 text-xs leading-relaxed mt-2">This site uses privacy-friendly analytics that don't track personal information or use cookies.</p>
            </div>
            
            <div>
              <p className="text-grey-100 text-xs font-medium leading-relaxed ">Tech Stack</p>
              <p className="text-grey-300 text-xs leading-relaxed">This is an AI-assisted development project, Cursor AI was used to write the JavaScript while I focused on designing the interface and user experience.</p>
              <p className="text-grey-300 text-xs leading-relaxed mt-2">20LY is built with Three.js for 3D rendering, React for interactivity, Tailwind for styling, and Astro as the framework.</p>
            </div>
            
            <div>
              <p className="text-grey-100 text-xs font-medium leading-relaxed ">About Me</p>
              <p className="text-grey-300 text-xs leading-relaxed">I'm Kieran Kelly, a UX/UI designer, you can visit my portfolio website at <a href='https://kierankelly.net' target='_blank' rel='noopener noreferrer' className='underline hover:text-grey-100'>kierankelly.net</a>.</p>
            </div>
          </div>
        );
      
      case 'feedback':
        return (
          <div className="px-1 space-y-1.5 pb-2">
            <div>
              <p className="text-grey-100 text-xs font-medium leading-relaxed">Help Shape 20LY:</p>
              <p className="text-grey-300 text-xs leading-relaxed">If you'd like to get in touch and leave feedback, report a bug, or request a feature please click the button below.</p>
            </div>

            <div className="">
              <div className="w-1/2 flex mb-3">
                <a 
                  href="https://tally.so/r/npjd18" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex-1 rounded-md transition-all duration-200 flex items-center justify-center cursor-pointer border text-[11px] font-normal font-sans bg-transparent text-grey-200 border-grey-500 hover:text-grey-100 hover:border-grey-200"
                  style={{ height: "28px" }}
                >
                  Leave Feedback
                </a>
              </div>
            </div>

            <div>
              <p className="text-grey-300 text-xs leading-relaxed">This is a 100% hobby project. If you'd like to support continued development:</p>
            </div>

            <div className="">
              <div className="w-1/2 flex">
              <a 
                  href="https://ko-fi.com/20ly" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex-1 rounded-md transition-all duration-200 flex items-center justify-center cursor-pointer border text-[11px] font-normal font-sans bg-transparent text-grey-200 border-grey-500 hover:text-grey-100 hover:border-grey-200"
                  style={{ height: "28px" }}
                >
                  Buy Me a Coffee ☕
                </a>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div 
      className={`fixed z-40 bg-grey-700 rounded-lg text-grey-100 text-sm overflow-y-auto box-border font-sans select-none ${
        isMobile 
          ? 'top-[68px] left-4 right-4 w-auto max-h-[calc(100vh-100px)]' 
          : 'top-4 right-4 w-[346px] max-h-[calc(100vh-32px)]'
      }`}
    >
      {/* HeaderWindow */}
      <HeaderWindow 
        title="Welcome to 20LY" 
        onClose={onClose}
        showClose={!isMobile}
      />
      
      <Separator />
      
      {/* Tab Navigation */}
      <div className="px-3 pt-3 pb-1">
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <ButtonTextSmall
              key={tab.id}
              text={tab.label}
              onClick={() => setActiveTab(tab.id)}
              isActive={activeTab === tab.id}
              height="28px"
            />
          ))}
        </div>
      </div>
      
      {/* Content */}
      <div className="px-3 py-3">
        {renderContent()}
      </div>
    </div>
  );
};

export default PanelOnboarding;
