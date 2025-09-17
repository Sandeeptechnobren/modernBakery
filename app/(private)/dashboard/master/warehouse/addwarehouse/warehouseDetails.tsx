"use client";

import React from 'react';
import InputFields from "@/app/components/inputFields";
import IconButton from "@/app/components/iconButton";
import SettingPopUp from "@/app/components/settingPopUp";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";

type Props = {
    values: Record<string, string>;
    errors?: Record<string, string>;
    touched?: Record<string, boolean>;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    setFieldValue: (field: string, value: string) => void;
};

export default function WarehouseDetails({ values, errors, touched, handleChange, setFieldValue }: Props) {
    const [isOpen, setIsOpen] = React.useState(false);
    const { warehouseOptions, loading } = useAllDropdownListData();

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <InputFields
                label="Registration Number "
                name="registrationNumber"
                value={values.registrationNumber}
                onChange={handleChange}
                error={errors?.registrationNumber && touched?.registrationNumber ? errors.registrationNumber : false}
            />

            <InputFields
                label="Warehouse Type"
                name="warehouseType"
                value={values.warehouseType}
                onChange={handleChange}
                options={
                    [{value:"1", label:"Type 1"},
                    {value:"2", label:"Type 2"},
                    {value:"3", label:"Type 3"}
                    ]
                }
                error={errors?.warehouseType && touched?.warehouseType ? errors.warehouseType : false}
            />

            <InputFields
                label="Warehouse Name"
                name="warehouseName"
                value={values.warehouseName}
                onChange={handleChange}
                error={errors?.warehouseName && touched?.warehouseName ? errors.warehouseName : false}
            />

            <div className="flex items-end gap-2 max-w-[406px]">
                <InputFields
                    label="Warehouse Code"
                    name="warehouseCode"
                    value={values.warehouseCode}
                    onChange={handleChange}
                    error={errors?.warehouseCode && touched?.warehouseCode ? errors.warehouseCode : false}
                />

                <IconButton
                    bgClass="white"
                    className="mb-2 cursor-pointer text-[#252B37]"
                    icon="mi:settings"
                    onClick={() => setIsOpen(true)}
                />

                <SettingPopUp isOpen={isOpen} onClose={() => setIsOpen(false)} title="Warehouse Code" />
            </div>

            <InputFields label="Agent ID" name="agentId" value={values.agentId} onChange={handleChange} error={errors?.agentId && touched?.agentId ? errors.agentId : false} />

            <InputFields label="Warehouse Owner Name " name="ownerName" value={values.ownerName} onChange={handleChange} error={errors?.ownerName && touched?.ownerName ? errors.ownerName : false} />

            <InputFields
                label="Bussiness Type"
                name="bussinessType"
                value={values.bussinessType}
                onChange={handleChange}
                options={[{ value: "B2B ", label: "B2B " }]}
                error={errors?.bussinessType && touched?.bussinessType ? errors.bussinessType : false}
            />

            <InputFields
                label="Status"
                name="statusType"
                value={values.statusType}
                onChange={handleChange}
                options={[
                    { value: "active", label: "Active" },
                    { value: "inactive", label: "Inactive" },
                ]}
                error={errors?.statusType && touched?.statusType ? errors.statusType : false}
            />
        </div>
    );
}
