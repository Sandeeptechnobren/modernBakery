"use client";
import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import * as yup from "yup";
import InputFields from "@/app/components/inputFields";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import { useSnackbar } from "@/app/services/snackbarContext";
import CustomTable, { TableDataType } from "@/app/components/customTable";
import {
  getRouteById,
} from "@/app/services/allApi";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
import { useLoading } from "@/app/services/loadingContext";
import ContainerCard from "@/app/components/containerCard";
import { createCapsCollection, updateCapsCollection,capsCollectionByUuid } from "@/app/services/agentTransaction";

export default function AddEditSalesmanLoad() {
  const {  warehouseOptions,agentCustomerOptions ,fetchRoutebySalesmanOptions,fetchSalesmanOptions,routeOptions, itemOptions,fetchAgentCustomerOptions} = useAllDropdownListData();
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
    customer: "",
    status: "1",
    item: "",
    uom: "",
    qty: "",
    price: "",
    total: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [skeleton, setSkeleton] = useState(false);
  const [customerContactNo, setCustomerContactNo] = useState("");
  
  // Store UOM options for each row
  const [rowUomOptions, setRowUomOptions] = useState<Record<string, { value: string; label: string; price?: string }[]>>({});
  
  // Table data for items
  const [tableData, setTableData] = useState<TableDataType[]>([
    {
      id: "1",
      item: "",
      uom: "",
      collectQty: "1",
      price: "",
      total: "0",
    }
  ]);

  const handleTableChange = (id: string, field: string, value: string) => {
    setTableData(prev => 
      prev.map(row => {
        if (row.id === id) {
          const updatedRow = { ...row, [field]: value };
          
          // Always recalculate total based on current collectQty and price
          const qty = parseFloat(field === "collectQty" ? value : updatedRow.collectQty) || 0;
          const price = parseFloat(field === "price" ? value : updatedRow.price) || 0;
          updatedRow.total = String(qty * price);
          
          return updatedRow;
        }
        return row;
      })
    );
  };

  const addNewRow = () => {
    const newId = String(tableData.length + 1);
    setTableData(prev => [...prev, {
      id: newId,
      item: "",
      uom: "",
      collectQty: "1",
      price: "",
      total: "0",
    }]);
  };

  const removeRow = (id: string) => {
    if (tableData.length > 1) {
      setTableData(prev => prev.filter(row => row.id !== id));
    }
  };

  // Fetch CAPS collection details in edit mode
  useEffect(() => {
    if (isEditMode && loadUUID) {
      setLoading(true);
      (async () => {
        try {
          const res = await capsCollectionByUuid(String(loadUUID));
          const data = res?.data ?? res;
          
          // Set form data
          setForm({
            salesmanType: "",
            route: "",
            warehouse: data?.warehouse_id ? String(data.warehouse_id) : "",
            status: data?.status ? String(data.status) : "1",
            project: "",
            customer: data?.customer ? String(data.customer) : "",
            item: "",
            uom: "",
            qty: "",
            price: "",
            total: "",
          });
          
          // Fetch customers for the loaded warehouse
          if (data?.warehouse_id) {
            await fetchAgentCustomerOptions(String(data.warehouse_id));
            // Set contact number after fetching customers
            setTimeout(() => {
              const selectedCustomer = agentCustomerOptions.find(opt => opt.value === String(data?.customer));
              setCustomerContactNo(selectedCustomer?.contact_no || "");
            }, 100);
          }
          
          // Load table data from details array
          if (data?.details && Array.isArray(data.details) && data.details.length > 0) {
            const loadedTableData = data.details.map((detail: any, index: number) => {
              const rowId = String(index + 1);
              
              // Find item to get UOM options
              const selectedItem = itemOptions.find(item => item.value === String(detail.item_id));
              if (selectedItem && selectedItem.uoms && selectedItem.uoms.length > 0) {
                const uomOpts = selectedItem.uoms.map(uom => ({
                  value: uom.id || "",
                  label: uom.name || "",
                  price: uom.price || "0"
                }));
                
                setRowUomOptions(prev => ({
                  ...prev,
                  [rowId]: uomOpts
                }));
              }
              
              // Find the price from the selected UOM
              let itemPrice = "0";
              if (selectedItem && selectedItem.uoms) {
                const selectedUom = selectedItem.uoms.find(uom => uom.id === String(detail.uom_id));
                itemPrice = selectedUom?.price || "0";
              }
              
              const qty = String(detail.collected_quantity || 0);
              const price = itemPrice;
              const total = String((parseFloat(qty) || 0) * (parseFloat(price) || 0));
              
              return {
                id: rowId,
                item: detail.item_id ? String(detail.item_id) : "",
                uom: detail.uom_id ? String(detail.uom_id) : "",
                collectQty: qty,
                price: price,
                total: total,
              };
            });
            
            setTableData(loadedTableData);
          }
        } catch (err) {
          showSnackbar("Failed to fetch CAPS collection details", "error");
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [isEditMode, loadUUID]);

  // Validation schema
  const validationSchema = yup.object().shape({
    warehouse: yup.string().required("Warehouse is required"),
    customer: yup.string().required("Customer is required"),
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

      // Validate that at least one item is added
      const hasItems = tableData.some(row => row.item && row.collectQty);
      if (!hasItems) {
        showSnackbar("Please add at least one item with quantity", "error");
        return;
      }

      // Validate all rows have required fields
      const invalidRows = tableData.filter(row => {
        if (row.item) {
          return !row.collectQty || !row.price;
        }
        return false;
      });

      if (invalidRows.length > 0) {
        showSnackbar("Please fill in all required fields (Collect Qty and Price) for selected items", "error");
        return;
      }

      setSubmitting(true);

      const payload = {
        warehouse_id: parseInt(form.warehouse),
        customer: form.customer,
        status: 1,
        details: tableData.filter(row => row.item).map(row => ({
          item_id: parseInt(row.item),
          uom_id: parseInt(row.uom),
          collected_quantity: parseFloat(row.collectQty),
          status: 1
        })),
      };

      let res;
      if (isEditMode && loadUUID) {
        res = await updateCapsCollection(loadUUID, payload);
      } else {
        res = await createCapsCollection(payload);
      }

      if (res?.error) {
        showSnackbar(res.data?.message || "Failed to submit form", "error");
      } else {
        showSnackbar(
          isEditMode ? "Route updated successfully" : "Route added successfully",
          "success"
        );
        router.push("/capsCollection");
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
          <Link href="/capsCollection">
            <Icon icon="lucide:arrow-left" width={24} />
          </Link>
          <h1 className="text-xl font-semibold text-gray-900">
            {isEditMode ? "Update CAPS Master Collection" : "Add CAPS Master Collection"}
          </h1>
        </div>
      </div>

      {/* Content */}
      <ContainerCard>
        <div className="">
          <h2 className="text-lg font-medium text-gray-800 mb-4">
            CAPS Master Collection Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            

            
             <div className="flex flex-col">
              <InputFields
                required
                label="Warehouse"
                value={form.warehouse}
                options={warehouseOptions}
                onChange={(e) => {
                  const val = e.target.value;
                  handleChange("warehouse", val);
                  // Clear customer when warehouse changes
                  handleChange("customer", "");
                  // Fetch customers for selected warehouse
                  if (val) {
                    fetchAgentCustomerOptions(val);
                  }
                }}
              />
              {errors.warehouse && (
                <p className="text-red-500 text-sm mt-1">{errors.warehouse}</p>
              )}
            </div>
             <div className="flex flex-col">
              <InputFields
                required
                label="Customer"
                value={form.customer}
                options={agentCustomerOptions}
                onChange={(e) => {
                  const val = e.target.value;
                  handleChange("customer", val);
                  // Find selected customer and set contact number
                  const selectedCustomer = agentCustomerOptions.find(opt => opt.value === val);
                  setCustomerContactNo(selectedCustomer?.contact_no || "");
                }}
              />
              {errors.customer && (
                <p className="text-red-500 text-sm mt-1">{errors.customer}</p>
              )}
            </div>

            <div className="flex flex-col">
              <InputFields
                value={customerContactNo}
                disabled={true}
                label="Contact No."
                onChange={(e) => {
                  const val = e.target.value;
                  handleChange("contact_no", val);
                }}
              />
            
            </div>
            <InputFields
                              required
                              type="radio"
                              label="Status"
                              value={form.status}
                              onChange={(e) => handleChange("status", e.target.value)}
                              name="status"
                              
                              options={[
                                { value: "1", label: "Active" },
                                { value: "0", label: "Inactive" },
                              ]}
                            />

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
                width: 397,
                render: (row) => (
                  <div style={{ minWidth: '400px', maxWidth: '400px' }}>
                   <InputFields 
                   options={itemOptions}
                   value={row.item}
                   onChange={(e) => {
                     const selectedItemId = e.target.value;
                     handleTableChange(row.id, "item", selectedItemId);
                     const selectedItem = itemOptions.find(item => item.value === selectedItemId);
                     if (selectedItem && selectedItem.uoms && selectedItem.uoms.length > 0) {
                       const uomOpts = selectedItem.uoms.map(uom => ({
                         value: uom.id || "",
                         label: uom.name || "",
                         price: uom.price || "0"
                       }));
                       setRowUomOptions(prev => ({
                         ...prev,
                         [row.id]: uomOpts
                       }));
                       const firstUom = uomOpts[0];
                       if (firstUom) {
                         handleTableChange(row.id, "uom", firstUom.value);
                         handleTableChange(row.id, "price", firstUom.price || "0");
                       }
                     } else {
                       setRowUomOptions(prev => {
                         const newOpts = { ...prev };
                         delete newOpts[row.id];
                         return newOpts;
                       });
                       handleTableChange(row.id, "uom", "");
                       handleTableChange(row.id, "price", "0");
                     }
                   }}>
                   </InputFields>
                  </div>
                ),
              },
              {
                key: "uom",
                label: "UOM",
                showByDefault: true,
                width: 134,
                render: (row) => {
                  const uomOptions = rowUomOptions[row.id] || [];
                  return (
                    <div style={{ minWidth: '134px', maxWidth: '134px' }}>
                      <InputFields 
                        options={uomOptions}
                        value={row.uom}
                        disabled={uomOptions.length === 0}
                        onChange={(e) => {
                          const selectedUomId = e.target.value;
                          handleTableChange(row.id, "uom", selectedUomId);
                          const selectedUom = uomOptions.find(uom => uom.value === selectedUomId);
                          if (selectedUom) {
                            handleTableChange(row.id, "price", selectedUom.price || "0");
                          }
                        }}
                      />
                    </div>
                  );
                },
              },
              {
                key: "collectQty",
                label: "Collect Qty",
                showByDefault: true,
                width: 150,
                render: (row) => (
                  <div style={{ minWidth: '100px', maxWidth: '150px' }}>
                    <InputFields
                      type="number"
                      value={row.collectQty}
                      onChange={(e) => {
                        const value = e.target.value;
                        const numValue = parseFloat(value);
                        if (value === "") {
                          handleTableChange(row.id, "collectQty", value);
                        } else if (numValue <= 0) {
                          handleTableChange(row.id, "collectQty", "1");
                        } else {
                          handleTableChange(row.id, "collectQty", value);
                        }
                      }}
                      placeholder="Quantity"
                    />
                  </div>
                ),
              },
              {
                key: "price",
                label: "Price",
                showByDefault: true,
                width: 150,
                render: (row) => (
                  <div style={{ minWidth: '100px', maxWidth: '150px' }}>
                    <span className="text-sm font-medium">
                      {parseFloat(row.price || "0").toFixed(2)}
                    </span>
                  </div>
                ),
              },
              {
                key: "total",
                label: "Total",
                showByDefault: true,
                width: 150,
                render: (row) => (
                  <div style={{ minWidth: '100px', maxWidth: '150px' }}>
                    <span className="text-sm font-medium">
                      {parseFloat(row.total || "0").toFixed(2)}
                    </span>
                  </div>
                ),
              },
              {
                key: "actions",
                label: "Actions",
                showByDefault: true,
                width: 100,
                sticky: "right",
                render: (row: TableDataType) => {
                  const isFirstRow = row.id === "1";
                  return (
                    <div className="flex items-center gap-[4px] border-l border-[#E9EAEB] pl-2">
                      {isFirstRow ? (
                        <Icon
                          icon="material-symbols:add-circle-outline"
                          width={20}
                          className="p-[10px] cursor-pointer text-[#5E5E5E] transition-all duration-200 ease-in-out hover:text-[#EA0A2A] hover:scale-110"
                          onClick={() => addNewRow()}
                        />
                      ) : (
                        <Icon
                          icon="lucide:trash-2"
                          width={20}
                          className="p-[10px] cursor-pointer text-[#5E5E5E] transition-all duration-200 ease-in-out hover:text-[#EA0A2A] hover:scale-110"
                          onClick={() => removeRow(row.id)}
                        />
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
