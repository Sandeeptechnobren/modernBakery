"use client";

import { useEffect, useState, useRef } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import Loading from "@/app/components/Loading";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import ContainerCard from "@/app/components/containerCard";
import InputFields from "@/app/components/inputFields";
import IconButton from "@/app/components/iconButton";
import SettingPopUp from "@/app/components/settingPopUp";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
import {
  addWarehouseStock,
  editWarehouseStock,
  getWarehouseStockById,
  genearateCode,
  saveFinalCode,
} from "@/app/services/allApi";
import { useSnackbar } from "@/app/services/snackbarContext";

interface WarehouseStockFormValues {
  warehouse_stock_code: string;
  warehouse_id: string;
  item_id: string;
  name?: string;
  status: string; // "active" | "inactive"
}

export default function AddWarehouseStockPage() {
  const { showSnackbar } = useSnackbar();
  const router = useRouter();
  const params = useParams();

  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const codeGeneratedRef = useRef(false);
  const { warehouseOptions, itemOptions } = useAllDropdownListData();

  // ✅ Formik setup
  const formik = useFormik<WarehouseStockFormValues>({
    initialValues: {
      warehouse_stock_code: "",
      warehouse_id: "",
      item_id: "",
      name: "",
      status: "active",
    },
    validationSchema: Yup.object({
      warehouse_stock_code: Yup.string().required("Warehouse Stock Code is required"),
      warehouse_id: Yup.string().required("Warehouse is required"),
      item_id: Yup.string().required("Item is required"),
      status: Yup.string().required("Status is required"),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const payload = {
          warehouse_stock_code: values.warehouse_stock_code,
          warehouse_id: values.warehouse_id,
          item_id: values.item_id,
          name: values.name || "", // some APIs need a name field
          status: values.status === "active" ? "1" : "0",
        };

        let res;
        if (isEditMode && params?.uuid && params.uuid !== "add") {
          res = await editWarehouseStock(String(params.uuid), payload);
        } else {
          res = await addWarehouseStock(payload);
        }

        if (res?.error) {
          showSnackbar(res.data?.message || "Failed to submit form", "error");
        } else {
          showSnackbar(
            res.message ||
              (isEditMode
                ? "Warehouse Stock Updated Successfully"
                : "Warehouse Stock Created Successfully"),
            "success"
          );

          // Finalize the reserved code only after successful add
          if (!isEditMode || params?.uuid === "add") {
            try {
              await saveFinalCode({
                reserved_code: values.warehouse_stock_code,
                model_name: "warehouse_stock",
              });
            } catch (e) {
              console.error("Code finalization failed", e);
            }
          }

          router.push("/settings/warehouseStock");
        }
      } catch (error) {
        console.error(error);
        showSnackbar("Something went wrong", "error");
      } finally {
        setSubmitting(false);
      }
    },
  });

  // ✅ Load existing data for edit mode and generate code in add mode
  useEffect(() => {
    if (params?.uuid && params.uuid !== "add") {
      setIsEditMode(true);
      setLoading(true);
      (async () => {
        try {
          const res = await getWarehouseStockById(String(params.uuid));
          if (res?.data) {
            formik.setValues({
              warehouse_stock_code: res.data.osa_code || "",
              warehouse_id: res.data.warehouse?.id?.toString() || "",
              item_id: res.data.item?.id?.toString() || "",
              name: res.data.item?.name || "",
              status: res.data.status === 1 ? "active" : "inactive",
            });
          }
        } catch (error) {
          console.error("Failed to fetch Warehouse Stock", error);
        } finally {
          setLoading(false);
        }
      })();
    } else if (!isEditMode && !codeGeneratedRef.current) {
      codeGeneratedRef.current = true;
      (async () => {
        const res = await genearateCode({ model_name: "warehouse_stock" });
        if (res?.code) {
          formik.setFieldValue("warehouse_stock_code", res.code);
        }
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.uuid]);

  return (
    <>
      {/* Header */}
      <div className="flex justify-between items-center mb-[20px]">
        <div className="flex items-center gap-[16px]">
          <Link href="/settings/warehouseStock">
            <Icon icon="lucide:arrow-left" width={24} />
          </Link>
          <h1 className="text-[20px] font-semibold text-[#181D27] flex items-center leading-[30px] mb-[5px]">
            {isEditMode ? "Update Warehouse Stock" : "Add Warehouse Stock"}
          </h1>
        </div>
      </div>

      {/* Form */}
      {loading ? (
        <Loading />
      ) : (
        <form onSubmit={formik.handleSubmit}>
          <ContainerCard>
            <h2 className="text-lg font-semibold mb-6">Warehouse Stock Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Warehouse Stock Code */}
              <div className="flex items-start gap-2 max-w-[406px]">
                <InputFields
                  label="Warehouse Stock Code"
                  name="warehouse_stock_code"
                  value={formik.values.warehouse_stock_code}
                  onChange={formik.handleChange}
                  disabled
                  error={
                    formik.touched.warehouse_stock_code &&
                    formik.errors.warehouse_stock_code
                  }
                />
                {!isEditMode && (
                  <>
                    <IconButton
                      bgClass="white"
                      className="cursor-pointer text-[#252B37] pt-12"
                      icon="mi:settings"
                      onClick={() => setIsOpen(true)}
                    />
                    <SettingPopUp
                      isOpen={isOpen}
                      onClose={() => setIsOpen(false)}
                      title="Warehouse Stock Code"
                    />
                  </>
                )}
              </div>

              {/* Warehouse */}
              <InputFields
                type="select"
                name="warehouse_id"
                label="Warehouse"
                value={formik.values.warehouse_id}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                options={warehouseOptions}
                error={
                  formik.touched.warehouse_id && formik.errors.warehouse_id
                }
              />

              {/* Item */}
              <InputFields
                type="select"
                name="item_id"
                label="Item"
                value={formik.values.item_id}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                options={itemOptions}
                error={formik.touched.item_id && formik.errors.item_id}
              />

              {/* Status */}
              <InputFields
                type="radio"
                name="status"
                label="Status"
                value={formik.values.status}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.status && formik.errors.status}
                options={[
                  { value: "active", label: "Active" },
                  { value: "inactive", label: "Inactive" },
                ]}
              />
            </div>
          </ContainerCard>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              className="px-4 py-2 h-[40px] w-[80px] rounded-md font-semibold border border-gray-300 text-gray-700 hover:bg-gray-100"
              type="button"
              onClick={() => formik.resetForm()}
            >
              Cancel
            </button>

            <SidebarBtn
              label="Submit"
              isActive={true}
              leadingIcon="mdi:check"
              type="submit"
            />
          </div>
        </form>
      )}
    </>
  );
}
