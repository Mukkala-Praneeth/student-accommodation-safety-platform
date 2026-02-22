import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34]
});

L.Marker.prototype.options.icon = DefaultIcon;

function createColoredIcon(color: string) {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background-color: ${color};
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
  });
}

const greenIcon = createColoredIcon('#22c55e');
const yellowIcon = createColoredIcon('#eab308');
const redIcon = createColoredIcon('#ef4444');

interface Accommodation {
  _id: string;
  name: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  totalReports?: number;
  type?: string;
}

interface AccommodationMapProps {
  accommodations?: Accommodation[];
}

const AccommodationMap: React.FC<AccommodationMapProps> = ({ accommodations: propAccommodations }) => {
  const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const navigate = useNavigate();
  const [accommodations, setAccommodations] = useState<Accommodation[]>(propAccommodations || []);
  const [loading, setLoading] = useState(!propAccommodations);

  useEffect(() => {
    if (!propAccommodations) {
      fetchAccommodations();
    }
  }, [propAccommodations]);

  const fetchAccommodations = async () => {
    try {
      const response = await fetch(`${API}/api/accommodations/with-location`);
      const data = await response.json();
      if (data.success) {
        setAccommodations(data.data);
      }
    } catch (err) {
      console.error('Error fetching accommodations for map');
    } finally {
      setLoading(false);
    }
  };

  const getMarkerIcon = (acc: Accommodation) => {
    const reports = acc.totalReports || 0;
    if (reports === 0) return greenIcon;
    if (reports <= 3) return yellowIcon;
    return redIcon;
  };

  const getStatusLabel = (acc: Accommodation) => {
    const reports = acc.totalReports || 0;
    if (reports === 0) return { text: 'Safe', color: 'text-green-600' };
    if (reports <= 3) return { text: 'Caution', color: 'text-yellow-600' };
    return { text: 'Unsafe', color: 'text-red-600' };
  };

  const mappableAccommodations = accommodations.filter(
    acc => acc.latitude && acc.longitude && acc.latitude !== 0 && acc.longitude !== 0
  );

  const defaultCenter: [number, number] = [17.385, 78.4867];

  const center: [number, number] = mappableAccommodations.length > 0
    ? [
        mappableAccommodations.reduce((sum, a) => sum + (a.latitude || 0), 0) / mappableAccommodations.length,
        mappableAccommodations.reduce((sum, a) => sum + (a.longitude || 0), 0) / mappableAccommodations.length
      ]
    : defaultCenter;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96 bg-gray-50 rounded-xl">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">🗺️ Accommodation Map</h2>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-green-500 inline-block"></span> Safe
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-yellow-500 inline-block"></span> Caution
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span> Unsafe
          </span>
        </div>
      </div>

      {mappableAccommodations.length === 0 ? (
        <div className="bg-gray-50 rounded-xl p-8 text-center border-2 border-dashed border-gray-200">
          <span className="text-4xl mb-3 block">🗺️</span>
          <p className="text-gray-500 font-medium">No accommodations with location data yet.</p>
          <p className="text-gray-400 text-sm mt-1">Owners can add locations from their dashboard.</p>
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden border-2 border-gray-200 shadow-lg" style={{ height: '500px' }}>
          <MapContainer
            center={center}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {mappableAccommodations.map((acc) => {
              const status = getStatusLabel(acc);
              return (
                <Marker
                  key={acc._id}
                  position={[acc.latitude!, acc.longitude!]}
                  icon={getMarkerIcon(acc)}
                >
                  <Popup>
                    <div className="p-1 min-w-[200px]">
                      <h3 className="font-bold text-gray-900 text-base mb-1">{acc.name}</h3>
                      {acc.address && (
                        <p className="text-gray-500 text-xs mb-2">📍 {acc.address}</p>
                      )}
                      {acc.type && (
                        <p className="text-gray-500 text-xs mb-2">🏠 {acc.type}</p>
                      )}
                      <div className="flex items-center justify-between mb-2">
                        <span className={`font-semibold text-sm ${status.color}`}>
                          {status.text}
                        </span>
                        <span className="text-xs text-gray-400">
                          {acc.totalReports || 0} reports
                        </span>
                      </div>
                      <button
                        onClick={() => navigate(`/accommodations/${acc._id}`)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-1.5 px-3 rounded transition-colors"
                      >
                        View Details
                      </button>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>
      )}

      <p className="text-xs text-gray-400 text-center">
        {mappableAccommodations.length} accommodations shown on map
      </p>
    </div>
  );
};

export default AccommodationMap;
