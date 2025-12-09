"use client";

import { useRouter, useParams } from "next/navigation";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useSnackbar } from "@/app/services/snackbarContext";
import InputFields from "@/app/components/inputFields";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import { Icon } from "@iconify-icon/react";
import {
    addServiceTerritory,
    serviceTerritoryByUUID,
    getTechicianList,
    updateServiceTerritory,
} from "@/app/services/assetsApi";
import { useEffect, useRef, useState } from "react";
import { useLoading } from "@/app/services/loadingContext";
import { genearateCode, saveFinalCode } from "@/app/services/allApi";
import ContainerCard from "@/app/components/containerCard";
import Loading from "@/app/components/Loading";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";

// ✅ Validation Schema
const validationSchema = Yup.object().shape({
    osa_code: Yup.string().required("Code is required"),
    warehouse_id: Yup.number().required("Warehouse is required"),
    region_id: Yup.number().required("Region is required"),
    area_id: Yup.number().required("Area is required"),
    technician_id: Yup.number().required("Technician is required"),
});

export default function AddEditServiceTerritory() {
    const { showSnackbar } = useSnackbar();
    const { setLoading } = useLoading();
    const router = useRouter();
    const params = useParams();
    const { regionOptions, areaOptions, warehouseAllOptions } = useAllDropdownListData();

    // ✅ Safe UUID Extraction
    let uuid = "";
    if (params?.uuid) {
        uuid = Array.isArray(params.uuid) ? params.uuid[0] : params.uuid;
    }

    const isAddMode = uuid === "add" || !uuid;
    const isEditMode = !isAddMode;

    // ✅ Local State
    const [localLoading, setLocalLoading] = useState(false);
    const [technicianOptions, setTechnicianOptions] = useState<
        { value: string; label: string }[]
    >([]);
    const codeGeneratedRef = useRef(false);

    // ✅ Formik Setup
    const formik = useFormik({
        initialValues: {
            osa_code: "",
            warehouse_id: 0,
            region_id: 0,
            area_id: 0,
            technician_id: 0,
        },
        validationSchema,

        onSubmit: async (values, { setSubmitting, resetForm }) => {
            setLoading(true);

            // ✅ Base Payload (Shared)
            const basePayload = {
                warehouse_id: Number(values.warehouse_id),
                region_id: Number(values.region_id),
                area_id: Number(values.area_id),
                technician_id: Number(values.technician_id),
            };

            // ✅ Conditional Payload
            const payload = isEditMode
                ? basePayload // ✅ Edit → No osa_code
                : { ...basePayload, osa_code: values.osa_code }; // ✅ Add → With osa_code

            try {
                const res = isEditMode
                    ? await updateServiceTerritory(uuid, payload)
                    : await addServiceTerritory(payload);

                if (res?.error) {
                    showSnackbar(res?.data?.message || "Failed to save Service Territory", "error");
                } else {
                    showSnackbar(
                        res?.message ||
                        (isEditMode
                            ? "Service Territory updated successfully"
                            : "Service Territory added successfully"),
                        "success"
                    );

                    // ✅ Save Code Only in ADD Mode
                    if (!isEditMode) {
                        try {
                            await saveFinalCode({
                                reserved_code: values.osa_code,
                                model_name: "service_territory",
                            });
                        } catch (e) {
                            console.warn("Code finalization failed:", e);
                        }
                    }

                    resetForm();
                    router.push("/serviceTerritory");
                }
            } catch (error) {
                showSnackbar("Something went wrong", "error");
            } finally {
                setSubmitting(false);
                setLoading(false);
            }
        },
    });

    // ✅ Fetch Technicians
    useEffect(() => {
        const fetchTechnicians = async () => {
            try {
                const response = await getTechicianList();
                const techData = response?.data?.data || response?.data || [];

                const options = techData.map((item: any) => ({
                    value: String(item.id),
                    label: `${item.osa_code} - ${item.name}`,
                }));

                setTechnicianOptions(options);
            } catch {
                showSnackbar("Failed to fetch technician data", "error");
            }
        };

        fetchTechnicians();
    }, [showSnackbar]);

    // ✅ Load Edit Data OR Generate Code
    useEffect(() => {
        const fetchDataOrGenerate = async () => {
            if (isEditMode && uuid) {
                setLocalLoading(true);
                try {
                    const res = await serviceTerritoryByUUID(uuid);
                    if (res?.data) {
                        formik.setValues({
                            osa_code: res.data.osa_code || "",
                            warehouse_id: res.data.warehouse_id || 0,
                            region_id: res.data.region_id || 0,
                            area_id: res.data.area_id || 0,
                            technician_id: res.data.technician?.id || 0,
                        });
                    }
                } catch {
                    showSnackbar("Failed to fetch service territory details", "error");
                } finally {
                    setLocalLoading(false);
                }
            } else if (isAddMode && !codeGeneratedRef.current) {
                codeGeneratedRef.current = true;
                try {
                    const res = await genearateCode({ model_name: "service_territory" });
                    if (res?.code) {
                        formik.setFieldValue("osa_code", res.code);
                    }
                } catch {
                    showSnackbar("Failed to generate service territory code", "error");
                }
            }
        };

        fetchDataOrGenerate();
    }, [uuid]);

    // ✅ UI
    return (
        <div className="p-6">
            <div className="flex items-center gap-4 mb-6">
                <div onClick={() => router.back()} className="cursor-pointer">
                    <Icon icon="lucide:arrow-left" width={24} />
                </div>
                <h1 className="text-xl font-semibold">
                    {isEditMode ? "Update Service Territory" : "Add Service Territory"}
                </h1>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
                {localLoading ? (
                    <Loading />
                ) : (
                    <form onSubmit={formik.handleSubmit}>
                        <div>
                            <h2 className="text-lg font-semibold mb-6">
                                Service Territory Details
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                {/* ST Code */}
                                <InputFields
                                    label="ST Code"
                                    name="osa_code"
                                    value={formik.values.osa_code}
                                    onChange={formik.handleChange}
                                    disabled={isEditMode}
                                    error={
                                        formik.touched.osa_code && formik.errors.osa_code
                                            ? formik.errors.osa_code
                                            : ""
                                    }
                                />

                                {/* Region */}
                                <InputFields
                                    label="Region"
                                    name="region_id"
                                    value={String(formik.values.region_id)}
                                    onChange={(e) =>
                                        formik.setFieldValue(
                                            "region_id",
                                            Number(e.target.value)
                                        )
                                    }
                                    options={regionOptions}
                                    error={
                                        formik.touched.region_id && formik.errors.region_id
                                            ? String(formik.errors.region_id)
                                            : ""
                                    }
                                />

                                {/* Area */}
                                <InputFields
                                    label="Area"
                                    name="area_id"
                                    value={String(formik.values.area_id)}
                                    onChange={(e) =>
                                        formik.setFieldValue(
                                            "area_id",
                                            Number(e.target.value)
                                        )
                                    }
                                    options={areaOptions}
                                    error={
                                        formik.touched.area_id && formik.errors.area_id
                                            ? String(formik.errors.area_id)
                                            : ""
                                    }
                                />

                                {/* Warehouse */}
                                <InputFields
                                    label="Warehouse"
                                    name="warehouse_id"
                                    value={String(formik.values.warehouse_id)}
                                    onChange={(e) =>
                                        formik.setFieldValue(
                                            "warehouse_id",
                                            Number(e.target.value)
                                        )
                                    }
                                    options={warehouseAllOptions}
                                    error={
                                        formik.touched.warehouse_id &&
                                            formik.errors.warehouse_id
                                            ? String(formik.errors.warehouse_id)
                                            : ""
                                    }
                                />

                                {/* Technician */}
                                <InputFields
                                    label="Technician"
                                    name="technician_id"
                                    value={String(formik.values.technician_id)}
                                    onChange={(e) =>
                                        formik.setFieldValue(
                                            "technician_id",
                                            Number(e.target.value)
                                        )
                                    }
                                    options={technicianOptions}
                                    error={
                                        formik.touched.technician_id &&
                                            formik.errors.technician_id
                                            ? String(formik.errors.technician_id)
                                            : ""
                                    }
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-4 mt-6">
                            <button
                                type="button"
                                className="px-4 py-2 border rounded-lg"
                                onClick={() => router.back()}
                            >
                                Cancel
                            </button>

                            <SidebarBtn
                                type="submit"
                                label={isEditMode ? "Update" : "Submit"}
                                isActive
                                leadingIcon="mdi:check"
                                disabled={formik.isSubmitting}
                            />
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
