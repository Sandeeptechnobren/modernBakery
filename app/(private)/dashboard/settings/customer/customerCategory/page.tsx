"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Table, { listReturnType, searchReturnType, TableDataType } from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import DeleteConfirmPopup from "@/app/components/deletePopUp";
import { useSnackbar } from "@/app/services/snackbarContext";
import { customerCategoryList, deleteCustomerCategory, customerCategoryListGlobalSearch } from "@/app/services/allApi";
import BorderIconButton from "@/app/components/borderIconButton";
import DismissibleDropdown from "@/app/components/dismissibleDropdown";
import CustomDropdown from "@/app/components/customDropdown";
import StatusBtn from "@/app/components/statusBtn2";
import { useLoading } from "@/app/services/loadingContext";

// ✅ API types
interface OutletChannel {
  id: string;
  outlet_channel_code: string;
}

interface CustomerCategoryAPI {
  id: string;
  outlet_channel_id: string;
  customer_category_code: string;
  customer_category_name: string;
  status:  number; // backend can send string or number
}

interface CustomerCategory {
  id: string;
  outlet_channel_code: string;
  customer_category_code: string;
  customer_category_name: string;
  status:number; // keep raw for backend compatibility
}

export default function CustomerCategoryPage() {
  const [categories, setCategories] = useState<CustomerCategory[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const { setLoading } = useLoading();
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CustomerCategory | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const { showSnackbar } = useSnackbar();
  const router = useRouter();

  const fetchCategories = async (page: number = 1, pageSize: number = 10): Promise<listReturnType> => {
      setLoading(true);
      const res = await customerCategoryList({
        per_page: pageSize.toString(),
        page: page.toString()
      });
      setLoading(false);

      if(res.error){
        showSnackbar(res.data.message || "Failed to fetch customer categories ❌", "error");
        throw new Error("Unable to fetch the customer categories");
      } else {
        return {
          data: res.data || [],
          currentPage: res.pagination.page || page,
          pageSize: res.pagination.limit || pageSize,
          total: res.pagination.totalPages || 1
        }
      }
  };

  const searchCategories = async (query: string, pageSize: number = 10): Promise<searchReturnType> => {
      setLoading(true);
      const res = await customerCategoryListGlobalSearch({
        query: query,
        per_page: pageSize.toString()
      });
      setLoading(false);

      if(res.error){
        showSnackbar(res.data.message || "Failed to search customer categories", "error");
        throw new Error("Unable to fetch the customer categories");
      } else {
        return {
          data: res.data || [],
          currentPage: res.pagination.page || 1,
          pageSize: res.pagination.limit || pageSize,
          total: res.pagination.totalPages || 1
        }
      }
  };

     const searchCustomerCategory = useCallback(
          async (
              searchQuery: string,
              pageSize: number
          ): Promise<searchReturnType> => {
              setLoading(true);
              const result = await customerCategoryListGlobalSearch({
                  query: searchQuery,
                  per_page: pageSize.toString(),
              });
              setLoading(false);
              if (result.error) throw new Error(result.data.message);
              else {
                  return {
                      data: result.data || [],
                      total: result.pagination.pagination.totalPages || 0,
                      currentPage: result.pagination.pagination.current_page || 0,
                      pageSize: result.pagination.pagination.limit || pageSize,
                  };
              }
          },
          []
      );
  // ✅ Delete handler
  const handleDelete = async () => {
    if (!selectedCategory?.id) return;
      const res = await deleteCustomerCategory(selectedCategory.id);
      if(res.error) showSnackbar(res.data.message || "Failed to delete category", "error");
      else {
        showSnackbar(res.message || "Customer Category deleted", "success");
        setRefreshKey(prev => prev+1);
      }
      setShowDeletePopup(false);
      setSelectedCategory(null);
  };

  const columns = useMemo(() => [
    { key: "outlet_channel", label: "Outlet Channel Code", render:(data: TableDataType) =>{
      if (typeof data.outlet_channel === "object" && data.outlet_channel !== null) {
        return (data.outlet_channel as { outlet_channel_code?: string }).outlet_channel_code || "-";
      }
      return "-";
    } },
    { key: "customer_category_code", label: "Code" },
    { key: "customer_category_name", label: "Name" },
    {
      key: "status",
      label: "Status",
      render: (row: TableDataType) => <StatusBtn isActive={row.status ? true : false} />
    },
  ], []);

  useEffect(() => {
    setLoading(true);
  }, [])

  return (
    <>
      {/* Table */}
      <div className="h-[calc(100%-60px)]">
        <Table
          // data={tableData}
          refreshKey={refreshKey}
          config={{
            api: {
              list: fetchCategories,
              search: searchCategories
            },
            header: {
              title:  "Customer Category",
              wholeTableActions:[
                <div key={0} className="flex gap-[12px] relative">
                  <DismissibleDropdown
                    isOpen={showDropdown}
                    setIsOpen={setShowDropdown}
                    button={<BorderIconButton icon="ic:sharp-more-vert" />}
                    dropdown={
                      <div className="absolute top-[40px] right-0 z-30 w-[226px]">
                        <CustomDropdown>
                          {["SAP", "Download QR Code", "Print QR Code", "Inactive", "Delete"].map(
                            (label, idx) => (
                              <div
                                key={idx}
                                className="px-[14px] py-[10px] flex items-center gap-[8px] hover:bg-[#FAFAFA]"
                              >
                                <span className="text-[#181D27] font-[500] text-[16px]">{label}</span>
                              </div>
                            )
                          )}
                        </CustomDropdown>
                      </div>
                    }
                  />
                </div>
              ],
              searchBar: true,  
              columnFilter: true,
              actions: [
                <SidebarBtn
                  key={0}
                  href="/dashboard/settings/customer/customerCategory/add"
                  isActive
                  leadingIcon="lucide:plus"
                  label="Add Category"
                  labelTw="hidden xl:block"
                />,
              ],
            },
            pageSize: 2,
            footer: { nextPrevBtn: true, pagination: true },
            columns,
            rowSelection: true,
            rowActions: [
              {
                icon: "lucide:edit-2",
                onClick: (row: object) => {
                  const r = row as TableDataType;
                  router.push(
                    `/dashboard/settings/customer/customerCategory/updateCustomerCategory/${r.id}`
                  );
                },
              },
              {
                icon: "lucide:trash-2",
                onClick: (row: object) => {
                  const r = row as TableDataType;
                  const category = categories.find(c => c.id === r.id) || null;
                  setSelectedCategory(category);
                  setShowDeletePopup(true);
                },
              },
            ],
          }}
        />
      </div>

      {/* Delete Popup */}
      {showDeletePopup && selectedCategory && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <DeleteConfirmPopup
            title={`Delete Category "${selectedCategory.customer_category_name}"?`}
            onClose={() => setShowDeletePopup(false)}
            onConfirm={handleDelete}
          />
        </div>
      )}
    </>
  );
}
