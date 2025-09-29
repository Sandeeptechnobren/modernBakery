"use client";

import ContainerCard from "@/app/components/containerCard";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import InputFields from "@/app/components/inputFields";
import SearchableDropdown from "@/app/components/SearchableDropdown";
import { addCustomerCategory, channelList } from "@/app/services/allApi";
import { useSnackbar } from "@/app/services/snackbarContext";
import { Icon } from "@iconify-icon/react";
import { useFormik } from "formik";
import Link from "next/link";
import { useEffect, useState } from "react";
import * as Yup from "yup";
import { useRouter } from "next/navigation";

interface OutletChannel {
  id: number;
  outlet_channel_code: string;
}

export default function AddCustomerCategory() {
  const [outletChannels, setOutletChannels] = useState<{ value: string; label: string }[]>([]);
  const { showSnackbar } = useSnackbar();
  const router = useRouter();

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

  const formik = useFormik({
    initialValues: {
      outlet_channel_id: "",
      customer_category_name: "",
      status: "1",
    },
    validationSchema: Yup.object({
      outlet_channel_id: Yup.string().required("Outlet channel is required"),
      customer_category_name: Yup.string().required("Name is required"),
      status: Yup.string().required("Status is required"),
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        const payload = {
          outlet_channel_id: Number(values.outlet_channel_id),
          customer_category_name: values.customer_category_name,
          status: Number(values.status),
        };
        const res = await addCustomerCategory(payload);
        console.log("✅ Category Added:", res);
        showSnackbar("Customer category added successfully ✅", "success");
        resetForm();
        router.push("/dashboard/settings/customer/customerCategory");
      } catch (error) {
        console.error("❌ Add Customer Category failed", error);
        showSnackbar("Failed to add customer category ❌", "error");
      }
    },
  });

  return (
    <>
      <div className="flex justify-between items-center mb-[20px]">
        <div className="flex items-center gap-[16px]">
          <Link href="/dashboard/settings/customer/customerCategory">
            <Icon icon="lucide:arrow-left" width={24} />
          </Link>
          <h1 className="text-[20px] font-semibold text-[#181D27] flex items-center leading-[30px] mb-[5px]">
            Add Customer Category
          </h1>
        </div>
      </div>

      <form onSubmit={formik.handleSubmit}>
        <ContainerCard>
          <h2 className="text-lg font-semibold mb-6">
            Customer Category Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <InputFields
              label="Outlet Channel"
              name="outlet_channel_id"
              value={formik.values.outlet_channel_id}
              options={outletChannels}
              onChange={(val) => formik.setFieldValue("outlet_channel_id", String(val))}
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
              type="select"
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
            label="Submit"
            isActive={true}
            leadingIcon="mdi:check"
            type="submit"
          />
        </div>
      </form>
    </>
  );
}
