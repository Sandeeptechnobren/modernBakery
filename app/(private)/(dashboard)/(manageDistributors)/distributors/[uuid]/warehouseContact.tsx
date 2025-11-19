"use client";
import React, { useState } from "react";
import InputFields from "@/app/components/inputFields";

type Props = {
  values: Record<string, string>;
  errors?: Record<string, string>;
  touched?: Record<string, boolean>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  setFieldValue: (field: string, value: string) => void;
};

// ======== MAIN COMPONENT ========
export default function WarehouseContactDetails({
  values,
  handleChange,
  setFieldValue,
}: Props) {
  // Country states
  const [ownerCountry, setOwnerCountry] = useState<{ name: string; code?: string; flag?: string }>({
    name: "Uganda",
    code: "+256",
    flag: "🇺🇬",
  });

  const [managerCountry, setManagerCountry] = useState<{ name: string; code?: string; flag?: string }>({
    name: "Uganda",
    code: "+256",
    flag: "🇺🇬",
  });


  const handleContactChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    field: string
  ) => {
    const inputValue = "value" in e.target ? e.target.value.replace(/\D/g, "") : "";
    setFieldValue(field, inputValue);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    // No local validation required here; delegate to parent/Formik validation
    handleChange(e);
  };

 
  // ======== RENDER ========
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {/* Owner Contact */}
      <div className="flex flex-col gap-2">
        <InputFields
          type="contact"
          label="Owner Contact Number"
          name="owner_number"
          selectedCountry={ownerCountry}
          setSelectedCountry={(country: { name: string; code?: string; flag?: string }) =>
            setOwnerCountry(country)
          }
          value={values.owner_number || ""}
          onChange={(e) => handleContactChange(e, "owner_number")}
        />
        
      </div>
      {/* Manager Contact */}
      <div className="flex flex-col gap-2">
        <InputFields
          type="contact"
          label="Manager Contact Number"
          name="warehouse_manager_contact"
          selectedCountry={managerCountry}
          setSelectedCountry={(country: { name: string; code?: string; flag?: string }) =>
            setManagerCountry(country)
          }
          value={values.warehouse_manager_contact || ""}
          onChange={(e) => handleContactChange(e, "warehouse_manager_contact")}
        />
        
      </div>
      {/* Owner Email */}
      <div className="flex flex-col gap-2">
        <InputFields
          label="Owner Email"
          name="owner_email"
          value={values.owner_email || ""}
          onChange={handleEmailChange}
         
        />
    
      </div>
    </div>
  );
}
