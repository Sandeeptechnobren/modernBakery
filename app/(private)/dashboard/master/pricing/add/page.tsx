"use client";

import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useState } from "react";
import InputFields from "@/app/components/inputFields";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";

export default function Route() {
  const [id, setId] = useState("");
  const [osaCode, setOsaCode] = useState("");
  const [pricingPlanName, setPricingPlanName] = useState("");
  const [applyOn, setApplyOn] = useState("");
  const [pricingPlanDesc, setPricingPlanDesc] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  return (
    <>

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/master/pricing">
            <Icon icon="lucide:arrow-left" width={24} />
          </Link>
          <h1 className="text-xl font-semibold text-gray-900">
            Add New Pricing Plan
          </h1>
        </div>
      </div>

      {/* Content */}
      <div>
        <div className="bg-white rounded-2xl shadow divide-y divide-gray-200 mb-6">

          {/* Route Details */}
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-800 mb-4">
              Pricing Plan Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <InputFields
                  label="Id"
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  
                />
                 
              </div>
              <div>
                <InputFields
                  label="OSA Code"
                  value={osaCode}
                  onChange={(e) => setOsaCode(e.target.value)}
                />
              </div>
              <div>
                <InputFields
                  label="Pricing Plan Name"
                  value={pricingPlanName}
                  onChange={(e) => setPricingPlanName(e.target.value)}
                />
              </div>
               <div>
                <InputFields
                  label="Apply On"
                  value={applyOn}
                  onChange={(e) => setApplyOn(e.target.value)}
                  options={[
                    { value: "1", label: "Customer" },
                    { value: "2", label: "Channel" },
                    { value: "3", label: "Category" },
                  ]}
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
                  label="Pricing Plan Description"
                  value={pricingPlanDesc}
                  onChange={(e) => setPricingPlanDesc(e.target.value)}
                />
              </div>
              <div>
                <InputFields
                  label="From Date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </div>
              <div>
                <InputFields
                  label="To Date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
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

    </>
  );
}