"use client";

import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Formik, Form, FormikHelpers } from "formik";
import * as Yup from "yup";

import ContainerCard from "@/app/components/containerCard";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import InputFields from "@/app/components/inputFields";
import Loading from "@/app/components/Loading";

import {
    addProject,
    editProject,
    getProjectById,
} from "@/app/services/allApi";

import { useSnackbar } from "@/app/services/snackbarContext";

/* ---------------- TYPES ---------------- */
interface ProjectFormValues {
    name: string;
    status: string;
}

/* ---------------- VALIDATION ---------------- */
const ProjectSchema = Yup.object({
    name: Yup.string().required("Project name is required"),
    status: Yup.string().required("Status is required"),
});

export default function AddProject() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { showSnackbar } = useSnackbar();

    // Backend sends the project identifier as `uuid` (fallback to `id` just in case)
    const projectId = searchParams.get("uuid") || searchParams.get("id");
    const isEditMode = Boolean(projectId);

    const [loading, setLoading] = useState(false);

    const [initialValues, setInitialValues] = useState<ProjectFormValues>({
        name: "",
        status: "1",
    });

    /* ---------------- FETCH PROJECT (EDIT MODE) ---------------- */
    useEffect(() => {
        if (!isEditMode || !projectId) return;

        const fetchProject = async () => {
            setLoading(true);
            try {
                const res = await getProjectById(projectId);
                // Normalize various possible shapes returned by API
                const project =
                    res?.data?.data?.project ??
                    res?.data?.data ??
                    res?.data?.project ??
                    res?.data ??
                    res;

                const name = project?.name ?? project?.project_name ?? "";
                const status = project?.status ?? project?.active_status ?? project?.is_active ?? "1";

                if (name || status !== undefined) {
                    setInitialValues({
                        name,
                        status: String(status ?? "1"),
                    });
                } else {
                    console.warn("Project data structure mismatch:", res);
                    showSnackbar("Project data not loaded (structure mismatch)", "error");
                }
            } catch (error) {
                console.error("Fetch project error:", error);
                showSnackbar("Failed to load project details", "error");
            } finally {
                setLoading(false);
            }
        };

        fetchProject();
    }, [projectId, isEditMode, showSnackbar]);


    /* ---------------- SUBMIT HANDLER ---------------- */
    const handleSubmit = async (
        values: ProjectFormValues,
        { setSubmitting }: FormikHelpers<ProjectFormValues>
    ) => {
        const payload = {
            name: values.name.trim(),
            status: Number(values.status),
        };

        try {
            if (isEditMode && projectId) {
                await editProject(projectId, payload);
                showSnackbar("Project updated successfully ✅", "success");
            } else {
                await addProject(payload);
                showSnackbar("Project added successfully ✅", "success");
            }

            router.push("/settings/manageAssets/project");
        } catch (error) {
            console.error("Submit error:", error);
            showSnackbar("Something went wrong", "error");
        } finally {
            setSubmitting(false);
        }
    };

    /* ---------------- LOADING STATE ---------------- */
    if (loading) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <Loading />
            </div>
        );
    }

    /* ---------------- UI ---------------- */
    return (
        <div className="w-full h-full overflow-x-hidden p-4">
            {/* HEADER */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <Link href="/settings/manageAssets/project">
                        <Icon icon="lucide:arrow-left" width={24} />
                    </Link>
                    <h1 className="text-xl font-semibold text-gray-900">
                        {isEditMode ? "Edit Project" : "Add Project"}
                    </h1>
                </div>
            </div>

            <Formik
                enableReinitialize
                initialValues={initialValues}
                validationSchema={ProjectSchema}
                onSubmit={handleSubmit}
            >
                {({
                    handleSubmit,
                    values,
                    setFieldValue,
                    errors,
                    touched,
                    isSubmitting,
                }) => (
                    <Form onSubmit={handleSubmit}>
                        <ContainerCard>
                            <h2 className="text-lg font-medium text-gray-800 mb-4">
                                {isEditMode ? "Edit Project" : "Project Add"}
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Project Name */}
                                <InputFields
                                    required
                                    label="Project Name"
                                    value={values.name}
                                    onChange={(e) =>
                                        setFieldValue("name", e.target.value)
                                    }
                                    error={
                                        touched.name && errors.name
                                            ? errors.name
                                            : false
                                    }
                                />

                                {/* Status */}
                                <InputFields
                                    required
                                    type="radio"
                                    label="Status"
                                    value={values.status}
                                    options={[
                                        { value: "1", label: "Active" },
                                        { value: "0", label: "Inactive" },
                                    ]}
                                    onChange={(e) =>
                                        setFieldValue("status", e.target.value)
                                    }
                                    error={
                                        touched.status && errors.status
                                            ? errors.status
                                            : false
                                    }
                                />
                            </div>
                        </ContainerCard>

                        {/* ACTION BUTTONS */}
                        <div className="flex justify-end gap-4 mt-6">
                            <button
                                type="button"
                                onClick={() =>
                                    router.push(
                                        "/settings/manageAssets/project"
                                    )
                                }
                                className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
                            >
                                Cancel
                            </button>

                            <SidebarBtn
                                type="submit"
                                leadingIcon="mdi:check"
                                isActive
                                disabled={isSubmitting}
                                label={
                                    isSubmitting
                                        ? isEditMode
                                            ? "Updating..."
                                            : "Submitting..."
                                        : isEditMode
                                            ? "Update"
                                            : "Submit"
                                }
                            />
                        </div>
                    </Form>
                )}
            </Formik>
        </div>
    );
}
