"use client";

import ContainerCard from "@/app/components/containerCard";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
import Table, { TableDataType } from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import InputFields from "@/app/components/inputFields";
import Logo from "@/app/components/logo";
import {
  salesmanUnloadHeaderAdd,
  salesmanUnloadHeaderById,
  salesmanUnloadHeaderUpdate,
} from "@/app/services/agentTransaction";
import { itemList } from "@/app/services/allApi";
import { useLoading } from "@/app/services/loadingContext";
import { useSnackbar } from "@/app/services/snackbarContext";
import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import * as yup from "yup";

export default function AddEditSalesmanUnload() {
  const {
    salesmanTypeOptions,
    routeOptions,
    salesmanOptions,
    warehouseOptions,
    fetchRouteOptions,
    fetchSalesmanByRouteOptions,
    projectOptions,
  } = useAllDropdownListData();

  const router = useRouter();
  const { showSnackbar } = useSnackbar();
  const { setLoading } = useLoading();
  const params = useParams();
  const unloadUUID = params?.uuid as string | undefined;
  const isEditMode = unloadUUID && unloadUUID !== "add";

  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    salesman_type: "",
    route_id: "",
    warehouse: "",
    salesman_id: "",
    project_type: "",
    unload_date: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [itemData, setItemData] = useState<TableDataType[]>([]);
  const [isItemsLoaded, setIsItemsLoaded] = useState(false);

  // ✅ Load all items
  useEffect(() => {
    if (!isItemsLoaded) {
      (async () => {
        try {
          setLoading(true);
          const res = await itemList({ page: "1" });
          const data = res.data.map((item: any) => ({
            id: item.id,
            item_code: item.item_code,
            name: item.name,
            qty: "",
            uom_id: "",
          }));
          setItemData(data);
          setIsItemsLoaded(true);
        } catch (error) {
          console.error("Item Load Error:", error);
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [isItemsLoaded, setLoading]);

  // ✅ Fetch data for edit mode
  useEffect(() => {
    if (isEditMode && unloadUUID && isItemsLoaded) {
      (async () => {
        try {
          setLoading(true);
          const res = await salesmanUnloadHeaderById(String(unloadUUID));
          const data = res?.data ?? res;

          setForm({
            salesman_type: data?.salesman_type || "",
            warehouse: data?.warehouse?.id?.toString() || "",
            route_id: data?.route?.id?.toString() || "",
            salesman_id: data?.salesman?.id?.toString() || "",
            project_type:
              data?.projecttype?.id?.toString() || data?.project_type || "",
            unload_date: data?.unload_date || "",
          });

          if (data?.details && Array.isArray(data.details)) {
            setItemData((prev) =>
              prev.map((item) => {
                const matched = data.details.find(
                  (d: any) => d.item?.id === item.id
                );
                return matched
                  ? {
                    ...item,
                    qty: matched.qty?.toString() || "",
                  }
                  : item;
              })
            );
          }
        } catch (error) {
          console.error("Fetch Error:", error);
          showSnackbar("Failed to fetch unload details", "error");
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [isEditMode, unloadUUID, isItemsLoaded, setLoading, showSnackbar]);

  // ✅ Validation Schema
  const validationSchema = yup.object().shape({
    salesman_type: yup.string().required("Salesman Type is required"),
    route_id: yup.string().required("Route is required"),
    warehouse: yup.string().required("Warehouse is required"),
    salesman_id: yup.string().required("Salesman is required"),
    unload_date: yup.string().required("Unload Date is required"),
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const recalculateItem = (index: number, field: string, value: string) => {
    const newData = [...itemData];
    newData[index][field] = value;
    setItemData(newData);
  };

  // ✅ Handle Submit (fully fixed)
  const handleSubmit = async () => {
    try {
      console.log("🟢 Submitting form with values:", form);
      console.log("🟢 Item Data:", itemData);

      await validationSchema.validate(form, { abortEarly: false });
      setErrors({});
      setSubmitting(true);

      const details = itemData
        .filter((i) => i.qty && Number(i.qty) > 0)
        .map((i) => ({
          item_id: i.id,
          qty: String(i.qty || "0"),
          status: 1,
        }));

      if (details.length === 0) {
        showSnackbar("Please enter quantity for at least one item.", "error");
        setSubmitting(false);
        return;
      }

      const payload = {
        route_id: Number(form.route_id),
        salesman_type: form.salesman_type,
        warehouse_id: Number(form.warehouse),
        project_type: form.project_type ? Number(form.project_type) : null,
        salesman_id: Number(form.salesman_id),
        unload_date: form.unload_date,
        details,
      };

      console.log("🟣 Payload ready for submission:", payload);

      const res = isEditMode
        ? await salesmanUnloadHeaderUpdate(unloadUUID, payload)
        : await salesmanUnloadHeaderAdd(payload);

      console.log("🟢 API Response:", res);

      if (res?.error) {
        showSnackbar(res.data?.message || "Failed to submit form", "error");
      } else {
        showSnackbar(
          isEditMode
            ? "Salesman Unload updated successfully"
            : "Salesman Unload added successfully",
          "success"
        );
        router.push("/salesmanUnload");
      }
    } catch (err: any) {
      console.error("🔴 Submission Error:", err);
      if (err instanceof yup.ValidationError) {
        const formErrors: Record<string, string> = {};
        err.inner.forEach((e) => {
          if (e.path) formErrors[e.path] = e.message;
        });
        setErrors(formErrors);
        showSnackbar("Please fill all required fields correctly.", "error");
      } else {
        showSnackbar("Failed to submit form. Check console.", "error");
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
          <Link href="/salesmanUnload">
            <Icon icon="lucide:arrow-left" width={24} />
          </Link>
          <h1 className="text-xl font-semibold text-gray-900">
            {isEditMode ? "Update Salesman Unload" : "Add Salesman Unload"}
          </h1>
        </div>
      </div>

      <ContainerCard className="rounded-[10px] scrollbar-none">
        {/* --- Header Section --- */}
        <div className="flex justify-between mb-10 flex-wrap gap-5">
          <div className="flex flex-col gap-2.5">
            <Logo type="full" />
          </div>
          <div className="flex flex-col">
            <span className="text-[42px] uppercase text-[#A4A7AE] mb-2.5">
              Unload
            </span>
            <span className="text-primary text-[14px] tracking-[10px]">
              #UL0201
            </span>
          </div>
        </div>

        <hr className="w-full text-[#D5D7DA]" />

        {/* --- Form Fields --- */}
        <div className="flex flex-col sm:flex-row gap-4 mt-10 mb-10 flex-wrap">
          <div className="flex flex-col w-full sm:w-[30%]">
            <InputFields
              label="Salesman Type"
              name="salesman_type"
              value={form.salesman_type}
              options={salesmanTypeOptions}
              onChange={(e) => handleChange("salesman_type", e.target.value)}
            />
            {errors.salesman_type && (
              <p className="text-red-500 text-sm">{errors.salesman_type}</p>
            )}
          </div>

          {/* Show Project List only when salesman_type id = 36 */}
          {form.salesman_type === "6" && (
            <div className="flex flex-col w-full sm:w-[30%]">
              <InputFields
                label="Project List"
                value={form.project_type}
                options={projectOptions}
                onChange={(e) => handleChange("project_type", e.target.value)}
              />
            </div>
          )}


          <div className="flex flex-col w-full sm:w-[30%]">
            <InputFields
              label="Warehouse"
              name="warehouse"
              value={form.warehouse}
              options={warehouseOptions}
              onChange={(e) => {
                const val = e.target.value;
                handleChange("warehouse", val);
                handleChange("route_id", "");
                if (val) fetchRouteOptions(val);
              }}
            />
            {errors.warehouse && (
              <p className="text-red-500 text-sm">{errors.warehouse}</p>
            )}
          </div>

          <div className="flex flex-col w-full sm:w-[30%]">
            <InputFields
              label="Route"
              name="route_id"
              value={form.route_id}
              options={routeOptions}
              onChange={(e) => {
                const val = e.target.value;
                handleChange("route_id", val);
                handleChange("salesman_id", "");
                if (val) fetchSalesmanByRouteOptions(val);
              }}
            />
            {errors.route_id && (
              <p className="text-red-500 text-sm">{errors.route_id}</p>
            )}
          </div>

          <div className="flex flex-col w-full sm:w-[30%]">
            <InputFields
              label="Salesman"
              name="salesman_id"
              value={form.salesman_id}
              options={salesmanOptions}
              onChange={(e) => handleChange("salesman_id", e.target.value)}
            />
            {errors.salesman_id && (
              <p className="text-red-500 text-sm">{errors.salesman_id}</p>
            )}
          </div>

          <div className="flex flex-col w-full sm:w-[30%]">
            <InputFields
              label="Unload Date"
              name="unload_date"
              type="date"
              value={form.unload_date}
              onChange={(e) => handleChange("unload_date", e.target.value)}
            />
            {errors.unload_date && (
              <p className="text-red-500 text-sm">{errors.unload_date}</p>
            )}
          </div>
        </div>

        {/* --- Table --- */}
        <Table
          data={itemData.map((row, idx) => ({ ...row, idx: idx.toString() }))}
          config={{
            table: { height: 500 },
            columns: [
              {
                key: "item",
                label: "Items",
                render: (row) => (
                  <span>
                    {row.item_code && row.name
                      ? `${row.item_code} - ${row.name}`
                      : row.item_code || row.name || "-"}
                  </span>
                ),
              },
              { key: "cse", label: "CSE" },
              {
                key: "qty",
                label: "Quantity",
                render: (row) => (
                  <InputFields
                    label=""
                    type="number"
                    name="qty"
                    value={row.qty || ""}
                    onChange={(e) =>
                      recalculateItem(Number(row.idx), "qty", e.target.value)
                    }
                  />
                ),
              },
              { key: "pcs", label: "PCS" },
              {
                key: "qty",
                label: "Quantity",
                render: (row) => (
                  <InputFields
                    label=""
                    type="number"
                    name="qty"
                    value={row.qty || ""}
                    onChange={(e) =>
                      recalculateItem(Number(row.idx), "qty", e.target.value)
                    }
                  />
                ),
              },
            ],
          }}
        />

        <hr className="text-[#D5D7DA]" />
        <div className="flex justify-end gap-4 mt-6">
          <button
            type="button"
            className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
            onClick={() => router.push("/salesmanUnload")}
          >
            Cancel
          </button>
          <SidebarBtn
            isActive={!submitting}
            label={isEditMode ? "Update Unload" : "Create Unload"}
            onClick={handleSubmit}
          />
        </div>
      </ContainerCard>
    </>
  );
}
