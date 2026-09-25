// Mock database - em produção usar banco real
const customerProfiles = new Map();

export interface CustomerProfile {
  id: string;
  user_id: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  latitude?: number;
  longitude?: number;
  document_type?: string;
  document?: string;
  birthdate?: string;
  profile_complete: boolean;
  created_at: Date;
  updated_at: Date;
}

// ============================================
// CREATE CUSTOMER PROFILE
// ============================================

export const createCustomerProfile = async (userId: string): Promise<CustomerProfile> => {
  const profile: CustomerProfile = {
    id: `cp_${Date.now()}`,
    user_id: userId,
    profile_complete: false,
    created_at: new Date(),
    updated_at: new Date(),
  };

  customerProfiles.set(profile.id, profile);
  return profile;
};

// ============================================
// GET CUSTOMER PROFILE BY USER ID
// ============================================

export const getCustomerProfileByUserId = async (
  userId: string
): Promise<CustomerProfile | null> => {
  const profiles = Array.from(customerProfiles.values()) as CustomerProfile[];
  return profiles.find((p) => p.user_id === userId) || null;
};

// ============================================
// UPDATE CUSTOMER PROFILE
// ============================================

export const updateCustomerProfile = async (
  userId: string,
  data: Partial<CustomerProfile>
): Promise<CustomerProfile> => {
  const profile = await getCustomerProfileByUserId(userId);

  if (!profile) {
    throw new Error('Perfil não encontrado');
  }

  const updated: CustomerProfile = {
    ...profile,
    ...data,
    updated_at: new Date(),
    profile_complete: !!(
      profile.address &&
      profile.city &&
      profile.state &&
      profile.postal_code &&
      profile.document_type &&
      profile.document &&
      profile.birthdate
    ),
  };

  customerProfiles.set(profile.id, updated);
  return updated;
};

// ============================================
// COMPLETE CUSTOMER PROFILE
// ============================================

export const completeCustomerProfile = async (
  userId: string,
  data: {
    address: string;
    city: string;
    state: string;
    postal_code: string;
    latitude: number;
    longitude: number;
    document_type: string;
    document: string;
    birthdate: string;
  }
): Promise<CustomerProfile> => {
  const profile = await getCustomerProfileByUserId(userId);

  if (!profile) {
    throw new Error('Perfil não encontrado');
  }

  const updated: CustomerProfile = {
    ...profile,
    ...data,
    profile_complete: true,
    updated_at: new Date(),
  };

  customerProfiles.set(profile.id, updated);
  return updated;
};
