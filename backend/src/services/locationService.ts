// Mock database - em produção usar Redis
const locationUpdates = new Map();

export interface LocationUpdate {
  id: string;
  locksmith_id: string;
  job_id: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: Date;
}

// ============================================
// UPDATE LOCKSMITH LOCATION
// ============================================

export const updateLocksmithLocation = async (
  locksmithId: string,
  jobId: string,
  latitude: number,
  longitude: number,
  accuracy?: number
): Promise<LocationUpdate> => {
  const id = `${locksmithId}_${jobId}_${Date.now()}`;
  const update: LocationUpdate = {
    id,
    locksmith_id: locksmithId,
    job_id: jobId,
    latitude,
    longitude,
    accuracy,
    timestamp: new Date(),
  };

  // Manter apenas as últimas 100 atualizações por chaveiro
  const key = `locations_${locksmithId}`;
  let updates = locationUpdates.get(key) || [];
  updates.push(update);
  updates = updates.slice(-100);
  locationUpdates.set(key, updates);

  return update;
};

// ============================================
// GET LATEST LOCATION
// ============================================

export const getLatestLocation = async (
  locksmithId: string
): Promise<LocationUpdate | null> => {
  const key = `locations_${locksmithId}`;
  const updates = locationUpdates.get(key) || [];
  return updates.length > 0 ? updates[updates.length - 1] : null;
};

// ============================================
// GET LOCATION HISTORY
// ============================================

export const getLocationHistory = async (
  locksmithId: string,
  limit: number = 50
): Promise<LocationUpdate[]> => {
  const key = `locations_${locksmithId}`;
  const updates = locationUpdates.get(key) || [];
  return updates.slice(-limit);
};

// ============================================
// CALCULATE DISTANCE (Haversine)
// ============================================

export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// ============================================
// CALCULATE ETA
// ============================================

export const calculateETA = (
  distanceKm: number,
  speedKmH: number = 40
): number => {
  // Retorna ETA em minutos
  return Math.round((distanceKm / speedKmH) * 60);
};

// ============================================
// GET DISTANCE TO CUSTOMER
// ============================================

export const getDistanceToCustomer = async (
  locksmithId: string,
  customerLatitude: number,
  customerLongitude: number
): Promise<{
  distance_km: number;
  eta_minutes: number;
}> => {
  const location = await getLatestLocation(locksmithId);

  if (!location) {
    throw new Error('Localização do chaveiro não encontrada');
  }

  const distance = calculateDistance(
    location.latitude,
    location.longitude,
    customerLatitude,
    customerLongitude
  );

  const eta = calculateETA(distance);

  return {
    distance_km: Math.round(distance * 10) / 10,
    eta_minutes: eta,
  };
};
