"use client";

import { useState, useCallback } from "react";
import { Icon } from "@iconify-icon/react";
import { useRouter } from "next/navigation";

import BorderIconButton from "@/app/components/borderIconButton";
import CustomDropdown from "@/app/components/customDropdown";
import Table, {
    listReturnType,
    TableDataType,
    searchReturnType,
} from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import {
    companyList,
    companyListGlobalSearch,
    deleteCompany,
} from "@/app/services/allApi";
import DismissibleDropdown from "@/app/components/dismissibleDropdown";
import DeleteConfirmPopup from "@/app/components/deletePopUp";
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
    { key: "company_code", label: "Company Code" },
    { key: "company_name", label: "Company Name" },
    { key: "company_type", label: "Company Type" },
    { key: "email", label: "Email" },
    { key: "website", label: "Website" },
    { key: "toll_free_no", label: "Toll Free No" },
    { key: "primary_contact", label: "Primary Contact" },
    {
        key: 'region_name',
        label: 'Region',
        render: (data: TableDataType) => {
                const warehouseObj = typeof data.region === "string"
                    ? JSON.parse(data.region)
                    : data.region;
                return warehouseObj?.region_name || "-";
            },
    },
    {
        key: 'subregion_name',
        label: 'Sub Region',
        render: (row: TableDataType) => {
                const warehouseObj = typeof row.sub_region === "string"
                    ? JSON.parse(row.sub_region)
                    : row.sub_region;
                return warehouseObj?.subregion_name || "-";
            } ,
    },
    { key: "street", label: "Street" },
    { key: "landmark", label: "Landmark" },
    { key: "town", label: "Town" },
    { key: "district", label: "District" },
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
        },
    },
    { key: "tin_number", label: "TIN Number" },
    { key: "purchase_currency", label: "Purchase Currency" },
    { key: "selling_currency", label: "Selling Currency" },
    { key: "vat", label: "VAT" },
    { key: "module_access", label: "Module Access" },
    { key: "service_type", label: "Service Type" },
    {
        key: "status",
        label: "Status",
        render: (row: TableDataType) => (
            <StatusBtn isActive={row.status === "1" ? true : false} />
        ),
    },
];

const CompanyPage = () => {
    const { setLoading } = useLoading();
    const [showDropdown, setShowDropdown] = useState(false);
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [selectedRow, setSelectedRow] = useState<Company | null>(null);

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
            pageSize: number = 5
        ): Promise<searchReturnType> => {
            setLoading(true);

            const result = await companyListGlobalSearch({
                query: searchQuery,
                per_page: pageSize.toString(),
            });

            setLoading(false);

            if (result.error) {
                throw new Error(result.data?.message || "Search failed");
            }

            return {
                data: result.data || [],
                currentPage: result.pagination.pagination.current_page || 0,
                pageSize: result.pagination.pagination.per_page || pageSize,
                total:
                    result.pagination.pagination.total ||
                    result.data?.length ||
                    0, // safe fallback
            };
        },
        [setLoading]
    );

    // ✅ Handle Delete
    const handleConfirmDelete = async () => {
        if (!selectedRow?.id) return;

        const res = await deleteCompany(String(selectedRow.id));
        if (res.error) {
            showSnackbar(res.message || "Failed to delete company ❌", "error");
        } else {
            showSnackbar("Company deleted successfully ✅", "success");
            fetchCompanies();
        }
        setShowDeletePopup(false);
        setSelectedRow(null);
    };

    return (
        <>
            {/* Table */}
            <div className="h-[calc(100%-60px)]">
                <Table
                    // data={tableData}
                    config={{
                        api: {
                            list: fetchCompanies,
                            search: searchCompanies,
                        },
                        header: {
                            title: "Company",
                            wholeTableActions: [
                                <div key={0} className="flex gap-[12px] relative">
                                    <DismissibleDropdown
                                        isOpen={showDropdown}
                                        setIsOpen={setShowDropdown}
                                        button={
                                            <BorderIconButton icon="ic:sharp-more-vert" />
                                        }
                                        dropdown={
                                            <div className="absolute top-[40px] right-0 z-30 w-[226px]">
                                                <CustomDropdown>
                                                    {dropdownDataList.map(
                                                        (link, idx) => (
                                                            <div
                                                                key={idx}
                                                                className="px-[14px] py-[10px] flex items-center gap-[8px] hover:bg-[#FAFAFA]"
                                                            >
                                                                <Icon
                                                                    icon={
                                                                        link.icon
                                                                    }
                                                                    width={
                                                                        link.iconWidth
                                                                    }
                                                                    className="text-[#717680]"
                                                                />
                                                                <span className="text-[#181D27] font-[500] text-[16px]">
                                                                    {link.label}
                                                                </span>
                                                            </div>
                                                        )
                                                    )}
                                                </CustomDropdown>
                                            </div>
                                        }
                                    />
                                </div>,
                            ],
                            searchBar: true,
                            columnFilter: true,
                            actions: [
                                <SidebarBtn
                                    key={0}
                                    href="/dashboard/company/add"
                                    isActive
                                    leadingIcon="lucide:plus"
                                    label="Add Company"
                                    labelTw="hidden sm:block"
                                />,
                            ],
                        },
                        footer: { nextPrevBtn: true, pagination: true },
                        columns,
                        rowSelection: true,
                        rowActions: [
                            {
                                icon: "lucide:edit-2",
                                onClick: (row: object) => {
                                    const r = row as TableDataType;
                                    router.push(
                                        `/dashboard/company/updateCompany/${r.id}`
                                    );
                                },
                            },
                            {
                                icon: "lucide:trash-2",
                                onClick: (row: object) => {
                                    const r = row as TableDataType;
                                    setSelectedRow({ id: r.id });
                                    setShowDeletePopup(true);
                                },
                            },
                        ],
                        pageSize: 5,
                    }}
                />
            </div>

            {/* Delete Popup */}
            {showDeletePopup && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
                    <DeleteConfirmPopup
                        title="Delete Company"
                        onClose={() => setShowDeletePopup(false)}
                        onConfirm={handleConfirmDelete}
                    />
                </div>
            )}
        </>
    );
};

export default CompanyPage;
