"use client";
import React, { useState } from 'react';
import CustomSecurityCode from "@/app/components/customSecurityCode";
import InputFields from "@/app/components/inputFields";

type Props = {
    values: Record<string, string>;
    errors?: Record<string, string>;
    touched?: Record<string, boolean>;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    setFieldValue: (field: string, value: string) => void;
};

export default function WarehouseAdditionalInformation({ values, errors, touched, handleChange }: Props) {
     const [deposit, setDeposit] = useState("");
    const [stock, setStock] = useState("");
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <InputFields
                label="Device No. "
                name="deviceNo"
                value={values.deviceNo}
                onChange={handleChange}
                error={errors?.deviceNo && touched?.deviceNo ? errors.deviceNo : false}
            />
            <InputFields
                label="EFRIS Configuration  "
                name="efris"
                value={values.efris}
                onChange={handleChange}
                error={errors?.efris && touched?.efris ? errors.efris : false}
            />

            <CustomSecurityCode
                label="Stock Capital "
                value={stock}
                onChange={(e)=> setStock(e.target.value)}
                placeholder="Enter Stock Capital"
            />
            <CustomSecurityCode
                label="Deposit  "
                value={deposit}
                onChange={(e) => setDeposit(e.target.value)}
                placeholder="Enter Deposit"
            />

            {/* Second Row - Accuracy + Days */}
        </div>
    );
}
