"use client";

import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import InputFields from "@/app/components/inputFields";
import Loading from "@/app/components/Loading";
import {
    getTechicianList,
    getIROTable,
    getIROList,
    addInstallationReport,
    getBtrByRegion,
    getWarehouseChillers,
} from "@/app/services/assetsApi";
import { useSnackbar } from "@/app/services/snackbarContext";
import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState, useEffect, useRef } from "react";
import * as yup from "yup";
import Table, { listReturnType, TableDataType } from "@/app/components/customTable";

export default function AddInstallationReportPage() {
    const { regionOptions } = useAllDropdownListData();
    const router = useRouter();
    const { showSnackbar } = useSnackbar();

    const [loadingBtr, setLoadingBtr] = useState(false);
    const [loadingIRO, setLoadingIRO] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const [selectedRows, setSelectedRows] = useState<any[]>([]);
    const [allChillers, setAllChillers] = useState<any[]>([]);
    const selectionCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const [iroOptions, setIroOptions] = useState<
        { value: string; label: string }[]
    >([]);

    const [technicianOptions, setTechnicianOptions] = useState<
        { value: string; label: string }[]
    >([]);

    const [form, setForm] = useState({
        iro_id: "",
        salesman_id: "",
        schedule_date: "",
        warehouse_id: "",
        status: "1",
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [warehouseName, setWarehouseName] = useState("");

    // ✅ FETCH IRO LIST ON MOUNT
    useEffect(() => {
        (async () => {
            try {
                setLoadingIRO(true);
                const res = await getIROList();
                const data = Array.isArray(res) ? res : res?.data || [];

                const options = data.map((item: any) => ({
                    value: String(item.id),
                    label: `${item.code} (${item.count} customer${item.count !== 1 ? 's' : ''})`,
                }));

                setIroOptions(options);
            } catch (error) {
                console.error("Failed to fetch IRO list:", error);
                showSnackbar("Failed to fetch IRO list", "error");
            } finally {
                setLoadingIRO(false);
            }
        })();
    }, [showSnackbar]);

    // 🔧 AGGRESSIVE DOM MONITORING - Check every 300ms
    useEffect(() => {
        if (!form.warehouse_id || allChillers.length === 0) {
            if (selectionCheckIntervalRef.current) {
                clearInterval(selectionCheckIntervalRef.current);
                selectionCheckIntervalRef.current = null;
            }
            return;
        }

        const extractSelectionsFromDOM = () => {
            try {
                // Find the table container
                const tableContainer = document.querySelector('[data-table-container]');
                if (!tableContainer) return;

                // Find all checked checkboxes in the table (excluding header "select all")
                const allCheckboxes = tableContainer.querySelectorAll('input[type="checkbox"]');
                const checkedCheckboxes: HTMLInputElement[] = [];

                allCheckboxes.forEach((checkbox) => {
                    const input = checkbox as HTMLInputElement;
                    if (input.checked) {
                        // Try to identify if this is NOT the header checkbox
                        const isInHeader = input.closest('thead') !== null;
                        if (!isInHeader) {
                            checkedCheckboxes.push(input);
                        }
                    }
                });

                console.log("🔍 DOM Check:", {
                    totalCheckboxes: allCheckboxes.length,
                    checkedCheckboxes: checkedCheckboxes.length,
                    currentState: selectedRows.length,
                    allChillers: allChillers.length
                });

                // If we found checked checkboxes, extract the data
                if (checkedCheckboxes.length > 0) {
                    const selected: any[] = [];

                    checkedCheckboxes.forEach((checkbox) => {
                        // Try multiple methods to find the row data
                        const row = checkbox.closest('tr');
                        if (!row) return;

                        // Method 1: Check for data-row-index attribute
                        const rowIndexAttr = row.getAttribute('data-row-index');
                        if (rowIndexAttr !== null) {
                            const index = parseInt(rowIndexAttr);
                            if (!isNaN(index) && allChillers[index]) {
                                selected.push(allChillers[index]);
                                return;
                            }
                        }

                        // Method 2: Find row index by position
                        const tbody = row.closest('tbody');
                        if (tbody) {
                            const rows = Array.from(tbody.querySelectorAll('tr'));
                            const rowIndex = rows.indexOf(row);
                            if (rowIndex >= 0 && allChillers[rowIndex]) {
                                selected.push(allChillers[rowIndex]);
                                return;
                            }
                        }

                        // Method 3: Try to extract serial number from the row
                        const cells = row.querySelectorAll('td');
                        if (cells.length > 0) {
                            const firstCellText = cells[0]?.textContent?.trim();
                            if (firstCellText) {
                                const matchingChiller = allChillers.find(
                                    (chiller) => chiller.serial_number === firstCellText
                                );
                                if (matchingChiller) {
                                    selected.push(matchingChiller);
                                }
                            }
                        }
                    });

                    // Remove duplicates based on ID
                    const uniqueSelected = Array.from(
                        new Map(selected.map(item => [item.id, item])).values()
                    );

                    // Only update if different
                    if (uniqueSelected.length !== selectedRows.length ||
                        !uniqueSelected.every(item => selectedRows.some(s => s.id === item.id))) {
                        // console.log("✅ Updating selection from DOM:", uniqueSelected);
                        setSelectedRows(uniqueSelected);
                    }
                } else if (selectedRows.length > 0) {
                    // No checkboxes checked but we have selections - clear them
                    // console.log("❌ Clearing selections - no checkboxes checked");
                    setSelectedRows([]);
                }
            } catch (error) {
                // console.error("Error extracting selections:", error);
            }
        };

        // Run immediately
        extractSelectionsFromDOM();

        // Set up interval to check every 300ms
        selectionCheckIntervalRef.current = setInterval(extractSelectionsFromDOM, 300);

        // Also listen to events
        const tableContainer = document.querySelector('[data-table-container]');
        if (tableContainer) {
            tableContainer.addEventListener('change', extractSelectionsFromDOM);
            tableContainer.addEventListener('click', extractSelectionsFromDOM);
        }

        return () => {
            if (selectionCheckIntervalRef.current) {
                clearInterval(selectionCheckIntervalRef.current);
                selectionCheckIntervalRef.current = null;
            }
            if (tableContainer) {
                tableContainer.removeEventListener('change', extractSelectionsFromDOM);
                tableContainer.removeEventListener('click', extractSelectionsFromDOM);
            }
        };
    }, [form.warehouse_id, allChillers, selectedRows.length]);

    // ✅ VALIDATION
    const validationSchema = yup.object().shape({
        iro_id: yup.string().required("IRO is required"),
        salesman_id: yup.string().required("Salesman is required"),
        schedule_date: yup.string().required("Schedule Date is required"),
        warehouse_id: yup.string().required("Warehouse is required"),
        status: yup.string().required("Status is required"),
    });

    // ✅ HANDLE CHANGE
    const handleChange = (field: string, value: string) => {
        const safeValue = value || "";
        setForm((prev) => ({ ...prev, [field]: safeValue }));

        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }

        if (field === "iro_id") {
            setForm((prev) => ({ ...prev, salesman_id: "", warehouse_id: "" }));
            setWarehouseName("");
            setTechnicianOptions([]);
            setSelectedRows([]);
            setAllChillers([]);

            // Fetch distributor when IRO is selected
            if (safeValue) {
                fetchDistributorByIRO(safeValue);
                fetchTechnicianList(safeValue);
            }
        }

        if (field === "salesman_id" && safeValue) {
            setRefreshKey((prev) => prev + 1);
        }
    };

    // ✅ FETCH DISTRIBUTOR BY IRO
    const fetchDistributorByIRO = async (iroId: string) => {
        if (!iroId) return;

        try {
            const res = await getIROList({ iro_id: iroId });
            // console.log("🔍 IRO Response:", res);

            const rawData = Array.isArray(res) ? res[0] : res?.data?.[0] || res?.data || res;
            const warehouse = rawData?.warehouse || rawData;

            if (warehouse && warehouse.id) {
                const warehouseDisplay = `${warehouse.code || ''} - ${warehouse.name || ''}`;
                setWarehouseName(warehouseDisplay);
                setForm((prev) => ({
                    ...prev,
                    warehouse_id: String(warehouse.id),
                }));
            } else {
                setWarehouseName("No Distributor Found");
                setForm((prev) => ({ ...prev, warehouse_id: "" }));
            }
        } catch (e) {
            // console.error("❌ Error fetching distributor:", e);
            setWarehouseName("Error fetching distributor");
        }
    };

    // ✅ FETCH TECHNICIAN LIST BY IRO
    const fetchTechnicianList = async (iroId: string) => {
        if (!iroId) {
            setTechnicianOptions([]);
            return;
        }

        try {
            setLoadingBtr(true);
            const response = await getTechicianList({ iro_id: iroId });
            const techData = response?.data?.data || response?.data || [];

            const options = techData.map((item: any) => ({
                value: String(item.id),
                label: `${item.osa_code}- ${item.name}`,
            }));

            setTechnicianOptions(options);
        } catch {
            setTechnicianOptions([]);
            showSnackbar("Failed to fetch technician data", "error");
        } finally {
            setLoadingBtr(false);
        }
    };

    // ✅ SUBMIT
    const handleSubmit = async () => {
        try {
            await validationSchema.validate(form, { abortEarly: false });

            if (selectedRows.length === 0) {
                showSnackbar("Please select at least one chiller from the table below", "warning");
                const tableElement = document.querySelector('[data-table-container]');
                if (tableElement) {
                    tableElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                return;
            }

            setErrors({});

            const payload = {
                iro_id: Number(form.iro_id),
                salesman_id: Number(form.salesman_id),
                schedule_date: form.schedule_date,
                warehouse_id: Number(form.warehouse_id),
                status: Number(form.status),
                details: selectedRows.map((row) => ({
                    fridge_id: row.id,
                })),
            };

            // console.log("📤 Submitting payload:", payload);

            await addInstallationReport(payload);

            showSnackbar("Installation Report added successfully", "success");
            router.push("/chillerInstallation/installationReport");
        } catch (err) {
            if (err instanceof yup.ValidationError) {
                const formErrors: Record<string, string> = {};
                err.inner.forEach((e) => {
                    if (e.path) formErrors[e.path] = e.message;
                });
                setErrors(formErrors);
                showSnackbar("Please fix the form errors", "warning");
            } else {
                console.error("❌ Submission error:", err);
                showSnackbar("Failed to add installation report", "error");
            }
        }
    };

    // ✅ FETCH CHILLERS
    const fetchChillers = useCallback(async (): Promise<listReturnType> => {
        const warehouseId = form.warehouse_id?.trim();

        if (!warehouseId) {
            return { data: [], currentPage: 0, pageSize: 0, total: 0 };
        }

        try {
            // console.log("🔍 Fetching chillers for Warehouse ID:", warehouseId, "IRO ID:", form.iro_id);
            const res = await getIROTable(form.iro_id, warehouseId);
            // console.log("✅ IRO Table Response:", res);
            const data = Array.isArray(res) ? res : res?.data || [];

            setAllChillers(data);
            // console.log("📦 Stored chillers:", data);

            return {
                data: data,
                currentPage: 1,
                pageSize: data.length || 0,
                total: data.length || 0,
            };
        } catch (error) {
            // console.error("❌ Error fetching chillers:", error);
            showSnackbar("Error fetching chillers", "error");
            return { data: [], currentPage: 0, pageSize: 0, total: 0 };
        }
    }, [form.warehouse_id, form.iro_id, showSnackbar]);

    // ✅ SEARCH CHILLERS
    const searchChiller = useCallback(
        async (query: string, _pageSize?: number, columnName?: string): Promise<listReturnType> => {
            if (!form.warehouse_id) {
                return { data: [], currentPage: 0, pageSize: 0, total: 0 };
            }

            try {
                const res = await getIROTable(
                    form.iro_id,
                    form.warehouse_id,
                    columnName ? { [columnName]: query } : {}
                );
                const data = Array.isArray(res) ? res : res?.data || [];

                return {
                    data: data,
                    currentPage: 1,
                    pageSize: data.length || 0,
                    total: data.length || 0,
                };
            } catch {
                showSnackbar("Error searching chillers", "error");
                return { data: [], currentPage: 0, pageSize: 0, total: 0 };
            }
        },
        [form.warehouse_id, form.iro_id, showSnackbar]
    );

    // 🔧 HANDLE ROW SELECTION CALLBACK
    const handleRowSelection = useCallback((data: TableDataType[], selectedRowIndices?: number[]) => {
        // console.log("🎯 rowSelectionOnClick CALLBACK triggered:", {
        //     dataLength: data?.length,
        //     selectedIndices: selectedRowIndices,
        //     timestamp: new Date().toISOString()
        // });

        if (selectedRowIndices && selectedRowIndices.length > 0 && data) {
            const selected = selectedRowIndices
                .map((index) => data[index])
                .filter(Boolean);

            // console.log("✅ Selected rows via CALLBACK:", selected);
            setSelectedRows(selected);
        } else {
            // console.log("❌ No rows selected via CALLBACK");
            setSelectedRows([]);
        }
    }, []);

    if (loadingIRO) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <Loading />
            </div>
        );
    }

    return (
        <>
            <div className="flex items-center gap-4 mb-6">
                <Link href="/chillerInstallation/installationReport">
                    <Icon icon="lucide:arrow-left" width={24} />
                </Link>
                <h1 className="text-xl font-semibold">Add Installation Report</h1>
            </div>

            <div className="bg-white rounded-2xl shadow mb-6 p-6 grid md:grid-cols-3 gap-4">
                <InputFields
                    required
                    label="Select IRO"
                    value={form.iro_id}
                    options={iroOptions}
                    disabled={loadingIRO}
                    onChange={(e) => {
                        const val = e?.target?.value || "";
                        handleChange("iro_id", val);
                    }}
                    error={errors.iro_id}
                />

                <InputFields
                    required
                    label="Distributor"
                    value={warehouseName}
                    disabled
                    onChange={() => { }}
                />

                <InputFields
                    required
                    label="Select Technician"
                    value={form.salesman_id}
                    options={technicianOptions}
                    disabled={!form.iro_id || loadingBtr}
                    onChange={(e) => handleChange("salesman_id", e?.target?.value || "")}
                    error={errors.salesman_id}
                />

                <InputFields
                    required
                    label="Schedule Date"
                    type="date"
                    value={form.schedule_date}
                    onChange={(e) => handleChange("schedule_date", e.target.value)}
                    error={errors.schedule_date}
                />

                <InputFields
                    required
                    label="Status"
                    type="radio"
                    value={form.status}
                    onChange={(e) => handleChange("status", e.target.value)}
                    options={[
                        { value: "1", label: "Active" },
                        { value: "0", label: "Inactive" },
                    ]}
                />
            </div>

            {form.warehouse_id && (
                <div className="mb-4" data-table-container>
                    <div className={`border rounded-lg p-4 mb-4 ${selectedRows.length > 0 ? 'bg-green-50 border-green-300' : 'bg-orange-50 border-orange-300'}`}>
                        <p className="text-sm font-medium">
                            Selected Chillers: <span className={`font-bold text-lg ${selectedRows.length > 0 ? 'text-green-600' : 'text-orange-600'}`}>
                                {selectedRows.length}
                            </span>
                            {allChillers.length > 0 && (
                                <span className="text-gray-600 ml-2">
                                    of {allChillers.length} available
                                </span>
                            )}
                        </p>
                        {selectedRows.length > 0 ? (
                            <div className="text-xs text-gray-600 mt-2">
                                <span className="font-medium">Selected:</span> {selectedRows.map(r => r.serial_number || r.id).join(', ')}
                            </div>
                        ) : (
                            <p className="text-sm text-orange-600 mt-2 flex items-center gap-2">
                                <Icon icon="lucide:alert-circle" width={16} />
                                Please check the boxes next to the chillers you want to install
                            </p>
                        )}
                    </div>

                    <Table
                        key={`table-${form.iro_id}-${refreshKey}`}
                        refreshKey={refreshKey}
                        config={{
                            api: { list: fetchChillers, search: searchChiller },
                            footer: { pagination: false },
                            rowSelection: true,
                            pageSize: 9999,
                            floatingInfoBar: {
                                showByDefault: false,
                                showSelectedRow: false,
                                rowSelectionOnClick: handleRowSelection,
                            },
                            columns: [
                                { key: "serial_number", label: "Serial Number" },
                                {
                                    key: "model_number",
                                    label: "Model",
                                    render: (row: TableDataType) =>
                                        typeof row.model_number === "object" && row.model_number !== null && "name" in row.model_number
                                            ? `${(row.model_number as any).name} - ${(row.model_number as any).code}`
                                            : "-"
                                },
                                {
                                    key: "assets_category",
                                    label: "Category",
                                    render: (row: TableDataType) =>
                                        typeof row.assets_category === "object" && row.assets_category !== null && "name" in row.assets_category
                                            ? `${(row.assets_category as any).name}- ${(row.assets_category as any).osa_code}`
                                            : "-"
                                },
                                {
                                    key: "brand",
                                    label: "Brand",
                                    render: (row: TableDataType) =>
                                        typeof row.brand === "object" && row.brand !== null && "name" in row.brand
                                            ? `${(row.brand as any).name} - ${(row.brand as any).osa_code}`
                                            : "-"
                                },
                            ],
                        }}
                    />
                </div>
            )}

            <div className="flex justify-end gap-4 mt-6">
                <button
                    onClick={() => router.push("/chillerInstallation/installationReport")}
                    className="px-6 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                    Cancel
                </button>

                <SidebarBtn
                    label="Submit"
                    isActive
                    onClick={handleSubmit}
                />
            </div>
        </>
    );
}