"use client";

import { useState, useCallback } from "react";
import { Icon } from "@iconify-icon/react";
import { useRouter } from "next/navigation";

import BorderIconButton from "@/app/components/borderIconButton";
import CustomDropdown from "@/app/components/customDropdown";
import Table, { listReturnType, TableDataType } from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import { salesmanList, deleteSalesman } from "@/app/services/allApi";
import DismissibleDropdown from "@/app/components/dismissibleDropdown";
import DeleteConfirmPopup from "@/app/components/deletePopUp";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useLoading } from "@/app/services/loadingContext";
import StatusBtn from "@/app/components/statusBtn2";

// 🔹 API response type
interface Salesman {
  id?: string | number;
  uuid?: string; 
  osa_code?: string;
  name?: string;
  salesman_type?: { id?: number; salesman_type_code?: string; salesman_type_name?: string };
  sub_type?: string;
  designation?: string;
  security_code?: string;
  route?: { id?: number; route_code?: string; route_name?: string };
  warehouse?: { id?: number; warehouse_code?: string; warehouse_name?: string };
  device_no?: string;
  salesman_role?: string;
  username?: string;
  contact_no?: string;
  sap_id?: string;
  status?: string | number;
}

// 🔹 Dropdown menu data
const dropdownDataList = [
  { icon: "lucide:radio", label: "Inactive", iconWidth: 20 },
  { icon: "lucide:delete", label: "Delete", iconWidth: 20 },
];
const subTypeMapping: Record<string | number, string> = {
  0: "None",
  1: "Merchandiser",
};
// 🔹 Table columns
const columns = [
  { key: "osa_code", label: "Salesman Code",
    render: (row: TableDataType) => (
            <span className="font-semibold text-[#181D27] text-[14px]">
                {row.osa_code}
            </span>
        ),
   },
  { key: "sap_id", label: "SAP Code" },
  { key: "name", label: "Salesman Name" },
 {
    key: "salesman_type",
    label: "Salesman Type",
    render: (row: TableDataType) => {
      const obj =
        typeof row.salesman_type === "string" ? JSON.parse(row.salesman_type) : row.salesman_type;
      return obj?.salesman_type_name || "-";
    },
  },
 {
  key: "sub_type",
  label: "Sub Type",
  render: (row: TableDataType) => {
    const value = row.sub_type;

    // Agar JSON string hai ("{id:1,name:'Merchandiser'}"), to parse karo
    if (typeof value === "string" && value.startsWith("{")) {
      try {
        const obj = JSON.parse(value);
        return obj.name || subTypeMapping[obj.id] || "-";
      } catch {
        return subTypeMapping[value] || "-";
      }
    }

    // Agar number ya string hai, to mapping se text lao
    if (typeof value === "number" || typeof value === "string") {
      return subTypeMapping[value] || "-";
    }

    return "-";
  },
},

  { key: "designation", label: "Designation" },
  { key: "device_no", label: "Device No" },
  {
    key: "route",
    label: "Route",
    render: (row: TableDataType) => {
      const obj =
        typeof row.route === "string" ? JSON.parse(row.route) : row.route;
      return obj?.route_name || "-";
    },
  },

  { key: "username", label: "Username" },
  { key: "contact_no", label: "Contact No" },
  {
    key: "warehouse",
    label: "Warehouse",
    render: (row: TableDataType) => {
      if (
        row.warehouse &&
        typeof row.warehouse === "object" &&
        "warehouse_name" in row.warehouse
      ) {
        return (row.warehouse as { warehouse_name?: string }).warehouse_name || "-";
      }
      if (typeof row.warehouse_name === "string") {
        return row.warehouse_name || "-";
      }
      return "-";
    },
  },
 {
  key: "status",
  label: "Status",
  render: (row: TableDataType) => (
    <StatusBtn isActive={String(row.status) === "1"} />
  ),
},

];


const SalesmanPage = () => {
  const { setLoading } = useLoading();
  const { showSnackbar } = useSnackbar();
  const router = useRouter();

  const [showDropdown, setShowDropdown] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [selectedRow, setSelectedRow] = useState<Salesman | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // ✅ Fetch salesman list with correct pagination mapping
  const fetchSalesman = useCallback(
        async (
            page: number = 1,
            pageSize: number = 5
        ): Promise<listReturnType> => {
            try {
              setLoading(true);
                const listRes = await salesmanList({
                    // page: page.toString(),
                });
                setLoading(false);
                return {
                    data: listRes.data || [],
                    total: listRes.pagination.totalPages ,
                    currentPage: listRes.pagination.page ,
                    pageSize: listRes.pagination.limit ,
                };
            } catch (error: unknown) {
                console.error("API Error:", error);
                setLoading(false);
                throw error;
            }
        },
        []
    );

 
  const handleConfirmDelete = async () => {
    if (!selectedRow?.uuid) return;

    const res = await deleteSalesman(String(selectedRow.uuid));
    if (!res || res.status !== "success") {
      showSnackbar(res.message || "Failed to delete salesman ❌", "error");
    } else {
      showSnackbar("Salesman deleted successfully ✅", "success");
      setRefreshKey(refreshKey + 1);
    }
    fetchSalesman();

    setShowDeletePopup(false);
    setSelectedRow(null);
  };

  return (
    <>
      {/* Table */}
      <div className="h-[calc(100%-60px)]">
        <Table
        refreshKey={refreshKey}
          config={{
            api: { list: fetchSalesman },
            header: {
              title: "Salesman",
              wholeTableActions: [
                <div key={0} className="flex gap-[12px] relative">
                  <DismissibleDropdown
                    isOpen={showDropdown}
                    setIsOpen={setShowDropdown}
                    button={<BorderIconButton icon="ic:sharp-more-vert" />}
                    dropdown={
                      <div className="absolute top-[40px] right-0 z-30 w-[226px]">
                        <CustomDropdown>
                          {dropdownDataList.map((link, idx) => (
                            <div
                              key={idx}
                              className="px-[14px] py-[10px] flex items-center gap-[8px] hover:bg-[#FAFAFA]"
                            >
                              <Icon
                                icon={link.icon}
                                width={link.iconWidth}
                                className="text-[#717680]"
                              />
                              <span className="text-[#181D27] font-[500] text-[16px]">
                                {link.label}
                              </span>
                            </div>
                          ))}
                        </CustomDropdown>
                      </div>
                    }
                  />
                </div>,
              ],
              searchBar: false,
              columnFilter: true,
              actions: [
                <SidebarBtn
                  key={0}
                  href="/salesman/add"
                  isActive
                  leadingIcon="lucide:plus"
                  label="Add"
                  labelTw="hidden sm:block"
                />,
              ],
            },
            localStorageKey: "salesman-table",
            footer: { nextPrevBtn: true, pagination: true },
            columns,
            rowSelection: true,
            rowActions: [ 
               {
                icon: "lucide:eye",
                onClick: (data: TableDataType) => {
                  router.push(`/salesman/details/${data.uuid}`);
                },
              },
              {
                icon: "lucide:edit-2",
                onClick: (row: object) => {
                  const r = row as TableDataType;
                  router.push(`/salesman/${r.uuid}`);
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
            title="Delete Salesman"
            onClose={() => setShowDeletePopup(false)}
            onConfirm={handleConfirmDelete}
          />
        </div>
      )}
    </>
  );
};

export default SalesmanPage;
