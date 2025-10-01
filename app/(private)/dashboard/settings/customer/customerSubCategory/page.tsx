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
  const [subCategories, setSubCategories] = useState<CustomerSubCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [selectedSubCategory, setSelectedSubCategory] = useState<CustomerSubCategory | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const { showSnackbar } = useSnackbar();
  const router = useRouter();

  // ✅ Fetch sub-categories
  useEffect(() => {
    const fetchSubCategories = async () => {
      try {
        const res = await customerSubCategoryList(); // API call
        const formatted: CustomerSubCategory[] = (res.data || []).map(
          (s: CustomerSubCategoryAPI) => ({
            id: s.id,
            customer_category_name:s.customer_category?.customer_category_name || "N/A",
            customer_sub_category_code: s.customer_sub_category_code,
            customer_sub_category_name: s.customer_sub_category_name,
            status: s.status,
          })
        );
        setSubCategories(formatted);
      } catch (error) {
        console.error("Failed to fetch sub-categories ❌", error);
        showSnackbar("Failed to load customer sub-categories ❌", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchSubCategories();
  }, [showSnackbar]);

  // ✅ Delete handler
  const handleDelete = async () => {
    if (!selectedSubCategory?.id) return;
    try {
      await deleteCustomerSubCategory(selectedSubCategory.id);
      showSnackbar("Customer Sub-Category deleted ✅", "success");
      setSubCategories((prev) =>
        prev.filter((s) => s.id !== selectedSubCategory.id)
      );
    } catch (error) {
      console.error("Delete failed ❌", error);
      showSnackbar("Failed to delete sub-category ❌", "error");
    } finally {
      setShowDeletePopup(false);
      setSelectedSubCategory(null);
    }
  };

  
  const tableData: TableDataType[] = subCategories.map((c) => ({
    id: String(c.id), // Table expects string
    customer_category_name: c.customer_category_name,
    customer_sub_category_code: c.customer_sub_category_code,
    customer_sub_category_name: c.customer_sub_category_name,
    status: c.status === 1 ? "Active" : "Inactive", // Convert to proper string based on number value
  }));

  const columns = [
    { key: "customer_sub_category_code", label: "Sub-Category Code" },
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

  if (loading) return <Loading />;

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
          data={tableData}
          config={{
            header: {
              searchBar: false,
              columnFilter: true,
              actions: [
                <SidebarBtn
                  key={0}
                  href="/dashboard/settings/customer/customerSubCategory/add"
                  isActive
                  leadingIcon="lucide:plus"
                  label="Add Sub-Category"
                  labelTw="hidden sm:block"
                />,
              ],
            },
            pageSize: 5,
            footer: { nextPrevBtn: true, pagination: true },
            columns,
            rowSelection: true,
            rowActions: [
              {
                icon: "lucide:edit-2",
                onClick: (row: object) => {
                  const r = row as TableDataType;
                  router.push(
                    `/dashboard/settings/customer/customerSubCategory/updateCustomerSubCategory/${r.id}`
                  );
                },
              },
              {
                icon: "lucide:trash-2",
                onClick: (row: object) => {
                  const r = row as TableDataType;
                  const subCategory =
                    subCategories.find((s) => s.id === Number(r.id)) || null; // ✅ fix: compare number
                  setSelectedSubCategory(subCategory);
                  setShowDeletePopup(true);
                },
              },
            ],
          }}
        />
      </div>

      {/* Delete Popup */}
      {showDeletePopup && selectedSubCategory && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <DeleteConfirmPopup
            title={`Delete Sub-Category "${selectedSubCategory.customer_sub_category_name}"?`}
            onClose={() => setShowDeletePopup(false)}
            onConfirm={handleDelete}
          />
        </div>
      )}
    </>
  );
}
