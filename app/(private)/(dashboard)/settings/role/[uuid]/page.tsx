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
import { addRoles, getRoleById, editRoles, menuList, submenuList, assignPermissionsToRole } from "@/app/services/allApi";
import { useLoading } from "@/app/services/loadingContext";
import RolesPermissionTable, { MenuItem } from "./table2";
import ContainerCard from "@/app/components/containerCard";
import TabBtn from "@/app/components/tabBtn";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";

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
  labels: Yup.array().of(Yup.string()).required("At least one label is required."),
  status: Yup.string().optional(),
});

export default function AddEditRole() {
  const { labelOptions, permissions } = useAllDropdownListData();
  const { showSnackbar } = useSnackbar();
  const router = useRouter();
  const params = useParams();
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
    if (params?.uuid && params.uuid !== "add") {
      setIsEditMode(true);
      setLoading(true);
      (async () => {
        try {
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

          // extract menus and submenus from their APIs
          if(menuRes.error){
            showSnackbar(menuRes?.data?.message || "Failed to fetch menu data", "error");
            return;
          }
          const menusFromApi = menuRes?.data || [];

          if(submenuRes.error){
            showSnackbar(submenuRes?.data?.message || "Failed to fetch submenu data", "error");
            return;
          }
          const submenusFromApi = submenuRes?.data || [];

          const baseRows = (Array.isArray(menusFromApi) ? menusFromApi : []).map((m: any) => {
            // find submenus that belong to this menu (submenu.menu.id or submenu.menu?.id)
            const children = (Array.isArray(submenusFromApi) ? submenusFromApi : []).filter(
              (sm: any) => {
                const parentId = sm?.menu?.id || null;
                return parentId === m.id || parentId === m.uuid || sm?.menu?.code === m.osa_code;
              }
            ).map((sm: any) => ({
              id: sm.id,
              uuid: sm.uuid,
              osa_code: sm.osa_code ?? sm.code,
              name: sm.name,
              permissions: Array.isArray(sm.permissions) ? sm.permissions : [],
              // include any other submenu fields you want to keep
              path: sm.path,
            }));

            // simplified menu shape: { id, uuid, osa_code, name, submenu: [...] , ...other }
            return {
              id: m.id,
              uuid: m.uuid,
              osa_code: m.osa_code ?? m.code,
              name: m.name,
              // include any other menu fields you want to keep
              path: m.path,
              submenu: children,
            };
          });

// Simple deterministic merge: map role menus -> submenu permissions by id, then apply to baseRows
          const roleMenusById = new Map<number, Map<number, Permission[]>>();
          (menusFromRes || []).forEach((rm: any) => {
            const menuId = Number(rm.id ?? rm.menu?.id ?? rm.menu_id);
            if (!Number.isFinite(menuId)) return;
            const subArr = Array.isArray(rm.submenu) ? rm.submenu : (Array.isArray(rm.menu?.submenu) ? rm.menu.submenu : []);
            const subMap = new Map<number, Permission[]>();
            (subArr || []).forEach((s: any) => {
              const sid = Number(s.id ?? s.submenu_id);
              if (!Number.isFinite(sid)) return;
              subMap.set(sid, Array.isArray(s.permissions) ? JSON.parse(JSON.stringify(s.permissions)) : []);
            });
            roleMenusById.set(menuId, subMap);
          });

          const merged = baseRows.map((base: any) => {
            const mid = Number(base.id);
            const subMap = roleMenusById.get(mid);
            const mergedSubs = (base.submenu || []).map((s: any) => {
              const sid = Number(s.id);
              const perms = subMap && subMap.has(sid) ? subMap.get(sid) : (Array.isArray(s.permissions) ? s.permissions : []);
              return { ...s, permissions: Array.isArray(perms) ? JSON.parse(JSON.stringify(perms)) : [] };
            });
            return { ...base, submenu: mergedSubs };
          });

          setRoleTableData(merged);
          // populate Formik initial values from roleData so form fields autofill
          setInitialValues({
            name: String(roleData?.name ?? ""),
            labels: Array.isArray(roleData?.labels) ? roleData.labels.map((obj: {id: number}) => String(obj.id)) : [],
            status: String(roleData?.status ?? "1"),
          });
          // compute permission ids from merged structure and store
          const permIdSet = new Set<number>();
           merged.forEach((m: any) => {
            (m.submenu || []).forEach((s: any) => {
              (s.permissions || []).forEach((p: any) => {
                const id = Number(p.permission_id ?? p.id);
                if (!Number.isNaN(id)) permIdSet.add(id);
              });
            });
          });
          setTablePermissionIds(Array.from(permIdSet));
          // ensure first tab is active
          onTabClick(0);
          console.log("Merged role menus/submenus/permissions:", merged);
          console.log("Computed permission IDs:", Array.from(permIdSet));
        } catch (error) {
          console.error("Failed to fetch roles/menus/submenus", error);
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
      labels: values.labels.map(Number) || [],
    };

    // Build permissions payload in shape:
    // { permissions: [ { permission_id, menus: [{ menu_id, submenu_id }, ...] }, ... ] }
    const permsMap = new Map<number, Set<string>>();
    const resolveMenuId = (m: any): number | null => {
      const raw = m?.id ?? m?.menu?.id ?? m?.menus?.[0]?.menu?.id ?? m?.menus?.[0]?.id ?? null;
      const num = Number(raw);
      return Number.isFinite(num) ? num : null;
    };

    roleTableData.forEach((menu) => {
      const menuId = resolveMenuId(menu);
      if (menuId === null) {
        // debug: missing/incorrect menu id shape
        console.warn("Skipping menu with missing id:", menu);
        return;
      }
      const subs = Array.isArray(menu.submenu) ? menu.submenu : (Array.isArray(menu.menus?.[0]?.menu?.submenu) ? menu.menus[0].menu.submenu : []);
      subs.forEach((sub: any) => {
        const submenuId = Number(sub?.id ?? sub?.submenu_id ?? sub?.uuid);
        if (!Number.isFinite(submenuId)) {
          console.warn("Skipping submenu with missing id under menu", menuId, sub);
          return;
        }
        const perms = Array.isArray(sub.permissions) ? sub.permissions : [];
        perms.forEach((p: any) => {
          const pid = Number(p.permission_id ?? p.id);
          if (!Number.isFinite(pid)) return;
          if (!permsMap.has(pid)) permsMap.set(pid, new Set());
          permsMap.get(pid)!.add(`${menuId}:${submenuId}`);
        });
      });
    });

    const permissionsPayload = Array.from(permsMap.entries()).map(([permission_id, set]) => ({
      permission_id,
      menus: Array.from(set).map((k) => {
        console.log(k);
        const [mId, sId] = k.split(":");
        return { menu_id: Number(mId), submenu_id: Number(sId) };
      }),
    }));

    setLoading(true);
    let res;
    if (isEditMode && params?.uuid !== "add") {
      // update role first
      res = await editRoles(String(params.uuid), payload);
      if (res?.error) {
        setLoading(false);
        showSnackbar(res.data?.message || "Failed to update role", "error");
        setSubmitting(false);
        return;
      }

      // then assign permissions in required shape
      const permissionRes = await assignPermissionsToRole(String(params.uuid), { permissions: permissionsPayload });
      if (permissionRes?.error) {
        setLoading(false);
        showSnackbar(permissionRes.data?.message || "Failed to assign permissions", "error");
        setSubmitting(false);
        return;
      }
    } else {
      // create new role (if API requires permissions on create, send them accordingly)
      res = await addRoles(payload);
      // optionally call assignPermissionsToRole for new role if needed:
      // if (!res?.error && res?.data?.id) {
      //   await assignPermissionsToRole(String(res.data.id), { permissions: permissionsPayload });
      // }
    }
    setLoading(false);
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
        {({ handleSubmit, isSubmitting, values, setFieldValue, errors, touched }) => (
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
                    {errors.name && (
                        <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                    )}
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
                      error={touched.labels && (Array.isArray(errors.labels) ? errors.labels.join(", ") : errors.labels)}
                    />
                    {errors.labels && (
                        <p className="text-red-500 text-sm mt-1">{Array.isArray(errors.labels) ? errors.labels.join(", ") : errors.labels}</p>
                      )}
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
                      {errors.status && (
                        <p className="text-red-500 text-sm mt-1">{errors.status}</p>
                      )}
                  </div>
                </div>

                {/* Permissions table replaces select input — parent only updates local state.
                  onRowsChange is scheduled async to avoid setState during child render */}
                {isEditMode && <div className="py-6">

                  <ContainerCard
                      className="w-full flex gap-[4px] overflow-x-auto"
                      padding="5px"
                  >
                      {roleTableData.map((tab, index) => {
                      const label = tab.name || "Menu";
                      return (
                        <div key={index}>
                          <TabBtn label={label} isActive={activeTab === index} onClick={() => onTabClick(index)} />
                        </div>
                      );
                    })}
                  </ContainerCard>

                  {roleTableData && roleTableData.length > 0 && <RolesPermissionTable
                    menus={roleTableData}
                    activeIndex={activeTab}
                    onMenusChange={(menus: MenuItem[], permissionIds: number[]) => {
                      // update asynchronously to be safe (avoid setState during child render)
                      setTimeout(() => {
                        try {
                          const incomingJson = JSON.stringify(menus || []);
                          const currentJson = JSON.stringify(roleTableData || []);
                          if (incomingJson === currentJson) return; // no-op if identical
                        } catch (e) {
                          // ignore stringify errors and proceed to set
                        }
                        setRoleTableData(menus || []);
                        setTablePermissionIds(permissionIds || []);
                        console.log("Updated menus from table:", menus);
                        console.log("Updated permission IDs from table:", permissionIds);
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