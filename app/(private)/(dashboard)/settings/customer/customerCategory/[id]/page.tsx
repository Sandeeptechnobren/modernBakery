"use client";

import ContainerCard from "@/app/components/containerCard";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import InputFields from "@/app/components/inputFields";
import SearchableDropdown from "@/app/components/SearchableDropdown";
import {
  addCustomerCategory,
  channelList,
  genearateCode,
  saveFinalCode,
  getCustomerCategoryById,
  updateCustomerCategory,
} from "@/app/services/allApi";
import IconButton from "@/app/components/iconButton";
import SettingPopUp from "@/app/components/settingPopUp";
import { useSnackbar } from "@/app/services/snackbarContext";
import { Icon } from "@iconify-icon/react";
import { useFormik } from "formik";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import * as Yup from "yup";
import { useParams, useRouter } from "next/navigation";

interface OutletChannel {
  id: number;
  outlet_channel_code: string;
}

export default function AddCustomerCategory() {
  const [outletChannels, setOutletChannels] = useState<
    { value: string; label: string }[]
  >([]);
  const [isOpen, setIsOpen] = useState(false);
  const [codeMode, setCodeMode] = useState<"auto" | "manual">("auto");
  const [prefix, setPrefix] = useState("");
  const [code, setCode] = useState("");
  const codeGeneratedRef = useRef(false);
  const { showSnackbar } = useSnackbar();
  const router = useRouter();
  const params = useParams();
  const id = params?.id
    ? (Array.isArray(params.id) ? params.id[0] : (params.id as string))
    : "";
  const isEditMode = Boolean(id && id !== "add");

  useEffect(() => {
    const fetchOutletChannels = async () => {
      try {
        const res = await channelList();
        const dataArray: OutletChannel[] = res?.data || [];
        const options = dataArray.map((oc) => ({
          value: String(oc.id),
          label: oc.outlet_channel_code,
        }));
        setOutletChannels(options);
      } catch (error) {
        console.error("Failed to fetch outlet channels ❌", error);
        setOutletChannels([]);
      }
    };
    fetchOutletChannels();
  }, []);

  // Fetch existing category when in edit mode
  useEffect(() => {
    if (!isEditMode) return;
    (async () => {
      try {
        const res = await getCustomerCategoryById(id);
        const data = res?.data || res; // handle either shape
        if (data) {
          // populate form values (convert to strings for selects/radios)
          formik.setValues({
            outlet_channel_id: data.outlet_channel_id ? String(data.outlet_channel_id) : "",
            customer_category_name: data.customer_category_name || "",
            status: data.status !== undefined && data.status !== null ? String(data.status) : "1",
            customer_category_code: data.customer_category_code || "",
          });
          // keep code in state helpers as well
          setCode(data.customer_category_code || "");
        }
      } catch (e) {
        console.error("Failed to fetch customer category by id", e);
        showSnackbar("Unable to load Customer Category", "error");
      }
    })();
  }, [isEditMode, id]);

  const formik = useFormik({
    initialValues: {
      outlet_channel_id: "",
      customer_category_name: "",
      status: "1",
      customer_category_code: "",
    },
    validationSchema: Yup.object({
      outlet_channel_id: Yup.string().required("Outlet channel is required"),
      customer_category_name: Yup.string().required("Name is required"),
      status: Yup.string().required("Status is required"),
      customer_category_code: Yup.string().required("Code is required"),
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        const payload = {
          outlet_channel_id: Number(values.outlet_channel_id),
          customer_category_name: values.customer_category_name,
          status: Number(values.status),
          customer_category_code: values.customer_category_code,
        };
        if (isEditMode) {
          const res = await updateCustomerCategory(id, payload);
          if (!res?.error) {
            showSnackbar("Customer category updated successfully ✅", "success");
            router.push("/settings/customer/customerCategory");
          } else {
            showSnackbar(res?.data?.message || "Failed to update customer category ❌", "error");
          }
        } else {
          const res = await addCustomerCategory(payload);
          if (!res.error) {
            try {
              await saveFinalCode({
                reserved_code: values.customer_category_code,
                model_name: "customer_categories",
              });
            } catch (e) {}
            showSnackbar("Customer category added successfully ✅", "success");
            resetForm();
            router.push("/settings/customer/customerCategory");
          } else {
            showSnackbar("Failed to add customer category ❌", "error");
          }
        }
      } catch (error) {
        console.error("❌ Add Customer Category failed", error);
        showSnackbar("Failed to add customer category ❌", "error");
      }
    },
  });

  // Generate code on mount (add mode only)
  useEffect(() => {
    if (isEditMode) return; // skip generation in edit mode
    if (!codeGeneratedRef.current) {
      codeGeneratedRef.current = true;
      (async () => {
        const res = await genearateCode({ model_name: "customer_categories" });
        if (res?.code) {
          setCode(res.code);
          formik.setFieldValue("customer_category_code", res.code);
        }
        if (res?.prefix) {
          setPrefix(res.prefix);
        }
      })();
    }
  }, [isEditMode]);

  return (
    <>
      <div className="flex justify-between items-center mb-[20px]">
        <div className="flex items-center gap-[16px]">
          <Link href="/settings/customer/customerCategory">
            <Icon icon="lucide:arrow-left" width={24} />
          </Link>
          <h1 className="text-[20px] font-semibold text-[#181D27] flex items-center leading-[30px] mb-[5px]">
            {isEditMode ? "Update  Customer Category" : "Add Customer Category"}
          </h1>
        </div>
      </div>

      <form onSubmit={formik.handleSubmit}>
        <ContainerCard>
          <h2 className="text-lg font-semibold mb-6">
            {isEditMode ? " Customer Category" : "Customer Category"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Customer Category Code (auto-generated, disabled, with settings icon/popup) */}
            <div className="flex items-start gap-2 max-w-[406px]">
              <InputFields
                label="Customer Category Code"
                name="customer_category_code"
                value={formik.values.customer_category_code}
                onChange={formik.handleChange}
                disabled={codeMode === "auto"}
                error={
                  formik.touched.customer_category_code &&
                  formik.errors.customer_category_code
                }
              />
              {!isEditMode && (
                <IconButton
                  bgClass="white"
                  className="  cursor-pointer text-[#252B37] pt-12"
                  icon="mi:settings"
                  onClick={() => setIsOpen(true)}
                />
              )}
              {!isEditMode && (
                <SettingPopUp
                  isOpen={isOpen}
                  onClose={() => setIsOpen(false)}
                  title="Customer Category Code"
                  prefix={prefix}
                  setPrefix={setPrefix}
                  onSave={(mode, code) => {
                    setCodeMode(mode);
                    if (mode === "auto" && code) {
                      formik.setFieldValue("customer_category_code", code);
                    } else if (mode === "manual") {
                      formik.setFieldValue("customer_category_code", "");
                    }
                  }}
                />
              )}
            </div>

            <InputFields
              label="Outlet Channel"
              name="outlet_channel_id"
              value={formik.values.outlet_channel_id}
              options={outletChannels}
              onChange={(e) =>
                formik.setFieldValue("outlet_channel_id", e.target.value)
              }
              error={
                formik.touched.outlet_channel_id &&
                formik.errors.outlet_channel_id
              }
            />

            <InputFields
              name="customer_category_name"
              label="Category Name"
              value={formik.values.customer_category_name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={
                formik.touched.customer_category_name &&
                formik.errors.customer_category_name
              }
            />

            <InputFields
              name="status"
              label="Status"
              type="radio"
              value={formik.values.status}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.status && formik.errors.status}
              options={[
                { value: "1", label: "Active" },
                { value: "0", label: "Inactive" },
              ]}
            />
          </div>
        </ContainerCard>

        <div className="flex justify-end gap-3 mt-6">
          <button
            className="px-4 py-2 h-[40px] w-[80px] rounded-md font-semibold border border-gray-300 text-gray-700 hover:bg-gray-100"
            type="button"
            onClick={() => router.back()}
          >
            Cancel
          </button>
          <SidebarBtn
            label={isEditMode ?(formik.isSubmitting ?"Updating":"Update") : (formik.isSubmitting?"Submitting...":"Submit")}
            isActive={true}
            leadingIcon={ "mdi:check"}
            type="submit"
            disabled={formik.isSubmitting}
          />
        </div>
      </form>
    </>
  );
}
