"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Table, {
  listReturnType,
  TableDataType,
} from "@/app/components/customTable";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useLoading } from "@/app/services/loadingContext";
import StatusBtn from "@/app/components/statusBtn2";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
import { downloadFile } from "@/app/services/allApi";
import { formatWithPattern } from "@/app/(private)/utils/date";
import {
  compensationReportExport,
  compensationReportList,
} from "@/app/services/companyTransaction";
import { toInternationalNumber } from "@/app/(private)/utils/formatNumber";
import { usePagePermissions } from "@/app/(private)/utils/usePagePermissions";

// const dropdownDataList = [
//     // { icon: "lucide:layout", label: "SAP", iconWidth: 20 },
//     // { icon: "lucide:download", label: "Download QR Code", iconWidth: 20 },
//     // { icon: "lucide:printer", label: "Print QR Code", iconWidth: 20 },
//     { icon: "lucide:radio", label: "Inactive", iconWidth: 20 },
//     { icon: "lucide:delete", label: "Delete", iconWidth: 20 },
// ];

// 🔹 Table Columns
const columns = [
    { key: "sap_id", label: "SAP Code", showByDefault: true },
  {
    key: "invoice_date",
    label: "Date",
    showByDefault: true,
    render: (row: TableDataType) => {
      if (!row.invoice_date) return "-";
      return (
        formatWithPattern(
          new Date(row.invoice_date),
          "DD MMM YYYY",
          "en-GB",
        ).toLowerCase() || "-"
      );
    },
  },
  { key: "invoice_code", label: "Invoice Code", showByDefault: true },
   {
          key: "warehouse_code", label: "Distributor", showByDefault: true,
          render: (row: TableDataType) => {
              const code = row.warehouse_code || "-";
              const name = row.warehouse_name || "-";
              return `${code}${code && name ? " - " : "-"}${name}`;
          }
      },
  { key: "item_category_dll", label: "Compensation Code", showByDefault: true },
   {
      key: "erp_code", label: "Item", showByDefault: true,
      render: (row: TableDataType) => {
        const code = row.erp_code || "-";
        const name = row.item_name || "-";
        return `${code}${code && name ? " - " : "-"}${name}`;
      }
    },
  { key: "base_uom_vol_calc", label: "Facotry Price", showByDefault: true, render: (row: TableDataType) => (row.base_uom_vol_calc) ?? "-" },
  { key: "alter_base_uom_vol_calc", label: "Purchase Price", showByDefault: true, render: (row: TableDataType) => (row.alter_base_uom_vol_calc) ?? "-" },
  { key: "quantity", label: "Free Quantity", showByDefault: true, render: (row: TableDataType) => toInternationalNumber(row.quantity) ?? "-" },
  { key: "total_amount", label: "Amount", showByDefault: true, render: (row: TableDataType) => <>{toInternationalNumber(row.total_amount) || '0.00'}</> },
  {
    key: "status",
    label: "Status",
    render: (row: TableDataType) => {
      // Treat status 1 or 'active' (case-insensitive) as active
      const isActive =
        String(row.status) === "1" ||
        (typeof row.status === "string" &&
          row.status.toLowerCase() === "active");
      return <StatusBtn isActive={isActive} />;
    },
  },
];

