"use client";

import { useState, useCallback } from "react";
import { Icon } from "@iconify-icon/react";
import { useRouter } from "next/navigation";

import Table, {
    listReturnType,
    TableDataType,
    searchReturnType,
} from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import {
    companyList,
    companyListGlobalSearch,
} from "@/app/services/allApi";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useLoading } from "@/app/services/loadingContext";
import StatusBtn from "@/app/components/statusBtn2";

// 🔹 API response type
interface Company {
    id?: string | number;
    company_code?: string;
    company_name?: string;
    company_type?: string;
    email?: string;
    tin_number?: string;
    vat?: string;
    country?: {
        id?: number;
        country_name?: string;
        country_code?: string;
        selling_currency?: string;
        purchase_currency?: string;
    };
    region?: { id?: number; region_name?: string; region_code?: string };
    sub_region?: {
        id?: number;
        subregion_name?: string;
        subregion_code?: string;
    };
    selling_currency?: string;
    purchase_currency?: string;
    toll_free_no?: string;
    primary_contact?: string;
    website?: string;
    module_access?: string;
    district?: string;
    town?: string;
    street?: string;
    landmark?: string;
    service_type?: string;
    status?: string | number;
}

// 🔹 Dropdown menu data
const dropdownDataList = [
    { icon: "lucide:radio", label: "Inactive", iconWidth: 20 },
    { icon: "lucide:delete", label: "Delete", iconWidth: 20 },
];

// 🔹 Table columns
const columns = [
    { key: "company_code", label: "Company Code"},
    { key: "company_name", label: "Company Name"},
    { key: "company_type", label: "Company Type"},
    { key: "email", label: "Email"},
    { key: "website", label: "Website"},
    { key: "toll_free_no", label: "Toll Free No"},
    { key: "primary_contact", label: "Primary Contact"},
    {
        key: 'region_name',
        label: 'Region',
        render: (data: TableDataType) => {
                const warehouseObj = typeof data.region === "string"
                    ? JSON.parse(data.region)
                    : data.region;
                return warehouseObj?.region_name || "-";
            }, filter: {
        isFilterable: true,
        render: (data: TableDataType[]) => {
            return data.map((item, index) => <div key={item.id+index} className="w-full text-left p-2">{item.region_name}</div>);
        }
    } },
    {
        key: 'subregion_name',
        label: 'Area',
        render: (row: TableDataType) => {
                const warehouseObj = typeof row.sub_region === "string"
                    ? JSON.parse(row.sub_region)
                    : row.sub_region;
                return warehouseObj?.subregion_name || "-";
            }, filter: {
        isFilterable: true,
        render: (data: TableDataType[]) => {
            return data.map((item, index) => <div key={item.id+index} className="w-full text-left p-2">{item.subregion_name}</div>);
        }
    } },
    { key: "address", label: "Address"},
    {
        key: 'country_name',
        label: 'Country',
        render: (row: TableDataType) => {
        if (
            row.country &&
            typeof row.country === "object" &&
            "country_name" in row.country &&
            typeof (row.country as { country_name?: string }).country_name === "string"
        ) {
            return (row.country as { country_name?: string }).country_name || "-";
        }
        if (typeof row.country_name === "string") {
            return row.country_name || "-";
        }
        return "-";
        }, filter: {
        isFilterable: true,
        render: (data: TableDataType[]) => {
            return data.map((item, index) => <div key={item.id+index} className="w-full text-left p-2">{item.country_name}</div>);
        }
    } },
    { key: "purchase_currency", label: "Purchase Currency"},
    { key: "selling_currency", label: "Selling Currency"},
    { key: "vat", label: "VAT"},
    { key: "module_access", label: "Module Access"},
    { key: "service_type", label: "Service Type"},
    {
        key: "status",
        label: "Status",
        render: (row: TableDataType) => (
            <StatusBtn isActive={row.status === "1" ? true : false} />
        )},
];


const CompanyPage = () => {
    const { setLoading } = useLoading();
    const [refreshKey, setRefreshKey] = useState(0);

    const { showSnackbar } = useSnackbar();
    const router = useRouter();

    const fetchCompanies = useCallback(
        async (
            pageNo: number = 1,
            pageSize: number = 5
        ): Promise<listReturnType> => {
            setLoading(true);
            const result = await companyList({
                page: pageNo.toString(),
                per_page: pageSize.toString(),
            });
            console.log(result);
            setLoading(false);
            if (result.error) {
                showSnackbar(result.data.message, "error");
                throw new Error("Error fetching data");
            } else {
                return {
                    data: result.data as TableDataType[],
                    currentPage: result.pagination?.current_page || 1,
                    pageSize: result.pagination?.per_page || 5,
                    total: result.pagination?.last_page || 0,
                };
            }
        },
        [showSnackbar, setLoading]
    );

    const searchCompanies = useCallback(
            async (
                searchQuery: string,
                pageSize: number = 5,
                columnName?: string
            ): Promise<searchReturnType> => {
                setLoading(true);
                let result;
                if (columnName && columnName !== "") {
                    result = await companyList({
                        per_page: pageSize.toString(),
                        [columnName]: searchQuery
                    });
                } else {
                    result = await companyListGlobalSearch({
                        query: searchQuery,
                        per_page: pageSize.toString(),
                    });
                }
                setLoading(false);
    
                if (result.error) {
                    throw new Error(result.data?.message || "Search failed");
                }
    
                return {
                    data: result.data || [],
                    currentPage: result?.pagination?.current_page || 1,
                    pageSize: result?.pagination?.per_page || pageSize,
                    total: result?.pagination?.last_page || 1,
                };
            },
            [setLoading]
        );


    return (
        <>
            {/* Table */}
            <div className="h-[calc(100%-60px)]">
                <Table
                  refreshKey={refreshKey}
                    config={{
                        
                        api: {
                            list: fetchCompanies,
                            search: searchCompanies,
                        },
                        header: {
                            title: "Company",
                            searchBar: true,
                            columnFilter: true,
                            actions: [
                                <SidebarBtn
                                    key={0}
                                    href="/settings/company/add"
                                    isActive
                                    leadingIcon="lucide:plus"
                                    label="Add"
                                    labelTw="hidden sm:block"
                                />,
                            ],
                        },
                        localStorageKey: "company-table",
                        table: {
                            height: 500,
                        },
                        footer: { nextPrevBtn: true, pagination: true },
                        columns,
                        rowSelection: true,
                        rowActions: [
                            {
                                icon: "lucide:eye",
                                onClick: (data: TableDataType) => {
                                router.push(`/settings/company/details/${data.id}`);
                                },
                            },
                            {
                                icon: "lucide:edit-2",

                                onClick: (row: object) => {
                                    const r = row as TableDataType;
                                    router.push(
                                        `/settings/company/${r.id}`
                                    );
                                },
                            },
                            
                        ],
                        pageSize: 50,
                        
                    }}
                />
            </div>
        </>
    );
};

export default CompanyPage;