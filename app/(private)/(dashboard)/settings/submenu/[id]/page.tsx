"use client";

import React, { use, useEffect, useState } from "react";
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
import { addSubmenu, submenuByUUID, updateSubmenu } from "@/app/services/allApi";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";

const menuSchema = Yup.object().shape({
  name: Yup.string().required("Name is required."),
  menu: Yup.string().required("Menu is required."),
  parent: Yup.string().nullable(),
  url: Yup.string().required("URL is required."),
  display_order: Yup.number()
    .typeError("Display order must be a number.")
    .integer("Display order must be an integer.")
    .min(0, "Display order cannot be negative.")
    .required("Display order is required."),
  action_type: Yup.number()
    .oneOf([0, 1], "Action type must be 0 or 1.")
    .required("Action type is required."),
  is_visible: Yup.number()
    .oneOf([0, 1], "Is Visible must be 0 or 1.")
    .required("Is Visible is required."),
});

type submenuIncomingType = {
  name: string,
  menu: {id: number} | null,
  parent: {id: number} | null,
  url: string,
  display_order: number,
  action_type: number,
  is_visible: number,
}

type submenuType = {
  name: string,
  menu: number,
  parent: number,
  url: string,
  display_order: number,
  action_type: number,
  is_visible: number,
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

  const { submenuOptions, menuOptions } = useAllDropdownListData();
  console.log(useAllDropdownListData());
  const { showSnackbar } = useSnackbar();
  const router = useRouter();
  const [menu, setMenu] = useState<submenuIncomingType | null>(null);

  useEffect(() => {
    if (!isEditMode) return;
    const fetchPermission = async () => {
        setLoading(true);
        const res = await submenuByUUID(id as string);
        setLoading(false);
        if(res.error) {
            showSnackbar(res.data.message || "Unable to Submenu", "error");
            throw new Error("Unable to Submenu");
        } else {
          setMenu(res.data);
        }
    }
    fetchPermission();
  }, []);

  const initialValues: submenuType = {
    name: menu?.name ?? "",
    // Use nullish coalescing and parentheses to avoid precedence issues
    menu: (menu?.menu?.id ?? (menuOptions.length > 0 ? parseInt(menuOptions[0]?.value) : 0)),
    // If API explicitly returns parent: null => select "None" (value 0).
    parent: menu
      ? (menu.parent === null
          ? 0
          : (menu.parent?.id ?? (submenuOptions.length > 0 ? parseInt(submenuOptions[0]?.value) : 0)))
      : (submenuOptions.length > 0 ? parseInt(submenuOptions[0]?.value) : 0),
    url: menu?.url ?? "",
    display_order: menu?.display_order ?? 0,
    action_type: menu?.action_type ?? 1,
    is_visible: menu?.is_visible ?? 0,
  };

  const handleSubmit = async (
    values: submenuType,
    { setSubmitting }: FormikHelpers<submenuType>
  ) => {
    const localPayload = {
      name: values.name.trim(),
      menu_id: Number(values.menu) || 0,
      parent_id: Number(values.parent) === 0 ? null : Number(values.parent) || null,
      url: values.url || "",
      display_order: Number(values.display_order) || 0,
      action_type: Number(values.action_type) || 0,
      is_visible: Number(values.is_visible) || 0,
    };

    setLoading(true);
    let res;
    if (isEditMode && ID) {
      res = await updateSubmenu(ID, localPayload);
    } else {
      res = await addSubmenu(localPayload);
    }
    setLoading(false);

    if(res.error) {
      showSnackbar(res.data.message, "error");
      throw new Error("Unable to add submenu");
    } else {
      showSnackbar(res.message || "Submenu Added Successfully", "success");
      router.push("/settings/submenu");
    }
    setSubmitting(false);
  };
  
  return (
    <div className="w-full h-full p-4">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/settings/submenu">
          <Icon icon="lucide:arrow-left" width={24} />
        </Link>
        <h1 className="text-xl font-semibold">{isEditMode ? "Update Submenu" : "Add New Submenu"}</h1>
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
                {/* Name */}
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

                {/* menu */}
                <div>
                  <InputFields
                    required
                    label="Menu"
                    name="menu"
                    value={values.menu.toString()}
                    options={menuOptions}
                    onChange={(e) => {setFieldValue("menu", e.target.value)}}
                    error={touched.menu && errors.menu}
                  />
                  <ErrorMessage
                    name="menu"
                    component="span"
                    className="text-xs text-red-500"
                  />
                </div>

                {/* parent */}
                <div>
                  <InputFields
                    required
                    label="Parent"
                    name="parent"
                    value={values.parent.toString()}
                    options={[{label: "None", value: "0"}, ...submenuOptions]}
                    onChange={(e) => setFieldValue("parent", e.target.value)}
                    error={touched.parent && errors.parent}
                  />
                  <ErrorMessage
                    name="parent"
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

                {/* action_type */}
                <div>
                  <InputFields
                    required
                    label="Action Type"
                    name="action_type"
                    value={values.action_type.toString()}
                    onChange={(e) => setFieldValue("action_type", e.target.value)}
                    error={touched.action_type && errors.action_type}
                  />
                  <ErrorMessage
                    name="action_type"
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
                      {label: "No", value: "0"},
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
              </div>
            </ContainerCard>

            <div className="flex justify-end gap-4 mt-6">
              <button
                type="reset"
                onClick={() => router.back()}
                className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <SidebarBtn
                type="submit"
                label={isSubmitting ? "Submitting..." : (isEditMode ? "Update" : "Submit")}
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
