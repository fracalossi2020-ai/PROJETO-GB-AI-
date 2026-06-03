'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Circle, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet default icon
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x.src || markerIcon2x,
  iconUrl: markerIcon.src || markerIcon,
  shadowUrl: markerShadow.src || markerShadow,
});

interface Zone {
  radius: number;
  fee: number;
  minOrder: number;
}

interface DeliveryMapProps {
  center: [number, number];
  zones: Zone[];
}

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7'];

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 13);
  }, [center, map]);
  return null;
}

export default function DeliveryMap({ center, zones }: DeliveryMapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="w-full h-[400px] bg-zinc-900 rounded-xl animate-pulse" />;

  return (
    <MapContainer
      center={center}
      zoom={13}
      scrollWheelZoom={true}
      style={{ height: '400px', width: '100%', borderRadius: '12px', zIndex: 1 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapUpdater center={center} />
      <Marker position={center}>
        <Popup>Local do estabelecimento</Popup>
      </Marker>
      {zones.map((zone, i) => (
        <Circle
          key={i}
          center={center}
          radius={zone.radius * 1000}
          pathOptions={{
            color: COLORS[i % COLORS.length],
            fillColor: COLORS[i % COLORS.length],
            fillOpacity: 0.15,
            weight: 2,
          }}
        >
          <Popup>
            <div className="text-sm">
              <strong>Área {i + 1}</strong><br />
              Raio: {zone.radius} km<br />
              Taxa: R$ {zone.fee.toFixed(2)}<br />
              Mínimo: R$ {zone.minOrder.toFixed(2)}
            </div>
          </Popup>
        </Circle>
      ))}
    </MapContainer>
  );
}
