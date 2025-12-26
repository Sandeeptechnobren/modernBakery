"use client";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import IconButton from "@/app/components/iconButton";
import InputFields from "@/app/components/inputFields";
import Loading from "@/app/components/Loading";
import SettingPopUp from "@/app/components/settingPopUp";
import {
    addModelStock,
    modelStockById,
    updateModelStock,
} from "@/app/services/merchandiserApi";
import { useSnackbar } from "@/app/services/snackbarContext";
import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import * as yup from "yup";

export default function AddEditRoute() {
    const { routeTypeOptions, itemOptions, shelvesOptions, ensureRouteTypeLoaded, ensureItemLoaded, ensureShelvesLoaded } =
        useAllDropdownListData();
    const router = useRouter();
    const { showSnackbar } = useSnackbar();
    const params = useParams();
    const routeId = params?.uuid as string | undefined;
    const isEditMode = routeId !== undefined && routeId !== "add";

    const [isOpen, setIsOpen] = useState(false);
    const [codeMode, setCodeMode] = useState<"auto" | "manual">("auto");
    const [prefix, setPrefix] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [filteredOptions, setFilteredRouteOptions] = useState<
        { value: string; label: string }[]
    >([]);
    const [form, setForm] = useState({
        shelf_id: "",
        product_id: "",
        capacity: "",
        total_no_of_fatching: "",
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [skeleton, setSkeleton] = useState(false);

    // Fetch route details in edit mode
    useEffect(() => {
        if (isEditMode && routeId) {
            setLoading(true);
            (async () => {
                try {
                    const res = await modelStockById(String(routeId));
                    const data = res?.data ?? res;
                    setForm({
                        shelf_id: data?.shelf?.id.toString() || "",
                        product_id: data?.item?.id.toString() || "",
                        capacity: data?.capacity || "",
                        total_no_of_fatching: data?.total_no_of_fatching || "",
                    });


                } catch (err) {
                    showSnackbar("Failed to fetch route details", "error");
                } finally {
                    setLoading(false);
                }
            })();
        }
    }, [isEditMode, routeId]);

    useEffect(() => {
        ensureRouteTypeLoaded();
        ensureItemLoaded();
        ensureShelvesLoaded();
    }, []);

    // Validation schema
    const validationSchema = yup.object().shape({
        shelf_id: yup.string().required("Shelf ID is required"),
        product_id: yup
            .string()
            .required("Product ID is required"),

        capacity: yup.string().required("Capacity is required"),
        total_no_of_fatching: yup.string().required("Total No of Fatching is required"),
    });

    const handleChange = (field: string, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
    };

    const handleSubmit = async () => {
        try {
            await validationSchema.validate(form, { abortEarly: false });
            setErrors({});
            setSubmitting(true);

            const payload = {
                shelf_id: form.shelf_id,
                product_id: form.product_id,
                capacity: form.capacity,
                total_no_of_fatching: form.total_no_of_fatching,
            };

            let res;
            if (isEditMode && routeId) {
                res = await updateModelStock(routeId, payload);
            } else {
                res = await addModelStock(payload);
            }

            if (res?.error) {
                showSnackbar(res.data?.message || "Failed to submit form", "error");
            } else {
                showSnackbar(
                    isEditMode ? "Model Stock updated successfully" : "Model Stock added successfully",
                    "success"
                );
                router.back();
            }
        } catch (err) {
            if (err instanceof yup.ValidationError) {
                const formErrors: Record<string, string> = {};
                err.inner.forEach((e) => {
                    if (e.path) formErrors[e.path] = e.message;
                });
                setErrors(formErrors);
                // showSnackbar("Please fix validation errors before submitting", "error");
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

    if ((isEditMode && loading) || !itemOptions || !routeTypeOptions) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <Loading />
            </div>
        );
    }

    return (
        <>
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="flex items-center"
                    >
                        <Icon icon="lucide:arrow-left" width={24} />
                    </button>

                    <h1 className="text-xl font-semibold text-gray-900">
                        {isEditMode ? "Update Model Stock" : "Add Model Stock"}
                    </h1>
                </div>
            </div>

            {/* Content */}
            <div className="bg-white rounded-2xl shadow divide-y divide-gray-200 mb-6">
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-800 mb-4">
                        Model Stock Details
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Route Name */}
                        <div className="flex flex-col">
                            <InputFields
                                required
                                label="Shelf"
                                value={form.shelf_id}
                                options={shelvesOptions}
                                onChange={(e) => handleChange("shelf_id", e.target.value)}
                            />
                            {errors.shelf_id && (
                                <p className="text-red-500 text-sm mt-1">{errors.shelf_id}</p>
                            )}
                        </div>

                        {/* Route Type */}
                        <div className="flex flex-col">
                            <InputFields
                                required
                                searchable
                                label="Item"
                                value={form.product_id}
                                onChange={(e) => handleChange("product_id", e.target.value)}
                                options={itemOptions}
                            />
                            {errors.product_id && (
                                <p className="text-red-500 text-sm mt-1">{errors.product_id}</p>
                            )}
                        </div>

                        {/* Capacity */}
                        <div className="flex flex-col">
                            <InputFields
                                required
                                label="Capacity"
                                value={form.capacity}
                                onChange={(e) => {
                                    handleChange("capacity", e.target.value);
                                }}
                            />
                            {errors.capacity && (
                                <p className="text-red-500 text-sm mt-1">{errors.capacity}</p>
                            )}
                        </div>

                        <div className="flex flex-col">
                            <InputFields
                                required
                                searchable={true}
                                label="Total Number of Shelves"
                                // isSingle={false}
                                value={form.total_no_of_fatching}
                                onChange={(e) => {
                                    handleChange("total_no_of_fatching", e.target.value);
                                }}
                            />
                            {errors.total_no_of_fatching && (
                                <p className="text-red-500 text-sm mt-1">{errors.total_no_of_fatching}</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-4 mt-6 pr-0">
                <button
                    type="button"
                    className={`px-6 py-2 rounded-lg border text-gray-700 hover:bg-gray-100 ${submitting
                        ? "bg-gray-100 border-gray-200 cursor-not-allowed text-gray-400"
                        : "border-gray-300"
                        }`}
                    onClick={() => router.back()}
                    disabled={submitting}
                // disable while submitting
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
