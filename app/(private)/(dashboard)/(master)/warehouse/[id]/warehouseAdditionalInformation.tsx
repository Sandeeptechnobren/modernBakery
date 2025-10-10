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
            <div>
                <InputFields
                    required
                    label="Latitude"
                    name="latitude"
                    value={values.latitude}
                    onChange={handleChange}
                    error={errors?.latitude && touched?.latitude ? errors.latitude : false}
                />
                {errors?.latitude && touched?.latitude && (
                    <span className="text-xs text-red-500 mt-1">{errors.latitude}</span>
                )}
            </div>
            <div>
                <InputFields
                    required
                    label="Longitude"
                    name="longitude"
                    value={values.longitude}
                    onChange={handleChange}
                    error={errors?.longitude && touched?.longitude ? errors.longitude : false}
                />
                {errors?.longitude && touched?.longitude && (
                    <span className="text-xs text-red-500 mt-1">{errors.longitude}</span>
                )}
            </div>
            <div>
                <InputFields
                    required
                    label="P12 File"
                    name="p12_file"
                    type="file"
                    onChange={(e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (file) {
                            setFieldValue('p12_file', file.name);
                        }
                    }}
                    error={errors?.p12_file && touched?.p12_file ? errors.p12_file : false}
                />
                {errors?.p12_file && touched?.p12_file && (
                    <span className="text-xs text-red-500 mt-1">{errors.p12_file}</span>
                )}
                {values.p12_file && (
                    <p className="text-sm text-gray-600 mt-1">Current file: {values.p12_file}</p>
                )}
            </div>
            <div>
                <InputFields
                    required
                    type='radio'
                    label="Is EFRIS?"
                    name="is_efris"
                    value={values.is_efris}
                    onChange={handleChange}
                    options={[
                        { value: "1", label: "Enable" },
                        { value: "0", label: "Disable" },
                    ]}
                    error={errors?.is_efris && touched?.is_efris ? errors.is_efris : false}
                />
                {errors?.is_efris && touched?.is_efris && (
                    <span className="text-xs text-red-500 mt-1">{errors.is_efris}</span>
                )}
            </div>
            <div>
                <InputFields
                    label="Is Branch"
                    name="is_branch"
                    type='radio'
                    value={values.is_branch}
                    onChange={handleChange}
                    options={[
                        { value: "1", label: "Yes" },
                        { value: "0", label: "No" },
                    ]}
                    error={errors?.is_branch && touched?.is_branch ? errors.is_branch : false}
                />
                {errors?.is_branch && touched?.is_branch && (
                    <span className="text-xs text-red-500 mt-1">{errors.is_branch}</span>
                )}
            </div>
        </div>
    );
}
