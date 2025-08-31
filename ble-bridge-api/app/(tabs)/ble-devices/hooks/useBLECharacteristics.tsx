import { useState, useEffect } from 'react';
import { BLEDeviceInfo } from '@/services/BLEService';
import { BridgeService } from '@/services/BridgeService';

export const useBLECharacteristics = (
  connectedDevice: BLEDeviceInfo | null,
  bridgeService: BridgeService | null
) => {
  const [characteristics, setCharacteristics] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadCharacteristics = async () => {
      if (connectedDevice && bridgeService) {
        setLoading(true);
        try {
          const services = await bridgeService.getBLEService().getServices();
          if (services.length > 0) {
            const chars = await bridgeService.getBLEService().getCharacteristics(services[0].uuid);
            setCharacteristics(chars);
          }
        } catch (error) {
          console.warn('Could not fetch services/characteristics:', error);
          setCharacteristics([]);
        } finally {
          setLoading(false);
        }
      } else {
        setCharacteristics([]);
        setLoading(false);
      }
    };

    loadCharacteristics();
  }, [connectedDevice, bridgeService]);

  return { characteristics, loading };
};
