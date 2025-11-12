"use client";

import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import InputFields from "@/app/components/inputFields";
import IconButton from "@/app/components/iconButton";
import SettingPopUp from "@/app/components/settingPopUp";
import {
  createItemCategory,
  updateItemCategory,
  genearateCode,
  saveFinalCode,
} from "@/app/services/allApi";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useFormik } from "formik";
import * as Yup from "yup";
import { categoryType } from "./page";
import { useState, useRef, useEffect } from "react";

export default function CreateUpdate({

    type,
    updateItemCategoryData,
    onClose,
    onRefresh
}: {
  type: "create" | "update";
  updateItemCategoryData?: categoryType;
  onClose: () => void;
  onRefresh: () => void;
}) {
  const { showSnackbar } = useSnackbar();

    // Code logic
    const [isOpen, setIsOpen] = useState(false);
    const [codeMode, setCodeMode] = useState<'auto' | 'manual'>('auto');
    const [prefix, setPrefix] = useState('');
    const codeGeneratedRef = useRef(false);
    const [code, setCode] = useState("");

  const formik = useFormik({
    initialValues: {
      categoryName: updateItemCategoryData?.category_name || "",
      status: updateItemCategoryData?.status || 0,
      category_code: updateItemCategoryData?.category_code || "",
    },
    validationSchema: Yup.object({
      categoryName: Yup.string()
        .required("Category Name is required")
        .min(2, "Category Name must be at least 2 characters")
        .max(50, "Category Name cannot exceed 50 characters"),
      status: Yup.number()
        .oneOf([0, 1], "Status must be either 0 or 1")
        .required("Status is required"),
      category_code: Yup.string().required("Code is required"),
    }),
    validateOnChange: false, // ✅ prevent showing errors without interaction
    validateOnBlur: false,
    onSubmit: async (values) => {
      if (type === "create") {
        const res = await createItemCategory(
          values.categoryName,
          values.status as 0 | 1
        );

        if (res.error) return showSnackbar(res.data.message, "error");
        else {
          await saveFinalCode({
            reserved_code: values.category_code,
            model_name: "item_categories",
          });
          showSnackbar(
            res.message || "Item Category Created Successfully",
            "success"
          );
          onClose();
          onRefresh();
        }
      }

      if (type === "update") {
        const payload: { category_name?: string; status?: 0 | 1 } = {};

        if (
          values.categoryName !== updateItemCategoryData?.category_name
        ) {
          payload.category_name = values.categoryName;
        }

        if (values.status !== updateItemCategoryData?.status) {
          payload.status = values.status as 0 | 1;
        }

        if (Object.keys(payload).length > 0) {
          const res = await updateItemCategory(
            updateItemCategoryData?.id || 0,
            values.categoryName,
            values.status as 0 | 1
          );

          if (res.error)
            return showSnackbar(res.data.message, "error");
          else {
            showSnackbar(
              res.message || "Item Category Updated Successfully",
              "success"
            );
            onClose();
            onRefresh();
          }
        }
      }
    },
  });

  // Auto-generate code (create mode only)
  useEffect(() => {
    if (type === "create" && !codeGeneratedRef.current) {
      codeGeneratedRef.current = true;
      (async () => {
        const res = await genearateCode({ model_name: "item_categories" });
        if (res?.code) {
          setCode(res.code);
          formik.setFieldValue("category_code", res.code);
        }
        if (res?.prefix) {
          setPrefix(res.prefix);
        } else if (res?.code) {
          const match = res.prefix;
          if (match) setPrefix(prefix);
        }
      })();
    }
  }, [type]);

    return (
        <div>
            <h1 className="text-[20px] font-medium">
                {type === "create"
                    ? "Create Item Category"
                    : "Update Item Category"}
            </h1>
            <form
                onSubmit={formik.handleSubmit}
                className="mt-[20px] space-y-5"
            >
                {type === "update" && (
                    <>
                        <InputFields
                            value={updateItemCategoryData?.id?.toString() || ""}
                            label="Category Id"
                            disabled={true}
                            onChange={() => { }}
                        />
                    </>
                )}

                {/* Item Category Code (auto-generated, disabled, with settings icon/popup) */}
                <div className="flex items-start gap-2 max-w-[406px]">
                    <InputFields
                        label="Item Category Code"
                        name="category_code"
                        value={formik.values.category_code}
                        onChange={formik.handleChange}
                        disabled={codeMode === 'auto'}
                        error={formik.touched?.category_code && formik.errors?.category_code}
                    />
                    <IconButton
                        bgClass="white"
                        className="  cursor-pointer text-[#252B37] pt-12"
                        icon="mi:settings"
                        onClick={() => setIsOpen(true)}
                    />
                    <SettingPopUp
                        isOpen={isOpen}
                        onClose={() => setIsOpen(false)}
                        title="Item Category Code"
                        prefix={prefix}
                        setPrefix={setPrefix}
                        onSave={(mode, code) => {
                            setCodeMode(mode);
                            if (mode === 'auto' && code) {
                                formik.setFieldValue('category_code', code);
                            } else if (mode === 'manual') {
                                formik.setFieldValue('category_code', '');
                            }
                        }}
                    />
                </div>

                <div>
                    <div>
                        <InputFields
                            required
                            id="categoryName"
                            name="categoryName"
                            value={formik.values.categoryName}
                            label="Category Name"
                            error={formik.errors.categoryName}
                            onChange={formik.handleChange}
                        />
                        {formik.touched.categoryName && formik.errors.categoryName && (
                            <span className="text-xs text-red-500">
                                {formik.errors.categoryName}
                            </span>
                        )}
                    </div>

                </div>

                <InputFields
                    required
                    label="Status"
                    name="status"
                    value={String(formik.values.status)}
                    options={[
                        { value: "1", label: "Active" },
                        { value: "0", label: "Inactive" },
                    ]}
                    onChange={(e) => formik.setFieldValue("status", e.target.value)}
                    type="radio"
                    error={
                        formik.touched.status && formik.errors.status
                            ? formik.errors.status
                            : false
                    }
                />
                {formik.touched.status && formik.errors.status ? (
                    <span className="text-xs text-red-500">{formik.errors.status}</span>
                ) : null}

        {/* Action Buttons */}
        <div className="flex justify-between gap-[8px] mt-[50px]">
          <div></div>
          <div className="flex gap-[8px]">
            <SidebarBtn
              isActive={false}
              buttonTw="h-10"
              label="Cancel"
              labelTw="px-[20px]"
              onClick={onClose}
            />
            <SidebarBtn
              isActive={true}
              buttonTw="h-10"
              type="submit"
              disabled={!formik.isValid}
              label="Submit"
              labelTw="px-[20px]"
            />
          </div>
        </div>
      </form>
    </div>
  );
}
