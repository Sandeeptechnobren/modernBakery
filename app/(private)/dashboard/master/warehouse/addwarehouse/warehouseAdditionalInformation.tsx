"use client";
import React from 'react';
import CustomSecurityCode from "@/app/components/customSecurityCode";
import InputFields from "@/app/components/inputFields";

type Props = {
    values: Record<string, string>;
    errors?: Record<string, string>;
    touched?: Record<string, boolean>;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    setFieldValue: (field: string, value: string) => void;
};

export default function WarehouseAdditionalInformation({ values, errors, touched, handleChange, setFieldValue }: Props) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <InputFields
            required
                label="Device No."
                name="device_no"
                value={values.device_no}
                onChange={handleChange}
                error={errors?.device_no && touched?.device_no ? errors.device_no : false}
            />
            <InputFields
            required
                label="EFRIS Configuration"
                name="is_efris"
                value={values.is_efris}
                onChange={handleChange}
                error={errors?.is_efris && touched?.is_efris ? errors.is_efris : false}
            />

            <InputFields
            required
                label="P12 File"
                name="p12_file"
                type="file"
                value={values.p12_file}
                onChange={(e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) {
                        setFieldValue('p12_file', file.name);
                    }
                }}
                error={errors?.p12_file && touched?.p12_file ? errors.p12_file : false}
            />

            <CustomSecurityCode
                label="Stock Capital"
                value={values.stock_capital}
                onChange={(e)=> setFieldValue('stock_capital', e.target.value)}
                placeholder="Enter Stock Capital"
            />
            <CustomSecurityCode
                label="Deposit Amount"
                value={values.deposite_amount}
                onChange={(e) => setFieldValue('deposite_amount', e.target.value)}
                placeholder="Enter Deposit"
            />

            <InputFields
                label="Branch ID"
                name="branch_id"
                value={values.branch_id}
                onChange={handleChange}
                error={errors?.branch_id && touched?.branch_id ? errors.branch_id : false}
            />

            <InputFields
                label="Is Branch"
                name="is_branch"
                value={values.is_branch}
                onChange={handleChange}
                options={[
                    { value: "1", label: "Yes" },
                    { value: "0", label: "No" },
                ]}
                error={errors?.is_branch && touched?.is_branch ? errors.is_branch : false}
            />

            <InputFields
                label="Invoice Sync"
                name="invoice_sync"
                value={values.invoice_sync}
                onChange={handleChange}
                options={[
                    { value: "1", label: "Enabled" },
                    { value: "0", label: "Disabled" },
                ]}
                error={errors?.invoice_sync && touched?.invoice_sync ? errors.invoice_sync : false}
            />

                       

                     
        </div>
    );
}
