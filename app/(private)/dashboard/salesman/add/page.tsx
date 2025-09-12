"use client";

import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import ContainerCard from "@/app/components/containerCard";
import SalesmanDetailsForm from "./salesmanDetailsForm";
import SalesmanContactDetails from "./salesmanContactDetails";

import SalesmanAdditionalInformation from "./salesmanAdditionalInformation";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
export default function AddCustomer() {

    return (
        <>
            {/* header */}
            <div className="flex justify-between items-center mb-[20px]">
                <div className="flex items-center gap-[16px]">
                    <Link href="/dashboard/salesman">
                        <Icon icon="lucide:arrow-left" width={24} />
                    </Link>
                    <h1 className="text-[20px] font-semibold text-[#181D27] flex items-center leading-[30px] mb-[5px]">
                        Add New Salesman
                    </h1>
                </div>
            </div>

            {/* content */}
            <div>
                <ContainerCard>
                    <h2 className="text-lg font-semibold mb-6">Salesman Details</h2>
                    <SalesmanDetailsForm />
                </ContainerCard>

                <ContainerCard>
                    <h2 className="text-lg font-semibold mb-6">Contact</h2>
                    <SalesmanContactDetails />
                </ContainerCard>
   <ContainerCard>
                    <h2 className="text-lg font-semibold mb-6">Additional Information</h2>
                    <SalesmanAdditionalInformation /> 
                 </ContainerCard>
              

                <div className="flex justify-end gap-3 mt-6">
                    {/* Cancel button */}
                    <button
                        className="px-6 py-2 h-[40px] w-[80px] rounded-md font-semibold border border-gray-300 text-gray-700 hover:bg-gray-100"
                        type="button"
                    >
                        Cancel
                    </button>

                    {/* Submit button with icon */}
                    <SidebarBtn
                        label="Submit"
                        isActive={true}
                        leadingIcon="mdi:check"   // checkmark icon
                        onClick={() => console.log()}
                    />
                </div>


            </div>
        </>
    );
}
