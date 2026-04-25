'use client';

import { useEffect, useRef, useState } from 'react';
import { PowerEvent } from '@/types';

type LeafletType = typeof import('leaflet');

interface MapProps {
  events: PowerEvent[];
  onMarkerClick: (event: PowerEvent) => void;
}

const markerColors: Record<string, { border: string; bg: string }> = {
  Active: { border: '#dc2626', bg: '#fee2e2' },
  Investigating: { border: '#d97706', bg: '#fef3c7' },
  Resolved: { border: '#047857', bg: '#a7f3d0' }
};

// Cluster nearby events to prevent overlap
const getClusteredOffset = (index: number, total: number): [number, number] => {
  if (total <= 1) return [0, 0];
  
  const offsets: [number, number][] = [
    [0, 0],
    [0.0004, 0.0004],
    [-0.0004, 0.0004],
    [0.0004, -0.0004],
    [-0.0004, -0.0004],
  ];
  
  return offsets[index % offsets.length];
};

export default function Map({ events, onMarkerClick }: MapProps) {
  const mapRef = useRef<any>(null);
  const LRef = useRef<LeafletType | null>(null);
  const markersRef = useRef<any[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  // Initialize map once
  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current || mapRef.current) {
      return;
    }

    let isMounted = true;

    const initMap = async () => {
      try {
        const [leafletModule] = await Promise.all([
          import('leaflet'),
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

        const map = L.map(containerRef.current, {
          zoomControl: true
        }).setView([13.9394, 120.7336], 13);

        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: 'abcd',
          maxZoom: 20
        }).addTo(map);

        mapRef.current = map;

        // Fix for flex/grid layout containers — invalidate size after mount
        // to ensure the map properly measures its container dimensions
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
      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch (e) {
          // Map may already be removed
        }
        mapRef.current = null;
      }
      setReady(false);
    };
  }, []);

  // Create/update markers when events change
  useEffect(() => {
    if (!ready) return;
    
    const map = mapRef.current;
    const L = LRef.current;
    
    if (!map || !L) return;

    // Clear existing markers
    markersRef.current.forEach(marker => {
      try {
        if (map.hasLayer(marker)) {
          marker.remove();
        }
      } catch (e) {
        // Marker may already be removed
      }
    });
    markersRef.current = [];

    // Create new markers with clustering
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
        popupAnchor: [0, -16]
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
      
      marker.on('click', () => {
        onMarkerClick(event);
      });
      
      markersRef.current.push(marker);
    });
  }, [events, onMarkerClick]);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full min-h-[500px]"
    />
  );
}
