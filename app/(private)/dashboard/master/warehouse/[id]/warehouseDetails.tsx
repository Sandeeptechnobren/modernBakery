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
                name="registation_no"
                value={values.registation_no}
                onChange={handleChange}
                error={errors?.registation_no && touched?.registation_no ? errors.registation_no : false}
            />

            <InputFields
                label="Warehouse Type"
                name="warehouse_type"
                value={values.warehouse_type}
                onChange={handleChange}
                options={
                    [{value:"1", label:"Type 1"},
                    {value:"2", label:"Type 2"},
                    {value:"3", label:"Type 3"}
                    ]
                }
                error={errors?.warehouse_type && touched?.warehouse_type ? errors.warehouse_type : false}
            />

            <InputFields
                label="Warehouse Name"
                name="warehouse_name"
                value={values.warehouse_name}
                onChange={handleChange}
                error={errors?.warehouse_name && touched?.warehouse_name ? errors.warehouse_name : false}
            />

            <div className="flex items-end gap-2 max-w-[406px]">
                <InputFields
                    label="Warehouse Code"
                    name="warehouse_code"
                    value={values.warehouse_code}
                    onChange={handleChange}
                    error={errors?.warehouse_code && touched?.warehouse_code ? errors.warehouse_code : false}
                />

                <IconButton
                    bgClass="white"
                    className="mb-2 cursor-pointer text-[#252B37]"
                    icon="mi:settings"
                    onClick={() => setIsOpen(true)}
                />

                <SettingPopUp isOpen={isOpen} onClose={() => setIsOpen(false)} title="Warehouse Code" />
            </div>

            <InputFields label="Agent ID" name="agent_id" value={values.agent_id} onChange={handleChange} error={errors?.agent_id && touched?.agent_id ? errors.agent_id : false} />

            <InputFields label="Warehouse Owner Name " name="owner_name" value={values.owner_name} onChange={handleChange} error={errors?.owner_name && touched?.owner_name ? errors.owner_name : false} />

            <InputFields
                label="Bussiness Type"
                name="business_type"
                value={values.business_type}
                onChange={handleChange}
                options={[{ value: "B2B ", label: "B2B " }]}
                error={errors?.business_type && touched?.business_type ? errors.business_type : false}
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
