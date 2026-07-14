import { z } from 'zod';
import xss from 'xss';

// Helper to sanitize strings using xss
const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  return xss(str);
};

export const jobSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title too long').transform(sanitizeString),
  company: z.string().min(2, 'Company name is required').transform(sanitizeString),
  description: z.string().min(20, 'Description must be at least 20 characters').transform(sanitizeString),
  location: z.string().min(2, 'Location is required').transform(sanitizeString),
  jobType: z.enum(['full-time', 'part-time', 'contract', 'remote']).default('full-time'),
  requiredSkills: z.array(z.string().transform(sanitizeString)).min(1, 'At least one skill is required'),
  salaryMin: z.number().int().nonnegative().optional(),
  salaryMax: z.number().int().nonnegative().optional(),
  expiresAt: z.string().datetime().optional().nullable(),
  isActive: z.boolean().optional(),
}).refine(data => {
  if (data.salaryMin !== undefined && data.salaryMax !== undefined) {
    return data.salaryMax >= data.salaryMin;
  }
  return true;
}, {
  message: 'Max salary cannot be less than Min salary',
  path: ['salaryMax'],
});

export const profileUpdateSchema = z.object({
  currentTitle: z.string().max(100).optional().transform(sanitizeString),
  location: z.string().max(100).optional().transform(sanitizeString),
  experienceYears: z.number().int().nonnegative().optional(),
  extractedSkills: z.array(z.string().transform(sanitizeString)).optional(),
});
