"use client";

import ContainerCard from "@/app/components/containerCard";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
import Table, {
  configType,
  listReturnType,
  TableDataType,
} from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import InputFields from "@/app/components/inputFields";
import {
  salesmanLoadHeaderAdd,
  salesmanLoadHeaderById,
  salesmanLoadHeaderUpdate,
} from "@/app/services/agentTransaction";
import { itemList,projectList } from "@/app/services/allApi";
import { useLoading } from "@/app/services/loadingContext";
import { useSnackbar } from "@/app/services/snackbarContext";
import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import * as yup from "yup";

export default function AddEditSalesmanLoad() {
  const { salesmanTypeOptions, routeOptions, salesmanOptions, warehouseOptions, fetchSalesmanOptions, fetchRoutebySalesmanOptions } =
    useAllDropdownListData();
  const router = useRouter();
  const { showSnackbar } = useSnackbar();
  const { setLoading } = useLoading();
  const params = useParams();
  const loadUUID = params?.uuid as string | undefined;
  const isEditMode = loadUUID !== undefined && loadUUID !== "add";

  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    salesman_type: "",
    warehouse: "",
    route: "",
    salesman: "",
    project_type: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [refreshKey, setRefreshKey] = useState(0);
  const [itemData, setItemData] = useState<TableDataType[]>([]);
  const [isItemsLoaded, setIsItemsLoaded] = useState(false);

  // ✅ Load items on mount
  useEffect(() => {
    if (!isItemsLoaded) {
      (async () => {
        try {
          setLoading(true);
          const res = await itemList({ page: "1" });
          const data = res.data.map((item: any) => ({
            ...item,
            qty: "",
            available_stock: item.volume || 0, // Map volume to available_stock
          }));
          setItemData(data);
          setIsItemsLoaded(true);
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [isItemsLoaded, setLoading]);
 

  // ✅ Fetch existing data in edit mode
  useEffect(() => {
    if (isEditMode && loadUUID && isItemsLoaded) {
      setLoading(true);
      (async () => {
        try {
          const res = await salesmanLoadHeaderById(String(loadUUID), {});
          const data = res?.data ?? res;
          
          const warehouseId = data?.warehouse?.id?.toString() || "";
          const salesmanId = data?.salesman?.id?.toString() || "";
          
          setForm({
            salesman_type: data?.salesman_type || "",
            warehouse: warehouseId,
            route: data?.route?.id?.toString() || "",
            salesman: salesmanId,
            project_type: data?.projecttype?.id?.toString() || data?.project_type || "",
          });

          // Fetch salesman options based on warehouse and then fetch route options
          if (warehouseId) {
            await fetchSalesmanOptions(warehouseId);
          }
          if (salesmanId) {
            await fetchRoutebySalesmanOptions(salesmanId);
          }

          // Populate CSE values from details array using item IDs
          if (data?.details && Array.isArray(data.details)) {
            setItemData((prevItems) =>
              prevItems.map((item) => {
                const existingDetail = data.details.find(
                  (detail: any) => detail.item?.id === item.id
                );
                return existingDetail
                  ? { ...item, qty: existingDetail.qty?.toString() || "" }
                  : item;
              })
            );
          }
        } catch (err) {
          showSnackbar("Failed to fetch details", "error");
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [isEditMode, loadUUID, isItemsLoaded, setLoading, showSnackbar, fetchSalesmanOptions, fetchRoutebySalesmanOptions]);

  // ✅ Validation Schema
  const validationSchema = yup.object().shape({
    salesman_type: yup.string().required("Salesman Type is required"),
    warehouse: yup.string().required("Warehouse is required"),
    route: yup.string().required("Route is required"),
    salesman: yup.string().required("Salesman is required"),
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  // ✅ Handle Qty Change
  const handleQtyChange = (itemId: string | number, value: string) => {
    const item = itemData.find((i) => i.id === itemId);
    const availableStock = Number(item?.volume || 0);
    const enteredQty = Number(value);

    // Check if entered quantity exceeds available stock
    if (value !== "" && enteredQty > availableStock) {
      showSnackbar(`Please check the quantity. Available stock is ${availableStock}`, "error");
      return;
    }

    setItemData((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, qty: value } : item
      )
    );
  };

  // ✅ Table Columns
  const columns: configType["columns"] = [
    {
      key: "item",
      label: "Items",
      render: (row: TableDataType) => {
        const currentItem = itemData.find((item) => item.id === row.id);
        return (
          <span>
            {row.item_code && row.name
              ? `${row.item_code} - ${row.name}`
              : row.item_code
                ? row.item_code
                : row.name
                  ? row.name
                  : "-"}
          </span>
        );
      },
    },
    { key: "volume", label: "Available Stock" },
    {
      key: "cse",
      label: "CSE",
      render: (row: TableDataType) => {
        const currentItem = itemData.find((item) => item.id === row.id);
        return (
          <div className="w-[100px]">
            <InputFields
                                  type="number"
                                  value={currentItem?.qty ?? ""}
                                  onChange={(e) => handleQtyChange(row.id, e.target.value)}
                                  placeholder="Quantity"
                                />
           
          </div>
        );
      },
    },
  ];

  // ✅ Handle Submit
  const handleSubmit = async () => {
    try {
      await validationSchema.validate(form, { abortEarly: false });
      setErrors({});
      setSubmitting(true);

      const payload: any = {
        warehouse_id: Number(form.warehouse),
        route_id: Number(form.route),
        salesman_id: Number(form.salesman),
        salesman_type: String(form.salesman_type),
        details: itemData
          .filter((i) => i.qty && Number(i.qty) > 0)
          .map((i) => {
            const uomArray =
              typeof i.uom === "string" ? JSON.parse(i.uom) : i.uom;
            const secondaryUom =
              Array.isArray(uomArray) &&
              uomArray.find((u: { uom_type: string }) => u.uom_type === "secondary");

            return {
              item_id: i.id,
              uom: secondaryUom?.id || uomArray?.[0]?.id || null,
              qty: Number(i.qty),
              status: i.status ?? 1,
            };
          }),
      };

      // Only include project_type if salesman_type is "Project"
      if (form.salesman_type === "Project" && form.project_type) {
        payload.project_type = Number(form.project_type);
      }

      let res;
      if (isEditMode && loadUUID) {
        res = await salesmanLoadHeaderUpdate(loadUUID, payload);
      } else {
        res = await salesmanLoadHeaderAdd(payload);
      }

      if (res?.error) {
        showSnackbar(res.data?.message || "Failed to submit form", "error");
      } else {
        showSnackbar(
          isEditMode
            ? "Salesman Load updated successfully"
            : "Salesman Load added successfully",
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
        console.error(err);
        showSnackbar("Failed to submit form", "error");
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

      {/* Form Section */}
      <ContainerCard> <div className="p-6">
        <h2 className="text-lg font-medium text-gray-800 mb-4"> Salesman Load Details </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div> 
            <InputFields 
            required
             label="Salesman Type" 
             value={form.salesman_type} 
             options={[{ label: "Sales Executive-GT", value: "Sales Executive-GT" }, { label: "Salesman", value: "Salesman" }, { label: "Project", value: "Project" },]} 
             onChange={(e) => handleChange("salesman_type", e.target.value)} /> {errors.salesman_type && (<p className="text-red-500 text-sm mt-1"> {errors.salesman_type} </p>)} 
            </div> 
            {form.salesman_type === "Project" &&
             (<div> 
              <InputFields label="Project List" name="project_type" value={form.project_type || ""} options={salesmanTypeOptions} onChange={(e) => handleChange("project_type", e.target.value)} /> </div>)} 
              <InputFields required label="Warehouse" value={form.warehouse} options={warehouseOptions} onChange={(e) => { const val = e.target.value; handleChange("warehouse", val); handleChange("salesman", ""); if (val) fetchSalesmanOptions(val); }} />
               <InputFields required label="Salesman" value={String(form.salesman)} options={salesmanOptions} onChange={(e) => { const val = e.target.value; handleChange("salesman", val); fetchRoutebySalesmanOptions(val); }} /> <InputFields required label="Route" value={form.route} options={routeOptions} onChange={(e) => handleChange("route", e.target.value)} /> </div> </div> </ContainerCard>

      {/* Items Table */}
      <div className="mt-6">
        <Table
          data={itemData}
          refreshKey={refreshKey}
          config={{
            header: {
              title: "Items",
              searchBar: false,
              columnFilter: false,
            },
            table: {
              height: 500,
            },
            footer: { nextPrevBtn: false, pagination: false },
            columns,
            rowSelection: false,
            pageSize: 50,
          }}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4 mt-6 pr-0">
        <button
          type="button"
          className={`px-6 py-2 rounded-lg border text-gray-700 hover:bg-gray-100 ${submitting
              ? "bg-gray-100 border-gray-200 cursor-not-allowed text-gray-400"
              : "border-gray-300"
            }`}
          onClick={() => router.push("/salesmanLoad")}
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
