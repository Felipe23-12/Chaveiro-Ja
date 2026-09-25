import { Request, Response } from 'express';
import {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  getServicesByCategory,
} from '../services/serviceService.js';

// ============================================
// GET ALL SERVICES
// ============================================

export const getServices = async (req: Request, res: Response): Promise<void> => {
  try {
    const services = await getAllServices();
    res.status(200).json({ success: true, data: services });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao buscar serviços';
    res.status(500).json({ success: false, error: message });
  }
};

// ============================================
// GET SERVICE BY ID
// ============================================

export const getService = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const service = await getServiceById(id);

    if (!service) {
      res.status(404).json({ success: false, error: 'Serviço não encontrado' });
      return;
    }

    res.status(200).json({ success: true, data: service });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao buscar serviço';
    res.status(500).json({ success: false, error: message });
  }
};

// ============================================
// GET SERVICES BY CATEGORY
// ============================================

export const getByCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category } = req.query;

    if (!category) {
      res.status(400).json({ success: false, error: 'Categoria é obrigatória' });
      return;
    }

    const services = await getServicesByCategory(category as string);
    res.status(200).json({ success: true, data: services });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao buscar serviços';
    res.status(500).json({ success: false, error: message });
  }
};

// ============================================
// CREATE SERVICE (ADMIN ONLY)
// ============================================

export const create = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, category, icon } = req.body;

    if (!name || !description || !category) {
      res.status(400).json({
        success: false,
        error: 'Nome, descrição e categoria são obrigatórios',
      });
      return;
    }

    const service = await createService(name, description, category, icon);
    res.status(201).json({ success: true, data: service });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao criar serviço';
    res.status(400).json({ success: false, error: message });
  }
};

// ============================================
// UPDATE SERVICE (ADMIN ONLY)
// ============================================

export const update = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description, category, icon } = req.body;

    const updated = await updateService(id, {
      name,
      description,
      category,
      icon,
    });

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao atualizar serviço';
    res.status(400).json({ success: false, error: message });
  }
};

// ============================================
// DELETE SERVICE (ADMIN ONLY)
// ============================================

export const deleteOne = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await deleteService(id);
    res.status(200).json({ success: true, message: 'Serviço deletado' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao deletar serviço';
    res.status(400).json({ success: false, error: message });
  }
};
