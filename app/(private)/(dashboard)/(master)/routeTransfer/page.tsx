"use client";

import ContainerCard from "@/app/components/containerCard";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
import InputFields from "@/app/components/inputFields";
import { useMemo, useState, useEffect } from "react";
import { addRouteTransfer } from "@/app/services/allApi";
import { useLoading } from "@/app/services/loadingContext";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useRouter, useParams, useSearchParams } from "next/navigation"; import { usePagePermissions } from "@/app/(private)/utils/usePagePermissions";

export default function StockTransfer() {
    const { can } = usePagePermissions();
    const { routeOptions = [], ensureRouteLoaded } = useAllDropdownListData();
    const { setLoading } = useLoading();
    const { showSnackbar } = useSnackbar();
    const router = useRouter();
    const [routeoptions, setRouteOptions] = useState(true);

    const [form, setForm] = useState({
        source_warehouse: "",
        destination_warehouse: "",
    });

    const [errors, setErrors] = useState({
        source_warehouse: "",
        destination_warehouse: "",
    });

    useEffect(() => {
        if (routeOptions && routeOptions.length > 0) {
            setRouteOptions(false);
        }
    }, [routeOptions]);

    useEffect(() => {
        ensureRouteLoaded();
    }, [ensureRouteLoaded]);
    /* -------------------------------------------------------------
       FILTER DESTINATION WAREHOUSE (EXCLUDE SOURCE)
    ------------------------------------------------------------- */
    const destinationRouteOptions = useMemo(() => {
        return routeOptions.filter(
            (opt: any) => opt.value !== form.source_warehouse
        );
    }, [routeOptions, form.source_warehouse]);

    /* -------------------------------------------------------------
       HANDLE CHANGE
    ------------------------------------------------------------- */
    const handleChange = (field: string, value: string) => {
        setForm((prev) => ({
            ...prev,
            [field]: value,
            ...(field === "source_warehouse"
                ? { destination_warehouse: "" }
                : {}),
        }));

        setErrors((prev) => ({
            ...prev,
            [field]: "",
            ...(field === "source_warehouse"
                ? { destination_warehouse: "" }
                : {}),
        }));
    };

    /* -------------------------------------------------------------
       HANDLE SUBMIT
    ------------------------------------------------------------- */
    const handleSubmit = async () => {
        const newErrors = {
            source_warehouse: form.source_warehouse ? "" : "Please select origin route",
            destination_warehouse: form.destination_warehouse ? "" : "Please select destination route",
        };

        setErrors(newErrors);

        if (newErrors.source_warehouse || newErrors.destination_warehouse) {
            return;
        }

        const payload = {
            old_route_id: Number(form.source_warehouse),
            new_route_id: Number(form.destination_warehouse),
        };

        try {
            setLoading(true);
            const res = await addRouteTransfer(payload);
            if (res?.error) {
                if (res?.errors) {
                    const errorMsg = Object.values(res.errors).flat().join(", ");
                    showSnackbar(errorMsg || "Validation failed", "error");
                } else {
                    showSnackbar(res?.message || "Route Transfer Failed", "error");
                }
            } else {
                showSnackbar("Route Transfer Successful ✅", "success");
                setForm({ source_warehouse: "", destination_warehouse: "" });
                setErrors({ source_warehouse: "", destination_warehouse: "" });
            }
        } catch (error) {
            console.error("Route transfer error:", error);
            showSnackbar("Something went wrong", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ContainerCard>
            <h1 className="text-[20px] font-semibold text-[#181D27] uppercase mb-6">
                Route Transfer
            </h1>

            {/* INPUT FIELDS ONLY */}
            {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> */}
            {/* <div className="flex"> */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="mb-0">
                    <InputFields
                        label="Select Route"
                        width="w-full"
                        name="source_warehouse"
                        value={form.source_warehouse}
                        options={routeOptions}
                        onChange={(e) =>
                            handleChange("source_warehouse", e.target.value)
                        }
                        searchable={true}
                        showSearchInDropdown={true}
                        placeholder="Search route"
                        error={errors.source_warehouse}
                    //    showSkeleton={routeoptions}
                    />
                </div>
                <div className="mb-0">
                    <InputFields
                        label="Select Sub Route"
                        width="w-full"
                        name="destination_warehouse"
                        value={form.destination_warehouse}
                        options={destinationRouteOptions}
                        onChange={(e) =>
                            handleChange("destination_warehouse", e.target.value)
                        }
                        disabled={!form.source_warehouse}
                        searchable={true}
                        showSearchInDropdown={true}
                        placeholder="Search sub route"
                        error={errors.destination_warehouse}
                        showSkeleton={routeoptions}
                    />
                </div>
            </div>


            {/* ACTION */}
            {can("create") && (
                <div className="flex justify-end mt-6 gap-4">
                    {/* <button
    onClick={() => router.push("/routeTransfer")}
    type="button"
    className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
  >
    Cancel
  </button> */}

                    <button
                        onClick={handleSubmit}
                        className="px-6 py-2 bg-red-600 text-white rounded-md"
                    >
                        Submit
                    </button>
                </div>

            )}
        </ContainerCard>
    );
}
