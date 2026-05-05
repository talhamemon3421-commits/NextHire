import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Job from '../src/modules/jobs/jobs.model.js';
import Application from '../src/modules/applications/applications.model.js';
import JobSeeker from '../src/modules/users/jobSeeker.model.js';

// Load environment variables for MongoDB connection
dotenv.config();

const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/nexthire';

const runSeed = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected successfully!');

    // Get the employer's jobs
    const targetEmployerId = '69f215633cdf9a4c134fe4f6';
    const jobs = await Job.find({ postedBy: targetEmployerId });

    if (jobs.length === 0) {
      throw new Error(`No jobs found for employer ${targetEmployerId}. Run the job seed script first.`);
    }

    console.log(`Found ${jobs.length} jobs for employer ${targetEmployerId}.`);

    // Get all JobSeekers
    const jobSeekers = await JobSeeker.find({});
    
    if (jobSeekers.length === 0) {
      throw new Error("No job seekers found in the database. Please make sure job seekers are seeded.");
    }

    console.log(`Found ${jobSeekers.length} job seekers.`);

    // Clear existing applications for these jobs to avoid duplicates
    const jobIds = jobs.map(j => j._id);
    await Application.deleteMany({ job: { $in: jobIds } });
    console.log('Cleared old test applications for these jobs.');

    // We will reset the applicationCount on jobs to 0 manually to be safe before we seed
    await Job.updateMany({ _id: { $in: jobIds } }, { applicationCount: 0 });

    let totalApplications = 0;

    // Distribute applications randomly or cyclically
    for (const job of jobs) {
      // Pick 2-4 random job seekers for each job
      const shuffledSeekers = jobSeekers.sort(() => 0.5 - Math.random());
      const numApplicants = Math.floor(Math.random() * 3) + 2; // 2 to 4
      const selectedSeekers = shuffledSeekers.slice(0, numApplicants);

      for (const seeker of selectedSeekers) {
        const statuses = ['pending', 'reviewing', 'shortlisted', 'rejected', 'accepted'];
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

        const app = new Application({
          job: job._id,
          applicant: seeker._id,
          coverLetter: `Hi, I am ${seeker.name}. I am very interested in the ${job.title} position. I believe my skills are a perfect match.`,
          status: randomStatus
        });

        await app.save(); // This will trigger the pre('save') hook and update applicationCount
        totalApplications++;
      }
    }

    console.log(`✅ Passed! Successfully created ${totalApplications} applications and updated Job application counts.`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

runSeed();
