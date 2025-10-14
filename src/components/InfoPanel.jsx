import { useState, useEffect } from 'react';

const InfoPanel = ({ star, onClose, onFocus, onZoom, isFocused }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!star) return null;

  return (
    <div style={{
      position: 'fixed',
      top: isMobile ? 'auto' : '16px',
      bottom: isMobile ? '16px' : 'auto',
      right: '16px',
      left: isMobile ? '16px' : 'auto',
      width: isMobile ? 'auto' : '320px',
      maxHeight: isMobile ? '60vh' : 'calc(100vh - 32px)',
      backgroundColor: 'rgba(17, 24, 39, 0.95)',
      backdropFilter: 'blur(8px)',
      border: '1px solid rgba(55, 65, 81, 1)',
      borderRadius: '8px',
      padding: '16px',
      color: 'white',
      fontFamily: 'monospace',
      fontSize: '14px',
      zIndex: 40,
      overflowY: 'auto',
      boxSizing: 'border-box'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
        paddingBottom: '12px',
        borderBottom: '1px solid rgba(55, 65, 81, 1)'
      }}>
        <h3 style={{
          fontSize: '16px',
          fontWeight: 'bold',
          margin: 0,
          color: '#d1d5db'
        }}>
          {star.name}
        </h3>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: '#9ca3af',
            fontSize: '20px',
            cursor: 'pointer',
            padding: '0',
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'color 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.color = '#ffffff'}
          onMouseLeave={(e) => e.target.style.color = '#9ca3af'}
        >
          ✕
        </button>
      </div>

      <div style={{ marginBottom: '12px' }}>
        <div style={{
          fontSize: '12px',
          color: '#9ca3af',
          marginBottom: '4px'
        }}>
          Distance
        </div>
        <div style={{ color: '#ffffff' }}>
          {star.distance_ly.toFixed(2)} light-years
        </div>
      </div>

      <div style={{ marginBottom: '12px' }}>
        <div style={{
          fontSize: '12px',
          color: '#9ca3af',
          marginBottom: '4px'
        }}>
          Coordinates
        </div>
        <div style={{ color: '#ffffff', fontSize: '12px' }}>
          RA: {star.ra}<br/>
          Dec: {star.dec}
        </div>
      </div>

      {star.components && star.components.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{
            fontSize: '12px',
            color: '#9ca3af',
            marginBottom: '8px'
          }}>
            Components ({star.components.length})
          </div>
          {star.components.map((component, index) => (
            <div
              key={index}
              style={{
                backgroundColor: 'rgba(55, 65, 81, 0.5)',
                padding: '8px',
                borderRadius: '4px',
                marginBottom: '6px',
                fontSize: '12px'
              }}
            >
              <div style={{ color: '#ffffff', marginBottom: '4px' }}>
                {component.name || `Component ${index + 1}`}
              </div>
              <div style={{ color: '#9ca3af' }}>
                Type: {component.spectral_type || 'Unknown'}
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{
        display: 'flex',
        gap: '8px',
        paddingTop: '12px',
        borderTop: '1px solid rgba(55, 65, 81, 1)'
      }}>
        <button
          onClick={() => onFocus(star)}
          style={{
            flex: 1,
            padding: '10px',
            backgroundColor: '#2563eb',
            border: 'none',
            borderRadius: '4px',
            color: 'white',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 'bold',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#1d4ed8'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#2563eb'}
        >
          Focus Camera
        </button>
        <button
          onClick={() => onZoom(star)}
          style={{
            flex: 1,
            padding: '10px',
            backgroundColor: '#dc2626',
            border: 'none',
            borderRadius: '4px',
            color: 'white',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 'bold',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#b91c1c'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#dc2626'}
        >
          Zoom Camera
        </button>
      </div>
    </div>
  );
};

export default InfoPanel;