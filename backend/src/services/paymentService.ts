const payments = new Map();
let paymentId = 1;

export interface Payment {
  id: string;
  job_id: string;
  customer_id: string;
  locksmith_id: string;
  amount: number;
  commission: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_method: string;
  mercado_pago_id?: string;
  created_at: Date;
  updated_at: Date;
}

export const createPayment = async (
  jobId: string,
  customerId: string,
  locksmithId: string,
  amount: number,
  commission: number,
  paymentMethod: string
): Promise<Payment> => {
  const id = String(paymentId++);
  const payment: Payment = {
    id,
    job_id: jobId,
    customer_id: customerId,
    locksmith_id: locksmithId,
    amount,
    commission,
    status: 'pending',
    payment_method: paymentMethod,
    created_at: new Date(),
    updated_at: new Date(),
  };

  payments.set(id, payment);
  return payment;
};

export const updatePaymentStatus = async (
  paymentId: string,
  status: 'completed' | 'failed' | 'refunded',
  mercadoPagoId?: string
): Promise<Payment> => {
  const payment = payments.get(paymentId);
  if (!payment) throw new Error('Pagamento não encontrado');

  const updated: Payment = {
    ...payment,
    status,
    mercado_pago_id: mercadoPagoId || payment.mercado_pago_id,
    updated_at: new Date(),
  };

  payments.set(paymentId, updated);
  return updated;
};

export const getPayment = async (paymentId: string): Promise<Payment | null> => {
  return payments.get(paymentId) || null;
};

export const getJobPayments = async (jobId: string): Promise<Payment[]> => {
  return Array.from(payments.values()).filter(p => p.job_id === jobId);
};

// MERCADO PAGO INTEGRATION (Mock)
export const createMercadoPagoPreference = async (payment: Payment): Promise<string> => {
  // Em produção, integrar com Mercado Pago SDK
  // const client = new MercadoPagoConfig({ accessToken: process.env.MERCADO_PAGO_TOKEN });
  // const preference = await client.preferences.create({ ... });
  // Por enquanto, retornar ID mock
  return `MP_${payment.id}_${Date.now()}`;
};

export const processMercadoPagoWebhook = async (
  topic: string,
  resourceId: string,
  paymentData: any
): Promise<void> => {
  if (topic === 'payment') {
    const paymentId = paymentData.external_reference;
    if (paymentData.status === 'approved') {
      await updatePaymentStatus(paymentId, 'completed', resourceId);
    } else if (paymentData.status === 'rejected') {
      await updatePaymentStatus(paymentId, 'failed', resourceId);
    }
  }
};
