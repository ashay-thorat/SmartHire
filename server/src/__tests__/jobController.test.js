import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../server.js';
import { db } from '../db/index.js';
import * as authMiddleware from '../middleware/authMiddleware.js';

const mockQuery = {
  select: vi.fn().mockReturnThis(),
  from: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  offset: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  values: vi.fn().mockReturnThis(),
  returning: vi.fn().mockReturnThis(),
};

vi.mock('../db/index.js', () => ({
  db: {
    select: (...args) => mockQuery.select(...args)
  }
}));

vi.mock('../middleware/authMiddleware.js', () => ({
  protect: (req, res, next) => {
    req.user = { id: 1, role: 'candidate' };
    next();
  },
  authorize: (...roles) => (req, res, next) => next(),
}));

describe('Job Controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/jobs', () => {
    it('should return a list of jobs with pagination', async () => {
      const mockJobs = [{ id: 1, title: 'Software Engineer', isActive: true }];
      
      // First query: db.select().from().where().limit().offset()
      mockQuery.where.mockReturnValueOnce(mockQuery);
      mockQuery.offset.mockResolvedValueOnce(mockJobs);
      
      // Second query: db.select().from().where()
      mockQuery.where.mockResolvedValueOnce([{ count: 1 }]);

      const res = await request(app).get('/api/jobs');
      
      expect(res.status).toBe(200);
      expect(res.body.jobs).toEqual(mockJobs);
      expect(res.body.pagination.total).toBe(1);
    });

    it('should handle errors gracefully', async () => {
      mockQuery.where.mockReturnValueOnce(mockQuery);
      mockQuery.offset.mockRejectedValueOnce(new Error('Database error'));
      
      const res = await request(app).get('/api/jobs');
      
      expect(res.status).toBe(500);
      expect(res.body.message).toBe('Database error');
    });
  });
  
  describe('GET /api/jobs/:id', () => {
    it('should return a single job if found', async () => {
      const mockJob = { id: 1, title: 'Software Engineer' };
      mockQuery.limit.mockResolvedValueOnce([mockJob]);
      
      const res = await request(app).get('/api/jobs/1');
      
      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockJob);
    });
    
    it('should return 404 if job not found', async () => {
      mockQuery.limit.mockResolvedValueOnce([]);
      
      const res = await request(app).get('/api/jobs/999');
      
      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Job not found');
    });
  });
});
