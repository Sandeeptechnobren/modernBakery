"use client";

import { useState, useEffect, useCallback } from "react";
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
    deleteCompany,
    companyListGlobalSearch,
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
    { icon: "lucide:layout", label: "SAP", iconWidth: 20 },
    { icon: "lucide:download", label: "Download QR Code", iconWidth: 20 },
    { icon: "lucide:printer", label: "Print QR Code", iconWidth: 20 },
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
    { key: "region_name", label: "Region" },
    { key: "subregion_name", label: "Sub Region" },
    { key: "street", label: "Street" },
    { key: "landmark", label: "Landmark" },
    { key: "town", label: "Town" },
    { key: "district", label: "District" },
    {
        label: "Country",
        key: "country_name",
        render: (row: TableDataType) => row.country_name || "-",
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
    const [companies, setCompanies] = useState<Company[]>([]);
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

    // ✅ Map companies → TableDataType safely
    const tableData: TableDataType[] = companies.map((c) => ({
        id: String(c.id ?? ""),
        company_code: c.company_code ?? "",
        company_name: c.company_name ?? "",
        company_type: c.company_type ?? "",
        email: c.email ?? "",
        tin_number: c.tin_number ?? "",
        vat: c.vat ?? "",
        country_name: c.country?.country_name ?? "",
        selling_currency: c.country?.selling_currency ?? "",
        purchase_currency: c.country?.purchase_currency ?? "",
        toll_free_no: c.toll_free_no ?? "",
        primary_contact: c.primary_contact ?? "",
        website: c.website ?? "",
        region_name: c.region?.region_name ?? "",
        subregion_name: c.sub_region?.subregion_name ?? "",
        module_access: c.module_access ?? "",
        district: c.district ?? "",
        town: c.town ?? "",
        street: c.street ?? "",
        landmark: c.landmark ?? "",
        service_type: c.service_type ?? "",
        status: c.status === "1" || c.status === 1 ? "Active" : "Inactive",
    }));

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
