"use client";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import InputFields from "@/app/components/inputFields";
import AutoSuggestion from "@/app/components/autoSuggestion";
import Loading from "@/app/components/Loading";
import Table, { TableDataType } from "@/app/components/customTable";
import {
  warehouseListGlobalSearch,
} from "@/app/services/allApi";
import {filterCompailedClaim,createCompailedClaim} from "@/app/services/claimManagement";
import { useSnackbar } from "@/app/services/snackbarContext";
import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import * as yup from "yup";
import toInternationalNumber from "@/app/(private)/utils/formatNumber";


interface CompiledClaimRow {
    warehouse_id?: string | number;
    item_name?: string;
    price?: string | number;
    claim_period?: string;
    total_approved_qty?: number;
    approved_qty?: number;
    approved_claim_amount?: number;
    total_rejected_qty?: number;
    rejected_amount?: number;
    area_sales_supervisor?: string;
    regional_sales_manager?: string;
    month_range?: string;
    promo_count?: number;
    promo_qty?: string | number;
    promo_amount?: number;
    reject_qty?: string | number;
    rejecte_amount?: number;
  };

export default function AddEditRoute() {
  const {  warehouseOptions } =
    useAllDropdownListData();
  const { showSnackbar } = useSnackbar();
  const params = useParams();
  const routeId = params?.uuid as string | undefined;
  const isEditMode = routeId !== undefined && routeId !== "add";
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<CompiledClaimRow[]>([]);
  const [creatingMap, setCreatingMap] = useState<Record<string, boolean>>({});
  
  const [form, setForm] = useState({
    fromDate: "",
    toDate: "",
    routeType: "",
    vehicleType: "",
    warehouse: "",
    status: "1",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Helper to compute default period (1st-15th or 16th-last) per rules:
  // - If today is the month's last day -> default to 1st - 15th
  // - If today is 15th or greater but not last day -> default to 16th - last day
  // - Otherwise (1st-14th) -> default to 1st - 15th
  const computeDefaultPeriod = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth(); // 0-based
    const day = today.getDate();
    const lastDay = new Date(year, month + 1, 0).getDate();

    const pad = (n: number) => String(n).padStart(2, "0");
    const monthIndex = month + 1; // 1-based month

    if (day === lastDay) {
      // last day -> show first half
      const from = `${year}-${pad(monthIndex)}-01`;
      const to = `${year}-${pad(monthIndex)}-15`;
      return { fromDate: from, toDate: to };
    }

    if (day >= 15) {
      // 15 .. lastDay-1 -> show second half (16 .. last)
      const from = `${year}-${pad(monthIndex)}-16`;
      const to = `${year}-${pad(monthIndex)}-${pad(lastDay)}`;
      return { fromDate: from, toDate: to };
    }

    // day 1..14 -> first half
    return { fromDate: `${year}-${pad(monthIndex)}-01`, toDate: `${year}-${pad(monthIndex)}-15` };
  };

  // Initialize form dates with computed defaults
  useEffect(() => {
    const period = computeDefaultPeriod();
    setForm((prev) => ({ ...prev, fromDate: period.fromDate, toDate: period.toDate }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Validation schema
  const validationSchema = yup.object().shape({
    fromDate: yup
      .string()
      .required("From Date is required"),
    toDate: yup
      .string()
      .required("To Date is required"),

    routeType: yup.string().required("Route Type is required"),
    warehouse: yup.string().required("Distributor is required"),
    status: yup.string().required("Status is required"),
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleWarehouseSearch = async (searchText: string) => {
    try {
      if (!searchText || String(searchText).trim() === "") return [];
      const res = await warehouseListGlobalSearch({ query: searchText,  per_page: "10000" });
      if (res?.error) return [];
      const data = Array.isArray(res?.data) ? res.data : [];
      return data.map((w: { id?: string | number; value?: string | number; warehouse_code?: string; code?: string; warehouse_name?: string; name?: string }) => ({
        value: String(w.id ?? w.value ?? ""),
        label: `${w.warehouse_code ?? w.code ?? ""}${w.warehouse_name || w.name ? " - " : ""}${w.warehouse_name ?? w.name ?? ""}`,
      }));
    } catch (e) {
      console.error("warehouse search failed", e);
      return [];
    }
  };

 

  // Search compiled claims by claim period and warehouse
  const handleSearch = async () => {
    // simple validation: require both fields
    const missing: Record<string, string> = {};
    if (!form.fromDate || form.fromDate.trim() === "") missing.fromDate = "From Date is required";
    if (!form.toDate || form.toDate.trim() === "") missing.toDate = "To Date is required";
    if (!form.warehouse || form.warehouse.trim() === "") missing.warehouse = "Distributor is required";
    if (Object.keys(missing).length > 0) {
      setErrors((prev) => ({ ...prev, ...missing }));
      return;
    }

    setSearchLoading(true);
    try {
      const params = {
        from_date: form.fromDate,
        to_date: form.toDate,
        warehouse_id: form.warehouse,
      };
      const res = await filterCompailedClaim(params);
      if (res?.error) {
        showSnackbar(res.data?.message || "Failed to fetch compiled claims", "error");
        setSearchResults([]);
      } else {
        const results = Array.isArray(res?.data) ? res.data : (res && res.data ? res.data : res);
        setSearchResults(results || []);
      }
    } catch (err) {
      console.error("Search failed", err);
      showSnackbar("Failed to fetch compiled claims", "error");
    } finally {
      setSearchLoading(false);
    }
  };

  // Create a compiled claim for a single row
  
  const handleCreateCompiledClaim = async (row: CompiledClaimRow) => {
    const key = `${row.warehouse_id ?? ""}_${row.item_name ?? ""}_${row.price ?? ""}`;
    if (creatingMap[key]) return;
    setCreatingMap(prev => ({ ...prev, [key]: true }));
    try {
      // build payload matching the requested shape. Assumptions made where fields
      // are not present in the row/form:
      // - claim_period: if row.claim_period exists use it, otherwise derive from dates
      // - warehouse_id: prefer row.warehouse_id, fallback to selected warehouse in form
      // - monetary/qty fields coerced to numbers; missing string fields default to empty
      const payload = {
        start_date: form.fromDate,
        end_date: form.toDate,
        // claim_period may be provided by the API row; otherwise derive a readable range
        claim_period: row.claim_period ?? `${form.fromDate} to ${form.toDate}`,
        warehouse_id: String(row.warehouse_id ?? form.warehouse ?? ""),
        // quantities in CSE
        approved_qty_cse: Number(row.total_approved_qty ?? row.approved_qty ?? 0),
        // total approved claim amount; prefer explicit field, otherwise compute price * qty
        approved_claim_amount: Number(
          row.approved_claim_amount ?? (parseFloat(String(row.price ?? 0)) * Number(row.total_approved_qty ?? 0))
        ),
        rejected_qty_cse: Number(row.total_rejected_qty ?? 0),
        rejected_amount: Number(row.rejected_amount ?? 0),
        area_sales_supervisor: row.area_sales_supervisor ?? "",
        regional_sales_manager: row.regional_sales_manager ?? "",
        // month_range / promo / reject fields: prefer row values if present
        month_range: row.month_range ?? "",
        promo_count: Number(row.promo_count ?? 0),
        promo_qty: row.promo_qty ?? "",
        promo_amount: Number(row.promo_amount ?? 0),
        reject_qty: row.reject_qty ?? "",
        rejecte_amount: Number(row.rejecte_amount ?? row.rejected_amount ?? 0),
        status: 1,
      };
      const res = await createCompailedClaim(payload);
      if (res?.error) {
        showSnackbar(res.data?.message || "Failed to create compiled claim", "error");
      } else {
        showSnackbar(res?.message || "Compiled claim created", "success");
        // remove the created row from results to reflect action
        setSearchResults(prev => prev.filter(r => !(r.warehouse_id === row.warehouse_id && r.item_name === row.item_name && String(r.price) === String(row.price))));
      }
    } catch (err) {
      console.error("Failed to create compiled claim", err);
      showSnackbar("Failed to create compiled claim", "error");
    } finally {
      setCreatingMap(prev => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  if ((isEditMode && loading) || !warehouseOptions) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link href="/compailedClaim">
            <Icon icon="lucide:arrow-left" width={24} />
          </Link>
          <h1 className="text-xl font-semibold text-gray-900">
            {isEditMode ? "Update Compailed Claim" : "Add Compailed Claim"}
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl shadow divide-y divide-gray-200 mb-6">
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-800 mb-4">
            Compailed Claim Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Route Code */}
           


            {/* Route Name */}
            <div className="flex flex-col">

              <InputFields
              disabled={true}
                required
                label="From Date"
                value={form.fromDate}
                type="date"
                // options={[
                //   {value:"1-15March 2025",label :"1-15March"},
                //   {value:"16-31March 2025",label :"16-31March"},
                // ]}
                onChange={(e) => handleChange("fromDate", e.target.value)}
              />
              {errors.fromDate && (
                <p className="text-red-500 text-sm mt-1">{errors.fromDate}</p>
              )}
             
            </div>
            <div className="flex flex-col">

              <InputFields
              disabled={true}
                required
                label="To Date"
                value={form.toDate}
                type="date"
                // options={[
                //   {value:"1-15March 2025",label :"1-15March"},
                //   {value:"16-31March 2025",label :"16-31March"},
                // ]}
                onChange={(e) => handleChange("toDate", e.target.value)}
              />
              {errors.toDate && (
                <p className="text-red-500 text-sm mt-1">{errors.toDate}</p>
              )}
             
            </div>

            <div className="flex flex-col">
              <AutoSuggestion
                required
                label="Distributor"
                name="warehouse"
                placeholder="Search warehouse..."
                initialValue={(() => {
                  const found = (warehouseOptions || []).find((o: { value?: string; label?: string }) => String(o.value) === String(form.warehouse));
                  return found ? found.label : "";
                })()}
                onSearch={handleWarehouseSearch}
                onSelect={(option: { value: string | number; label: string }) => {
                  const val = option?.value ?? "";
                  handleChange("warehouse", String(val));
                  handleChange("vehicleType", ""); // clear vehicle when warehouse changes
                  if (errors.warehouse) setErrors(prev => ({ ...prev, warehouse: "" }));
                }}
                onClear={() => {
                  handleChange("warehouse", "");
                  handleChange("vehicleType", "");
                }}
              />
              {errors.warehouse && (
                <p className="text-red-500 text-sm mt-1">{errors.warehouse}</p>
              )}
            </div>
            <div>
             <SidebarBtn
          label="Search"
          
          isActive={!searchLoading}
          onClick={handleSearch}
          disabled={searchLoading}
        />
        </div>
          </div>
          
        </div>
        
      </div>

          {/* Search results table */}
          {searchResults && searchResults.length > 0 && (
            <div className="bg-white rounded-2xl shadow divide-y divide-gray-200 mb-6">
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-800 mb-4">Search Results</h2>
                <Table
                  data={searchResults as unknown as TableDataType[]}
                  config={{
                    table: { height: 500 },
                    showNestedLoading: false,
                    pageSize: 50,
                    columns: [
                      {
                        key: "depot",
                        label: "Distributors",
                        render: (row: TableDataType) => (
                          <div className="text-sm text-[#181D27]">{`${row.warehouse_code || ''} - ${row.warehouse_name || ''}`}</div>
                        ),
                      },
                      {
                        key: "approved_count",
                        label: "Approved Claims (Count)",
                        render: (row: TableDataType) => <div className="text-sm">{toInternationalNumber(row.approved_count ?? 0)}</div>,
                      },
                      {
                        key: "pending_count",
                        label: "Pending Claims (Count)",
                        render: (row: TableDataType) => <div className="text-sm">{toInternationalNumber(row.pending_count ?? 0)}</div>,
                      },
                      {
                        key: "rejected_qty",
                        label: "Rejected Quantity",
                        render: (row: TableDataType) => <div className="text-sm">{toInternationalNumber(row.total_rejected_qty ?? 0)}</div>,
                      },
                      {
                        key: "total_qty",
                        label: "Total Quantity (CSE)",
                        render: (row: TableDataType) => <div className="text-sm">{toInternationalNumber(row.total_approved_qty ?? 0)}</div>,
                      },
                      {
                        key: "total_claim_amount",
                        label: "Total Claim Amount",
                        render: (row: TableDataType) => {
                          const price = parseFloat(String(row.price || 0)) || 0;
                          const qty = parseFloat(String(row.total_approved_qty || 0)) || 0;
                          const total = price * qty;
                          return <div className="text-sm">{toInternationalNumber(total ? total.toLocaleString(undefined, { maximumFractionDigits: 2 }) : "0")}</div>;
                        },
                      },
                      {
                        key: "actions",
                        label: "Actions",
                        render: (row: TableDataType) => {
                          const key = `${row.warehouse_id ?? ""}_${row.item_name ?? ""}_${row.price ?? ""}`;
                          const creating = Boolean(creatingMap[key]);
                          return (
                            <SidebarBtn
                              isActive={!creating}
                              label={creating ? "Processing..." : "Approved"}
                              onClick={() => handleCreateCompiledClaim(row)}
                              disabled={creating}
                            />
                          );
                        },
                      },
                    ],
                  }}
                />
              </div>
            </div>
          )}

    

    
    </>
  );
}
