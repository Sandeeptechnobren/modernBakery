"use client";

import { Icon } from "@iconify-icon/react";
import Link from "next/link";

export default function AddVehicle() {

    return (
        <>
            {/* header */}
            <div className="flex justify-between items-center mb-[20px]">
                <div className="flex items-center gap-[16px]">
                    <Link href="/dashboard/vehicle">
                        <Icon icon="lucide:arrow-left" width={24} />
                    </Link>
                    <h1 className="text-[20px] font-semibold text-[#181D27] flex items-center leading-[30px] mb-[5px]">
                        Add New Vehicle
                    </h1>
                </div>
            </div>

            {/* content */}
              <div>
        <form className="space-y-8">
      <div className="bg-white rounded-2xl shadow divide-y divide-gray-200 mb-6">
          {/* Route Details */}
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-800 mb-4">
              Vehicle Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Vehicle Code
                </label>
                <input
                  type="text"
                  placeholder="Enter Vehicle Code"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Vehicle Brand
                </label>
               <input
                  type="text"
                  placeholder="Enter Vehicle Name"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Number Plate
                </label>
               <input
                  type="text"
                  placeholder="Enter Vehicle Number Plate"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Chassis Number
                </label>
               <input
                  type="text"
                  placeholder="Enter Chassis Name"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Vehicle Type
                </label>
               <select id="type" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                    <option selected>Choose a Vehicle Type</option>
                    <option value="1">Tuktuk</option>
                    <option value="2">Truck</option>
                    <option value="3">Bike</option>
                    <option value="4">Van</option>
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
                  Owner Type
                </label>
                <select id="warehouse" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                    <option selected>Choose a Type</option>
                    <option value="1">Central</option>
                    <option value="2">Warehouse</option>
                </select>
                
              </div>
               <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Reference
                </label>
                <select id="warehouse" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                    <option selected>Choose a Reference</option>
                    <option value="A">Warehouse A</option>
                    <option value="B">Warehouse B</option>
                    <option value="C">Warehouse C</option>
                    <option value="D">Warehouse D</option>
                </select>
                
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
          {/* Additional Information */}
          <div className="bg-white rounded-2xl shadow divide-y divide-gray-200 ">
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-800 mb-4">
              Additional Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 {/* <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Odo Meter
                </label>
               <input
                  type="text"
                  placeholder="Enter Route Name"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div> */}
               <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Capacity
                </label>
               <input
                  type="text"
                  placeholder="Enter Capacity"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
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
