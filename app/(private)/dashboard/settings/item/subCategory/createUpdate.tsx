"use client";

import Button from "@/app/components/customButton";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import InputDropdown from "@/app/components/inputDropdown";
import InputFields from "@/app/components/inputFields";
import {
    createItemSubCategory,
    itemCategoryList,
    updateItemSubCategory,
} from "@/app/services/allApi";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useFormik } from "formik";
import * as Yup from "yup";
import { subCategoryType } from "./page";
import { useEffect, useState } from "react";
import { categoryType } from "../category/page";

export default function CreateUpdate({
    type,
    updateItemCategoryData,
    onClose,
}: {
    type: "create" | "update";
    updateItemCategoryData?: subCategoryType;
    onClose: () => void;
}) {
    const { showSnackbar } = useSnackbar();
    const [categoryData, setCategoryData] = useState([] as categoryType[]);
    const [options, setOptions] = useState<{ value: string; label: string }[]>(
        []
    );

    useEffect(() => {
        const newOptions = categoryData.map((category) => {
            return {
                value: category.id.toString(),
                label: category.category_name,
            };
        });
        setOptions(newOptions);
    }, [categoryData]);

    const formik = useFormik({
        initialValues: {
            category_id: "0",
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
                    values.status as 0 | 1
                );
            }
            if (type === "update") {
                const payload: { sub_category_name?: string; status?: 0 | 1 } =
                    {};
                if (
                    values.sub_category_name !==
                    updateItemCategoryData?.sub_category_name
                ) {
                    payload.sub_category_name = values.sub_category_name;
                }

                if (values.status !== updateItemCategoryData?.status) {
                    payload.status = values.status as 0 | 1;
                }
                if (Object.keys(payload).length > 0) {
                    res = await updateItemSubCategory(
                        updateItemCategoryData?.id || 0,
                        values.sub_category_name,
                        values.status as 0 | 1
                    );
                    if (res?.code === 200) {
                        showSnackbar(
                            "Item Category Updated Successfully",
                            "success"
                        );
                        onClose();
                    }
                }
            }
            if (res.error) return showSnackbar(res.message, "error") 
            else {
                showSnackbar(type === "create" ? "Item Category Created Successfully" : "Item Category Updated Successfully", "success");
                onClose();
            }
        },
    });

    useEffect(() => {
        const fetchItemCategory = async () => {
            const listRes = await itemCategoryList();
            if(listRes.error) return showSnackbar(listRes.message, "error");
            setCategoryData(listRes);
        };

        fetchItemCategory();
    }, []);

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
                    label="Category"
                    defaultText="Select Category"
                    defaultOption={formik.values.status === 1 ? 0 : 1}
                    options={options}
                    onOptionSelect={(option) => {
                        formik.setFieldValue(
                            "category_id",
                            parseInt(option.value)
                        );
                    }}
                />

                <InputFields
                    id="sub_category_name"
                    name="sub_category_name"
                    value={formik.values.sub_category_name || ""}
                    label="Category Name"
                    error={formik.errors.sub_category_name}
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
