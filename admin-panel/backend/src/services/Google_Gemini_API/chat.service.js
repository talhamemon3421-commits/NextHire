import { GoogleGenAI } from "@google/genai";
import Job from "../../modules/jobs/jobs.model.js";
import Application from "../../modules/applications/applications.model.js";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "AIzaSyCVb89zTxY-lmg-RJZMKZi3fHq7wpuqK28",
});

const tools = [
  {
    functionDeclarations: [
      {
        name: "get_employer_jobs",
        description: "Retrieves a list of all jobs posted by the employer, including their current status and applicant counts.",
        parameters: {
          type: "OBJECT",
          properties: {},
        },
      },
      {
        name: "get_job_applicants",
        description: "Retrieves a list of applicants for a specific job. You must provide the job title to search for.",
        parameters: {
          type: "OBJECT",
          properties: {
            jobTitle: {
              type: "STRING",
              description: "The title of the job to fetch applicants for (e.g., 'Software Engineer').",
            },
          },
          required: ["jobTitle"],
        },
      },
      {
        name: "get_application_details",
        description: "Fetches full details of a specific application, including candidate bio, skills, and status history. Use this to analyze a specific candidate.",
        parameters: {
          type: "OBJECT",
          properties: {
            email: { type: "STRING", description: "The email of the applicant to fetch details for." },
          },
          required: ["email"],
        },
      },
      {
        name: "update_application_status",
        description: "Updates the status of an application (e.g., to 'shortlisted', 'accepted', or 'rejected').",
        parameters: {
          type: "OBJECT",
          properties: {
            email: { type: "STRING", description: "Applicant email" },
            newStatus: { type: "STRING", description: "pending, reviewing, shortlisted, interview, accepted, rejected" },
            note: { type: "STRING", description: "Optional hiring note explaining the decision" },
          },
          required: ["email", "newStatus"],
        },
      },
      {
        name: "schedule_interview",
        description: "Schedules an interview for a candidate.",
        parameters: {
          type: "OBJECT",
          properties: {
            email: { type: "STRING", description: "Applicant email" },
            date: { type: "STRING", description: "ISO date string for the interview" },
            link: { type: "STRING", description: "Meeting link (Zoom, Meet, etc.)" },
          },
          required: ["email", "date"],
        },
      },
      {
        name: "delete_job_posting",
        description: "Deletes a job posting. Use with caution.",
        parameters: {
          type: "OBJECT",
          properties: {
            jobTitle: { type: "STRING", description: "Title of the job to delete" },
          },
          required: ["jobTitle"],
        },
      },
      {
        name: "get_dashboard_stats",
        description: "Fetches high-level metrics for the employer's dashboard, such as total applications and active jobs.",
        parameters: {
          type: "OBJECT",
          properties: {},
        },
      },
    ],
  },
];

const systemInstruction = `You are an expert AI recruiting assistant for the NextHire platform.
Your job is to help employers manage their job postings and applicants.
You can answer general HR questions, draft emails, OR take actions on their behalf using the provided tools.
Always be professional, concise, and helpful. If you successfully execute a tool, tell the user what you did in a friendly way.
If you need more information to create a job (like title, description, or job type), ask the user. 
However, if the user says "add dummy data" or "you decide", feel free to fill in professional-sounding descriptions and requirements yourself.
Default to 'mid' experience level if not specified.
When asked "should I hire X", use 'get_application_details' to see their full profile before giving an opinion.`;

