"use client";

import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import InputDropdown from "@/app/components/inputDropdown";
import InputFields from "@/app/components/inputFields";
import { createItemCategory, updateItemCategory } from "@/app/services/allApi";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useFormik } from "formik";
import * as Yup from "yup";
import { categoryType } from "./page";
import { useState } from "react";

export default function CreateUpdate({
    type,
    updateItemCategoryData,
    onClose,
    onRefresh
}: {
    type: "create" | "update";
    updateItemCategoryData?: categoryType;
    onClose: () => void;
    onRefresh: () => void
}) {
    const { showSnackbar } = useSnackbar();

    const formik = useFormik({
        initialValues: {
            categoryName: updateItemCategoryData?.category_name || "",
            status: updateItemCategoryData?.status || 0,
        },
        validationSchema: Yup.object({
            categoryName: Yup.string()
                .required("Category Name is required")
                .min(2, "Category Name must be at least 2 characters")
                .max(50, "Category Name cannot exceed 50 characters"),
            status: Yup.number()
                .oneOf([0, 1], "Status must be either 0 or 1")
                .required("Status is required"),
        }),
        onSubmit: async (values) => {
            if (type === "create") {
                const res = await createItemCategory(
                    values.categoryName,
                    values.status as 0 | 1
                );
                if (res.error) return showSnackbar(res.data.message, "error")
                else {
                    showSnackbar(res.message || "Item Category Created Successfully", "success");
                    onClose();
                    onRefresh();
                }
            }
            if (type === "update") {
                const payload: { category_name?: string; status?: 0 | 1 } = {};
                if (
                    values.categoryName !==
                    updateItemCategoryData?.category_name
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
                    if (res.error) return showSnackbar(res.data.message, "error");
                    else {
                        showSnackbar(res.message || "Item Category Updated Successfully", "success");
                        onClose();
                        onRefresh();
                    }
                }
            }
        },
    });

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
                            onChange={() => {}}
                        />
                    </>
                )}
                <InputFields
                    id="categoryName"
                    name="categoryName"
                    value={formik.values.categoryName}
                    label="Category Name"
                    error={formik.errors.categoryName}
                    onChange={formik.handleChange}
                />

                <InputDropdown
                    label="Status"
                    defaultText="Select Status"
                    defaultOption={formik.values.status === 1 ? 0 : 1}
                    options={[
                        { label: "Active", value: "1" },
                        { label: "Inactive", value: "0" },
                    ]}
                    onOptionSelect={(option) => {
                        formik.setFieldValue("status", parseInt(option.value));
                    }}
                />
                {formik.touched.status && formik.errors.status ? (
                    <span className="text-xs text-red-500">
                        {formik.errors.status}
                    </span>
                ) : null}

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