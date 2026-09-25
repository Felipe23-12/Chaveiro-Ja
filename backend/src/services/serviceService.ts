// Mock database - em produção usar banco real
const services = new Map();
let serviceId = 1;

export interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  icon?: string;
  active: boolean;
  created_at: Date;
  updated_at: Date;
}

// ============================================
// INITIALIZE DEFAULT SERVICES
// ============================================

const initializeDefaultServices = () => {
  const defaultServices = [
    // RESIDENCIAL
    {
      name: 'Abertura Simples',
      description: 'Abertura de porta com fechadura comum',
      category: 'Residencial',
      icon: 'door-open',
    },
    {
      name: 'Abertura Tetra',
      description: 'Abertura de porta com fechadura tetra',
      category: 'Residencial',
      icon: 'lock',
    },
    {
      name: 'Abertura Eletrônica',
      description: 'Abertura de fechadura eletrônica',
      category: 'Residencial',
      icon: 'electronic',
    },
    // AUTOMOTIVO
    {
      name: 'Confecção de Chave de Moto',
      description: 'Fabricação de chave para motocicleta',
      category: 'Automotivo',
      icon: 'motorcycle-key',
    },
    {
      name: 'Confecção de Chave de Carro',
      description: 'Fabricação de chave para automóvel',
      category: 'Automotivo',
      icon: 'car-key',
    },
  ];

  defaultServices.forEach((service) => {
    const id = String(serviceId++);
    services.set(id, {
      id,
      ...service,
      active: true,
      created_at: new Date(),
      updated_at: new Date(),
    });
  });
};

// Initialize on module load
initializeDefaultServices();

// ============================================
// GET ALL SERVICES
// ============================================

export const getAllServices = async (): Promise<Service[]> => {
  return Array.from(services.values()).filter((s) => s.active);
};

// ============================================
// GET SERVICE BY ID
// ============================================

export const getServiceById = async (serviceId: string): Promise<Service | null> => {
  const service = services.get(serviceId);
  return service && service.active ? service : null;
};

// ============================================
// CREATE SERVICE
// ============================================

export const createService = async (
  name: string,
  description: string,
  category: string,
  icon?: string
): Promise<Service> => {
  const id = String(serviceId++);
  const service: Service = {
    id,
    name,
    description,
    category,
    icon,
    active: true,
    created_at: new Date(),
    updated_at: new Date(),
  };

  services.set(id, service);
  return service;
};

// ============================================
// UPDATE SERVICE
// ============================================

export const updateService = async (
  id: string,
  data: Partial<Service>
): Promise<Service> => {
  const service = services.get(id);

  if (!service) {
    throw new Error('Serviço não encontrado');
  }

  const updated: Service = {
    ...service,
    ...data,
    id,
    updated_at: new Date(),
  };

  services.set(id, updated);
  return updated;
};

// ============================================
// DELETE SERVICE
// ============================================

export const deleteService = async (id: string): Promise<void> => {
  const service = services.get(id);

  if (!service) {
    throw new Error('Serviço não encontrado');
  }

  service.active = false;
  services.set(id, service);
};

// ============================================
// GET SERVICES BY CATEGORY
// ============================================

export const getServicesByCategory = async (category: string): Promise<Service[]> => {
  return Array.from(services.values()).filter((s) => s.active && s.category === category);
};
