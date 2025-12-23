"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Table, {
  listReturnType,
  TableDataType,
} from "@/app/components/customTable";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
import { downloadFile } from "@/app/services/allApi";
import {
  returnExportCollapse,
  returnList,
  returnQuickView,
} from "@/app/services/companyTransaction";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import Drawer from "@mui/material/Drawer";
import toInternationalNumber from "@/app/(private)/utils/formatNumber";
import { reasonObj } from "./add/page";
import { formatWithPattern } from "@/app/utils/formatDate";
import { usePagePermissions } from "@/app/(private)/utils/usePagePermissions";

const columns = [
  { key: "return_code", label: "Return Code", showByDefault: true },
  {
    key: "company_name",
    label: "Company Name",
    showByDefault: true,
    render: (row: TableDataType) => {
      const code = row.company_code ?? "";
      const name = row.company_name ?? "";
      if (!code && !name) return "-";
      return `${code}${code && name ? " - " : ""}${name}`;
    },
  },
  {
    key: "customer_name",
    label: "Customer Name",
    showByDefault: true,
    render: (row: TableDataType) => {
      const code = row.customer_code ?? "";
      const name = row.customer_name ?? "";
      if (!code && !name) return "-";
      return `${code}${code && name ? " - " : ""}${name}`;
    },
  },
  {
    key: "warehouse_name",
    label: "Warehouse Name",
    showByDefault: true,
    render: (row: TableDataType) => {
      const code = row.warehouse_code ?? "";
      const name = row.warehouse_name ?? "";
      if (!code && !name) return "-";
      return `${code}${code && name ? " - " : ""}${name}`;
    },
  },
  {
    key: "truck_no",
    label: "Truck Number",
  },
  { key: "message", label: "Message", showByDefault: true },
];

