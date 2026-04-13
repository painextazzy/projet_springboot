// src/components/manager/skeletons/SkeletonTables.jsx
import React from "react";

const SkeletonTables = () => {
  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <div className="bg-gray-200 rounded w-48 h-8 animate-pulse mb-2"></div>
          <div className="bg-gray-200 rounded w-64 h-4 animate-pulse"></div>
        </div>
        <div className="bg-gray-200 rounded-xl w-32 h-10 animate-pulse"></div>
      </div>

      {/* Search Bar */}
      <div className="mb-6 flex justify-end">
        <div className="bg-gray-200 rounded-xl w-64 h-10 animate-pulse"></div>
      </div>

      {/* Grid des tables */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div
            key={i}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
          >
            {/* Image/Icon */}
            <div className="h-32 bg-gray-200 animate-pulse flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-gray-300 animate-pulse"></div>
            </div>

            {/* Contenu */}
            <div className="p-4">
              <div className="bg-gray-200 rounded h-6 w-32 mb-2 animate-pulse"></div>
              <div className="bg-gray-200 rounded h-4 w-20 mb-3 animate-pulse"></div>

              {/* Statut */}
              <div className="flex justify-between items-center mt-4">
                <div className="bg-gray-200 rounded-full h-6 w-24 animate-pulse"></div>
                <div className="flex gap-2">
                  <div className="bg-gray-200 rounded-lg w-8 h-8 animate-pulse"></div>
                  <div className="bg-gray-200 rounded-lg w-8 h-8 animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="mt-8 flex justify-between items-center">
        <div className="bg-gray-200 rounded h-4 w-48 animate-pulse"></div>
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="w-10 h-10 bg-gray-200 rounded-xl animate-pulse"
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SkeletonTables;
