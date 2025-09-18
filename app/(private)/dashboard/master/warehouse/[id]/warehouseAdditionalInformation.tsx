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
                label="Device No. "
                name="device_no"
                value={values.device_no}
                onChange={handleChange}
                error={errors?.device_no && touched?.device_no ? errors.device_no : false}
            />
            <InputFields
                label="EFRIS Configuration  "
                name="is_efris"
                value={values.is_efris}
                onChange={handleChange}
                error={errors?.is_efris && touched?.is_efris ? errors.is_efris : false}
            />

            <CustomSecurityCode
                label="Stock Capital "
                value={values.stock_capital}
                onChange={(e)=> setFieldValue('stock_capital', e.target.value)}
                placeholder="Enter Stock Capital"
            />
            <CustomSecurityCode
                label="Deposit  "
                value={values.deposite_amount}
                onChange={(e) => setFieldValue('deposite_amount', e.target.value)}
                placeholder="Enter Deposit"
            />

            {/* Second Row - Accuracy + Days */}
        </div>
    );
}
