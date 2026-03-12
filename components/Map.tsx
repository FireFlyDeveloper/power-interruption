'use client';

import { useEffect, useRef, useState } from 'react';
import { PowerEvent } from '@/types';

// Define L type for refs
type LeafletType = typeof import('leaflet');

interface MapProps {
  events: PowerEvent[];
  onMarkerClick: (event: PowerEvent) => void;
}

const markerColors = {
  Active: { border: '#dc2626', bg: '#fee2e2' },
  Investigating: { border: '#d97706', bg: '#fef3c7' },
  Resolved: { border: '#059669', bg: '#d1fae5' }
};

// Generate a small random offset to prevent marker overlap
const getMarkerOffset = (index: number) => {
  const offsets = [
    { x: 0, y: 0 },
    { x: 0.0003, y: 0.0003 },
    { x: -0.0003, y: 0.0003 },
    { x: 0.0003, y: -0.0003 },
    { x: -0.0003, y: -0.0003 },
    { x: 0.0002, y: -0.0004 },
    { x: -0.0002, y: 0.0004 },
  ];
  return offsets[index % offsets.length];
};

export default function Map({ events, onMarkerClick }: MapProps) {
  const mapRef = useRef<any>(null);
  const LRef = useRef<LeafletType | null>(null);
  const markersRef = useRef<any[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const markersInitialized = useRef(false);

  useEffect(() => {
    // Guard: Only run in browser
    if (typeof window === 'undefined' || !containerRef.current || mapRef.current) {
      return;
    }

    let isMounted = true;

    const initMap = async () => {
      try {
        // Dynamically import both Leaflet and its CSS
        const [leafletModule] = await Promise.all([
          import('leaflet'),
          // Dynamically inject CSS
          new Promise<void>((resolve) => {
            if (document.getElementById('leaflet-css')) {
              resolve();
              return;
            }
            const link = document.createElement('link');
            link.id = 'leaflet-css';
            link.rel = 'stylesheet';
            link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
            link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
            link.crossOrigin = '';
            link.onload = () => resolve();
            document.head.appendChild(link);
          })
        ]);

        if (!isMounted || !containerRef.current) return;

        const L = leafletModule.default || leafletModule;
        LRef.current = L;

        // Initialize map
        const map = L.map(containerRef.current, {
          zoomControl: false
        }).setView([13.9394, 120.7336], 13);

        L.control.zoom({
          position: 'topright'
        }).addTo(map);

        // Light map style - CartoDB Voyager
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: 'abcd',
          maxZoom: 20
        }).addTo(map);

        mapRef.current = map;
        setIsMapReady(true);

      } catch (error) {
        console.error('Map initialization failed:', error);
      }
    };

    initMap();

    return () => {
      isMounted = false;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update markers when map becomes ready - only do this once
  useEffect(() => {
    const map = mapRef.current;
    const L = LRef.current;

    if (!map || !L || !isMapReady || markersInitialized.current) return;

    markersInitialized.current = true;

    // Add markers
    events.forEach((event, index) => {
      const colors = markerColors[event.status];
      const offset = getMarkerOffset(index);
      const lat = event.lat + offset.y;
      const lng = event.lng + offset.x;
      
      const icon = L.divIcon({
        className: 'custom-div-icon',
        html: `
          <div style="
            background-color: ${colors.bg}; 
            border: 3px solid ${colors.border}; 
            width: 28px; height: 28px; 
            border-radius: 50%; 
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
            display: flex; align-items: center; justify-content: center;
          ">
            <div style="width: 10px; height: 10px; background: ${colors.border}; border-radius: 50%;"></div>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        popupAnchor: [0, -14]
      });

      const marker = L.marker([lat, lng], { icon }).addTo(map);

      const popupContent = `
        <div class="text-sm" style="min-width: 150px;">
          <div style="font-weight: 700; font-size: 1rem; margin-bottom: 4px; color: #1f2937;">${event.id} - ${event.location}</div>
          <div style="color: #6b7280; margin-bottom: 4px; font-size: 0.875rem;">${event.status} | ${event.severity}</div>
          <div style="color: #9ca3af; font-size: 0.75rem;">Grid: ${event.grid}</div>
          <div style="color: #9ca3af; font-size: 0.75rem;">Duration: ${event.duration}</div>
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.on('click', () => onMarkerClick(event));
      
      markersRef.current.push(marker);
    });
  }, [isMapReady, events, onMarkerClick]);

  return (
    <div 
      ref={containerRef} 
      className="flex-1 w-full h-full relative bg-[#f5f5f5]"
      style={{ minHeight: '300px' }}
    />
  );
}