import { Request, Response } from 'express';
import {
  getServicePrice,
  setServicePrice,
  calculatePrice,
  calculatePaymentBreakdown,
  createRule,
  getRules,
  updateRule,
  deleteRule,
} from '../services/pricingService.js';

// ============================================
// GET SERVICE PRICE
// ============================================

export const getPrice = async (req: Request, res: Response): Promise<void> => {
  try {
    const { service_id } = req.params;
    const price = await getServicePrice(service_id);

    if (!price) {
      res.status(404).json({ success: false, error: 'Serviço não encontrado' });
      return;
    }

    res.status(200).json({ success: true, data: price });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao buscar preço';
    res.status(500).json({ success: false, error: message });
  }
};

// ============================================
// CALCULATE QUOTE
// ============================================

export const quote = async (req: Request, res: Response): Promise<void> => {
  try {
    const { service_id, time_of_day, weather, urgency, region } = req.body;

    if (!service_id) {
      res.status(400).json({ success: false, error: 'Service ID é obrigatório' });
      return;
    }

    const pricing = await calculatePrice(service_id, {
      timeOfDay: time_of_day,
      weather,
      urgency,
      region,
    });

    const breakdown = await calculatePaymentBreakdown(service_id, {
      timeOfDay: time_of_day,
      weather,
      urgency,
      region,
    });

    res.status(200).json({
      success: true,
      data: {
        ...pricing,
        breakdown,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao calcular preço';
    res.status(400).json({ success: false, error: message });
  }
};

// ============================================
// GET ALL RULES (ADMIN)
// ============================================

export const getRulesAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const rules = await getRules();
    res.status(200).json({ success: true, data: rules });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao buscar regras';
    res.status(500).json({ success: false, error: message });
  }
};

// ============================================
// SET SERVICE PRICE (ADMIN)
// ============================================

export const setPrice = async (req: Request, res: Response): Promise<void> => {
  try {
    const { service_id, base_price } = req.body;

    if (!service_id || !base_price) {
      res.status(400).json({
        success: false,
        error: 'Service ID e base_price são obrigatórios',
      });
      return;
    }

    const price = await setServicePrice(service_id, base_price);
    res.status(200).json({ success: true, data: price });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao definir preço';
    res.status(400).json({ success: false, error: message });
  }
};

// ============================================
// CREATE RULE (ADMIN)
// ============================================

export const createRuleAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, service_id, condition, multiplier } = req.body;

    if (!name || !condition || !multiplier) {
      res.status(400).json({
        success: false,
        error: 'Nome, condição e multiplicador são obrigatórios',
      });
      return;
    }

    if (!['time_of_day', 'weather', 'urgency', 'region'].includes(condition)) {
      res.status(400).json({
        success: false,
        error: 'Condição inválida',
      });
      return;
    }

    const rule = await createRule(name, service_id, condition, multiplier);
    res.status(201).json({ success: true, data: rule });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao criar regra';
    res.status(400).json({ success: false, error: message });
  }
};

// ============================================
// UPDATE RULE (ADMIN)
// ============================================

export const updateRuleAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, multiplier, active } = req.body;

    const updated = await updateRule(id, { name, multiplier, active });
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao atualizar regra';
    res.status(400).json({ success: false, error: message });
  }
};

// ============================================
// DELETE RULE (ADMIN)
// ============================================

export const deleteRuleAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await deleteRule(id);
    res.status(200).json({ success: true, message: 'Regra deletada' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao deletar regra';
    res.status(400).json({ success: false, error: message });
  }
};
