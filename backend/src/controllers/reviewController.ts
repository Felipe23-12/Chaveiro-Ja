import { Request, Response } from 'express';
import { createReview, getReviewsForUser, calculateAverageRating } from '../services/reviewService.js';

export const create = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) { res.status(401).json({ success: false, error: 'Não autenticado' }); return; }
    const { job_id, reviewed_id, score, comment } = req.body;
    if (!job_id || !reviewed_id || !score) { res.status(400).json({ success: false, error: 'Campos obrigatórios' }); return; }
    const review = await createReview(job_id, req.user.id, reviewed_id, score, comment);
    res.status(201).json({ success: true, data: review });
  } catch (error) { res.status(400).json({ success: false, error: (error as Error).message }); }
};

export const getUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { user_id } = req.params;
    const reviews = await getReviewsForUser(user_id);
    const avgRating = await calculateAverageRating(user_id);
    res.status(200).json({ success: true, data: { reviews, average_rating: avgRating, total_reviews: reviews.length } });
  } catch (error) { res.status(500).json({ success: false, error: (error as Error).message }); }
};
