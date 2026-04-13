// src/components/manager/SkeletonMenu.jsx
import React from "react";

const SkeletonMenu = () => {
  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-12">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <div className="bg-gray-200 rounded w-48 h-8 animate-pulse mb-2"></div>
          <div className="bg-gray-200 rounded w-64 h-4 animate-pulse"></div>
        </div>
        <div className="bg-gray-200 rounded-xl w-32 h-10 animate-pulse"></div>
      </div>

      {/* Filters Skeleton */}
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div className="flex gap-2 bg-gray-100 p-1.5 rounded-2xl">
          <div className="bg-gray-200 rounded-xl w-16 h-8 animate-pulse"></div>
          <div className="bg-gray-200 rounded-xl w-16 h-8 animate-pulse"></div>
          <div className="bg-gray-200 rounded-xl w-16 h-8 animate-pulse"></div>
          <div className="bg-gray-200 rounded-xl w-16 h-8 animate-pulse"></div>
          <div className="bg-gray-200 rounded-xl w-16 h-8 animate-pulse"></div>
        </div>
        <div className="bg-gray-200 rounded-xl w-64 h-10 animate-pulse"></div>
      </div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
        {/* Carte d'ajout */}
        <div className="min-h-[340px] bg-gray-100 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-gray-200 mb-4 animate-pulse"></div>
          <div className="bg-gray-200 rounded w-32 h-5 animate-pulse"></div>
        </div>

        {/* Cartes produits */}
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div
            key={i}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
          >
            <div className="relative h-44 w-full bg-gray-200 animate-pulse"></div>
            <div className="p-4">
              <div className="bg-gray-200 rounded h-6 w-32 mb-2 animate-pulse"></div>
              <div className="bg-gray-200 rounded h-4 w-full mb-1 animate-pulse"></div>
              <div className="bg-gray-200 rounded h-4 w-3/4 mb-3 animate-pulse"></div>
              <div className="flex justify-between items-center">
                <div className="bg-gray-200 rounded h-7 w-24 animate-pulse"></div>
                <div className="bg-gray-200 rounded-full w-8 h-8 animate-pulse"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkeletonMenu;
