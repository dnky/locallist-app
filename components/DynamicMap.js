// components/DynamicMap.js

import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import Link from 'next/link';

// Icon fix for Leaflet in Next.js
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

function MapEffect({ ads, filteredAdIds, isFiltering, viewMode }) {
  const map = useMap();

  useEffect(() => {
    // Zoom to filtered markers if filtering is active, otherwise fit all markers
    const adsToFit = isFiltering ? ads.filter(ad => filteredAdIds.has(ad.id)) : ads;
    
    if (adsToFit && adsToFit.length > 1) {
      const bounds = L.latLngBounds(adsToFit.map(ad => [ad.lat, ad.lng]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [ads, filteredAdIds, isFiltering, map]);

  useEffect(() => {
    if (viewMode === 'map') {
      setTimeout(() => {
        map.invalidateSize();
        const adsToFit = isFiltering ? ads.filter(ad => filteredAdIds.has(ad.id)) : ads;
        if (adsToFit && adsToFit.length > 1) {
          const bounds = L.latLngBounds(adsToFit.map(ad => [ad.lat, ad.lng]));
          map.fitBounds(bounds, { padding: [50, 50] });
        }
      }, 100);
    }
  }, [viewMode, map, ads, filteredAdIds, isFiltering]);

  return null;
}

export default function DynamicMap({
  ads,
  filteredAdIds = new Set(),
  searchQuery = '',
  isFiltering = false,
  hoveredAdId = null,
  viewMode = 'map',
  initialZoom = 13,
  scrollWheelZoom = true
}) {
  const markerRefs = useRef({});
  const adsWithCoords = (ads || []).filter(ad => ad.lat && ad.lng); 
  
  // Use the first ad's coords for the center if available, otherwise default to London
  const mapCenter = adsWithCoords.length > 0 
    ? [adsWithCoords[0].lat, adsWithCoords[0].lng] 
    : [51.505, -0.09];
    
  // We now rely on passed prop isFiltering instead of recalculating based on searchQuery

  useEffect(() => {
    adsWithCoords.forEach(ad => {
      const marker = markerRefs.current[ad.id];
      if (!marker || !marker._icon) return;

      marker._icon.classList.remove('marker-highlighted', 'marker-unmatched');

      if (ad.id === hoveredAdId) {
        marker._icon.classList.add('marker-highlighted');
      }
      else if (isFiltering && !filteredAdIds.has(ad.id)) {
        marker._icon.classList.add('marker-unmatched');
      }
    });
  }, [isFiltering, filteredAdIds, hoveredAdId, adsWithCoords]);

  useEffect(() => {
    Object.values(markerRefs.current).forEach(marker => {
      if (marker) marker.closePopup();
    });
    if (hoveredAdId && markerRefs.current[hoveredAdId]) {
      markerRefs.current[hoveredAdId].openPopup();
    }
  }, [hoveredAdId]);

  return (
    <MapContainer 
      center={mapCenter} 
      zoom={initialZoom} 
      scrollWheelZoom={scrollWheelZoom}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      
      {adsWithCoords.map(ad => {
        const isMatched = filteredAdIds.has(ad.id);
        // Only allow interactions if matched OR if we are not filtering
        const eventHandlers = (isFiltering && !isMatched) ? {} : {
          mouseover: (event) => {
            event.target.setZIndexOffset(1000);
            event.target.openPopup();
          },
          mouseout: (event) => {
            event.target.setZIndexOffset(0);
            event.target.closePopup();
          },
        };

        return (
          <Marker
            key={ad.id}
            position={[ad.lat, ad.lng]}
            ref={el => (markerRefs.current[ad.id] = el)}
            eventHandlers={eventHandlers}
          >
            <Popup>
              <strong>{ad.businessName}</strong>
              <br />
              
              {ad.type !== 'BASIC' ? (
                <a href={`/${ad.slug}`}>
                  View Details
                </a>
              ) : (
                <div style={{ fontSize: '0.85rem', marginTop: '4px', lineHeight: '1.4' }}>
                    {ad.phone && <div><i className="fa-solid fa-phone" style={{fontSize: '0.8em', marginRight: '5px'}}></i>{ad.phone}</div>}
                    {ad.web && <div><a href={ad.web} target="_blank" rel="noopener noreferrer">Website</a></div>}
                </div>
              )}

            </Popup>
          </Marker>
        );
      })}

      <MapEffect ads={adsWithCoords} filteredAdIds={filteredAdIds} isFiltering={isFiltering} viewMode={viewMode} />
    </MapContainer>
  );
}