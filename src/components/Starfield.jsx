import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Text } from 'troika-three-text';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
import { COLORS, SIZES, STROKE_WEIGHTS, getSpectralColor } from '../config/visual.js';
import { LABEL_CONFIG, formatStarName } from '../config/labels.js';
import InfoPanel from './InfoPanel.jsx';
import Toolbar from './ui/Toolbar.jsx';
import MobileNav from './MobileNav.jsx';

// Helper function to convert RA string to radians
const raToRadians = (ra) => {
  const raRegex = /(\d+)h(\d+)m([\d.]+)s/;
  const match = ra.match(raRegex);
  if (!match) return 0;
  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const seconds = parseFloat(match[3]);
  const totalHours = hours + minutes / 60 + seconds / 3600;
  const degrees = totalHours * 15;
  return (degrees * Math.PI) / 180;
};

// Helper function to convert Dec string to radians
const decToRadians = (dec) => {
  const decNormalized = dec.replace('−', '-');
  // Updated regex to handle both Unicode (′″) and straight quotes ('"), plus decimal seconds
  const decRegex = /([+-]?\d+)°(\d+)[′']([\d.]+)[″"]/;
  const match = decNormalized.match(decRegex);
  if (!match) return 0;
  const degrees = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const seconds = parseFloat(match[3]); // Changed to parseFloat for decimal seconds
  const totalDegrees = Math.abs(degrees) + minutes / 60 + seconds / 3600;
  const sign = degrees < 0 ? -1 : 1;
  const decDegreesSigned = sign * totalDegrees;
  return (decDegreesSigned * Math.PI) / 180;
};

// Convert RA, Dec, Distance to Cartesian coordinates
const raDecToXYZ = (ra, dec, distance) => {
  const raRad = raToRadians(ra);
  const decRad = decToRadians(dec);
  const x = distance * Math.cos(decRad) * Math.cos(raRad);
  const y = distance * Math.sin(decRad);
  const z = distance * Math.cos(decRad) * Math.sin(raRad);
  return new THREE.Vector3(x, y, z);
};

const Starfield = () => {
  // Refs
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const labelsRef = useRef([]);
  const squareGridRef = useRef(null);
  const circularGridRef = useRef(null);
  const axesHelperRef = useRef(null);
  const starObjectsRef = useRef([]);
  const starMeshesRef = useRef([]);
  const stalksRef = useRef([]);
  const connectionsRef = useRef([]);
  const highlightRef = useRef(null);
  const clockRef = useRef(new THREE.Clock());
  const focusTargetRef = useRef(null);
  const focusStartTimeRef = useRef(null);
  const focusStartPosRef = useRef(null);
  const focusStartTargetRef = useRef(null);
  const focusPhaseRef = useRef('orienting'); // 'orienting' or 'zooming'
  const isSearchResultFocusRef = useRef(false); // Flag to skip zoom for search results
  const isResetCameraRef = useRef(false); // Flag to indicate camera reset in progress
  const isDraggingRef = useRef(false);
  const mouseDownPosRef = useRef(new THREE.Vector2());
  const selectedStarRef = useRef(null);
  const autoFocusOnClickRef = useRef(false);
  const rebuildConnectionsRef = useRef(null);
  const targetCameraDistanceRef = useRef(26);
  const shouldAutoZoomRef = useRef(false);
  const lastCameraPositionRef = useRef(new THREE.Vector3());
  const lastCameraQuaternionRef = useRef(new THREE.Quaternion());
  const debounceTimeoutRef = useRef(null);
  const isPageVisibleRef = useRef(true);
  const animationFrameIdRef = useRef(null);
  const idleFrameCountRef = useRef(0);
  const hoverFrameCounterRef = useRef(0);
  const labelFrameCounterRef = useRef(0);
  const gridLineMaterialsRef = useRef([]);
  const connectionLineMaterialsRef = useRef([]);
  const stalkLineMaterialsRef = useRef([]);
  const tmpV3A = useRef(new THREE.Vector3());
  const tmpV3B = useRef(new THREE.Vector3());
  const tmpV2A = useRef(new THREE.Vector2());
  const tmpV2B = useRef(new THREE.Vector2());
  const measureLineRef = useRef(null);
  const measureTextRef = useRef(null);
  
  // Keyboard state tracking
  const keysPressed = useRef({
    w: false, a: false, s: false, d: false,
    q: false, e: false,
    space: false, shift: false,
    f: false, z: false, escape: false
  });

  // State
  const [stars, setStars] = useState([]);
  const [gridMode, setGridMode] = useState('circular');
  const [viewDistance, setViewDistance] = useState(20);
  const [showGrid, setShowGrid] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [lineMode, setLineMode] = useState('connections');
  const [autoZoom, setAutoZoom] = useState(true);
  const [spectralFilter, setSpectralFilter] = useState({
    O: true, B: true, A: true, F: true, G: true, K: true, M: true, L: true, T: true, Y: true, D: true
  });
  const [selectedStar, setSelectedStar] = useState(null);
  const [autoFocusOnClick, setAutoFocusOnClick] = useState(false);
  const [measureMode, setMeasureMode] = useState(false);
  const [measurePoints, setMeasurePoints] = useState([]);
  const [measureDistance, setMeasureDistance] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [uiVisible, setUiVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Load star data
  useEffect(() => {
    fetch('/data/stars.json')
      .then(res => res.json())
      .then(data => setStars(data))
      .catch(err => console.error('Error loading stars:', err));
  }, []);

  // Sync autoFocusOnClick to ref for use in event handlers
  useEffect(() => {
    autoFocusOnClickRef.current = autoFocusOnClick;
  }, [autoFocusOnClick]);

  // Detect mobile viewport (≤640px)
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 640);
    };
    
    checkMobile(); // Initial check
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Function to build/rebuild grids based on current view distance
  const buildGrids = () => {
    if (!squareGridRef.current || !circularGridRef.current) return;

    // Build square grid (revert to LineBasicMaterial)
    squareGridRef.current.clear();
    const squareGridMaterial = new THREE.LineBasicMaterial({ 
      color: COLORS.gridSquare,
      linewidth: STROKE_WEIGHTS.gridLine,
      opacity: STROKE_WEIGHTS.gridLineOpacity,
      transparent: STROKE_WEIGHTS.gridLineOpacity < 1
    });

    for (let i = -viewDistance; i <= viewDistance; i += SIZES.gridSquareStep) {
      const xGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(i, 0, -viewDistance),
        new THREE.Vector3(i, 0, viewDistance)
      ]);
      squareGridRef.current.add(new THREE.Line(xGeometry, squareGridMaterial));

      const zGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-viewDistance, 0, i),
        new THREE.Vector3(viewDistance, 0, i)
      ]);
      squareGridRef.current.add(new THREE.Line(zGeometry, squareGridMaterial));
    }

    // Build circular grid - dynamically generate rings based on viewDistance
    circularGridRef.current.clear();
    
    const ringMaterial = new THREE.LineBasicMaterial({
      color: COLORS.gridCircular,
      linewidth: STROKE_WEIGHTS.gridLine,
      opacity: STROKE_WEIGHTS.circularRingOpacity,
      transparent: true
    });

    const radialMaterial = new THREE.LineBasicMaterial({
      color: COLORS.gridCircular,
      linewidth: STROKE_WEIGHTS.gridLine,
      opacity: STROKE_WEIGHTS.circularRadialOpacity,
      transparent: true
    });

    // Generate rings dynamically up to viewDistance in steps of 4
    for (let radius = 4; radius <= viewDistance; radius += 4) {
      const segments = 64; // restore original polygon count
      const ringGeometry = new THREE.BufferGeometry();
      const positions = [];
      
      for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        positions.push(
          radius * Math.cos(theta),
          0,
          radius * Math.sin(theta)
        );
      }
      
      ringGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      const ring = new THREE.LineLoop(ringGeometry, ringMaterial);
      circularGridRef.current.add(ring);
    }

    // Generate radial spokes
    for (let i = 0; i < SIZES.gridCircularSegments; i++) {
      const angle = (i / SIZES.gridCircularSegments) * Math.PI * 2;
      const radialGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(
          viewDistance * Math.cos(angle),
          0,
          viewDistance * Math.sin(angle)
        )
      ]);
      circularGridRef.current.add(new THREE.Line(radialGeometry, radialMaterial));
    }
  };

  // Main scene setup
  useEffect(() => {
    if (!mountRef.current || stars.length === 0) return;

    // Capture initial state values for scene setup
    const initialViewDistance = viewDistance;
    const initialShowLabels = showLabels;
    const initialSpectralFilter = { ...spectralFilter };
    const initialLineMode = lineMode;
    const initialShowGrid = showGrid;
    const initialGridMode = gridMode;

    labelsRef.current = [];
    starObjectsRef.current = [];
    stalksRef.current = [];

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(COLORS.background);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(15, 15, 15);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      powerPreference: "high-performance",
      stencil: false,
      depth: true,
      alpha: false,
      premultipliedAlpha: false
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(isSafari ? Math.min(window.devicePixelRatio, 1.5) : Math.min(window.devicePixelRatio, 2));
    renderer.sortObjects = false;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.03; // slightly softer braking for more inertia
    controls.screenSpacePanning = false;
    controls.minDistance = 5;
    controls.maxDistance = 100;
    controlsRef.current = controls;

    const squareGridGroup = new THREE.Group();
    squareGridGroup.visible = initialShowGrid && initialGridMode === 'square';
    scene.add(squareGridGroup);
    squareGridRef.current = squareGridGroup;

    const circularGridGroup = new THREE.Group();
    circularGridGroup.visible = initialShowGrid && initialGridMode === 'circular';
    scene.add(circularGridGroup);
    circularGridRef.current = circularGridGroup;

    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    
    ctx.beginPath();
    ctx.arc(64, 64, 40, 0, 2 * Math.PI);
    ctx.lineWidth = 8;
    ctx.strokeStyle = 'rgba(255, 255, 255, 1)';
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(64, 64, 48, 0, 2 * Math.PI);
    ctx.lineWidth = 4;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.stroke();
    
    const highlightTexture = new THREE.CanvasTexture(canvas);
    highlightTexture.needsUpdate = true;
    const highlightMaterial = new THREE.SpriteMaterial({
      map: highlightTexture,
      color: 0xffffff,
      blending: THREE.AdditiveBlending,
      depthTest: false
    });
    const highlight = new THREE.Sprite(highlightMaterial);
    highlight.scale.set(0.5, 0.5, 1);
    highlight.visible = false;
    scene.add(highlight);
    highlightRef.current = highlight;

    // Create measure line
    const measureLineGeometry = new THREE.BufferGeometry();
    const measureLineMaterial = new THREE.LineBasicMaterial({
      color: 0x00ff00,
      linewidth: 2,
      transparent: true,
      opacity: 0.8
    });
    const measureLine = new THREE.Line(measureLineGeometry, measureLineMaterial);
    measureLine.visible = false;
    scene.add(measureLine);
    measureLineRef.current = measureLine;

    // Create measure text
    const measureText = new Text();
    measureText.text = '';
    measureText.font = LABEL_CONFIG.font.path;
    measureText.fontSize = LABEL_CONFIG.font.size * 0.8;
    measureText.color = '#00ff00';
    measureText.outlineWidth = LABEL_CONFIG.appearance.outlineWidth;
    measureText.outlineColor = '#000000';
    measureText.outlineOpacity = 0.8;
    measureText.anchorX = 'center';
    measureText.anchorY = 'middle';
    measureText.textAlign = 'center';
    measureText.visible = false;
    scene.add(measureText);
    measureTextRef.current = measureText;

    const starMeshes = [];
    stars.forEach(star => {
      const starGroup = [];

      const primaryComponent = star.components[0];
      const spectralType = primaryComponent.spectral_type || primaryComponent.star_type || 'M';
      const color = getSpectralColor(spectralType);
      const spectralClass = spectralType.charAt(0).toUpperCase();

      // Handle different property names for RA and Dec
      const ra = star.ra || star.right_ascension;
      const dec = star.dec || star.declination;
      
      // Skip stars with N/A or missing coordinates
      if (!ra || !dec || ra === 'N/A' || dec === 'N/A') {
        return;
      }
      
      const pos = raDecToXYZ(ra, dec, star.distance_ly);

      const isSafariLocal = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
      const starGeomSegments = 16; // restore original polygon count
      const geometry = new THREE.SphereGeometry(SIZES.starRadius, starGeomSegments, starGeomSegments);
      const material = new THREE.MeshBasicMaterial({ color });
      const sphere = new THREE.Mesh(geometry, material);
      sphere.position.copy(pos);
      sphere.userData = { star, distance: star.distance_ly, spectralClass };
      sphere.visible = star.distance_ly <= initialViewDistance && initialSpectralFilter[spectralClass];
      scene.add(sphere);
      starGroup.push(sphere);
      starMeshes.push(sphere);

      const glowGeometry = new THREE.SphereGeometry(SIZES.starGlowRadius, starGeomSegments, starGeomSegments);
      const glowMaterial = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: COLORS.starGlow.opacity
      });
      const glow = new THREE.Mesh(glowGeometry, glowMaterial);
      glow.position.copy(sphere.position);
      glow.userData = { distance: star.distance_ly, spectralClass };
      glow.visible = star.distance_ly <= initialViewDistance && initialSpectralFilter[spectralClass];
      scene.add(glow);
      starGroup.push(glow);

      const label = new Text();
      label.text = formatStarName(star.name);
      label.font = LABEL_CONFIG.font.path;
      label.fontSize = LABEL_CONFIG.font.size;
      label.color = LABEL_CONFIG.appearance.color;
      label.outlineWidth = LABEL_CONFIG.appearance.outlineWidth;
      label.outlineColor = LABEL_CONFIG.appearance.outlineColor;
      label.outlineOpacity = LABEL_CONFIG.appearance.outlineOpacity;
      label.anchorX = 'left';
      label.anchorY = 'middle';
      label.textAlign = LABEL_CONFIG.formatting.textAlign;
      label.maxWidth = LABEL_CONFIG.formatting.maxWidth;
      label.fillOpacity = 1.0; // Use troika's fillOpacity property for transparency
      label.depthOffset = -1; // Ensure labels render correctly with transparency
      
      label.userData.starRef = sphere;
      label.userData.pad = LABEL_CONFIG.position.pad;
      label.userData.vOffset = LABEL_CONFIG.position.vOffset;
      label.userData.distance = star.distance_ly;
      label.userData.spectralClass = spectralClass;
      
      label.position.copy(sphere.position);
      label.sync();
      label.visible = initialShowLabels && star.distance_ly <= initialViewDistance && initialSpectralFilter[spectralClass];
      if (isSafariLocal) {
        label.outlineWidth = 0;
        label.outlineOpacity = 0.0;
      }
      scene.add(label);
      labelsRef.current.push(label);
      starGroup.push(label);

      if (pos.y !== 0) {
        const stalkGeo = new LineGeometry();
        stalkGeo.setPositions([
          pos.x, 0, pos.z,
          pos.x, pos.y, pos.z
        ]);
        const stalkMat = new LineMaterial({
          color: COLORS.stalkLine,
          transparent: true,
          opacity: STROKE_WEIGHTS.stalkOpacity,
          linewidth: Math.max(1, STROKE_WEIGHTS.stalk),
          depthTest: true
        });
        stalkMat.resolution.set(window.innerWidth, window.innerHeight);
        stalkLineMaterialsRef.current.push(stalkMat);
        const stalk = new Line2(stalkGeo, stalkMat);
        stalk.computeLineDistances();
        stalk.userData = { distance: star.distance_ly, spectralClass };
        stalk.visible = initialLineMode === 'stalks' && star.distance_ly <= initialViewDistance && initialSpectralFilter[spectralClass];
        scene.add(stalk);
        starGroup.push(stalk);
        stalksRef.current.push(stalk);

        const baseCircle = new THREE.CircleGeometry(SIZES.stalkBaseRadius, 32);
        const baseCircleMaterial = new THREE.MeshBasicMaterial({
          color: COLORS.stalkEllipse,
          transparent: true,
          opacity: STROKE_WEIGHTS.stalkBaseOpacity,
          side: THREE.DoubleSide
        });
        const baseCircleMesh = new THREE.Mesh(baseCircle, baseCircleMaterial);
        baseCircleMesh.rotation.x = -Math.PI / 2;
        baseCircleMesh.position.set(pos.x, 0.01, pos.z);
        baseCircleMesh.userData = { distance: star.distance_ly, spectralClass };
        baseCircleMesh.visible = initialLineMode === 'stalks' && star.distance_ly <= initialViewDistance && initialSpectralFilter[spectralClass];
        scene.add(baseCircleMesh);
        starGroup.push(baseCircleMesh);
        stalksRef.current.push(baseCircleMesh);
      }

      starObjectsRef.current.push(starGroup);
    });
    
    starMeshesRef.current = starMeshes;

    // Function to rebuild connections based on visible stars
    const rebuildConnections = () => {
      // CRITICAL: Properly dispose of ALL old connections to prevent memory leak
      connectionsRef.current.forEach(line => {
        if (line.geometry) {
          line.geometry.dispose();
        }
        if (line.material) {
          line.material.dispose();
        }
        scene.remove(line);
      });
      connectionsRef.current = [];

      // Get currently visible star meshes
      const visibleStars = starMeshesRef.current.filter(mesh => mesh.visible);
      
      if (visibleStars.length < 2) return;

      // Create connections between visible stars only
      for (let i = 0; i < visibleStars.length; i++) {
        const star = visibleStars[i];
        
        // Calculate distances to all other visible stars
        const distances = [];
        for (let j = 0; j < visibleStars.length; j++) {
          if (i === j) continue;
          const other = visibleStars[j];
          const dist = star.position.distanceTo(other.position);
          distances.push({ star: other, dist, originalIndex: j });
        }
        
        // Sort by distance and pick 3 nearest
        distances.sort((a, b) => a.dist - b.dist);
        
        for (let k = 0; k < Math.min(3, distances.length); k++) {
          const neighbor = distances[k].star;
          
          // Only create line if this star's index < neighbor's index to avoid duplicates
          const neighborIndex = visibleStars.indexOf(neighbor);
          if (i < neighborIndex) {
            const lineGeo = new LineGeometry();
            lineGeo.setPositions([
              star.position.x, star.position.y, star.position.z,
              neighbor.position.x, neighbor.position.y, neighbor.position.z
            ]);
            const lineMat = new LineMaterial({
              color: COLORS.connectionLine,
              linewidth: Math.max(1, STROKE_WEIGHTS.connectionLine),
              opacity: STROKE_WEIGHTS.connectionOpacity,
              transparent: true,
              depthTest: true
            });
            lineMat.resolution.set(window.innerWidth, window.innerHeight);
            connectionLineMaterialsRef.current.push(lineMat);
            const line = new Line2(lineGeo, lineMat);
            line.computeLineDistances();
            line.visible = initialLineMode === 'connections';
            scene.add(line);
            connectionsRef.current.push(line);
          }
        }
      }
    };

    // Store rebuild function for use in effects
    rebuildConnectionsRef.current = rebuildConnections;

    // Initial connection build
    rebuildConnections();

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onMouseDown = (event) => {
      isDraggingRef.current = false;
      mouseDownPosRef.current.set(event.clientX, event.clientY);
    };

    const onMouseMove = (event) => {
      const deltaX = Math.abs(event.clientX - mouseDownPosRef.current.x);
      const deltaY = Math.abs(event.clientY - mouseDownPosRef.current.y);
      if (deltaX > 5 || deltaY > 5) {
        isDraggingRef.current = true;
      }

      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      if (isSafari) {
        hoverFrameCounterRef.current++;
        if (hoverFrameCounterRef.current % 3 !== 0) return;
      }

      raycaster.setFromCamera(mouse, camera);
      const visibleStars = starMeshesRef.current.filter(mesh => mesh.visible);
      const intersects = raycaster.intersectObjects(visibleStars, false);

      if (intersects.length > 0) {
        const star = intersects[0].object;
        if (!measureMode) {
          highlight.position.copy(star.position);
          highlight.visible = true;
        }
      } else {
        if (!selectedStarRef.current && !measureMode) {
          highlight.visible = false;
        }
      }
    };

    const onMouseUp = (event) => {
      if (event.button !== 0) return;
      if (isDraggingRef.current) return;

      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const visibleStars = starMeshesRef.current.filter(mesh => mesh.visible);
      const intersects = raycaster.intersectObjects(visibleStars, false);

      if (intersects.length > 0) {
        const star = intersects[0].object;
        const starData = star.userData.star;
        
        if (measureMode) {
          // Handle measure mode
          // Safari-specific fix: small delay to ensure state updates properly
          if (isSafari) {
            setTimeout(() => {
              setMeasurePoints(prev => {
                const newPoints = [...prev, starData];
                if (newPoints.length === 2) {
                  const distance = calculateDistance(newPoints[0], newPoints[1]);
                  setMeasureDistance(distance);
                  return newPoints;
                } else if (newPoints.length > 2) {
                  // Reset with new point
                  return [starData];
                }
                return newPoints;
              });
            }, 10);
          } else {
            setMeasurePoints(prev => {
              const newPoints = [...prev, starData];
              if (newPoints.length === 2) {
                const distance = calculateDistance(newPoints[0], newPoints[1]);
                setMeasureDistance(distance);
                return newPoints;
              } else if (newPoints.length > 2) {
                // Reset with new point
                return [starData];
              }
              return newPoints;
            });
          }
        } else {
          // Normal star selection (only when not in measure mode)
          selectedStarRef.current = starData;
          setSelectedStar(starData);
          highlight.position.copy(star.position);
          highlight.visible = true;
          
          // Auto-focus if enabled
          if (autoFocusOnClickRef.current) {
            // Store starting positions for smooth transition
            focusStartTimeRef.current = Date.now();
            focusStartPosRef.current = cameraRef.current.position.clone();
            focusStartTargetRef.current = controlsRef.current.target.clone();
            focusTargetRef.current = star.position.clone();
            focusPhaseRef.current = 'orienting';
            shouldAutoZoomRef.current = false; // Don't auto-zoom on click, just focus
            isSearchResultFocusRef.current = true; // Skip zoom phase - just orient the camera
            isResetCameraRef.current = false;
            // Don't set focused state immediately - let the animation complete
          } else {
            setIsFocused(false); // Clear focus state when clicking new star
          }
        }
      } else {
        // No star clicked
        if (!measureMode) {
          // Only clear selection if not in measure mode
          selectedStarRef.current = null;
          setSelectedStar(null);
          setIsFocused(false); // Clear focus state when deselecting
          highlight.visible = false;
        }
      }
    };

    const onContextMenu = (event) => {
      event.preventDefault();
      if (selectedStarRef.current) {
        const selectedMesh = starMeshesRef.current.find(
          mesh => mesh.userData.star === selectedStarRef.current
        );
        if (selectedMesh) {
          // Store starting positions for smooth transition
          focusStartTimeRef.current = Date.now();
          focusStartPosRef.current = cameraRef.current.position.clone();
          focusStartTargetRef.current = controlsRef.current.target.clone();
          focusTargetRef.current = selectedMesh.position.clone();
          focusPhaseRef.current = 'orienting';
        }
      }
    };

    renderer.domElement.addEventListener('mousedown', onMouseDown);
    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('mouseup', onMouseUp);
    renderer.domElement.addEventListener('contextmenu', onContextMenu);

    const axesHelper = new THREE.AxesHelper(15);
    axesHelper.visible = false;
    scene.add(axesHelper);
    axesHelperRef.current = axesHelper;

    setTimeout(() => buildGrids(), 0);

    // Force an initial label positioning/sync after the first render to fix on-load offset
    setTimeout(() => {
      const right = new THREE.Vector3();
      const up = new THREE.Vector3();
      camera.getWorldDirection(right);
      right.cross(camera.up).normalize();
      up.copy(camera.up).normalize();

      labelsRef.current.forEach(label => {
        const star = label.userData.starRef;
        if (!star || !label.visible) return;
        const basePos = star.position.clone();
        const offset = right.clone().multiplyScalar(label.userData.pad || 0.3)
          .add(up.clone().multiplyScalar(label.userData.vOffset || 0));
        label.position.copy(basePos.add(offset));
        label.quaternion.copy(camera.quaternion);
        label.sync();
      });
      renderer.render(scene, camera);
    }, 0);

    // Handle page visibility for Safari background tab performance
    const handleVisibilityChange = () => {
      if (document.hidden) {
        isPageVisibleRef.current = false;
        // Cancel animation frame when tab is hidden
        if (animationFrameIdRef.current) {
          cancelAnimationFrame(animationFrameIdRef.current);
          animationFrameIdRef.current = null;
        }
      } else {
        isPageVisibleRef.current = true;
        // Reset clock to prevent large time delta on return
        clockRef.current.getDelta();
        // Restart animation loop
        animate();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const animate = () => {
      // Don't render if tab is hidden
      if (!isPageVisibleRef.current) return;
      
      animationFrameIdRef.current = requestAnimationFrame(animate);
      
      // Keyboard camera movement
      const moveSpeed = 0.2; // Units per frame
      const orbitSpeed = 0.01; // Radians per frame
      
      if (keysPressed.current.w || keysPressed.current.a || keysPressed.current.s || keysPressed.current.d ||
          keysPressed.current.space || keysPressed.current.shift || keysPressed.current.q || keysPressed.current.e) {
        
        // Get camera direction vectors
        const forward = new THREE.Vector3();
        camera.getWorldDirection(forward);
        forward.y = 0; // Keep movement on XZ plane
        forward.normalize();
        
        const right = new THREE.Vector3();
        right.crossVectors(forward, camera.up).normalize();
        
        const up = new THREE.Vector3(0, 1, 0);
        
        // Calculate movement
        const movement = new THREE.Vector3();
        const maxDistance = 30; // Maximum distance from origin in any direction
        
        if (keysPressed.current.w) movement.add(forward.clone().multiplyScalar(moveSpeed));
        if (keysPressed.current.s) movement.add(forward.clone().multiplyScalar(-moveSpeed));
        if (keysPressed.current.a) movement.add(right.clone().multiplyScalar(-moveSpeed));
        if (keysPressed.current.d) movement.add(right.clone().multiplyScalar(moveSpeed));
        if (keysPressed.current.space) movement.add(up.clone().multiplyScalar(moveSpeed));
        if (keysPressed.current.shift) movement.add(up.clone().multiplyScalar(-moveSpeed));
        
        // Calculate new positions
        const newCameraPos = camera.position.clone().add(movement);
        const newTargetPos = controls.target.clone().add(movement);
        
        // Check if movement would exceed boundaries - if so, don't move at all
        const wouldExceedBounds = 
          Math.abs(newCameraPos.x) > maxDistance ||
          Math.abs(newCameraPos.y) > maxDistance ||
          Math.abs(newCameraPos.z) > maxDistance ||
          Math.abs(newTargetPos.x) > maxDistance ||
          Math.abs(newTargetPos.y) > maxDistance ||
          Math.abs(newTargetPos.z) > maxDistance;
        
        // Only apply movement if it stays within bounds
        if (!wouldExceedBounds) {
          camera.position.copy(newCameraPos);
          controls.target.copy(newTargetPos);
        }
        
        // Orbit controls (Q/E) - only if not at extreme boundaries
        if (keysPressed.current.q || keysPressed.current.e) {
          const orbitAxis = new THREE.Vector3(0, 1, 0);
          const offset = camera.position.clone().sub(controls.target);
          
          if (keysPressed.current.q) {
            offset.applyAxisAngle(orbitAxis, orbitSpeed);
          }
          if (keysPressed.current.e) {
            offset.applyAxisAngle(orbitAxis, -orbitSpeed);
          }
          
          const newOrbitPos = controls.target.clone().add(offset);
          
          // Only apply orbit if it stays within bounds
          const withinBounds = 
            Math.abs(newOrbitPos.x) <= maxDistance &&
            Math.abs(newOrbitPos.y) <= maxDistance &&
            Math.abs(newOrbitPos.z) <= maxDistance;
          
          if (withinBounds) {
            camera.position.copy(newOrbitPos);
          }
        }
      }
      
      controls.update();
      
      
      // Camera distance animation - zoom from current position relative to controls target
      if (autoZoom && !focusTargetRef.current && shouldAutoZoomRef.current) {
        const targetDistance = targetCameraDistanceRef.current;
        const offset = camera.position.clone().sub(controls.target);
        const currentDistance = offset.length();
        
        if (Math.abs(currentDistance - targetDistance) > 0.1) {
          const newDistance = THREE.MathUtils.lerp(currentDistance, targetDistance, 0.05);
          const direction = offset.normalize();
          camera.position.copy(direction.multiplyScalar(newDistance).add(controls.target));
        } else {
          // Animation complete - turn off the trigger
          shouldAutoZoomRef.current = false;
        }
      }
      
      if (focusTargetRef.current && focusStartTimeRef.current) {
        const targetPos = focusTargetRef.current;
        const startTime = focusStartTimeRef.current;
        const orientDuration = 800; // 0.8 seconds to orient
        const zoomDuration = 700; // 0.7 seconds to zoom
        const elapsed = Date.now() - startTime;
        
        if (focusPhaseRef.current === 'orienting') {
          // Phase 1: Orient camera to look at the target
          const progress = Math.min(elapsed / orientDuration, 1);
          const easedProgress = easeInOutCubic(progress);
          
          const startTarget = focusStartTargetRef.current;
          controls.target.lerpVectors(startTarget, targetPos, easedProgress);
          
          // When orienting is complete, start zooming (unless it's a search result)
          if (progress >= 1) {
            if (isSearchResultFocusRef.current) {
              // Skip zoom phase for search results - just complete the animation
              focusStartTimeRef.current = null;
              focusStartPosRef.current = null;
              focusStartTargetRef.current = null;
              focusTargetRef.current = null;
              focusPhaseRef.current = 'orienting';
              isSearchResultFocusRef.current = false;
              // Set focus state to true when orientation completes (but not during reset)
              if (!isResetCameraRef.current) {
                setIsFocused(true);
              }
              isResetCameraRef.current = false; // Clear reset flag
            } else {
              focusPhaseRef.current = 'zooming';
              focusStartTimeRef.current = Date.now(); // Reset timer for zoom phase
            }
          }
        } else if (focusPhaseRef.current === 'zooming') {
          // Phase 2: Zoom in to the target
          const progress = Math.min(elapsed / zoomDuration, 1);
          const easedProgress = easeInOutCubic(progress);
          
          const offset = camera.position.clone().sub(controls.target);
          const spherical = new THREE.Spherical().setFromVector3(offset);
          const desiredRadius = 5;
          
          // Only adjust radius, keep the same direction relative to target
          spherical.radius = THREE.MathUtils.lerp(spherical.radius, desiredRadius, easedProgress);
          
          const newPos = new THREE.Vector3().setFromSpherical(spherical).add(controls.target);
          camera.position.copy(newPos);
          
          // Check if zooming is complete
          if (progress >= 1) {
            focusTargetRef.current = null;
            focusStartTimeRef.current = null;
            focusStartPosRef.current = null;
            focusStartTargetRef.current = null;
            focusPhaseRef.current = 'orienting';
            // Set focus state to true when zoom completes
            setIsFocused(true);
          }
        }
      }
      
      if (highlightRef.current.visible) {
        const elapsedTime = clockRef.current.getElapsedTime();
        const pulse = (Math.sin(elapsedTime * Math.PI * 2) + 1) / 2;
        const scale = 0.5 + pulse * 0.1;
        highlightRef.current.scale.set(scale, scale, 1);
      }


      // Depth-based fade for lines (reduce clutter)
      const cameraPos = camera.position;
      const fadeNear = 6;  // start fade near
      const fadeFar = 40;  // fully faded beyond
      const computeOpacity = (pos) => {
        const d = cameraPos.distanceTo(pos);
        if (d <= fadeNear) return 1.0;
        if (d >= fadeFar) return 0.15;
        return THREE.MathUtils.mapLinear(d, fadeNear, fadeFar, 1.0, 0.15);
      };

      // Update connection/stalk material opacity based on midpoint distance
      connectionsRef.current.forEach(line => {
        if (!line.visible) return;
        const posAttr = line.geometry.getAttribute('instanceStart') || line.geometry.getAttribute('position');
        // For Line2/LineGeometry, we don't have a simple attribute; estimate via world positions
        const start = new THREE.Vector3();
        const end = new THREE.Vector3();
        line.geometry.boundingBox?.getCenter(start); // fallback if available
        // If no bbox yet, skip fade to avoid cost
        if (!line.geometry.boundingBox) {
          line.geometry.computeBoundingBox();
        }
        if (line.geometry.boundingBox) {
          const mid = line.geometry.boundingBox.getCenter(new THREE.Vector3());
          const targetOpacity = computeOpacity(mid);
          if (line.material && line.material.opacity !== undefined) {
            line.material.opacity = targetOpacity;
          }
        }
      });

      stalksRef.current.forEach(stalk => {
        if (!stalk.visible) return;
        if (!stalk.geometry.boundingBox) {
          stalk.geometry.computeBoundingBox();
        }
        if (stalk.geometry.boundingBox) {
          const mid = stalk.geometry.boundingBox.getCenter(new THREE.Vector3());
          const targetOpacity = computeOpacity(mid);
          if (stalk.material && stalk.material.opacity !== undefined) {
            stalk.material.opacity = targetOpacity;
          }
        }
      });
      
      // Only update labels when camera has moved (Safari optimization)
      const positionChanged = camera.position.distanceToSquared(lastCameraPositionRef.current) > 0.001;
      const rotationChanged = camera.quaternion.angleTo(lastCameraQuaternionRef.current) > 0.01;

      // Idle frame skipping when scene is inactive
      const isActive = positionChanged || rotationChanged || focusTargetRef.current || highlightRef.current.visible;
      if (!isActive) {
        idleFrameCountRef.current++;
        if (idleFrameCountRef.current > 120) {
          if (idleFrameCountRef.current % 10 !== 0) {
            return;
          }
        }
      } else {
        idleFrameCountRef.current = 0;
      }

      if (positionChanged || rotationChanged) {
        lastCameraPositionRef.current.copy(camera.position);
        lastCameraQuaternionRef.current.copy(camera.quaternion);
        
        // Throttle label updates on Safari only when not focusing or dragging
        const shouldThrottleLabels = isSafari && !focusTargetRef.current && !isDraggingRef.current;
        const skipThisFrame = shouldThrottleLabels && (labelFrameCounterRef.current++ % 2 !== 0);

        const right = new THREE.Vector3();
        const up = new THREE.Vector3();

        camera.getWorldDirection(right);
        right.cross(camera.up).normalize();
        up.copy(camera.up).normalize();

        if (!skipThisFrame) {
          // Update label positions
          labelsRef.current.forEach(label => {
            const star = label.userData.starRef;
            if (!star || !label.visible) return;
            
            const basePos = tmpV3A.current.copy(star.position);
            const offset = right.clone().multiplyScalar(label.userData.pad || 0.3)
              .add(up.clone().multiplyScalar(label.userData.vOffset || 0));
            label.position.copy(basePos.add(offset));
            label.quaternion.copy(camera.quaternion);
            label.sync();
          });

          // Update measure text to face camera
          if (measureTextRef.current && measureTextRef.current.visible) {
            measureTextRef.current.quaternion.copy(camera.quaternion);
            measureTextRef.current.sync();
          }

          // Distance-based fade only (no culling)
          const canvas = renderer.domElement;
          const projected = [];
          const cameraRefLocal = camera;

          // Precompute projected positions and distances
          labelsRef.current.forEach(label => {
            if (!label.visible) return;
            const star = label.userData.starRef;
            if (!star) return;
            const pWorld = tmpV3B.current.copy(label.position);
            const p = pWorld.project(cameraRefLocal);
            const x = (p.x * 0.5 + 0.5) * canvas.width;
            const y = (-p.y * 0.5 + 0.5) * canvas.height;
            const distance = cameraRefLocal.position.distanceTo(star.position);
            projected.push({ label, x, y, distance });
          });

          // Gentle distance-based fade curve
          const near = 10;  // gentler distance fade (restored)
          const far = 80;   // reach minimum later (restored)
          const minOpacity = 0.15; // minimum opacity for very far labels (dimmer)

          projected.forEach(item => {
            const finalOpacity = item.distance <= near
              ? 1
              : item.distance >= far
                ? minOpacity
                : THREE.MathUtils.mapLinear(item.distance, near, far, 1, minOpacity);

            // Use troika's fillOpacity property for cross-browser compatibility
            if (Math.abs(item.label.fillOpacity - finalOpacity) > 0.01) {
              item.label.fillOpacity = finalOpacity;
              item.label.sync();
            }
          });
        }
      }
      
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      // Update LineMaterial resolutions
      gridLineMaterialsRef.current.forEach(mat => mat.resolution.set(window.innerWidth, window.innerHeight));
      connectionLineMaterialsRef.current.forEach(mat => mat.resolution.set(window.innerWidth, window.innerHeight));
      stalkLineMaterialsRef.current.forEach(mat => mat.resolution.set(window.innerWidth, window.innerHeight));
    };
    window.addEventListener('resize', handleResize);

    return () => {
      // Clean up debounce timeout
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      
      // Cancel animation frame
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      
      // Remove visibility change listener
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('mousedown', onMouseDown);
      renderer.domElement.removeEventListener('mousemove', onMouseMove);
      renderer.domElement.removeEventListener('mouseup', onMouseUp);
      renderer.domElement.removeEventListener('contextmenu', onContextMenu);
      
      // Dispose all connections
      connectionsRef.current.forEach(line => {
        if (line.geometry) line.geometry.dispose();
        if (line.material) line.material.dispose();
        scene.remove(line);
      });
      connectionsRef.current = [];
      
      // Dispose all labels
      labelsRef.current.forEach(label => {
        if (label.dispose) label.dispose();
      });
      labelsRef.current = [];
      
      // Dispose scene objects
      scene.traverse((object) => {
        if (object instanceof Text) {
          object.dispose();
        }
        if (object.geometry) {
          object.geometry.dispose();
        }
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(mat => mat.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
      
      if (mountRef.current && renderer.domElement.parentNode === mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      controls.dispose();
    };
  }, [stars]);

  useEffect(() => {
    if (!sceneRef.current) return;

    starObjectsRef.current.forEach(starGroup => {
      starGroup.forEach(obj => {
        if (obj instanceof Text) return;
        
        if (obj.userData && obj.userData.distance !== undefined) {
          const withinDistance = obj.userData.distance <= viewDistance;
          
          let passesFilter = true;
          if (obj.userData.spectralClass) {
            passesFilter = spectralFilter[obj.userData.spectralClass];
          }
          
          // Check if this is a stalk-related object (Line2 or CircleGeometry mesh)
          const isStalk = (obj.type === 'Line' && obj.geometry?.type === 'LineGeometry') || 
                         (obj.type === 'Mesh' && obj.geometry?.type === 'CircleGeometry');
          
          // Skip stalks - they're managed by the dedicated lineMode useEffect
          if (isStalk) return;
          
          // For stars and glows, just check distance and filter
          obj.visible = withinDistance && passesFilter;
        }
      });
    });

    // Labels are handled in a separate useEffect to avoid interfering with stalks/connections

    // Immediately orient and position labels after visibility/filter changes (no camera move needed)
    const camera = cameraRef.current;
    const renderer = rendererRef.current;
    if (camera && renderer) {
      const right = new THREE.Vector3();
      const up = new THREE.Vector3();
      camera.getWorldDirection(right);
      right.cross(camera.up).normalize();
      up.copy(camera.up).normalize();
      labelsRef.current.forEach(label => {
        if (!label.visible) return;
        const star = label.userData.starRef;
        if (!star) return;
        const basePos = star.position.clone();
        const offset = right.clone().multiplyScalar(label.userData.pad || 0.3)
          .add(up.clone().multiplyScalar(label.userData.vOffset || 0));
        label.position.copy(basePos.add(offset));
        label.quaternion.copy(camera.quaternion);
        label.sync();
      });
    }

    // Clear any existing timeout to prevent accumulation
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Rebuild grids immediately for instant redraw
    debounceTimeoutRef.current = setTimeout(() => {
      buildGrids();
      debounceTimeoutRef.current = null;
    }, 0);

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
        debounceTimeoutRef.current = null;
      }
    };
  }, [viewDistance, spectralFilter]);

  // Update target camera distance when view distance changes (only if autoZoom is enabled)
  useEffect(() => {
    if (autoZoom) {
      targetCameraDistanceRef.current = viewDistance * 1.3;
      shouldAutoZoomRef.current = true;
    }
  }, [viewDistance, autoZoom]);

  // Separate useEffect for labels - handles distance and filter changes without affecting stalks/connections
  useEffect(() => {
    if (!sceneRef.current) return;

    const camera = cameraRef.current;
    
    labelsRef.current.forEach(label => {
      const withinDistance = label.userData.distance <= viewDistance;
      
      let passesFilter = true;
      if (label.userData.spectralClass) {
        passesFilter = spectralFilter[label.userData.spectralClass];
      }
      
      const shouldBeVisible = showLabels && withinDistance && passesFilter;
      
      // If label is becoming visible, immediately update its orientation to face camera
      if (shouldBeVisible && !label.visible && camera) {
        label.quaternion.copy(camera.quaternion);
        label.sync();
      }
      
      label.visible = shouldBeVisible;
    });
  }, [viewDistance, spectralFilter, showLabels]);

  // Handle measure line visualization
  useEffect(() => {
    if (!sceneRef.current || !measureLineRef.current || !measureTextRef.current) return;

    if (measurePoints.length === 2 && measureDistance !== null) {
      // Create line between the two measure points
      const ra1 = measurePoints[0].ra || measurePoints[0].right_ascension;
      const dec1 = measurePoints[0].dec || measurePoints[0].declination;
      const ra2 = measurePoints[1].ra || measurePoints[1].right_ascension;
      const dec2 = measurePoints[1].dec || measurePoints[1].declination;
      
      const pos1 = raDecToXYZ(ra1, dec1, measurePoints[0].distance_ly);
      const pos2 = raDecToXYZ(ra2, dec2, measurePoints[1].distance_ly);
      
      // Update line geometry
      const lineGeometry = new THREE.BufferGeometry().setFromPoints([pos1, pos2]);
      measureLineRef.current.geometry.dispose();
      measureLineRef.current.geometry = lineGeometry;
      measureLineRef.current.visible = true;

      // Position text at midpoint
      const midpoint = pos1.clone().add(pos2).multiplyScalar(0.5);
      measureTextRef.current.position.copy(midpoint);
      measureTextRef.current.text = `${measureDistance.toFixed(2)} LY`;
      measureTextRef.current.visible = true;
      measureTextRef.current.sync();
    } else {
      measureLineRef.current.visible = false;
      measureTextRef.current.visible = false;
    }
  }, [measurePoints, measureDistance]);

  useEffect(() => {
    if (!sceneRef.current) return;

    stalksRef.current.forEach(stalk => {
      const withinDistance = stalk.userData.distance <= viewDistance;
      let passesFilter = true;
      if (stalk.userData.spectralClass) {
        passesFilter = spectralFilter[stalk.userData.spectralClass];
      }
      stalk.visible = lineMode === 'stalks' && withinDistance && passesFilter;
    });

    connectionsRef.current.forEach(connection => {
      connection.visible = lineMode === 'connections';
    });

    // Rebuild connections when line mode changes to ensure proper visibility
    if (lineMode === 'connections' && rebuildConnectionsRef.current) {
      rebuildConnectionsRef.current();
    }
  }, [lineMode, viewDistance, spectralFilter]);

  const handleToggleGrid = (mode) => {
    setGridMode(mode);
  };

  const handleViewDistanceChange = (distance) => {
    setViewDistance(distance);
  };

  const handleToggleGridVisibility = (visible) => {
    setShowGrid(visible);
  };

  const handleToggleAutoZoom = (enabled) => {
    setAutoZoom(enabled);
  };

  // Sync grid visibility when gridMode or showGrid changes
  useEffect(() => {
    if (squareGridRef.current && circularGridRef.current) {
      squareGridRef.current.visible = showGrid && gridMode === 'square';
      circularGridRef.current.visible = showGrid && gridMode === 'circular';
    }
  }, [gridMode, showGrid]);

  // Keyboard shortcut for hiding/showing UI (CMD+. on Mac, CTRL+. on Windows/Linux)
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Check for CMD+. (Mac) or CTRL+. (Windows/Linux)
      if ((event.metaKey || event.ctrlKey) && event.key === '.') {
        event.preventDefault();
        setUiVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Keyboard controls for camera movement and star actions
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Don't handle keyboard controls if user is typing in an input/textarea
      const activeElement = document.activeElement;
      const isTyping = activeElement && (
        activeElement.tagName === 'INPUT' || 
        activeElement.tagName === 'TEXTAREA' ||
        activeElement.isContentEditable
      );
      
      if (isTyping) return;
      
      const key = event.key.toLowerCase();
      
      // Movement keys
      if (key === 'w') keysPressed.current.w = true;
      if (key === 'a') keysPressed.current.a = true;
      if (key === 's') keysPressed.current.s = true;
      if (key === 'd') keysPressed.current.d = true;
      if (key === 'q') keysPressed.current.q = true;
      if (key === 'e') keysPressed.current.e = true;
      if (key === ' ') {
        event.preventDefault(); // Prevent page scroll
        keysPressed.current.space = true;
      }
      if (event.shiftKey) keysPressed.current.shift = true;
      
      // Action keys (trigger immediately)
      if (key === 'f' && selectedStar) {
        event.preventDefault();
        handleFocusOnStar(selectedStar);
      }
      if (key === 'z' && selectedStar) {
        event.preventDefault();
        handleZoomToStar(selectedStar);
      }
      if (key === 'escape') {
        event.preventDefault();
        handleResetCamera();
      }
    };

    const handleKeyUp = (event) => {
      const key = event.key.toLowerCase();
      
      if (key === 'w') keysPressed.current.w = false;
      if (key === 'a') keysPressed.current.a = false;
      if (key === 's') keysPressed.current.s = false;
      if (key === 'd') keysPressed.current.d = false;
      if (key === 'q') keysPressed.current.q = false;
      if (key === 'e') keysPressed.current.e = false;
      if (key === ' ') keysPressed.current.space = false;
      if (!event.shiftKey) keysPressed.current.shift = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [selectedStar]); // Depend on selectedStar so we can check if a star is selected

  const handleToggleLabelsVisibility = (visible) => {
    setShowLabels(visible);
    // Directly update label visibility without triggering other useEffects
    labelsRef.current.forEach(label => {
      const withinDistance = label.userData.distance <= viewDistance;
      let passesFilter = true;
      if (label.userData.spectralClass) {
        passesFilter = spectralFilter[label.userData.spectralClass];
      }
      label.visible = visible && withinDistance && passesFilter;
    });
  };

  const handleToggleAxesHelper = (visible) => {
    if (axesHelperRef.current) {
      axesHelperRef.current.visible = visible;
    }
  };


  const handleSpectralFilterChange = (filter) => {
    setSpectralFilter(filter);
  };

  const handleToggleMeasure = (enabled) => {
    setMeasureMode(enabled);
    if (!enabled) {
      // Clear measure points when disabling measure mode
      setMeasurePoints([]);
      setMeasureDistance(null);
    }
  };



  const calculateDistance = (star1, star2) => {
    const ra1 = star1.ra || star1.right_ascension;
    const dec1 = star1.dec || star1.declination;
    const ra2 = star2.ra || star2.right_ascension;
    const dec2 = star2.dec || star2.declination;
    
    const pos1 = raDecToXYZ(ra1, dec1, star1.distance_ly);
    const pos2 = raDecToXYZ(ra2, dec2, star2.distance_ly);
    return pos1.distanceTo(pos2);
  };

  // Easing function for smooth camera transitions
  const easeInOutCubic = (t) => {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  };

  const handleFocusOnStar = () => {
    if (selectedStar) {
      // Check if star is beyond view distance and expand if needed
      if (selectedStar.distance_ly > viewDistance) {
        const newDistance = Math.ceil(selectedStar.distance_ly / 4) * 4;
        const cappedDistance = Math.min(newDistance, 32);
        setViewDistance(cappedDistance);
      }
      
      const selectedMesh = starMeshesRef.current.find(
        mesh => mesh.userData.star === selectedStar
      );
      if (selectedMesh) {
        // Set flag to skip zoom phase (Focus button only orients, no zoom)
        isSearchResultFocusRef.current = true;
        
        // Store starting positions for smooth transition
        focusStartTimeRef.current = Date.now();
        focusStartPosRef.current = cameraRef.current.position.clone();
        focusStartTargetRef.current = controlsRef.current.target.clone();
        focusTargetRef.current = selectedMesh.position.clone();
        focusPhaseRef.current = 'orienting';
      }
    }
  };

  const handleStarSelect = (star) => {
    setSelectedStar(star);
    setIsFocused(false); // Clear focus state when selecting new star
    // Don't automatically focus - just select the star
    // User must click Focus button to focus on the star
  };

  // Search functionality
  const handleSearchChange = (searchTerm) => {
    setSearchQuery(searchTerm);
    
    if (!searchTerm || searchTerm.trim() === '' || searchTerm.length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const filteredStars = stars.filter(star => 
      star.name.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 10); // Limit to 10 results

    setSearchResults(filteredStars);
    setShowSearchResults(filteredStars.length > 0);
  };

  const handleSearchResultSelect = (star) => {
    setSelectedStar(star);
    setShowSearchResults(false);
    
    // If the star is beyond current view distance, expand the view to include it
    if (star.distance_ly > viewDistance) {
      // Calculate the next step up in our 4LY increments
      const newDistance = Math.ceil(star.distance_ly / 4) * 4;
      // Cap at 32 LY maximum
      const cappedDistance = Math.min(newDistance, 32);
      setViewDistance(cappedDistance);
    }
    
    // Automatically orient camera to the selected star from search (but don't zoom)
    const selectedMesh = starMeshesRef.current.find(
      mesh => mesh.userData.star === star
    );
    if (selectedMesh) {
      // Set flag to skip zoom phase for search results (only orient)
      isSearchResultFocusRef.current = true;
      
      // Store starting positions for smooth transition
      focusStartTimeRef.current = Date.now();
      focusStartPosRef.current = cameraRef.current.position.clone();
      focusStartTargetRef.current = controlsRef.current.target.clone();
      focusTargetRef.current = selectedMesh.position.clone();
      focusPhaseRef.current = 'orienting';
    }
  };

  const handleCloseSearchResults = () => {
    setShowSearchResults(false);
  };

  // Check if camera is already focused on a star
  const isCameraFocusedOnStar = (star) => {
    if (!star || !controlsRef.current || !cameraRef.current) return false;
    
    const starMesh = starMeshesRef.current.find(mesh => mesh.userData.star === star);
    if (!starMesh) return false;
    
    const controls = controlsRef.current;
    const starPosition = starMesh.position;
    const targetPosition = controls.target;
    
    // Check if the camera target is very close to the star position
    const distance = targetPosition.distanceTo(starPosition);
    const threshold = 0.1; // Very small threshold for "focused"
    
    return distance < threshold;
  };

  // Handle zoom when already focused on a star
  const handleZoomToStar = () => {
    if (!selectedStar) return;
    
    const selectedMesh = starMeshesRef.current.find(
      mesh => mesh.userData.star === selectedStar
    );
    if (selectedMesh) {
      // Check if star is beyond view distance and expand if needed
      if (selectedStar.distance_ly > viewDistance) {
        const newDistance = Math.ceil(selectedStar.distance_ly / 4) * 4;
        const cappedDistance = Math.min(newDistance, 32);
        setViewDistance(cappedDistance);
      }
      
      // Check if camera is already focused on this star
      const controls = controlsRef.current;
      const starPosition = selectedMesh.position;
      const targetPosition = controls.target;
      const distance = targetPosition.distanceTo(starPosition);
      const alreadyFocused = distance < 0.1;
      
      if (alreadyFocused) {
        // If already focused, skip orientation and go straight to zoom
        focusStartTimeRef.current = Date.now();
        focusStartPosRef.current = cameraRef.current.position.clone();
        focusStartTargetRef.current = controlsRef.current.target.clone();
        focusTargetRef.current = selectedMesh.position.clone();
        focusPhaseRef.current = 'zooming'; // Skip straight to zoom
        isSearchResultFocusRef.current = false;
      } else {
        // If not focused, do full orient + zoom animation
        isSearchResultFocusRef.current = false;
        focusStartTimeRef.current = Date.now();
        focusStartPosRef.current = cameraRef.current.position.clone();
        focusStartTargetRef.current = controlsRef.current.target.clone();
        focusTargetRef.current = selectedMesh.position.clone();
        focusPhaseRef.current = 'orienting';
      }
    }
  };

  // Handle camera reset - unlock from star and return to free movement
  const handleResetCamera = () => {
    // Clear any ongoing focus animations
    focusTargetRef.current = null;
    focusStartTimeRef.current = null;
    focusStartPosRef.current = null;
    focusStartTargetRef.current = null;
    focusPhaseRef.current = 'orienting';
    isSearchResultFocusRef.current = false;
    isResetCameraRef.current = true; // Set reset flag to prevent focus state from being set
    setIsFocused(false); // Clear focus state when resetting camera
    
    // Just reorient to center without changing position - like focus but no lock
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    
    if (camera && controls) {
      const centerTarget = new THREE.Vector3(0, 0, 0);
      
      // Smoothly transition to center orientation (like focus but no position change)
      focusStartTimeRef.current = Date.now();
      focusStartPosRef.current = camera.position.clone();
      focusStartTargetRef.current = controls.target.clone();
      focusTargetRef.current = centerTarget;
      focusPhaseRef.current = 'orienting';
      isSearchResultFocusRef.current = true; // Skip zoom phase
      
      // After orientation completes, just update the target - no position jump
      setTimeout(() => {
        if (camera && controls) {
          controls.target.copy(centerTarget);
          controls.update();
        }
      }, 800); // Wait for orientation to complete
    }
  };

  // Export handlers
  const handleGridChange = (mode) => {
    if (mode === 'gridNone') {
      setShowGrid(false);
    } else {
      setShowGrid(true);
      if (mode === 'gridRadial') {
        setGridMode('circular');
      } else if (mode === 'gridSquare') {
        setGridMode('square');
      }
    }
  };

  const handleLineModeChange = (mode) => {
    if (mode === 'connections') {
      setLineMode('connections');
    } else if (mode === 'stalks') {
      setLineMode('stalks');
    } else if (mode === 'starsOnly') {
      setLineMode('none');
    }
  };

  const handleToggleLabels = () => {
    setShowLabels(!showLabels);
  };

  // SVG Export function
  const handleExportSVG = () => {
    if (!cameraRef.current || !rendererRef.current || !sceneRef.current) {
      console.error('Scene not ready for export');
      return;
    }

    const camera = cameraRef.current;
    const renderer = rendererRef.current;
    const canvas = renderer.domElement;
    const width = canvas.width;
    const height = canvas.height;

    const projectTo2D = (vec3) => {
      const v = vec3.clone();
      v.project(camera);
      return {
        x: ((v.x + 1) / 2) * width,
        y: ((1 - v.y) / 2) * height
      };
    };

    const getScreenRadius = (position, worldRadius) => {
      const distance = camera.position.distanceTo(position);
      const fovY = THREE.MathUtils.degToRad(camera.fov);
      const pxPerUnit = height / (2 * Math.tan(fovY / 2) * distance);
      return Math.max(1, worldRadius * pxPerUnit);
    };

    const getScreenFontSize = (position, worldHeight) => {
      const distance = camera.position.distanceTo(position);
      const fovY = THREE.MathUtils.degToRad(camera.fov);
      const pxPerUnit = height / (2 * Math.tan(fovY / 2) * distance);
      return Math.max(8, worldHeight * pxPerUnit);
    };

    const svg = [];
    svg.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`);
    svg.push(`<rect width="100%" height="100%" fill="#${COLORS.background.toString(16).padStart(6, '0')}" />`);

    if (showGrid) {
      if (gridMode === 'circular' && circularGridRef.current) {
        circularGridRef.current.children.forEach(obj => {
          if (obj.type === 'LineLoop' && obj.geometry) {
            const posAttr = obj.geometry.getAttribute('position');
            const points = [];
            for (let i = 0; i < posAttr.count; i++) {
              const v = new THREE.Vector3(
                posAttr.getX(i),
                posAttr.getY(i),
                posAttr.getZ(i)
              );
              const p = projectTo2D(v);
              points.push(`${p.x},${p.y}`);
            }
            svg.push(`<polyline points="${points.join(' ')}" fill="none" stroke="#${COLORS.gridCircular.toString(16).padStart(6, '0')}" stroke-width="1" opacity="${STROKE_WEIGHTS.circularRingOpacity}"/>`);
          } else if (obj.type === 'Line' && obj.geometry) {
            const posAttr = obj.geometry.getAttribute('position');
            if (posAttr.count >= 2) {
              const v1 = new THREE.Vector3(posAttr.getX(0), posAttr.getY(0), posAttr.getZ(0));
              const v2 = new THREE.Vector3(posAttr.getX(1), posAttr.getY(1), posAttr.getZ(1));
              const p1 = projectTo2D(v1);
              const p2 = projectTo2D(v2);
              svg.push(`<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="#${COLORS.gridCircular.toString(16).padStart(6, '0')}" stroke-width="1" opacity="${STROKE_WEIGHTS.circularRadialOpacity}"/>`);
            }
          }
        });
      } else if (gridMode === 'square' && squareGridRef.current) {
        squareGridRef.current.children.forEach(line => {
          if (line.geometry) {
            const posAttr = line.geometry.getAttribute('position');
            if (posAttr.count >= 2) {
              const v1 = new THREE.Vector3(posAttr.getX(0), posAttr.getY(0), posAttr.getZ(0));
              const v2 = new THREE.Vector3(posAttr.getX(1), posAttr.getY(1), posAttr.getZ(1));
              const p1 = projectTo2D(v1);
              const p2 = projectTo2D(v2);
              svg.push(`<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="#${COLORS.gridSquare.toString(16).padStart(6, '0')}" stroke-width="1" opacity="${STROKE_WEIGHTS.gridLineOpacity}"/>`);
            }
          }
        });
      }
    }

    if (lineMode === 'connections') {
      connectionsRef.current.forEach(line => {
        if (!line.visible || !line.geometry) return;
        
        // Line2 objects use instanceStart and instanceEnd attributes
        if (line.type === 'Line2') {
          const instanceStart = line.geometry.getAttribute('instanceStart');
          const instanceEnd = line.geometry.getAttribute('instanceEnd');
          
          if (instanceStart && instanceEnd && instanceStart.count > 0) {
            const v1 = new THREE.Vector3(
              instanceStart.getX(0),
              instanceStart.getY(0),
              instanceStart.getZ(0)
            );
            const v2 = new THREE.Vector3(
              instanceEnd.getX(0),
              instanceEnd.getY(0),
              instanceEnd.getZ(0)
            );
            const p1 = projectTo2D(v1);
            const p2 = projectTo2D(v2);
            svg.push(`<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="#${COLORS.connectionLine.toString(16).padStart(6, '0')}" stroke-width="0.5" opacity="${STROKE_WEIGHTS.connectionOpacity}"/>`);
          }
        } else {
          // Regular Line objects use position attribute
          const posAttr = line.geometry.getAttribute('position');
          if (posAttr && posAttr.count >= 2) {
            const v1 = new THREE.Vector3(posAttr.getX(0), posAttr.getY(0), posAttr.getZ(0));
            const v2 = new THREE.Vector3(posAttr.getX(1), posAttr.getY(1), posAttr.getZ(1));
            const p1 = projectTo2D(v1);
            const p2 = projectTo2D(v2);
            svg.push(`<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="#${COLORS.connectionLine.toString(16).padStart(6, '0')}" stroke-width="0.5" opacity="${STROKE_WEIGHTS.connectionOpacity}"/>`);
          }
        }
      });
    }

    if (lineMode === 'stalks') {
      stalksRef.current.forEach(stalk => {
        if (!stalk.visible) return;
        
        if ((stalk.type === 'Line' || stalk.type === 'Line2') && stalk.geometry) {
          // Handle Line2 objects
          if (stalk.type === 'Line2') {
            const instanceStart = stalk.geometry.getAttribute('instanceStart');
            const instanceEnd = stalk.geometry.getAttribute('instanceEnd');
            
            if (instanceStart && instanceEnd && instanceStart.count > 0) {
              const v1 = new THREE.Vector3(
                instanceStart.getX(0),
                instanceStart.getY(0),
                instanceStart.getZ(0)
              );
              const v2 = new THREE.Vector3(
                instanceEnd.getX(0),
                instanceEnd.getY(0),
                instanceEnd.getZ(0)
              );
              const p1 = projectTo2D(v1);
              const p2 = projectTo2D(v2);
              svg.push(`<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="#${COLORS.stalkLine.toString(16).padStart(6, '0')}" stroke-width="1" opacity="${STROKE_WEIGHTS.stalkOpacity}"/>`);
            }
          } else {
            // Handle regular Line objects
            const posAttr = stalk.geometry.getAttribute('position');
            if (posAttr && posAttr.count >= 2) {
              const v1 = new THREE.Vector3(posAttr.getX(0), posAttr.getY(0), posAttr.getZ(0));
              const v2 = new THREE.Vector3(posAttr.getX(1), posAttr.getY(1), posAttr.getZ(1));
              const p1 = projectTo2D(v1);
              const p2 = projectTo2D(v2);
              svg.push(`<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="#${COLORS.stalkLine.toString(16).padStart(6, '0')}" stroke-width="1" opacity="${STROKE_WEIGHTS.stalkOpacity}"/>`);
            }
          }
        } else if (stalk.type === 'Mesh' && stalk.geometry.type === 'CircleGeometry') {
          const p = projectTo2D(stalk.position);
          const screenRadius = getScreenRadius(stalk.position, SIZES.stalkBaseRadius);
          svg.push(`<circle cx="${p.x}" cy="${p.y}" r="${screenRadius}" fill="#${COLORS.stalkEllipse.toString(16).padStart(6, '0')}" opacity="${STROKE_WEIGHTS.stalkBaseOpacity}"/>`);
        }
      });
    }

    starMeshesRef.current.forEach(mesh => {
      if (!mesh.visible) return;
      
      const p = projectTo2D(mesh.position);
      const color = mesh.material && mesh.material.color ? '#' + mesh.material.color.getHexString() : '#ffffff';
      const screenRadius = getScreenRadius(mesh.position, SIZES.starRadius);
      svg.push(`<circle cx="${p.x}" cy="${p.y}" r="${screenRadius}" fill="${color}"/>`);
    });

    if (showLabels) {
      labelsRef.current.forEach(label => {
        if (!label.visible) return;
        
        const text = label.text || '';
        const fontSize = getScreenFontSize(label.position, LABEL_CONFIG.font.size);
        
        const starRef = label.userData.starRef;
        if (!starRef) return;
        
        const p = projectTo2D(starRef.position);
        const starScreenRadius = getScreenRadius(starRef.position, SIZES.starRadius);
        
        const offsetX = starScreenRadius + 10;
        const offsetY = fontSize * 0.3;
        
        svg.push(`<text x="${p.x + offsetX}" y="${p.y + offsetY}" font-size="${fontSize}" fill="${LABEL_CONFIG.appearance.color}" font-family="Orbitron, Arial, sans-serif" alignment-baseline="middle">${text}</text>`);
      });
    }

    svg.push('</svg>');

    const svgString = svg.join('\n');
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `staratlas-${Date.now()}.svg`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  };

  return (
    <>
      {uiVisible && isMobile && (
        <MobileNav
          // Search props
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          searchResults={searchResults}
          onStarClick={handleSearchResultSelect}
          
          // Filter props (convert spectralFilter to array format)
          starClassFilters={Object.entries(spectralFilter).map(([type, enabled]) => ({
            type,
            enabled,
            count: stars.filter(s => s.components?.[0]?.star_type?.startsWith(type)).length
          }))}
          onFilterToggle={(type) => {
            handleSpectralFilterChange({
              ...spectralFilter,
              [type]: !spectralFilter[type]
            });
          }}
          
          // View/Distance/Overlays props
          gridMode={gridMode}
          showGrid={showGrid}
          onGridModeChange={handleGridChange}
          viewDistance={viewDistance}
          onViewDistanceChange={handleViewDistanceChange}
          showLabels={showLabels}
          onShowLabelsChange={handleToggleLabels}
          showConnections={lineMode === 'connections'}
          onShowConnectionsChange={(enabled) => handleLineModeChange(enabled ? 'connections' : 'starsOnly')}
          showStalks={lineMode === 'stalks'}
          onShowStalksChange={(enabled) => handleLineModeChange(enabled ? 'stalks' : 'starsOnly')}
        />
      )}
      {uiVisible && !isMobile && (
        <Toolbar 
          onSearchChange={handleSearchChange}
          onExportSVG={handleExportSVG}
          searchResults={searchResults}
          showSearchResults={showSearchResults}
          onSearchResultSelect={handleSearchResultSelect}
          onCloseSearchResults={handleCloseSearchResults}
          // State props
          gridMode={gridMode}
          lineMode={lineMode}
          showLabels={showLabels}
          viewDistance={viewDistance}
          spectralFilter={spectralFilter}
          // Callback props
          onGridChange={handleGridChange}
          onLineModeChange={handleLineModeChange}
          onToggleLabels={handleToggleLabels}
          onViewDistanceChange={handleViewDistanceChange}
          onSpectralFilterChange={handleSpectralFilterChange}
        />
      )}
      {uiVisible && !measureMode && (
        <InfoPanel 
          star={selectedStar}
          onClose={() => {
            setSelectedStar(null);
            setIsFocused(false);
          }}
          onFocus={handleFocusOnStar}
          onZoom={handleZoomToStar}
          onReset={handleResetCamera}
          isFocused={isFocused}
          autoFocusOnClick={autoFocusOnClick}
          onAutoFocusChange={setAutoFocusOnClick}
        />
      )}
      
      
      {/* Measure Mode Status Popup */}
      {uiVisible && measureMode && (
        <div style={{
          position: 'fixed',
          top: '80px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'rgba(0, 255, 0, 0.1)',
          border: '2px solid #00ff00',
          borderRadius: '8px',
          padding: '12px 20px',
          color: '#00ff00',
          fontFamily: 'monospace',
          fontSize: '14px',
          fontWeight: 'bold',
          zIndex: 10000,
          textAlign: 'center',
          backdropFilter: 'blur(4px)'
        }}>
          {measurePoints.length === 0 && (
            <div>📏 Measure Mode: Click first star</div>
          )}
          {measurePoints.length === 1 && (
            <div>
              <div>✅ Selected: {measurePoints[0].name}</div>
              <div style={{ fontSize: '12px', marginTop: '4px', opacity: 0.8 }}>
                Click another star to measure distance
              </div>
            </div>
          )}
          {measurePoints.length === 2 && measureDistance !== null && (
            <div>
              <div>📐 Distance: {measureDistance.toFixed(2)} LY</div>
              <div style={{ fontSize: '12px', marginTop: '4px', opacity: 0.8 }}>
                Click "M" to reset or click another star for new measurement
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* UI Hidden Indicator */}
      {!uiVisible && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          color: '#ffffff',
          padding: '8px 12px',
          borderRadius: '6px',
          fontSize: '12px',
          fontFamily: 'monospace',
          zIndex: 10001,
          backdropFilter: 'blur(4px)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          UI Hidden - Press {navigator.platform.toLowerCase().includes('mac') ? 'CMD' : 'CTRL'}+. to show
        </div>
      )}
      
      <div 
        ref={mountRef} 
        style={{ 
          width: '100vw', 
          height: '100vh',
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 1
        }} 
      />
    </>
  );
};

export default Starfield;