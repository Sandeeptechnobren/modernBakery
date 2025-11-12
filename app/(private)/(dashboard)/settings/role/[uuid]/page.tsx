"use client";

import ContainerCard from "@/app/components/containerCard";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
import usePermissionManager from "@/app/components/contexts/usePermission";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import InputFields from "@/app/components/inputFields";
import TabBtn from "@/app/components/tabBtn";
import { addRoles, assignPermissionsToRole, editRoles, getRoleById, menuList, submenuList } from "@/app/services/allApi";
import { useLoading } from "@/app/services/loadingContext";
import { useSnackbar } from "@/app/services/snackbarContext";
import { Icon } from "@iconify-icon/react";
import { Form, Formik, type FormikHelpers } from "formik";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import * as Yup from "yup";
import RolesPermissionTable, { MenuItem } from "./table2";

interface Permission {
  permission_id: number;
  permission_name: string;
  [key: string]: any;
}

interface Submenu {
  id: number;
  uuid?: string | null;
  osa_code?: string | null;
  name: string;
  path?: string | null;
  permissions: Permission[];
  [key: string]: any;
}

interface RoleFormValues {
  name: string;
  labels: string[];
  status: string;
}

const RoleSchema = Yup.object().shape({
  name: Yup.string().required("Role Name is required."),
  labels: Yup.array().of(Yup.string()).min(1, "At least one label is required."),
  status: Yup.string().optional(),
});

