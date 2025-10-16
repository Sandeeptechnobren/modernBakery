"use client";

import { useState, useCallback } from "react";
import { Icon } from "@iconify-icon/react";
import { useRouter } from "next/navigation";

import BorderIconButton from "@/app/components/borderIconButton";
import CustomDropdown from "@/app/components/customDropdown";
import Table, {
  listReturnType,
  TableDataType,
} from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import {
  salesmanList,
  updateSalesmanStatus,
  exportSalesmanData,
} from "@/app/services/allApi";
import DismissibleDropdown from "@/app/components/dismissibleDropdown";
import DeleteConfirmPopup from "@/app/components/deletePopUp";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useLoading } from "@/app/services/loadingContext";
import StatusBtn from "@/app/components/statusBtn2";

const dropdownDataList = [
  { icon: "lucide:radio", label: "Inactive", iconWidth: 20 },
  { icon: "lucide:delete", label: "Delete", iconWidth: 20 },
];
const columns = [
  {
    key: "osa_code",
    label: "Salesman Code",
    render: (row: TableDataType) => (
      <span className="font-semibold text-[#181D27] text-[14px]">
        {row.osa_code}
      </span>
    ),
  },
  { key: "name", label: "Salesman Name" },
  {
    key: "salesman_type",
    label: "Salesman Type",
    render: (row: TableDataType) => {
      const obj =
        typeof row.salesman_type === "string"
          ? JSON.parse(row.salesman_type)
          : row.salesman_type;
      return obj?.salesman_type_name || "-";
    },
  },

  { key: "designation", label: "Designation" },
  {
    key: "warehouse",
    label: "Warehouse",
    render: (row: TableDataType) => {
      if (
        row.warehouse &&
        typeof row.warehouse === "object" &&
        "warehouse_name" in row.warehouse
      ) {
        return (
          (row.warehouse as { warehouse_name?: string }).warehouse_name || "-"
        );
      }
      if (typeof row.warehouse_name === "string") {
        return row.warehouse_name || "-";
      }
      return "-";
    },
    filter: {
      isFilterable: true,
      render: (data: TableDataType[]) => {
        return data.map((item, index) => (
          <div key={item.id + index} className="w-full text-left p-2">
            {item.warehouse_name}
          </div>
        ));
      },
    },
  },
  {
    key: "route",
    label: "Route",
    render: (row: TableDataType) => {
      const obj =
        typeof row.route === "string" ? JSON.parse(row.route) : row.route;
      return obj?.route_name || "-";
    },
    filter: {
      isFilterable: true,
      render: (data: TableDataType[]) => {
        return data.map((item, index) => (
          <div key={item.id + index} className="w-full text-left p-2">
            {item.route_name}
          </div>
        ));
      },
    },
  },
  { key: "contact_no", label: "Contact No" },

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
    const [refreshKey, setRefreshKey] = useState(0);


  const [showDropdown, setShowDropdown] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);

  const handleStatusChange = async (
  data: TableDataType[],
  selectedRow: number[] | undefined,
  status: "0" | "1"
) => {
  if (!selectedRow || selectedRow.length === 0) {
    showSnackbar("Please select at least one salesman", "error");
    return;
  }

 
  

  const selectedSalesmen = data.filter((_, index) =>
    selectedRow.includes(index)
  );
  // console.log(data, selectedRow)

  const failedUpdates: string[] = [];

  const selectedRowsData: string[] = data.filter((value, index)=> selectedRow?.includes(index)).map((item) => item.id);
  try {
    setLoading(true);
   
        const res = await updateSalesmanStatus({salesman_ids: selectedRowsData, status});
    
    if (failedUpdates.length > 0) {
      showSnackbar(
        `Failed to update status for: ${failedUpdates.join(", ")}`,
        "error"
      );
    } else {
           setRefreshKey((k) => k + 1);
      showSnackbar("Status updated successfully", "success");
      fetchSalesman();
    }

  } catch (error) {
    console.error("Status update error:", error);
    showSnackbar("An error occurred while updating status", "error");
  } finally {
    setLoading(false);
    setShowDropdown(false);
  }
};


  const handleExport = async (fileType: "csv" | "xlsx") => {
    try {
      setLoading(true);

      const res = await exportSalesmanData({ format: fileType });
      console.log("Export API Response:", res);

      let downloadUrl = "";

      if (res?.url && res.url.startsWith("blob:")) {
        downloadUrl = res.url;
      } else if (res?.url && res.url.startsWith("http")) {
        downloadUrl = res.url;
      } else if (typeof res === "string" && res.includes(",")) {
        const blob = new Blob([res], {
          type:
            fileType === "csv"
              ? "text/csv;charset=utf-8;"
              : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        downloadUrl = URL.createObjectURL(blob);
      } else {
        showSnackbar("No valid file or URL returned from server", "error");
        return;
      }

      // ⬇ Trigger browser download
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `salesman_export.${fileType}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showSnackbar(
        `Download started for ${fileType.toUpperCase()} file`,
        "success"
      );
    } catch (error) {
      console.error("Export error:", error);
      showSnackbar("Failed to export salesman data", "error");
    } finally {
      setLoading(false);
      setShowExportDropdown(false);
    }
  };

  const fetchSalesman = useCallback(
    async (
      page: number = 1,
      pageSize: number = 50
    ): Promise<listReturnType> => {
      try {
        setLoading(true);
        const listRes = await salesmanList({
          page: page.toString(),
        });
        setLoading(false);
        return {
          data: listRes.data || [],
          total: listRes.pagination.totalPages,
          currentPage: listRes.pagination.page,
          pageSize: listRes.pagination.limit,
        };
      } catch (error: unknown) {
        console.error("API Error:", error);
        setLoading(false);
        throw error;
      }
    },
    []
  );


  return (
    <>
      {/* Table */}
      
      <div className="flex flex-col h-full">
        <Table
                    refreshKey={refreshKey}
          config={{
            api: { list: fetchSalesman },
            header: {
              title: "Salesman",
              threeDot: [
                {
                  icon: "gala:file-document",
                  label: "Export CSV",
                  onClick: (data: TableDataType[], selectedRow?: number[]) => {
                    handleExport("csv")
                  },
                },
                {
                  icon: "gala:file-document",
                  label: "Export Excel",
                  onClick: (data: TableDataType[], selectedRow?: number[]) => {
                    handleExport("xlsx")
                  },
                },
                {
                  icon: "lucide:radio",
                  label: "Inactive",
                  showOnSelect: true,
                 onClick: (data: TableDataType[], selectedRow?: number[]) => {
                    handleStatusChange(data, selectedRow, "0");
                },
              }
              ],

              // wholeTableActions: [
              //   <div key={0} className="flex gap-[12px] relative">
              //     <DismissibleDropdown
              //       isOpen={showDropdown}
              //       setIsOpen={setShowDropdown}
              //       button={<BorderIconButton icon="ic:sharp-more-vert" />}
              //       dropdown={
              //         <div className="absolute top-[40px] right-0 z-30 w-[226px]">
              //           <CustomDropdown>
              //             {dropdownDataList.map((link, idx) => (
              //               <div
              //                 key={idx}
              //                 className="px-[14px] py-[10px] flex items-center gap-[8px] hover:bg-[#FAFAFA]"
              //               >
              //                 <Icon
              //                   icon={link.icon}
              //                   width={link.iconWidth}
              //                   className="text-[#717680]"
              //                 />
              //                 <span className="text-[#181D27] font-[500] text-[16px]">
              //                   {link.label}
              //                 </span>
              //               </div>
              //             ))}
              //           </CustomDropdown>
              //         </div>
              //       }
              //     />
              //   </div>,
              // ],
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
            pageSize: 50,
          }}
        />
      </div>
    </>
  );
};

export default SalesmanPage;
