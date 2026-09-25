import { Request, Response } from 'express';
import {
  updateLocksmithLocation,
  getLatestLocation,
  getLocationHistory,
  getDistanceToCustomer,
} from '../services/locationService.js';

export const updateLocation = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Não autenticado' });
      return;
    }

    const { job_id, latitude, longitude, accuracy } = req.body;

    if (job_id === undefined || latitude === undefined || longitude === undefined) {
      res.status(400).json({
        success: false,
        error: 'Job ID, latitude e longitude são obrigatórios',
      });
      return;
    }

    const update = await updateLocksmithLocation(
      req.user.id,
      job_id,
      latitude,
      longitude,
      accuracy
    );

    res.status(200).json({ success: true, data: update });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao atualizar localização';
    res.status(400).json({ success: false, error: message });
  }
};

export const getLocation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { locksmith_id } = req.params;
    const location = await getLatestLocation(locksmith_id);

    if (!location) {
      res.status(404).json({ success: false, error: 'Localização não encontrada' });
      return;
    }

    res.status(200).json({ success: true, data: location });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao buscar localização';
    res.status(500).json({ success: false, error: message });
  }
};

export const getHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { locksmith_id } = req.params;
    const { limit } = req.query;
    const history = await getLocationHistory(locksmith_id, parseInt(limit as string) || 50);

    res.status(200).json({ success: true, data: history });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao buscar histórico';
    res.status(500).json({ success: false, error: message });
  }
};

export const getDistance = async (req: Request, res: Response): Promise<void> => {
  try {
    const { locksmith_id } = req.params;
    const { customer_latitude, customer_longitude } = req.body;

    if (customer_latitude === undefined || customer_longitude === undefined) {
      res.status(400).json({
        success: false,
        error: 'Latitude e longitude do cliente são obrigatórios',
      });
      return;
    }

    const result = await getDistanceToCustomer(
      locksmith_id,
      customer_latitude,
      customer_longitude
    );

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao calcular distância';
    res.status(400).json({ success: false, error: message });
  }
};
