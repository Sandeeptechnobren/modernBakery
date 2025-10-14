"use client";
import React from 'react';
import InputFields from "@/app/components/inputFields";

// explicit, narrow value type for this form step
type WarehouseValues = {
    latitude?: string;
    longitude?: string;
    // p12_file can be an existing filename (string) or a File when user uploads a new file
    p12_file?: File | string | null;
    is_efris?: string | number | boolean | null;
    is_branch?: string | number | boolean | null;
    // allow other keys but keep them typed as unknown to avoid `any`
    [key: string]: unknown;
};

type Props = {
    // p12_file may be string (existing filename) or File (new upload)
    values: WarehouseValues;
    errors?: Record<string, string>;
    touched?: Record<string, boolean>;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    // setFieldValue can accept any new field value, but we type it as unknown instead of any
    setFieldValue: (field: string, value: unknown) => void;
};

export default function WarehouseAdditionalInformation({ values, errors, touched, handleChange, setFieldValue }: Props) {
    // interpret backend value: explicit false-like values => '0' (No), everything else => '1' (Yes)
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
                {errors?.p12_file && touched?.p12_file && (
                    <span className="text-xs text-red-500 mt-1">{errors.p12_file}</span>
                )}
                {values.p12_file && (
                    <p className="text-sm text-gray-600 mt-1">Current file: {typeof values.p12_file === 'string' ? values.p12_file : values.p12_file.name}</p>
                )}
            </div>
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
                    value={normalizeIsBranch(values.is_branch)}
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
