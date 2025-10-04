import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Text } from 'troika-three-text';
import { COLORS, SIZES, STROKE_WEIGHTS, getSpectralColor } from '../config/visual.js';
import { LABEL_CONFIG, formatStarName } from '../config/labels.js';
import Sidebar from './Sidebar.jsx';
import InfoPanel from './InfoPanel.jsx';

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
  const decRegex = /([+-]?\d+)°(\d+)′(\d+)″/;
  const match = decNormalized.match(decRegex);
  if (!match) return 0;
  const degrees = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const seconds = parseInt(match[3], 10);
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
  const isDraggingRef = useRef(false);
  const mouseDownPosRef = useRef(new THREE.Vector2());
  const selectedStarRef = useRef(null);
  const rebuildConnectionsRef = useRef(null);

  // State
  const [stars, setStars] = useState([]);
  const [gridMode, setGridMode] = useState('circular');
  const [viewDistance, setViewDistance] = useState(20);
  const [showGrid, setShowGrid] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [lineMode, setLineMode] = useState('connections');
  const [spectralFilter, setSpectralFilter] = useState({
    O: true, B: true, A: true, F: true, G: true, K: true, M: true, L: true, T: true, Y: true, D: true
  });
  const [selectedStar, setSelectedStar] = useState(null);

  // Load star data
  useEffect(() => {
    fetch('/data/stars.json')
      .then(res => res.json())
      .then(data => setStars(data))
      .catch(err => console.error('Error loading stars:', err));
  }, []);

  // Function to build/rebuild grids based on current view distance
  const buildGrids = () => {
    if (!squareGridRef.current || !circularGridRef.current) return;

    // Build square grid
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

    // Build circular grid
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

    SIZES.gridCircularRings.forEach(radius => {
      if (radius <= viewDistance) {
        const segments = 64;
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
    });

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

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 5;
    controls.maxDistance = 100;
    controlsRef.current = controls;

    const squareGridGroup = new THREE.Group();
    squareGridGroup.visible = showGrid && gridMode === 'square';
    scene.add(squareGridGroup);
    squareGridRef.current = squareGridGroup;

    const circularGridGroup = new THREE.Group();
    circularGridGroup.visible = showGrid && gridMode === 'circular';
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

    const starMeshes = [];
    stars.forEach(star => {
      const starGroup = [];

      const primaryComponent = star.components[0];
      const color = getSpectralColor(primaryComponent.spectral_type);
      const spectralClass = primaryComponent.spectral_type.charAt(0).toUpperCase();

      const pos = raDecToXYZ(star.ra, star.dec, star.distance_ly);

      const geometry = new THREE.SphereGeometry(SIZES.starRadius, 16, 16);
      const material = new THREE.MeshBasicMaterial({ color });
      const sphere = new THREE.Mesh(geometry, material);
      sphere.position.copy(pos);
      sphere.userData = { star, distance: star.distance_ly, spectralClass };
      scene.add(sphere);
      starGroup.push(sphere);
      starMeshes.push(sphere);

      const glowGeometry = new THREE.SphereGeometry(SIZES.starGlowRadius, 16, 16);
      const glowMaterial = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: COLORS.starGlow.opacity
      });
      const glow = new THREE.Mesh(glowGeometry, glowMaterial);
      glow.position.copy(sphere.position);
      glow.userData = { distance: star.distance_ly, spectralClass };
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
      
      label.userData.starRef = sphere;
      label.userData.pad = LABEL_CONFIG.position.pad;
      label.userData.vOffset = LABEL_CONFIG.position.vOffset;
      label.userData.distance = star.distance_ly;
      label.userData.spectralClass = spectralClass;
      
      label.position.copy(sphere.position);
      label.sync();
      scene.add(label);
      labelsRef.current.push(label);
      starGroup.push(label);

      if (pos.y !== 0) {
        const stalkGeometry = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(pos.x, 0, pos.z),
          new THREE.Vector3(pos.x, pos.y, pos.z)
        ]);
        const stalkMaterial = new THREE.LineBasicMaterial({ 
          color: COLORS.stalkLine,
          transparent: true,
          opacity: STROKE_WEIGHTS.stalkOpacity,
          linewidth: STROKE_WEIGHTS.stalk
        });
        const stalk = new THREE.Line(stalkGeometry, stalkMaterial);
        stalk.userData = { distance: star.distance_ly, spectralClass };
        stalk.visible = lineMode === 'stalks';
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
        baseCircleMesh.visible = lineMode === 'stalks';
        scene.add(baseCircleMesh);
        starGroup.push(baseCircleMesh);
        stalksRef.current.push(baseCircleMesh);
      }

      starObjectsRef.current.push(starGroup);
    });
    
    starMeshesRef.current = starMeshes;

    // Function to rebuild connections based on visible stars
    const rebuildConnections = () => {
      // Clear all existing connections
      connectionsRef.current.forEach(line => {
        scene.remove(line);
        line.geometry.dispose();
        line.material.dispose();
      });
      connectionsRef.current = [];

      // Get currently visible star meshes
      const visibleStars = starMeshesRef.current.filter(mesh => mesh.visible);
      
      if (visibleStars.length < 2) return; // Need at least 2 stars to connect

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
            const lineGeometry = new THREE.BufferGeometry().setFromPoints([
              star.position,
              neighbor.position
            ]);
            const lineMaterial = new THREE.LineBasicMaterial({
              color: COLORS.connectionLine,
              linewidth: STROKE_WEIGHTS.connectionLine,
              opacity: STROKE_WEIGHTS.connectionOpacity,
              transparent: true
            });
            const line = new THREE.Line(lineGeometry, lineMaterial);
            line.visible = lineMode === 'connections';
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

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(starMeshesRef.current);

      if (intersects.length > 0) {
        const star = intersects[0].object;
        highlight.position.copy(star.position);
        highlight.visible = true;
      } else {
        if (!selectedStarRef.current) {
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
      const intersects = raycaster.intersectObjects(starMeshesRef.current);

      if (intersects.length > 0) {
        const star = intersects[0].object;
        selectedStarRef.current = star.userData.star;
        setSelectedStar(star.userData.star);
        highlight.position.copy(star.position);
        highlight.visible = true;
      } else {
        selectedStarRef.current = null;
        setSelectedStar(null);
        highlight.visible = false;
      }
    };

    const onContextMenu = (event) => {
      event.preventDefault();
      if (selectedStarRef.current) {
        const selectedMesh = starMeshesRef.current.find(
          mesh => mesh.userData.star === selectedStarRef.current
        );
        if (selectedMesh) {
          focusTargetRef.current = selectedMesh.position.clone();
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

    const animate = () => {
      requestAnimationFrame(animate);
      
      controls.update();
      
      if (focusTargetRef.current) {
        const targetPos = focusTargetRef.current;
        controls.target.lerp(targetPos, 0.1);
        
        const offset = camera.position.clone().sub(controls.target);
        const spherical = new THREE.Spherical().setFromVector3(offset);
        const desiredRadius = 5;
        spherical.radius = THREE.MathUtils.lerp(spherical.radius, desiredRadius, 0.1);
        
        const newPos = new THREE.Vector3().setFromSpherical(spherical).add(controls.target);
        camera.position.copy(newPos);
        
        if (controls.target.distanceTo(targetPos) < 0.01 && Math.abs(spherical.radius - desiredRadius) < 0.1) {
          focusTargetRef.current = null;
        }
      }
      
      if (highlightRef.current.visible) {
        const elapsedTime = clockRef.current.getElapsedTime();
        const pulse = (Math.sin(elapsedTime * Math.PI * 2) + 1) / 2;
        const scale = 0.5 + pulse * 0.1;
        highlightRef.current.scale.set(scale, scale, 1);
      }
      
      labelsRef.current.forEach(label => {
        const star = label.userData.starRef;
        if (!star) return;

        const right = new THREE.Vector3();
        const up = new THREE.Vector3();
        
        camera.getWorldDirection(right);
        right.cross(camera.up).normalize();
        up.copy(camera.up).normalize();

        const basePos = star.position.clone();
        const offset = right.multiplyScalar(label.userData.pad || 0.3)
          .add(up.multiplyScalar(label.userData.vOffset || 0));
        label.position.copy(basePos.add(offset));

        label.quaternion.copy(camera.quaternion);
        label.sync();
      });
      
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('mousedown', onMouseDown);
      renderer.domElement.removeEventListener('mousemove', onMouseMove);
      renderer.domElement.removeEventListener('mouseup', onMouseUp);
      renderer.domElement.removeEventListener('contextmenu', onContextMenu);
      scene.traverse((object) => {
        if (object instanceof Text) {
          object.dispose();
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
          
          obj.visible = withinDistance && passesFilter;
        }
      });
    });

    labelsRef.current.forEach(label => {
      const withinDistance = label.userData.distance <= viewDistance;
      
      let passesFilter = true;
      if (label.userData.spectralClass) {
        passesFilter = spectralFilter[label.userData.spectralClass];
      }
      
      label.visible = showLabels && withinDistance && passesFilter;
    });

    // Rebuild connections with only visible stars
    if (rebuildConnectionsRef.current) {
      rebuildConnectionsRef.current();
    }

    buildGrids();
  }, [viewDistance, showLabels, spectralFilter]);

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

  // Sync grid visibility when gridMode or showGrid changes
  useEffect(() => {
    if (squareGridRef.current && circularGridRef.current) {
      squareGridRef.current.visible = showGrid && gridMode === 'square';
      circularGridRef.current.visible = showGrid && gridMode === 'circular';
    }
  }, [gridMode, showGrid]);

  const handleToggleLabelsVisibility = (visible) => {
    setShowLabels(visible);
    labelsRef.current.forEach(label => {
      const withinDistance = label.userData.distance <= viewDistance;
      label.visible = visible && withinDistance;
    });
  };

  const handleToggleAxesHelper = (visible) => {
    if (axesHelperRef.current) {
      axesHelperRef.current.visible = visible;
    }
  };

  const handleLineModeChange = (mode) => {
    setLineMode(mode);
  };

  const handleSpectralFilterChange = (filter) => {
    setSpectralFilter(filter);
  };

  const handleFocusOnStar = () => {
    if (selectedStar) {
      const selectedMesh = starMeshesRef.current.find(
        mesh => mesh.userData.star === selectedStar
      );
      if (selectedMesh) {
        focusTargetRef.current = selectedMesh.position.clone();
      }
    }
  };

  return (
    <>
      <Sidebar 
        onToggleGrid={handleToggleGrid}
        onViewDistanceChange={handleViewDistanceChange}
        onToggleGridVisibility={handleToggleGridVisibility}
        onToggleLabelsVisibility={handleToggleLabelsVisibility}
        onToggleAxesHelper={handleToggleAxesHelper}
        onLineModeChange={handleLineModeChange}
        onSpectralFilterChange={handleSpectralFilterChange}
      />
      <InfoPanel 
        star={selectedStar}
        onClose={() => setSelectedStar(null)}
        onFocus={handleFocusOnStar}
      />
      <div 
        ref={mountRef} 
        style={{ 
          width: '100vw', 
          height: '100vh',
          position: 'fixed',
          top: 0,
          left: 0
        }} 
      />
    </>
  );
};

export default Starfield;