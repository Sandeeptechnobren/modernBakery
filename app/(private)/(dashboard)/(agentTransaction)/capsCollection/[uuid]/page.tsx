"use client";

import ContainerCard from "@/app/components/containerCard";
import AutoSuggestion from "@/app/components/autoSuggestion";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
import Table from "@/app/components/customTable";
import CustomTable, { TableDataType } from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import InputFields from "@/app/components/inputFields";
import Logo from "@/app/components/logo";
import {
  capsCollectionByUuid,
  createCapsCollection,
  updateCapsCollection,
} from "@/app/services/agentTransaction";
import { itemList } from "@/app/services/allApi";
import { useLoading } from "@/app/services/loadingContext";
import { useSnackbar } from "@/app/services/snackbarContext";
import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import * as yup from "yup";
import { warehouseListGlobalSearch, getCompanyCustomers, agentCustomerList, itemGlobalSearch } from "@/app/services/allApi";
interface Uom {
  id: string;
  name?: string;
  price?: string;
}
interface Warehouse {
  id: number;
  code?: string;
  warehouse_code?: string;
  name?: string;
  warehouse_name?: string;
}
interface Route {
  id: number;
  route_code?: string;
  code?: string;
  route_name?: string;
  name?: string;
}
interface CompanyCustomer {
  id: number;
  osa_code?: string;
  business_name?: string;
}
interface AgentCustomer {
  id: number;
  osa_code?: string;
  outlet_name?: string;
  customer_name?: string;
  name?: string;
}
interface Item {
  id: number;
  item_code?: string;
  code?: string;
  name?: string;
  uom?: Uom[];
  uoms?: Uom[];
}



