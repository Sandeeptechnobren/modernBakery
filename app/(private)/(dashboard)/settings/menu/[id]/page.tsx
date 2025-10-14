"use client";

import React, { useEffect, useState } from "react";
import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Formik, Form, ErrorMessage, type FormikHelpers } from "formik";
import * as Yup from "yup";
import ContainerCard from "@/app/components/containerCard";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import InputFields from "@/app/components/inputFields";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useLoading } from "@/app/services/loadingContext";
import { addMenu, addPermission, menuByUUID, updateMenu } from "@/app/services/allApi";

const menuSchema = Yup.object().shape({
  name: Yup.string().required("Name is required."),
  icon: Yup.string().required("Icon is required."),
  url: Yup.string().required("URL is required."),
  display_order: Yup.number()
    .typeError("Display order must be a number.")
    .integer("Display order must be an integer.")
    .min(0, "Display order cannot be negative.")
    .required("Display order is required."),
  is_visible: Yup.number()
    .oneOf([0, 1], "Is Visible must be 0 or 1.")
    .required("Is Visible is required."),
  status: Yup.number()
    .oneOf([0, 1], "Status must be 0 or 1.")
    .required("Status is required."),
});

type menuType = {
  name: string,
  icon: string,
  url: string,
  display_order: number,
  is_visible: number,
  status: number
}

export default function AddShelfDisplay() {
  const { setLoading } = useLoading();
  useEffect(() => setLoading(false), [setLoading]);
  const params = useParams();
  const id = params?.id || "";
  const isEditMode = id !== "add" && id !== "";
  let ID = (isEditMode) ? id : null;
  if(ID && Array.isArray(ID)){
      ID = ID[0] || "";
  }

  const { showSnackbar } = useSnackbar();
  const router = useRouter();
  const [menu, setMenu] = useState<menuType | null>(null);

  useEffect(() => {
    if (!isEditMode) return;
    const fetchPermission = async () => {
        setLoading(true);
        const res = await menuByUUID(id as string);
        setLoading(false);
        if(res.error) {
            showSnackbar(res.data.message || "Unable to Menu", "error");
            throw new Error("Unable to Menu");
        } else {
          setMenu(res.data);
        }
    }
    fetchPermission();
  }, []);

  const initialValues: menuType = {
    name: menu?.name || "",
    icon: menu?.icon || "",
    url: menu?.url || "",
    display_order: menu?.display_order || 0,
    is_visible: menu?.is_visible || 0,
    status: menu?.status || 0
  };

  const handleSubmit = async (
    values: menuType,
    { setSubmitting }: FormikHelpers<menuType>
  ) => {
    const localPayload: menuType = {
      name: values.name.trim(),
      icon: values.icon,
      url: values.url,
      display_order: values.display_order,
      is_visible: values.is_visible,
      status: values.status
    };

    setLoading(true);
    let res;
    if (isEditMode && ID) {
      res = await updateMenu(ID, localPayload);
    } else {
      res = await addMenu(localPayload);
    }
    setLoading(false);

    if(res.error) {
      showSnackbar(res.data.message, "error");
      throw new Error("Unable to add menu");
    } else {
      showSnackbar(res.message || "Menu Added Successfully", "success");
      router.push("/settings/menu");
    }
    setSubmitting(false);
  };
  
  return (
    <div className="w-full h-full p-4">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/settings/menu">
          <Icon icon="lucide:arrow-left" width={24} />
        </Link>
        <h1 className="text-xl font-semibold">{isEditMode ? "Edit Menu" : "Add New Menu"}</h1>
      </div>

      <Formik
        initialValues={initialValues}
        validationSchema={menuSchema}
        enableReinitialize={true}
        onSubmit={handleSubmit}
      >
        {({ values, setFieldValue, isSubmitting, touched, errors }) => (
          <Form>
            <ContainerCard>
              {/* <h2 className="text-lg font-semibold mb-6">
                Menu Details
              </h2> */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <InputFields
                    required
                    label="Name"
                    name="name"
                    value={values.name}
                    onChange={(e) => setFieldValue("name", e.target.value)}
                    error={touched.name && errors.name}
                  />
                  <ErrorMessage
                    name="name"
                    component="span"
                    className="text-xs text-red-500"
                  />
                </div>

                {/* icon */}
                <div>
                  <InputFields
                    required
                    label="Icon"
                    name="icon"
                    value={values.icon}
                    onChange={(e) => setFieldValue("icon", e.target.value)}
                    error={touched.icon && errors.icon}
                  />
                  <ErrorMessage
                    name="icon"
                    component="span"
                    className="text-xs text-red-500"
                  />
                </div>

                {/* url */}
                <div>
                  <InputFields
                    required
                    label="URL"
                    name="url"
                    value={values.url}
                    onChange={(e) => setFieldValue("url", e.target.value)}
                    error={touched.url && errors.url}
                  />
                  <ErrorMessage
                    name="url"
                    component="span"
                    className="text-xs text-red-500"
                  />
                </div>

                {/* display_order */}
                <div>
                  <InputFields
                    required
                    label="Display Order"
                    name="display_order"
                    value={values.display_order.toString()}
                    onChange={(e) => setFieldValue("display_order", e.target.value)}
                    error={touched.display_order && errors.display_order}
                  />
                  <ErrorMessage
                    name="display_order"
                    component="span"
                    className="text-xs text-red-500"
                  />
                </div>

                {/* is_visible */}
                <div>
                  <InputFields
                    required
                    label="Is Visible"
                    name="is_visible"
                    options={[
                      {label: "Yes", value: "1"},
                      {label: "No", value: "0"}
                    ]}
                    value={values.is_visible.toString()}
                    onChange={(e) => setFieldValue("is_visible", e.target.value)}
                    error={touched.is_visible && errors.is_visible}
                  />
                  <ErrorMessage
                    name="is_visible"
                    component="span"
                    className="text-xs text-red-500"
                  />
                </div>
                
                {/* status */}
                <div>
                  <InputFields
                    type="radio"
                    required
                    label="Status"
                    name="status"
                    value={values.status.toString()}
                    onChange={(e) => setFieldValue("status", e.target.value)}
                    options={[
                      { value: "1", label: "Active" },
                      { value: "0", label: "Inactive" },
                    ]}
                    error={touched.status && errors.status}
                  />
                  <ErrorMessage
                    name="status"
                    component="div"
                    className="text-sm text-red-600 mb-1"
                  />
                </div>
              </div>
            </ContainerCard>

            <div className="flex justify-end gap-4 mt-6">
              <button
                type="reset"
                className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <SidebarBtn
                type="submit"
                label={isSubmitting ? "Submitting..." : (isEditMode ? "Update" : "Add")}
                isActive
                leadingIcon="mdi:check"
                disabled={isSubmitting}
              />
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}
