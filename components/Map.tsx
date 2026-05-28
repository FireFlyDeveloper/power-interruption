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
  id: string;
  name: string;
  coords: [number, number];
}

// Balayan sensor locations
const SENSOR_LOCATIONS: SensorLocation[] = [
  { id: 'SAMBAT_1', name: 'SAMBAT Sensor 1', coords: [13.9478889, 120.7096667] },
  { id: 'SAMBAT_2', name: 'SAMBAT Sensor 2', coords: [13.9503889, 120.7015000] },
  { id: 'SANTOL_1', name: 'SANTOL Sensor 1', coords: [13.9465833, 120.7039444] },
  { id: 'SANTOL_2', name: 'SANTOL Sensor 2', coords: [13.9455833, 120.7089999] },
];

const DEFAULT_CENTER: [number, number] = [13.94, 120.73];
const DEFAULT_ZOOM = 14;

export default function Map({ events = [], onMarkerClick, fullscreen = false }: MapProps) {
  const mapRef = useRef<any>(null);
  const LRef = useRef<LeafletType | null>(null);
  const markersRef = useRef<any[]>([]);
  const sensorMarkersRef = useRef<any[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const userMarkerRef = useRef<any>(null);
  const routingControlRef = useRef<any>(null);
  const [ready, setReady] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [statusMap, setStatusMap] = useState<Record<string, boolean>>({});

  // Public method: set a sensor's online/offline status
  const setSensorStatus = useCallback((id: string, isOnline: boolean) => {
    setStatusMap(prev => ({ ...prev, [id]: isOnline }));
  }, []);

  // Expose setSensorStatus globally for MQTT/WebSocket updates
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).__setSensorStatus = setSensorStatus;
    }
    return () => {
      if (typeof window !== 'undefined') {
        delete (window as any).__setSensorStatus;
      }
    };
  }, [setSensorStatus]);

  // Build route to a sensor
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

  // Handle sensor marker click
  const handleSensorClick = useCallback((coords: [number, number]) => {
    if (!mapRef.current || !userLocation) return;

    const map = mapRef.current;

    // STEP 1: zoom to sensor
    map.flyTo(coords, 17, { duration: 1.2 });

    // STEP 2: draw route
    setTimeout(() => {
      buildRoute(coords);
    }, 800);

    // STEP 3: return to user location
    setTimeout(() => {
      map.flyTo(userLocation, 15, { duration: 1.5 });
    }, 3000);
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
            if (document.getElementById('leaflet-css')) {
              resolve();
              return;
            }
            const link = document.createElement('link');
            link.id = 'leaflet-css';
            link.rel = 'stylesheet';
            link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
            link.crossOrigin = '';
            link.onload = () => resolve();
            document.head.appendChild(link);
          }),
          new Promise<void>((resolve) => {
            if (document.getElementById('leaflet-rm-css')) {
              resolve();
              return;
            }
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
          // Satellite view for fullscreen mode
          L.tileLayer(
            'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
            {
              attribution: '&copy; Esri',
              maxZoom: 20,
            }
          ).addTo(map);

          // Labels overlay
          L.tileLayer(
            'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
            {
              attribution: '&copy; Esri',
              maxZoom: 20,
            }
          ).addTo(map);
        } else {
          // Street map for dashboard
          L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 20,
          }).addTo(map);
        }

        map.setView(DEFAULT_CENTER, fullscreen ? 14 : 13);
        mapRef.current = map;

        requestAnimationFrame(() => {
          map.invalidateSize();
        });

        setReady(true);
      } catch (error) {
        console.error('Map initialization failed:', error);
      }
    };

    initMap();

    return () => {
      isMounted = false;
      if (routingControlRef.current && mapRef.current) {
        try {
          mapRef.current.removeControl(routingControlRef.current);
        } catch (e) {}
        routingControlRef.current = null;
      }
      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch (e) {}
        mapRef.current = null;
      }
      setReady(false);
    };
  }, [fullscreen]);

  // GPS geolocation (fullscreen mode)
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

        // Add user location marker
        if (userMarkerRef.current) {
          mapRef.current.removeLayer(userMarkerRef.current);
        }
        userMarkerRef.current = L.marker(loc)
          .addTo(mapRef.current)
          .bindPopup('📍 Your Location');
      },
      () => {
        // Fallback to Balayan center
        setUserLocation(DEFAULT_CENTER);
        if (mapRef.current) {
          mapRef.current.setView(DEFAULT_CENTER, 15);
        }
      }
    );

    return () => {
      if (userMarkerRef.current && mapRef.current) {
        try {
          mapRef.current.removeLayer(userMarkerRef.current);
        } catch (e) {}
        userMarkerRef.current = null;
      }
    };
  }, [ready, fullscreen]);

  // Create sensor markers (fullscreen mode)
  useEffect(() => {
    if (!ready || !fullscreen || !mapRef.current) return;
    const map = mapRef.current;
    const L = LRef.current;
    if (!map || !L) return;

    // Clear existing sensor markers
    sensorMarkersRef.current.forEach(m => {
      try { if (map.hasLayer(m)) m.remove(); } catch (e) {}
    });
    sensorMarkersRef.current = [];

    SENSOR_LOCATIONS.forEach((loc) => {
      const el = document.createElement('div');
      el.className = 'location-wrapper';
      el.id = loc.id;

      el.innerHTML = `
        <div class="location-card">
          <div class="location-title">${loc.name}</div>
          <div class="location-desc">${loc.id}</div>
        </div>
        <div class="location-pin"></div>
      `;

      el.onclick = () => handleSensorClick(loc.coords);

      const marker = L.marker(loc.coords, {
        icon: L.divIcon({
          className: '',
          html: el,
          iconSize: [240, 80],
          iconAnchor: [120, 80],
        }),
      }).addTo(map);

      sensorMarkersRef.current.push(marker);
    });
  }, [ready, fullscreen, handleSensorClick]);

  // Update sensor status visuals
  useEffect(() => {
    for (const [id, isOnline] of Object.entries(statusMap)) {
      const el = document.getElementById(id);
      if (!el) continue;
      el.classList.toggle('offline', !isOnline);
    }
  }, [statusMap]);

  // Event markers for non-fullscreen mode
  useEffect(() => {
    if (!ready || fullscreen) return;
    const map = mapRef.current;
    const L = LRef.current;
    if (!map || !L) return;

    // Clear existing event markers
    markersRef.current.forEach(marker => {
      try { if (map.hasLayer(marker)) marker.remove(); } catch (e) {}
    });
    markersRef.current = [];

    const markerColors: Record<string, { border: string; bg: string }> = {
      Active: { border: '#dc2626', bg: '#fee2e2' },
      Investigating: { border: '#d97706', bg: '#fef3c7' },
      Resolved: { border: '#047857', bg: '#a7f3d0' },
    };

    const getClusteredOffset = (index: number, total: number): [number, number] => {
      if (total <= 1) return [0, 0];
      const offsets: [number, number][] = [
        [0, 0], [0.0004, 0.0004], [-0.0004, 0.0004],
        [0.0004, -0.0004], [-0.0004, -0.0004],
      ];
      return offsets[index % offsets.length];
    };

    events.forEach((event, index) => {
      const colors = markerColors[event.status] || markerColors.Active;
      const [offsetX, offsetY] = getClusteredOffset(index, events.length);
      const lat = event.lat + offsetY;
      const lng = event.lng + offsetX;

      const icon = L.divIcon({
        className: 'custom-div-icon',
        html: `
          <div style="
            background-color: ${colors.bg}; 
            border: 3px solid ${colors.border}; 
            width: 32px; height: 32px; 
            border-radius: 50%; 
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
            display: flex; align-items: center; justify-content: center;
            cursor: pointer;
          ">
            <div style="width: 12px; height: 12px; background: ${colors.border}; border-radius: 50%;"></div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16],
      });

      const marker = L.marker([lat, lng], { icon }).addTo(map);
      const popupContent = `
        <div style="min-width: 180px; font-family: var(--font-poppins, sans-serif);">
          <div style="font-weight: 700; font-size: 1rem; margin-bottom: 6px; color: #1f2937;">${event.id} - ${event.location}</div>
          <div style="color: #6b7280; margin-bottom: 4px; font-size: 0.875rem;">
            <span style="color: ${colors.border}; font-weight: 600;">${event.status}</span> | ${event.severity}
          </div>
          <div style="color: #9ca3af; font-size: 0.75rem;">Duration: ${event.duration}</div>
        </div>
      `;
      marker.bindPopup(popupContent);
      if (onMarkerClick) {
        marker.on('click', () => onMarkerClick(event));
      }
      markersRef.current.push(marker);
    });
  }, [events, ready, fullscreen, onMarkerClick]);

  return (
    <div
      ref={containerRef}
      className={fullscreen ? 'w-full h-full' : 'w-full h-full min-h-[500px]'}
    />
  );
}
