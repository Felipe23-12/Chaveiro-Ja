// Mock database - em produção usar banco real
const jobs = new Map();
let jobId = 1;

export type JobStatus =
  | 'draft'
  | 'searching_provider'
  | 'offered'
  | 'accepted'
  | 'en_route'
  | 'arrived'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export interface Job {
  id: string;
  customer_id: string;
  locksmith_id?: string;
  service_id: string;
  status: JobStatus;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  price?: number;
  estimated_arrival?: number; // segundos
  created_at: Date;
  updated_at: Date;
  completed_at?: Date;
  cancelled_at?: Date;
  cancel_reason?: string;
}

export interface JobOffer {
  id: string;
  job_id: string;
  locksmith_id: string;
  price: number;
  eta: number;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: Date;
  responded_at?: Date;
}

const jobOffers = new Map();
let offerId = 1;

// ============================================
// CREATE JOB (DRAFT)
// ============================================

export const createJob = async (
  customerId: string,
  serviceId: string,
  latitude: number,
  longitude: number,
  address?: string
): Promise<Job> => {
  const id = String(jobId++);
  const job: Job = {
    id,
    customer_id: customerId,
    service_id: serviceId,
    status: 'draft',
    location: {
      latitude,
      longitude,
      address,
    },
    created_at: new Date(),
    updated_at: new Date(),
  };

  jobs.set(id, job);
  return job;
};

// ============================================
// GET JOB
// ============================================

export const getJob = async (jobId: string): Promise<Job | null> => {
  return jobs.get(jobId) || null;
};

// ============================================
// GET CUSTOMER JOBS
// ============================================

export const getCustomerJobs = async (customerId: string): Promise<Job[]> => {
  return Array.from(jobs.values()).filter((j) => j.customer_id === customerId);
};

// ============================================
// GET LOCKSMITH JOBS
// ============================================

export const getLocksmithJobs = async (locksmithId: string): Promise<Job[]> => {
  return Array.from(jobs.values()).filter((j) => j.locksmith_id === locksmithId);
};

// ============================================
// REQUEST PROVIDERS (SEARCHING_PROVIDER)
// ============================================

export const searchProviders = async (
  jobId: string,
  price: number
): Promise<Job> => {
  const job = jobs.get(jobId);

  if (!job) {
    throw new Error('Pedido não encontrado');
  }

  const updated: Job = {
    ...job,
    status: 'searching_provider',
    price,
    updated_at: new Date(),
  };

  jobs.set(jobId, updated);
  return updated;
};

// ============================================
// CREATE JOB OFFER
// ============================================

export const createJobOffer = async (
  jobId: string,
  locksmithId: string,
  price: number,
  eta: number
): Promise<JobOffer> => {
  const id = String(offerId++);
  const offer: JobOffer = {
    id,
    job_id: jobId,
    locksmith_id: locksmithId,
    price,
    eta,
    status: 'pending',
    created_at: new Date(),
  };

  jobOffers.set(id, offer);
  return offer;
};

// ============================================
// GET JOB OFFERS
// ============================================

export const getJobOffers = async (jobId: string): Promise<JobOffer[]> => {
  return Array.from(jobOffers.values()).filter((o) => o.job_id === jobId);
};

// ============================================
// GET LOCKSMITH OFFERS
// ============================================

export const getLocksmithOffers = async (locksmithId: string): Promise<JobOffer[]> => {
  return Array.from(jobOffers.values()).filter(
    (o) => o.locksmith_id === locksmithId && o.status === 'pending'
  );
};

// ============================================
// ACCEPT JOB OFFER (ATOMIC)
// ============================================

export const acceptJobOffer = async (
  offerId: string,
  locksmithId: string
): Promise<Job> => {
  const offer = jobOffers.get(offerId);

  if (!offer) {
    throw new Error('Oferta não encontrada');
  }

  if (offer.locksmith_id !== locksmithId) {
    throw new Error('Você não pode aceitar esta oferta');
  }

  if (offer.status !== 'pending') {
    throw new Error('Oferta não está disponível');
  }

  const job = jobs.get(offer.job_id);

  if (!job || job.status !== 'offered') {
    throw new Error('Pedido não está mais disponível');
  }

  // Marcar oferta como aceita
  offer.status = 'accepted';
  offer.responded_at = new Date();
  jobOffers.set(offerId, offer);

  // Rejeitar outras ofertas do mesmo pedido
  const otherOffers = Array.from(jobOffers.values()).filter(
    (o) => o.job_id === offer.job_id && o.id !== offerId && o.status === 'pending'
  );

  otherOffers.forEach((o) => {
    o.status = 'rejected';
    o.responded_at = new Date();
    jobOffers.set(o.id, o);
  });

  // Atualizar pedido
  const updated: Job = {
    ...job,
    locksmith_id: locksmithId,
    status: 'accepted',
    estimated_arrival: offer.eta,
    updated_at: new Date(),
  };

  jobs.set(job.id, updated);
  return updated;
};

// ============================================
// UPDATE JOB STATUS
// ============================================

export const updateJobStatus = async (
  jobId: string,
  newStatus: JobStatus,
  locksmithId?: string
): Promise<Job> => {
  const job = jobs.get(jobId);

  if (!job) {
    throw new Error('Pedido não encontrado');
  }

  // Validar transições
  const validTransitions: Record<JobStatus, JobStatus[]> = {
    draft: ['searching_provider'],
    searching_provider: ['offered', 'cancelled'],
    offered: ['accepted', 'cancelled'],
    accepted: ['en_route', 'cancelled'],
    en_route: ['arrived', 'cancelled'],
    arrived: ['in_progress', 'cancelled'],
    in_progress: ['completed', 'cancelled'],
    completed: [],
    cancelled: [],
  };

  if (!validTransitions[job.status].includes(newStatus)) {
    throw new Error(`Transição inválida: ${job.status} -> ${newStatus}`);
  }

  const updated: Job = {
    ...job,
    status: newStatus,
    updated_at: new Date(),
    ...(newStatus === 'completed' && { completed_at: new Date() }),
  };

  jobs.set(jobId, updated);
  return updated;
};

// ============================================
// CANCEL JOB
// ============================================

export const cancelJob = async (
  jobId: string,
  reason: string
): Promise<Job> => {
  const job = jobs.get(jobId);

  if (!job) {
    throw new Error('Pedido não encontrado');
  }

  if (job.status === 'completed' || job.status === 'cancelled') {
    throw new Error('Pedido não pode ser cancelado');
  }

  const updated: Job = {
    ...job,
    status: 'cancelled',
    cancel_reason: reason,
    cancelled_at: new Date(),
    updated_at: new Date(),
  };

  jobs.set(jobId, updated);
  return updated;
};

// ============================================
// MARK JOB STATUS (Helper)
// ============================================

export const markEnRoute = async (jobId: string): Promise<Job> => {
  return updateJobStatus(jobId, 'en_route');
};

export const markArrived = async (jobId: string): Promise<Job> => {
  return updateJobStatus(jobId, 'arrived');
};

export const markInProgress = async (jobId: string): Promise<Job> => {
  return updateJobStatus(jobId, 'in_progress');
};

export const markCompleted = async (jobId: string): Promise<Job> => {
  return updateJobStatus(jobId, 'completed');
};
