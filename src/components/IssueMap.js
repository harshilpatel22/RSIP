import React, { useEffect, useRef, useState } from 'react';

// Note: In a real implementation, you would install mapbox-gl-js
// For now, we'll create a simple placeholder that can be replaced with actual Mapbox integration

const IssueMap = ({ issues }) => {
  const mapContainer = useRef(null);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    // Check if Mapbox is available
    if (typeof window !== 'undefined' && window.mapboxgl) {
      initializeMap();
    } else {
      setMapError(true);
    }
  }, [issues]);

  const initializeMap = () => {
    try {
      // Initialize Mapbox map
      const mapboxgl = window.mapboxgl;
      mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

      const map = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [70.7833, 22.3039], // Rajkot coordinates
        zoom: 12
      });

      map.on('load', () => {
        // Add issue markers
        issues.forEach((issue, index) => {
          if (issue.location && issue.location.lat && issue.location.lng) {
            const markerColor = getSeverityColor(issue.severity);
            
            // Create marker
            const marker = new mapboxgl.Marker({
              color: markerColor
            })
            .setLngLat([issue.location.lng, issue.location.lat])
            .setPopup(
              new mapboxgl.Popup({ offset: 25 }).setHTML(`
                <div style="padding: 0.5rem;">
                  <h4 style="margin: 0 0 0.5rem 0; font-size: 1rem;">${issue.category?.en || 'Unknown'}</h4>
                  <p style="margin: 0 0 0.25rem 0; font-size: 0.9rem;"><strong>Status:</strong> ${issue.status}</p>
                  <p style="margin: 0 0 0.25rem 0; font-size: 0.9rem;"><strong>Ward:</strong> ${issue.wardId}</p>
                  <p style="margin: 0 0 0.25rem 0; font-size: 0.9rem;"><strong>Severity:</strong> ${issue.severity}</p>
                  <p style="margin: 0; font-size: 0.8rem; color: #666;">${issue.location.address || 'Address not available'}</p>
                </div>
              `)
            )
            .addTo(map);
          }
        });
      });

    } catch (error) {
      console.error('Error initializing map:', error);
      setMapError(true);
    }
  };

  const getSeverityColor = (severity) => {
    const colors = {
      low: '#10b981',
      medium: '#f59e0b', 
      high: '#ef4444',
      critical: '#7c2d12'
    };
    return colors[severity] || '#6b7280';
  };

  // If Mapbox is not available, show a placeholder with issue locations
  if (mapError) {
    return (
      <div className="map-container">
        <div style={{ 
          height: '400px', 
          display: 'flex', 
          flexDirection: 'column',
          backgroundColor: '#f9fafb',
          border: '2px dashed #d1d5db',
          borderRadius: '12px',
          padding: '1rem'
        }}>
          <div style={{ 
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🗺️</div>
            <h3 style={{ marginBottom: '0.5rem', color: '#374151' }}>Map View</h3>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
              Mapbox integration required for full map functionality
            </p>
            
            {/* Show issues as a list when map is not available */}
            <div style={{ 
              width: '100%',
              maxHeight: '200px',
              overflowY: 'auto',
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '1rem'
            }}>
              <h4 style={{ marginBottom: '1rem' }}>Issue Locations ({issues.length})</h4>
              {issues.length === 0 ? (
                <p style={{ color: '#6b7280', textAlign: 'center' }}>No issues to display</p>
              ) : (
                issues.map((issue, index) => (
                  <div 
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0.5rem',
                      marginBottom: '0.5rem',
                      backgroundColor: '#f9fafb',
                      borderRadius: '6px',
                      borderLeft: `4px solid ${getSeverityColor(issue.severity)}`
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '500', fontSize: '0.9rem' }}>
                        {issue.category?.en || 'Unknown Category'}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                        Ward {issue.wardId} • {issue.status}
                        {issue.location?.lat && (
                          <span> • {issue.location.lat.toFixed(4)}, {issue.location.lng.toFixed(4)}</span>
                        )}
                      </div>
                    </div>
                    <div 
                      style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        backgroundColor: getSeverityColor(issue.severity)
                      }}
                    ></div>
                  </div>
                ))
              )}
            </div>
          </div>
          
          <div style={{ 
            textAlign: 'center',
            marginTop: '1rem',
            padding: '1rem',
            backgroundColor: '#e0f2fe',
            borderRadius: '8px',
            border: '1px solid #b3e5fc'
          }}>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#0277bd' }}>
              💡 To enable interactive map: Add Mapbox token to environment variables
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Return actual map container when Mapbox is available
  return (
    <div className="map-container">
      <div 
        ref={mapContainer} 
        style={{ 
          width: '100%', 
          height: '400px', 
          borderRadius: '12px',
          overflow: 'hidden'
        }} 
      />
      
      {/* Map Legend */}
      <div style={{
        position: 'absolute',
        top: '1rem',
        right: '1rem',
        backgroundColor: 'white',
        padding: '0.75rem',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        fontSize: '0.8rem'
      }}>
        <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Severity Legend</div>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.25rem' }}>
          <div style={{ width: '12px', height: '12px', backgroundColor: '#10b981', borderRadius: '50%', marginRight: '0.5rem' }}></div>
          <span>Low</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.25rem' }}>
          <div style={{ width: '12px', height: '12px', backgroundColor: '#f59e0b', borderRadius: '50%', marginRight: '0.5rem' }}></div>
          <span>Medium</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.25rem' }}>
          <div style={{ width: '12px', height: '12px', backgroundColor: '#ef4444', borderRadius: '50%', marginRight: '0.5rem' }}></div>
          <span>High</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ width: '12px', height: '12px', backgroundColor: '#7c2d12', borderRadius: '50%', marginRight: '0.5rem' }}></div>
          <span>Critical</span>
        </div>
      </div>
    </div>
  );
};

export default IssueMap;