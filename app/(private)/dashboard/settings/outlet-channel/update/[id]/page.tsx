"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useFormik } from "formik";
import * as Yup from "yup";
import Link from "next/link";
import { Icon } from "@iconify-icon/react";

import ContainerCard from "@/app/components/containerCard";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import InputFields from "@/app/components/inputFields";
import Loading from "@/app/components/Loading";
import { getOutletChannelById, updateOutletChannel } from "@/app/services/allApi";
import { useSnackbar } from "@/app/services/snackbarContext";

interface OutletChannelForm {
  outlet_channel: string;
  status: "1" | "0";
}

export default function UpdateOutletChannelPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const { showSnackbar } = useSnackbar();

  const [loading, setLoading] = useState(true);

  const formik = useFormik<OutletChannelForm>({
    initialValues: {
      outlet_channel: "",
      status: "1",
    },
    validationSchema: Yup.object({
      outlet_channel: Yup.string().required("Outlet Channel is required"),
      status: Yup.string().oneOf(["1", "0"]).required("Status is required"),
    }),
    onSubmit: async (values) => {
      try {
        await updateOutletChannel(id, {
          outlet_channel: values.outlet_channel,
          status: Number(values.status),
        });
        showSnackbar("Outlet Channel updated successfully ✅", "success");
        router.push("/dashboard/settings/outlet-channel");
      } catch (err) {
        console.error("❌ Update failed", err);
        showSnackbar("Failed to update outlet channel ❌", "error");
      }
    },
  });

  useEffect(() => {
    const fetchOutletChannel = async () => {
      try {
        const res = await getOutletChannelById(id);
        const channel = res?.data;

        if (channel) {
          formik.setValues({
            outlet_channel: channel.outlet_channel || "",
            status: channel.status === 1 ? "1" : "0",
          });
        }
      } catch (err) {
        console.error("❌ Failed to fetch outlet channel", err);
        showSnackbar("Failed to load outlet channel ❌", "error");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchOutletChannel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) return <Loading />;

  return (
    <>
      {/* Header */}
      <div className="flex justify-between items-center mb-[20px]">
        <div className="flex items-center gap-[16px]">
          <Link href="/dashboard/settings/outlet-channel">
            <Icon icon="lucide:arrow-left" width={24} />
          </Link>
          <h1 className="text-[20px] font-semibold text-[#181D27]">
            Update Outlet Channel
          </h1>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={formik.handleSubmit}>
        <ContainerCard>
          <h2 className="text-lg font-semibold mb-6">Outlet Channel Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <InputFields
              label="Outlet Channel"
              name="outlet_channel"
              value={formik.values.outlet_channel}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.outlet_channel && formik.errors.outlet_channel}
            />

            <InputFields
              label="Status"
              name="status"
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

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            className="px-4 py-2 h-[40px] w-[80px] rounded-md font-semibold border border-gray-300 text-gray-700 hover:bg-gray-100"
            type="button"
            onClick={() => router.back()}
          >
            Cancel
          </button>
          <SidebarBtn
            label="Update"
            isActive={true}
            leadingIcon="mdi:check"
            type="submit"
          />
        </div>
      </form>
    </>
  );
}
