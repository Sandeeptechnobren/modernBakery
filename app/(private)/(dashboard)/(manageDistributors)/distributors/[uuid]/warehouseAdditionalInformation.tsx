"use client";
import React from 'react';
import InputFields from "@/app/components/inputFields";
import CustomPasswordInput from '@/app/components/customPasswordInput';
import { div } from 'framer-motion/client';

type WarehouseValues = {
    latitude?: string;
    longitude?: string;
    p12_file?: File | string | null;
    is_efris?: string | number | boolean | null;
    is_branch?: string | number | boolean | null;
    [key: string]: unknown;
};

type Props = {
    values: WarehouseValues;
    errors?: Record<string, string>;
    touched?: Record<string, boolean>;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    setFieldValue: (field: string, value: unknown) => void;
};

export default function WarehouseAdditionalInformation({ values, errors, touched, handleChange, setFieldValue }: Props) {
    const normalizeIsBranch = (val: string | number | boolean | null | undefined): string => {
        if (val === false || val === 0) return '0';
        if (val === null || typeof val === 'undefined') return '1';
        const s = String(val).toLowerCase().trim();
        if (s === 'false' || s === '0' || s === '' || s === 'null' || s === 'undefined') return '0';
        return '1';
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
             <div>
                <InputFields
                    required
                    type='radio'
                    label="Is EFRIS?"
                    name="is_efris"
                    value={normalizeIsBranch(values.is_efris)}
                    onChange={handleChange}
                    options={[
                        { value: "1", label: "Enable" },
                        { value: "0", label: "Disable" },
                    ]}
                />
                {errors?.is_efris && touched?.is_efris && (
                    <span className="text-xs text-red-500 mt-1">{errors.is_efris}</span>
                )}
            </div>
            {values.is_efris && (values.is_efris === '1' || values.is_efris === 1 || values.is_efris === true) &&
            <>
            <div>
                <InputFields
                    label="P12 File"
                    name="p12_file"
                    type="file"
                    onChange={(e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (file) {
                            // store the File object so submit can send it as 'p12'
                            setFieldValue('p12_file', file);
                        }
                    }}
                    error={errors?.p12_file && touched?.p12_file ? errors.p12_file : false}
                />
               
                {values.p12_file && (
                    <p className="text-sm text-gray-600 mt-1">Current file: {typeof values.p12_file === 'string' ? values.p12_file : values.p12_file.name}</p>
                )}
            </div>
           
            <div>
                 <CustomPasswordInput
                                  label="P12 Password"
                                  value={values.password ? String(values.password) : ''}
                                  onChange={(e) => setFieldValue("password", e.target.value)}
                                />
               
                {errors?.password && touched?.password && (
                    <span className="text-xs text-red-500 mt-1">{errors.password}</span>
                )}
            </div>
            <div>
                <InputFields
                    label="Is Branch"
                    name="is_branch"
                    type='radio'
                    value={normalizeIsBranch(values.is_branch)}
                    onChange={handleChange}
                    options={[
                        { value: "1", label: "Yes" },
                        { value: "0", label: "No" },
                    ]}
                    error={errors?.is_branch && touched?.is_branch ? errors.is_branch : false}
                />
                
            </div>
            </>
            }
           
        </div>
    );
}
