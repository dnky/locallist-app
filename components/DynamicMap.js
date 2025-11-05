import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// This is a common fix for a known issue with React-Leaflet's default icon.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});


export default function DynamicMap({ ads }) {
  // Filter for ads that have coordinates
  const adsWithCoords = ads.filter(ad => ad.lat && ad.lng);

  // Set a default center or use the first ad's location
  const mapCenter = adsWithCoords.length > 0
    ? [adsWithCoords[0].lat, adsWithCoords[0].lng]
    : [51.505, -0.09]; // Default to London if no ads have coords

  return (
    <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {adsWithCoords.map(ad => (
        <Marker key={ad.id} position={[ad.lat, ad.lng]}>
          <Popup>
            <strong>{ad.businessName}</strong>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}