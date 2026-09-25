import { Request, Response } from 'express';
import {
  getCustomerProfileByUserId,
  updateCustomerProfile,
  completeCustomerProfile,
  createCustomerProfile,
} from '../services/customerService.js';

// ============================================
// GET CUSTOMER PROFILE
// ============================================

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Não autenticado' });
      return;
    }

    const profile = await getCustomerProfileByUserId(req.user.id);

    if (!profile) {
      // Criar novo perfil se não existir
      const newProfile = await createCustomerProfile(req.user.id);
      res.status(200).json({ success: true, data: newProfile });
      return;
    }

    res.status(200).json({ success: true, data: profile });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao buscar perfil';
    res.status(500).json({ success: false, error: message });
  }
};

// ============================================
// UPDATE CUSTOMER PROFILE
// ============================================

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Não autenticado' });
      return;
    }

    const { address, city, state, postal_code, latitude, longitude } = req.body;

    const updated = await updateCustomerProfile(req.user.id, {
      address,
      city,
      state,
      postal_code,
      latitude,
      longitude,
    });

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao atualizar perfil';
    res.status(400).json({ success: false, error: message });
  }
};

// ============================================
// COMPLETE CUSTOMER PROFILE
// ============================================

export const completeProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Não autenticado' });
      return;
    }

    const {
      address,
      city,
      state,
      postal_code,
      latitude,
      longitude,
      document_type,
      document,
      birthdate,
    } = req.body;

    // Validar dados obrigatórios
    if (
      !address ||
      !city ||
      !state ||
      !postal_code ||
      latitude === undefined ||
      longitude === undefined ||
      !document_type ||
      !document ||
      !birthdate
    ) {
      res.status(400).json({
        success: false,
        error: 'Todos os campos são obrigatórios',
      });
      return;
    }

    const completed = await completeCustomerProfile(req.user.id, {
      address,
      city,
      state,
      postal_code,
      latitude,
      longitude,
      document_type,
      document,
      birthdate,
    });

    res.status(200).json({ success: true, data: completed });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao completar perfil';
    res.status(400).json({ success: false, error: message });
  }
};
