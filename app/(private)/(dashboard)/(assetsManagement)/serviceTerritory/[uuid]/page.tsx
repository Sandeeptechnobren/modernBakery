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
    ServiceTerritoryByUUID,
} from "@/app/services/assetsApi";
import { useEffect, useRef, useState } from "react";
import { useLoading } from "@/app/services/loadingContext";
import { genearateCode, saveFinalCode } from "@/app/services/allApi";
import Loading from "@/app/components/Loading";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";

// ✅ Validation Schema
const validationSchema = Yup.object().shape({
    osa_code: Yup.string().required("Code is required"),
    warehouses: Yup.array().min(1, "Warehouse is required"),
    regions: Yup.array().min(1, "Region is required"),
    areas: Yup.array().min(1, "Area is required"),
    technician: Yup.number().min(1, "Technician is required").required("Technician is required"),
});

export default function AddEditServiceTerritory() {
    const router = useRouter();
    const params = useParams();
    const { showSnackbar } = useSnackbar();
    const { setLoading } = useLoading();

    const {
        regionOptions,
        areaOptions,
        warehouseOptions,
        fetchAreaOptions,
        fetchWarehouseOptions,
    } = useAllDropdownListData();

    // Get UUID safely
    let uuid = "";
    if (params?.uuid) uuid = Array.isArray(params.uuid) ? params.uuid[0] : params.uuid;

    const isAddMode = uuid === "add" || !uuid;
    const isEditMode = !isAddMode;

    const [localLoading, setLocalLoading] = useState(false);
    const [technicianOptions, setTechnicianOptions] = useState<{ value: string; label: string }[]>([]);
    const codeGeneratedRef = useRef(false);

    // -------------------------------
    //     FORMIK INITIALIZATION
    // -------------------------------
    const formik = useFormik({
        initialValues: {
            osa_code: "",
            warehouses: [] as string[],
            regions: [] as string[],
            areas: [] as string[],
            technician: 0,
        },
        validationSchema,
        onSubmit: async (values, { setSubmitting, resetForm }) => {
            setLoading(true);

            const payload: any = {
                warehouse_id: values.warehouses.join(","),
                region_id: values.regions.join(","),
                area_id: values.areas.join(","),
                technician_id: Number(values.technician),
            };

            if (isAddMode) payload.osa_code = values.osa_code;

            try {
                const res = isEditMode
                    ? await updateServiceTerritory(uuid, payload)
                    : await addServiceTerritory(payload);

                if (res?.error) {
                    showSnackbar("Failed to save Service Territory", "error");
                } else {
                    showSnackbar(
                        isEditMode
                            ? "Service Territory updated successfully"
                            : "Service Territory added successfully",
                        "success"
                    );

                    if (isAddMode) {
                        await saveFinalCode({
                            reserved_code: values.osa_code,
                            model_name: "service_territory",
                        });
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

    // ------------------------------------
    //     Fetch Technician List
    // ------------------------------------
    useEffect(() => {
        (async () => {
            try {
                const response = await getTechicianList();
                const techData = Array.isArray(response?.data)
                    ? response.data
                    : (response?.data?.data || []);

                const options = techData.map((item: { id: string | number; osa_code: string; name: string }) => ({
                    value: String(item.id),
                    label: `${item.osa_code} - ${item.name}`,
                }));

                setTechnicianOptions(options);
            } catch (error) {
                showSnackbar("Failed to fetch technician data", "error");
            }
        })();
    }, []);

    // ------------------------------------
    //     Load Edit Data OR Generate Code
    // ------------------------------------
    useEffect(() => {
        const load = async () => {
            if (isEditMode) {
                setLocalLoading(true);
                try {
                    const res = await ServiceTerritoryByUUID(uuid);

                    if (res) {
                        const data = res.data || res;

                        const regions = data.regions || [];
                        const areas = data.regions?.flatMap((r: any) => r.areas || []) || [];
                        const warehouses = areas.flatMap((a: any) => a.warehouses || []) || [];

                        const regionIds = regions.map((r: any) => String(r.region_id));
                        const areaIds = areas.map((a: any) => String(a.area_id));
                        const warehouseIds = warehouses.map((w: any) => String(w.warehouse_id));

                        // ✅ Load all dropdown options for edit mode (NO cascading fetch)
                        // We load ALL available options so user can see them
                        // The values will be pre-selected based on API data

                        formik.setValues({
                            osa_code: data.osa_code,
                            regions: regionIds,
                            areas: areaIds,
                            warehouses: warehouseIds,
                            technician: data.technician?.id ? Number(data.technician.id) : 0,
                        });
                    }
                } catch {
                    showSnackbar("Failed to load details", "error");
                } finally {
                    setLocalLoading(false);
                }
            } else {
                if (!codeGeneratedRef.current) {
                    codeGeneratedRef.current = true;
                    const res = await genearateCode({ model_name: "service_territory" });
                    formik.setFieldValue("osa_code", res?.code || "");
                }
            }
        };

        load();
    }, [uuid]);

    // ------------------------------------
    //     CASCADING HANDLERS (ADD MODE ONLY)
    // ------------------------------------

    const handleRegionChange = async (e: any) => {
        const values = e.target.value;
        formik.setFieldValue("regions", values);

        // ✅ Only cascade in ADD mode
        if (isAddMode) {
            formik.setFieldValue("areas", []);
            formik.setFieldValue("warehouses", []);

            if (Array.isArray(values) && values.length > 0) {
                await fetchAreaOptions(values.join(","));
            }
        }
    };

    const handleAreaChange = async (e: any) => {
        const values = e.target.value;
        formik.setFieldValue("areas", values);

        // ✅ Only cascade in ADD mode
        if (isAddMode) {
            formik.setFieldValue("warehouses", []);

            if (Array.isArray(values) && values.length > 0) {
                await fetchWarehouseOptions(values.join(","));
            }
        }
    };

    const handleWarehouseChange = (e: any) => {
        const values = e.target.value;
        formik.setFieldValue("warehouses", values);
    };

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
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

                            {/* ST CODE */}
                            <InputFields
                                label="ST Code"
                                name="osa_code"
                                value={formik.values.osa_code}
                                disabled={isEditMode}
                                onChange={formik.handleChange}
                                error={
                                    formik.touched.osa_code && formik.errors.osa_code
                                        ? String(formik.errors.osa_code)
                                        : ""
                                }
                            />

                            {/* REGION MULTI SELECT */}
                            <InputFields
                                label="Region"
                                name="regions"
                                isSingle={false}
                                multiSelectChips={true}
                                value={formik.values.regions}
                                options={regionOptions}
                                onChange={handleRegionChange}
                                error={
                                    formik.touched.regions && formik.errors.regions
                                        ? String(formik.errors.regions)
                                        : ""
                                }
                            />

                            {/* AREA MULTI SELECT */}
                            <InputFields
                                label="Area"
                                name="areas"
                                isSingle={false}
                                multiSelectChips={true}
                                value={formik.values.areas}
                                options={areaOptions}
                                onChange={handleAreaChange}
                                error={
                                    formik.touched.areas && formik.errors.areas
                                        ? String(formik.errors.areas)
                                        : ""
                                }
                            />

                            {/* WAREHOUSE MULTI SELECT */}
                            <InputFields
                                label="Warehouse"
                                name="warehouses"
                                isSingle={false}
                                multiSelectChips={true}
                                value={formik.values.warehouses}
                                options={warehouseOptions}
                                onChange={handleWarehouseChange}
                                error={
                                    formik.touched.warehouses && formik.errors.warehouses
                                        ? String(formik.errors.warehouses)
                                        : ""
                                }
                            />

                            {/* TECHNICIAN */}
                            <InputFields
                                label="Technician"
                                name="technician"
                                isSingle={true}
                                value={formik.values.technician ? String(formik.values.technician) : ""}
                                options={technicianOptions}
                                onChange={(e) => {
                                    formik.setFieldValue("technician", Number(e.target.value));
                                }}
                                error={
                                    formik.touched.technician && formik.errors.technician
                                        ? String(formik.errors.technician)
                                        : ""
                                }
                            />
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
                            />
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}