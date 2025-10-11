"use client";

import React from 'react';
import InputFields from "@/app/components/inputFields";
import IconButton from "@/app/components/iconButton";
import SettingPopUp from "@/app/components/settingPopUp";
import CustomPasswordInput from '@/app/components/customPasswordInput';
import CustomSecurityCode from "@/app/components/customSecurityCode";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";

type Props = {
    values: Record<string, string>;
    errors?: Record<string, string>;
    touched?: Record<string, boolean>;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    setFieldValue: (field: string, value: string) => void;
    isEditMode?: boolean;
};

export default function WarehouseDetails({ values, errors, touched, handleChange, setFieldValue, isEditMode }: Props) {
    const { companyOptions } = useAllDropdownListData();
    const [isOpen, setIsOpen] = React.useState(false);
    const [codeMode, setCodeMode] = React.useState<'auto'|'manual'>('auto');
    const [prefix, setPrefix] = React.useState('');

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="flex items-start gap-2 max-w-[406px]">
                <InputFields
                    required
                    label="Warehouse Code"
                    name="warehouse_code"
                    value={values.warehouse_code}
                    onChange={handleChange}
                    error={errors?.warehouse_code && touched?.warehouse_code ? errors.warehouse_code : false}
                    disabled={codeMode === 'auto'}
                />
                
                {!isEditMode && (
                    <>
                        <IconButton
                            bgClass="white"
                            className="  cursor-pointer text-[#252B37] pt-12"
                            icon="mi:settings"
                            onClick={() => setIsOpen(true)}
                        />
                        <SettingPopUp
                            isOpen={isOpen}
                            onClose={() => setIsOpen(false)}
                            title="Warehouse Code"
                            prefix={prefix}
                            setPrefix={setPrefix}
                            onSave={(mode, code) => {
                                setCodeMode(mode);
                                if (mode === 'auto' && code) {
                                    setFieldValue('warehouse_code', code);
                                } else if (mode === 'manual') {
                                    setFieldValue('warehouse_code', '');
                                }
                            }}
                        />
                    </>
                )}
                {errors?.warehouse_code && touched?.warehouse_code && (
                    <div className="text-xs text-red-500 mt-1">{errors.warehouse_code}</div>
                )}
            </div>
            <div className="flex flex-col gap-2">
                <InputFields
                    required
                    type='radio'
                    label="Warehouse Type"
                    name="warehouse_type"
                    value={values.warehouse_type}
                    onChange={handleChange}
                    options={[
                        { value: "0", label: "Agent" },
                        { value: "1", label: "Outlet" },
                    ]}
                />
                {errors?.warehouse_type && touched?.warehouse_type && (
                    <div className="text-xs text-red-500 mt-1">{errors.warehouse_type}</div>
                )}
            </div>
            <div className="flex flex-col gap-2">
                <InputFields
                    required
                    label="Warehouse Name"
                    name="warehouse_name"
                    value={values.warehouse_name}
                    onChange={handleChange}
                    error={errors?.warehouse_name && touched?.warehouse_name ? errors.warehouse_name : false}
                />
                {errors?.warehouse_name && touched?.warehouse_name && (
                    <div className="text-xs text-red-500 mt-1">{errors.warehouse_name}</div>
                )}
            </div>
            <div className="flex flex-col gap-2">
                <InputFields
                    required
                    label="Warehouse Owner Name"
                    name="owner_name"
                    value={values.owner_name}
                    onChange={handleChange}
                    error={errors?.owner_name && touched?.owner_name ? errors.owner_name : false}
                />
                {errors?.owner_name && touched?.owner_name && (
                    <div className="text-xs text-red-500 mt-1">{errors.owner_name}</div>
                )}
            </div>
            <div className="flex flex-col gap-2">
                <InputFields
                    required
                    label="Company"
                    name="company_id"
                    value={values.company_id}
                    options={companyOptions}
                    onChange={handleChange}
                    error={errors?.company_id && touched?.company_id ? errors.company_id : false}
                />
                {errors?.company_id && touched?.company_id && (
                    <div className="text-xs text-red-500 mt-1">{errors.company_id}</div>
                )}
            </div>
            <div className="flex flex-col gap-2">
                <CustomSecurityCode
                    label="Stock Capital"
                    value={values.stock_capital}
                    onChange={(e) => setFieldValue('stock_capital', e.target.value)}
                    placeholder="Enter Stock Capital"
                />
            </div>
            <div className="flex flex-col gap-2">
                <InputFields
                    required
                    type='radio'
                    label="Agent Type"
                    name="agent_type"
                    value={values.agent_type}
                    onChange={handleChange}
                    options={[
                        { value: "0", label: "Hariss" },
                        { value: "1", label: "Customer" },
                    ]}
                />
                {errors?.agent_type && touched?.agent_type && (
                    <div className="text-xs text-red-500 mt-1">{errors.agent_type}</div>
                )}
            </div>
            <div className="flex flex-col gap-2">
                <InputFields
                    required
                    label="Warehouse Manager"
                    name="warehouse_manager"
                    value={values.warehouse_manager}
                    onChange={handleChange}
                    error={errors?.warehouse_manager && touched?.warehouse_manager ? errors.warehouse_manager : false}
                />
                {errors?.warehouse_manager && touched?.warehouse_manager && (
                    <div className="text-xs text-red-500 mt-1">{errors.warehouse_manager}</div>
                )}
            </div>
        </div>
    );
}
