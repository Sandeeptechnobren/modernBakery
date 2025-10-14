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
  const { onlyCountryOptions } = useAllDropdownListData();


  const countries = onlyCountryOptions && onlyCountryOptions.length > 0 ? onlyCountryOptions : [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full overflow-x-hidden">
      {/* Contact */}
      <div className="flex flex-col gap-2 w-full">
        <div className="flex w-full">
          <InputFields
            required
            type="contact"
            label="Owner Contact Number"
            name="owner_number"
            value={`${values.ownerContactCountry ?? '+91'}|${values.owner_number ?? ''}`}
            onChange={(e) => {
              const combined = (e.target as HTMLInputElement).value || '';
              const [code = '+91', num = ''] = combined.split('|');
              setFieldValue('ownerContactCountry', code);
              setFieldValue('owner_number', num);
            }}
            error={errors?.owner_number && touched?.owner_number ? errors.owner_number : false}
          />
        </div>
         {errors?.owner_number && touched?.owner_number && (
          <span className="text-xs text-red-500 mt-1">{errors.owner_number}</span>
        )}
      </div>
      <div className="flex flex-col gap-2 w-full">
        <div className="flex w-full">
          <InputFields
            required
            type="contact"
            label="Manager Contact Number"
            name="warehouse_manager_contact"
            value={`${values.managerContactCountry ?? '+91'}|${values.warehouse_manager_contact ?? ''}`}
            onChange={(e) => {
              const combined = (e.target as HTMLInputElement).value || '';
              const [code = '+91', num = ''] = combined.split('|');
              setFieldValue('managerContactCountry', code);
              setFieldValue('warehouse_manager_contact', num);
            }}
            error={errors?.warehouse_manager_contact && touched?.warehouse_manager_contact ? errors.warehouse_manager_contact : false}
          />
        </div>
        {errors?.warehouse_manager_contact && touched?.warehouse_manager_contact && (
          <span className="text-xs text-red-500 mt-1">{errors.warehouse_manager_contact}</span>
        )}
      </div>
      {/* Email */}
      <div>
        <InputFields
          label="Owner Email"
          required
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
  