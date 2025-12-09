"use client";

import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import InputFields from "@/app/components/inputFields";
import Loading from "@/app/components/Loading";
import {
  addAllocate,
  getBtrByRegion,
  getWarehouseChillers,
} from "@/app/services/assetsApi";
import { useSnackbar } from "@/app/services/snackbarContext";
import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import * as yup from "yup";
import Table, { listReturnType, TableDataType } from "@/app/components/customTable";

export default function AddRoute() {
  const { regionOptions, warehouseAllOptions } = useAllDropdownListData();
  const router = useRouter();
  const { showSnackbar } = useSnackbar();

  const [loadingBtr, setLoadingBtr] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const [btrOptions, setBtrOptions] = useState<
    { value: string; label: string }[]
  >([]);

  const [form, setForm] = useState({
    region_id: "",
    btr: "",
    warehouse_id: "",
    truck_no: "",
    turnmen_name: "",
    contact: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [warehouseName, setWarehouseName] = useState("");

  // ✅ VALIDATION
  const validationSchema = yup.object().shape({
    region_id: yup.string().required("Region is required"),
    btr: yup.string().required("BTR is required"),
    warehouse_id: yup.string().required("Warehouse is required"),
    truck_no: yup.string().required("Truck Number is required"),
    turnmen_name: yup.string().required("Turnmen Name is required"),
    contact: yup
      .string()
      .required("Contact is required")
      .matches(/^[0-9]{10}$/, "Contact must be 10 digits"),
  });

  // ✅ HANDLE CHANGE
  const handleChange = (field: string, value: string) => {
    const safeValue = value || "";
    console.log(safeValue)
    setForm((prev) => ({ ...prev, [field]: safeValue }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }

    if (field === "region_id") {
      setForm((prev) => ({ ...prev, btr: "", warehouse_id: "" }));
      setWarehouseName("");
      setBtrOptions([]);
    }

    if (field === "btr" && safeValue) {
      fetchWarehouseFromApi(safeValue);
      setRefreshKey((prev) => prev + 1);
    }
  };

  // ✅ FETCH WAREHOUSE
  const fetchWarehouseFromApi = async (btrId: string) => {
    if (!btrId) return;

    try {
      // console.log("🔍 Fetching warehouse for BTR ID:", btrId);
      const res = await getWarehouseChillers(btrId);

      // console.log("🔍 Full API Response:", res);
      // console.log("🔍 Response Data:", res?.data);

      // ✅ Access the nested data object
      const responseData = res?.data;
      // console.log("🔍 Nested Data Object:", responseData);
      // console.log("🔍 Nested Data Keys:", responseData ? Object.keys(responseData) : "No data");

      // Check if warehouse exists in the nested data
      if (responseData && responseData.warehouse) {
        const warehouse = responseData.warehouse;
        // console.log("🔍 Warehouse Object:", warehouse);
        // console.log("🔍 Warehouse Keys:", Object.keys(warehouse));

        const wName = warehouse.name || "Unknown Warehouse";
        const wId = warehouse.id || "";

        // console.log("🔍 Warehouse Name:", wName);
        // console.log("🔍 Warehouse ID:", wId);

        setWarehouseName(wName);
        setForm((prev) => ({
          ...prev,
          warehouse_id: String(wId),
        }));

      } else {
        // console.log("❌ No warehouse in response - setting 'No Warehouse Found'");
        setWarehouseName("No Warehouse Found");
        setForm((prev) => ({ ...prev, warehouse_id: "" }));
      }
    } catch (e) {
      // console.error("❌ Error fetching warehouse:", e);
      setWarehouseName("Error fetching warehouse");
    }
  };

  // ✅ FETCH BTR BY REGION
  const fetchBtrData = async (value: string) => {
    if (!value) {
      setBtrOptions([]);
      return;
    }

    try {
      setLoadingBtr(true);
      const response = await getBtrByRegion({ region_id: value });

      const btrData = response?.data?.data || response?.data || [];

      const options = btrData.map((item: any) => ({
        value: String(item.id), // ✅ ID USED ✅
        label: item.osa_code || item.btr_name || "Unknown BTR",
      }));

      setBtrOptions(options);
    } catch {
      setBtrOptions([]);
      showSnackbar("Failed to fetch BTR data", "error");
    } finally {
      setLoadingBtr(false);
    }
  };

  // ✅ SUBMIT
  const handleSubmit = async () => {
    try {
      await validationSchema.validate(form, { abortEarly: false });
      setErrors({});

      const payload = {
        region_id: form.region_id,
        id: Number(form.btr), // ✅ BTR ID FIXED
        warehouse_id: form.warehouse_id,
        truck_no: form.truck_no,
        turnmen_name: form.turnmen_name,
        contact: form.contact,
      };

      await addAllocate(payload);

      showSnackbar("Bulk Transfer added successfully", "success");
      router.push("/chillerInstallation/bulkTransfer");
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        const formErrors: Record<string, string> = {};
        err.inner.forEach((e) => {
          if (e.path) formErrors[e.path] = e.message;
        });
        setErrors(formErrors);
        showSnackbar("Please fix the form errors", "warning");
      } else {
        showSnackbar("Failed to add bulk transfer", "error");
      }
    }
  };

  // ✅ FETCH CHILLERS (URL + HEADER FIXED)
  const fetchChillers = useCallback(async (): Promise<listReturnType> => {
    const btrId = form.btr?.trim();
    console.log(btrId)
    if (!btrId) {
      return { data: [], currentPage: 0, pageSize: 0, total: 0 };
    }

    try {
      const res = await getWarehouseChillers(btrId);
      console.log(res)
      return {

        data: res?.data?.chillers || [],
        currentPage: 1,
        pageSize: res?.data?.chillers?.length || 0,
        total: res?.data?.chillers?.length || 0,
      };
    } catch {
      showSnackbar("Error fetching chillers", "error");
      return { data: [], currentPage: 0, pageSize: 0, total: 0 };
    }
  }, [form.btr, showSnackbar]);

  // ✅ SEARCH CHILLERS
  const searchChiller = useCallback(
    async (query: string, _pageSize?: number, columnName?: string): Promise<listReturnType> => {
      if (!form.btr) {
        return { data: [], currentPage: 0, pageSize: 0, total: 0 };
      }

      try {
        const res = await getWarehouseChillers(
          form.btr,
          columnName ? { [columnName]: query } : {}
        );

        return {
          data: res?.data || [],
          currentPage: 1,
          pageSize: res?.data?.length || 0,
          total: res?.data?.length || 0,
        };
      } catch {
        showSnackbar("Error searching chillers", "error");
        return { data: [], currentPage: 0, pageSize: 0, total: 0 };
      }
    },
    [form.btr, showSnackbar]
  );

  if (!warehouseAllOptions || !regionOptions) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/chillerInstallation/bulkTransfer">
          <Icon icon="lucide:arrow-left" width={24} />
        </Link>
        <h1 className="text-xl font-semibold">Add Bulk Transfer</h1>
      </div>

      <div className="bg-white rounded-2xl shadow mb-6 p-6 grid md:grid-cols-3 gap-4">
        <InputFields
          required
          label="Region"
          value={form.region_id}
          options={regionOptions}
          onChange={(e) => {
            const val = e?.target?.value || "";
            handleChange("region_id", val);
            fetchBtrData(val);
          }}
        />

        <InputFields
          required
          label="BTR"
          value={form.btr}
          options={btrOptions}
          disabled={!form.region_id || loadingBtr}
          onChange={(e) => handleChange("btr", e?.target?.value || "")}
        />

        <InputFields required label="Distributor" value={warehouseName} disabled onChange={(e) => handleChange("warehouse_id", e?.target?.value || "")} />
        <InputFields required label="Truck Number" value={form.truck_no} onChange={(e) => handleChange("truck_no", e.target.value)} />
        <InputFields required label="Turnmen Name" value={form.turnmen_name} onChange={(e) => handleChange("turnmen_name", e.target.value)} />
        <InputFields required label="Contact" value={form.contact} onChange={(e) => handleChange("contact", e.target.value)} />
      </div>

      {form.btr && (
        <Table
          key={`table-${form.btr}-${refreshKey}`}
          refreshKey={refreshKey}
          config={{
            api: { list: fetchChillers, search: searchChiller },
            footer: { pagination: false },
            rowSelection: true,
            pageSize: 9999,
            columns: [
              { key: "osa_code", label: "Chiller Code" },
              { key: "serial_number", label: "Serial Number" },
              { key: "model_number", label: "Model Number" },
              { key: "name", label: "Name" },
              { key: "code", label: "Code" },

              {
                key: "assetsCategory", label: "Assets Category",
                render: (row: TableDataType) =>
                  typeof row.assetsCategory === "object" &&
                    row.assetsCategory !== null &&
                    "name" in row.assetsCategory
                    ? (row.assetsCategory as { name?: string }).name || "-"
                    : "-",

              },
              {
                key: "brand", label: "Brand",

                render: (row: TableDataType) =>
                  typeof row.brand === "object" &&
                    row.brand !== null &&
                    "name" in row.brand
                    ? (row.brand as { name?: string }).name || "-"
                    : "-",
              },
            ],
          }}
        />
      )}

      <div className="flex justify-end gap-4 mt-6">
        <button
          onClick={() => router.push("/chillerInstallation/bulkTransfer")}
          className="px-6 py-2 border rounded-lg"
        >
          Cancel
        </button>

        <SidebarBtn label="Submit" isActive onClick={handleSubmit} />
      </div>
    </>
  );
}
