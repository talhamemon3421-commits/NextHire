/**
 * seed.js — NextHire Applications Seed
 *
 * Creates:
 *   1 Employer  (verified)
 *   1 Job       (Senior Full Stack Developer)
 *   5 JobSeekers
 *   5 Applications  (one per jobseeker, varied statuses)
 *
 * Usage:
 *   node seed.js
 *
 * Requires MONGO_URI in your .env (or set it inline below).
 * Run from the project root:  node src/modules/applications/seed.js
 */

import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// ─── DB connect ───────────────────────────────────────────────────────────────
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/nexthire';

// ─── Inline model definitions (avoids circular import issues in one-off scripts)

const { Schema, model, Types: { ObjectId } } = mongoose;

// ── BaseUser ──────────────────────────────────────────────────────────────────
const baseUserSchema = new Schema(
  {
    name:           { type: String, required: true, trim: true },
    email:          { type: String, required: true, unique: true, lowercase: true, trim: true },
    password:       { type: String, required: true },
    profilePicture: String,
    phone:          { type: String, unique: true, sparse: true, default: null },
    location:       { type: String, default: null },
    isVerified:     { type: Boolean, default: false },
    otp:            String,
    otpExpiry:      Date,
    refreshToken:   String,
  },
  { timestamps: true, discriminatorKey: '__t' }
);

const BaseUser = model('User', baseUserSchema);

// ── JobSeeker ─────────────────────────────────────────────────────────────────
const JobSeeker = BaseUser.discriminator(
  'JobSeeker',
  new Schema({
    skills:    { type: [String], default: [], validate: (v) => v.length <= 20 },
    bio:       { type: String, default: null },
    linkedIn:  String,
    github:    String,
    portfolio: String,
  })
);

// ── Employer ──────────────────────────────────────────────────────────────────
const Employer = BaseUser.discriminator(
  'Employer',
  new Schema({
    companyName:    { type: String, default: null },
    companyWebsite: { type: String, default: null },
    industry:       { type: String, default: null },
    isApproved:     { type: Boolean, default: false },
  })
);

