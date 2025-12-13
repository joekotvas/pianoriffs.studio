import { useState, useEffect } from 'react';
import { isSamplerLoaded } from '@/engines/toneEngine';

/**
 * Manages the loading state of the Tone.js sampler.
 * Polls the sampler status periodically until loaded.
 */
export function useSamplerStatus() {
  const [loaded, setLoaded] = useState(false);
  
  useEffect(() => {
    const checkSampler = () => setLoaded(isSamplerLoaded());
    checkSampler();
    const interval = setInterval(checkSampler, 500);
    return () => clearInterval(interval);
  }, []);

  return loaded;
}
