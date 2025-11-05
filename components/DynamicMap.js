import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import Link from 'next/link';

// ======================= THE DEFINITIVE FIX =======================
// This code block explicitly sets the paths for Leaflet's default icon images.
// It points to a public CDN (unpkg) to ensure the images are always found,
// regardless of the build environment. This fixes the "invisible marker" bug.
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});
// ====================================================================

export default function DynamicMap({ ads, hoveredAdId, viewMode }) {
  const markerRefs = useRef({});
  const mapRef = useRef(null);

  // Effect to handle hover highlighting (remains the same)
  useEffect(() => {
    Object.values(markerRefs.current).forEach(marker => {
      if (marker) marker.closePopup();
    });
    if (hoveredAdId && markerRefs.current[hoveredAdId]) {
      markerRefs.current[hoveredAdId].openPopup();
    }
  }, [hoveredAdId]);

  // Effect to handle resizing on mobile (remains the same)
  useEffect(() => {
    if (viewMode === 'map' && mapRef.current) {
      setTimeout(() => {
        mapRef.current.invalidateSize();
      }, 100);
    }
  }, [viewMode]);

  const adsWithCoords = ads.filter(ad => ad.lat && ad.lng);
  const mapCenter = adsWithCoords.length > 0
    ? [adsWithCoords[0].lat, adsWithCoords[0].lng]
    : [51.505, -0.09];

  return (
    <MapContainer ref={mapRef} center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {adsWithCoords.map(ad => (
        <Marker
          key={ad.id}
          position={[ad.lat, ad.lng]}
          ref={el => (markerRefs.current[ad.id] = el)}
          eventHandlers={{
            mouseover: (event) => {
              // Highlight the marker on hover
              event.target.setZIndexOffset(1000);
              event.target.openPopup();
            },
            mouseout: (event) => {
              event.target.setZIndexOffset(0);
              event.target.closePopup();
            },
          }}
          // We no longer need a custom icon function. The default icon is now fixed.
          // We'll add a class for highlighting via CSS instead.
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
    </MapContainer>
  );
}