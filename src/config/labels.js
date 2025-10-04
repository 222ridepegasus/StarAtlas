// ═══════════════════════════════════════════════════════════
// STARATLAS LABEL CONFIGURATION
// ═══════════════════════════════════════════════════════════
// Configure star labels, tooltips, and text rendering
// ═══════════════════════════════════════════════════════════

export const LABEL_CONFIG = {
  // Font settings
  font: {
    path: '/fonts/Orbitron-Regular.ttf',
    size: 0.4,
    weight: 'normal',
  },
  
  // Label positioning (camera-relative)
  position: {
    pad: 0.3,          // Padding from star (in camera-right direction)
    vOffset: 0,        // Vertical offset
  },
  
  // Label appearance
  appearance: {
    color: '#ffffff',
    opacity: 1.0,
    outlineWidth: 0.02,
    outlineColor: '#000000',
    outlineOpacity: 0.8,
  },
  
  // Label behavior
  behavior: {
    alwaysVisible: true,        // Show all labels always
    fadeWithDistance: false,     // Fade labels when far from camera
    minDistance: 0,              // Min distance to show label
    maxDistance: 100,            // Max distance to show label
  },
  
  // Text formatting
  formatting: {
    maxWidth: 10,               // Max width before wrapping
    textAlign: 'left',          // left, center, right
    anchorX: 'left',            // left, center, right
    anchorY: 'middle',          // top, middle, bottom
  },
};

// Helper to format star names
export const formatStarName = (name) => {
  // You can customize name formatting here
  return name.toUpperCase();
};