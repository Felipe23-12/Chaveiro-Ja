import { Request, Response } from 'express';
import {
  createJob,
  getJob,
  getCustomerJobs,
  getLocksmithJobs,
  searchProviders,
  createJobOffer,
  getJobOffers,
  getLocksmithOffers,
  acceptJobOffer,
  updateJobStatus,
  cancelJob,
  markEnRoute,
  markArrived,
  markInProgress,
  markCompleted,
} from '../services/jobService.js';

// ============================================
// CREATE JOB
// ============================================

export const create = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Não autenticado' });
      return;
    }

    const { service_id, latitude, longitude, address } = req.body;

    if (!service_id || latitude === undefined || longitude === undefined) {
      res.status(400).json({
        success: false,
        error: 'Service ID, latitude e longitude são obrigatórios',
      });
      return;
    }

    const job = await createJob(req.user.id, service_id, latitude, longitude, address);
    res.status(201).json({ success: true, data: job });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao criar pedido';
    res.status(400).json({ success: false, error: message });
  }
};

// ============================================
// GET JOB
// ============================================

export const get = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const job = await getJob(id);

    if (!job) {
      res.status(404).json({ success: false, error: 'Pedido não encontrado' });
      return;
    }

    res.status(200).json({ success: true, data: job });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao buscar pedido';
    res.status(500).json({ success: false, error: message });
  }
};

// ============================================
// GET MY JOBS (CUSTOMER)
// ============================================

export const getMyJobs = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Não autenticado' });
      return;
    }

    const jobs = await getCustomerJobs(req.user.id);
    res.status(200).json({ success: true, data: jobs });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao buscar pedidos';
    res.status(500).json({ success: false, error: message });
  }
};

// ============================================
// SEARCH PROVIDERS
// ============================================

export const search = async (req: Request, res: Response): Promise<void> => {
  try {
    const { job_id, price } = req.body;

    if (!job_id || !price) {
      res.status(400).json({
        success: false,
        error: 'Job ID e price são obrigatórios',
      });
      return;
    }

    const job = await searchProviders(job_id, price);
    res.status(200).json({
      success: true,
      data: job,
      message: 'Buscando chaveiros disponíveis...',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao buscar provedores';
    res.status(400).json({ success: false, error: message });
  }
};

// ============================================
// CREATE JOB OFFER
// ============================================

export const makeOffer = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Não autenticado' });
      return;
    }

    const { job_id, price, eta } = req.body;

    if (!job_id || !price || !eta) {
      res.status(400).json({
        success: false,
        error: 'Job ID, price e eta são obrigatórios',
      });
      return;
    }

    const offer = await createJobOffer(job_id, req.user.id, price, eta);
    res.status(201).json({ success: true, data: offer });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao criar oferta';
    res.status(400).json({ success: false, error: message });
  }
};

// ============================================
// GET JOB OFFERS
// ============================================

export const getOffers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { job_id } = req.params;
    const offers = await getJobOffers(job_id);
    res.status(200).json({ success: true, data: offers });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao buscar ofertas';
    res.status(500).json({ success: false, error: message });
  }
};

// ============================================
// GET MY OFFERS (LOCKSMITH)
// ============================================

export const getMyOffers = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Não autenticado' });
      return;
    }

    const offers = await getLocksmithOffers(req.user.id);
    res.status(200).json({ success: true, data: offers });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao buscar ofertas';
    res.status(500).json({ success: false, error: message });
  }
};

// ============================================
// ACCEPT JOB OFFER
// ============================================

export const acceptOffer = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Não autenticado' });
      return;
    }

    const { offer_id } = req.body;

    if (!offer_id) {
      res.status(400).json({ success: false, error: 'Offer ID é obrigatório' });
      return;
    }

    const job = await acceptJobOffer(offer_id, req.user.id);
    res.status(200).json({
      success: true,
      data: job,
      message: 'Pedido aceito com sucesso!',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao aceitar oferta';
    res.status(400).json({ success: false, error: message });
  }
};

// ============================================
// UPDATE JOB STATUS
// ============================================

export const updateStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { job_id, status } = req.body;

    if (!job_id || !status) {
      res.status(400).json({
        success: false,
        error: 'Job ID e status são obrigatórios',
      });
      return;
    }

    const job = await updateJobStatus(job_id, status);
    res.status(200).json({ success: true, data: job });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao atualizar status';
    res.status(400).json({ success: false, error: message });
  }
};

// ============================================
// MARK EN ROUTE
// ============================================

export const setEnRoute = async (req: Request, res: Response): Promise<void> => {
  try {
    const { job_id } = req.body;

    if (!job_id) {
      res.status(400).json({ success: false, error: 'Job ID é obrigatório' });
      return;
    }

    const job = await markEnRoute(job_id);
    res.status(200).json({ success: true, data: job, message: 'A caminho...' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao atualizar';
    res.status(400).json({ success: false, error: message });
  }
};

// ============================================
// MARK ARRIVED
// ============================================

export const setArrived = async (req: Request, res: Response): Promise<void> => {
  try {
    const { job_id } = req.body;

    if (!job_id) {
      res.status(400).json({ success: false, error: 'Job ID é obrigatório' });
      return;
    }

    const job = await markArrived(job_id);
    res.status(200).json({ success: true, data: job, message: 'Chegou no local!' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao atualizar';
    res.status(400).json({ success: false, error: message });
  }
};

// ============================================
// MARK IN PROGRESS
// ============================================

export const setInProgress = async (req: Request, res: Response): Promise<void> => {
  try {
    const { job_id } = req.body;

    if (!job_id) {
      res.status(400).json({ success: false, error: 'Job ID é obrigatório' });
      return;
    }

    const job = await markInProgress(job_id);
    res.status(200).json({ success: true, data: job, message: 'Atendimento iniciado' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao atualizar';
    res.status(400).json({ success: false, error: message });
  }
};

// ============================================
// MARK COMPLETED
// ============================================

export const setCompleted = async (req: Request, res: Response): Promise<void> => {
  try {
    const { job_id } = req.body;

    if (!job_id) {
      res.status(400).json({ success: false, error: 'Job ID é obrigatório' });
      return;
    }

    const job = await markCompleted(job_id);
    res.status(200).json({ success: true, data: job, message: 'Atendimento concluído!' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao atualizar';
    res.status(400).json({ success: false, error: message });
  }
};

// ============================================
// CANCEL JOB
// ============================================

export const cancel = async (req: Request, res: Response): Promise<void> => {
  try {
    const { job_id, reason } = req.body;

    if (!job_id || !reason) {
      res.status(400).json({
        success: false,
        error: 'Job ID e reason são obrigatórios',
      });
      return;
    }

    const job = await cancelJob(job_id, reason);
    res.status(200).json({ success: true, data: job, message: 'Pedido cancelado' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao cancelar';
    res.status(400).json({ success: false, error: message });
  }
};
