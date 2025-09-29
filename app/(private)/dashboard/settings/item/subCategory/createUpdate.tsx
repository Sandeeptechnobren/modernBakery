"use client";

import Button from "@/app/components/customButton";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import InputDropdown from "@/app/components/inputDropdown";
import InputFields from "@/app/components/inputFields";
import {
    createItemSubCategory,
    updateItemSubCategory,
} from "@/app/services/allApi";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useFormik } from "formik";
import * as Yup from "yup";
import { subCategoryType } from "./page";
import { useEffect, useState } from "react";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";

export default function CreateUpdate({
    type,
    updateItemCategoryData,
    onClose,
    onRefresh
}: {
    type: "create" | "update";
    updateItemCategoryData?: subCategoryType;
    onClose: () => void;
    onRefresh: () => void
}) {
    const { showSnackbar } = useSnackbar();
    const { itemCategory } = useAllDropdownListData();
    const [options, setOptions] = useState<{ value: string; label: string }[]>([]);
    const [defaultOption, setDefaultOption] = useState<number | undefined>(undefined);

    useEffect(() => {
        const newOptions = itemCategory.map((category) => {
            return {
                value: category.id?.toString() || "",
                label: category.category_name || "",
            };
        });
        setOptions(newOptions);
        if(updateItemCategoryData) {
            const index = itemCategory.findIndex(
                (category) => category.id === updateItemCategoryData?.category_id
            );
            setDefaultOption(index);
        }
    }, [itemCategory]);

    const formik = useFormik({
        initialValues: {
            category_id: updateItemCategoryData?.category_id.toString() || "",
            sub_category_name: updateItemCategoryData?.sub_category_name || "",
            status: updateItemCategoryData?.status || 0,
        },
        validationSchema: Yup.object({
            category_id: Yup.number()
                .min(1, "Invalid Category")
                .required("Category Name is required"),
            sub_category_name: Yup.string()
                .required("Sub Category Name is required")
                .min(2, "Sub Category Name must be at least 2 characters")
                .max(50, "Sub Category Name cannot exceed 50 characters"),
            status: Yup.number()
                .oneOf([0, 1], "Status must be either Active or Inactive")
                .required("Status is required"),
        }),
        onSubmit: async (values) => {
            let res;
            if (type === "create") {
                res = await createItemSubCategory(
                    parseInt(values.category_id),
                    values.sub_category_name,
                    values.status === "1" ? 1 : 0
                );
            }
            if (type === "update") {
                res = await updateItemSubCategory(
                    parseInt(values.category_id),
                    updateItemCategoryData?.id || 0,
                    values.sub_category_name,
                    values.status === "1" ? 1 : 0
                );
            }
            if (res.error) showSnackbar(res.data.message, "error") 
            else {
                showSnackbar(res.message ? res.message : "Item Sub Category Created Successfully", "success");
                onClose();
                onRefresh();
            }
        },
    });

    return (
        <div>
            <h1 className="text-[20px] font-medium">
                {type === "create"
                    ? "Create Item Sub Category"
                    : "Update Item Sub Category"}
            </h1>
            <form
                onSubmit={formik.handleSubmit}
                className="mt-[20px] space-y-5"
            >
                <InputDropdown
                    label="Category Name"
                    defaultText="Select Category"
                    defaultOption={defaultOption}
                    options={options}
                    onOptionSelect={(option) => {
                        formik.setFieldValue(
                            "category_id",
                            option.value
                        );
                    }}
                />
                {formik.touched.category_id && formik.errors.category_id ? (
                    <span className="text-xs text-red-500">
                        {formik.errors.category_id}
                    </span>
                ) : null}

                <InputFields
                    id="sub_category_name"
                    name="sub_category_name"
                    value={formik.values.sub_category_name || ""}
                    label="Sub Category Name"
                    error={formik.touched.sub_category_name && formik.errors.sub_category_name}
                    onChange={formik.handleChange}
                />

                <InputDropdown
                    label="Status"
                    defaultText="Select Status"
                    dropdownTw="w-full h-[100px]"
                    defaultOption={formik.values.status === 1 ? 0 : 1}
                    options={[
                        { label: "Active", value: "1" },
                        { label: "Inactive", value: "0" },
                    ]}
                    onOptionSelect={(option) => {
                        formik.setFieldValue("status", option.value);
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
                            label="Cancel"
                            labelTw="px-[20px]"
                            onClick={onClose}
                        />
                        <Button type="submit" disabled={!formik.isValid}>
                            Save
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}