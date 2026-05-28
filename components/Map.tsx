'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { PowerEvent } from '@/types';

type LeafletType = typeof import('leaflet');

interface MapProps {
  events?: PowerEvent[];
  onMarkerClick?: (event: PowerEvent) => void;
  /** Show as full-screen sensor nav map (satellite + routing + GPS) */
  fullscreen?: boolean;
}

interface SensorLocation {
  id: string;        // DOM element ID, e.g. "TRANSFORMER_1"
  deviceId: string;  // Backend device_id, e.g. "sambat_1"
  name: string;
  coords: [number, number];
  customers: string[];
}

// Transformers with mock customer data
const TRANSFORMERS: SensorLocation[] = [
  { id: 'TRANSFORMER_1', deviceId: 'sambat_1', name: 'Transformer 1', coords: [13.9479, 120.7097], customers: ['Rhomer', 'Robe', 'Julie Anne'] },
  { id: 'TRANSFORMER_2', deviceId: 'sambat_2', name: 'Transformer 2', coords: [13.9504, 120.7015], customers: ['Jasmine', 'Kim'] },
  { id: 'TRANSFORMER_3', deviceId: 'santol_1', name: 'Transformer 3', coords: [13.9466, 120.7039], customers: ['Joylene', 'Rhein', 'Nioko'] },
  { id: 'TRANSFORMER_4', deviceId: 'santol_2', name: 'Transformer 4', coords: [13.9456, 120.7090], customers: ['Mika', 'Nhezel'] },
];

// Lookup deviceId -> Transformer info
const transformerByDevice: Record<string, SensorLocation> = {};
TRANSFORMERS.forEach(t => { transformerByDevice[t.deviceId] = t; });

const DEFAULT_CENTER: [number, number] = [13.94, 120.73];

