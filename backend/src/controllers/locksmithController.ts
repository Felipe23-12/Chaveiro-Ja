import { Request, Response } from 'express';
import {
  getLocksmithProfileByUserId,
  updateLocksmithProfile,
  createLocksmithProfile,
  updateLocksmithStatus,
  verifyLocksmithDocuments,
  getLocksmiths,
  rateLocksmith,
} from '../services/locksmithService.js';

// ============================================
// GET LOCKSMITH PROFILE
// ============================================

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Não autenticado' });
      return;
    }

    const profile = await getLocksmithProfileByUserId(req.user.id);

    if (!profile) {
      const newProfile = await createLocksmithProfile(req.user.id);
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
// UPDATE LOCKSMITH PROFILE
// ============================================

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Não autenticado' });
      return;
    }

    const {
      company_name,
      phone,
      description,
      years_experience,
      latitude,
      longitude,
      service_radius_km,
      hourly_rate,
      bank_account,
    } = req.body;

    const updated = await updateLocksmithProfile(req.user.id, {
      company_name,
      phone,
      description,
      years_experience,
      latitude,
      longitude,
      service_radius_km,
      hourly_rate,
      bank_account,
    });

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao atualizar perfil';
    res.status(400).json({ success: false, error: message });
  }
};

// ============================================
// UPDATE LOCKSMITH STATUS
// ============================================

export const updateStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Não autenticado' });
      return;
    }

    const { status } = req.body;

    if (!['online', 'offline', 'blocked'].includes(status)) {
      res.status(400).json({ success: false, error: 'Status inválido' });
      return;
    }

    const updated = await updateLocksmithStatus(req.user.id, status);
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao atualizar status';
    res.status(400).json({ success: false, error: message });
  }
};

// ============================================
// VERIFY DOCUMENTS
// ============================================

export const verifyDocuments = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Não autenticado' });
      return;
    }

    const { document_type, document } = req.body;

    if (!document_type || !document) {
      res.status(400).json({ success: false, error: 'Documento e tipo são obrigatórios' });
      return;
    }

    const updated = await verifyLocksmithDocuments(req.user.id, document_type, document);
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao verificar documento';
    res.status(400).json({ success: false, error: message });
  }
};

// ============================================
// GET NEARBY LOCKSMITHS
// ============================================

export const getNearby = async (req: Request, res: Response): Promise<void> => {
  try {
    const { latitude, longitude, max_distance } = req.query;

    if (!latitude || !longitude) {
      res.status(400).json({ success: false, error: 'Latitude e longitude são obrigatórios' });
      return;
    }

    const lat = parseFloat(latitude as string);
    const lon = parseFloat(longitude as string);
    const maxDist = max_distance ? parseInt(max_distance as string) : 15;

    const locksmiths = await getLocksmiths(lat, lon, maxDist);
    res.status(200).json({ success: true, data: locksmiths });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao buscar encanadores';
    res.status(500).json({ success: false, error: message });
  }
};

// ============================================
// RATE LOCKSMITH
// ============================================

export const rate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { locksmith_id } = req.params;
    const { rating } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      res.status(400).json({ success: false, error: 'Avaliação deve ser entre 1 e 5' });
      return;
    }

    const updated = await rateLocksmith(locksmith_id, rating);
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao avaliar encanador';
    res.status(400).json({ success: false, error: message });
  }
};
