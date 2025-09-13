"use client";

import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useState } from "react";
import InputFields from "@/app/components/inputFields";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import CustomPasswordInput from "@/app/components/customPasswordInput";

export default function AddUser() {
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [contactNo, setContactNo] = useState("");
  const [username, setUsername] = useState("");
  const [roleType, setRoleType] = useState("");
  const [status, setStatus] = useState("");
  

  return (
    <>

      {/* Header */}
      <div className="w-full h-full overflow-x-hidden p-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/settings/user">
            <Icon icon="lucide:arrow-left" width={24} />
          </Link>
          <h1 className="text-xl font-semibold text-gray-900">
            Add New User
          </h1>
        </div>
      </div>

      {/* Content */}
      <div>
        <div className="bg-white rounded-2xl shadow divide-y divide-gray-200 mb-6">

          {/* Route Details */}
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-800 mb-4">
              User Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <InputFields
                  label="Name"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  
                />
                 
              </div>
             
            </div>
          </div>
        </div>
        {/* Location Information */}
        <div className="bg-white rounded-2xl shadow divide-y divide-gray-200 mb-6">
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-800 mb-4">
              Contact
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <div>
                <InputFields
                  label="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <InputFields
                  label="Contact No."
                  value={contactNo}
                  onChange={(e) => setContactNo(e.target.value)}
                />

              </div>
              <div>
                <InputFields
                  label="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />

              </div>
              <div>
                 <CustomPasswordInput
                          label="Password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
               

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
                <InputFields
                  label="Role Type"
                  value={roleType}
                  onChange={(e) => setRoleType(e.target.value)}
                />

              </div>
              <div>
                <InputFields
                  label="Status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  options={[
                    { value: "active", label: "Active" },
                    { value: "inactive", label: "In Active" },
                  ]}
                />
              </div>

            </div>
          </div>
        </div>

        {/* Buttons */}
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
                  </div>
    </>
  );
}