import React, { useEffect, useState } from "react";
import { X, Sparkles, Loader2, Trophy, TrendingUp, TrendingDown } from "lucide-react";
import { getAIRanking, type AIRankingEntry } from "../api/applicationsApi";
import { getMyJobs } from "../../jobs/api/jobsApi";

interface Props {
  onClose: () => void;
}

export function AIRankingModal({ onClose }: Props) {
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [rankings, setRankings] = useState<AIRankingEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      const res = await getMyJobs();
      setJobs(res.data || []);
    } catch {
      setError("Failed to load jobs");
    } finally {
      setIsLoadingJobs(false);
    }
  };

  const handleRank = async () => {
    if (!selectedJobId) return;
    setIsLoading(true);
    setError("");
    setRankings([]);
    try {
      const res = await getAIRanking(selectedJobId);
      setRankings(res.data);
    } catch (err: any) {
      setError(err.message || "AI ranking failed");
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return "text-emerald-700 bg-emerald-50";
    if (score >= 50) return "text-amber-700 bg-amber-50";
    return "text-red-700 bg-red-50";
  };

  const getScoreBarColor = (score: number) => {
    if (score >= 75) return "bg-emerald-500";
    if (score >= 50) return "bg-amber-500";
    return "bg-red-400";
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return "bg-amber-100 text-amber-800 border-amber-300";
    if (rank === 2) return "bg-slate-100 text-slate-700 border-slate-300";
    if (rank === 3) return "bg-orange-50 text-orange-700 border-orange-200";
    return "bg-slate-50 text-slate-600 border-slate-200";
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">AI Applicant Ranking</h2>
              <p className="text-xs text-slate-500">Powered by Gemini AI</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Job Selector */}
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400"
              disabled={isLoadingJobs}
            >
              <option value="">Select a job posting...</option>
              {jobs.map((job) => (
                <option key={job._id} value={job._id}>
                  {job.title}
                </option>
              ))}
            </select>
            <button
              onClick={handleRank}
              disabled={!selectedJobId || isLoading}
              className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl text-sm font-medium hover:from-violet-700 hover:to-indigo-700 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Trophy className="w-4 h-4" />
                  Rank All
                </>
              )}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700 mb-4">
              {error}
            </div>
          )}

          {isLoading && (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center animate-pulse">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm font-semibold text-slate-700">AI is analyzing applicants...</div>
                <div className="text-xs text-slate-400 mt-1">This may take a moment</div>
              </div>
            </div>
          )}

          {!isLoading && rankings.length > 0 && (
            <div className="space-y-3">
              {rankings.map((entry) => (
                <div
                  key={entry.applicationId}
                  className="bg-white border border-slate-200 rounded-xl p-4 hover:border-violet-300 transition-all"
                >
                  <div className="flex items-start gap-4">
                    {/* Rank badge */}
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold border shrink-0 ${getRankBadge(
                        entry.rank
                      )}`}
                    >
                      #{entry.rank}
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Name + Score */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-semibold text-slate-800">{entry.name}</div>
                        <div className={`px-3 py-1 rounded-lg text-sm font-bold ${getScoreColor(entry.score)}`}>
                          {entry.score}/100
                        </div>
                      </div>

                      {/* Score bar */}
                      <div className="w-full h-1.5 bg-slate-100 rounded-full mb-3">
                        <div
                          className={`h-full rounded-full transition-all ${getScoreBarColor(entry.score)}`}
                          style={{ width: `${entry.score}%` }}
                        />
                      </div>

                      {/* Pros / Cons */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 uppercase tracking-wider mb-1">
                            <TrendingUp className="w-3 h-3" /> Pros
                          </div>
                          <ul className="space-y-0.5">
                            {entry.pros.map((p, i) => (
                              <li key={i} className="text-xs text-slate-600">• {p}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <div className="flex items-center gap-1 text-[10px] font-semibold text-red-500 uppercase tracking-wider mb-1">
                            <TrendingDown className="w-3 h-3" /> Cons
                          </div>
                          <ul className="space-y-0.5">
                            {entry.cons.map((c, i) => (
                              <li key={i} className="text-xs text-slate-600">• {c}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isLoading && rankings.length === 0 && !error && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Trophy className="w-12 h-12 text-slate-300 mb-4" />
              <h3 className="text-lg font-bold text-slate-800 mb-1">Ready to Rank</h3>
              <p className="text-sm text-slate-500 max-w-sm">
                Select a job posting above and click "Rank All" to let AI score and rank all applicants based on their fit.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
