"use client";

import ContainerCard from "@/app/components/containerCard";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
import Table, {
  TableDataType
} from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import InputFields from "@/app/components/inputFields";
import Logo from "@/app/components/logo";
import {
  salesmanLoadHeaderAdd,
  salesmanLoadHeaderById,
  salesmanLoadHeaderUpdate,
} from "@/app/services/agentTransaction";
import { genearateCode, itemList, getWarehouseStockDetails, warehouseStockTopOrders } from "@/app/services/allApi";
import { useLoading } from "@/app/services/loadingContext";
import { useSnackbar } from "@/app/services/snackbarContext";
import { Icon } from "@iconify-icon/react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import * as yup from "yup";

export default function AddEditSalesmanLoad() {
  const {
    salesmanTypeOptions,
    routeOptions,
    salesmanOptions,
    warehouseOptions,
    fetchRouteOptions,
    fetchSalesmanByRouteOptions,
    projectOptions,
    ensureProjectLoaded, ensureRouteLoaded, ensureSalesmanLoaded, ensureSalesmanTypeLoaded, ensureWarehouseLoaded } = useAllDropdownListData();

  // Load dropdown data
  useEffect(() => {
    ensureProjectLoaded();
    ensureRouteLoaded();
    ensureSalesmanLoaded();
    ensureSalesmanTypeLoaded();
    ensureWarehouseLoaded();
  }, [ensureProjectLoaded, ensureRouteLoaded, ensureSalesmanLoaded, ensureSalesmanTypeLoaded, ensureWarehouseLoaded]);
  console.log(useAllDropdownListData())
  const router = useRouter();
  const { showSnackbar } = useSnackbar();
  const { setLoading } = useLoading();
  const params = useParams();
  const loadUUID = params?.uuid as string | undefined;
  const isEditMode = loadUUID !== undefined && loadUUID !== "add";

  interface FormData {
    id: number,
    erp_code: string,
    item_code: string,
    name: string,
    description: string,
    uom: {
      id: number,
      item_id: number,
      uom_type: string,
      name: string,
      price: string,
      is_stock_keeping: boolean,
      upc: string,
      enable_for: string
    }[],
    brand: string,
    image: string,
    category: {
      id: number,
      name: string,
      code: string
    },
    itemSubCategory: {
      id: number,
      name: string,
      code: string
    },
    warehouse_stocks: {
      id: number,
      qty: number,
    }[],
    shelf_life: string,
    commodity_goods_code: string,
    excise_duty_code: string,
    status: number,
    is_taxable: boolean,
    has_excies: boolean,
    item_weight: string,
    volume: number
  }


  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    salesman_type: "",
    warehouse: "",
    warehouse_id: "",
    route: "",
    salesman: "",
    project_type: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [refreshKey, setRefreshKey] = useState(0);
  const [itemData, setItemData] = useState<TableDataType[]>([]);
  const [isItemsLoaded, setIsItemsLoaded] = useState(false);
  const [itemOptions, setItemsOptions] = useState();
  const [orderData, setOrderData] = useState<FormData[]>([]);
  const [skeleton, setSkeleton] = useState({
    route: false,
    salesman: false,
    item: false
  });
  const codeGeneratedRef = useRef(false);

  // ✅ Load items based on selected warehouse
  useEffect(() => {
    if (form.warehouse) {
      (async () => {
        try {
          setLoading(true);

          // Fetch warehouse stock details
          const stockRes = await warehouseStockTopOrders(form.warehouse);
          const stocksArray = stockRes.data?.stocks || stockRes.stocks || [];

          // Fetch full item details to get proper UOM IDs
          const itemsRes = await itemList({ allData: "true", warehouse_id: form.warehouse });
          const fullItems = itemsRes.data || [];

          // Merge stock data with full item data
          const data = stocksArray
            .map((stockItem: any) => {
              // Find the full item details
              const fullItem = fullItems.find((item: any) => item.id === stockItem.item_id);

              if (!fullItem) {
                console.warn(`Item ${stockItem.item_id} not found in full items list`);
                return null;
              }

              const stockUoms = Array.isArray(stockItem.uoms) ? stockItem.uoms : [];
              const fallbackUoms = Array.isArray(fullItem.item_uoms) ? fullItem.item_uoms : [];
              const sourceUoms = stockUoms.length ? stockUoms : fallbackUoms;

              const normalizedUoms = sourceUoms.map((u: any) => ({
                ...u,
                name: u.name ?? u.uom_name ?? u.uom?.name ?? "",
                uom_type: u.uom_type ?? u.type ?? u.uom?.uom_type ?? "",
                uom_id: u.uom_id ?? u.uom?.id ?? u.id, // ensure uom_id exists for payload
              }));

              return {
                id: stockItem.item_id,
                item_code: stockItem.item_code,
                name: stockItem.item_name,
                cse_qty: "",
                pcs_qty: "",
                status: 1,
                uom: normalizedUoms,
                warehouse_stocks: [{
                  warehouse_id: Number(form.warehouse),
                  qty: Number(stockItem.stock_qty) || 0
                }],
              };
            })
            .filter((item: any) => {
              if (!item) return false;
              // Only show items with stock > 0
              const warehouseStock = item.warehouse_stocks.find(
                (stock: any) => stock.warehouse_id?.toString() === form.warehouse
              );
              return warehouseStock && warehouseStock.qty > 0;
            });
          setItemData(data);
          setIsItemsLoaded(true);
        } catch (error) {
          // console.error("❌ Error fetching warehouse stock:", error);
          showSnackbar("Failed to fetch items for the selected warehouse", "error");
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [form.warehouse, setLoading, showSnackbar]);



  const recalculateItem = (index: number, field: string, value: string) => {
    const updated = [...itemData];
    updated[index][field] = value;
    setItemData(updated);
  };



  const fetchItem = async (searchTerm: string) => {
    const res = await itemList({ allData: "true" });
    if (res.error) {
      showSnackbar(res.data?.message || "Failed to fetch items", "error");

      return;
    }
    const data = res?.data || [];
    setOrderData(data);
    const options = data.map((item: { id: number; name: string; item_code: string; }) => ({
      value: String(item.id),
      label: `${item.item_code} - ${item.name}`
    }));
    setItemsOptions(options);

  };

  useEffect(() => {
    fetchItem("");
  }, []);

  const [code, setCode] = useState("");
  useEffect(() => {
    setSkeleton({ ...skeleton, item: true });
    fetchItem("");

    // generate code
    if (!codeGeneratedRef.current) {
      codeGeneratedRef.current = true;
      (async () => {
        const res = await genearateCode({
          model_name: "salesman_load",
        });
        if (res?.code) {
          setCode(res.code);
        }
        setLoading(false);
      })();
    }
  }, []);

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
            warehouse: data?.warehouse?.id?.toString() || "",
            warehouse_id: data?.warehouse_id?.id?.toString() || "",
            route: data?.route?.id?.toString() || "",
            salesman: data?.salesman?.id?.toString(),
            project_type:
              data?.projecttype?.id?.toString() || data?.project_type || "",
          });

          // Populate CSE / PCS values from details array using item IDs and UOM
          if (data?.details && Array.isArray(data.details)) {
            setItemData((prevItems) =>
              prevItems.map((item) => {
                const existingDetail = data.details.find(
                  (detail: any) => detail.item?.id === item.id
                );
                if (!existingDetail) return item;

                const uomName = existingDetail.uom?.name?.toUpperCase?.() || existingDetail.uom_type?.toUpperCase?.() || "";
                const uomType = existingDetail.uom?.uom_type?.toUpperCase?.() || existingDetail.uom_type?.toUpperCase?.() || "";
                const isPcs = uomName.includes("PAC") || uomName.includes("PCS") || uomType.includes("SECONDARY");
                return {
                  ...item,
                  cse_qty: isPcs ? item.cse_qty ?? "" : existingDetail.qty?.toString() || "",
                  pcs_qty: isPcs ? existingDetail.qty?.toString() || "" : item.pcs_qty ?? "",
                };
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
  }, [isEditMode, loadUUID, isItemsLoaded, setLoading, showSnackbar]);

  // ✅ Validation Schema
  // ✅ Validation Schema
  const validationSchema = yup.object().shape({
    salesman_type: yup.string().required("Sales Team Type is required"),
    warehouse: yup.string().required("Distributor is required"),
    route: yup.string().required("Route is required"),

    salesman: yup.string().required("Sales Team is required"),
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  // ✅ Handle Qty Change
  const handleQtyChange = (itemId: string | number, value: string) => {
    setItemData((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, qty: value } : item))
    );
  };

  // ✅ Handle Submit
  const handleSubmit = async () => {
    try {
      await validationSchema.validate(form, { abortEarly: false });
      setErrors({});
      setSubmitting(true);

      const validItems = itemData.filter(
        (i) =>
          (i.cse_qty && Number(i.cse_qty) > 0) ||
          (i.pcs_qty && Number(i.pcs_qty) > 0)
      );

      if (validItems.length === 0) {
        showSnackbar("Please add at least one item with quantity", "error");
        setSubmitting(false);
        return;
      }
      const details: any = [];

      validItems.flatMap((singleItems: any) => {
        if (!Array.isArray(singleItems.uom)) return [];
        return singleItems.uom.flatMap((singleUom: any) => {
          const name = singleUom.name?.toUpperCase?.() || "";
          const uomType = singleUom.uom_type?.toUpperCase?.() || "";
          const isPcs = name.includes("CSE") || name.includes("PCS") || uomType.includes("OUT") || uomType.includes("BOX");
          const qty = isPcs ? singleItems.pcs_qty : singleItems.cse_qty;

          if (qty && Number(qty) > 0) {
            return [{
              item_id: Number(singleItems.id),
              qty: Number(qty),
              uom: singleUom.uom_id ?? singleUom.id ?? singleUom.uom?.id,
            }];
          }
          return [];
        });
      });

      const payload = {
        salesman_type: Number(form.salesman_type),
        project_type: form.project_type ? Number(form.project_type) : null, // ✅ fix here
        warehouse_id: Number(form.warehouse),
        route_id: Number(form.route),
        salesman_id: Number(form.salesman),
        status: 1,
        details: validItems,
      };

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
            ? "Sales Team Load updated successfully"
            : "Sales Team Load added successfully",
          "success"
        );
        router.push("/salesTeamLoad");
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
        console.error(err);
        showSnackbar("Failed to submit form", "error");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveItem = (index: number) => {
    if (itemData.length <= 1) {
      setItemData([
        {
          item_id: "",
          itemName: "",
          Quantity: "1",

        },
      ]);
      return;
    }
    setItemData(itemData.filter((_, i) => i !== index));
  };

  const handleAddNewItem = () => {
    setItemData([
      ...itemData,
      {
        item_id: "",
        itemName: "",
        Quantity: "1",
      },
    ]);
  };

  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-center mb-5">
        <div className="flex items-center gap-4">
          <Icon
            icon="lucide:arrow-left"
            width={24}
            onClick={() => router.back()}
          />
          <h1 className="text-[20px] font-semibold text-[#181D27] flex items-center leading-[30px] mb-[4px]">
            Add Sales Team Load
          </h1>
        </div>
      </div>

      <ContainerCard className="rounded-[10px] scrollbar-none">
        {/* --- Header Section --- */}
        <div className="flex justify-between mb-10 flex-wrap gap-[20px]">
          <div className="flex flex-col gap-[10px]">
            <Logo type="full" />
            {/* <span className="text-primary font-normal text-[16px]">
              Emma-Köhler-Allee 4c, Germering - 13907
            </span> */}
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[42px] uppercase text-[#A4A7AE] mb-[10px]">
              Sales Team Load
            </span>
            <span className="text-primary text-[14px] tracking-[10px]">
              #{code}
            </span>
          </div>
        </div>
        <hr className="w-full text-[#D5D7DA]" />

        {/* --- Form Fields --- */}
        <div className="grid grid-cols-1 mt-6 mb-10 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <InputFields
            required
            label="Sales Team Type"
            name="salesman_type"
            value={form.salesman_type}
            options={salesmanTypeOptions}
            onChange={(e) => handleChange("salesman_type", e.target.value)}
            error={errors.salesman_type}
            className="w-full"
          />

          {/* Show Project List only when salesman_type id = 36 */}
          {form.salesman_type === "6" && (
            <div className="flex flex-col w-full sm:w-[30%]">
              <InputFields
                required
                label="Project List"
                value={form.project_type}
                options={projectOptions}
                onChange={(e) => handleChange("project_type", e.target.value)}
                error={errors.project_type}
              />
            </div>
          )}
          <InputFields
            required
            label="Distributor"
            name="warehouse"
            value={form.warehouse}
            searchable={true}
            options={warehouseOptions}
            error={errors.warehouse}
            onChange={(e) => {
              const val = e.target.value;
              handleChange("warehouse", val);
              // Clear customer when warehouse changes
              handleChange("route", "");
              // Fetch customers for selected warehouse
              if (val) {
                fetchRouteOptions(val);
              }
            }
            }
          />
          <InputFields
            required
            label="Route"
            name="route"
            value={form.route}
            searchable={true}
            options={routeOptions}
            error={errors.route}
            showSkeleton={skeleton.route}
            onChange={(e) => {
              const val = e.target.value;
              handleChange("route", val);
              // Clear customer when warehouse changes
              handleChange("salesman", "");
              // Fetch customers for selected warehouse
              if (val) {
                fetchSalesmanByRouteOptions(val);
              }
            }}
          />
          <InputFields
            label="Sales Team"
            name="salesman"
            value={form.salesman}
            searchable={true}
            options={salesmanOptions}
            error={errors.salesman}
            onChange={(e) => handleChange("salesman", e.target.value)}
          />
        </div>
        {/* --- Table --- */}
        <div>
        </div>
        <Table
          key={`items-table-${itemData.length}`}
          data={itemData.map((row, idx) => ({ ...row, idx: idx.toString() }))}
          config={{
            table: { height: 500 },
            showNestedLoading: false,
            columns: [
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
              {
                key: "warehouse_stocks",
                label: "Available Stocks",
                render: (row: TableDataType) => {
                  // Find stock for the selected warehouse
                  const warehouseStock = (row as any)?.warehouse_stocks?.find(
                    (stock: any) => stock.warehouse_id?.toString() === form.warehouse
                  );
                  const stockQty = warehouseStock?.qty;
                  return <span>{stockQty !== undefined ? stockQty : "0"}</span>;
                },
              },
              {
                key: "cse_qty",
                label: "CSE",
                render: (row) => (
                  <InputFields
                    label=""
                    type="number"
                    name="cse_qty"
                    value={row.cse_qty}
                    onChange={(e) =>
                      recalculateItem(
                        Number(row.idx),
                        "cse_qty",
                        e.target.value
                      )
                    }
                  />
                ),
              },

              {
                key: "pcs_qty",
                label: "PCS",
                render: (row) => (
                  <InputFields
                    label=""
                    type="number"
                    name="pcs_qty"
                    value={row.pcs_qty}
                    onChange={(e) =>
                      recalculateItem(
                        Number(row.idx),
                        "pcs_qty",
                        e.target.value
                      )
                    }
                  />
                ),
              },
            ],
            pageSize: itemData.length > 0 ? itemData.length : 10
          }}
        />

        <div>
        </div>


        <div className="flex justify-between text-primary gap-0 mb-10">
          <div></div>
          <div className="flex justify-between flex-wrap w-full">
            <div className="flex flex-col justify-end gap-[20px] w-full lg:w-[400px]">

            </div>
          </div>
        </div>

        {/* --- Buttons --- */}
        <hr className="text-[#D5D7DA]" />
        <div className="flex justify-end gap-4 mt-6">
          <button
            type="button"
            className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
            // onClick={() => router.push("/selesTeamLoad")}
            onClick={() => router.back()}

          >
            Cancel
          </button>
          <SidebarBtn
            isActive={true}
            label={submitting ? "Creating Load..." : "Create Load"}
            onClick={handleSubmit}
          />
        </div>
      </ContainerCard>
    </div>
  );
}
