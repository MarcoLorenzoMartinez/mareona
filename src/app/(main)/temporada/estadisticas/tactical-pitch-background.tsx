import React from "react";

/**
 * Standard horizontal football pitch markings for tactical and passing visualization.
 */
export function TacticalPitchBackground() {
  return (
    <>
      {/* Outer Pitch Border */}
      <div className="absolute inset-2 rounded border border-white/25" />
      {/* Halfway Line */}
      <div className="absolute inset-y-2 left-1/2 w-px -translate-x-1/2 bg-white/25" />
      {/* Center Circle */}
      <div className="absolute left-1/2 top-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/25" />
      <div className="absolute left-1/2 top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/40" />
      {/* Penalty Boxes */}
      <div className="absolute left-2 top-1/2 h-20 w-10 -translate-y-1/2 border border-l-0 border-white/25" />
      <div className="absolute right-2 top-1/2 h-20 w-10 -translate-y-1/2 border border-r-0 border-white/25" />
      {/* Goal Areas */}
      <div className="absolute left-2 top-1/2 h-10 w-4 -translate-y-1/2 border border-l-0 border-white/20" />
      <div className="absolute right-2 top-1/2 h-10 w-4 -translate-y-1/2 border border-r-0 border-white/20" />
    </>
  );
}
