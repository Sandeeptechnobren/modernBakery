"use client";

import ContainerCard from "@/app/components/containerCard";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
import InputFields from "@/app/components/inputFields";
import { useMemo, useState } from "react";
import { addRouteTransfer } from "@/app/services/allApi";
import { useLoading } from "@/app/services/loadingContext";
import { useSnackbar } from "@/app/services/snackbarContext";

export default function StockTransfer() {
    const { routeOptions } = useAllDropdownListData();
    const { setLoading } = useLoading();
    const { showSnackbar } = useSnackbar();

    const [form, setForm] = useState({
        source_warehouse: "",
        destination_warehouse: "",
    });

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
    };

    /* -------------------------------------------------------------
       HANDLE SUBMIT
    ------------------------------------------------------------- */
    const handleSubmit = async () => {
        if (!form.source_warehouse || !form.destination_warehouse) {
            showSnackbar("Please select both origin and destination routes", "error");
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
                    />
                </div>
            </div>

            {/* ACTION */}
            <div className="flex justify-end mt-6">
                <button
                    onClick={handleSubmit}
                    className="bg-[#2563EB] text-white px-8 py-2 rounded-md hover:bg-[#1D4ED8]"
                >
                    Submit
                </button>
            </div>
        </ContainerCard>
    );
}
