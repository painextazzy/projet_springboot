// src/components/manager/SkeletonCommandes.jsx
import React from "react";

const SkeletonCommandes = () => {
  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-12">
      {/* Search and Filter Section Skeleton */}
      <section className="mb-10 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center p-1 bg-gray-100/60 rounded-xl">
          <div className="bg-gray-200 rounded-md px-7 py-2 w-20 h-10 animate-pulse"></div>
          <div className="bg-gray-200 rounded-md px-7 py-2 w-24 h-10 animate-pulse ml-2"></div>
          <div className="bg-gray-200 rounded-md px-7 py-2 w-20 h-10 animate-pulse ml-2"></div>
        </div>

        <div className="relative w-full max-w-md">
          <div className="w-full h-12 bg-gray-200 rounded-xl animate-pulse"></div>
        </div>
      </section>

      {/* Orders Table Skeleton */}
      <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/30 border-b border-gray-100">
                <th className="px-10 py-6">
                  <div className="bg-gray-200 h-3 w-24 rounded animate-pulse"></div>
                </th>
                <th className="px-8 py-6">
                  <div className="bg-gray-200 h-3 w-16 rounded animate-pulse"></div>
                </th>
                <th className="px-8 py-6">
                  <div className="bg-gray-200 h-3 w-16 rounded animate-pulse"></div>
                </th>
                <th className="px-8 py-6">
                  <div className="bg-gray-200 h-3 w-20 rounded animate-pulse"></div>
                </th>
                <th className="px-8 py-6">
                  <div className="bg-gray-200 h-3 w-16 rounded animate-pulse"></div>
                </th>
                <th className="px-10 py-6 text-right">
                  <div className="bg-gray-200 h-3 w-20 rounded animate-pulse ml-auto"></div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-10 py-7">
                    <div className="bg-gray-200 h-5 w-28 rounded"></div>
                  </td>
                  <td className="px-8 py-7">
                    <div className="flex items-center gap-3">
                      <div className="bg-gray-200 rounded-full w-5 h-5"></div>
                      <div className="bg-gray-200 h-4 w-20 rounded"></div>
                    </div>
                  </td>
                  <td className="px-8 py-7">
                    <div className="bg-gray-200 h-4 w-16 rounded"></div>
                  </td>
                  <td className="px-8 py-7">
                    <div className="bg-gray-200 h-5 w-24 rounded"></div>
                  </td>
                  <td className="px-8 py-7">
                    <div className="bg-gray-200 h-6 w-20 rounded-full"></div>
                  </td>
                  <td className="px-10 py-7">
                    <div className="flex justify-end">
                      <div className="bg-gray-200 h-9 w-28 rounded-xl"></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Skeleton */}
        <footer className="px-10 py-8 bg-gray-50/10 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="bg-gray-200 h-4 w-48 rounded animate-pulse"></div>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-10 h-10 bg-gray-200 rounded-xl animate-pulse"
              ></div>
            ))}
          </div>
        </footer>
      </div>
    </div>
  );
};

export default SkeletonCommandes;