export default function Map({ events = [], fullscreen = false }: MapProps) {
  const mapRef = useRef<any>(null);
  const LRef = useRef<LeafletType | null>(null);
  const sensorMarkersRef = useRef<any[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const userMarkerRef = useRef<any>(null);
  const routingControlRef = useRef<any>(null);
  const infoPanelRef = useRef<HTMLDivElement | null>(null);
  const [ready, setReady] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [selectedTransformer, setSelectedTransformer] = useState<SensorLocation | null>(null);

  // Derive online/offline from backend events
  // A device is offline if it has an Active (unresolved) event
  const getSensorOnline = useCallback((deviceId: string): boolean => {
    const deviceEvents = events.filter(e =>
      (e.deviceId || (e as any).device_id || '').toLowerCase() === deviceId.toLowerCase()
    );
    return !deviceEvents.some(e => e.status === 'Active');
  }, [events]);

  // Build route to a transformer
  const buildRoute = useCallback((target: [number, number]) => {
    if (!userLocation || !mapRef.current) return;
    const L = LRef.current;
    if (!L) return;

    if (routingControlRef.current) {
      mapRef.current.removeControl(routingControlRef.current);
    }

    try {
      const Routing = (L as any).Routing;
      if (Routing && Routing.control) {
        routingControlRef.current = Routing.control({
          waypoints: [
            L.latLng(userLocation[0], userLocation[1]),
            L.latLng(target[0], target[1]),
          ],
          routeWhileDragging: false,
          addWaypoints: false,
          draggableWaypoints: false,
          lineOptions: {
            styles: [{ color: '#00BFFF', weight: 6, opacity: 0.9 }],
          },
          createMarker: () => null,
        }).addTo(mapRef.current);
      }
    } catch (e) {
      console.warn('Routing control error:', e);
    }
  }, [userLocation]);

  // Handle transformer click — show info + route
  const handleTransformerClick = useCallback((tf: SensorLocation) => {
    setSelectedTransformer(tf);

    if (!mapRef.current || !userLocation) return;
    const map = mapRef.current;

    // Zoom to transformer
    map.flyTo(tf.coords, 17, { duration: 1.2 });

    // Draw route
    setTimeout(() => {
      buildRoute(tf.coords);
    }, 800);

    // Return to user
    setTimeout(() => {
      map.flyTo(userLocation, 15, { duration: 1.5 });
    }, 3500);
  }, [userLocation, buildRoute]);

  // Initialize map once
  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current || mapRef.current) return;

    let isMounted = true;

    const initMap = async () => {
      try {
        const [leafletModule] = await Promise.all([
          import('leaflet'),
          import('leaflet-routing-machine'),
          new Promise<void>((resolve) => {
            if (document.getElementById('leaflet-css')) { resolve(); return; }
            const link = document.createElement('link');
            link.id = 'leaflet-css';
            link.rel = 'stylesheet';
            link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
            link.crossOrigin = '';
            link.onload = () => resolve();
            document.head.appendChild(link);
          }),
          new Promise<void>((resolve) => {
            if (document.getElementById('leaflet-rm-css')) { resolve(); return; }
            const link = document.createElement('link');
            link.id = 'leaflet-rm-css';
            link.rel = 'stylesheet';
            link.href = 'https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.css';
            link.crossOrigin = '';
            link.onload = () => resolve();
            document.head.appendChild(link);
          }),
        ]);

        if (!isMounted || !containerRef.current) return;

        const L = leafletModule.default || leafletModule;
        LRef.current = L;

        const map = L.map(containerRef.current, {
          zoomControl: fullscreen,
        });

        if (fullscreen) {
          L.tileLayer(
            'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
            { attribution: '&copy; Esri', maxZoom: 20 }
          ).addTo(map);
          L.tileLayer(
            'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
            { attribution: '&copy; Esri', maxZoom: 20 }
          ).addTo(map);
        } else {
          L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd', maxZoom: 20,
          }).addTo(map);
        }

        map.setView(DEFAULT_CENTER, fullscreen ? 14 : 13);
        mapRef.current = map;

        requestAnimationFrame(() => { map.invalidateSize(); });
        setReady(true);
      } catch (error) {
        console.error('Map initialization failed:', error);
      }
    };

    initMap();

    return () => {
      isMounted = false;
      if (routingControlRef.current && mapRef.current) {
        try { mapRef.current.removeControl(routingControlRef.current); } catch (e) {}
        routingControlRef.current = null;
      }
      if (mapRef.current) {
        try { mapRef.current.remove(); } catch (e) {}
        mapRef.current = null;
      }
      setReady(false);
    };
  }, [fullscreen]);

  // GPS geolocation
  useEffect(() => {
    if (!ready || !fullscreen || !mapRef.current) return;
    const L = LRef.current;
    if (!L) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setUserLocation(loc);
        if (!mapRef.current) return;
        mapRef.current.setView(loc, 15);
        if (userMarkerRef.current) mapRef.current.removeLayer(userMarkerRef.current);
        userMarkerRef.current = L.marker(loc)
          .addTo(mapRef.current)
          .bindPopup('📍 Your Location');
      },
      () => {
        setUserLocation(DEFAULT_CENTER);
        if (mapRef.current) mapRef.current.setView(DEFAULT_CENTER, 15);
      }
    );

    return () => {
      if (userMarkerRef.current && mapRef.current) {
        try { mapRef.current.removeLayer(userMarkerRef.current); } catch (e) {}
        userMarkerRef.current = null;
      }
    };
  }, [ready, fullscreen]);

  // Create / update transformer markers (fullscreen mode)
  useEffect(() => {
    if (!ready || !fullscreen || !mapRef.current) return;
    const map = mapRef.current;
    const L = LRef.current;
    if (!map || !L) return;

    // Clear existing markers
    sensorMarkersRef.current.forEach(m => {
      try { if (map.hasLayer(m)) m.remove(); } catch (e) {}
    });
    sensorMarkersRef.current = [];

    TRANSFORMERS.forEach((tf) => {
      const isOnline = getSensorOnline(tf.deviceId);

      const el = document.createElement('div');
      el.className = 'location-wrapper' + (isOnline ? '' : ' offline');
      el.id = tf.id;

      el.innerHTML = `
        <div class="location-card">
          <div class="location-title">${tf.name}</div>
          <div class="location-desc">${isOnline ? '✅ Online' : '🔴 Outage'}</div>
        </div>
        <div class="location-pin"></div>
      `;

      el.onclick = () => handleTransformerClick(tf);

      const marker = L.marker(tf.coords, {
        icon: L.divIcon({
          className: '',
          html: el,
          iconSize: [240, 80],
          iconAnchor: [120, 80],
        }),
      }).addTo(map);

      sensorMarkersRef.current.push(marker);
    });
  }, [ready, fullscreen, handleTransformerClick, getSensorOnline]);

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className={fullscreen ? 'w-full h-full' : 'w-full h-full min-h-[500px]'} />

      {/* Transformer Info Panel */}
      {selectedTransformer && (
        <div className="absolute top-4 right-4 z-[1000] bg-[#0C1119]/90 backdrop-blur-md border border-[#273953] rounded-2xl p-5 w-72 shadow-2xl">
          {/* Close button */}
          <button
            onClick={() => setSelectedTransformer(null)}
            className="absolute top-3 right-3 text-gray-400 hover:text-white text-lg leading-none"
          >
            ✕
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-3 h-3 rounded-full ${getSensorOnline(selectedTransformer.deviceId) ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.7)]' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.7)] animate-pulse'}`} />
            <div>
              <h3 className="text-white font-bold text-lg">{selectedTransformer.name}</h3>
              <span className={`text-xs font-medium ${getSensorOnline(selectedTransformer.deviceId) ? 'text-green-400' : 'text-red-400'}`}>
                {getSensorOnline(selectedTransformer.deviceId) ? '● Online' : '● Outage Detected'}
              </span>
            </div>
          </div>

          {/* Coordinates */}
          <div className="text-xs text-gray-500 mb-3 font-mono">
            {selectedTransformer.coords[0].toFixed(4)}, {selectedTransformer.coords[1].toFixed(4)}
          </div>

          {/* Affected Customers */}
          <div className="border-t border-[#273953] pt-3">
            <h4 className="text-gray-300 text-sm font-semibold mb-2">
              <i className="fas fa-users mr-2 text-gray-500"></i>
              Affected Customers
            </h4>
            <div className="flex flex-wrap gap-2">
              {selectedTransformer.customers.map((name, i) => (
                <span key={i} className="bg-[#1F314F] text-gray-200 text-xs px-3 py-1.5 rounded-full border border-[#3E5D88]">
                  {name}
                </span>
              ))}
            </div>
          </div>

          {/* Route button */}
          {userLocation && (
            <button
              onClick={() => {
                const map = mapRef.current;
                if (!map) return;
                map.flyTo(selectedTransformer.coords, 17, { duration: 1.2 });
                setTimeout(() => buildRoute(selectedTransformer.coords), 800);
              }}
              className="mt-4 w-full py-2.5 bg-[#1F314F] hover:bg-[#2A4568] text-white text-sm font-medium rounded-xl border border-[#3E5D88] transition-colors"
            >
              <i className="fas fa-route mr-2"></i>
              Navigate to {selectedTransformer.name}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
