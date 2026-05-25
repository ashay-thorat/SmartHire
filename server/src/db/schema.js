import { pgTable, uuid, text, integer, boolean, timestamp, primaryKey } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').unique().notNull(),
  passwordHash: text('password_hash').notNull(),
  role: text('role').notNull(), // 'candidate' | 'recruiter'
  name: text('name').notNull(),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const candidateProfiles = pgTable('candidate_profiles', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).unique().notNull(),
  resumeUrl: text('resume_url'),
  resumeText: text('resume_text'),
  extractedSkills: text('extracted_skills').array(),
  experienceYears: integer('experience_years'),
  currentTitle: text('current_title'),
  location: text('location'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const jobs = pgTable('jobs', {
  id: uuid('id').defaultRandom().primaryKey(),
  recruiterId: uuid('recruiter_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  title: text('title').notNull(),
  company: text('company').notNull(),
  description: text('description').notNull(),
  requiredSkills: text('required_skills').array().notNull(),
  location: text('location').notNull(),
  jobType: text('job_type').notNull(), // 'full-time' | 'part-time' | 'remote' | 'contract'
  salaryMin: integer('salary_min').notNull(),
  salaryMax: integer('salary_max').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const applications = pgTable('applications', {
  id: uuid('id').defaultRandom().primaryKey(),
  candidateId: uuid('candidate_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  jobId: uuid('job_id').references(() => jobs.id, { onDelete: 'cascade' }).notNull(),
  status: text('status').default('Applied').notNull(), // 'Applied' | 'Reviewed' | 'Shortlisted' | 'Hired' | 'Rejected'
  coverLetter: text('cover_letter'),
  appliedAt: timestamp('applied_at').defaultNow().notNull(),
});

export const resumeScores = pgTable('resume_scores', {
  id: uuid('id').defaultRandom().primaryKey(),
  recruiterId: uuid('recruiter_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  candidateName: text('candidate_name').notNull(),
  resumeUrl: text('resume_url'),
  jobRole: text('job_role').notNull(),
  overallScore: integer('overall_score').notNull(),
  skillsScore: integer('skills_score').notNull(),
  experienceScore: integer('experience_score').notNull(),
  educationScore: integer('education_score').notNull(),
  atsScore: integer('ats_score').notNull(),
  verdict: text('verdict').notNull(), // 'hire' | 'no-hire'
  suggestions: text('suggestions').array().notNull(),
  scoredAt: timestamp('scored_at').defaultNow().notNull(),
});

export const savedJobs = pgTable('saved_jobs', {
  candidateId: uuid('candidate_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  jobId: uuid('job_id').references(() => jobs.id, { onDelete: 'cascade' }).notNull(),
  savedAt: timestamp('saved_at').defaultNow().notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.candidateId, table.jobId] }),
}));
