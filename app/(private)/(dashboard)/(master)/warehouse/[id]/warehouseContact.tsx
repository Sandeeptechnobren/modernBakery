"use client";
import React, { useState, useEffect } from "react";
import InputFields from "@/app/components/inputFields";

type Props = {
  values: Record<string, string>;
  errors?: Record<string, string>;
  touched?: Record<string, boolean>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  setFieldValue: (field: string, value: string) => void;
};

// ======== VALIDATION HELPERS ========
function validateContact(phone: string) {
  return /^\d{9,12}$/.test(phone) ? "" : "Contact number must be 9-12 digits";
}

function validateEmail(email: string) {
  if (!email) return "Email is required";
  if (!/^\S+@gmail\.com$/.test(email)) return "Enter a valid Gmail address";
  return "";
}

// ======== MAIN COMPONENT ========
export default function WarehouseContactDetails({
  values,
  errors = {},
  touched = {},
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

  // Error states
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});

  // ======== HANDLERS ========
  // Accept both HTMLInputElement and HTMLSelectElement
  const handleContactChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    field: string
  ) => {
    const inputValue =
      "value" in e.target ? e.target.value.replace(/\D/g, "") : "";
    setFieldValue(field, inputValue);
    setLocalErrors((prev) => ({
      ...prev,
      [field]: validateContact(inputValue),
    }));
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    handleChange(e);
    const emailError =
      "value" in e.target ? validateEmail(e.target.value) : "";
    setLocalErrors((prev) => ({
      ...prev,
      owner_email: emailError,
    }));
  };

  // ======== EFFECT TO VALIDATE ON LOAD ========
  useEffect(() => {
    setLocalErrors((prev) => ({
      ...prev,
      owner_number: validateContact(values.owner_number || ""),
      warehouse_manager_contact: validateContact(values.warehouse_manager_contact || ""),
      owner_email: validateEmail(values.owner_email || ""),
    }));
  }, [values.owner_number, values.warehouse_manager_contact, values.owner_email]);

  // ======== RENDER ========
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {/* Owner Contact */}
      <div className="flex flex-col gap-2">
        <InputFields
          required
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
        {localErrors.owner_number && touched?.owner_number && (
          <span className="text-xs text-red-500 mt-1">
            {localErrors.owner_number}
          </span>
        )}
      </div>
      {/* Manager Contact */}
      <div className="flex flex-col gap-2">
        <InputFields
          required
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
        {localErrors.warehouse_manager_contact && touched?.warehouse_manager_contact && (
          <span className="text-xs text-red-500 mt-1">
            {localErrors.warehouse_manager_contact}
          </span>
        )}
      </div>
      {/* Owner Email */}
      <div className="flex flex-col gap-2">
        <InputFields
          label="Owner Email"
          name="owner_email"
          value={values.owner_email || ""}
          onChange={handleEmailChange}
          // error={
          //   localErrors.owner_email && touched?.owner_email
          //     ? localErrors.owner_email
          //     : false
          // }
        />
        {localErrors.owner_email && touched?.owner_email && (
          <span className="text-xs text-red-500 mt-1">
            {localErrors.owner_email}
          </span>
        )}
      </div>
    </div>
  );
}
