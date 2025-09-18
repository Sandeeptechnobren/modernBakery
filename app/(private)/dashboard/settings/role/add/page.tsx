"use client";

import { useState } from "react";
import InputFields from "@/app/components/inputFields";
import CustomCheckbox from "@/app/components/customCheckbox";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";

export default function AddRole({ onClose }: { onClose: () => void }) {
  const [roleName, setRoleName] = useState("");
  const [parentRole, setParentRole] = useState("");
  const [isLastEntity, setIsLastEntity] = useState(false);
  return (
    <div
      className="
        bg-white rounded-lg 
        w-full sm:max-w-[450px] 
        max-h-[90vh] 
        overflow-y-auto 
        p-4 sm:p-6
      "
    >
      <h2 className="text-lg font-semibold mb-4">Add New Role</h2>

      <form className="space-y-4">
        {/* Role Name */}
        <InputFields
          label="Role Name"
          value={roleName}
          onChange={(e) => setRoleName(e.target.value)}
        />

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            placeholder="Enter a description..."
            rows={3}
            className="w-full min-h-[100px] border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* Parent Role */}
        <InputFields
          label="Parent Role"
          value={parentRole}
          onChange={(e) => setParentRole(e.target.value)}
          options={[
            { value: "admin", label: "Admin" },
            { value: "manager", label: "Manager" },
            { value: "user", label: "User" },
          ]}
        />

        {/* Checkbox */}
        <CustomCheckbox
          id="lastEntity"
          label="Is Last Entity"
          checked={isLastEntity}
          onChange={(e) => setIsLastEntity(e.target.checked)}
        />

        {/* Footer */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            className="px-4 py-2 h-[40px] w-[80px] rounded-md font-semibold border border-gray-300 text-gray-700 hover:bg-gray-100"
            onClick={onClose}
          >
            Cancel
          </button>

          <SidebarBtn
            label="Save Role"
            isActive={true}
            onClick={onClose}
          />
        </div>
      </form>
    </div>
  );
}