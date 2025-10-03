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
import { addRoles, getRoleById, editRoles } from "@/app/services/allApi";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
import Loading from "@/app/components/Loading";

const RoleSchema = Yup.object().shape({
  role_name: Yup.string().required("Role Name is required."),
  role_activity: Yup.string().required("Role Activity is required."),
  menu_id: Yup.string().required("Menu Id is required."),
  agent_id: Yup.string().required("Agent Id is required."),
  warehouse_id: Yup.string().required("Warehouse Id is required."),
  status: Yup.string().required("Status is required."),
});

export default function AddEditRole() {
  const { warehouseOptions,menuOptions }  = useAllDropdownListData();
  const { showSnackbar } = useSnackbar();
  const router = useRouter();
  const params = useParams();
  const [isOpen, setIsOpen] = useState(false);
  const [initialValues, setInitialValues] = useState({
    role_name: "",
    role_activity: "",
    menu_id: "",
    agent_id: "",
    warehouse_id: "",
    status: "1",
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(false);

  type RoleFormValues = {
    role_name: string;
    role_activity: string;
    menu_id: string;
    agent_id: string;
    warehouse_id: string;
    status: string;
  };

  useEffect(() => {
    if (params?.uuid && params.uuid !== "add") {
      setIsEditMode(true);
      setLoading(true);
      (async () => {
        try {
          const res = await getRoleById(String(params.uuid));
          if (res?.data) {
            setInitialValues({
              role_name: res.data.role_name || "",
              role_activity: String(res.data.role_activity ?? ""),
              menu_id: res.data.menu_id ? String(res.data.menu_id) : "",
              agent_id: res.data.agent_id ? String(res.data.agent_id) : "",
              warehouse_id: res.data.warehouse_id ? String(res.data.warehouse_id) : "",
              status: String(res.data.status ?? ""),
            });
          }
        } catch (error) {
          console.error("Failed to fetch role", error);
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [params?.uuid]);

  const handleSubmit = async (
    values: RoleFormValues,
    { setSubmitting }: FormikHelpers<RoleFormValues>
  ) => {
    const payload = {
      ...values,
      status: Number(values.status),
      role_activity: Number(values.role_activity),
      agent_id: Number(values.agent_id),
      warehouse_id: Number(values.warehouse_id),
    };
    let res;
    if (isEditMode && params?.uuid !== "add") {
      res = await editRoles(String(params.uuid), payload);
    } else {
      res = await addRoles(payload);
    }
    if (res.error) {
      showSnackbar(res.data?.message || "Failed to submit form", "error");
    } else {
      showSnackbar(
        res.message || (isEditMode ? "Role Updated Successfully" : "Role Created Successfully"),
        "success"
      );
      router.push("/dashboard/settings/role");
    }
    setSubmitting(false);
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
          <Link href="/dashboard/settings/role">
            <Icon icon="lucide:arrow-left" width={24} />
          </Link>
          <h1 className="text-xl font-semibold text-gray-900">
            {isEditMode ? "Edit Role" : "Add New Role"}
          </h1>
        </div>
      </div>
      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={RoleSchema}
        onSubmit={handleSubmit}
      >
        {({ handleSubmit, values, setFieldValue, errors, touched }) => (
          <Form onSubmit={handleSubmit}>
            <div className="bg-white rounded-2xl shadow divide-y divide-gray-200 mb-6">
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-800 mb-4">
                  Role Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <InputFields
                      required
                      label="Role Name"
                      value={values.role_name}
                      onChange={(e) => setFieldValue("role_name", e.target.value)}
                    />
                    <ErrorMessage
                      name="role_name"
                      component="span"
                      className="text-xs text-red-500"
                    />
                  </div>
                  <div>
                    <InputFields
                      required
                      label="Role Activity"
                      value={values.role_activity}
                      onChange={(e) => setFieldValue("role_activity", e.target.value)}
                    />
                    <ErrorMessage
                      name="role_activity"
                      component="span"
                      className="text-xs text-red-500"
                    />
                  </div>
                  <div>
                    <InputFields
                      required
                      label="Menu"
                      value={values.menu_id}
                      options={menuOptions}
                      onChange={(e) => setFieldValue("menu_id", e.target.value)}
                    />
                    <ErrorMessage
                      name="menu_id"
                      component="span"
                      className="text-xs text-red-500"
                    />
                  </div>
                  <div>
                    <InputFields
                      required
                      label="Agent"
                      value={values.agent_id}
                      onChange={(e) => setFieldValue("agent_id", e.target.value)}
                    />
                    <ErrorMessage
                      name="agent_id"
                      component="span"
                      className="text-xs text-red-500"
                    />
                  </div>
                  <div>
                    <InputFields
                      required
                      label="Warehouse"
                      value={String(values.warehouse_id)}
                      options={warehouseOptions}
                      onChange={(e) => setFieldValue("warehouse_id", e.target.value)}
                    />
                    <ErrorMessage
                      name="warehouse_id"
                      component="span"
                      className="text-xs text-red-500"
                    />
                  </div>
                  <div>
                    <InputFields
                      required
                      label="Status"
                      value={values.status}
                      onChange={(e) => setFieldValue("status", e.target.value)}
                      type="radio"
                      options={[
                        { value: "1", label: "Active" },
                        { value: "0", label: "Inactive" },
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
            <div className="flex justify-end gap-4 mt-6 pr-0">
              <button
                type="button"
                className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
                onClick={() => router.push("/dashboard/settings/role")}
              >
                Cancel
              </button>
              <SidebarBtn
                label={isEditMode ? "Update" : "Submit"}
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