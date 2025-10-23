import { useState } from 'react';
import HeaderWindow from './ui/HeaderWindow';

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
          <div className="space-y-4">
            <div>
              <p className="text-grey-200 font-medium mb-2">What you're seeing:</p>
              <p className="text-grey-300 text-sm">The nearest stars to Earth within 20 light years.</p>
            </div>
            
            <div>
              <p className="text-grey-200 font-medium mb-2">How to Explore:</p>
              <p className="text-grey-300 text-sm">Drag to rotate, Scroll to zoom, Click or Tap Stars for details.</p>
            </div>
            
            <div>
              <p className="text-grey-200 font-medium mb-2">Important Note:</p>
              <p className="text-grey-300 text-sm">Data is approximate and continually being refined.</p>
            </div>
          </div>
        );
      
      case 'about':
        return (
          <div className="space-y-4">
            <div>
              <p className="text-grey-200 font-medium mb-2">About Starscape</p>
              <p className="text-grey-300 text-sm">Starscape is an interactive 3D visualisation of our stellar neighbourhood, showing the nearest stars within 20 light years of Earth based on actual astronomical data.</p>
            </div>
            
            <div>
              <p className="text-grey-200 font-medium mb-2">Tech Stack</p>
              <p className="text-grey-300 text-sm">Built with AI-assisted development - Cursor AI was used to write the JavaScript while I focused on designing the interface and user experience.</p>
              <p className="text-grey-300 text-sm mt-2">Starscape is built with Three.js for 3D rendering, React for interactivity, Tailwind for styling, and Astro as the framework.</p>
            </div>
            
            <div>
              <p className="text-grey-200 font-medium mb-2">About Me</p>
              <p className="text-grey-300 text-sm">I'm Kieran Kelly, a UX/UI designer exploring the intersection of AI-assisted development and creative coding. Starscape is entirely non-commercial and created for educational purposes.</p>
            </div>
          </div>
        );
      
      case 'feedback':
        return (
          <div className="space-y-4">
            <div>
              <p className="text-grey-200 font-medium mb-2">Help Shape Starscape:</p>
              <p className="text-grey-300 text-sm">This is a learning project and your feedback helps me improve Starscape. Whether it's a bug, a feature idea, or just a thought - I'd love to hear it.</p>
            </div>
            
            <div className="pt-2">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors">
                Leave Feedback
              </button>
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
          ? 'top-[68px] left-4 right-4 w-auto' 
          : 'top-4 right-4 w-[346px] max-h-[calc(100vh-32px)]'
      }`}
    >
      {/* HeaderWindow */}
      <HeaderWindow 
        title="Welcome to Starscape" 
        onClose={onClose}
      />
      
      {/* Tab Navigation */}
      <div className="px-4 pt-2 pb-1">
        <div className="flex border-b border-grey-600">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-2 text-xs font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-white border-b-2 border-blue-500 bg-grey-600'
                  : 'text-grey-400 hover:text-grey-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      
      {/* Content */}
      <div className="px-4 py-4">
        {renderContent()}
      </div>
    </div>
  );
};

export default PanelOnboarding;
