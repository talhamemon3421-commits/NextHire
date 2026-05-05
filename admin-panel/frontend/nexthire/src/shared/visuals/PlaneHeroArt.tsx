import React from "react";
import planeUrl from "@/shared/visuals/assets/plane.svg";
import cloudsUrl from "@/shared/visuals/assets/clouds.svg";

export function PlaneHeroArt() {
  return (
    <div className="relative h-44 w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-white/0 p-6">
      <div className="absolute inset-0 opacity-70">
        <img
          src={cloudsUrl}
          alt=""
          className="absolute -left-10 top-6 w-[34rem] select-none"
          draggable={false}
        />
        <img
          src={cloudsUrl}
          alt=""
          className="absolute -right-16 -top-6 w-[28rem] rotate-180 select-none opacity-70"
          draggable={false}
        />
      </div>

      <div className="relative flex items-center justify-between gap-6">
        <div>
          <div className="text-sm font-semibold text-white/80">
            Flight-ready operations
          </div>
          <div className="mt-1 text-xs leading-relaxed text-white/50">
            Secure employer access with rate-limited login and verified-role
            protection.
          </div>
        </div>

        <img
          src={planeUrl}
          alt="Airplane"
          className="h-24 w-24 -rotate-12 drop-shadow-[0_25px_35px_rgba(0,0,0,0.45)]"
        />
      </div>

      <div className="relative mt-4 flex items-center gap-2 text-[10px] text-white/45">
        <span className="inline-flex h-2 w-2 rounded-full bg-emerald-300/80" />
        <span>Systems online</span>
        <span className="mx-2 text-white/20">•</span>
        <span>Cabin secure</span>
      </div>
    </div>
  );
}

