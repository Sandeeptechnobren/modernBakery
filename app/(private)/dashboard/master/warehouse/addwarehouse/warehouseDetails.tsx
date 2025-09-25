"use client";

import React from 'react';
import InputFields from "@/app/components/inputFields";
import IconButton from "@/app/components/iconButton";
import SettingPopUp from "@/app/components/settingPopUp";
import CustomPasswordInput from '@/app/components/customPasswordInput';
import { useAllDropdownListData } from '@/app/components/contexts/allDropdownListData';

type Props = {
    values: Record<string, string>;
    errors?: Record<string, string>;
    touched?: Record<string, boolean>;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    setFieldValue: (field: string, value: string) => void;
};

export default function WarehouseDetails({ values, errors, touched, handleChange, setFieldValue }: Props) {
    const { companyCustomersOptions } = useAllDropdownListData();
    const [isOpen, setIsOpen] = React.useState(false);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <InputFields
            required
                label="Registration Number"
                name="registation_no"
                value={values.registation_no}
                onChange={handleChange}
                error={errors?.registation_no && touched?.registation_no ? errors.registation_no : false}
            />
        
         <div className="flex items-end gap-2 max-w-[406px]">
                <InputFields
                required
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
         <InputFields
         required
                label="Warehouse Name"
                name="warehouse_name"
                value={values.warehouse_name}
                onChange={handleChange}
                error={errors?.warehouse_name && touched?.warehouse_name ? errors.warehouse_name : false}
            />
            <InputFields 
                label="Warehouse Owner Name" 
                name="owner_name" 
                value={values.owner_name} 
                onChange={handleChange} 
                error={errors?.owner_name && touched?.owner_name ? errors.owner_name : false} 
            />

            <InputFields
            required
                label="Company Customer"
                name="company_customer_id"
                value={values.company_customer_id}
                options={companyCustomersOptions}
                onChange={handleChange}
                error={errors?.company_customer_id && touched?.company_customer_id ? errors.company_customer_id : false}
            />

            <InputFields
            required
                label="Warehouse Manager"
                name="warehouse_manager"
                value={values.warehouse_manager}
                onChange={handleChange}
                error={errors?.warehouse_manager && touched?.warehouse_manager ? errors.warehouse_manager : false}
            />

            <InputFields
            required
                label="Warehouse Manager Contact"
                name="warehouse_manager_contact"
                value={values.warehouse_manager_contact}
                onChange={handleChange}
                error={errors?.warehouse_manager_contact && touched?.warehouse_manager_contact ? errors.warehouse_manager_contact : false}
            />

            <InputFields
            required
                label="Warehouse Type"
                name="warehouse_type"
                value={values.warehouse_type}
                onChange={handleChange}
                options={
                   [{ value: "0", label: "Agent" },
                     { value: "1", label: "Hariss" },
                     { value: "2", label: "Outlet" },
                   ]
                }
                error={errors?.warehouse_type && touched?.warehouse_type ? errors.warehouse_type : false}
            />

            <InputFields 
                label="Agent ID" 
                name="agent_id" 
                value={values.agent_id} 
                onChange={handleChange} 
                error={errors?.agent_id && touched?.agent_id ? errors.agent_id : false} 
            />

            <InputFields
            required
                label="Business Type"
                name="business_type"
                value={values.business_type}
                onChange={handleChange}
                options={[{ value: "1", label: "B2B " }]}
                error={errors?.business_type && touched?.business_type ? errors.business_type : false}
            />

            <InputFields
            required
                label="Status"
                name="status"
                value={values.status}
                onChange={handleChange}
                options={[
                    { value: "1", label: "Active" },
                    { value: "0", label: "Inactive" },
                ]}
                error={errors?.status && touched?.status ? errors.status : false}
            />
            <div>
                             <CustomPasswordInput
                             required
                                      label="Password"
                                      value={values.password}
                                      onChange={(e) => setFieldValue('password', e.target.value)}
                                    />
                                    {errors?.password && touched?.password && (
                                        <span className="text-xs text-red-500 mt-1">{errors.password}</span>
                                    )}
                           
            
                          </div>
            
        </div>
    );
}
