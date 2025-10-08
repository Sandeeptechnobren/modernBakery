"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ContainerCard from "@/app/components/containerCard";
import InputFields from "@/app/components/inputFields";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useLoading } from "@/app/services/loadingContext";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";


export default function AddAgentCustomerOrderPage() {
  const { showSnackbar } = useSnackbar();
  const { setLoading } = useLoading();
  const router = useRouter();
  const { customerTypeOptions } = useAllDropdownListData();


  const [formData, setFormData] = useState({
    type: "",
    customerName: "",
    comments: "",
  });

  // Handle input changes
  const handleChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  // Handle form submit
  const handleSubmit = async () => {
    if (!formData.type || !formData.customerName) {
      showSnackbar("Please fill in Type and Customer Name", "error");
      return;
    }

    try {
      setLoading(true);

      // Simulate API call
      await new Promise((res) => setTimeout(res, 1000));

      showSnackbar("Agent Customer Order added successfully", "success");
      router.push("/dashboard/agentTransaction/agentCustomerOrder");
    } catch (err) {
      showSnackbar("Failed to add Agent Customer Order", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-[20px] flex flex-col gap-5">
      <h1 className="text-[22px] font-semibold">Add Agent Customer Order</h1>

      <ContainerCard>
        {/* Flex row for InputFields */}
        <div className="flex flex-col sm:flex-row sm:gap-4">
          <InputFields
            label="Type"
            type="text"
            name="type"
            value={formData.type}
            options={customerTypeOptions}
            onChange={(e) => handleChange(e.target.name, e.target.value)}
           
          />
          <InputFields
            label="Customer Name"
            type="text"
            name="customerName"
            value={formData.customerName}
            onChange={(e) => handleChange(e.target.name, e.target.value)}
           
          />
          <InputFields
            label="Comments"
            type="text"
            name="comments"
            value={formData.comments}
            onChange={(e) => handleChange(e.target.name, e.target.value)}
            
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-3">
          <SidebarBtn
            href="#"
            isActive
            label="Submit"
            onClick={handleSubmit}
          />
          <SidebarBtn
            href="/dashboard/agentTransaction/agentCustomerOrder"
            isActive={false}
            label="Cancel"
          />
        </div>
      </ContainerCard>
    </div>
  );
}
