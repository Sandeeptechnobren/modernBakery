"use client";

import React, { Fragment, ChangeEvent, useState, useEffect } from "react";
import ContainerCard from "@/app/components/containerCard";
import Table from "@/app/components/customTable";
import Logo from "@/app/components/logo";
import { Icon } from "@iconify-icon/react";
import { useRouter, useParams } from "next/navigation";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import InputFields from "@/app/components/inputFields";
import { createReturn,deliveryByUuid,updateDelivery } from "@/app/services/agentTransaction";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useLoading } from "@/app/services/loadingContext";
import * as yup from "yup";

// TypeScript interfaces
interface DeliveryDetail {
  item?: {
    id: number;
    code: string;
    name: string;
  };
  uom_id: number;
  quantity: number;
  return_type: string;
  return_reason: string;
}

interface DeliveryResponse {
  warehouse?: {
    id: number;
    code: string;
    name: string;
  };
  customer?: {
    id: number;
    name: string;
  };
  customer_type?: {
    id: number;
    name: string;
  };
  route?: {
    id: number;
    name: string;
  };
  details?: DeliveryDetail[];
}


export default function OrderAddEditPage() {
  const { warehouseOptions, agentCustomerOptions, companyCustomersOptions,itemOptions, fetchAgentCustomerOptions ,routeOptions} = useAllDropdownListData();
  const { showSnackbar } = useSnackbar();
  const { setLoading } = useLoading();
  const router = useRouter();
  const params = useParams();
  
  const uuid = params?.uuid as string | undefined;
  const isEditMode = uuid !== undefined && uuid !== "add";
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    warehouse: "",
    customer: "",
    customer_type: "",
    route: "",
  });
  const goodOptions = [{ label: "Near By Expiry", value: "0" },
                      { label: "Package Issue", value: "1" },
                      { label: "Not Saleable", value: "2" },];
  const badOptions = [{ label: "Damage", value: "0" },
                      { label: "Expiry", value: "1" },
                      ];

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Store UOM options for each row
  const [rowUomOptions, setRowUomOptions] = useState<Record<string, { value: string; label: string; price?: string }[]>>({});

  const [itemData, setItemData] = useState([
    {
      item_id: "",
      itemName: "",
      UOM: "",
      uom_id: "",
      Quantity: "1",
      return_type: "",
      return_reason: "",
    },
  ]);

  // Fetch delivery data in edit mode
  useEffect(() => {
    if (isEditMode && uuid && itemOptions.length > 0) {
      (async () => {
        try {
          setLoading(true);
          const response = await deliveryByUuid(uuid);
          const data = (response?.data ?? response) as DeliveryResponse;
          
          // Set form data
          setForm({
            warehouse: data?.warehouse?.id ? String(data.warehouse.id) : "",
            customer: data?.customer?.id ? String(data.customer.id) : "",
            customer_type: data?.customer_type?.id ? String(data.customer_type?.id) : "",
            route: data?.route?.id ? String(data.route?.id) : "",
          });
          
          if (data?.warehouse?.id) {
            await fetchAgentCustomerOptions(String(data.warehouse.id));
          }
          
          if (data?.details && Array.isArray(data.details) && data.details.length > 0) {
            const loadedItemData = data.details.map((detail: DeliveryDetail, index: number) => {
              const itemId = detail.item?.id ? String(detail.item.id) : "";
              const uomId = detail.uom_id ? String(detail.uom_id) : "";
              const rowIdx = index.toString();
              
              const selectedItem = itemOptions.find(item => item.value === itemId);
              if (selectedItem && selectedItem.uoms && selectedItem.uoms.length > 0) {
                const uomOpts = selectedItem.uoms.map(uom => ({
                  value: uom.id || "",
                  label: uom.name || "",
                  price: uom.price || "0"
                }));
                
                setRowUomOptions(prev => ({
                  ...prev,
                  [rowIdx]: uomOpts
                }));
              }
              
             
              
              return {
                item_id: itemId,
                itemName: itemId,
                UOM: uomId,
                uom_id: uomId,
                Quantity: (detail?.quantity ?? 1).toString(),
               return_type: detail?.return_type || "",
               return_reason: detail?.return_reason || "",
              };
            });
            
            setItemData(loadedItemData);
          }
        } catch (error) {
          console.error("Error fetching delivery data:", error);
          
          // Extract error message from API response
          let errorMessage = "Failed to fetch delivery details";
          
          if (error && typeof error === 'object') {
            // Check for error message in response
            if ('response' in error && error.response && typeof error.response === 'object') {
              const response = error.response as { data?: { message?: string } };
              if (response.data?.message) {
                errorMessage = response.data.message;
              }
            } else if ('data' in error && error.data && typeof error.data === 'object') {
              const data = error.data as { message?: string };
              if (data.message) {
                errorMessage = data.message;
              }
            } else if ('message' in error && typeof error.message === 'string') {
              errorMessage = error.message;
            }
          }
          
          showSnackbar(errorMessage, "error");
        } finally {
          setLoading(false);
        }
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, uuid ?? ""]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Validation schema
  const validationSchema = yup.object().shape({
    warehouse: yup.string().required("Warehouse is required"),
    customer: yup.string().required("Customer is required"),
    customer_type: yup.string().required("Customer Typa is required"),
    route: yup.string().required("Route is required"),
  });

  // --- Calculate totals and VAT dynamically
  const recalculateItem = (index: number, field: string, value: string) => {
    const newData = [...itemData];
    const item = newData[index];
    item[field as keyof typeof item] = value;
    setItemData(newData);
  };

  const handleAddNewItem = () => {
    setItemData([
      ...itemData,
      {
        item_id: "",
        itemName: "",
        UOM: "",
        uom_id: "",
        Quantity: "1",
        return_type: "",
        return_reason: "",
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (itemData.length <= 1) {
      setItemData([
        {
          item_id: "",
          itemName: "",
          UOM: "",
          uom_id: "",
          Quantity: "1",
            return_type: "",
            return_reason: "",
        },
      ]);
      return;
    }
    setItemData(itemData.filter((_, i) => i !== index));
  };

 

  // --- Create Payload for API
  const generatePayload = () => {
    return {
      warehouse_id: Number(form.warehouse),
      customer_id: Number(form.customer),
      customer_type: Number(form.customer_type),
      route_id: Number(form.route),
      details: itemData
        .filter(item => item.item_id && item.uom_id) // Only include rows with item and UOM selected
        .map((item) => ({
          item_id: Number(item.item_id),
          uom_id: Number(item.uom_id),
          quantity: Number(item.Quantity) || 0,
            return_type: item.return_type,
            return_reason: item.return_reason,
        })),
    };
  };

  // --- On Submit
  const handleSubmit = async () => {
    if (isSubmitting) return; // Prevent multiple submissions
    
    try {
      // Validate form using yup schema
      await validationSchema.validate(form, { abortEarly: false });
      setErrors({});

      // Validate that at least one item is added
      const validItems = itemData.filter(item => item.item_id && item.uom_id);
      if (validItems.length === 0) {
        showSnackbar("Please add at least one item with UOM selected", "error");
        return;
      }

      setIsSubmitting(true);
      const payload = generatePayload();
      
      let res;
      if (isEditMode && uuid) {
        // Update existing delivery
        res = await updateDelivery(uuid, payload);
      } else {
        // Create new delivery
        res = await createReturn(payload);
      }
      
      // Check if response contains an error
      if (res?.error) {
        showSnackbar(
          res.data?.message || (isEditMode ? "Failed to update delivery" : "Failed to create delivery"),
          "error"
        );
        setIsSubmitting(false);
        return;
      }
      
      // Success
      showSnackbar(
        isEditMode 
          ? "Return updated successfully!" 
          : "Return created successfully!", 
        "success"
      );
      router.push("/return");
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        // Handle yup validation errors
        const formErrors: Record<string, string> = {};
        error.inner.forEach((err) => {
          if (err.path) {
            formErrors[err.path] = err.message;
          }
        });
        setErrors(formErrors);
      } else {
        console.error("Error saving delivery:", error);
        
        // Extract error message from API response (similar to agentCustomer)
        let errorMessage = isEditMode 
          ? "Failed to update delivery. Please try again." 
          : "Failed to create delivery. Please try again.";
        
        if (error && typeof error === 'object') {
          // Check for error message in response
          if ('response' in error && error.response && typeof error.response === 'object') {
            const response = error.response as { data?: { message?: string } };
            if (response.data?.message) {
              errorMessage = response.data.message;
            }
          } else if ('data' in error && error.data && typeof error.data === 'object') {
            const data = error.data as { message?: string };
            if (data.message) {
              errorMessage = data.message;
            }
          } else if ('message' in error && typeof error.message === 'string') {
            errorMessage = error.message;
          }
        }
        
        showSnackbar(errorMessage, "error");
      }
    } finally {
      setIsSubmitting(false);
    }
  };



  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-[20px]">
        <div className="flex items-center gap-[16px]">
          <Icon
            icon="lucide:arrow-left"
            width={24}
            onClick={() => router.back()}
          />
          <h1 className="text-[20px] font-semibold text-[#181D27] flex items-center leading-[30px] mb-[4px]">
            {isEditMode ? "Update Return" : "Add Return"}
          </h1>
        </div>
      </div>

      <ContainerCard className="rounded-[10px] scrollbar-none">
        {/* --- Header Section --- */}
        <div className="flex justify-between mb-10 flex-wrap gap-[20px]">
          <div className="flex flex-col gap-[10px]">
            <Logo type="full" />
            <span className="text-primary font-normal text-[16px]">
              Emma-Köhler-Allee 4c, Germering - 13907
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[42px] uppercase text-[#A4A7AE] mb-[10px]">
              Return
            </span>
            <span className="text-primary text-[14px] tracking-[10px]">
              #W1O20933
            </span>
          </div>
        </div>
        <hr className="w-full text-[#D5D7DA]" />

        {/* --- Form Fields --- */}
        <div className="flex flex-col sm:flex-row gap-4 mt-10 mb-10 flex-wrap">
            <InputFields
              label="Customer Type"
              required
              name="customer_type"
              value={form.customer_type}
              options={[
                { label: "Agent Customer", value: "0" },
                { label: "Company Customer", value: "1" },
              ]}
              onChange={(e) => {
                const val = e.target.value;
                handleChange(e);
               
               
              }}
              error={errors.customer_type}
            />
            <InputFields
              label="Warehouse"
              required
              name="warehouse"
              value={form.warehouse}
              options={warehouseOptions}
              searchable={true}
              onChange={
                handleChange
                
              }
              error={errors.warehouse}
            />
            
            <InputFields
              required
              label="Customer"
              name="customer"
              searchable={true}
              value={form.customer}
              options={form.customer_type === "0" ? agentCustomerOptions : companyCustomersOptions}
              onChange={handleChange}
              error={errors.customer}
            />
            <InputFields
              required
              label="Route"
              name="route"
              value={form.route}
              options={routeOptions}
              onChange={handleChange}
              error={errors.route}
            />
            
           
           
</div>
        {/* --- Table --- */}
        <Table
          data={itemData.map((row, idx) => ({ ...row, idx: idx.toString() }))}
          config={{
            columns: [
              {
                key: "itemName",
                label: "Item Name",
                 width: 390,
                render: (row) => (
                  <div style={{ minWidth: '390px', maxWidth: '390px' }}>
                  <InputFields
                    label=""
                    name="itemName"
                    searchable={true}
                    options={itemOptions}
                    value={row.item_id}
                    onChange={(e) => {
                      const selectedItemId = e.target.value;
                      const newData = [...itemData];
                      const index = Number(row.idx);
                      newData[index].item_id = selectedItemId;
                      newData[index].itemName = selectedItemId;
                      
                      // Find selected item and set UOM options
                      const selectedItem = itemOptions.find(item => item.value === selectedItemId);
                      if (selectedItem && selectedItem.uoms && selectedItem.uoms.length > 0) {
                        const uomOpts = selectedItem.uoms.map(uom => ({
                          value: uom.id || "",
                          label: uom.name || "",
                          price: uom.price || "0"
                        }));
                        
                        setRowUomOptions(prev => ({
                          ...prev,
                          [row.idx]: uomOpts
                        }));
                        
                        // Auto-select first UOM
                        const firstUom = uomOpts[0];
                        if (firstUom) {
                          newData[index].uom_id = firstUom.value;
                          newData[index].UOM = firstUom.value;
                        }
                      } else {
                        setRowUomOptions(prev => {
                          const newOpts = { ...prev };
                          delete newOpts[row.idx];
                          return newOpts;
                        });
                        newData[index].uom_id = "";
                        newData[index].UOM = "";
                      }
                      
                      setItemData(newData);
                      recalculateItem(index, "itemName", selectedItemId);
                    }}
                  />
                  </div>
                ),
              },
              {
                key: "UOM",
                label: "UOM",
                width: 120,
                render: (row) => {
                  const uomOptions = rowUomOptions[row.idx] || [];
                  return (
                    <div style={{ minWidth: '120px', maxWidth: '120px' }}>  
                    <InputFields
                      label=""
                      name="UOM"
                      options={uomOptions}
                      value={row.uom_id}
                      disabled={uomOptions.length === 0}
                      onChange={(e) => {
                        const selectedUomId = e.target.value;
                        const selectedUom = uomOptions.find(uom => uom.value === selectedUomId);
                        const newData = [...itemData];
                        const index = Number(row.idx);
                        newData[index].uom_id = selectedUomId;
                        newData[index].UOM = selectedUomId;
                        
                        setItemData(newData);
                        recalculateItem(index, "UOM", selectedUomId);
                      }}
                    />
                    </div>
                  );
                },
              },
              {
                key: "Quantity",
                label: "Qty",
                width: 100,
                render: (row) => (
                  <div style={{ minWidth: '100px', maxWidth: '100px' }}>  
                  <InputFields
                    label=""
                    type="number"
                    name="Quantity"
                    value={row.Quantity}
                    onChange={(e) => {
                        const value = e.target.value;
                        const numValue = parseFloat(value);
                        if (value === "") {
                          recalculateItem(Number(row.idx), "Quantity", value);
                        } else if (numValue <= 0) {
                          recalculateItem(Number(row.idx), "Quantity", "1");
                        } else {
                          recalculateItem(Number(row.idx), "Quantity", value);
                        }
                      }}
                    // onChange={(e) =>
                    //   recalculateItem(Number(row.idx), "Quantity", e.target.value)
                    // }
                  />
                  </div>
                ),
              },
              {
                key: "return_type",
                label: "Return Type",
                width: 100,
                render: (row) => (
                  <div style={{ minWidth: '100px', maxWidth: '100px' }}>
                    <InputFields
                      label=""
                      name="return_type"
                      value={row.return_type}
                      options={[
                        { label: "Good", value: "1" },
                        { label: "Bad", value: "2" },
                      ]}
                      disabled={!row.item_id}
                      onChange={(e) => {
                        const value = e.target.value;
                        const newData = [...itemData];
                        const index = Number(row.idx);
                        newData[index].return_type = value;
                        // Reset return_reason when type changes
                        newData[index].return_reason = "";
                        setItemData(newData);
                      }}
                    />
                  </div>
                ),
              },
              {
                key: "return_reason",
                label: "Return Reason",
                width: 200,
                render: (row) => {
                  const options = row.return_type === "1" ? goodOptions : row.return_type === "2" ? badOptions : [];
                  return (
                    <div style={{ minWidth: '200px', maxWidth: '200px' }}>
                      <InputFields
                        label=""
                        name="return_reason"
                        value={row.return_reason}
                        options={options}
                        disabled={!row.return_type}
                        onChange={(e) => {
                          const value = e.target.value;
                          const newData = [...itemData];
                          const index = Number(row.idx);
                          newData[index].return_reason = value;
                          setItemData(newData);
                        }}
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
                    className={`${
                      itemData.length <= 1
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
          }}
        />

        {/* --- Add New Item --- */}
        <div className="mt-4">
          <button
            type="button"
            className="text-[#E53935] font-medium text-[16px] flex items-center gap-2"
            onClick={handleAddNewItem}
          >
            <Icon icon="material-symbols:add-circle-outline" width={20} />
            Add New Item
          </button>
        </div>

       

        {/* --- Buttons --- */}
        <div className="flex justify-end gap-4 mt-6">
          <button
            type="button"
            className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
            onClick={() => router.push("/return")}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <SidebarBtn 
            isActive={!isSubmitting} 
            label={
              isSubmitting 
                ? (isEditMode ? "Updating Return..." : "Creating Return...") 
                : (isEditMode ? "Update Return" : "Create Return")
            } 
            onClick={handleSubmit} 
          />
        </div>
      </ContainerCard>
    </div>
  );
}
