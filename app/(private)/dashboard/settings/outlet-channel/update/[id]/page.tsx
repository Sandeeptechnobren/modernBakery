"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getChannelById, updateChannel } from "@/app/services/allApi";
import { useSnackbar } from "@/app/services/snackbarContext";
import InputFields from "@/app/components/inputFields";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import { Icon } from "@iconify-icon/react";
import Link from "next/link";

import { Formik, Form, ErrorMessage, type FormikHelpers } from "formik";
import * as Yup from "yup";

// ✅ Validation schema
const ChannelSchema = Yup.object().shape({
  outlet_channel_code: Yup.string().required("Channel Code is required."),
  outlet_channel: Yup.string().required("Outlet Channel Name is required."),
});

type ChannelForm = {
  outlet_channel_code: string;
  outlet_channel: string;
};

export default function UpdateChannelPage() {
  const router = useRouter();
  const { showSnackbar } = useSnackbar();

  const { id } = useParams<{ id: string }>();

  const [initialValues, setInitialValues] = useState<ChannelForm>({
    outlet_channel_code: "",
    outlet_channel: "",
  });

  // ✅ Fetch existing channel by id
  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        const res = await getChannelById(String(id));
        const data = res.original.data;
        setInitialValues({
          outlet_channel_code: data.outlet_channel_code ?? "",
          outlet_channel: data.outlet_channel ?? "",
        });
      } catch (err) {
        console.error("Failed to fetch channel:", err);
      }
    };
    fetchData();
  }, [id]);

  // ✅ Submit update
  const handleSubmit = async (
    values: ChannelForm,
    { setSubmitting }: FormikHelpers<ChannelForm>
  ) => {
    try {
      await updateChannel(String(id), values);
      showSnackbar("Channel updated successfully ✅", "success");
      router.push("/dashboard/settings/outlet-channel");
    } catch (err) {
      console.error("Update failed:", err);
      showSnackbar("Failed to update ❌", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full h-full overflow-x-hidden p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/settings/outlet-channel">
            <Icon icon="lucide:arrow-left" width={24} />
          </Link>
          <h1 className="text-xl font-semibold text-gray-900">
            Update Channel
          </h1>
        </div>
      </div>

      {/* ✅ Formik */}
      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={ChannelSchema}
        onSubmit={handleSubmit}
      >
        {({ values, handleChange }) => (
          <Form>
            <div className="bg-white rounded-2xl shadow divide-y divide-gray-200 mb-6">
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-800 mb-4">
                  Channel Details
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Channel Code */}
                  <div>
                    <InputFields
                      label="Channel Code"
                      name="outlet_channel_code"
                      value={values.outlet_channel_code}
                      onChange={handleChange}
                    />
                    <ErrorMessage
                      name="outlet_channel_code"
                      component="span"
                      className="text-xs text-red-500"
                    />
                  </div>

                  {/* Channel Name */}
                  <div>
                    <InputFields
                      label="Outlet Channel Name"
                      name="outlet_channel"
                      value={values.outlet_channel}
                      onChange={handleChange}
                    />
                    <ErrorMessage
                      name="outlet_channel"
                      component="span"
                      className="text-xs text-red-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-4 mt-6">
              <button
                type="button"
                onClick={() =>
                  router.push("/dashboard/settings/outlet-channel")
                }
                className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
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
          </Form>
        )}
      </Formik>
    </div>
  );
}
