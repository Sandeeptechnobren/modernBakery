"use client";

import ContainerCard from "@/app/components/containerCard";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
import CustomTable, { TableDataType } from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import InputFields from "@/app/components/inputFields";
import Logo from "@/app/components/logo";
import {
  capsCollectionByUuid,
  createCapsCollection,
  updateCapsCollection,
} from "@/app/services/agentTransaction";
import { useLoading } from "@/app/services/loadingContext";
import { useSnackbar } from "@/app/services/snackbarContext";
import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import * as yup from "yup";

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

  const [rowUomOptions, setRowUomOptions] = useState<
    Record<string, { value: string; label: string; price?: string }[]>
  >({});

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
              Load
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
            <InputFields
              required
              label="Warehouse"
              value={form.warehouse}
              options={warehouseOptions}
              onChange={(e) => {
                const val = e.target.value;
                handleChange("warehouse", val);
                handleChange("customer", "");
                if (val) fetchAgentCustomerOptions(val);
              }}
            />
            {errors.warehouse && (
              <p className="text-red-500 text-sm mt-1">{errors.warehouse}</p>
            )}
          </div>

          <div>
            <InputFields
              required
              label="Customer"
              value={form.customer}
              options={agentCustomerOptions}
              onChange={(e) => {
                const val = e.target.value;
                handleChange("customer", val);
                const selected = agentCustomerOptions.find((opt) => opt.value === val);
                setCustomerContactNo(selected?.contact_no || "");
              }}
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

          <InputFields
            type="radio"
            label="Status"
            name="status"
            value={form.status}
            onChange={(e) => handleChange("status", e.target.value)}
            options={[
              { value: "1", label: "Active" },
              { value: "0", label: "Inactive" },
            ]}
          />
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
                  <InputFields
                    options={itemOptions}
                    value={row.item}
                    onChange={(e) => {
                      const val = e.target.value;
                      handleTableChange(row.id, "item", val);
                      const selectedItem = itemOptions.find((i) => i.value === val);
                      if (selectedItem?.uoms?.length) {
                        const uomOpts = selectedItem.uoms.map((u: any) => ({
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
            footer: { pagination: false },
          }}
        />

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
            label={isEditMode ? "Update" : "Create Order"}
            onClick={handleSubmit}
          />
        </div>
      </ContainerCard>
    </div>
  );
}
