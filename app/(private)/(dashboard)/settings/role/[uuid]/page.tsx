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
import ContainerCard from "@/app/components/containerCard";

const RoleSchema = Yup.object().shape({
  name: Yup.string().required("Role Name is required."),
  // removed permissions validation — we use the permissions table (menus JSON) instead
});

export default function AddEditRole() {
  const { permissions } = useAllDropdownListData();
  const { showSnackbar } = useSnackbar();
  const router = useRouter();
  const params = useParams();
  const [initialValues, setInitialValues] = useState<RoleFormValues>({
    name: "",
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const { setLoading } = useLoading();
  useEffect(() => setLoading(true), []);
  const [guardName, setGuardName] = useState<"api" | "web">("api");

  // hold full nested menus -> submenu -> permissions JSON from table
  const [roleTableRows, setRoleTableRows] = useState<any[]>([]);
  // optional: keep last permission ids computed by table (if needed)
  const [tablePermissionIds, setTablePermissionIds] = useState<number[]>([]);

  type RoleFormValues = {
    name: string;
  };

  useEffect(() => {
    if (params?.uuid && params.uuid !== "add") {
      console.log("Edit mode for role ID:", params.uuid);
      setIsEditMode(true);
      setLoading(true);
      (async () => {
        try {
          const res = await getRoleById(String(params.uuid));
          if (res?.data) {
            setInitialValues({
              name: res.data.name || "",
            });

            // seed the table rows with incoming nested menus if provided by API
            const menusFromRes =
              Array.isArray(res.data.menus) ? res.data.menus
                : Array.isArray(res.data.data) ? res.data.data
                  : Array.isArray(res.data) ? res.data
                    : [];
            if (menusFromRes && menusFromRes.length) {
              setRoleTableRows(menusFromRes);
            }
          }
        } catch (error) {
          console.error("Failed to fetch roles", error);
        } finally {
          setLoading(false);
        }
      })();
    } else setLoading(false);
  }, [params?.uuid, setLoading]);

  const handleSubmit = async (
    values: RoleFormValues,
    { setSubmitting }: FormikHelpers<RoleFormValues>
  ) => {
    const payload = {
      ...values,
      guard_name: guardName,
      // include the nested menus JSON exactly as the table produces
      menus: roleTableRows,
    };
    let res;
    if (isEditMode && params?.uuid !== "add") {
      res = await editRoles(String(params.uuid), payload);
    } else {
      res = await addRoles(payload);
    }
    if (res?.error) {
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
            <div className="bg-white rounded-2xl mb-6">
              {/* <h2 className="text-lg font-medium text-gray-800 mb-4">
                Role Details
              </h2> */}
              <ContainerCard>
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
                </div>

                {/* Permissions table replaces select input — parent only updates local state.
                  onRowsChange is scheduled async to avoid setState during child render */}
                {isEditMode && <div className="p-6">
                  {roleTableRows && roleTableRows.length > 0 && <RolesPermissionTable
                    data={roleTableRows.length ? roleTableRows : undefined}
                    onRowsChange={(rows, permissionIds) => {
                      // avoid infinite loop: only update parent state if incoming rows actually changed
                      try {
                        const incomingJson = JSON.stringify(rows || []);
                        const currentJson = JSON.stringify(roleTableRows || []);
                        if (incomingJson === currentJson) return;
                      } catch (e) {
                        // fallback: if stringify fails, still proceed to update once
                      }
                      // update asynchronously to be safe (avoid setState during child render)
                      setTimeout(() => {
                        setRoleTableRows(rows || []);
                        setTablePermissionIds(permissionIds || []);
                      }, 0);
                    }}
                  />}
                </div>}
              </ContainerCard>
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