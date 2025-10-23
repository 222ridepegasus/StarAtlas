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
              <p className="text-grey-100 text-xs font-medium leading-relaxed ">About Starscape</p>
              <p className="text-grey-300 text-xs leading-relaxed">Starscape is an interactive 3D visualisation of our stellar neighbourhood, showing the nearest stars within 20 light years of Earth based on actual astronomical data.</p>
            </div>
            
            <div>
              <p className="text-grey-100 text-xs font-medium leading-relaxed ">Tech Stack</p>
              <p className="text-grey-300 text-xs leading-relaxed">Built with AI-assisted development - Cursor AI was used to write the JavaScript while I focused on designing the interface and user experience.</p>
              <p className="text-grey-300 text-xs leading-relaxed mt-1">Starscape is built with Three.js for 3D rendering, React for interactivity, Tailwind for styling, and Astro as the framework.</p>
            </div>
            
            <div>
              <p className="text-grey-100 text-xs font-medium leading-relaxed ">About Me</p>
              <p className="text-grey-300 text-xs leading-relaxed">I'm Kieran Kelly, a UX/UI designer exploring the intersection of AI-assisted development and creative coding. Starscape is entirely non-commercial and created for educational purposes.</p>
            </div>
          </div>
        );
      
      case 'feedback':
        return (
          <div className="px-1 space-y-2.5 pb-2">
            <div>
              <p className="text-grey-100 text-xs font-medium leading-relaxed ">Help Shape Starscape:</p>
              <p className="text-grey-300 text-xs leading-relaxed">This is a learning project and your feedback helps me improve Starscape. Whether it's a bug, a feature idea, or just a thought, please feel free to leave a comment.</p>
            </div>
            
              <div className="pt-1">
                <div className="w-1/2 flex">
                  <ButtonTextSmall
                    text="Leave Feedback"
                    onClick={() => console.log('Leave Feedback clicked')}
                  />
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
        title="Welcome to Starscape" 
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