export default function CustomerInvoicePage() {
  const { can, permissions } = usePagePermissions();
  const { showSnackbar } = useSnackbar();
  const { setLoading } = useLoading();
  const [refreshKey, setRefreshKey] = useState<number>(0);

  // Refresh table when permissions load
  useEffect(() => {
    if (permissions.length > 0) {
      setRefreshKey((prev) => prev + 1);
    }
  }, [permissions]);

  const [threeDotLoading, setThreeDotLoading] = useState({
    csv: false,
    xlsx: false,
  });
  const [hasData, setHasData] = useState(false);
  const lastParamsRef = useRef<Record<string, string>>({});
 
  const filterBy = useCallback(
    async (
      payload: Record<string, string | number | null>,
    //   pageSize: number,
    ): Promise<listReturnType> => {
      let result;
      setLoading(true);
      try {
        const params: Record<string, string> = {
        //   per_page: pageSize.toString(),
        };
        Object.keys(payload || {}).forEach((k) => {
          const v = payload[k as keyof typeof payload];
          if (v !== null && typeof v !== "undefined" && String(v) !== "") {
            params[k] = String(v);
          }
        });
        result = await compensationReportList(params);
        // remember last used params (so export can reuse filters like from_date/to_date)
        try {
          lastParamsRef.current = { ...params };
        } catch (e) {
          // ignore
        }
        // reflect whether API returned any rows so UI (three-dots) can react
        try {
          const rows = Array.isArray(result?.data) ? result.data : (result && result.data ? result.data : []);
          setHasData(Array.isArray(rows) && rows.length > 0);
        } catch (e) {
          setHasData(false);
        }
      } finally {
        setLoading(false);
      }

      if (result?.error)
        throw new Error(result.data?.message || "Filter failed");
      else {
        const pagination = result.pagination || {};
        return {
          data: result.data || [],
          total: pagination?.last_page || 1,
          totalRecords: pagination?.total || 0,
          currentPage: pagination?.current_page || 1,
          pageSize: pagination?.per_page ,
        };
      }
    },
    [setLoading],
  );

  const exportFile = async (format: "csv" | "xlsx" = "csv") => {
    try {
      setThreeDotLoading((prev) => ({ ...prev, [format]: true }));
      // include last used filter params (e.g. from_date/to_date) when exporting
      const payload: Record<string, any> = { format };
      if (lastParamsRef.current && Object.keys(lastParamsRef.current).length > 0) {
        Object.assign(payload, lastParamsRef.current);
      }
      const response = await compensationReportExport(payload);
      if (response && typeof response === "object" && response.download_url) {
        await downloadFile(response.download_url);
        showSnackbar("File downloaded successfully ", "success");
      } else {
        showSnackbar("Failed to get download URL", "error");
      }
      setThreeDotLoading((prev) => ({ ...prev, [format]: false }));
    } catch (error) {
      showSnackbar("Failed to download warehouse data", "error");
      setThreeDotLoading((prev) => ({ ...prev, [format]: false }));
    } finally {
    }
  };

  return (
    <div
      className="
            flex flex-col
            h-full
          "
    >
      {/* 🔹 Table Section */}
      <Table
        refreshKey={refreshKey}
        config={{
          api: {
            filterBy: filterBy },
          header: {
            title: "Compensation Report",
            columnFilter: true,
            searchBar: false,
            threeDot: hasData
              ? [
                  {
                    icon: threeDotLoading.csv
                      ? "eos-icons:three-dots-loading"
                      : "gala:file-document",
                    label: "Export CSV",
                    labelTw: "text-[12px] hidden sm:block",
                    onClick: () => !threeDotLoading.csv && exportFile("csv"),
                  },
                  {
                    icon: threeDotLoading.xlsx
                      ? "eos-icons:three-dots-loading"
                      : "gala:file-document",
                    label: "Export Excel",
                    labelTw: "text-[12px] hidden sm:block",
                    onClick: () => !threeDotLoading.xlsx && exportFile("xlsx"),
                  },
                ]
              : undefined,
            filterByFields: [
              {
                key: "from_date",
                label: "Start Date",
                type: "date",
              },
              {
                key: "to_date",
                label: "End Date",
                type: "date",
              },
            ],
          },
          footer: { nextPrevBtn: true, pagination: true },
          columns,
          rowSelection: true,
          localStorageKey: "invoice-table",
        //   rowActions: [
        //     {
        //       icon: "lucide:eye",
        //       onClick: (row: TableDataType) =>
        //         router.push(`/delivery/details/${row.uuid}`),
        //     },
        //   ],
          pageSize: 10,
        }}
      />
    </div>
  );
}
