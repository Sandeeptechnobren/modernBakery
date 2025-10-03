"use client";

import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Formik, Form, ErrorMessage, type FormikHelpers } from "formik";
import * as Yup from "yup";
import InputFields from "@/app/components/inputFields";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import { useSnackbar } from "@/app/services/snackbarContext";
import Loading from "@/app/components/Loading";
import { createDiscountType, getDiscountTypeById, updateDiscountType } from "@/app/services/allApi";

const DiscountTypeSchema = Yup.object().shape({
  discount_name: Yup.string().required("Discount name is required").max(100),
  discount_status: Yup.string().required("Status is required").oneOf(["1", "0"], "Invalid status"),
});

type DiscountTypeFormValues = {
  discount_name: string;
  discount_status: string;
};

export default function AddEditDiscountType() {
  const { showSnackbar } = useSnackbar();
  const router = useRouter();
  const params = useParams();
  const [initialValues, setInitialValues] = useState<DiscountTypeFormValues>({
    discount_name: "",
    discount_status: "",
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (params?.id && params.id !== "add") {
      setIsEditMode(true);
      setLoading(true);
      (async () => {
        try {
          const res = await getDiscountTypeById(String(params.id));
          if (res?.data) {
            setInitialValues({
              discount_name: res.data.discount_name || "",
              discount_status: String(res.data.discount_status ?? "1"),
            });
          }
        } catch (error) {
          console.error("Failed to fetch discount type", error);
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [params?.id]);

  const handleSubmit = async (
    values: DiscountTypeFormValues,
    { setSubmitting }: FormikHelpers<DiscountTypeFormValues>
  ) => {
    const payload = {
      discount_name: values.discount_name,
      discount_status: Number(values.discount_status),
    };
    try {
      let res;
      if (isEditMode && params?.id !== "add") {
        res = await updateDiscountType(String(params.id), payload);
      } else {
        res = await createDiscountType(payload);
      }
      if (res?.error) {
        showSnackbar(res.data?.message || "Failed to submit form", "error");
      } else {
        showSnackbar(
          res.message || (isEditMode ? "Discount Type Updated Successfully" : "Discount Type Created Successfully"),
          "success"
        );
        router.push("/dashboard/settings/customer/discountType");
      }
    } catch (err) {
      showSnackbar("Failed to submit form", "error");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (isEditMode && loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-x-hidden p-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/settings/customer/discountType">
            <Icon icon="lucide:arrow-left" width={24} />
          </Link>
          <h1 className="text-xl font-semibold text-gray-900">
            {isEditMode ? "Edit Discount Type" : "Add New Discount Type"}
          </h1>
        </div>
      </div>
      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={DiscountTypeSchema}
        onSubmit={handleSubmit}
      >
        {({ handleSubmit, values, setFieldValue, errors, touched, isSubmitting }) => (
          <Form onSubmit={handleSubmit}>
            <div className="bg-white rounded-2xl shadow divide-y divide-gray-200 mb-6">
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-800 mb-4">
                  Discount Type Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <InputFields
                      required
                      label="Discount Name"
                      value={values.discount_name}
                      onChange={(e) => setFieldValue("discount_name", e.target.value)}
                    />
                    <ErrorMessage
                      name="discount_name"
                      component="span"
                      className="text-xs text-red-500"
                    />
                  </div>
                  <div>
                    <InputFields
                      required
                      label="Status"
                      name="discount_status"
                      
                      value={values.discount_status}
                      options={[
                        { value: "1", label: "Active" },
                        { value: "0", label: "Inactive" },
                      ]}
                      onChange={(e) => setFieldValue("discount_status", e.target.value)}
                      type="radio"
                      error={errors?.discount_status && touched?.discount_status ? errors.discount_status : false}
                    />
                    <ErrorMessage
                      name="discount_status"
                      component="span"
                      className="text-xs text-red-500"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-4 mt-6 pr-0">
              <button
                type="reset"
                className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <SidebarBtn
                label={isEditMode ? "Update" : "Submit"}
                isActive={!isSubmitting}
                leadingIcon="mdi:check"
                type="submit"
                disabled={isSubmitting}
              />
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}
