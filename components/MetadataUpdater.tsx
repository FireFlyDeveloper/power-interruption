'use client';

import { useEffect, useState } from 'react';
import { useMetadata } from '@/context/MetadataContext';

interface MetadataUpdaterProps {
  onMetadataLoaded?: (data: { siteName: string; siteDescription: string; location: string }) => void;
}

export function MetadataUpdater({ onMetadataLoaded }: MetadataUpdaterProps) {
  const { metadata, loading } = useMetadata();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!loading && metadata && onMetadataLoaded) {
      onMetadataLoaded({
        siteName: metadata.siteName ?? metadata.name,
        siteDescription: metadata.description,
        location: metadata.location,
      });
    }
  }, [loading, metadata, onMetadataLoaded]);

  // This component doesn't render anything - it just manages metadata side effects
  if (!mounted) return null;
  
  return null;
}
