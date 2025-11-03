"use client";
import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import * as yup from "yup";
import IconButton from "@/app/components/iconButton";
import InputFields from "@/app/components/inputFields";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import SettingPopUp from "@/app/components/settingPopUp";
import { useSnackbar } from "@/app/services/snackbarContext";
import CustomTable, { TableDataType } from "@/app/components/customTable";
import {
  getRouteById,
  addRoutes,
  updateRoute,
  genearateCode,
  saveFinalCode,
  vehicleListData,
} from "@/app/services/allApi";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
import { useLoading } from "@/app/services/loadingContext";
import ContainerCard from "@/app/components/containerCard";
import { salesmanLoadHeaderAdd, salesmanLoadHeaderUpdate } from "@/app/services/agentTransaction";

export default function AddEditSalesmanLoad() {
  const { salesmanTypeOptions, warehouseOptions,salesmanOptions ,fetchRoutebySalesmanOptions,fetchSalesmanOptions,routeOptions, itemOptions} = useAllDropdownListData();
  const salesmanTypeOptionWithProject = salesmanTypeOptions.slice();
  const router = useRouter();
  const { showSnackbar } = useSnackbar();
  const { setLoading } = useLoading();
  const params = useParams();
  const loadUUID = params?.uuid as string | undefined;
  const isEditMode = loadUUID !== undefined && loadUUID !== "add";

  const [submitting, setSubmitting] = useState(false);
  const [filteredOptions, setFilteredRouteOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [form, setForm] = useState({
    salesmanType: "",
    route: "",
    warehouse: "",
    project: "",
    salesman: ""
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [skeleton, setSkeleton] = useState(false);
  
  // Table data for items
  const [tableData, setTableData] = useState<TableDataType[]>(
    itemOptions.map((item) => ({
      id: item.value,
      item: item.label,
      availableStock: "100", // Replace with actual stock data
      cse: "",
    }))
  );

  const handleCseChange = (id: string, value: string) => {
    setTableData(prev => 
      prev.map(row => 
        row.id === id ? { ...row, cse: value } : row
      )
    );
  };

  // Update table data when itemOptions loads
  useEffect(() => {
    if (itemOptions && itemOptions.length > 0) {
      setTableData(
        itemOptions.map((item) => ({
          id: item.value,
          item: item.label,
          availableStock: "100",
          cse: "",
        }))
      );
    }
  }, [itemOptions]);

  // Fetch route details in edit mode
  useEffect(() => {
    if (isEditMode && loadUUID) {
      setLoading(true);
      (async () => {
        try {
          const res = await getRouteById(String(loadUUID));
          const data = res?.data ?? res;
          setForm({
            salesmanType: data?.salesmanType || "",
            route: data?.route || "",
            warehouse: data?.warehouse || "",
            project: data?.project || "",
            salesman: data?.salesman || "",
          });
          // Fetch salesmen for the loaded warehouse
          if (data?.warehouse) {
            await fetchSalesmanOptions(String(data.warehouse));
          }
        } catch (err) {
          showSnackbar("Failed to fetch route details", "error");
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [isEditMode, loadUUID]);

  // Validation schema
  const validationSchema = yup.object().shape({
    salesmanType: yup.string().required("Salesman Type is required"),
    warehouse: yup.string().required("Warehouse is required"),
    salesman: yup.string().required("Salesman is required"),
    route: yup.string().required("Route is required"),
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  // Fetch routes based on selected salesman id
  const fetchRoutesBySalesman = async (salesman: string) => {
    if (!salesman) {
      setFilteredRouteOptions([]);
      return;
    }
    setSkeleton(true);
    try {
      const res = await fetchRoutebySalesmanOptions(String(salesman) );
      const normalize = (r: unknown): { id?: string | number; route_code?: string; route_name?: string }[] => {
        if (r && typeof r === "object") {
          const obj = r as Record<string, unknown>;
          if (Array.isArray(obj.data)) return obj.data as any[];
        }
        if (Array.isArray(r)) return r as any[];
        return [];
      };
      const routes = normalize(res);
      const options = routes.map((r) => ({ value: String(r.id ?? ""), label: r.route_code && r.route_name ? `${r.route_code} - ${r.route_name}` : (r.route_name ?? "") }));
      setFilteredRouteOptions(options);
    } catch (err) {
      setFilteredRouteOptions([]);
    } finally {
      setSkeleton(false);
    }
  };

  const handleSubmit = async () => {
    try {
      await validationSchema.validate(form, { abortEarly: false });
      setErrors({});

      // Validate CSE values against available stock
      const invalidItems = tableData.filter(row => {
        const cse = parseFloat(row.cse) || 0;
        const availableStock = parseFloat(row.availableStock) || 0;
        return cse > availableStock;
      });

      if (invalidItems.length > 0) {
        showSnackbar("Check the CSE values. CSE cannot exceed available stock.", "error");
        return;
      }

      setSubmitting(true);

      const payload = {
        salesmanType: form.salesmanType,
        route: form.route,
        warehouse: form.warehouse,
        project: form.project,
        salesman: form.salesman,
      };

      let res;
      if (isEditMode && loadUUID) {
        res = await salesmanLoadHeaderUpdate(loadUUID, form);
      } else {
        res = await salesmanLoadHeaderAdd(payload);
      }

      if (res?.error) {
        showSnackbar(res.data?.message || "Failed to submit form", "error");
      } else {
        showSnackbar(
          isEditMode ? "Route updated successfully" : "Route added successfully",
          "success"
        );
        router.push("/salesmanLoad");
      }
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        const formErrors: Record<string, string> = {};
        err.inner.forEach((e) => {
          if (e.path) formErrors[e.path] = e.message;
        });
        setErrors(formErrors);
      } else {
        showSnackbar(
          isEditMode ? "Failed to update route" : "Failed to add route",
          "error"
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link href="/salesmanLoad">
            <Icon icon="lucide:arrow-left" width={24} />
          </Link>
          <h1 className="text-xl font-semibold text-gray-900">
            {isEditMode ? "Update Salesman Load" : "Add Salesman Load"}
          </h1>
        </div>
      </div>

      {/* Content */}
      <ContainerCard>
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-800 mb-4">
            Salesman Load Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col">
              <InputFields
                required
                label="Salesman Type"
                value={form.salesmanType}
                options={salesmanTypeOptions}
                onChange={(e) => handleChange("salesmanType", e.target.value)}
              />
              {errors.salesmanType && (
                <p className="text-red-500 text-sm mt-1">{errors.salesmanType}</p>
              )}
            </div>

            { form.salesmanType !== "-1" ? <div className="flex flex-col">
              <InputFields
                required
                label="Warehouse"
                value={form.warehouse}
                onChange={(e) => {
                  const newWarehouse = e.target.value;
                  handleChange("warehouse", newWarehouse);
                  // Clear salesman and fetch salesmen for selected warehouse
                  handleChange("salesman", "");
                  if (newWarehouse) {
                    fetchSalesmanOptions(newWarehouse);
                  }
                }}
                options={warehouseOptions}
              />
              {errors.warehouse && (
                <p className="text-red-500 text-sm mt-1">{errors.warehouse}</p>
              )}
            </div> : <div className="flex flex-col">
              <InputFields
                required
                label="Warehouse"
                value={form.warehouse}
                onChange={(e) => {
                  const newWarehouse = e.target.value;
                  handleChange("warehouse", newWarehouse);
                  // Clear salesman and fetch salesmen for selected warehouse
                  handleChange("salesman", "");
                  if (newWarehouse) {
                    fetchSalesmanOptions(newWarehouse);
                  }
                }}
                options={warehouseOptions}
              />
              {errors.warehouse && (
                <p className="text-red-500 text-sm mt-1">{errors.warehouse}</p>
              )}
            </div>}
             <div className="flex flex-col">
              <InputFields
                required
                label="Salesman"
                value={form.salesman}
                options={salesmanOptions}
                onChange={(e) => {
                  const val = e.target.value;
                  handleChange("salesman", val);
                  fetchRoutesBySalesman(val);
                }}
              />
              {errors.salesman && (
                <p className="text-red-500 text-sm mt-1">{errors.salesman}</p>
              )}
            </div>

               <div className="flex flex-col">
              <InputFields
                required
                label="Route"
                value={form.route}
                options={routeOptions}
                onChange={(e) => handleChange("route", e.target.value)}
              />
              {errors.route && (
                <p className="text-red-500 text-sm mt-1">{errors.route}</p>
              )}
            </div>
            {/* Warehouse */}
            {/* <div className="flex flex-col">
              <InputFields
                required
                label="Warehouse"
                value={form.warehouse}
                options={warehouseOptions}
                onChange={(e) => {
                  const newWarehouse = e.target.value;
                  handleChange("warehouse", newWarehouse);
                  handleChange("vehicleType", ""); // clear vehicle when warehouse changes
                  fetchRoutes(newWarehouse);
                }}
              />
              {errors.warehouse && (
                <p className="text-red-500 text-sm mt-1">{errors.warehouse}</p>
              )}
            </div> */}
          </div>
        </div>
      </ContainerCard>

      {/* Additional Information */}
      <div className="mb-6">
        <CustomTable
          data={tableData}
          config={{
            header: {
              title: "Items",
            },
            columns: [
              {
                key: "item",
                label: "Item",
                showByDefault: true,
                width: 300,
              },
              {
                key: "availableStock",
                label: "Available Stock",
                showByDefault: true,
                width: 150,
              },
              {
                key: "cse",
                label: "CSE",
                showByDefault: true,
                width: 200,
                render: (row) => {
                  const cse = parseFloat(row.cse) || 0;
                  const availableStock = parseFloat(row.availableStock) || 0;
                  const isInvalid = cse > availableStock;
                  
                  return (
                    <div>
                      <input
                        type="number"
                        value={row.cse}
                        onChange={(e) => handleCseChange(row.id, e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 text-sm ${
                          isInvalid
                            ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                            : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                        }`}
                        placeholder="Enter CSE"
                      />
                      {isInvalid && (
                        <p className="text-red-500 text-xs mt-1">
                          Exceeds available stock
                        </p>
                      )}
                    </div>
                  );
                },
              },
            ],
            footer: {
              pagination: false,
              nextPrevBtn: false,
            },
          }}
        />
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-4 mt-6 pr-0">
        <button
          type="button"
          className={`px-6 py-2 rounded-lg border text-gray-700 hover:bg-gray-100 ${
            submitting
              ? "bg-gray-100 border-gray-200 cursor-not-allowed text-gray-400"
              : "border-gray-300"
          }`}
          onClick={() => router.push("/route")}
          disabled={submitting} 
        >
          Cancel
        </button>
        <SidebarBtn
          label={
            submitting
              ? isEditMode
                ? "Updating..."
                : "Submitting..."
              : isEditMode
              ? "Update"
              : "Submit"
          }
          isActive={!submitting}
          leadingIcon="mdi:check"
          onClick={handleSubmit}
          disabled={submitting}
        />
      </div>
    </>
  );
}
