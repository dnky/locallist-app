// components/DynamicMap.js

import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import Link from 'next/link';

// Icon fix remains the same and is crucial
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// ======================= NEW HELPER COMPONENT =======================
// This component uses the `useMap` hook to get the map instance
// and applies effects to it, like fitting bounds.
function MapEffect({ ads, viewMode }) {
  const map = useMap(); // This hook gives us access to the map instance

  // Effect for fitting bounds on load or when ads change
  useEffect(() => {
    if (ads && ads.length > 0) {
      const bounds = L.latLngBounds(ads.map(ad => [ad.lat, ad.lng]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [ads, map]);

  // Effect for handling map resizing on mobile view toggle
  useEffect(() => {
    if (viewMode === 'map') {
      // A small delay ensures the map container has resized before invalidating
      setTimeout(() => {
        map.invalidateSize();
      }, 100);
    }
  }, [viewMode, map]);

  return null; // This component does not render any visible JSX
}
// ====================================================================

export default function DynamicMap({ ads, hoveredAdId, viewMode }) {
  const markerRefs = useRef({});

  // Effect to handle hover highlighting (remains the same)
  useEffect(() => {
    Object.values(markerRefs.current).forEach(marker => {
      if (marker) marker.closePopup();
    });
    if (hoveredAdId && markerRefs.current[hoveredAdId]) {
      markerRefs.current[hoveredAdId].openPopup();
    }
  }, [hoveredAdId]);

  const adsWithCoords = ads.filter(ad => ad.lat && ad.lng);
  
  // A default center in case there are no ads with coordinates.
  const mapCenter = [51.505, -0.09];

  return (
    // We no longer need the `ref` here.
    <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      
      {/* Render the markers as before */}
      {adsWithCoords.map(ad => (
        <Marker
          key={ad.id}
          position={[ad.lat, ad.lng]}
          ref={el => (markerRefs.current[ad.id] = el)}
          eventHandlers={{
            mouseover: (event) => {
              event.target.setZIndexOffset(1000);
              event.target.openPopup();
            },
            mouseout: (event) => {
              event.target.setZIndexOffset(0);
              event.target.closePopup();
            },
          }}
          className={ad.id === hoveredAdId ? 'marker-highlighted' : ''}
        >
          <Popup>
            <strong>{ad.businessName}</strong>
            <br />
            <Link href={`/details?id=${ad.id}`}>
              View Details
            </Link>
          </Popup>
        </Marker>
      ))}

      {/* NEW: Add our MapEffect component as a child of MapContainer */}
      <MapEffect ads={adsWithCoords} viewMode={viewMode} />
    </MapContainer>
  );
}