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
import { useLoading } from "@/app/services/loadingContext";
import RolesPermissionTable from "./table2";

const RoleSchema = Yup.object().shape({
  name: Yup.string().required("Role Name is required."),
  permissions: Yup.array().min(1, "Permissions is required.").of(Yup.number().required()).required("Permissions is required."),
});

export default function AddEditRole() {
  const { permissions } = useAllDropdownListData();
  const { showSnackbar } = useSnackbar();
  const router = useRouter();
  const params = useParams();
  const [initialValues, setInitialValues] = useState<RoleFormValues>({
    name: "",
    permissions: []
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const { setLoading } = useLoading();
  useEffect(() => setLoading(true), []);
  const [guardName, setGuardName] = useState<"api" | "web">("api");

  type RoleFormValues = {
    name: string;
    permissions: Array<number>;
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
              name: res.data.name || "",
              permissions: Array.isArray(res.data.permissions)
              ? res.data.permissions.map((perm: string | number) => {
                if (typeof perm === "string") {
                  const found = permissions.find((p) => p.name === perm);
                  return found ? found.id : perm;
                }
                return perm;
                })
              : [],
            });
          }
        } catch (error) {
          console.error("Failed to fetch roles", error);
        } finally {
          setLoading(false);
        }
      })();
    } else setLoading(false);
  }, [params?.uuid]);

  const handleSubmit = async (
    values: RoleFormValues,
    { setSubmitting }: FormikHelpers<RoleFormValues>
  ) => {
    const payload = {
      ...values,
      guard_name: "api",
      permissions: values.permissions.map(Number)
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
      router.push("/settings/role");
    }
    setSubmitting(false);
  };

  return (
    <div className="w-full h-full overflow-x-hidden p-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link href="/settings/role">
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <InputFields
                      required
                      label="Role Name"
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
                    <div>
                    <InputFields
                      required
                      label="Guard Name"
                      value={guardName}
                      options={[
                      { label: "API", value: "api" },
                      { label: "Web", value: "web" }
                      ]}
                      onChange={(e) => setGuardName(e.target.value as "api" | "web")}
                    />
                    </div>
                  <div>
                    <InputFields
                      required
                      label="Permissions"
                      value={values.permissions.map(String)}
                      isSingle={false}
                      options={permissions
                        .filter((opt) => opt.guard_name === guardName)
                        .map((opt) => ({
                          value: String(opt.id),
                          label: opt.name ?? ""
                        }))
                      }
                      onChange={(e) => setFieldValue("permissions", Array.isArray(e.target.value) ? e.target.value.map(Number) : [Number(e.target.value)])}
                      error={touched.permissions && typeof errors.permissions === "string" ? errors.permissions : undefined}
                    />
                    <ErrorMessage
                      name="permissions"
                      component="span"
                      className="text-xs text-red-500"
                    />
                  </div>
                </div>
              </div>
              {/* <RolesPermissionTable /> */}
            </div>
            <div className="flex justify-end gap-4 mt-6 pr-0">
              <button
                type="button"
                className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
                onClick={() => router.push("/settings/role")}
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