export default function CustomerInvoicePage() {
  const { can, permissions } = usePagePermissions();
  const {
    customerSubCategoryOptions,
    companyOptions,
    salesmanOptions,
    channelOptions,
    warehouseAllOptions,
    routeOptions,
    regionOptions,
    areaOptions,
   ensureAreaLoaded, ensureChannelLoaded, ensureCompanyLoaded, ensureCustomerSubCategoryLoaded, ensureRegionLoaded, ensureRouteLoaded, ensureSalesmanLoaded, ensureWarehouseAllLoaded} = useAllDropdownListData();

  // Load dropdown data
  useEffect(() => {
    ensureAreaLoaded();
    ensureChannelLoaded();
    ensureCompanyLoaded();
    ensureCustomerSubCategoryLoaded();
    ensureRegionLoaded();
    ensureRouteLoaded();
    ensureSalesmanLoaded();
    ensureWarehouseAllLoaded();
  }, [ensureAreaLoaded, ensureChannelLoaded, ensureCompanyLoaded, ensureCustomerSubCategoryLoaded, ensureRegionLoaded, ensureRouteLoaded, ensureSalesmanLoaded, ensureWarehouseAllLoaded]);
  const { showSnackbar } = useSnackbar();
  const router = useRouter();
  const [refreshKey, setRefreshKey] = useState(0);

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

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [drawerDetailOpen, setDrawerDetailOpen] = useState(false);
  const [selectedItemIdDetail, setSelectedItemIdDetail] = useState<Array<Record<string, unknown> | null>>([]);

  const fetchOrders = useCallback(
    async (page: number = 1, pageSize: number = 5): Promise<listReturnType> => {
      const params: Record<string, string> = {
        page: page.toString(),
        pageSize: pageSize.toString(),
      };
      const listRes = await returnList(params);
      return {
        data: Array.isArray(listRes.data) ? listRes.data : [],
        total: listRes?.pagination?.totalPages || 1,
        currentPage: listRes?.pagination?.page || 1,
        pageSize: listRes?.pagination?.limit || pageSize,
      };
    },
    []
  );

  const filterBy = useCallback(
    async (
      payload: Record<string, string | number | null>,
      pageSize: number
    ): Promise<listReturnType> => {
      let result;
      try {
        const params: Record<string, string> = {
          per_page: pageSize.toString(),
        };
        Object.keys(payload || {}).forEach((k) => {
          const v = payload[k as keyof typeof payload];
          if (v !== null && typeof v !== "undefined" && String(v) !== "") {
            params[k] = String(v);
          }
        });
        result = await returnList(params);
      } catch (error) {
        throw new Error(String(error));
      }

      if (result?.error)
        throw new Error(result.data?.message || "Filter failed");
      else {
        const pagination =
          result.pagination?.pagination || result.pagination || {};
        return {
          data: result.data || [],
          total: pagination.totalPages || result.pagination?.totalPages || 0,
          totalRecords:
            pagination.totalRecords || result.pagination?.totalRecords || 0,
          currentPage:
            pagination.current_page || result.pagination?.currentPage || 0,
          pageSize: pagination.limit || pageSize,
        };
      }
    },
    []
  );

  const exportFile = async (format: "csv" | "xlsx" = "csv") => {
    try {
      setThreeDotLoading((prev) => ({ ...prev, [format]: true }));
      const response = await returnExportCollapse({ format });
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
    }
  };

  useEffect(() => {
    setRefreshKey((k) => k + 1);
  }, [
    companyOptions,
    customerSubCategoryOptions,
    routeOptions,
    warehouseAllOptions,
    channelOptions,
    salesmanOptions,
    areaOptions,
    regionOptions,
  ]);

  return (
    <>
      <div className="flex flex-col h-full">
        <Table
          refreshKey={refreshKey}
          config={{
            api: { list: fetchOrders, filterBy: filterBy },
            header: {
              title: "Company Returns",
              searchBar: false,
              columnFilter: true,
              threeDot: [
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
              ],
              filterByFields: [
                {
                  key: "start_date",
                  label: "Start Date",
                  type: "date",
                },
                {
                  key: "end_date",
                  label: "End Date",
                  type: "date",
                },
              ],
              actions: can("create") ? [
                <SidebarBtn
                  key={1}
                  href="/return/add"
                  isActive
                  leadingIcon="mdi:plus"
                  label="Add"
                  labelTw="hidden lg:block"
                />,
              ] : [],
            },
            rowSelection: true,
            footer: { nextPrevBtn: true, pagination: true },
            columns,
            rowActions: [
              {
                icon: "lucide:eye",
                onClick: (row: TableDataType) => {
                    router.push(`/return/details/${row.uuid}`);
                }
              },
              {
                icon: "lucide:view",
                onClick: (row: TableDataType) => {
                  setDrawerOpen(true);
                  setSelectedItemId(row.id as string);
                  console.log("Selected Item ID:", row.id);
                }
              },
            ],
            pageSize: 10,
          }}
        />
      </div>
      <Drawer anchor="right"  open={drawerOpen} onClose={() => { setDrawerOpen(false) }} >
      <div className="flex flex-col h-full w-[calc(100vw-100px)] lg:w-[600px] p-4">
          <h2 className="text-[20px] font-semibold mb-[20px]">Temporary Return</h2>
          {selectedItemId ? (
              <div>
                  <Table
                      config={{
                          api: {
                              list: async () => {
                                  const res = await returnQuickView({ return_id: selectedItemId });
                                  return {
                                      data: res.data.temp_returns || [],
                                      total: res.data ? res.data.temp_returns.length : 0,
                                      currentPage: 1,
                                      pageSize: res.data ? res.data.temp_returns.length : 0,
                                  };
                              }
                          },
                          header: {
                              title: "",
                              searchBar: false,
                              columnFilter: true,
                          },
                          footer: { nextPrevBtn: false, pagination: false },
                          columns: [
                              { key: "return_code", label: "Return Code" },
                              { key: "invoice_sap_id", label: "Invoice SAP Id" },
                              { key: "return_type", label: "Return Type" },
                              { key: "return_reason", label: "Return Reason", render: (row: TableDataType) => <>{row.Type === "good" ? reasonObj.good.find(r => r.value === row.return_reason)?.label : reasonObj.bad.find(r => r.value === row.return_reason)?.label}</> },
                              { key: "sap_return_msg", label: "SAP Return Message" },
                              { key: "net", label: "Net", render: (row: TableDataType) => row.net ? toInternationalNumber(Number(row.net)) : "0.00" },
                              { key: "vat", label: "VAT", render: (row: TableDataType) => row.vat ? toInternationalNumber(Number(row.vat)) : "0.00" },
                              { key: "total", label: "Total", render: (row: TableDataType) => row.total ? toInternationalNumber(Number(row.total)) : "0.00" },
                          ],
                          rowActions: [
                            {
                                icon: "lucide:eye",
                                onClick: (row: TableDataType) => {
                                    setDrawerDetailOpen(true);
                                    setSelectedItemIdDetail(row.details);
                                    console.log("Selected Item ID Details:", row.details);
                                }
                            },
                            {
                                label: "SAP",
                                onClick: (row: TableDataType) => {
                                    // router.push(`/master/item/${row.item_id}`);
                                },
                            },
                          ],
                          localStorageKey: "hariss-return-quick-view-table-list",
                          pageSize: 1,
                      }}
                  />
              </div>
          ) : (
              <p>No item selected.</p>
          )}
      </div>
      </Drawer>
      <Drawer anchor="right"  open={drawerDetailOpen} onClose={() => { setDrawerDetailOpen(false) }} >
        <div className="flex flex-col h-full w-[calc(100vw-200px)] lg:w-[500px] p-4">
            <h2 className="text-[20px] font-semibold mb-[20px]">Temporary Return Details</h2>
            {selectedItemIdDetail ? (
                <div>
                    <Table
                        data={(selectedItemIdDetail ?? []) as TableDataType[]}
                        config={{
                            header: {
                                title: "",
                                searchBar: false,
                                columnFilter: true,
                            },
                            footer: { nextPrevBtn: false, pagination: false },
                            columns: [
                                { key: "batch_no", label: "Batch No" },
                                { key: "actual_expiry_date", label: "Expiry Date", render: (value: TableDataType) => <>{value.actual_expiry_date ? formatWithPattern(new Date(value.actual_expiry_date),"DD MMM YYYY","en-GB").toLowerCase() : ""}</> },
                                { key: "item_name", label: "Item Name", render: (value: TableDataType) => <>{value.item_code ? `${value.item_code}` : ""} {value.item_code && value.item_name ? " - " : ""} {value.item_name ? value.item_name : ""}</> },
                                { key: "uom", label: "UOM" },
                                { key: "qty", label: "Quantity", render: (value: TableDataType) => <>{toInternationalNumber(value.qty, { maximumFractionDigits: 0 }) || '0'}</> },
                                { key: "net", label: "Net", render: (value: TableDataType) => <>{toInternationalNumber(value.net) || '0.00'}</> },
                                { key: "vat", label: "VAT", render: (value: TableDataType) => <>{toInternationalNumber(value.vat) || '0.00'}</> },
                                { key: "item_value", label: "Price", render: (value: TableDataType) => <>{toInternationalNumber(value.item_value) || '0.00'}</> },
                                { key: "total", label: "Total", render: (value: TableDataType) => <>{toInternationalNumber(value.total) || '0.00'}</> },
                                { key: "remark", label: "Remark"},
                            ],
                            localStorageKey: "hariss-return-quick-view-table-list",
                            pageSize: 1,
                        }}
                    />
                </div>
            ) : (
                <p>No item selected.</p>
            )}
        </div>
        </Drawer>
    </>
  );
}
