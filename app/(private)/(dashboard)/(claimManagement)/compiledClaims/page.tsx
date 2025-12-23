"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Table, { TableDataType, listReturnType, searchReturnType } from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import { downloadFile } from "@/app/services/allApi";
import {compailedClaimList,exportCompailedData} from "@/app/services/claimManagement";
import { useLoading } from "@/app/services/loadingContext";
import { formatWithPattern } from "@/app/utils/formatDate";
import { useSnackbar } from "@/app/services/snackbarContext";
import StatusBtn from "@/app/components/statusBtn2";
import toInternationalNumber from "@/app/(private)/utils/formatNumber";
import { usePagePermissions } from "@/app/(private)/utils/usePagePermissions";


// 🔹 Dropdown menu data
interface DropdownItem {
  icon: string;
  label: string;
  iconWidth: number;
}

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
  { key: "claim_period", label: "Claim Period", render: (row: TableDataType) => {
  const cp = row.claim_period;
  if (cp === null || cp === undefined) return "-";
  if (typeof cp === "string") {
    // expected format: 'YYYY-MM-DD to YYYY-MM-DD' or similar
    const parts = cp.split(/\s+to\s+/i).map(p => p.trim()).filter(Boolean);
    if (parts.length === 2) {
      const d1 = new Date(parts[0]);
      const d2 = new Date(parts[1]);
      if (!isNaN(d1.getTime()) && !isNaN(d2.getTime())) {
        // If both dates are in the same month and year, shorten to 'DD to DD MMM YYYY'
        const sameMonth = d1.getMonth() === d2.getMonth();
        const sameYear = d1.getFullYear() === d2.getFullYear();
        if (sameMonth && sameYear) {
          const day1 = formatWithPattern(d1, "DD", "en-GB");
          const day2 = formatWithPattern(d2, "DD MMM YYYY", "en-GB");
          return `${day1} to ${day2}`;
        }
        // otherwise show full range
        return `${formatWithPattern(d1, "DD MMM YYYY", "en-GB")} to ${formatWithPattern(d2, "DD MMM YYYY", "en-GB") || "-"}`;
      }
    }
    // fallback: try parsing as single date
    const single = new Date(cp);
    if (!isNaN(single.getTime())) return formatWithPattern(single, "DD MMM YYYY", "en-GB") || "-";
    return cp;
  }
  if ((cp as any) instanceof Date) return formatWithPattern(cp as Date, "DD MMM YYYY", "en-GB") || "-";
  return String(cp) || "-";
  } },
  
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
  
  { key: "approved_qty_cse", label: "Approved Qty (CSE)", render: (row: TableDataType) => toInternationalNumber(row.approved_qty_cse || "-") },
  { key: "approved_claim_amount", label: "Approved Claim Amount", render: (row: TableDataType) => toInternationalNumber(row.approved_claim_amount || "-") },
  { key: "rejected_qty_cse", label: "Rejected Qty (CSE)", render: (row: TableDataType) => toInternationalNumber(row.rejected_qty_cse || "-") },
  { key: "rejected_amount", label: "Rejected Amount", render: (row: TableDataType) => toInternationalNumber(row.rejected_amount || "-" )},
  { key: "area_sales_supervisor", label: "Area Sales Manager", render: (row: TableDataType) => row.area_sales_supervisor || "-" },
  { key: "regional_sales_manager", label: "Regional Sales Manager", render: (row: TableDataType) => row.regional_sales_manager || "-" },
  {
    key: "status",
    label: "Status",
    render: (row: TableDataType) => (
      <StatusBtn isActive={String(row.status) > "0"} />
    ),
  },
];

export default function CompailedClaim() {
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


  const fetchCompailed = useCallback(
    async (
      page: number = 1,
      pageSize: number = 50
    ): Promise<listReturnType> => {
      try {
        // setLoading(true);
        const listRes = await compailedClaimList({
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
      const response = await exportCompailedData({ format });
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
              list: fetchCompailed,
              // search: searchVehicle,
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
              title: "Compiled Claims",


              // searchBar: true,
              columnFilter: true,
              actions: can("create") ? [
                <SidebarBtn
                  key={0}
                  href="/compiledClaims/add"
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
            //       router.push(`/vehicle/details/${data.uuid}`);
            //     },
            //   },
            //   {
            //     icon: "lucide:edit-2",
            //     onClick: (row: object) => {
            //       const r = row as TableDataType;
            //       router.push(
            //         `/vehicle/${r.uuid}`
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

    </>
  );
}
