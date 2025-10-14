"use client";

import { useCallback, useEffect, useState } from "react";
import { Icon } from "@iconify-icon/react";
import { useRouter } from "next/navigation";
import DismissibleDropdown from "@/app/components/dismissibleDropdown";
import CustomDropdown from "@/app/components/customDropdown";
import BorderIconButton from "@/app/components/borderIconButton";
import Table, {
  listReturnType,
  TableDataType,
} from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import DeleteConfirmPopup from "@/app/components/deletePopUp";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useLoading } from "@/app/services/loadingContext";
import {
  chillerRequestList,
  deleteChillerRequest,
} from "@/app/services/assetsApi";
import StatusBtn from "@/app/components/statusBtn2";

const dropdownDataList = [
  { icon: "lucide:radio", label: "Inactive", iconWidth: 20 },
  { icon: "lucide:delete", label: "Delete", iconWidth: 20 },
];

export default function Page() {
  const { setLoading } = useLoading();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [deleteSelectedRow, setDeleteSelectedRow] = useState<string | null>(
    null
  );
  const [refreshKey, setRefreshKey] = useState(0);

  const router = useRouter();
  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    setLoading(true);
  }, [setLoading]);

  const handleConfirmDelete = async () => {
    if (deleteSelectedRow) {
      const res = await deleteChillerRequest(deleteSelectedRow.toString());
      if (res.error) {
        showSnackbar(
          res.data.message || "failed to delete the Chiller Request",
          "error"
        );
        throw new Error("Unable to delete the Chiller Request");
      } else {
        showSnackbar(
          res.message ||
            `Deleted Chiller Request with ID: ${deleteSelectedRow}`,
          "success"
        );
        setShowDeletePopup(false);
        setRefreshKey((prev) => prev + 1);
      }
    }
  };

  const fetchTableData = useCallback(
    async (
      pageNo: number = 1,
      pageSize: number = 10
    ): Promise<listReturnType> => {
      setLoading(true);
      const res = await chillerRequestList({
        page: pageNo.toString(),
        per_page: pageSize.toString(),
      });
      setLoading(false);
      if (res.error) {
        showSnackbar(
          res.data.message || "failed to fetch the Chiller Requests",
          "error"
        );
        throw new Error("Unable to fetch the Chiller Requests");
      } else {
        return {
          data: res.data || [],
          currentPage: res?.pagination?.page || 0,
          pageSize: res?.pagination?.limit || 10,
          total: res?.pagination?.totalPages || 0,
        };
      }
    },
    [setLoading, showSnackbar]
  );

  // Helper function to render nested object data
  const renderNestedField = (
    data: TableDataType,
    field: string,
    subField: string
  ) => {
    if (
      data[field] &&
      typeof data[field] === "object" &&
      data[field] !== null &&
      subField in (data[field] as object)
    ) {
      return (data[field] as Record<string, string>)[subField] || "-";
    }
    return "-";
  };

  // Helper to combine code and name
  const renderCombinedField = (data: TableDataType, field: string) => {
    const code = renderNestedField(data, field, "code");
    const name = renderNestedField(data, field, "name");
    if (code !== "-" && name !== "-") {
      return `${code} - ${name}`;
    } else if (name !== "-") {
      return name;
    } else if (code !== "-") {
      return code;
    }
    return "-";
  };

  return (
    <>
      {/* Table */}
      <div className="flex flex-col h-full">
        <Table
          refreshKey={refreshKey}
          config={{
            api: {
              list: fetchTableData,
            },
            header: {
              title: "Chiller Requests",
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
                  key="name"
                  href="/assets/chillerRequest/add"
                  leadingIcon="lucide:plus"
                  label="Add"
                  labelTw="hidden lg:block"
                  isActive
                />,
              ],
            },
            footer: { nextPrevBtn: true, pagination: true },
            columns: [
              // Essential Information
              {
                key: "osa_code",
                label: "OSA Code",
              },
              {
                key: "owner_name",
                label: "Owner Name",
              },
              {
                key: "contact_number",
                label: "Contact Number",
              },

              // Combined Relationship Fields
              {
                key: "customer",
                label: "Customer",
                render: (data: TableDataType) =>
                  renderCombinedField(data, "customer"),
              },
              {
                key: "warehouse",
                label: "Warehouse",
                render: (data: TableDataType) =>
                  renderCombinedField(data, "warehouse"),
              },
              {
                key: "outlet",
                label: "Outlet",
                render: (data: TableDataType) =>
                  renderCombinedField(data, "outlet"),
              },
              {
                key: "salesman",
                label: "Salesman",
                render: (data: TableDataType) =>
                  renderCombinedField(data, "salesman"),
              },

              // Key Chiller Details
              {
                key: "machine_number",
                label: "Machine No",
              },
              {
                key: "asset_number",
                label: "Asset No",
              },
              {
                key: "model",
                label: "Model",
              },
              {
                key: "brand",
                label: "Brand",
              },

              // Status
              {
                key: "status",
                label: "Status",
                render: (data: TableDataType) => (
                  <StatusBtn
                    isActive={
                      data.status && data.status.toString() === "1"
                        ? true
                        : false
                    }
                  />
                ),
              },
            ],
            rowSelection: true,
            rowActions: [
              {
                icon: "lucide:eye",
                onClick: (data: TableDataType) => {
                  router.push(`/assets/chillerRequest/view/${data.uuid}`);
                },
              },
              {
                icon: "lucide:edit-2",
                onClick: (data: TableDataType) => {
                  router.push(`/assets/chillerRequest/${data.uuid}`);
                },
              },
              {
                icon: "lucide:trash-2",
                onClick: (data: TableDataType) => {
                  setDeleteSelectedRow(
                    data?.uuid ? String(data.uuid) : data.uuid
                  );
                  setShowDeletePopup(true);
                },
              },
            ],
            pageSize: 10,
          }}
        />
      </div>

      {/* Delete Popup */}
      {showDeletePopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <DeleteConfirmPopup
            title="Chiller Request"
            onClose={() => setShowDeletePopup(false)}
            onConfirm={handleConfirmDelete}
          />
        </div>
      )}
    </>
  );
}
