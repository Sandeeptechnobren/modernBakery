"use client";

import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import InputFields from "@/app/components/inputFields";
import Loading from "@/app/components/Loading";
import { genearateCode, saveFinalCode } from "@/app/services/allApi";
import {
  addBulkTransfer,
  addAllocate,
  getModelNumbers,
  getModelStock,
} from "@/app/services/assetsApi";
import { useSnackbar } from "@/app/services/snackbarContext";
import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import * as yup from "yup";

export default function AddRoute() {
  const params = useParams();
  const uuid = params?.uuid as string;
  const mode = uuid === "addAllocate" ? "allocate" : "add";

  const { regionOptions, warehouseAllOptions, areaOptions } =
    useAllDropdownListData();

  const router = useRouter();
  const { showSnackbar } = useSnackbar();

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [prefix, setPrefix] = useState("");
  const codeGeneratedRef = useRef(false);

  const [modelNumberOptions, setModelNumberOptions] = useState<
    { value: string; label: string }[]
  >([]);

  const [form, setForm] = useState<any>(
    mode === "allocate"
      ? {
        region_id: "",
        btr: "",
        warehouse_id: "",
        truck_no: "",
        turnmen_name: "",
        contact: "",
      }
      : {
        osa_code: "",
        region_id: "",
        area_id: "",
        warehouse_id: "",
        model_id: "",
        requestes_asset: "",
        available_stock: "",
        status: "1",
      }
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  // ✅ FETCH MODEL NUMBERS
  useEffect(() => {
    if (mode === "add") {
      (async () => {
        try {
          setLoading(true);
          const res = await getModelNumbers();
          const data = Array.isArray(res) ? res : res?.data;

          if (Array.isArray(data)) {
            const options = data.map((item: any) => ({
              value: String(item.id),
              label: `${item.name} (${item.code})`,
            }));
            setModelNumberOptions(options);
          }
        } catch {
          showSnackbar("Failed to fetch model numbers", "error");
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [mode]);

  // ✅ AUTO GENERATE CODE
  useEffect(() => {
    if (mode === "add" && !codeGeneratedRef.current) {
      codeGeneratedRef.current = true;
      (async () => {
        try {
          const res = await genearateCode({ model_name: "bulk_tran" });
          if (res?.code) setForm((p: any) => ({ ...p, osa_code: res.code }));
          if (res?.prefix) setPrefix(res.prefix);
        } catch { }
      })();
    }
  }, [mode]);

  // ✅ FETCH STOCK
  const fetchModelStock = async (modelId: string) => {
    try {
      setLoading(true);
      const res = await getModelStock({ model_id: modelId });

      const stockValue =
        res?.data?.available_stock !== undefined
          ? String(res.data.available_stock)
          : "0";

      setForm((prev: any) => ({
        ...prev,
        available_stock: stockValue,
        requestes_asset: "", // ✅ reset requested when model changes
      }));
    } catch {
      showSnackbar("Failed to fetch stock", "error");
      setForm((prev: any) => ({
        ...prev,
        available_stock: "0",
        requestes_asset: "",
      }));
    } finally {
      setLoading(false);
    }
  };

  // ✅ STRICT INPUT CONTROL
  const handleChange = (field: string, value: string) => {
    // ✅ Allow ONLY numbers
    if (field === "available_stock" || field === "requestes_asset") {
      if (!/^\d*$/.test(value)) return;
    }

    // ✅ Block Requested > Available Stock
    if (field === "requestes_asset") {
      const available = Number(form.available_stock || 0);
      const requested = Number(value || 0);

      if (requested > available) {
        showSnackbar(
          `Only limited stock is available. Please reduce the requested quantity. (${available})`,
          "error"
        );
        return;
      }
    }

    setForm((prev: any) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));

    if (field === "model_id") {
      fetchModelStock(value);
    }
  };

  // ✅ VALIDATION
  const validationSchema =
    mode === "allocate"
      ? yup.object({
        region_id: yup.string().required(),
        btr: yup.string().required(),
        warehouse_id: yup.string().required(),
        truck_no: yup.string().required(),
        turnmen_name: yup.string().required(),
        contact: yup.string().required(),
      })
      : yup.object({
        osa_code: yup.string().required(),
        region_id: yup.string().required(),
        area_id: yup.string().required(),
        warehouse_id: yup.string().required(),
        model_id: yup.string().required(),
        requestes_asset: yup
          .number()
          .required()
          .max(
            Number(form.available_stock || 0),
            "Requested cannot exceed stock"
          ),
        available_stock: yup.string().required(),
        status: yup.string().required(),
      });

  // ✅ SUBMIT
  const handleSubmit = async () => {
    try {
      await validationSchema.validate(form, { abortEarly: false });
      setSubmitting(true);

      let res;

      if (mode === "allocate") {
        res = await addAllocate(form);
      } else {
        res = await addBulkTransfer({
          ...form,
          status: Number(form.status),
        });
      }

      if (res?.error) {
        showSnackbar("Submission failed", "error");
      } else {
        if (mode === "add") {
          await saveFinalCode({
            reserved_code: form.osa_code,
            model_name: "bulk_tran",
          });
        }

        showSnackbar("Successfully Added", "success");
        router.push("/chillerInstallation/bulkTransfer");
      }
    } catch (err: any) {
      if (err instanceof yup.ValidationError) {
        const formErrors: any = {};
        err.inner.forEach((e: any) => {
          if (e.path) formErrors[e.path] = e.message;
        });
        setErrors(formErrors);
      } else {
        showSnackbar("Something went wrong", "error");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  return (
    <>
      {/* HEADER */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/chillerInstallation/bulkTransfer">
          <Icon icon="lucide:arrow-left" width={24} />
        </Link>
        <h1 className="text-xl font-semibold">Add Bulk Transfer</h1>
      </div>

      {/* FORM */}
      <div className="bg-white p-6 rounded-xl shadow grid md:grid-cols-3 gap-4">
        <InputFields label="OSA Code" value={form.osa_code} disabled onChange={() => { }} />

        <InputFields
          label="Region"
          value={form.region_id}
          options={regionOptions}
          onChange={(e) => handleChange("region_id", e.target.value)}
        />

        <InputFields
          label="Area"
          value={form.area_id}
          options={areaOptions}
          onChange={(e) => handleChange("area_id", e.target.value)}
        />

        <InputFields
          label="Distributor"
          value={form.warehouse_id}
          options={warehouseAllOptions}
          onChange={(e) => handleChange("warehouse_id", e.target.value)}
        />

        <InputFields
          label="Model Number"
          searchable
          value={form.model_id}
          options={modelNumberOptions}
          onChange={(e) => handleChange("model_id", e.target.value)}
        />

        <InputFields
          label="Available Stock"
          value={form.available_stock}
          disabled
          onChange={() => { }}
        />

        <InputFields
          label="Requested Chiller"
          type="number"
          value={form.requestes_asset}
          onChange={(e) => handleChange("requestes_asset", e.target.value)}
          min={0}
          max={Number(form.available_stock || 0)}
        />

        <InputFields
          label="Status"
          type="radio"
          value={form.status}
          onChange={(e) => handleChange("status", e.target.value)}
          options={[
            { value: "1", label: "Active" },
            { value: "0", label: "Inactive" },
          ]}
        />
      </div>

      {/* BUTTONS */}
      <div className="flex justify-end gap-4 mt-6">
        <button
          className="px-6 py-2 border rounded-lg"
          onClick={() =>
            router.push("/chillerInstallation/bulkTransfer")
          }
        >
          Cancel
        </button>

        <SidebarBtn
          label={submitting ? "Submitting..." : "Submit"}
          onClick={handleSubmit}
          isActive={!submitting}
        />
      </div>
    </>
  );
}
