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
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
import { createPlanogramImage, planogramImageById, updatePlanogramImage } from "@/app/services/merchandiserApi";
import { File } from "buffer";
import Image from "next/image";

const allowedImageTypes = ["image/jpeg", "image/png", "image/jpg"];

const PlanogramImageSchema = Yup.object().shape({
  customer: Yup.string().required("Please select a customer."),
  merchandiser: Yup.string().required("Please select a merchandiser."),
  shelf: Yup.string().required("Please select a shelf."),
  image: Yup.mixed().nullable().when("image_url", (imageUrlValue, schema) => {
    const isImageUrlPresent = Boolean(imageUrlValue);
    if (isImageUrlPresent) return schema;
    return schema
      .required("Image is required.")
      .test("file-type", "Only jpeg/jpg/png files are allowed.", (value: unknown) => {
        if (!value) return false;
        const val = value as { type?: string; size?: number };
        const isFileLike = typeof val.type === "string" && typeof val.size === "number";
        return isFileLike && allowedImageTypes.includes(val?.type ?? "");
      });
  }),
});

type PlanogramImageFormValues = {
  customer: string;
  merchandiser: string;
  shelf: string;
  image: File | null;
  image_url?: string | null;
};

export default function Page() {
  const { setLoading } = useLoading();
  useEffect(() => setLoading(false), [setLoading]);
  const params = useParams();
  const isEditMode = params?.id !== "add" && params?.id !== "";
  let id = params?.id || "";
  if (id && Array.isArray(id)) {
    id = id[0] || "";
  }

  let parsedId: number | null = null;
  if (isEditMode) {
    try {
      parsedId = parseInt(id as string, 10);
      if (isNaN(parsedId)) parsedId = null;
    } catch (error) {
      parsedId = null;
    }
  }
  const { showSnackbar } = useSnackbar();
  const router = useRouter();
  const { companyCustomersOptions, salesmanOptions, shelvesOptions , ensureCompanyCustomersLoaded, ensureSalesmanLoaded, ensureShelvesLoaded} = useAllDropdownListData();

  // Load dropdown data
  useEffect(() => {
    ensureCompanyCustomersLoaded();
    ensureSalesmanLoaded();
    ensureShelvesLoaded();
  }, [ensureCompanyCustomersLoaded, ensureSalesmanLoaded, ensureShelvesLoaded]);
  const [planogramImagesData, setPlanogramImagesData] = useState<PlanogramImageFormValues | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
      const fetchData = async () => {
        if (parsedId !== null) {
          setLoading(true);
          const res = await planogramImageById(parsedId.toString());
          console.log(res.data);
          console.log(res.data?.customer?.id ? res.data.customer.id : companyCustomersOptions.length > 0 ? companyCustomersOptions[0].value : "");
          setLoading(false);
          if(res.error){
            showSnackbar(res.data.message || "Failed to fetch planogram image data", "error");
          } else {
            setPlanogramImagesData({
              customer: res.data?.customer?.id ? res.data.customer.id : companyCustomersOptions.length > 0 ? companyCustomersOptions[0].value : "",
              merchandiser: res.data?.merchandiser?.id ? res.data.merchandiser.id : salesmanOptions.length > 0 ? salesmanOptions[0].value : "",
              shelf: res.data?.shelf?.id ? res.data.shelf.id : shelvesOptions.length > 0 ? shelvesOptions[0].value : "",
              image: null,
              image_url: res.data?.image_url || null,
            });
            setImageUrl(res.data?.image_url || null);
          }
        }
      };
      fetchData();  
  }, []);

  const initialValues: PlanogramImageFormValues = {
    customer: planogramImagesData?.customer 
      ? planogramImagesData?.customer 
      : companyCustomersOptions.length > 0 ? String(companyCustomersOptions[0].value) : "",
    merchandiser: planogramImagesData?.merchandiser 
      ? planogramImagesData?.merchandiser
      : salesmanOptions.length > 0 ? String(salesmanOptions[0].value) : "",
    shelf: planogramImagesData?.shelf 
      ? planogramImagesData?.shelf
      : shelvesOptions.length > 0 ? String(shelvesOptions[0].value) : "",
    image: null,
    image_url: planogramImagesData?.image_url || null,
  };

  const handleSubmit = async (
    values: PlanogramImageFormValues,
    { setSubmitting }: FormikHelpers<PlanogramImageFormValues>
  ) => {
    const payload = new FormData();
    payload.append("customer_id", values.customer);
    payload.append("merchandiser_id", values.merchandiser);
    payload.append("shelf_id", values.shelf);
    if (values.image) {
      payload.append("image", values.image as Blob);
    }

    let res;
    if(isEditMode && parsedId !== null) {
      res = await updatePlanogramImage(parsedId, payload);
    } else {
      res = await createPlanogramImage(payload);
    }
    if(res.error) {
      showSnackbar(res.data.message || "Unable to add Planogram Image", "error");
    } else {
      showSnackbar("Planogram Image added successfully", "success");
      setSubmitting(false);
      router.push("/merchandiser/planogramImage");
    }
  };

  return(
    <div className={isEditMode && parsedId === null ? "hidden" : "w-full h-full p-4"}>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/merchandiser/planogramImage">
          <Icon icon="lucide:arrow-left" width={24} />
        </Link>
        <h1 className="text-xl font-semibold">{isEditMode ? "Update Planogram Image" : "Add New Planogram Image"}</h1>
      </div>
      <Formik
        initialValues={initialValues}
        validationSchema={PlanogramImageSchema}
        enableReinitialize
        onSubmit={handleSubmit}
      >
        {({ values, setFieldValue, isSubmitting }) => (
          <Form>
            <ContainerCard>
              <h2 className="text-lg font-semibold mb-6">
                  Planogram Image Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <InputFields
                    required
                    label="Customer"
                    name="customer"
                    value={values.customer.toString()}
                    onChange={(e) =>{ setFieldValue("customer", e.target.value)}}
                    options={companyCustomersOptions}
                  />    
                  <ErrorMessage
                    name="customer"
                    component="span"
                    className="text-xs text-red-500"
                  />
                </div>
                <div>
                  <InputFields
                    required
                    label="Merchandiser"
                    name="merchandiser"
                    value={values.merchandiser.toString()}
                    onChange={(e) => {console.log(values);setFieldValue("merchandiser", e.target.value)}}
                    options={salesmanOptions}
                  />    
                  <ErrorMessage
                    name="merchandiser"
                    component="span"
                    className="text-xs text-red-500"
                  />
                </div>
                 <div>
                  <InputFields
                    required
                    label="Shelf"
                    name="shelf"
                    value={values.shelf.toString()}
                    onChange={(e) => setFieldValue("shelf", e.target.value)}
                    options={shelvesOptions}
                  />    
                  <ErrorMessage
                    name="shelf"
                    component="span"
                    className="text-xs text-red-500"
                  />
                </div>
                  <div>
                    <InputFields
                      label="Add Image"
                      name="image"
                      type="file"
                      onChange={(e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = () => {
                            setImageUrl(reader.result as string);
                            setFieldValue("image", (e.target as HTMLInputElement).files?.[0])
                          };
                          reader.readAsDataURL(file);
                        } else {
                          setImageUrl(null);
                          setFieldValue("image", null);
                        }}}
                    />
                    <ErrorMessage
                      name="image"
                      component="span"
                      className="text-xs text-red-500"
                    />
                    {imageUrl ? (
                      <div className="flex flex-col gap-[10px]">
                        <Image
                          width={128}
                          height={128}
                          src={imageUrl}
                          alt="Planogram"
                          className="mt-2 h-32 w-32 object-cover rounded-xl bg-blue-100"
                        />
                      </div>
                    ) : (
                      <div className="mt-2 h-32 w-32 flex items-center justify-center rounded-xl bg-gray-200 text-gray-500">
                        No Image
                      </div>
                    )}
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
                label={isSubmitting ? "Submitting..." : "Submit"}
                isActive={!isSubmitting}
                leadingIcon="mdi:check"
                type="submit"
              />
            </div>
          </Form>
        )}
      </Formik>
    </div>
  )
}
