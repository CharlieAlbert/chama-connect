"use client";
import React from "react";

export default function LandingLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-emerald-50">
      <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-emerald-500 flex items-center justify-center mb-4"></div>
    </div>
  );
}
