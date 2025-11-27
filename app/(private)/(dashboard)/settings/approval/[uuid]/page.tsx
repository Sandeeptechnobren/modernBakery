"use client";

import StepperForm, { useStepperForm, StepperStep } from "@/app/components/stepperForm";
import ContainerCard from "@/app/components/containerCard";
import InputFields from "@/app/components/inputFields";
import { useEffect, useState } from "react";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useParams, useRouter } from "next/navigation";
import * as Yup from "yup";
import Link from "next/link";
import { Icon } from "@iconify-icon/react";
import Loading from "@/app/components/Loading";
// import ApprovalFlowTable from "./dragTable";
import ApprovalFlowTable from "./dragTable";
import { submenuList, roleList, userList, approvalAdd, singleWorkFlowList, approvalWorkfolowUpdate } from "@/app/services/allApi";
// import {VerticalArrow} from "./proccessFlow";

type OldStep = {
    id: string;
    formType: string[];
    condition: string;
    targetType: string;
    selectedRole?: string[] | [];
    selectedCustomer?: string[] | [];
    role_id?: string[] | [];
    customer_id?: string[] | [];
    approvalMessage: string;
    notificationMessage: string;
};

type OldFlow = {
    approvalName: string;
    description: string;
    formType: string;
    status: string;
    steps: OldStep[];
};

type NewStep = {
    step_order: number;
    title: string;
    approval_type: string;
    message: string | null;
    notification: string | null;
    permissions: string[];
    user_ids: number[];
    role_ids?: number[];
};

type NewFlow = {
    name: string;
    description: string;
    is_active: boolean;
    steps: NewStep[];
};

function convertWorkflow(oldData: any) {


    return {
        workflow_id:oldData.workflow_id,
        approvalName: oldData.name,
        description: oldData.description,
        status: oldData.is_active ? "1" : "0",
        steps: oldData.steps.map((step: any) => {
           
           const useIds: any = []
 const roleIds: any = []

            step.approvers
                .filter((a: any) => {
                    if (a.type === "USER") {
                        useIds.push(a.user_id.toString())
                    }



                })

                 step.approvers
                .filter((a: any) => {
                    if (a.type === "ROLE") {
                        roleIds.push(a.role_id.toString())
                    }



                })

            return {
                ...step,
                id:step.step_order,
                step_order: step.step_order,
                title: step.title,
                condition: step.approval_type,
                approvalMessage: step.message,
                notificationMessage: step.notification,
                targetType: step.approvers.filter((a: any) => a.type === "USER").length > 0 ? "2" : "1",
                selectedCustomer: step.approvers.filter((a: any) => a.type === "USER").length>0?useIds:[],
                formType:step.permissions,
                
                selectedRole: step.approvers.filter((a: any) => a.type !== "USER").length>0?roleIds:[]
            }
        })


    };
}


export function convertToNewFlow(old: any): any {
    return {
        workflow_id:old.workflow_id,
        name: old.approvalName,
        description: old.description,
        is_active: old.status === "1",

        steps: old.steps.map((step:any, index:any) => {
            // convert permissions
            const permissions: string[] = step.formType
            // approval type
            const approvalType = step.condition || "OR";

            // title logic
            const title = `Step ${index + 1}`;

            return {
                ...step,

                step_order: index + 1,
                id:index + 1,
                title: title,
                approval_type: approvalType,
                message: step.approvalMessage || null,
                notification: step.notificationMessage || null,
                permissions: permissions,
                user_ids: (step.selectedCustomer ?? step.customer_id ?? []).map(Number),
                role_ids: (step.selectedRole ?? step.role_id ?? []).map(Number)
            };
        })
    };
}

// Dummy module, role, and user data for now
// const modulesList = [
//     { value: "1", label: "Master" },
//     { value: "2", label: "Customer" },
//     { value: "3", label: "Sales" },
//     { value: "4", label: "Inventory" },
// ];

const rolesList = [
    { id: 1, roleName: "Admin" },
    { id: 2, roleName: "Manager" },
    { id: 3, roleName: "Employee" },
];

const usersByRole = {
    Admin: ["Rohit", "Aman", "Priya"],
    Manager: ["Simran", "Karan"],
    Employee: ["Vivek", "Neha", "Rahul"],
};

interface ApprovalFormValues {
    approvalName: string;
    description: string;
    // modules: string;
    formType: "create" | "edit" | "create_or_edit";
    role: string;
    users: string[];
    status: string;
    priority: string;
}

const ApprovalSchema = Yup.object().shape({
    approvalName: Yup.string().required("Approval name is required"),
    description: Yup.string().required("Description is required"),
    // modules: Yup.string().required(),
    formType: Yup.string().required("Form type is required"),
    role: Yup.string().required("Role is required"),
    status: Yup.string().required("Role is required"),
    users: Yup.array().min(1, "Select at least one user").required(),
    priority: Yup.number().min(1).max(4).required("Priority is required"),
});

