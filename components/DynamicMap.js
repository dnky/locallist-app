import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import Link from 'next/link'; // <-- THIS IS THE MISSING LINE

// --- NEW: Custom DivIcon for CSS styling ---
const createIcon = (isHighlighted = false) => {
  return L.divIcon({
    html: `<i class="fa-solid fa-location-dot"></i>`,
    className: `custom-marker-icon ${isHighlighted ? 'highlighted' : ''}`,
    iconSize: [30, 42],
    iconAnchor: [15, 42],
    popupAnchor: [0, -42]
  });
};

export default function DynamicMap({ ads, hoveredAdId }) {
  const markerRefs = useRef({});

  // Effect to open/close popups when hoveredAdId prop changes
  useEffect(() => {
    // First, close all popups to clear any stray ones
    Object.values(markerRefs.current).forEach(marker => {
      if (marker) marker.closePopup();
    });

    // If a valid ad is hovered, open its popup
    if (hoveredAdId && markerRefs.current[hoveredAdId]) {
      markerRefs.current[hoveredAdId].openPopup();
    }
  }, [hoveredAdId]);


  const adsWithCoords = ads.filter(ad => ad.lat && ad.lng);
  const mapCenter = adsWithCoords.length > 0
    ? [adsWithCoords[0].lat, adsWithCoords[0].lng]
    : [51.505, -0.09];

  return (
    <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {adsWithCoords.map(ad => (
        <Marker
          key={ad.id}
          position={[ad.lat, ad.lng]}
          // --- Store a ref to each marker instance ---
          ref={el => (markerRefs.current[ad.id] = el)}
          // --- Add direct hover event handlers ---
          eventHandlers={{
            mouseover: (event) => event.target.openPopup(),
            mouseout: (event) => event.target.closePopup(),
          }}
          // --- Use the custom icon that reacts to hover state ---
          icon={createIcon(ad.id === hoveredAdId)}
        >
          <Popup>
            <strong>{ad.businessName}</strong>
            <br />
            {/* --- LINK TO DETAIL PAGE --- */}
            <Link href={`/details?id=${ad.id}`}>
              View Details
            </Link>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}