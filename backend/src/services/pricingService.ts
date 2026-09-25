// Mock database - em produção usar banco real
const servicePrices = new Map();
const pricingRules = new Map();
let ruleId = 1;

export const COMMISSION_RATE = 0.15; // 15% taxa do Chaveiro Já

export interface ServicePrice {
  service_id: string;
  base_price: number;
  currency: string;
  active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface PricingRule {
  id: string;
  name: string;
  service_id?: string; // se undefined, aplica a todos
  condition: 'time_of_day' | 'weather' | 'urgency' | 'region';
  multiplier: number; // 1.0 = sem mudança, 1.2 = 20% mais caro
  active: boolean;
  created_at: Date;
  updated_at: Date;
}

// ============================================
// INITIALIZE DEFAULT PRICES
// ============================================

const initializeDefaultPrices = () => {
  const prices = [
    { service_id: '1', base_price: 130 }, // Abertura Simples
    { service_id: '2', base_price: 160 }, // Abertura Tetra
    { service_id: '3', base_price: 200 }, // Abertura Eletrônica
    { service_id: '4', base_price: 150 }, // Confecção de Chave de Moto
    { service_id: '5', base_price: 200 }, // Confecção de Chave de Carro
  ];

  prices.forEach(({ service_id, base_price }) => {
    servicePrices.set(service_id, {
      service_id,
      base_price,
      currency: 'BRL',
      active: true,
      created_at: new Date(),
      updated_at: new Date(),
    });
  });
};

initializeDefaultPrices();

// ============================================
// GET PRICE FOR SERVICE
// ============================================

export const getServicePrice = async (serviceId: string): Promise<ServicePrice | null> => {
  return servicePrices.get(serviceId) || null;
};

// ============================================
// SET SERVICE PRICE
// ============================================

export const setServicePrice = async (
  serviceId: string,
  basePrice: number
): Promise<ServicePrice> => {
  const existing = servicePrices.get(serviceId);

  const price: ServicePrice = {
    service_id: serviceId,
    base_price: basePrice,
    currency: 'BRL',
    active: true,
    created_at: existing?.created_at || new Date(),
    updated_at: new Date(),
  };

  servicePrices.set(serviceId, price);
  return price;
};

// ============================================
// CALCULATE PRICE WITH RULES
// ============================================

export const calculatePrice = async (
  serviceId: string,
  options?: {
    timeOfDay?: 'normal' | 'night' | 'holiday';
    weather?: 'clear' | 'rain';
    urgency?: 'normal' | 'urgent';
    region?: string;
  }
): Promise<{ base_price: number; applied_rules: string[]; final_price: number }> => {
  const servicePrice = await getServicePrice(serviceId);

  if (!servicePrice) {
    throw new Error('Serviço não encontrado');
  }

  let multiplier = 1.0;
  const appliedRules: string[] = [];

  // Get applicable rules
  const rules = Array.from(pricingRules.values()).filter(
    (r) => r.active && (!r.service_id || r.service_id === serviceId)
  );

  // Apply rules based on options
  if (options?.timeOfDay === 'night') {
    const nightRule = rules.find((r) => r.condition === 'time_of_day' && r.name.includes('Noite'));
    if (nightRule) {
      multiplier *= nightRule.multiplier;
      appliedRules.push(nightRule.name);
    }
  }

  if (options?.weather === 'rain') {
    const rainRule = rules.find((r) => r.condition === 'weather' && r.name.includes('Chuva'));
    if (rainRule) {
      multiplier *= rainRule.multiplier;
      appliedRules.push(rainRule.name);
    }
  }

  if (options?.urgency === 'urgent') {
    const urgencyRule = rules.find((r) => r.condition === 'urgency');
    if (urgencyRule) {
      multiplier *= urgencyRule.multiplier;
      appliedRules.push(urgencyRule.name);
    }
  }

  const finalPrice = servicePrice.base_price * multiplier;

  return {
    base_price: servicePrice.base_price,
    applied_rules: appliedRules,
    final_price: Math.round(finalPrice * 100) / 100,
  };
};

// ============================================
// CALCULATE PAYMENT BREAKDOWN
// ============================================

export const calculatePaymentBreakdown = async (
  serviceId: string,
  options?: any
): Promise<{
  service_price: number;
  commission: number;
  locksmith_value: number;
  applied_rules: string[];
}> => {
  const pricing = await calculatePrice(serviceId, options);

  const commission = Math.round(pricing.final_price * COMMISSION_RATE * 100) / 100;
  const locksmithValue = Math.round((pricing.final_price - commission) * 100) / 100;

  return {
    service_price: pricing.final_price,
    commission,
    locksmith_value: locksmithValue,
    applied_rules: pricing.applied_rules,
  };
};

// ============================================
// PRICING RULES - ADMIN
// ============================================

export const createRule = async (
  name: string,
  serviceId: string | undefined,
  condition: 'time_of_day' | 'weather' | 'urgency' | 'region',
  multiplier: number
): Promise<PricingRule> => {
  const id = String(ruleId++);
  const rule: PricingRule = {
    id,
    name,
    service_id: serviceId,
    condition,
    multiplier,
    active: true,
    created_at: new Date(),
    updated_at: new Date(),
  };

  pricingRules.set(id, rule);
  return rule;
};

export const getRules = async (): Promise<PricingRule[]> => {
  return Array.from(pricingRules.values()).filter((r) => r.active);
};

export const updateRule = async (
  id: string,
  data: Partial<PricingRule>
): Promise<PricingRule> => {
  const rule = pricingRules.get(id);

  if (!rule) {
    throw new Error('Regra não encontrada');
  }

  const updated: PricingRule = {
    ...rule,
    ...data,
    id,
    updated_at: new Date(),
  };

  pricingRules.set(id, updated);
  return updated;
};

export const deleteRule = async (id: string): Promise<void> => {
  const rule = pricingRules.get(id);

  if (!rule) {
    throw new Error('Regra não encontrada');
  }

  rule.active = false;
  pricingRules.set(id, rule);
};
