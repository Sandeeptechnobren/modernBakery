"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Table, { TableDataType } from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import Loading from "@/app/components/Loading";
import DeleteConfirmPopup from "@/app/components/deletePopUp";
import { useSnackbar } from "@/app/services/snackbarContext";
import { customerSubCategoryList, deleteCustomerSubCategory } from "@/app/services/allApi";
import BorderIconButton from "@/app/components/borderIconButton";
import DismissibleDropdown from "@/app/components/dismissibleDropdown";
import CustomDropdown from "@/app/components/customDropdown";

// ✅ API types
interface CustomerCategory {
  id: number;
  customer_category_name: string;
}

interface CustomerSubCategoryAPI {
  id: number;
  customer_category_id: number;
  customer_sub_category_code: string;
  customer_sub_category_name: string;
  status: number;
  customer_category: CustomerCategory;
}

interface CustomerSubCategory {
  id: number;
  customer_category_name: string;
  customer_sub_category_code: string;
  customer_sub_category_name: string;
  status: number;
}

export default function CustomerSubCategoryPage() {
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [selectedSubCategory, setSelectedSubCategory] = useState<CustomerSubCategory | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const pageSize = 10;

  const { showSnackbar } = useSnackbar();
  const router = useRouter();

  const columns = [
    { key: "customer_sub_category_code", label: "Sub-Category Code",
      render: (row: TableDataType) => (
            <span className="font-semibold text-[#181D27] text-[14px]">
                {row.customer_sub_category_code}
            </span>
        ),
     },
    { key: "customer_sub_category_name", label: "Sub-Category Name" },
    { key: "customer_category_name", label: "Category Name" },
   {
        key: "status",
        label: "Status",
        render: (row: TableDataType) => (
            <div className="flex items-center">
                {row.status === "Active" ? (
                    <span className="text-sm text-[#027A48] bg-[#ECFDF3] font-[500] p-1 px-4 rounded-xl text-[12px]">
                        Active
                    </span>
                ) : (
                    <span className="text-sm text-red-700 bg-red-200 p-1 px-4 rounded-xl text-[12px]">
                        In Active
                    </span>
                )}
            </div>
        ),
    },
  ];

  return (
    <>
      {/* Header */}
      <div className="flex justify-between items-center mb-[20px]">
        <h1 className="text-[20px] font-semibold text-[#181D27]">
          Customer Sub-Category
        </h1>

        <div className="flex gap-[12px] relative">
          <BorderIconButton icon="gala:file-document" label="Export CSV" />
          <BorderIconButton icon="mage:upload" />

          <DismissibleDropdown
            isOpen={showDropdown}
            setIsOpen={setShowDropdown}
            button={<BorderIconButton icon="ic:sharp-more-vert" />}
            dropdown={
              <div className="absolute top-[40px] right-0 z-30 w-[226px]">
                <CustomDropdown>
                  {[
                    "SAP",
                    "Download QR Code",
                    "Print QR Code",
                    "Inactive",
                    "Delete",
                  ].map((label, idx) => (
                    <div
                      key={idx}
                      className="px-[14px] py-[10px] flex items-center gap-[8px] hover:bg-[#FAFAFA]"
                    >
                      <span className="text-[#181D27] font-[500] text-[16px]">
                        {label}
                      </span>
                    </div>
                  ))}
                </CustomDropdown>
              </div>
            }
          />
        </div>
      </div>

      {/* Table */}
      <div className="h-[calc(100%-60px)]">
        <Table
          config={{
            header: {
              searchBar: false,
              columnFilter: true,
              actions: [
                <SidebarBtn
                  key={0}
                  href="/settings/customer/customerSubCategory/add"
                  isActive
                  leadingIcon="lucide:plus"
                  label="Add"
                  labelTw="hidden sm:block"
                />,
              ],
            },
            pageSize: pageSize,
            localStorageKey: "customer-sub-category-table",
            footer: { nextPrevBtn: true, pagination: true },
            columns,
            rowSelection: true,
            rowActions: [
              {
                icon: "lucide:edit-2",
                onClick: (row: object) => {
                  const r = row as TableDataType;
                  router.push(
                    `/settings/customer/customerSubCategory/${r.id}`
                  );
                },
              },
              
            ],
            api: {
              list: async (pageNo: number, pageSize: number) => {
                try {
                  const res = await customerSubCategoryList({ page: String(pageNo), limit: String(pageSize) });
                  const formatted: CustomerSubCategory[] = (res.data || []).map(
                    (s: CustomerSubCategoryAPI) => ({
                      id: s.id,
                      customer_category_name: s.customer_category?.customer_category_name || "N/A",
                      customer_sub_category_code: s.customer_sub_category_code,
                      customer_sub_category_name: s.customer_sub_category_name,
                      status: s.status,
                    })
                  );
                  
                  const tableData: TableDataType[] = formatted.map((c) => ({
                    id: String(c.id),
                    customer_category_name: c.customer_category_name,
                    customer_sub_category_code: c.customer_sub_category_code,
                    customer_sub_category_name: c.customer_sub_category_name,
                    status: c.status === 1 ? "Active" : "Inactive",
                  }));

                  return {
                    data: tableData,
                    currentPage: res.pagination?.page || pageNo,
                    pageSize: pageSize,
                    total: res.pagination?.totalPages || 1,
                    totalRecords: res.pagination?.totalRecords || tableData.length,
                  };
                } catch (error) {
                  console.error("Failed to fetch sub-categories ❌", error);
                  showSnackbar("Failed to load customer sub-categories ❌", "error");
                  return {
                    data: [],
                    currentPage: 1,
                    pageSize: pageSize,
                    total: 0,
                    totalRecords: 0,
                  };
                }
              },
            },
          }}
        />
      </div>

      
    </>
  );
}
