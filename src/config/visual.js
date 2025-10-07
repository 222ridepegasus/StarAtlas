// ═══════════════════════════════════════════════════════════
// STARATLAS VISUAL CONFIGURATION
// ═══════════════════════════════════════════════════════════
// Edit colors, sizes, and stroke weights here
// ═══════════════════════════════════════════════════════════

export const COLORS = {
  // Scene
  background: 0x0f0f1a,
  
  // Grid - Square
  gridSquare: 0x444488, // was 0x888888
  gridSquareMinor: 0x444444,
  
  // Grid - Circular
  gridCircular: 0x444488,
  
  // Stalks
  stalkLine: 0x445577,
  stalkEllipse: 0x445577,
  
  // Connections
  connectionLine: 0xcccccc,
  
  // Highlights
  highlightOuter: "rgba(255, 255, 255, 1)",
  highlightInner: "rgba(255, 255, 255, 0.5)",
  
  // Labels
  labelText: "#ffffff",
  
  // Stars by spectral type
  spectral: {
    O: 0x3399ff,    // Hot blue
    B: 0x66ccff,    // Blue-white
    A: 0xffffff,    // White
    F: 0xffff99,    // Yellow-white
    G: 0xffff33,    // Yellow (like our Sun)
    K: 0xff9900,    // Orange
    M: 0xff3300,    // Red
    L: 0x996633,    // Brown
    T: 0x9933cc,    // Purple (brown dwarf)
    Y: 0x330033,    // Dark purple
    D: 0xffffff,    // White dwarf
  },
  
  // Star effects
  starGlow: {
    opacity: 0.3,
  },
};

export const SIZES = {
  // Stars
  starRadius: 0.15,
  starGlowRadius: 0.25,
  
  // Stalk base (filled circle on the plane)
  stalkBaseRadius: 0.12,
  
  // Grid - Square (sync with circular max)
  gridSquareSize: 20,        // extends to ±20 LY (matches circular max)
  gridSquareStep: 4,         // 4 LY per square
  
  // Grid - Circular (rings at 4, 8, 12, 16, 20 LY)
  gridCircularRings: [4, 8, 12, 16, 20],  // Light years
  gridCircularSegments: 8,    // 8 radial lines (N, NE, E, SE, S, SW, W, NW)
  
  // View distance options (for zoom feature)
  viewDistances: [8, 12, 16, 20],  // Available zoom levels in LY
};

export const STROKE_WEIGHTS = {
  // Grid lines
  gridLine: 4,
  gridLineOpacity: 1.0,
  
  // Circular grid specific
  circularRingOpacity: 1.0,
  circularRadialOpacity: 1.0,

  // Star stalk (vertical line)
  stalk: 1,
  stalkOpacity: 0.5,
  
  // Stalk base (filled circle, no stroke)
  stalkBaseOpacity: 0.6,
  
  // Connections between stars
  connectionLine: 1,
  connectionOpacity: 0.7,
};

// Helper function to get spectral color
export const getSpectralColor = (spectralType) => {
  if (!spectralType) return COLORS.spectral.A;
  const type = spectralType.trim()[0].toUpperCase();
  return COLORS.spectral[type] || COLORS.spectral.A;
};