"use client";

import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useState } from "react";
import InputFields from "@/app/components/inputFields";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";

export default function AddRole() {
  const [roleName, setRolename] = useState("");
  const [activity, setActivity] = useState("");
  const [description, setDescription] = useState("");

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link href="/master/role">
            <Icon icon="lucide:arrow-left" width={24} />
          </Link>
          <h1 className="text-xl font-semibold text-gray-900">
            Add New Role
          </h1>
        </div>
      </div>

      {/* Content */}
      <div>
        <div className="bg-white rounded-2xl shadow divide-y divide-gray-200 mb-6">

          {/* Route Details */}
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-800 mb-4">
              Role Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <InputFields
                  label="Name"
                  value={roleName}
                  onChange={(e) => setRolename(e.target.value)}
                  
                />
              </div>
              <div>
                <InputFields
                  label="Activity"
                  value={activity}
                  onChange={(e) => setActivity(e.target.value)}
                  
                />
              </div>
              <div>
                <InputFields
                  label="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  
                />
              </div>
             
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-4 mt-6  pr-0">
          <button
            type="button"
            className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>

          <SidebarBtn
            label="Submit"
            isActive={true}
            leadingIcon="mdi:check"   // checkmark icon
            onClick={() => console.log("Form submitted ✅")} />
        </div>
      </div>

    </>
  );
}