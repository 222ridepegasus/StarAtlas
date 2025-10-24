import { useState, useEffect, useRef } from 'react';

const FPSCounter = ({ isVisible, onClose }) => {
  const [fps, setFps] = useState(0);
  const [avgFps, setAvgFps] = useState(0);
  const [minFps, setMinFps] = useState(Infinity);
  const [maxFps, setMaxFps] = useState(0);
  const [frameTime, setFrameTime] = useState(0);
  const [memoryUsage, setMemoryUsage] = useState(null);
  
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(0);
  const fpsHistoryRef = useRef([]);
  const frameTimeHistoryRef = useRef([]);
  const animationFrameRef = useRef(null);
  const startTimeRef = useRef(0);
  
  // FPS calculation
  useEffect(() => {
    if (!isVisible) {
      // Reset when hidden
      frameCountRef.current = 0;
      lastTimeRef.current = 0;
      fpsHistoryRef.current = [];
      frameTimeHistoryRef.current = [];
      setFps(0);
      setAvgFps(0);
      setMinFps(Infinity);
      setMaxFps(0);
      setFrameTime(0);
      return;
    }
    
    startTimeRef.current = performance.now();
    
    const calculateFPS = (currentTime) => {
      frameCountRef.current++;
      
      // Calculate frame time
      if (lastTimeRef.current > 0) {
        const currentFrameTime = currentTime - lastTimeRef.current;
        frameTimeHistoryRef.current.push(currentFrameTime);
        
        // Keep only last 60 frames for frame time average
        if (frameTimeHistoryRef.current.length > 60) {
          frameTimeHistoryRef.current.shift();
        }
        
        const avgFrameTime = frameTimeHistoryRef.current.reduce((a, b) => a + b, 0) / frameTimeHistoryRef.current.length;
        setFrameTime(Math.round(avgFrameTime * 100) / 100);
      }
      
      lastTimeRef.current = currentTime;
      
      // Update FPS every second
      if (currentTime - startTimeRef.current >= 1000) {
        const currentFps = Math.round((frameCountRef.current * 1000) / (currentTime - startTimeRef.current));
        setFps(currentFps);
        
        // Update FPS history
        fpsHistoryRef.current.push(currentFps);
        
        // Keep only last 30 seconds of FPS data
        if (fpsHistoryRef.current.length > 30) {
          fpsHistoryRef.current.shift();
        }
        
        // Calculate statistics
        if (fpsHistoryRef.current.length > 0) {
          const avg = fpsHistoryRef.current.reduce((a, b) => a + b, 0) / fpsHistoryRef.current.length;
          setAvgFps(Math.round(avg));
          setMinFps(Math.min(...fpsHistoryRef.current));
          setMaxFps(Math.max(...fpsHistoryRef.current));
        }
        
        // Reset for next second
        frameCountRef.current = 0;
        startTimeRef.current = currentTime;
      }
      
      // Check memory usage if available
      if (performance.memory) {
        setMemoryUsage({
          used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
          total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
          limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
        });
      }
      
      animationFrameRef.current = requestAnimationFrame(calculateFPS);
    };
    
    animationFrameRef.current = requestAnimationFrame(calculateFPS);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isVisible]);
  
  if (!isVisible) return null;
  
  return (
    <div 
      className="fixed z-50 bg-black bg-opacity-90 text-green-400 p-4 rounded-lg border border-green-400 font-mono text-sm"
      style={{
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        minWidth: '300px',
        backdropFilter: 'blur(4px)'
      }}
    >
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-green-300 font-bold text-base">Performance Monitor</h3>
        <button 
          onClick={onClose}
          className="text-green-400 hover:text-green-300 text-lg font-bold"
        >
          ×
        </button>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-green-300 mb-2">FPS</div>
          <div className="text-2xl font-bold text-green-400">{fps}</div>
        </div>
        
        <div>
          <div className="text-green-300 mb-2">Frame Time</div>
          <div className="text-lg font-bold text-green-400">{frameTime}ms</div>
        </div>
        
        <div>
          <div className="text-green-300 mb-2">Avg FPS</div>
          <div className="text-lg font-bold text-green-400">{avgFps}</div>
        </div>
        
        <div>
          <div className="text-green-300 mb-2">Min FPS</div>
          <div className="text-lg font-bold text-green-400">{minFps === Infinity ? '--' : minFps}</div>
        </div>
        
        <div>
          <div className="text-green-300 mb-2">Max FPS</div>
          <div className="text-lg font-bold text-green-400">{maxFps}</div>
        </div>
        
        {memoryUsage && (
          <div>
            <div className="text-green-300 mb-2">Memory</div>
            <div className="text-sm text-green-400">
              {memoryUsage.used}MB / {memoryUsage.total}MB
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-3 text-xs text-green-500">
        Press P to toggle • Click × to close
      </div>
    </div>
  );
};

export default FPSCounter;
