// Mock database - em produção usar banco real
const locksmithProfiles = new Map();

export interface LocksmithProfile {
  id: string;
  user_id: string;
  company_name?: string;
  phone?: string;
  description?: string;
  years_experience?: number;
  rating: number;
  reviews_count: number;
  latitude?: number;
  longitude?: number;
  service_radius_km?: number;
  hourly_rate?: number;
  document_type?: string;
  document?: string;
  document_verified: boolean;
  bank_account?: string;
  status: 'online' | 'offline' | 'blocked';
  profile_complete: boolean;
  created_at: Date;
  updated_at: Date;
}

// ============================================
// CREATE LOCKSMITH PROFILE
// ============================================

export const createLocksmithProfile = async (userId: string): Promise<LocksmithProfile> => {
  const profile: LocksmithProfile = {
    id: `lp_${Date.now()}`,
    user_id: userId,
    rating: 0,
    reviews_count: 0,
    document_verified: false,
    status: 'offline',
    profile_complete: false,
    created_at: new Date(),
    updated_at: new Date(),
  };

  locksmithProfiles.set(profile.id, profile);
  return profile;
};

// ============================================
// GET LOCKSMITH PROFILE BY USER ID
// ============================================

export const getLocksmithProfileByUserId = async (
  userId: string
): Promise<LocksmithProfile | null> => {
  const profiles = Array.from(locksmithProfiles.values()) as LocksmithProfile[];
  return profiles.find((p) => p.user_id === userId) || null;
};

// ============================================
// UPDATE LOCKSMITH PROFILE
// ============================================

export const updateLocksmithProfile = async (
  userId: string,
  data: Partial<LocksmithProfile>
): Promise<LocksmithProfile> => {
  const profile = await getLocksmithProfileByUserId(userId);

  if (!profile) {
    throw new Error('Perfil não encontrado');
  }

  const updated: LocksmithProfile = {
    ...profile,
    ...data,
    updated_at: new Date(),
    profile_complete: !!(
      profile.company_name &&
      profile.phone &&
      profile.description &&
      profile.years_experience &&
      profile.latitude &&
      profile.longitude &&
      profile.service_radius_km &&
      profile.hourly_rate &&
      profile.document_verified &&
      profile.bank_account
    ),
  };

  locksmithProfiles.set(profile.id, updated);
  return updated;
};

// ============================================
// UPDATE LOCKSMITH STATUS
// ============================================

export const updateLocksmithStatus = async (
  userId: string,
  status: 'online' | 'offline' | 'blocked'
): Promise<LocksmithProfile> => {
  const profile = await getLocksmithProfileByUserId(userId);

  if (!profile) {
    throw new Error('Perfil não encontrado');
  }

  const updated: LocksmithProfile = {
    ...profile,
    status,
    updated_at: new Date(),
  };

  locksmithProfiles.set(profile.id, updated);
  return updated;
};

// ============================================
// VERIFY LOCKSMITH DOCUMENTS
// ============================================

export const verifyLocksmithDocuments = async (
  userId: string,
  documentType: string,
  documentNumber: string
): Promise<LocksmithProfile> => {
  const profile = await getLocksmithProfileByUserId(userId);

  if (!profile) {
    throw new Error('Perfil não encontrado');
  }

  const updated: LocksmithProfile = {
    ...profile,
    document_type: documentType,
    document: documentNumber,
    document_verified: true,
    updated_at: new Date(),
  };

  locksmithProfiles.set(profile.id, updated);
  return updated;
};

// ============================================
// GET ALL LOCKSMITHS NEARBY
// ============================================

export const getLocksmiths = async (
  latitude: number,
  longitude: number,
  maxDistance: number = 15
): Promise<LocksmithProfile[]> => {
  const profiles = Array.from(locksmithProfiles.values()) as LocksmithProfile[];

  return profiles.filter((p) => {
    if (!p.latitude || !p.longitude || p.status === 'offline') return false;

    // Haversine distance formula
    const R = 6371; // Earth radius in km
    const dLat = ((p.latitude - latitude) * Math.PI) / 180;
    const dLon = ((p.longitude - longitude) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((latitude * Math.PI) / 180) *
        Math.cos((p.latitude * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance <= maxDistance && p.profile_complete;
  });
};

// ============================================
// RATE LOCKSMITH
// ============================================

export const rateLocksmith = async (
  userId: string,
  rating: number
): Promise<LocksmithProfile> => {
  const profile = await getLocksmithProfileByUserId(userId);

  if (!profile) {
    throw new Error('Perfil não encontrado');
  }

  // Calcular nova média de avaliação
  const newRating =
    (profile.rating * profile.reviews_count + rating) / (profile.reviews_count + 1);

  const updated: LocksmithProfile = {
    ...profile,
    rating: parseFloat(newRating.toFixed(1)),
    reviews_count: profile.reviews_count + 1,
    updated_at: new Date(),
  };

  locksmithProfiles.set(profile.id, updated);
  return updated;
};
