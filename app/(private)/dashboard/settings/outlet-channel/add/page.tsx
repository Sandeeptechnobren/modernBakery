"use client";

import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Formik, Form, ErrorMessage, type FormikHelpers } from "formik";
import * as Yup from "yup";
import InputFields from "@/app/components/inputFields";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import { useSnackbar } from "@/app/services/snackbarContext";
import { addOutletChannel } from "@/app/services/allApi";

// ✅ Yup Schema
const OutletChannelSchema = Yup.object().shape({
  outlet_channel: Yup.string().required("Outlet Channel Code is required."),
  status: Yup.string().required("Status is required."),
});

export default function AddOutletChannel() {
  const { showSnackbar } = useSnackbar();
  const router = useRouter();

  type OutletChannel = {
    outlet_channel: string;
    status: string; // "Active" | "Inactive"
  };

  const initialValues: OutletChannel = {
    outlet_channel: "",
    status: "Active", // default
  };

  const handleSubmit = async (
    values: OutletChannel,
    { setSubmitting }: FormikHelpers<OutletChannel>
  ) => {
    try {
      // Map "Active"/"Inactive" to 1/0
      const payload = {
        ...values,
        status: values.status === "Active" ? 1 : 0,
      };

      const res = await addOutletChannel(payload);
      showSnackbar("Channel added successfully", "success");
      router.push("/dashboard/settings/outlet-channel");
    } catch (error) {
      console.error("Error submitting Channel❌:", error);
      showSnackbar("Failed to submit form", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full h-full overflow-x-hidden p-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/settings/outlet-channel">
            <Icon icon="lucide:arrow-left" width={24} />
          </Link>
          <h1 className="text-xl font-semibold text-gray-900">
            Add New Channel
          </h1>
        </div>
      </div>

      {/* ✅ Formik + Yup */}
      <Formik
        initialValues={initialValues}
        validationSchema={OutletChannelSchema}
        onSubmit={handleSubmit}
      >
        {({ handleSubmit, values, setFieldValue }) => (
          <Form onSubmit={handleSubmit}>
            <div className="bg-white rounded-2xl shadow divide-y divide-gray-200 mb-6">
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-800 mb-4">
                  Channel Details
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Outlet Channel */}
                  <div>
                    <InputFields
                      label="Outlet Channel"
                      value={values.outlet_channel}
                      onChange={(e) =>
                        setFieldValue("outlet_channel", e.target.value)
                      }
                    />
                    <ErrorMessage
                      name="outlet_channel"
                      component="span"
                      className="text-xs text-red-500"
                    />
                  </div>

                  {/* Status Dropdown using InputFields */}
                  <div>
                    <InputFields
                      label="Status"
                      type="select"
                      value={values.status}
                      onChange={(e) => setFieldValue("status", e.target.value)}
                      options={[
                        { label: "Active", value: "Active" },
                        { label: "Inactive", value: "Inactive" },
                      ]}
                    />
                    <ErrorMessage
                      name="status"
                      component="span"
                      className="text-xs text-red-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-4 mt-6 pr-0">
              <button
                type="reset"
                className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
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
          </Form>
        )}
      </Formik>
    </div>
  );
}