export default function AddEditCapsCollection() {
  const {
    warehouseOptions,
    agentCustomerOptions,
    fetchAgentCustomerOptions,
    itemOptions,
  } = useAllDropdownListData();

  const router = useRouter();
  const { showSnackbar } = useSnackbar();
  const { setLoading } = useLoading();
  const params = useParams();
  const loadUUID = params?.uuid as string | undefined;
  const isEditMode = loadUUID && loadUUID !== "add";

  const [form, setForm] = useState({
    warehouse: "",
    customer: "",
    status: "1",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [customerContactNo, setCustomerContactNo] = useState("");
  const [itemErrors, setItemErrors] = useState<Record<number, Record<string, string>>>({});
 const [skeleton, setSkeleton] = useState({
    route: false,
    customer: false,
    item: false,
  });
    const [orderData, setOrderData] = useState<FormData[]>([]);
    const [itemsOptions, setItemsOptions] = useState<{ label: string; value: string }[]>([]);
  
  const [rowUomOptions, setRowUomOptions] = useState<
    Record<string, { value: string; label: string; price?: string }[]>
  >({});


// AutoSuggestion search functions (same as return page)
const handleWarehouseSearch = async (searchText: string) => {
  try {
    const response = await warehouseListGlobalSearch({ query: searchText });
    const data = Array.isArray(response?.data) ? response.data : [];
    return data.map((warehouse: Warehouse) => ({
      value: String(warehouse.id),
      label: `${warehouse.code || warehouse.warehouse_code || ""} - ${warehouse.name || warehouse.warehouse_name || ""}`,
      code: warehouse.code || warehouse.warehouse_code,
      name: warehouse.name || warehouse.warehouse_name,
    }));
  } catch {
    return [];
  }
};

const handleCustomerSearch = async (searchText: string, warehouseId: string, customerType: string) => {
  if (!warehouseId) return [];
  try {
    let response;
    if (customerType === "1") {
      response = await getCompanyCustomers({ warehouse_id: warehouseId, search: searchText, per_page: "50" });
    } else {
      response = await agentCustomerList({ warehouse_id: warehouseId, search: searchText, per_page: "50" });
    }
    const data = Array.isArray(response?.data) ? response.data : [];
    return data.map((customer: any) => {
      // Always include contact_no in the returned option
      if (customerType === "1") {
        return {
          value: String(customer.id),
          label: `${customer.osa_code || ""} - ${customer.business_name || ""}`.trim(),
          name: customer.business_name || "",
          contact_no: customer.contact_no || "",
        };
      } else {
        return {
          value: String(customer.id),
          label: `${customer.osa_code || ""} - ${customer.outlet_name || ""}`,
          name: customer.outlet_name || customer.customer_name || customer.name || '',
          contact_no: customer.contact_no || "",
        };
      }
    });
  } catch {
    return [];
  }
};

const handleItemSearch = async (searchText: string) => {
  if (!searchText || searchText.trim().length < 1) return [];
  try {
    const response = await itemGlobalSearch({ query: searchText });
    const data = Array.isArray(response?.data) ? response.data : [];
    return data.map((item: Item) => ({
      value: String(item.id),
      label: `${item.item_code || item.code || ""} - ${item.name || ""}`,
      code: item.item_code || item.code,
      name: item.name,
      uoms: item.uom || item.uoms || [],
    }));
  } catch {
    return [];
  }
};

  const [tableData, setTableData] = useState<TableDataType[]>([
    {
      id: "1",
      item: "",
      uom: "",
      collectQty: "1",
      price: "0",
      total: "0",
    },
  ]);

  // 🧩 Fetch data in edit mode
  useEffect(() => {
    if (isEditMode && loadUUID) {
      (async () => {
        setLoading(true);
        try {
          const res = await capsCollectionByUuid(loadUUID);
          const data = res?.data ?? res;

          setForm({
            warehouse: data?.warehouse_id ? String(data.warehouse_id) : "",
            customer: data?.customer ? String(data.customer) : "",
            status: data?.status ? String(data.status) : "1",
          });

          if (data?.warehouse_id) {
            await fetchAgentCustomerOptions(String(data.warehouse_id));
            setTimeout(() => {
              const selectedCustomer = agentCustomerOptions.find(
                (opt) => opt.value === String(data.customer)
              );
              setCustomerContactNo(selectedCustomer?.contact_no || "");
            }, 200);
          }

          if (Array.isArray(data?.details)) {
            const loadedRows = data.details.map((detail: any, idx: number) => {
              const rowId = String(idx + 1);
              const selectedItem = itemOptions.find(
                (item) => item.value === String(detail.item_id)
              );
              let uomOpts: any[] = [];
              if (selectedItem?.uoms?.length) {
                uomOpts = selectedItem.uoms.map((uom: any) => ({
                  value: uom.id || "",
                  label: uom.name || "",
                  price: uom.price || "0",
                }));
                setRowUomOptions((prev) => ({ ...prev, [rowId]: uomOpts }));
              }

              const selectedUom = uomOpts.find(
                (u) => u.value === String(detail.uom_id)
              );
              const price = selectedUom?.price || "0";
              const qty = String(detail.collected_quantity || 0);
              const total = String((parseFloat(price) || 0) * (parseFloat(qty) || 0));

              return {
                id: rowId,
                item: String(detail.item_id),
                uom: String(detail.uom_id),
                collectQty: qty,
                price,
                total,
              };
            });
            setTableData(loadedRows);
          }
        } catch {
          showSnackbar("Failed to fetch CAPS collection details", "error");
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [isEditMode, loadUUID]);

  // 🧾 Validation
  const validationSchema = yup.object().shape({
    warehouse: yup.string().required("Warehouse is required"),
    customer: yup.string().required("Customer is required"),
  });

  // 🪄 Handlers
  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleTableChange = (id: string, field: string, value: string) => {
    setTableData((prev) =>
      prev.map((row) => {
        if (row.id === id) {
          const updated = { ...row, [field]: value };
          const qty =
            parseFloat(field === "collectQty" ? value : updated.collectQty) || 0;
          const price = parseFloat(field === "price" ? value : updated.price) || 0;
          updated.total = String(qty * price);
          return updated;
        }
        return row;
      })
    );
  };

  const handleAddRow = () => {
    const newId = String(tableData.length + 1);
    setTableData((prev) => [
      ...prev,
      { id: newId, item: "", uom: "", collectQty: "1", price: "0", total: "0" },
    ]);
  };

  const handleRemoveRow = (id: string) => {
    if (tableData.length <= 1) return;
    setTableData((prev) => prev.filter((row) => row.id !== id));
  };

  const fetchItem = async (searchTerm: string) => {
      const res = await itemList({  name: searchTerm });
      if (res.error) {
        showSnackbar(res.data?.message || "Failed to fetch items", "error");
        setSkeleton({ ...skeleton, item: false });
        return;
      }
      const data = res?.data || [];
      setOrderData(data);
      const options = data.map((item: { id: number; name: string; }) => ({
        value: String(item.id),
        label: item.name
      }));
      setItemsOptions(options);
      setSkeleton({ ...skeleton, item: false });
      return options;
    };



    // const recalculateItem = async (index: number, field: string, value: string, values?: FormikValues) => {
    //     const newData = [...itemData];
    //     const item: ItemData = newData[index];
    //     (item as any)[field] = value;
    
    //     // If user selects an item, update UI immediately and show skeletons while fetching price/UOM
    //     if (field === "item_id") {
    //       // keep item id and name aligned for existing logic
    //       item.item_id = value;
    //       item.UOM = [];
    //       item.Price = "-";
    //       setItemData(newData);
    //       setItemLoading((prev) => ({ ...prev, [index]: { uom: true } }));
    //       item.UOM = orderData.find((order: FormData) => order.id.toString() === item.item_id)?.uom?.map(uom => ({ label: uom.name, value: uom.id.toString(), price: uom.price })) || [];
    //       setItemLoading((prev) => ({ ...prev, [index]: { uom: false } }));
    //     }
    
    //     // Ensure numeric calculations use the latest values
    //     const qty = Number(item.Quantity) || 0;
    //     const price = Number(item.Price) || 0;
    //     const total = qty * price;
    //     const vat = total - total / 1.18;
    //     const net = total - vat;
    //     const excise = 0; // Calculate excise based on your business logic
    //     const discount = 0; // Calculate discount based on your business logic
    //     const gross = total;
    
    //     // Persist any value changes for qty/uom/price
    //     if (field === "Quantity") item.Quantity = value;
    //     if (field === "uom_id") item.uom_id = value;
    
    //     item.Total = total.toFixed(2);
    //     item.Vat = vat.toFixed(2);
    //     item.Net = net.toFixed(2);
    //     item.Excise = excise.toFixed(2);
    //     item.Discount = discount.toFixed(2);
    //     item.gross = gross.toFixed(2);
    
    //     setItemData(newData);
    //     // validate this row after updating; if we just changed the item selection, skip UOM required check
    //     if (field === "item_id") {
    //       validateRow(index, newData[index], { skipUom: true });
    //     } else {
    //       validateRow(index, newData[index]);
    //     }
    //   };



  // 🚀 Submit
  const handleSubmit = async () => {
    try {
      await validationSchema.validate(form, { abortEarly: false });
      setErrors({});

      const validRows = tableData.filter((r) => r.item && r.uom && r.collectQty);
      if (validRows.length === 0) {
        showSnackbar("Please add at least one valid item.", "error");
        return;
      }

      setSubmitting(true);
      const payload = {
        warehouse_id: parseInt(form.warehouse),
        customer: form.customer,
        status: parseInt(form.status),
        details: validRows.map((r) => ({
          item_id: parseInt(r.item),
          uom_id: parseInt(r.uom),
          collected_quantity: parseFloat(r.collectQty),
          status: 1,
        })),
      };

      const res = isEditMode
        ? await updateCapsCollection(loadUUID!, payload)
        : await createCapsCollection(payload);

      if (res?.error) {
        showSnackbar(res.data?.message || "Failed to submit form", "error");
      } else {
        showSnackbar(
          isEditMode
            ? "CAPS Master Collection updated successfully"
            : "CAPS Master Collection added successfully",
          "success"
        );
        router.push("/capsCollection");
      }
    } catch (err: any) {
      if (err instanceof yup.ValidationError) {
        const formErrors: Record<string, string> = {};
        err.inner.forEach((e) => {
          if (e.path) formErrors[e.path] = e.message;
        });
        setErrors(formErrors);
      } else {
        showSnackbar("Something went wrong while saving.", "error");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link href="/capsCollection">
            <Icon icon="lucide:arrow-left" width={24} />
          </Link>
          <h1 className="text-xl font-semibold text-gray-900">
            {isEditMode ? "Edit CAPS Master Collection" : "Add CAPS Master Collection"}
          </h1>
        </div>
      </div>

      <ContainerCard>
        {/* Header Info */}
        <div className="flex justify-between mb-10 flex-wrap gap-[20px]">
          <div className="flex flex-col gap-[10px]">
            <Logo type="full" />
          </div>
          <div className="flex flex-col text-right">
            <span className="text-[42px] uppercase text-[#A4A7AE] mb-[10px]">
              CAPS COLLECTION
            </span>
            <span className="text-primary text-[14px] tracking-[10px]">#L0201</span>
          </div>
        </div>

        <hr className="mb-6" />

        {/* Form */}
        <h2 className="text-lg font-medium text-gray-800 mb-4">
          CAPS Master Collection Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

          <div>
            <AutoSuggestion
              required
              label="Warehouse"
              name="warehouse"
              placeholder="Search warehouse..."
              initialValue={form.warehouse}
              onSearch={handleWarehouseSearch}
              onSelect={(option: { value: string }) => {
                handleChange("warehouse", option.value);
                handleChange("customer", "");
                if (option.value) fetchAgentCustomerOptions(option.value);
              }}
              onClear={() => handleChange("warehouse", "")}
              error={errors.warehouse}
            />
            {errors.warehouse && (
              <p className="text-red-500 text-sm mt-1">{errors.warehouse}</p>
            )}
          </div>

          <div>
            <AutoSuggestion
              required
              label="Customer"
              name="customer"
              placeholder="Search customer..."
              initialValue={form.customer}
              onSearch={(searchText: string) => handleCustomerSearch(searchText, form.warehouse, "0")}
              onSelect={(option: { value: string; contact_no?: string }) => {
                handleChange("customer", option.value);
                setCustomerContactNo(option.contact_no || "");
              }}
              onClear={() => handleChange("customer", "")}
              error={errors.customer}
              disabled={!form.warehouse}
              noOptionsMessage={!form.warehouse ? "Please select a warehouse first" : "No customers found"}
            />
            {errors.customer && (
              <p className="text-red-500 text-sm mt-1">{errors.customer}</p>
            )}
          </div>

          <InputFields
            label="Contact No."
            value={customerContactNo}
            disabled
            onChange={() => {}}
          />

          {/* <InputFields
            type="radio"
            label="Status"
            name="status"
            value={form.status}
            onChange={(e) => handleChange("status", e.target.value)}
            options={[
              { value: "1", label: "Active" },
              { value: "0", label: "Inactive" },
            ]}
          /> */}
        </div>

        <hr className="mb-4" />

        {/* Table */}
        <CustomTable
          data={tableData}
          config={{
            header: { title: "Items" },
            columns: [
              {
                key: "item",
                label: "Item",
                render: (row) => (
                  <AutoSuggestion
                    placeholder="Search item..."
                    initialValue={row.item}
                    onSearch={handleItemSearch}
                    onSelect={(option: { value: string; uoms?: Uom[] }) => {
                      handleTableChange(row.id, "item", option.value);
                      if (option.uoms && option.uoms.length > 0) {
                        const uomOpts = option.uoms.map((u: Uom) => ({
                          value: u.id || "",
                          label: u.name || "",
                          price: u.price || "0",
                        }));
                        setRowUomOptions((prev) => ({ ...prev, [row.id]: uomOpts }));
                        const first = uomOpts[0];
                        if (first) {
                          handleTableChange(row.id, "uom", first.value);
                          handleTableChange(row.id, "price", first.price || "0");
                        }
                      }
                    }}
                    onClear={() => {
                      handleTableChange(row.id, "item", "");
                      setRowUomOptions((prev) => {
                        const newOpts = { ...prev };
                        delete newOpts[row.id];
                        return newOpts;
                      });
                    }}
                  />
                ),
              },
              {
                key: "uom",
                label: "UOM",
                render: (row) => {
                  const opts = rowUomOptions[row.id] || [];
                  return (
                    <InputFields
                      options={opts}
                      value={row.uom}
                      disabled={opts.length === 0}
                      onChange={(e) => {
                        const val = e.target.value;
                        handleTableChange(row.id, "uom", val);
                        const selected = opts.find((o) => o.value === val);
                        if (selected)
                          handleTableChange(row.id, "price", selected.price || "0");
                      }}
                    />
                  );
                },
              },
              {
                key: "collectQty",
                label: "Collect Qty",
                render: (row) => (
                  <InputFields
                    type="number"
                    value={row.collectQty}
                    onChange={(e) =>
                      handleTableChange(row.id, "collectQty", e.target.value)
                    }
                  />
                ),
              },
              {
                key: "price",
                label: "Price",
                render: (row) => (
                  <span>{parseFloat(row.price || "0").toFixed(2)}</span>
                ),
              },
              {
                key: "total",
                label: "Total",
                render: (row) => (
                  <span>{parseFloat(row.total || "0").toFixed(2)}</span>
                ),
              },
              {
                key: "action",
                label: "Action",
                render: (row) => (
                  <button
                    type="button"
                    className="text-red-500"
                    onClick={() => handleRemoveRow(row.id)}
                    disabled={tableData.length <= 1}
                  >
                    <Icon icon="hugeicons:delete-02" width={20} />
                  </button>
                ),
              },
            ],
            showNestedLoading: false,
            footer: { pagination: false },
          }}
        />


        {/* <div>
           <Table
                            data={tableData.map((row, idx) => ({
                              ...row,
                              idx: idx.toString(),
                              UOM: Array.isArray(row.UOM) ? JSON.stringify(row.UOM) : "[]",
                              item_id: String(row.item_id ?? ""),
                              Quantity: String(row.Quantity ?? ""),
                            }))}
                            config={{
                              columns: [
                                {
                                  key: "item_id",
                                  label: "Item Name",
                                  width: 300,
                                  render: (row) => {
                                    const idx = Number(row.idx);
                                    const err = itemErrors[idx]?.item_id;
                                    // Filter out items that are already selected in other rows
                                    const selectedIds = tableData.map((r, i) => (i === idx ? null : r.item_id)).filter(Boolean) as string[];
                                    const filteredOptions = itemsOptions.filter(opt => (
                                      opt.value === row.item_id || !selectedIds.includes(opt.value)
                                    ));
                                    return (
                                      <div>
                                        <AutoSuggestion
                                          label=""
                                          name={`item_id_${row.idx}`}
                                          placeholder="Search item"
                                          onSearch={(q) => fetchItem(q)}
                                          initialValue={
                                            itemsOptions.find(o => o.value === row.item_id)?.label
                                            || orderData.find(o => String(o.id) === row.item_id)?.name || ""
                                          }
                                          onSelect={(opt) => {
                                            if (opt.value !== row.item_id) {
                                              recalculateItem(Number(row.idx), "item_id", opt.value);
                                              // setFieldValue("uom_id", "");
                                            } else {
                                              recalculateItem(Number(row.idx), "item_id", opt.value);
                                            }
                                          }}
                                          onClear={() => {
                                            recalculateItem(Number(row.idx), "item_id", "");
                                            // setFieldValue("uom_id", "");
                                          }}
                                          disabled={!values.customer}
                                          error={err && err}
                                          className="w-full"
                                        />
                                      </div>
                                    );
                                  },
                                },
                                {
                                  key: "uom_id",
                                  label: "UOM",
                                  width: 150,
                                  render: (row) => {
                                    const idx = Number(row.idx);
                                    const err = itemErrors[idx]?.uom_id;
                                    const options = JSON.parse(row.UOM ?? "[]");
                                    return (
                                      <div>
                                        <InputFields
                                          label=""
                                          name="UOM"
                                          value={row.uom_id}
                                          placeholder="Select UOM"
                                          options={options}
                                          disabled={options.length === 0 && !values.customer}
                                          showSkeleton={Boolean(itemLoading[idx]?.uom)}
                                          onChange={(e) => {
                                            recalculateItem(Number(row.idx), "uom_id", e.target.value)
                                            const price = options.find((uom: { value: string }) => String(uom.value) === e.target.value)?.price || "0.00";
                                            recalculateItem(Number(row.idx), "Price", price);
                                          }}
                                          error={err && err}
                                        />
                                      </div>
                                    );
                                  },
                                },
                                {
                                  key: "Quantity",
                                  label: "Qty",
                                  width: 150,
                                  render: (row) => {
                                    const idx = Number(row.idx);
                                    const err = itemErrors[idx]?.Quantity;
                                    return (
                                      <div>
                                        <InputFields
                                          label=""
                                          type="number"
                                          name="Quantity"
                                          // integerOnly={true}
                                          placeholder="Enter Qty"
                                          value={row.Quantity}
                                          disabled={!values.customer}
                                          onChange={(e) => {
                                            const raw = (e.target as HTMLInputElement).value;
                                            const intPart = raw.split('.')[0];
                                            const sanitized = intPart === '' ? '' : String(Math.max(0, parseInt(intPart, 10) || 0));
                                            recalculateItem(Number(row.idx), "Quantity", sanitized);
                                          }}
                                          // numberMin={0}
                                          error={err && err}
                                        />
                                      </div>
                                    );
                                  },
                                },
                                {
                                  key: "action",
                                  label: "Action",
                                  render: (row) => (
                                    <button
                                      type="button"
                                      className={`${itemData.length <= 1
                                        ? "opacity-50 cursor-not-allowed"
                                        : ""
                                        } text-red-500 flex items-center`}
                                      onClick={() =>
                                        itemData.length > 1 && handleRemoveItem(Number(row.idx))
                                      }
                                    >
                                      <Icon icon="hugeicons:delete-02" width={20} />
                                    </button>
                                  ),
                                },
                              ],
                              showNestedLoading: false,
                            }}
                          />
        </div> */}

        <div className="mt-4">
          <button
            type="button"
            className="text-[#E53935] flex items-center gap-2 font-medium"
            onClick={handleAddRow}
          >
            <Icon icon="material-symbols:add-circle-outline" width={20} />
            Add New Item
          </button>
        </div>

        <hr className="my-6" />

        {/* Buttons */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            className="px-6 py-2 border rounded-lg text-gray-700 hover:bg-gray-100"
            onClick={() => router.push("/capsCollection")}
          >
            Cancel
          </button>
          <SidebarBtn
            isActive={!submitting}
            label={isEditMode ? "Update CAPS Collection" : "Create CAPS Collection"}
            onClick={handleSubmit}
          />
        </div>
      </ContainerCard>
    </div>
  );
}