// ── Job ───────────────────────────────────────────────────────────────────────
const jobSchema = new Schema(
  {
    postedBy:        { type: ObjectId, ref: 'User', required: true },
    title:           { type: String, required: true, trim: true, minlength: 3 },
    description:     { type: String, required: true, minlength: 20, maxlength: 5000 },
    jobType:         { type: String, enum: ['full-time', 'part-time', 'contract', 'internship', 'freelance'], required: true },
    location:        { type: String, default: null },
    isRemote:        { type: Boolean, default: false },
    isUrgent:        { type: Boolean, default: false },
    salary: {
      min:      { type: Number, min: 0, default: null },
      max:      { type: Number, min: 0, default: null },
      currency: { type: String, enum: ['PKR', 'USD'], default: 'PKR' },
    },
    experienceLevel: { type: String, enum: ['entry', 'junior', 'mid', 'senior', 'lead'], required: true },
    responsibilities: { type: [String], default: [] },
    requirements:     { type: [String], default: [] },
    benefits:         { type: [String], default: [] },
    skills:           { type: [String], default: [] },
    deadline:         { type: Date, default: null },
    isActive:         { type: Boolean, default: true },
    views:            { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Job = model('Job', jobSchema);

// ── Application ───────────────────────────────────────────────────────────────
const APPLICATION_STATUSES = [
  'pending', 'reviewing', 'shortlisted',
  'interview', 'offered', 'accepted', 'rejected', 'withdrawn',
];

const applicationSchema = new Schema(
  {
    job:       { type: ObjectId, ref: 'Job', required: true },
    applicant: { type: ObjectId, ref: 'User', required: true },
    coverLetter: { type: String, maxlength: 2000, default: null },
    status: { type: String, enum: APPLICATION_STATUSES, default: 'pending' },
    statusHistory: [{
      status:    { type: String, enum: APPLICATION_STATUSES },
      changedBy: { type: ObjectId, ref: 'User' },
      note:      { type: String, default: null },
      createdAt: { type: Date, default: Date.now },
    }],
    interview: {
      date: { type: Date, default: null },
      link: { type: String, default: null },
    },
    hiringNotes:  { type: String, maxlength: 2000, default: null },
    withdrawnAt:  { type: Date, default: null },
    withdrawReason: { type: String, default: null },
    isWithdrawn:  { type: Boolean, default: false },
    chatRoom:     { type: ObjectId, ref: 'ChatRoom', default: null },
  },
  { timestamps: true }
);

applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });
const Application = model('Application', applicationSchema);

// ─── Seed Data ────────────────────────────────────────────────────────────────

const EMPLOYER_DATA = {
  name:           'Saad Recruiter',
  email:          'saad.recruiter@nexthire.dev',
  password:       'Test@12345',
  location:       'Karachi, Pakistan',
  isVerified:     true,
  companyName:    'NextHire Technologies',
  companyWebsite: 'https://nexthire.dev',
  industry:       'Software / IT',
  isApproved:     true,
};

const JOB_DATA = {
  title:           'Senior Full Stack Developer',
  description:     'We are looking for an experienced full stack developer with 5+ years of experience in building scalable web applications using Node.js and React.',
  jobType:         'full-time',
  location:        'Karachi, Pakistan',
  isRemote:        false,
  isUrgent:        false,
  experienceLevel: 'senior',
  salary:          { min: 150000, max: 250000, currency: 'PKR' },
  responsibilities: [
    'Design and implement backend APIs',
    'Build responsive frontend interfaces',
    'Manage database architecture',
  ],
  requirements: [
    '5+ years experience',
    'Node.js and React expertise',
    'MongoDB knowledge',
  ],
  benefits: [
    'Health insurance',
    'Performance bonus',
    'Remote work options',
  ],
  skills:    ['Node.js', 'React', 'MongoDB', 'JavaScript'],
  deadline:  new Date('2026-05-31T23:59:59Z'),
  isActive:  true,
};

const JOBSEEKERS_DATA = [
  {
    name:     'Ali Raza',
    email:    'ali.raza@example.com',
    password: 'Test@12345',
    location: 'Lahore, Pakistan',
    phone:    '+923001111001',
    skills:   ['Node.js', 'React', 'MongoDB', 'JavaScript', 'TypeScript'],
    bio:      'Full stack developer with 6 years of experience building SaaS products.',
    linkedIn: 'https://linkedin.com/in/ali-raza-dev',
    github:   'https://github.com/ali-raza-dev',
    isVerified: true,
    // application seed extras
    _coverLetter: 'I am a seasoned full stack developer with 6 years of industry experience. I have led multiple end-to-end product builds using Node.js and React, and I believe I would be a great fit for this senior role.',
    _status: 'shortlisted',
    _hiringNotes: 'Strong GitHub profile. Has shipped 3 production SaaS apps. Schedule a call.',
  },
  {
    name:     'Fatima Khan',
    email:    'fatima.khan@example.com',
    password: 'Test@12345',
    location: 'Islamabad, Pakistan',
    phone:    '+923001111002',
    skills:   ['React', 'JavaScript', 'CSS', 'Node.js'],
    bio:      'Frontend-heavy full stack developer passionate about great UX.',
    linkedIn: 'https://linkedin.com/in/fatima-khan-dev',
    github:   'https://github.com/fatima-khan-dev',
    isVerified: true,
    _coverLetter: 'With 5 years of experience primarily in React and a growing Node.js backend skillset, I am excited to bring my skills to your team.',
    _status: 'reviewing',
    _hiringNotes: null,
  },
  {
    name:     'Bilal Ahmed',
    email:    'bilal.ahmed@example.com',
    password: 'Test@12345',
    location: 'Karachi, Pakistan',
    phone:    '+923001111003',
    skills:   ['Node.js', 'MongoDB', 'Express', 'JavaScript'],
    bio:      'Backend engineer with solid full stack exposure.',
    linkedIn: 'https://linkedin.com/in/bilal-ahmed-dev',
    github:   'https://github.com/bilal-ahmed-dev',
    isVerified: true,
    _coverLetter: null, // applied without cover letter
    _status: 'pending',
    _hiringNotes: null,
  },
  {
    name:     'Zara Siddiqui',
    email:    'zara.siddiqui@example.com',
    password: 'Test@12345',
    location: 'Multan, Pakistan',
    phone:    '+923001111004',
    skills:   ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'MongoDB'],
    bio:      'Senior engineer with 7 years of experience across startups and enterprises.',
    linkedIn: 'https://linkedin.com/in/zara-siddiqui',
    github:   'https://github.com/zara-siddiqui',
    portfolio: 'https://zarasiddiqui.dev',
    isVerified: true,
    _coverLetter: 'Seven years of full stack engineering — React on the frontend, Node.js on the back — with a track record of scaling systems from 0 to production. I am very interested in this role.',
    _status: 'interview',
    _interviewDate: new Date('2026-05-15T10:00:00Z'),
    _interviewLink: 'https://meet.google.com/abc-defg-hij',
    _hiringNotes: 'Top candidate so far. Excellent communication on call. Proceeding to technical interview.',
  },
  {
    name:     'Usman Tariq',
    email:    'usman.tariq@example.com',
    password: 'Test@12345',
    location: 'Faisalabad, Pakistan',
    phone:    '+923001111005',
    skills:   ['JavaScript', 'React', 'Node.js', 'MySQL'],
    bio:      'Mid-level developer aiming for a senior position.',
    linkedIn: 'https://linkedin.com/in/usman-tariq-dev',
    github:   'https://github.com/usman-tariq-dev',
    isVerified: true,
    _coverLetter: 'I have 4 years of experience and am actively levelling up my skills. I believe this role would be the right challenge for me.',
    _status: 'rejected',
    _hiringNotes: 'Good attitude but does not quite meet the 5-year requirement. Keep on file for junior openings.',
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const hashPassword = (plain) => bcrypt.hash(plain, 10);

const log = (msg) => console.log(`  ✔  ${msg}`);
const warn = (msg) => console.warn(`  ⚠  ${msg}`);

// ─── Main ─────────────────────────────────────────────────────────────────────
async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('\n🌱  Connected to MongoDB —', MONGO_URI);

  // ── 1. Clean previous seed data ──────────────────────────────────────────
  console.log('\n🧹  Cleaning previous seed data...');

  const seedEmails = [
    EMPLOYER_DATA.email,
    ...JOBSEEKERS_DATA.map((j) => j.email),
  ];

  const deletedUsers = await BaseUser.deleteMany({ email: { $in: seedEmails } });
  warn(`Removed ${deletedUsers.deletedCount} existing seed users`);

  // Remove jobs posted under old employer seed emails (looked up by email match)
  // We'll clean up after we know the employer id — handled below.

  // ── 2. Create Employer ────────────────────────────────────────────────────
  console.log('\n👔  Creating employer...');

  const hashedEmpPassword = await hashPassword(EMPLOYER_DATA.password);
  const employer = await Employer.create({
    name:           EMPLOYER_DATA.name,
    email:          EMPLOYER_DATA.email,
    password:       hashedEmpPassword,
    location:       EMPLOYER_DATA.location,
    isVerified:     EMPLOYER_DATA.isVerified,
    companyName:    EMPLOYER_DATA.companyName,
    companyWebsite: EMPLOYER_DATA.companyWebsite,
    industry:       EMPLOYER_DATA.industry,
    isApproved:     EMPLOYER_DATA.isApproved,
  });
  log(`Employer created → ${employer.name} (${employer.email})  id: ${employer._id}`);

  // ── 3. Clean & create Job ─────────────────────────────────────────────────
  console.log('\n💼  Creating job...');

  await Job.deleteMany({ postedBy: employer._id });
  warn('Removed existing jobs for this employer');

  const job = await Job.create({ ...JOB_DATA, postedBy: employer._id });
  log(`Job created → "${job.title}"  id: ${job._id}`);

  // ── 4. Create JobSeekers ──────────────────────────────────────────────────
  console.log('\n👥  Creating 5 job seekers...');

  const seekers = [];

  for (const data of JOBSEEKERS_DATA) {
    const hashed = await hashPassword(data.password);
    const seeker = await JobSeeker.create({
      name:       data.name,
      email:      data.email,
      password:   hashed,
      location:   data.location,
      phone:      data.phone,
      skills:     data.skills,
      bio:        data.bio,
      linkedIn:   data.linkedIn   ?? null,
      github:     data.github     ?? null,
      portfolio:  data.portfolio  ?? null,
      isVerified: data.isVerified,
    });
    seekers.push(seeker);
    log(`JobSeeker created → ${seeker.name} (${seeker.email})  id: ${seeker._id}`);
  }

  // ── 5. Clean & create Applications ───────────────────────────────────────
  console.log('\n📋  Creating 5 applications...');

  await Application.deleteMany({ job: job._id });
  warn('Removed existing applications for this job');

  for (let i = 0; i < seekers.length; i++) {
    const seeker  = seekers[i];
    const data    = JOBSEEKERS_DATA[i];
    const status  = data._status;

    // Build statusHistory — every app starts as 'pending', then transitions
    const statusHistory = [
      { status: 'pending', changedBy: seeker._id, note: 'Application submitted', createdAt: new Date() },
    ];

    if (status !== 'pending') {
      statusHistory.push({
        status,
        changedBy: employer._id,
        note: status === 'rejected'
          ? 'Does not meet experience requirement'
          : status === 'interview'
          ? 'Moving to technical interview'
          : status === 'shortlisted'
          ? 'Profile looks strong'
          : null,
        createdAt: new Date(),
      });
    }

    const appPayload = {
      job:          job._id,
      applicant:    seeker._id,
      coverLetter:  data._coverLetter ?? null,
      status,
      statusHistory,
      hiringNotes:  data._hiringNotes ?? null,
    };

    // Interview details for Zara
    if (data._interviewDate) {
      appPayload.interview = {
        date: data._interviewDate,
        link: data._interviewLink ?? null,
      };
    }

    const app = await Application.create(appPayload);
    log(`Application created → ${seeker.name}  status: ${app.status}  id: ${app._id}`);
  }

  // ── 6. Summary ───────────────────────────────────────────────────────────
  console.log('\n─────────────────────────────────────────────────');
  console.log('✅  Seed complete!\n');
  console.log('  Employer login:');
  console.log(`    email:    ${EMPLOYER_DATA.email}`);
  console.log(`    password: ${EMPLOYER_DATA.password}`);
  console.log('\n  JobSeeker logins (password same for all: Test@12345):');
  JOBSEEKERS_DATA.forEach((j) => {
    console.log(`    ${j.email.padEnd(35)} status → ${j._status}`);
  });
  console.log('─────────────────────────────────────────────────\n');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('\n❌  Seed failed:', err.message);
  mongoose.disconnect();
  process.exit(1);
});