export const processChatMessage = async (employerId, history) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: history,
      config: {
        tools,
        systemInstruction,
        temperature: 0.7,
      },
    });

    const calls = response.functionCalls;
    if (calls && calls.length > 0) {
      // Execute the function calls
      const functionResponses = [];

      for (const call of calls) {
        let result;
        try {
          if (call.name === "get_employer_jobs") {
            const jobs = await Job.find({ postedBy: employerId }).select("title jobType location isRemote isActive applicationCount createdAt").lean();
            result = { jobs };
          } 
          else if (call.name === "get_job_applicants") {
            const titleArg = call.args?.jobTitle;
            const job = await Job.findOne({ postedBy: employerId, title: new RegExp(titleArg, "i") }).lean();
            if (!job) {
              result = { error: `No job found matching title: ${titleArg}` };
            } else {
              const apps = await Application.find({ job: job._id })
                .populate("applicant", "name email skills location")
                .select("status createdAt applicant")
                .lean();
              result = { job: job.title, applicants: apps.map(a => ({ name: a.applicant?.name, email: a.applicant?.email, status: a.status })) };
            }
          }
          else if (call.name === "get_application_details") {
            const email = call.args?.email;
            const app = await Application.findOne()
              .populate({
                path: 'applicant',
                match: { email: email }
              })
              .populate('job', 'title')
              .lean();
            
            if (!app || !app.applicant) {
              result = { error: `No application found for candidate with email: ${email}` };
            } else {
              result = { 
                candidateName: app.applicant.name,
                jobTitle: app.job.title,
                status: app.status,
                bio: app.applicant.bio,
                skills: app.applicant.skills,
                location: app.applicant.location,
                history: app.statusHistory
              };
            }
          }
          else if (call.name === "update_application_status") {
            const { email, newStatus, note } = call.args;
            const app = await Application.findOne().populate({ path: 'applicant', match: { email } });
            if (!app || !app.applicant) {
              result = { error: `No application found for email: ${email}` };
            } else {
              app.status = newStatus;
              app.statusHistory.push({ status: newStatus, changedBy: employerId, note });
              await app.save();
              result = { success: true, newStatus };
            }
          }
          else if (call.name === "schedule_interview") {
            const { email, date, link } = call.args;
            const app = await Application.findOne().populate({ path: 'applicant', match: { email } });
            if (!app || !app.applicant) {
              result = { error: `No application found for email: ${email}` };
            } else {
              app.interview = { date: new Date(date), link };
              app.status = "interview";
              app.statusHistory.push({ status: "interview", changedBy: employerId, note: "Interview scheduled via AI Agent" });
              await app.save();
              result = { success: true, date };
            }
          }
          else if (call.name === "create_job_posting") {
            const args = call.args;
            const newJob = await Job.create({
              title: args.title,
              description: args.description || "No description provided.",
              jobType: args.jobType || "full-time",
              location: args.location || (args.isRemote ? null : "Not specified"),
              isRemote: args.isRemote || false,
              salary: { min: args.salaryMin || null, max: args.salaryMax || null, currency: "PKR" },
              experienceLevel: args.experienceLevel || "mid",
              postedBy: employerId,
              isActive: true,
            });
            result = { success: true, jobId: newJob._id, title: newJob.title };
          }
          else if (call.name === "delete_job_posting") {
            const title = call.args?.jobTitle;
            const job = await Job.findOneAndDelete({ postedBy: employerId, title: new RegExp(title, "i") });
            if (!job) {
              result = { error: `No job found with title matching: ${title}` };
            } else {
              await Application.deleteMany({ job: job._id });
              result = { success: true, deletedJob: job.title };
            }
          }
          else if (call.name === "get_dashboard_stats") {
            const jobsCount = await Job.countDocuments({ postedBy: employerId, isActive: true });
            const appsCount = await Application.countDocuments({ job: { $in: await Job.find({ postedBy: employerId }).select('_id') } });
            result = { activeJobs: jobsCount, totalApplications: appsCount };
          }
          else {
            result = { error: "Unknown tool" };
          }
        } catch (err) {
          console.error("Tool execution error:", err);
          result = { error: err.message };
        }

        functionResponses.push({
          name: call.name,
          response: result,
        });
      }

      // Add the model's tool call response to the history
      history.push({
        role: "model",
        parts: calls.map(c => ({ functionCall: c })),
      });

      // Add the tool execution result to the history
      history.push({
        role: "user",
        parts: functionResponses.map(fr => ({
          functionResponse: { name: fr.name, response: fr.response }
        }))
      });

      // Call Gemini again to formulate the final answer based on the tool results
      const followupResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: history,
        config: {
          tools,
          systemInstruction,
          temperature: 0.7,
        },
      });

      history.push({
        role: "model",
        parts: [{ text: followupResponse.text }],
      });

      return {
        text: followupResponse.text,
        history,
      };
    } else {
      // Normal text response
      history.push({
        role: "model",
        parts: [{ text: response.text }],
      });
      return {
        text: response.text,
        history,
      };
    }
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    throw error;
  }
};
