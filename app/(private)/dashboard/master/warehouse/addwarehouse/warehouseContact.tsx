"use client";

import InputFields from "@/app/components/inputFields";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";

type Props = {
  values: Record<string, string>;
  errors?: Record<string, string>;
  touched?: Record<string, boolean>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  setFieldValue: (field: string, value: string) => void;
};

export default function WarehouseContactDetails({ values, errors, touched, handleChange, setFieldValue }: Props) {
  const { countryOptions } = useAllDropdownListData();
  // fallback if context not populated
  const fallbackCountries = [
    { value: "uae", label: "UAE" },
    { value: "in", label: "India" },
    { value: "us", label: "USA" },
    { value: "uk", label: "UK" },
  ];

  const countries = countryOptions && countryOptions.length > 0 ? countryOptions : fallbackCountries;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full overflow-x-hidden">
      {/* Contact */}
      <div className="flex flex-col gap-2 w-full">
        <label className="text-sm font-medium text-gray-700 mb-2">Owner Contact Number </label>
        <div className="flex w-full">
          <select
            name="ownerContactCountry"
            value={values.ownerContactCountry}
            onChange={handleChange}
            className="border border-gray-300 rounded-l-md px-3 text-gray-900 h-[44px] w-24 sm:w-28"
          >
            {countries.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <input
            type="text"
            name="contact"
            value={values.contact}
            onChange={handleChange}
            placeholder="Contact Number"
            className={`border border-gray-300 rounded-r-md px-3 text-gray-900 placeholder-gray-400 flex-1 h-[44px] w-full ${errors?.contact && touched?.contact ? 'border-red-500' : ''}`}
          />
        </div>
        {errors?.contact && touched?.contact && <span className="text-xs text-red-500 mt-1">{errors.contact}</span>}
      </div>

      {/* Tin Number */}
      <div className="flex flex-col gap-4 w-full">
        <label className="text-sm font-medium text-gray-700">Tin Number</label>
        <div className="flex w-full">
          <select
            name="tinCode"
            value={values.tinCode}
            onChange={handleChange}
            className="border border-gray-300 rounded-l-md px-3 text-gray-900 h-[44px] w-24 sm:w-28"
          >
            {countries.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <input
            type="text"
            name="tinNumber"
            value={values.tinNumber}
            onChange={handleChange}
            placeholder="TIN Number"
            className="border border-gray-300 rounded-r-md px-3 text-gray-900 placeholder-gray-400 flex-1 h-[44px] w-full"
          />
        </div>
      </div>

      {/* Email */}
      <InputFields
        label="Email"
        name="email"
        value={values.email}
        onChange={handleChange}
        error={errors?.email && touched?.email ? errors.email : false}
      />
    </div>
  );
}
  