export default function AddApprovalFlow() {
    const steps: StepperStep[] = [
        { id: 1, label: "Basic Details" },
        { id: 2, label: "Roles & Users" },
    ];
    interface ApprovalStep {
        id: string;
        targetType: string;
        roleOrCustomer: string;
        allowApproval: boolean;
        allowReject: boolean;
        returnToStepNo: boolean;
        canEditBeforeApproval: boolean;
        approvalMessage: string;
        notificationMessage: string;
        condition: string; // condition expression or type (e.g. "AND" | "OR")
        conditionType: string; // AND / OR
        relatedSteps: string[]; // multi-selection
        formType: string | string[]; // allow both string and string[] to match dragTable prop types
    }
    const [stepsProccess, setStepsProcess] = useState<ApprovalStep[]>([]);
    const params = useParams();
  const uuid = params?.uuid as string;
    

    const [modulesList, setModulesList] = useState<{ value: string; label: string }[]>([]);
    const [roleListData, setRoleListData] = useState<{ value: string; label: string }[]>([]);
    const [usersData, setUsersData] = useState<{ value: string; label: string }[]>([]);

    const { currentStep, nextStep, prevStep, markStepCompleted, isStepCompleted, isLastStep } =
        useStepperForm(steps.length);
    const { showSnackbar } = useSnackbar();
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState<any>({
        approvalName: "",
        description: "",
        status: "1",
    });

    const [errors, setErrors] = useState<Partial<Record<keyof ApprovalFormValues, string>>>({});
    const [touched, setTouched] = useState<Partial<Record<keyof ApprovalFormValues, boolean>>>({});

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setForm((prev: any) => ({ ...prev, [name]: value }));
        setTouched((prev) => ({ ...prev, [name]: true }));
        setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[name as keyof ApprovalFormValues];
            return newErrors;
        });
    };

    //   const handleModuleToggle = (moduleName: string) => {
    //     setForm((prev) => {
    //       const modules = prev.modules.includes(moduleName)
    //         ? prev.modules.filter((m) => m !== moduleName)
    //         : [...prev.modules, moduleName];
    //       return { ...prev, modules };
    //     });
    //   };
    async function apiCall()
    {
         const data = await singleWorkFlowList(uuid)
         const store = data.data
         console.log(store,"hii252")
  const flow: any = convertWorkflow(store)
        console.log(flow,"25")
       
        setForm(flow)
        console.log(flow.steps, "flow.steps")
        setStepsProcess(flow.steps)
    }

    useEffect(() => {
        const store: any = localStorage.getItem("selectedFlow")
        if(uuid)
        {
      apiCall()
        }

    }, [])

    const handleUserToggle = (user: string) => {
        setForm((prev: any) => {
            const users = prev.users.includes(user)
                ? prev.users.filter((u: any) => u !== user)
                : [...prev.users, user];
            return { ...prev, users };
        });
    };

    const validateCurrentStep = async (step: number) => {
        // Perform step-specific validation so users can't advance without
        // filling required fields for the current step.
        try {
            if (step === 1) {
                // Only validate the basic details shown on step 1
                const Step1Schema = Yup.object().shape({
                    approvalName: Yup.string().required("Approval name is required"),
                    description: Yup.string().required("Description is required"),
                    // modules: Yup.string().required("Module is required"),
                    status: Yup.string().required("Status is required"),
                });
                await Step1Schema.validate(form, { abortEarly: false });

                setErrors((prev) => {
                    const next = { ...prev };
                    delete next.approvalName;
                    delete next.description;
                    delete next.status;
                    return next;
                });
                return true;
            }

            if (step === 2) {
                // Step 2 requires at least one approval step configured
                if (!Array.isArray(stepsProccess) || stepsProccess.length === 0) {
                    setErrors((prev) => ({ ...prev, stepsProccess: "Define at least one approval step" } as any));
                    return false;
                }
                // clear any previous stepsProccess error
                setErrors((prev) => {
                    const next = { ...prev };
                    delete (next as any).stepsProccess;
                    return next;
                });
                return true;
            }

            // default to true for unknown steps
            return true;
        } catch (err) {
            if (err instanceof Yup.ValidationError) {
                const stepErrors: Partial<Record<keyof ApprovalFormValues, string>> = {};
                err.inner.forEach((validationErr) => {
                    if (validationErr.path) stepErrors[validationErr.path as keyof ApprovalFormValues] = validationErr.message;
                });
                setErrors((prev) => ({ ...prev, ...stepErrors }));
                setTouched((prev) => ({ ...prev, ...Object.fromEntries(Object.keys(stepErrors).map((k) => [k, true])) }));
                return false;
            }
            return false;
        }
    };

    const handleNext = async () => {
        const valid = await validateCurrentStep(currentStep);
        if (valid) {
            markStepCompleted(currentStep);
            nextStep();
        }
    };

    const handleSubmit = async () => {
        // Validate all steps and the full form before submitting
        const step1Valid = await validateCurrentStep(1);
        const step2Valid = await validateCurrentStep(2);
        // console.log("Submitting Data:", { ...form, steps: stepsProccess });
        const newFormData: any = { ...form, steps: stepsProccess }
        const result: any = convertToNewFlow(newFormData)
        // if (!step1Valid || !step2Valid) {
        //     showSnackbar("Please fix validation errors before submitting.", "error");
        //     return;
        // }

        try {
            // Full form schema validation
            // await ApprovalSchema.validate(form, { abortEarly: false });
            setLoading(true);
            const resultData = await approvalWorkfolowUpdate(result)

            console.log("Submitting Data:", resultData);
            // setLoading(false)
            if(resultData.success)
            {
            showSnackbar("Approval Flow Updated Successfully ✅", "success");
            setLoading(false);
            router.push("/settings/approval");

            }
            else{
            showSnackbar("Something went wrong.", "error");

            }
        }
        catch (err) {
            console.log(err)
        }
    };
    const fetchSubmenuList = async () => {
        try {
            const res = await submenuList();
            const subMenuListDta: { value: string, label: string }[] = []
            res.data.map((item: { id: number, name: string }) => {
                subMenuListDta.push({ value: item.id.toString(), label: item.name });
            });
            console.log("submenu list", res.data);
            setModulesList(subMenuListDta);
        }
        catch (err) {

        }
    }

    const fetchUsersRoleWise = async () => {
        try {

            const res = await roleList();
            console.log("role list", res.data);
            const roleListDta: { value: string, label: string }[] = []
            res.data.map((item: { id: number, name: string }) => {
                roleListDta.push({ value: item.id.toString(), label: item.name });

            })

            setRoleListData(roleListDta);
            // API call to fetch users based on roleName can be implemented here
            // For now, we are using the dummy data defined above
        }
        catch (err) {

        }
    }

    const fetchUsersList = async () => {
        try {

            const res = await userList();
            console.log("role list", res.data);
            const usersDataList: { value: string, label: string }[] = []
            res.data.map((item: { id: number, name: string }) => {
                usersDataList.push({ value: item.id.toString(), label: item.name });

            })

            setUsersData(usersDataList);

            // API call to fetch users based on roleName can be implemented here
            // For now, we are using the dummy data defined above
        }
        catch (err) {

        }
    }

    useEffect(() => {
        fetchSubmenuList();
        fetchUsersRoleWise();
        fetchUsersList();
        // Fetch any initial data if needed
    }, []);

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <ContainerCard>
                        <h2 className="text-lg font-semibold mb-6">Basic Details</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputFields
                                required
                                label="WorkFlow Name"
                                name="approvalName"
                                value={form.approvalName}
                                onChange={handleChange}
                                error={touched.approvalName && errors.approvalName}
                                width="full"
                            />
                            <InputFields
                                required
                                label="Description"
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                error={touched.description && errors.description}
                                width="full"

                            />

                            <div>
                                <InputFields
                                    required
                                    label="Status"
                                    name="status"
                                    type="radio"
                                    value={form.status}
                                    onChange={(e) => setForm({ ...form, status: e.target.value })}
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

                    </ContainerCard>
                );


            case 2:
                const availableUsers = usersByRole[form.role as keyof typeof usersByRole] || [];
                return (
                    <><ApprovalFlowTable roleListData={roleListData} usersData={usersData} steps={stepsProccess} setSteps={setStepsProcess} /></>
                );

            default:
                return null;
        }
    };

    if (loading)
        return (
            <div className="flex justify-center items-center h-screen">
                <Loading />
            </div>
        );

    return (
        <>
            <div className="flex items-center gap-2 mb-4">
                <Link href="/settings/approval">
                    <Icon icon="lucide:arrow-left" width={24} />
                </Link>
                <h1 className="text-xl font-semibold text-gray-900">Update Approval Flow</h1>
            </div>
            <StepperForm
                steps={steps.map((s) => ({ ...s, isCompleted: isStepCompleted(s.id) }))}
                currentStep={currentStep}
                onBack={prevStep}
                onNext={handleNext}
                onSubmit={handleSubmit}
                showNextButton={!isLastStep}
                showSubmitButton={isLastStep}
                nextButtonText="Save & Next"
                submitButtonText="Submit"
            >
                {renderStepContent()}
            </StepperForm>

            {/* <VerticalArrow/> */}
        </>
    );
}
