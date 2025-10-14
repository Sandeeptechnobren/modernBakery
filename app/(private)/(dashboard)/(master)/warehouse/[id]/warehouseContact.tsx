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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      <div className="flex flex-col gap-2">
          <InputFields
            required
            type="contact"
            label="Owner Contact Number"
            name="owner_number"
            value={`${values.ownerContactCountry ?? '+91'}|${values.owner_number ?? ''}`}
            onChange={(e) => {
                const combined = (e.target as HTMLInputElement).value || '';
                if (combined.includes('|')) {
                  const [code = '+91', num = ''] = combined.split('|');
                  const numDigits = num.replace(/\D/g, '');
                  const codeDigits = String(code).replace(/\D/g, '');
                  const localNumber = codeDigits && numDigits.startsWith(codeDigits) ? numDigits.slice(codeDigits.length) : numDigits;
                  setFieldValue('ownerContactCountry', code);
                  setFieldValue('owner_number', localNumber);
                } else {
                  const digits = combined.replace(/\D/g, '');
                  const currentCountry = (values.ownerContactCountry || '+91').replace(/\D/g, '');
                  if (currentCountry && digits.startsWith(currentCountry)) {
                    setFieldValue('ownerContactCountry', `+${currentCountry}`);
                    setFieldValue('owner_number', digits.slice(currentCountry.length));
                  } else {
                    setFieldValue('owner_number', digits);
                  }
                }
            }}
            error={errors?.owner_number && touched?.owner_number ? errors.owner_number : false}
          />
         {errors?.owner_number && touched?.owner_number && (
          <span className="text-xs text-red-500 mt-1">{errors.owner_number}</span>
        )}
      </div>
      <div className="flex flex-col gap-2 ">
          <InputFields
            required
            type="contact"
            label="Manager Contact Number"
            name="warehouse_manager_contact"
            value={`${values.managerContactCountry ?? '+91'}|${values.warehouse_manager_contact ?? ''}`}
            onChange={(e) => {
              const combined = (e.target as HTMLInputElement).value || '';
                if (combined.includes('|')) {
                const [code = '+91', num = ''] = combined.split('|');
                const numDigits = num.replace(/\D/g, '');
                const codeDigits = String(code).replace(/\D/g, '');
                const localNumber = codeDigits && numDigits.startsWith(codeDigits) ? numDigits.slice(codeDigits.length) : numDigits;
                setFieldValue('managerContactCountry', code);
                setFieldValue('warehouse_manager_contact', localNumber);
              } else {
                const digits = combined.replace(/\D/g, '');
                const currentCountry = (values.managerContactCountry || '+91').replace(/\D/g, '');
                if (currentCountry && digits.startsWith(currentCountry)) {
                  setFieldValue('managerContactCountry', `+${currentCountry}`);
                  setFieldValue('warehouse_manager_contact', digits.slice(currentCountry.length));
                } else {
                  setFieldValue('warehouse_manager_contact', digits);
                }
              }
            }}
            error={errors?.warehouse_manager_contact && touched?.warehouse_manager_contact ? errors.warehouse_manager_contact : false}
          />
           {errors?.warehouse_manager_contact && touched?.warehouse_manager_contact && (
          <span className="text-xs text-red-500 mt-1">{errors.warehouse_manager_contact}</span>
        )}
        </div>
       
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
  