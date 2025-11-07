"use client";

import React, { Fragment, ChangeEvent, useState, useEffect, useCallback } from "react";
import ContainerCard from "@/app/components/containerCard";
import Table from "@/app/components/customTable";
import Logo from "@/app/components/logo";
import { Icon } from "@iconify-icon/react";
import { useRouter, useParams } from "next/navigation";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import KeyValueData from "@/app/components/keyValueData";
import InputFields from "@/app/components/inputFields";
import {warehouseListGlobalSearch} from "@/app/services/allApi";
import { createDelivery,deliveryByUuid,updateDelivery,agentOrderList } from "@/app/services/agentTransaction";
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
  item_price: string;
  quantity: number;
  vat: string;
  discount: string;
  excise?: string;
  gross_total: string;
  net_total: string;
  total: string;
}

interface DeliveryResponse {
  warehouse?: {
    id: number;
    code: string;
    name: string;
  };
  delivery?: {
    id: number;
    name: string;
  };
  comment?: string;
  details?: DeliveryDetail[];
}

interface WarehouseSearchResponse {
  id: number;
  uuid: string;
  warehouse_code?: string;
  warehouse_name?: string;
  code?: string;
  name?: string;
}

export default function OrderAddEditPage() {
  const { warehouseOptions, agentCustomerOptions, itemOptions, fetchAgentCustomerOptions } = useAllDropdownListData();
  const { showSnackbar } = useSnackbar();
  const { setLoading } = useLoading();
  const router = useRouter();
  const params = useParams();
  
  const uuid = params?.uuid as string | undefined;
  const isEditMode = uuid !== undefined && uuid !== "add";
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    warehouse: "",
    delivery: "",
    note: "",
    transactionType: "1",
    paymentTerms: "1",
    paymentTermsUnit: "1",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [searchedWarehouseOptions, setSearchedWarehouseOptions] = useState<Array<{value: string; label: string}>>([]);

  // Store UOM options for each row
  const [rowUomOptions, setRowUomOptions] = useState<Record<string, { value: string; label: string; price?: string }[]>>({});

  const [itemData, setItemData] = useState([
    {
      item_id: "",
      itemName: "",
      UOM: "",
      uom_id: "",
      Quantity: "1",
      Price: "",
      Excise: "",
      Discount: "",
      Net: "",
      Vat: "",
      Total: "",
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
            delivery: data?.delivery?.id ? String(data.delivery.id) : "",
            note: data?.comment || "",
            transactionType: "1",
            paymentTerms: "1",
            paymentTermsUnit: "1",
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
              
              // Find the price from the selected UOM
              const itemPrice = detail.item_price || "0";
              
              const qty = detail.quantity || 0;
              const price = parseFloat(itemPrice);
              const discount = parseFloat(detail.discount) || 0;
              const total = (qty * price) - discount;
              const vat = total * 0.18;
              const net = total - vat;
              
              return {
                item_id: itemId,
                itemName: itemId,
                UOM: uomId,
                uom_id: uomId,
                Quantity: String(qty),
                Price: (Number(price) || 0).toFixed(2),
                Excise: detail.excise || "0.00",
                Discount: (Number(discount) || 0).toFixed(2),
                Net: net.toFixed(2),
                Vat: vat.toFixed(2),
                Total: total.toFixed(2),
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

  // Handle warehouse search
  const handleWarehouseSearch = useCallback(async (searchText: string) => {
    try {
      const response = await warehouseListGlobalSearch({ query: searchText });
      
      // Transform API response to options format
      const options = response?.data?.map((warehouse: WarehouseSearchResponse) => ({
        uuid: warehouse.uuid,
        value: String(warehouse.id),
        label: warehouse.warehouse_code + " - " + warehouse.warehouse_name 
      })) || [];
      
      setSearchedWarehouseOptions(options);
    } catch (error) {
      console.error('Error fetching warehouses:', error);
      showSnackbar('Failed to search warehouses', 'error');
    } finally {
    }
  }, [showSnackbar]); // Only recreate if showSnackbar changes

  // Validation schema
  const validationSchema = yup.object().shape({
    warehouse: yup.string().required("Warehouse is required"),
    delivery: yup.string().required("Delivery is required"),
  });

  // --- Calculate totals and VAT dynamically
  const recalculateItem = (index: number, field: string, value: string) => {
    const newData = [...itemData];
    const item = newData[index];
    item[field as keyof typeof item] = value;

    const qty = Number(item.Quantity) || 0;
    const price = Number(item.Price) || 0;
    const total = qty * price;
    const vat = total * 0.18; // 18% VAT
    const net = total - vat;

    item.Total = total.toFixed(2);
    item.Vat = vat.toFixed(2);
    item.Net = net.toFixed(2);

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
        Price: "",
        Excise: "",
        Discount: "",
        Net: "",
        Vat: "",
        Total: "",
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
          Price: "",
          Excise: "",
          Discount: "",
          Net: "",
          Vat: "",
          Total: "",
        },
      ]);
      return;
    }
    setItemData(itemData.filter((_, i) => i !== index));
  };

  // --- Compute totals for summary
  const grossTotal = itemData.reduce(
    (sum, item) => sum + Number(item.Total || 0),
    0
  );
  const totalVat = itemData.reduce(
    (sum, item) => sum + Number(item.Vat || 0),
    0
  );
  const netAmount = itemData.reduce(
    (sum, item) => sum + Number(item.Net || 0),
    0
  );
  const discount = itemData.reduce(
    (sum, item) => sum + Number(item.Discount || 0),
    0
  );
  const finalTotal = (totalVat + netAmount );

  // --- Create Payload for API
  const generatePayload = () => {
    return {
      warehouse_id: Number(form.warehouse),
      customer_id: Number(form.delivery),
      gross_total: Number(grossTotal.toFixed(2)),
      discount: Number(discount.toFixed(2)),
      vat: Number(totalVat.toFixed(2)),
      total: Number(finalTotal.toFixed(2)),
      comment: form.note || "",
      details: itemData
        .filter(item => item.item_id && item.uom_id) // Only include rows with item and UOM selected
        .map((item) => ({
          item_id: Number(item.item_id),
          uom_id: Number(item.uom_id),
          quantity: Number(item.Quantity) || 0,
          item_price: Number(item.Price) || 0,
          vat: Number(item.Vat) || 0,
          discount: Number(item.Discount) || 0,
          gross_total: Number(item.Total) || 0,
          net_total: Number(item.Net) || 0,
          total: Number(item.Total) || 0,
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
        res = await createDelivery(payload);
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
          ? "Delivery updated successfully!" 
          : "Delivery created successfully!", 
        "success"
      );
      router.push("/agentCustomerDelivery");
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

  const keyValueData = [
    { key: "Gross Total", value: `AED ${grossTotal.toFixed(2)}` },
    { key: "Discount", value: `AED ${discount.toFixed(2)}` },
    { key: "Net Total", value: `AED ${netAmount.toFixed(2)}` },
    { key: "VAT", value: `AED ${totalVat.toFixed(2)}` },
    { key: "Delivery Charges", value: "AED 0.00" },
  ];

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
            {isEditMode ? "Update Delivery" : "Add Delivery"}
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
              DELIVERY
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
              label="Warehouse"
              required
              name="warehouse"
              value={form.warehouse}
              options={searchedWarehouseOptions}
              searchable={true}
              onSearchChange={handleWarehouseSearch}
              onChange={(e) => {
                const val = e.target.value;
                handleChange(e);
                // Clear customer when warehouse changes
                setForm(prev => ({ ...prev, delivery: "" }));
                // Fetch customers for selected warehouse
                if (val) {
                  fetchAgentCustomerOptions(val);
                }
              }}
              error={errors.warehouse}
            />
            
            <InputFields
              required
              label="Delivery"
              name="delivery"
              searchable={true}
              value={form.delivery}
              options={agentCustomerOptions}
              onChange={handleChange}
              error={errors.delivery}
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
                          newData[index].Price = firstUom.price || "0";
                        }
                      } else {
                        setRowUomOptions(prev => {
                          const newOpts = { ...prev };
                          delete newOpts[row.idx];
                          return newOpts;
                        });
                        newData[index].uom_id = "";
                        newData[index].UOM = "";
                        newData[index].Price = "0";
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
                        if (selectedUom) {
                          newData[index].Price = selectedUom.price || "0";
                        }
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
                key: "Price",
                label: "Price",
                render: (row) => (
                  row.Price || "0.00"
                )
              },
              {
                key: "Discount",
                label: "Discount",
                render: (row) => (
                  row.Discount || "0.00"
                )
                
              },
              { key: "Net", label: "Net",render: (row) => (
                  row.Net || "0.00"
                ) },
              { key: "Vat", label: "VAT",render: (row) => (
                  row.Vat || "0.00"
                ) },
              { key: "Total", label: "Total" ,render: (row) => (
                  row.Total || "0.00"
                )},
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

        {/* --- Summary --- */}
        <div className="flex justify-between text-primary gap-0 mb-10">
          <div></div>
          <div className="flex justify-between flex-wrap w-full">
            <div className="flex flex-col justify-end gap-[20px] w-full lg:w-[400px]">
              <InputFields
                label="Note"
                type="textarea"
                name="note"
                placeholder="Enter Description"
                value={form.note}
                onChange={handleChange}
              />
            </div>

            <div className="flex flex-col gap-[10px] w-full lg:w-[350px] border-b-[1px] border-[#D5D7DA]">
              {keyValueData.map((item) => (
                <Fragment key={item.key}>
                  <KeyValueData data={[item]} />
                  <hr className="text-[#D5D7DA]" />
                </Fragment>
              ))}
              <div className="font-semibold text-[#181D27] text-[18px] flex justify-between mt-2 mb-2">
                <span>Total</span>
                <span>AED {finalTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* --- Buttons --- */}
        <hr className="text-[#D5D7DA]" />
        <div className="flex justify-end gap-4 mt-6">
          <button
            type="button"
            className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
            onClick={() => router.push("/agentCustomerDelivery")}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <SidebarBtn 
            isActive={!isSubmitting} 
            label={
              isSubmitting 
                ? (isEditMode ? "Updating Delivery..." : "Creating Delivery...") 
                : (isEditMode ? "Update Delivery" : "Create Delivery")
            } 
            onClick={handleSubmit} 
          />
        </div>
      </ContainerCard>
    </div>
  );
}
