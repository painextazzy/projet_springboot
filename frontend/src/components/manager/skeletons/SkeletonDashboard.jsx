// src/components/manager/SkeletonDashboard.jsx
import React from "react";

const SkeletonDashboard = ({ timeFilter = "day" }) => {
  return (
    <div className="bg-background font-body text-on-surface antialiased">
      <main className="min-h-screen">
        <section className="py-12 px-8 max-w-[1600px] mx-auto">
          {/* Header Skeleton */}
          <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3">
              <div className="bg-gray-200 rounded w-64 h-8 animate-pulse"></div>
              <div className="bg-gray-200 rounded w-96 h-5 animate-pulse"></div>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex gap-2">
                <div className="bg-gray-200 rounded-xl w-20 h-10 animate-pulse"></div>
                <div className="bg-gray-200 rounded-xl w-20 h-10 animate-pulse"></div>
                <div className="bg-gray-200 rounded-xl w-20 h-10 animate-pulse"></div>
              </div>
              <div className="bg-gray-200 rounded-xl w-48 h-10 animate-pulse"></div>
            </div>
          </div>

          {/* Bento Grid - 4 cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="col-span-1 md:col-span-2 p-8 rounded-[2rem] bg-gradient-to-br from-gray-300 to-gray-400 h-64 animate-pulse">
              <div className="flex flex-col justify-between h-full">
                <div>
                  <div className="bg-white/20 rounded w-32 h-4 mb-6"></div>
                  <div className="bg-white/20 rounded w-40 h-10 mb-2"></div>
                  <div className="bg-white/20 rounded w-56 h-4"></div>
                </div>
                <div className="flex gap-1 h-16">
                  {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                    <div
                      key={i}
                      className="w-full bg-white/20 rounded-t-sm h-12"
                    ></div>
                  ))}
                </div>
              </div>
            </div>

            {[1, 2].map((i) => (
              <div
                key={i}
                className="p-8 rounded-[2rem] bg-gray-100 h-64 flex flex-col justify-between animate-pulse"
              >
                <div>
                  <div className="bg-gray-200 rounded-full w-12 h-12 mb-6"></div>
                  <div className="bg-gray-200 rounded w-24 h-3 mb-2"></div>
                  <div className="bg-gray-200 rounded w-32 h-8"></div>
                </div>
                <div className="bg-gray-200 rounded-full w-32 h-6"></div>
              </div>
            ))}
          </div>

          {/* Service Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="p-6 rounded-[2rem] bg-gray-200 h-32 animate-pulse"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-gray-300 rounded-full w-10 h-10"></div>
                  <div>
                    <div className="bg-gray-300 rounded w-32 h-3 mb-2"></div>
                    <div className="bg-gray-300 rounded w-24 h-6"></div>
                  </div>
                </div>
                <div className="bg-gray-300 rounded w-48 h-3"></div>
              </div>
            ))}
          </div>

          {/* Chart Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 p-8 rounded-[2rem] bg-gray-50 h-96 animate-pulse">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <div className="bg-gray-200 rounded w-48 h-6 mb-2"></div>
                  <div className="bg-gray-200 rounded w-64 h-4"></div>
                </div>
                <div className="flex gap-4">
                  <div className="bg-gray-200 rounded w-24 h-3"></div>
                  <div className="bg-gray-200 rounded w-24 h-3"></div>
                </div>
              </div>
              <div className="flex items-end justify-between h-64 gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
                  <div
                    key={i}
                    className="flex flex-col items-center gap-2 w-full"
                  >
                    <div className="flex flex-col items-end h-44">
                      <div className="w-3 bg-gray-300 rounded-t-sm h-24"></div>
                      <div className="w-3 bg-gray-200 rounded-t-sm h-16 mt-1"></div>
                    </div>
                    <div className="bg-gray-200 rounded w-8 h-3"></div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-8 rounded-[2rem] bg-gray-800 h-96 animate-pulse">
              <div className="bg-gray-600 rounded w-48 h-6 mb-8"></div>
              <div className="space-y-8">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="bg-gray-600 rounded-full w-12 h-12"></div>
                    <div className="flex-1">
                      <div className="bg-gray-600 rounded w-32 h-3 mb-2"></div>
                      <div className="bg-gray-600 rounded w-24 h-5"></div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 pt-8 border-t border-gray-700">
                <div className="bg-gray-600 rounded w-full h-4 mb-3"></div>
                <div className="bg-gray-600 rounded w-full h-2"></div>
              </div>
            </div>
          </div>

          {/* Bottom Section Skeleton */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1 p-8 rounded-[2rem] bg-gray-100 h-48 animate-pulse">
              <div className="bg-gray-200 rounded w-24 h-3 mb-4"></div>
              <div className="bg-gray-200 rounded w-40 h-8 mb-2"></div>
              <div className="bg-gray-200 rounded w-32 h-4"></div>
              <div className="mt-4">
                <div className="bg-gray-200 rounded w-32 h-10"></div>
              </div>
            </div>
            <div className="lg:col-span-3 p-8 rounded-[2rem] bg-gray-50 animate-pulse">
              <div className="bg-gray-200 rounded w-48 h-6 mb-6"></div>
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center py-3"
                  >
                    <div className="bg-gray-200 rounded w-48 h-4"></div>
                    <div className="bg-gray-200 rounded w-16 h-4"></div>
                    <div className="bg-gray-200 rounded w-24 h-4"></div>
                    <div className="bg-gray-200 rounded w-32 h-4"></div>
                    <div className="bg-gray-200 rounded-full w-20 h-6"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default SkeletonDashboard;
