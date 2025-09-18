"use client";

import { ErrorMessage, Form, Formik } from "formik";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import * as Yup from "yup";

import ContainerCard from "@/app/components/containerCard";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import InputFields from "@/app/components/inputFields";
import Loading from "@/app/components/Loading";
import { getCustomerType, updateCustomerType } from "@/app/services/allApi";
import { useSnackbar } from "@/app/services/snackbarContext";

interface CustomerTypeForm {
  code: string;
  name: string;
  status: "Active" | "Inactive";
}

const validationSchema = Yup.object({
  code: Yup.string().required("Code is required"),
  name: Yup.string().required("Name is required"),
  status: Yup.string().oneOf(["Active", "Inactive"]).required(),
});

export default function UpdateCustomerType() {
  const [loading, setLoading] = useState(true);
  const [initialValues, setInitialValues] = useState<CustomerTypeForm>({
    code: "",
    name: "",
    status: "Active",
  });

  const router = useRouter();
  const params = useParams();
  const { showSnackbar } = useSnackbar();

  const customerId = params?.id as string | undefined;

  useEffect(() => {
    if (!customerId) {
      setLoading(false);
      return;
    }

    const fetchCustomer = async () => {
      try {
        const res = await getCustomerType(customerId);
        const customer = res?.data?.data || res?.data;

        if (!customer) throw new Error("Customer not found");

        setInitialValues({
          code: customer.code || "",
          name: customer.name || "",
          status: customer.status === "active" ? "Active" : "Inactive",
        });
      } catch (error) {
        console.error("Failed to fetch customer ❌", error);
        showSnackbar("Failed to fetch customer ❌", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [customerId, showSnackbar]);

  const handleSubmit = async (values: CustomerTypeForm) => {
    if (!customerId) return;

    try {
      await updateCustomerType(customerId, {
        ...values,
        status: values.status.toLowerCase(),
      });

      showSnackbar("Customer Type updated ✅", "success");
      router.push("/dashboard/settings/customer/customerType");
      router.refresh();
    } catch (error) {
      console.error("Update failed ❌", error);
      showSnackbar("Failed to update customer ❌", "error");
    }
  };

  if (loading) return <Loading />;

  return (
    <ContainerCard>
      {/* Header */}
      <div className="flex justify-between mb-4">
        <h1 className="text-[20px] font-semibold">Update Customer Type</h1>
        <SidebarBtn
          href="/dashboard/settings/customer/customerType"
          label="Back"
        />
      </div>

      {/* Form */}
      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ values, handleChange }) => (
          <Form className="flex flex-col gap-4">
            {/* Code */}
            <div>
              <InputFields
                label="Code"
                name="code"
                value={values.code}
                onChange={handleChange}
              />
              <ErrorMessage
                name="code"
                component="div"
                className="text-red-500 text-sm"
              />
            </div>

            {/* Name */}
            <div>
              <InputFields
                label="Name"
                name="name"
                value={values.name}
                onChange={handleChange}
              />
              <ErrorMessage
                name="name"
                component="div"
                className="text-red-500 text-sm"
              />
            </div>

            {/* Status */}
            <div>
              <InputFields
                label="Status"
                name="status"
                value={values.status}
                onChange={handleChange}
                type="select"
                options={[
                  { label: "Active", value: "Active" },
                  { label: "Inactive", value: "Inactive" },
                ]}
              />
              <ErrorMessage
                name="status"
                component="div"
                className="text-red-500 text-sm"
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-4 mt-6">
              <button
                type="button"
                onClick={() =>
                  router.push("/dashboard/settings/customer/customerType")
                }
                className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>

              <SidebarBtn
                label="Update"
                isActive
                leadingIcon="mdi:check"
                type="submit"
              />
            </div>
          </Form>
        )}
      </Formik>
    </ContainerCard>
  );
}
