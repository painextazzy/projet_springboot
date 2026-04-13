// src/components/manager/skeletons/SkeletonUtilisateurs.jsx
import React from "react";

const SkeletonUtilisateurs = () => {
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

      {/* Filters */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-2">
          <div className="bg-gray-200 rounded-lg w-24 h-10 animate-pulse"></div>
          <div className="bg-gray-200 rounded-lg w-24 h-10 animate-pulse"></div>
          <div className="bg-gray-200 rounded-lg w-24 h-10 animate-pulse"></div>
        </div>
        <div className="bg-gray-200 rounded-xl w-64 h-10 animate-pulse"></div>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="px-6 py-4 text-left">
                  <div className="bg-gray-200 h-3 w-16 rounded animate-pulse"></div>
                </th>
                <th className="px-6 py-4 text-left">
                  <div className="bg-gray-200 h-3 w-24 rounded animate-pulse"></div>
                </th>
                <th className="px-6 py-4 text-left">
                  <div className="bg-gray-200 h-3 w-32 rounded animate-pulse"></div>
                </th>
                <th className="px-6 py-4 text-left">
                  <div className="bg-gray-200 h-3 w-20 rounded animate-pulse"></div>
                </th>
                <th className="px-6 py-4 text-left">
                  <div className="bg-gray-200 h-3 w-24 rounded animate-pulse"></div>
                </th>
                <th className="px-6 py-4 text-center">
                  <div className="bg-gray-200 h-3 w-16 rounded animate-pulse mx-auto"></div>
                </th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="border-b border-gray-100 animate-pulse">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                      <div>
                        <div className="bg-gray-200 h-4 w-32 rounded mb-1"></div>
                        <div className="bg-gray-200 h-3 w-24 rounded"></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="bg-gray-200 h-4 w-40 rounded"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="bg-gray-200 h-4 w-28 rounded"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="bg-gray-200 rounded-full h-6 w-20"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="bg-gray-200 h-4 w-24 rounded"></div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-2">
                      <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                      <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t flex justify-between items-center">
          <div className="bg-gray-200 h-4 w-48 rounded animate-pulse"></div>
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
    </div>
  );
};

export default SkeletonUtilisateurs;
