"use client";

import React,{useState,useEffect} from 'react';
import InputFields from "@/app/components/inputFields";
import IconButton from "@/app/components/iconButton";
import SettingPopUp from "@/app/components/settingPopUp";
import CustomSecurityCode from "@/app/components/customSecurityCode";
import { getCompanyCustomerById } from '@/app/services/allApi';
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
import { agentCustomerList } from '@/app/services/allApi';

type Props = {
    values: Record<string, string>;
    errors?: Record<string, string>;
    touched?: Record<string, boolean>;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    setFieldValue: (field: string, value: string) => void;
    isEditMode?: boolean;
};

export default function WarehouseDetails({ values, errors, touched, handleChange, setFieldValue, isEditMode }: Props) {
    const [skeleton, setSkeleton] = useState({
            region_id: false,
            area_id: false,
        });
    const { companyOptions, allCompanyOptions,allCompanyCustomerOptions, companyCustomersOptions, fetchAreaOptions , ensureAgentCustomerLoaded, ensureCompanyCustomersLoaded, ensureCompanyLoaded,ensureAllCompanyCustomersLoaded,ensureAllCompanyOptionsLoaded} = useAllDropdownListData();

  // Load dropdown data
  useEffect(() => {
    ensureAgentCustomerLoaded();
    ensureCompanyCustomersLoaded();
    ensureCompanyLoaded();
    if(isEditMode){
        ensureAllCompanyCustomersLoaded();
        ensureAllCompanyOptionsLoaded();
    }
  }, [ensureAgentCustomerLoaded, ensureCompanyCustomersLoaded, ensureCompanyLoaded]);
    const [isOpen, setIsOpen] = React.useState(false);
    const [codeMode, setCodeMode] = React.useState<'auto' | 'manual'>('auto');
    const [prefix, setPrefix] = React.useState('');
    console.log("Values", values);
    console.log("Values", values.warehouse_name);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="flex flex-col gap-2">
                <InputFields
                    required
                    label="Distributor Code"
                    name="warehouse_code"
                    value={values.warehouse_code}
                    onChange={handleChange}
                    disabled={codeMode === 'auto'}
                    error={errors?.warehouse_code && touched?.warehouse_code ? errors.warehouse_code : false}
                />
            </div>
            <div className="flex flex-col gap-2">
                <InputFields
                    required
                    label="Distributor Type"
                    name="warehouse_type"
                    value={values.warehouse_type}
                    onChange={(e) => {
                        handleChange(e);
                        const val = (e.target as HTMLSelectElement).value;
                        if (val === 'Agent Warehouse') {
                            try {
                                // setFieldValue('company_outlet', '');
                                // setFieldValue('region_id', '');
                                // setFieldValue('area_id', '');
                            } catch (err) {
                            }
                        }
                    }}
                    options={[
                        { value: "Distributor", label: "Distributor" },
                        { value: "Company Outlet", label: "Company Outlet" },
                    ]}
                    error={errors?.warehouse_type && touched?.warehouse_type ? errors.warehouse_type : false}
                />
            </div>
            <div className="flex flex-col gap-2">
                <InputFields
                    required
                    label={values.warehouse_type === "Company Outlet" ? "Select Company Customer" : "Select Distributor"}
                    name="agent_customer"
                    searchable="true"
                    value={values.agent_customer}
                    options={isEditMode ? allCompanyCustomerOptions : companyCustomersOptions}
                    onChange={async (e) => {
                        const val = (e.target as HTMLSelectElement).value;
                        handleChange(e);
                        const name = companyCustomersOptions.filter((option: { label: string, value: string }) => {
                            return option.value === e.target.value
                        })[0].label;
                        setFieldValue("warehouse_name", name);
                        await getCompanyCustomerById(val).then((res) => {
                            if (res) {
                                const customer = res.data;
                                setFieldValue('region_id', String(customer.get_region.id) || '');
                                setFieldValue('area_id', String(customer.get_area.id) || '');

                            }
                        });
                    }}
                    error={errors?.agent_customer && touched?.agent_customer ? errors.agent_customer : false}
                />
            </div>
            {/* )} */}
            <div className="flex flex-col gap-2 hidden">
                <InputFields
                    required
                    label="Distributor Name"
                    name="warehouse_name"
                    value={values.warehouse_name}
                    onChange={handleChange}
                    error={errors?.warehouse_name && touched?.warehouse_name ? errors.warehouse_name : false}
                />
            </div>
            <div className="flex flex-col gap-2">
                <InputFields
                    required
                    label="Distributor Owner Name"
                    name="owner_name"
                    value={values.owner_name}
                    onChange={handleChange}
                    error={errors?.owner_name && touched?.owner_name ? errors.owner_name : false}
                />
            </div>
            <div className="flex flex-col gap-2">
                <InputFields
                    required
                    label="Company"
                    name="company"
                    value={values.company}
                    options={isEditMode ? allCompanyOptions : companyOptions}
                    onChange={handleChange}
                    error={errors?.company && touched?.company ? errors.company : false}
                />
            </div>
            <div className="flex flex-col gap-2">
                <InputFields
                    type="number"
                    name="tin_no"
                    label="TIN NO."
                    value={values.tin_no}
                    onChange={(e) => {
                        const val = e.target.value;

                        // Prevent negative values
                        if (Number(val) < 0) return;

                        setFieldValue("tin_no", val);
                    }}
                    placeholder="Enter TIN No."
                    min={0}                // ← prevents negative input
                    onKeyDown={(e) => {
                        // Block "-" key
                        if (e.key === "-" || e.key === "e") {
                            e.preventDefault();
                        }
                    }}
                />
            </div>

            <div className="flex flex-col gap-2">
                <InputFields
                    required
                    label="Distributor Manager"
                    name="warehouse_manager"
                    value={values.warehouse_manager}
                    onChange={handleChange}
                    error={errors?.warehouse_manager && touched?.warehouse_manager ? errors.warehouse_manager : false}
                />
            </div>
            <div className="flex flex-col gap-2">
                {/* <CustomSecurityCode
                    label="Agreed Stock Capital"
                    value={values.agreed_stock_capital}
                    onChange={(e) => setFieldValue('agreed_stock_capital', e.target.value)}
                    placeholder="Enter Stock Capital"
                    // error={errors?.warehouse_manager && touched?.warehouse_manager ? errors.warehouse_manager : false}
                /> */}
                <InputFields
                    type="number"
                    min={0}
                    integerOnly={true}
                    label="Agreed Stock Capital"
                    name="agreed_stock_capital"
                    value={values.agreed_stock_capital}
                    placeholder="Enter Stock Capital"
                    onChange={handleChange}
                    error={errors?.agreed_stock_capital && touched?.agreed_stock_capital ? errors.agreed_stock_capital : false}
                />
            </div>
        </div>
    );
}
