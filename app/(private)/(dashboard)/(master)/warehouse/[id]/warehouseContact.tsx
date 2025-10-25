 
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

export default function WarehouseContactDetails({
  values,
  errors,
  touched,
  handleChange,
  setFieldValue,
}: Props) {

  // Separate country state for each contact input
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
 

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {/* Owner Contact Number */}
      <div className="flex flex-col gap-2">
        <InputFields
          required
          type="contact"
          label="Owner Contact Number"
          name="owner_number"
          setSelectedCountry={setOwnerCountry}
          selectedCountry={ownerCountry}
          value={`${values.owner_number ?? ""}`}
          onChange={handleChange}
        />
      </div>

      {/* Manager Contact Number */}
      <div className="flex flex-col gap-2">
        <InputFields
          type="contact"
          label="Manager Contact Number"
          name="warehouse_manager_contact"
          setSelectedCountry={setManagerCountry}
          selectedCountry={managerCountry}
          value={`${values.warehouse_manager_contact ?? ""}`}
          onChange={handleChange}
        />
      </div>

       <div>
         <InputFields
           label="Owner Email"
           name="owner_email"
           value={values.owner_email}
           onChange={handleChange}
           error={errors?.owner_email && touched?.owner_email ? errors.owner_email : false}
         />
         {errors?.owner_email && touched?.owner_email && (
           <span className="text-xs text-red-500 mt-1">{errors.owner_email}</span>
         )}
       </div>
    </div>
  );
}