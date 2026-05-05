import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Job from '../src/modules/jobs/jobs.model.js';
import Employer from '../src/modules/users/employer.model.js';

// Load environment variables for MongoDB connection
dotenv.config();

const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/nexthire';

const seedJobs = [
  {
    title: "Senior Aerospace Engineer",
    description: "BinLaden Aero is seeking a highly skilled Senior Aerospace Engineer to lead the design and development of next-generation aircraft components. You will work closely with cross-functional teams to ensure safety, efficiency, and cutting-edge aerodynamics. This role demands deep technical expertise in fluid dynamics and structural analysis.",
    jobType: "full-time",
    location: "Dubai, United Arab Emirates",
    isRemote: false,
    isUrgent: true,
    salary: { min: 120000, max: 180000, currency: "USD" },
    experienceLevel: "senior",
    responsibilities: [
      "Lead aerodynamic design and testing of new airframe structures.",
      "Conduct computational fluid dynamics (CFD) simulations.",
      "Collaborate with manufacturing teams to ensure design feasibility.",
      "Mentor junior engineers and oversee technical documentation."
    ],
    requirements: [
      "Master's or Ph.D. in Aerospace Engineering.",
      "7+ years of experience in commercial or military aviation design.",
      "Advanced proficiency in ANSYS, SolidWorks, and CFD tools.",
      "Strong leadership and communication skills."
    ],
    benefits: [
      "Comprehensive health, dental, and vision insurance.",
      "Generous relocation package to the UAE.",
      "Annual flight allowances.",
      "Performance-based bonuses."
    ],
    skills: ["Aerodynamics", "CFD", "ANSYS", "Structural Analysis", "Project Management"],
    deadline: new Date(new Date().setMonth(new Date().getMonth() + 1)), // 1 month from now
    isActive: true
  },
  {
    title: "Aviation Software Developer",
    description: "Join our Flight Systems IT division to build robust, fault-tolerant software for flight control and navigation systems. You will be writing critical C++ code that meets strict aviation safety standards (DO-178C). This is a vital role ensuring our fleets fly safely around the globe.",
    jobType: "contract",
    location: "Remote",
    isRemote: true,
    isUrgent: false,
    salary: { min: 90000, max: 150000, currency: "USD" },
    experienceLevel: "mid",
    responsibilities: [
      "Develop and test embedded C/C++ software for flight control systems.",
      "Perform rigorous unit testing and software verification.",
      "Write technical specifications conforming to DO-178C guidelines.",
      "Debug hardware-software integration issues."
    ],
    requirements: [
      "Bachelor's degree in Computer Science or Computer Engineering.",
      "3+ years of experience in embedded systems or real-time OS (RTOS).",
      "Expertise in modern C++ and memory management.",
      "Experience with avionics software development is a major plus."
    ],
    benefits: [
      "Fully remote work flexibility.",
      "Home office setup stipend.",
      "Flexible working hours."
    ],
    skills: ["C++", "Embedded Systems", "RTOS", "DO-178C", "Debugging"],
    deadline: null,
    isActive: true
  },
  {
    title: "Flight Operations Manager",
    description: "We represent a global leader in aviation and we are looking for a Flight Operations Manager to oversee daily scheduling, crew management, and fleet coordination at our primary hub. The ideal candidate has strong logistical capabilities and thrives in a high-pressure, time-sensitive environment.",
    jobType: "full-time",
    location: "Riyadh, Saudi Arabia",
    isRemote: false,
    isUrgent: true,
    salary: { min: 85000, max: 130000, currency: "USD" },
    experienceLevel: "senior",
    responsibilities: [
      "Manage daily flight schedules and crew roster operations.",
      "Ensure compliance with international aviation regulations (GACA/FAA).",
      "Coordinate with ground handling and maintenance departments.",
      "Respond to operational disruptions and implement contingency plans."
    ],
    requirements: [
      "5+ years of experience in airline or airport operations management.",
      "In-depth knowledge of aviation regulatory standards.",
      "Excellent crisis management and decision-making skills.",
      "Fluency in English (Arabic is a plus)."
    ],
    benefits: [
      "Tax-free salary package.",
      "Complimentary family flight tickets.",
      "Premium health coverage."
    ],
    skills: ["Operations Management", "Aviation Regulations", "Scheduling", "Leadership", "Crisis Management"],
    deadline: new Date(new Date().setMonth(new Date().getMonth() + 2)), // 2 months from now
    isActive: true
  },
  {
    title: "Aircraft Maintenance Technician",
    description: "BinLaden Aero seeks certified Aircraft Maintenance Technicians to join our overnight maintenance crew. You will perform routine inspections, troubleshooting, and repairs on wide-body aircraft to ensure maximum safety and operational readiness.",
    jobType: "part-time",
    location: "Karachi, Pakistan",
    isRemote: false,
    isUrgent: false,
    salary: { min: 40000, max: 60000, currency: "PKR" }, // Monthly estimate for part time
    experienceLevel: "junior",
    responsibilities: [
      "Conduct line maintenance and daily aircraft inspections.",
      "Diagnose mechanical and electrical faults using diagnostic software.",
      "Replace defective parts and perform required post-repair testing.",
      "Maintain detailed logs of all maintenance activities."
    ],
    requirements: [
      "Valid Aircraft Maintenance Engineer (AME) License or equivalent certification.",
      "1-2 years of hands-on aviation maintenance experience.",
      "Ability to work overnight shifts and weekends.",
      "Strong attention to detail and adherence to safety protocols."
    ],
    benefits: [
      "Paid overtime and shift differentials.",
      "Continuous training and certification sponsorships.",
      "Transport allowance."
    ],
    skills: ["Aviation Maintenance", "Troubleshooting", "Electrical Systems", "Inspection", "Safety Protocols"],
    deadline: null,
    isActive: true
  },
  {
    title: "Customer Success Representative - VIP Charter",
    description: "Deliver elite customer service for our high-net-worth VIP charter flight clients. You will manage booking inquiries, customized flight experiences, and ground luxury transport arrangements.",
    jobType: "full-time",
    location: "London, UK (Hybrid)",
    isRemote: true,
    isUrgent: false,
    salary: { min: 45000, max: 65000, currency: "USD" },
    experienceLevel: "entry",
    responsibilities: [
      "Serve as the primary point of contact for VIP charter bookings.",
      "Coordinate with catering and high-end transport providers.",
      "Handle customer feedback and ensure flawless trip execution.",
      "Maintain accurate CRM records of client preferences."
    ],
    requirements: [
      "Prior experience in luxury hospitality or VIP aviation support.",
      "Impeccable written and verbal communication skills.",
      "High emotional intelligence and discretion.",
      "Proficient with CRM software like Salesforce."
    ],
    benefits: [
      "Hybrid work model (3 days office, 2 days remote).",
      "Extensive bonuses based on client satisfaction.",
      "Prestigious networking opportunities."
    ],
    skills: ["Customer Service", "VIP Handling", "CRM", "Event Coordination", "Communication"],
    deadline: new Date(new Date().setMonth(new Date().getMonth() + 1)),
    isActive: true
  },
  {
    title: "Aerospace Quality Assurance Inspector",
    description: "Ensure that all manufactured parts and assemblies meet rigorous aviation safety standards. You will utilize advanced testing equipment to certify elements before they enter the final assembly line.",
    jobType: "contract",
    location: "Seattle, WA, USA",
    isRemote: false,
    isUrgent: true,
    salary: { min: 70000, max: 95000, currency: "USD" },
    experienceLevel: "mid",
    responsibilities: [
      "Visually and mechanically inspect aerospace components.",
      "Conduct non-destructive testing (NDT) on critical airframe features.",
      "Review manufacturing documentation for compliance with FAA regulations.",
      "Isolate and report non-conforming materials."
    ],
    requirements: [
      "Associates degree in Engineering Technology or related field.",
      "Current NDT Level II or III certifications.",
      "3+ years in aerospace manufacturing quality control.",
      "High attention to detail and analytical skills."
    ],
    benefits: [
      "End-of-contract performance bonus.",
      "On-site fitness and wellness center.",
      "Comprehensive medical coverage."
    ],
    skills: ["Quality Assurance", "NDT", "FAA Regulations", "Inspection", "Manufacturing"],
    deadline: new Date(new Date().setDate(new Date().getDate() + 14)), // 2 weeks
    isActive: true
  },
  {
    title: "Satellite Communications Engineer",
    description: "Design and deploy low-latency, high-bandwidth satellite communication relays for commercial aviation fleets. This role is pivotal for expanding in-flight Wi-Fi and real-time operational telemetry.",
    jobType: "full-time",
    location: "Remote",
    isRemote: true,
    isUrgent: false,
    salary: { min: 110000, max: 160000, currency: "USD" },
    experienceLevel: "senior",
    responsibilities: [
      "Design RF configurations for Ku/Ka-band satellite systems.",
      "Perform link budget analysis and network optimization.",
      "Troubleshoot interference and manage spectrum allocations.",
      "Liaise with satellite operators and ground station facilities."
    ],
    requirements: [
      "B.S. or M.S. in Electrical Engineering or Telecommunications.",
      "5+ years working directly with SatCom or RF engineering.",
      "Proficient with network simulation tools.",
      "Deep understanding of TCP/IP over satellite links."
    ],
    benefits: [
      "Fully remote infrastructure support.",
      "Stock options and equity grants.",
      "Unlim]]ited paid time off (PTO)."
    ],
    skills: ["SatCom", "RF Engineering", "Telecommunications", "TCP/IP", "Link Budget Analysis"],
    deadline: null,
    isActive: true
  }
];

const runSeed = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected successfully!');

    // The user explicitly provided employer ID '69f215633cdf9a4c134fe4f6' in their snippet
    const targetEmployerId = '69f215633cdf9a4c134fe4f6';
    
    // Let's verify the employer exists
    let employer = await Employer.findById(targetEmployerId);
    
    if (!employer) {
      console.warn(`Employer with ID ${targetEmployerId} not found.`);
      console.log('Fetching the first available verified employer instead...');
      employer = await Employer.findOne({ isVerified: true });
    }

    if (!employer) {
      throw new Error("No employers found in the database. Please create an employer first.");
    }

    console.log(`Using Employer ID: ${employer._id} (${employer.companyName || employer.name})`);

    // Prepare jobs array mapped with the employer ID
    const jobsToInsert = seedJobs.map(job => ({
      ...job,
      postedBy: employer._id
    }));

    console.log(`Inserting ${jobsToInsert.length} dummy jobs for BinLaden Aero...`);
    const insertedJobs = await Job.insertMany(jobsToInsert);

    console.log(`✅ Passed! Inserted ${insertedJobs.length} jobs successfully.`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

runSeed();
