import { Request, Response } from 'express';
import { createPayment, getPayment, processMercadoPagoWebhook, createMercadoPagoPreference } from '../services/paymentService.js';

export const createCheckout = async (req: Request, res: Response): Promise<void> => {
  try {
    const { job_id, customer_id, locksmith_id, amount, commission } = req.body;
    if (!job_id || !customer_id || !locksmith_id || !amount) {
      res.status(400).json({ success: false, error: 'Campos obrigatórios' });
      return;
    }

    const payment = await createPayment(job_id, customer_id, locksmith_id, amount, commission, 'mercado_pago');
    const preferenceId = await createMercadoPagoPreference(payment);

    res.status(201).json({
      success: true,
      data: {
        payment_id: payment.id,
        preference_id: preferenceId,
        amount: payment.amount,
        checkout_url: `https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=${preferenceId}`,
      },
    });
  } catch (error) {
    res.status(400).json({ success: false, error: (error as Error).message });
  }
};

export const getPaymentStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { payment_id } = req.params;
    const payment = await getPayment(payment_id);
    if (!payment) {
      res.status(404).json({ success: false, error: 'Pagamento não encontrado' });
      return;
    }
    res.status(200).json({ success: true, data: payment });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
};

export const handleWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    const { topic, id, data } = req.body;
    await processMercadoPagoWebhook(topic, id, data);
    res.status(200).json({ success: true, message: 'Webhook processado' });
  } catch (error) {
    res.status(400).json({ success: false, error: (error as Error).message });
  }
};
