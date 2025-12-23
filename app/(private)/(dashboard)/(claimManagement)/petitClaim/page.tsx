"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Table, { TableDataType, listReturnType, searchReturnType } from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import { downloadFile } from "@/app/services/allApi";
import { useLoading } from "@/app/services/loadingContext";
import { useSnackbar } from "@/app/services/snackbarContext";
import StatusBtn from "@/app/components/statusBtn2";
import { petitClaimList,exportPetitData } from "@/app/services/claimManagement";
import toInternationalNumber from "@/app/(private)/utils/formatNumber";
import ImageThumbnail from "@/app/components/ImageThumbnail";
import { usePagePermissions } from "@/app/(private)/utils/usePagePermissions";



// const dropdownDataList: DropdownItem[] = [
//   // { icon: "lucide:layout", label: "SAP", iconWidth: 20 },
//   // { icon: "lucide:download", label: "Download QR Code", iconWidth: 20 },
//   // { icon: "lucide:printer", label: "Print QR Code", iconWidth: 20 },
//   { icon: "lucide:radio", label: "Inactive", iconWidth: 20 },
//   { icon: "lucide:delete", label: "Delete", iconWidth: 20 },
// ];

// 🔹 Table columns
const columns = [
  { key: "osa_code", label: "Code", render: (row: TableDataType) => (<span className="font-semibold text-[#181D27] text-[14px]">{row.osa_code || "-"}</span>) },
  { key: "claim_period", label: "Claim Period", render: (row: TableDataType) => `${row.year || "-"} ${row.month_range || "-"}` },
  
   {
     key: "warehouse", label: "Distributor",render: (row: TableDataType) => {
         const wh = row.warehouse;
         let code = "";
         let name = "";
         if (wh && typeof wh === "object" && wh !== null) {
           const w = wh as { code?: string; name?: string };
           code = w.code ?? "-";
           name = w.name ?? "-";
         } else if (typeof wh === "string") {
           name = wh;
         }
 
         
         return <>{code && name? code +"-"+name:"-"}</>;
       },
       
   },
  
  { key: "fuel_amount", label: "Fuel Spport Amount", render: (row: TableDataType) => toInternationalNumber(row.fuel_amount || "-") },
  { key: "rent_amount", label: "Rent Support Amount", render: (row: TableDataType) => toInternationalNumber(row.rent_amount || "-") },
  { 
    key: "claim_file", 
    label: "Claim File", 
    render: (row: TableDataType) => {
      const file = row.claim_file;
      if (!file) return "-";

      // Use global ImageThumbnail component; pass the object/ string directly.
      // If your image URLs are relative (not starting with http), you can pass
      // a baseUrl prop (e.g. process.env.NEXT_PUBLIC_ASSET_BASE) when needed.
      return (
        <ImageThumbnail
          src={file as any}
          alt={(file as any)?.name || "claim file"}
          width={56}
          height={40}
          className="rounded-md"
          // baseUrl could be provided here if required in your environment
        />
      );
    }
  },
 
  {
    key: "status",
    label: "Status",
    render: (row: TableDataType) => (
      <StatusBtn isActive={String(row.status) > "0"} />
    ),
  },
];
export default function VehiclePage() {
  const { can, permissions } = usePagePermissions();
  const { setLoading } = useLoading();
  const [refreshKey, setRefreshKey] = useState(0);

  // Refresh table when permissions load
  useEffect(() => {
    if (permissions.length > 0) {
      setRefreshKey((prev) => prev + 1);
    }
  }, [permissions]);

  const [threeDotLoading, setThreeDotLoading] = useState<{ [key: string]: boolean }>({ csv: false, xlsx: false });
  const { showSnackbar } = useSnackbar();
  const router = useRouter();


  const fetchVehicles = useCallback(
    async (
      page: number = 1,
      pageSize: number = 50
    ): Promise<listReturnType> => {
      try {
        // setLoading(true);
        const listRes = await petitClaimList({
          // limit: pageSize.toString(),
          // page: page.toString(),
        });
        // setLoading(false);
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



  const exportFile = async (format: string) => {
    try {
      setThreeDotLoading((prev) => ({ ...prev, [format]: true }));
      const response = await exportPetitData({ format });
      if (response && typeof response === 'object' && response.url) {
        await downloadFile(response.url);
        showSnackbar("File downloaded successfully", "success");
      } else {
        showSnackbar("Failed to get download URL", "error");
        setThreeDotLoading((prev) => ({ ...prev, [format]: false }));
      }
    } catch (error) {
      showSnackbar("Failed to download vehicle data", "error");
      setThreeDotLoading((prev) => ({ ...prev, [format]: false }));
    } finally {
    }
  };


  return (
    <>

      <div className="flex flex-col h-full">
        <Table
          refreshKey={refreshKey}
          config={{
            api: {
              list: fetchVehicles,
            },
            header: {
              threeDot: [
                {
                  icon: threeDotLoading.csv ? "eos-icons:three-dots-loading" : "gala:file-document",
                  label: "Export CSV",
                  labelTw: "text-[12px] hidden sm:block",
                  onClick: () => !threeDotLoading.csv && exportFile("csv"),
                },
                {
                  icon: threeDotLoading.xlsx ? "eos-icons:three-dots-loading" : "gala:file-document",
                  label: "Export Excel",
                  labelTw: "text-[12px] hidden sm:block",
                  onClick: () => !threeDotLoading.xlsx && exportFile("xlsx"),
                },
                
              ],
              title: "Petit Claim",


              // searchBar: true,
              columnFilter: true,
              actions: can("create") ? [
                <SidebarBtn
                  key={0}
                  href="/petitClaim/add"
                  isActive
                  leadingIcon="lucide:plus"
                  label="Add"
                  labelTw="hidden sm:block"
                />,
              ] : [],
            },
            localStorageKey: "vehicle-table",
            footer: { nextPrevBtn: true, pagination: true },
            columns,
            // rowSelection: true,
            // rowActions: [
            //   {
            //     icon: "lucide:eye",
            //     onClick: (data: TableDataType) => {
            //       router.push(`/petitClaim/details/${data.uuid}`);
            //     },
            //   },
            //   {
            //     icon: "lucide:edit-2",
            //     onClick: (row: object) => {
            //       const r = row as TableDataType;
            //       router.push(
            //         `/petitClaim/${r.uuid}`
            //       );
            //     },
            //   },
            //   // {
            //   //   icon: "lucide:trash-2",
            //   //   onClick: (row: object) => {
            //   //     const r = row as TableDataType;
            //   //     setSelectedRow({ id: r.id });
            //   //     setShowDeletePopup(true);
            //   //   },
            //   // },
            // ],
            pageSize: 50,
          }}
        />
      </div>

      {/* Delete Popup */}
      {/* {showDeletePopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <DeleteConfirmPopup
            title="Delete Vehicle"
            onClose={() => setShowDeletePopup(false)}
            onConfirm={handleConfirmDelete}
          />
        </div>
      )} */}
    </>
  );
}
