const reviews = new Map();
let reviewId = 1;

export interface Review {
  id: string;
  job_id: string;
  reviewer_id: string;
  reviewed_id: string;
  score: number;
  comment?: string;
  created_at: Date;
}

export const createReview = async (jobId: string, reviewerId: string, reviewedId: string, score: number, comment?: string): Promise<Review> => {
  if (score < 1 || score > 5) throw new Error('Score deve estar entre 1 e 5');
  const id = String(reviewId++);
  const review: Review = { id, job_id: jobId, reviewer_id: reviewerId, reviewed_id: reviewedId, score, comment, created_at: new Date() };
  reviews.set(id, review);
  return review;
};

export const getReviewsForUser = async (userId: string): Promise<Review[]> => {
  return Array.from(reviews.values()).filter(r => r.reviewed_id === userId);
};

export const calculateAverageRating = async (userId: string): Promise<number> => {
  const userReviews = await getReviewsForUser(userId);
  if (userReviews.length === 0) return 0;
  const total = userReviews.reduce((sum, r) => sum + r.score, 0);
  return Math.round((total / userReviews.length) * 10) / 10;
};
