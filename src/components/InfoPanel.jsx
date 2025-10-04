const InfoPanel = ({ star, onClose }) => {
  if (!star) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      right: '24px',
      transform: 'translateY(-50%)',
      backgroundColor: 'rgba(17, 24, 39, 0.95)',
      backdropFilter: 'blur(8px)',
      border: '1px solid rgba(55, 65, 81, 1)',
      borderRadius: '8px',
      padding: '20px',
      color: 'white',
      fontFamily: 'monospace',
      fontSize: '14px',
      zIndex: 9999,
      minWidth: '280px',
      maxWidth: '320px'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '16px'
      }}>
        <h2 style={{ 
          fontSize: '18px', 
          fontWeight: 'bold',
          margin: 0
        }}>
          {star.name}
        </h2>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: '#9ca3af',
            fontSize: '20px',
            cursor: 'pointer',
            padding: '0 4px',
            lineHeight: '1'
          }}
          onMouseEnter={(e) => e.target.style.color = '#ffffff'}
          onMouseLeave={(e) => e.target.style.color = '#9ca3af'}
        >
          ×
        </button>
      </div>

      <div style={{ marginBottom: '12px' }}>
        <div style={{ color: '#9ca3af', fontSize: '12px', marginBottom: '4px' }}>
          Distance
        </div>
        <div style={{ fontSize: '16px' }}>
          {star.distance_ly.toFixed(2)} light years
        </div>
      </div>

      <div style={{ marginBottom: '12px' }}>
        <div style={{ color: '#9ca3af', fontSize: '12px', marginBottom: '4px' }}>
          Components
        </div>
        {star.components.map((comp, idx) => (
          <div key={idx} style={{ fontSize: '14px', marginBottom: '4px' }}>
            {comp.name} ({comp.spectral_type})
          </div>
        ))}
      </div>

      <div style={{ 
        marginTop: '16px',
        paddingTop: '12px',
        borderTop: '1px solid rgba(55, 65, 81, 1)',
        fontSize: '12px',
        color: '#9ca3af'
      }}>
        Right-click to focus camera
      </div>
    </div>
  );
};

export default InfoPanel;