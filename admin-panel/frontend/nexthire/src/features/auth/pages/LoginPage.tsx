import React from "react";
import { useNavigate } from "react-router-dom";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { PlaneHeroArt } from "@/shared/visuals/PlaneHeroArt";

export function LoginPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-dvh bg-[#0F172A] text-white">
      <div className="relative min-h-dvh overflow-hidden">
        <div className="pointer-events-none absolute inset-0 opacity-70">
          <div className="absolute -left-56 -top-64 h-[42rem] w-[42rem] rounded-full bg-sky-500/20 blur-3xl" />
          <div className="absolute -right-64 top-24 h-[42rem] w-[42rem] rounded-full bg-indigo-500/15 blur-3xl" />
        </div>

        <div className="mx-auto grid min-h-dvh max-w-6xl items-stretch gap-10 px-6 py-10 md:grid-cols-2 md:py-14">
          <section className="relative flex flex-col justify-center">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-white/10 ring-1 ring-white/10 backdrop-blur grid place-items-center">
                <span className="text-sm font-black tracking-tight">BA</span>
              </div>
              <div>
                <div className="text-sm font-semibold text-white/90">
                  BinLaden Aero
                </div>
                <div className="text-xs text-white/45">
                  Training the next generation of professional pilots
                </div>
              </div>
            </div>

            <h1 className="mt-10 text-3xl font-bold leading-tight tracking-tight md:text-4xl">
              Your hiring command center{" "}
              <span className="text-sky-300">at cruising altitude</span>.
            </h1>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/60">
              Review applicants, schedule interviews, and move candidates from
              briefing to boarding—fast, organized, and secure.
            </p>

            <ul className="mt-8 space-y-3 text-sm text-white/65">
              <li className="flex gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-sky-300/80" />
                AI-assisted screening and shortlists for quicker decisions
              </li>
              <li className="flex gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-sky-300/80" />
                End-to-end pipeline tracking from application to offer
              </li>
              <li className="flex gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-sky-300/80" />
                Interview scheduling that keeps your team on course
              </li>
            </ul>

            <div className="mt-10">
              <PlaneHeroArt />
            </div>
          </section>

          <section className="flex items-center justify-center">
            <div className="w-full max-w-md">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/40 backdrop-blur">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xl font-bold tracking-tight">
                      Welcome back
                    </div>
                    <div className="mt-1 text-sm text-white/55">
                      Sign in to your employer panel
                    </div>
                  </div>
                  <div className="hidden h-10 w-10 rounded-2xl bg-gradient-to-br from-sky-400/40 to-indigo-400/30 ring-1 ring-white/10 md:block" />
                </div>

                <div className="mt-6">
                  <LoginForm onSuccess={() => navigate("/dashboard")} />
                </div>

                <div className="mt-6 text-xs text-white/40">
                  By signing in you agree to company security policies.
                </div>
              </div>

              <div className="mt-6 text-center text-xs text-white/35">
                © {new Date().getFullYear()} BinLaden Aero
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

