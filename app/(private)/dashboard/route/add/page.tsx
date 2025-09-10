"use client";

import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useState } from "react";

export default function Route() {
  const [selectedDays, setSelectedDays] = useState<string[]>([]);

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  return (
    <>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/route">
            <Icon icon="lucide:arrow-left" width={24} />
          </Link>
          <h1 className="text-xl font-semibold text-gray-900">
            Add New Route
          </h1>
        </div>
      </div>

      {/* Content */}
      <div>
        <form className="space-y-8">
      <div className="bg-white rounded-2xl shadow divide-y divide-gray-200 mb-6">
          {/* Route Details */}
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-800 mb-4">
              Route Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Route Code
                </label>
                <input
                  type="text"
                  placeholder="Enter Route Code"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Route Name
                </label>
               <input
                  type="text"
                  placeholder="Enter Route Name"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Route Type
                </label>
                 <select id="type" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                    <option selected>Choose a Route Type</option>
                    <option value="1">Type 1</option>
                    <option value="2">Type 2</option>
                </select>
              </div>
            </div>
          </div>
       </div>
          {/* Location Information */}
          <div className="bg-white rounded-2xl shadow divide-y divide-gray-200 mb-6">
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-800 mb-4">
              Location Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Warehouse
                </label>
                <select id="warehouse" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                    <option selected>Choose a Warehouse</option>
                    <option value="A">Warehouse A</option>
                    <option value="B">Warehouse B</option>
                    <option value="C">Warehouse C</option>
                    <option value="D">Warehouse D</option>
                </select>
                
              </div>
             
            </div>
          </div>
        </div>
          {/* Additional Information */}
          <div className="bg-white rounded-2xl shadow divide-y divide-gray-200 ">
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-800 mb-4">
              Additional Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Status
                </label>
                <select id="status" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                    <option selected>Choose a Status</option>
                    <option value="active">Active</option>
                    <option value="inActive">In Active</option>
                </select>
              </div>
             
            </div>
          </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-4  pr-0">
            <button
              type="button"
              className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
           
            <button type="submit" className="rounded-lg bg-[#EA0A2A] text-white px-4 py-[10px] flex items-center gap-[8px] cursor-pointer">
                Submit
            </button>
          </div>
          </form>
       </div>
     
    </>
  );
}
