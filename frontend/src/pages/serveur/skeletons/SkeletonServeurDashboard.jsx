// src/components/serveur/skeletons/SkeletonServeurDashboard.jsx
import React from "react";

const SkeletonServeurDashboard = () => {
  return (
    <div className="min-h-screen bg-surface">
      {/* Header Skeleton */}
      <header className="w-full px-8 pt-8 max-w-7xl mx-auto">
        <div className="flex justify-end items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse"></div>
          </div>
          <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse"></div>
        </div>
      </header>

      {/* Main Content Skeleton */}
      <main className="pb-20 px-8 max-w-7xl mx-auto pt-4">
        {/* Title Skeleton */}
        <div className="mb-12">
          <div className="w-64 h-10 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="w-96 h-5 bg-gray-200 rounded animate-pulse"></div>
        </div>

        {/* Filter & Search Skeleton */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12">
          <div className="flex items-center p-1 bg-slate-100/50 rounded-2xl gap-1">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-28 h-10 bg-gray-200 rounded-xl animate-pulse"
              ></div>
            ))}
          </div>
          <div className="w-full lg:w-80 h-12 bg-gray-200 rounded-2xl animate-pulse"></div>
        </div>

        {/* Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="bg-white p-8 rounded-[2rem] border border-slate-100"
            >
              <div className="flex justify-between items-start mb-8">
                <div className="w-14 h-14 rounded-2xl bg-gray-200 animate-pulse"></div>
                <div className="w-20 h-6 bg-gray-200 rounded-lg animate-pulse"></div>
              </div>
              <div className="mb-8">
                <div className="w-32 h-7 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
              <div className="w-full h-12 bg-gray-200 rounded-xl animate-pulse"></div>
            </div>
          ))}
        </div>

        {/* Footer Skeleton */}
        <footer className="w-full flex flex-col md:flex-row justify-between items-center mt-16 pt-10 border-t border-slate-100">
          <div className="w-64 h-3 bg-gray-200 rounded animate-pulse mb-6 md:mb-0"></div>
          <div className="flex items-center gap-10">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-16 h-3 bg-gray-200 rounded animate-pulse"
              ></div>
            ))}
          </div>
        </footer>
      </main>
    </div>
  );
};

export default SkeletonServeurDashboard;
