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
import {
  addPermission,
  permissionListById,
  updatePermission,
} from "@/app/services/allApi";

const permissionSchema = Yup.object().shape({
  name: Yup.string().required("Name is required."),
});

type permissionType = {
  name: string;
};

export default function AddShelfDisplay() {
  const { setLoading } = useLoading();
  useEffect(() => setLoading(false), [setLoading]);

  const params = useParams();
  const id = params?.id || "";

  const isEditMode = id !== "add" && id !== "";
  let ID = isEditMode ? id : null;

  if (isEditMode) {
    try {
      ID = String(parseInt(id as string, 10));
    } catch (e) {
      throw new Error("Invalid ID");
    }
  }

  if (ID && Array.isArray(ID)) {
    ID = ID[0] || "";
  }

  const { showSnackbar } = useSnackbar();
  const router = useRouter();
  const [permission, setPermission] = useState<permissionType | null>(null);

  useEffect(() => {
    if (!isEditMode) return;
    const fetchPermission = async () => {
      setLoading(true);
      const res = await permissionListById(id as string);
      setLoading(false);
      if (res.error) {
        showSnackbar(
          res.data.message || "Unable to fetch Shelf Display List",
          "error"
        );
        throw new Error("Unable to fetch Shelf Display List");
      } else {
        setPermission(res.data);
      }
    };
    fetchPermission();
  }, []);

  const initialValues: permissionType = {
    name: permission?.name || "",
  };

  const handleSubmit = async (
    values: permissionType,
    { setSubmitting }: FormikHelpers<permissionType>
  ) => {
    const localPayload = {
      name: values.name.trim(),
    };

    setLoading(true);
    let res;
    if (isEditMode && ID) {
      res = await updatePermission(ID, localPayload);
    } else {
      res = await addPermission(localPayload);
    }
    setLoading(false);

    if (res.error) {
      showSnackbar(res.data.message, "error");
      throw new Error("Unable to add Permission");
    } else {
      showSnackbar(res.message || "Permission Added Successfully", "success");
      router.push("/settings/permission");
    }
    setSubmitting(false);
  };

  return (
    <div className="w-full h-full p-4">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/settings/permission">
          <Icon icon="lucide:arrow-left" width={24} />
        </Link>
        <h1 className="text-xl font-semibold">
          {isEditMode ? "Update Permission" : "Add New Permission"}
        </h1>
      </div>

      <Formik
        initialValues={initialValues}
        validationSchema={permissionSchema}
        enableReinitialize={true}
        onSubmit={handleSubmit}
      >
        {({ values, setFieldValue, isSubmitting, touched, errors }) => (
          <Form>
            <ContainerCard>
              {/* <h2 className="text-lg font-semibold mb-6">
                Permission Details
              </h2> */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
              </div>
            </ContainerCard>

            <div className="flex justify-end gap-4 mt-6">
              <button
                // type="reset"
                // onClick={() => router.back()}
              onClick={() => router.push("/settings/permission")}

                className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <SidebarBtn
                type="submit"
                label={
                  isEditMode ? (isSubmitting?"Updating...":"Update" ): (isSubmitting?"Submiting...":"Submit")
                }
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