export default function AddEditRole() {
  const { labelOptions, permissions } = useAllDropdownListData();
  const { showSnackbar } = useSnackbar();
  const router = useRouter();
  const params = useParams();
  const { preload, refresh } = usePermissionManager();
  const [initialValues, setInitialValues] = useState<RoleFormValues>({
    name: "",
    labels: [],
    status: "1"
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const { setLoading } = useLoading();
  useEffect(() => setLoading(true), []);
  const [activeTab, onTabClick] = useState(0);

  const [roleTableData, setRoleTableData] = useState<MenuItem[]>([]);
  const [tablePermissionIds, setTablePermissionIds] = useState<number[]>([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        if (params?.uuid && params.uuid !== "add") {
          // 🟩 EDIT MODE
          setIsEditMode(true);
          const [roleRes, menuRes, submenuRes] = await Promise.all([
            getRoleById(String(params.uuid)),
            menuList(),
            submenuList(),
          ]);

          if (roleRes.error) {
            showSnackbar(roleRes?.data?.message || "Failed to fetch role data", "error");
            return;
          }
          const roleData = roleRes?.data || [];
          const menusFromRes = Array.isArray(roleData?.menus) ? roleData.menus : [];
          const menusFromApi = menuRes?.data || [];
          const submenusFromApi = submenuRes?.data || [];

          const baseRows = menusFromApi.map((m: any) => {
            const children = submenusFromApi
              .filter((sm: any) => {
                const parentId = sm?.menu?.id || sm?.menu_id;
                return parentId === m.id || parentId === m.uuid;
              })
              .map((sm: any) => ({
                id: sm.id,
                uuid: sm.uuid,
                osa_code: sm.osa_code ?? sm.code,
                name: sm.name,
                permissions: Array.isArray(sm.permissions) ? sm.permissions : [],
                path: sm.path,
              }));
            return { ...m, submenu: children };
          });

          // Merge role permissions
          const roleMenusById = new Map<number, Map<number, Permission[]>>();
          (menusFromRes || []).forEach((rm: any) => {
            const menuId = Number(rm.id ?? rm.menu?.id ?? rm.menu_id);
            if (!Number.isFinite(menuId)) return;
            const subArr = Array.isArray(rm.submenu)
              ? rm.submenu
              : Array.isArray(rm.menu?.submenu)
                ? rm.menu.submenu
                : [];
            const subMap = new Map<number, Permission[]>();
            (subArr || []).forEach((s: any) => {
              const sid = Number(s.id ?? s.submenu_id);
              if (!Number.isFinite(sid)) return;
              subMap.set(sid, Array.isArray(s.permissions) ? [...s.permissions] : []);
            });
            roleMenusById.set(menuId, subMap);
          });

          const merged = baseRows.map((base: any) => {
            const subMap = roleMenusById.get(Number(base.id));
            const mergedSubs = base.submenu.map((s: any) => {
              const perms = subMap?.get(Number(s.id)) || s.permissions || [];
              return { ...s, permissions: perms };
            });
            return { ...base, submenu: mergedSubs };
          });

          setRoleTableData(merged);
          setInitialValues({
            name: String(roleData?.name ?? ""),
            labels: Array.isArray(roleData?.labels)
              ? roleData.labels.map((obj: { id: number }) => String(obj.id))
              : [],
            status: String(roleData?.status ?? "1"),
          });
          onTabClick(0);
        } else {
          // 🟩 ADD MODE
          setIsEditMode(false);
          const [menuRes, submenuRes] = await Promise.all([menuList(), submenuList()]);
          if (menuRes.error || submenuRes.error) {
            showSnackbar("Failed to load menus or submenus", "error");
            return;
          }

          const menusFromApi = menuRes.data || [];
          const submenusFromApi = submenuRes.data || [];

          const baseRows = menusFromApi.map((m: any) => {
            const children = submenusFromApi
              .filter((sm: any) => {
                const parentId = sm?.menu?.id || sm?.menu_id;
                return parentId === m.id || parentId === m.uuid;
              })
              .map((sm: any) => ({
                id: sm.id,
                uuid: sm.uuid,
                osa_code: sm.osa_code ?? sm.code,
                name: sm.name,
                permissions: Array.isArray(sm.permissions) ? sm.permissions : [],
                path: sm.path,
              }));
            return { ...m, submenu: children };
          });

          setRoleTableData(baseRows);
          onTabClick(0);
        }
      } catch (error) {
        console.error("Error fetching role/menu/submenu data:", error);
        showSnackbar("Failed to load data", "error");
      } finally {
        setLoading(false);
      }
    })();
  }, [params?.uuid]);


  const handleSubmit = async (
  values: RoleFormValues,
  { setSubmitting }: FormikHelpers<RoleFormValues>
) => {
  setLoading(true);

  try {
    const payload = {
      ...values,
      labels: values.labels?.map(Number) || [],
    };

    const permsMap = new Map<number, Set<string>>();

    const resolveMenuId = (m: any): number | null => {
      const raw =
        m?.id ??
        m?.menu?.id ??
        m?.menus?.[0]?.menu?.id ??
        m?.menus?.[0]?.id ??
        null;
      const num = Number(raw);
      return Number.isFinite(num) ? num : null;
    };

    roleTableData.forEach((menu) => {
      const menuId = resolveMenuId(menu);
      if (menuId === null) return;

      const subs = Array.isArray(menu.submenu)
        ? menu.submenu
        : Array.isArray(menu.menus?.[0]?.menu?.submenu)
        ? menu.menus[0].menu.submenu
        : [];

      subs.forEach((sub: any) => {
        const submenuId = Number(sub?.id ?? sub?.submenu_id ?? sub?.uuid);
        if (!Number.isFinite(submenuId)) return;

        const perms = Array.isArray(sub.permissions) ? sub.permissions : [];
        perms.forEach((p: any) => {
          const pid = Number(p.permission_id ?? p.id);
          if (!Number.isFinite(pid)) return;
          if (!permsMap.has(pid)) permsMap.set(pid, new Set());
          permsMap.get(pid)!.add(`${menuId}:${submenuId}`);
        });
      });
    });

    const permissionsPayload = Array.from(permsMap.entries()).map(
      ([permission_id, set]) => ({
        permission_id,
        menus: Array.from(set).map((k) => {
          const [mId, sId] = k.split(":");
          return { menu_id: Number(mId), submenu_id: Number(sId) };
        }),
      })
    );

    let res;
    let permissionRes;

    // 🔄 ADD or EDIT MODE
    if (isEditMode && params?.uuid !== "add") {
      // ✏️ EDIT MODE
      res = await editRoles(String(params.uuid), payload);

      if (res?.error)
        throw new Error(res?.data?.message || "Failed to update role");

      permissionRes = await assignPermissionsToRole(String(params.uuid), {
        permissions: permissionsPayload,
      });

      if (permissionRes?.error)
        throw new Error(
          permissionRes?.data?.message || "Failed to assign permissions"
        );
    } else {
      // ➕ ADD MODE
      res = await addRoles(payload);

      // ✅ FIX: Accept id or uuid if either exists
      const newRoleUuid = String(
        res?.data?.uuid || res?.data?.id || res?.uuid || res?.id || ""
      );

      if (res?.error || !newRoleUuid) {
        console.error("addRoles response:", res);
        throw new Error(res?.data?.message || "Failed to create role");
      }

      permissionRes = await assignPermissionsToRole(newRoleUuid, {
        permissions: permissionsPayload,
      });

      if (permissionRes?.error)
        throw new Error(
          permissionRes?.data?.message ||
            "Failed to assign permissions to newly created role"
        );
    }

    // ✅ Handle success message
    const successMessage =
      res?.data?.message ||
      res?.message ||
      (isEditMode ? "Role updated successfully" : "Role created successfully");

    showSnackbar(successMessage, "success");

    // 🔁 Refresh permission cache
    try {
      if (refresh) await refresh({ force: true });
      else await preload();
    } catch (cacheErr) {
      console.error("Failed to refresh permissions after role change:", cacheErr);
    }

    // 🔀 Navigate to roles list
    router.push("/settings/role");
  } catch (error: any) {
    console.error("Error in handleSubmit:", error);
    const errMsg =
      error?.response?.data?.message ||
      error?.message ||
      "Something went wrong while saving role";
    showSnackbar(errMsg, "error");
  } finally {
    setLoading(false);
    setSubmitting(false);
  }
};




  return (
    <div className="w-full h-full overflow-x-hidden p-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link href="/settings/role">
            <Icon icon="lucide:arrow-left" width={24} />
          </Link>
          <h1 className="text-xl font-semibold text-gray-900">
            {isEditMode ? "Update Role" : "Add New Role"}
          </h1>
        </div>
      </div>
      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={RoleSchema}
        onSubmit={handleSubmit}
      >
        {({ handleSubmit, isSubmitting, values, setFieldValue, errors, touched, setFieldTouched }) => (
          <Form onSubmit={handleSubmit}>
            <div className="bg-white rounded-2xl mb-6">
              {/* <h2 className="text-lg font-medium text-gray-800 mb-4">
                Role Details
              </h2> */}
              <ContainerCard>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                  <div>
                    <InputFields
                      required
                      label="Role Name"
                      value={values.name}
                      onChange={(e) => setFieldValue("name", e.target.value)}
                      error={touched.name && errors.name}
                    />
                  </div>
                  <div>
                    <InputFields
                      required
                      label="Labels"
                      name="labels"
                      value={values.labels}
                      isSingle={false}
                      options={labelOptions}
                      onChange={(e) => setFieldValue("labels", e.target.value)}
                      onBlur={() => setFieldTouched && setFieldTouched('labels', true)}
                      error={touched.labels ? (Array.isArray(errors.labels) ? (errors.labels as string[]).join(", ") : (errors.labels as string)) : undefined}
                    />

                  </div>
                  <div>
                    <InputFields
                      required
                      label="Status"
                      name="status"
                      type="radio"
                      value={values.status}
                      onChange={(e) => setFieldValue("status", e.target.value)}
                      options={[
                        { value: "1", label: "Active" },
                        { value: "0", label: "Inactive" },
                      ]}
                      error={touched.status && errors.status}
                    />
                  </div>
                </div>

                {/* Permissions table replaces select input — parent only updates local state.
                  onRowsChange is scheduled async to avoid setState during child render */}
                {roleTableData && roleTableData.length > 0 && (
                  <div className="py-6">
                    <ContainerCard
                      className="w-full flex gap-[4px] overflow-x-auto"
                      padding="5px"
                    >
                      {roleTableData.map((tab, index) => {
                        const label = tab.name || "Menu";
                        return (
                          <div key={index}>
                            <TabBtn
                              label={label}
                              isActive={activeTab === index}
                              onClick={() => onTabClick(index)}
                            />
                          </div>
                        );
                      })}
                    </ContainerCard>

                    <RolesPermissionTable
                      menus={roleTableData}
                      activeIndex={activeTab}
                      onMenusChange={(menus: MenuItem[], permissionIds: number[]) => {
                        setTimeout(() => {
                          try {
                            const incomingJson = JSON.stringify(menus || []);
                            const currentJson = JSON.stringify(roleTableData || []);
                            if (incomingJson === currentJson) return;
                          } catch (e) { }
                          setRoleTableData(menus || []);
                          setTablePermissionIds(permissionIds || []);
                          console.log("Updated menus from table:", menus);
                          console.log("Updated permission IDs from table:", permissionIds);
                        }, 0);
                      }}
                    />
                  </div>
                )}

              </ContainerCard>
            </div>

            <div className="flex justify-end gap-4 mt-6 pr-0">
              <button
                type="button"
                className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
                onClick={() => router.push("/settings/role")}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <SidebarBtn
                label={isEditMode ? "Update" : "Submit"}
                isActive={true}
                disabled={isSubmitting}
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