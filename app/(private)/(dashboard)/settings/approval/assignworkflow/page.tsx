"use client";

import Table, {
    listReturnType,
    searchReturnType,
    TableDataType,
} from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import StatusBtn from "@/app/components/statusBtn2";
import { assignWorkFlowsToSubmenu, submenuList, workFlowAssignList, workFlowList } from "@/app/services/allApi";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import { useFormik } from "formik";
import * as Yup from "yup";

import { useEffect, useState } from "react";
import InputFields from "@/app/components/inputFields";

// ---- Your JSON pasted here ----
// const WORKFLOW_DATA:any = [
//     {
//         workflow_id: 6,
//         name: "tested",
//         description: "sdfdsf",
//         is_active: true,
//         steps: [
//             {
//                 id: 12,
//                 step_order: 1,
//                 title: "Step 1",
//                 approval_type: "AND",
//                 message: "dfsf",
//                 notification: "sfdf",
//                 approvers: [
//                     { type: "ROLE", role_id: 81 },
//                     { type: "ROLE", role_id: 82 },
//                     { type: "ROLE", role_id: 85 },
//                     { type: "ROLE", role_id: 86 },
//                     { type: "ROLE", role_id: 87 },
//                     { type: "ROLE", role_id: 1 },
//                     { type: "ROLE", role_id: 84 },
//                     { type: "ROLE", role_id: 83 },
//                     { type: "ROLE", role_id: 88 },
//                     { type: "ROLE", role_id: 89 }
//                 ]
//             },
//             {
//                 id: 13,
//                 step_order: 2,
//                 title: "Step 2",
//                 approval_type: "OR",
//                 message: "asdasdds",
//                 notification: "asddsa",
//                 approvers: [
//                     { type: "USER", user_id: 43, name: "Role Test Data" }
//                 ]
//             }
//         ]
//     },
//     {
//         workflow_id: 5,
//         name: "Test AND-OR Flow",
//         description: "Flow to test AND/OR/return/skip/reassign",
//         is_active: true,
//         steps: [
//             {
//                 id: 9,
//                 step_order: 1,
//                 title: "Team Review",
//                 approval_type: "OR",
//                 message: "Team can review",
//                 notification: "Review pending",
//                 approvers: [
//                     { type: "USER", user_id: 5, name: "Amit" },
//                     { type: "USER", user_id: 6, name: "Amit" }
//                 ]
//             },
//             {
//                 id: 10,
//                 step_order: 2,
//                 title: "Finance Approval",
//                 approval_type: "AND",
//                 message: "Finance must approve",
//                 notification: "Finance approval required",
//                 approvers: [
//                     { type: "USER", user_id: 38, name: "Sales Person 1" },
//                     { type: "USER", user_id: 33, name: "annodiya" }
//                 ]
//             },
//             {
//                 id: 11,
//                 step_order: 3,
//                 title: "Final Signoff",
//                 approval_type: "OR",
//                 message: "Final signoff",
//                 notification: null,
//                 approvers: [
//                     { type: "USER", user_id: 6, name: "Amit" },
//                     { type: "ROLE", role_id: 1 }
//                 ]
//             }
//         ]
//     }
// ];

// -----------------------------------------------

export default function WorkflowTable() {
    const [refreshKey, setRefreshKey] = useState(0);
    const [open, setOpen] = useState(false)
    const [workFlowList, setWorkflowList] = useState([])
    const [modulesList, setModulesList] = useState<any>([])

    const formik = useFormik({
    initialValues: {
        workflow_id: "",
        // process_type: "",
        process_id: "",
    },

    validationSchema: Yup.object({
        workflow_id: Yup.string().required("Workflow is required"),
        // process_type: Yup.string().required("Process Type is required"),
        process_id: Yup.number()
            .typeError("Process ID must be a number")
            .required("Process ID is required"),
    }),

    onSubmit: async(values) => {
        console.log("✨ Final Submitted Values:", values);
        const workflowType = modulesList.filter((ids:any)=>ids.value == values.process_id)[0]?.label

        const data = await assignWorkFlowsToSubmenu({...values,process_type:workflowType})

        if(data.success)
        {
            setOpen(false)
        }
    },
});



    useEffect(() => {
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
        fetchSubmenuList()
    }, [])

    // ------------------ COLUMNS --------------------
    const columns = [
        {
            key: "name",
            label: "Workflow Name",
            render: (data: TableDataType) => (
                <span className="font-semibold text-[#181D27] text-[14px]">
                    {data.name}
                </span>
            ),
        },
        {
            key: "description",
            label: "Description",
            
            render: (data: TableDataType) => data.description || "-",
        }
        // {
        //     key: "steps",
        //     label: "Total Steps",
        //     render: (data: TableDataType) => data.steps?.length || 0,
        // },
        ,{
            key: "assigned_to",
            label: "Assigned To",
            width: 300,
            render: (data: any) => {
                const step = data.assigned_to?.map((ids:any)=>ids.model_name).join(",")
                if (!step) return "-";
                return (
                    <span className="text-sm text-gray-600">
                        {step}
                    </span>
                );
            },
        },
    ];

    // ------------------ LOCAL LIST FUNCTION -----------------
    const fetchWorkflows = async (
        pageNo: number = 1,
        pageSize: number = 10
    ): Promise<listReturnType> => {
        const start = (pageNo - 1) * pageSize;
        const end = start + pageSize;

        // WORKFLOW_DATA.slice(start, end);
        const pageData: any = await workFlowAssignList()
        console.log(pageData, "pageData")
        const workFlowListData: any = []
        pageData.data.map((dta: any) => {
            workFlowListData.push({
                value: dta.workflow_id,
                label: dta.name
            })


        })
        setWorkflowList(workFlowListData)
        return {
            data: pageData.data,
            currentPage: 1,
            pageSize: 50,
            total: 1,
        };
    };

    // ------------------ SEARCH FUNCTION ----------------------
    // const searchWorkflow = async (
    //     query: string
    // ): Promise<searchReturnType> => {
    //     const filtered = WORKFLOW_DATA.filter((item) =>
    //         item.name.toLowerCase().includes(query.toLowerCase())
    //     );

    //     return {
    //         data: filtered,
    //         total: 1,
    //         currentPage: 1,
    //         pageSize: filtered.length,
    //     };
    // };

    return (
        <div className="flex flex-col h-full">
            <Table
                refreshKey={refreshKey}
                config={{
                    api: {
                        list: fetchWorkflows,
                        // search: searchWorkflow,
                    },
                    header: {
                        title: "Assign Workflow",
                        // searchBar: true,
                        columnFilter: true,
                        actions: [
                            <SidebarBtn
                                key={0}
                                onClick={() => setOpen(true)}
                                isActive={true}
                                leadingIcon="lucide:plus"
                                label="Add"
                                labelTw="hidden sm:block"
                            />
                        ],
                    },
                    localStorageKey: "workflow-table",
                    footer: {
                        nextPrevBtn: true,
                        pagination: true,
                    },
                    columns,
                    rowSelection: true,
                    rowActions: [
                        {
                            icon: "lucide:edit-2",
                            onClick: (row: TableDataType) => {
                                window.location.href = `/settings/approval/${row.uuid}`;
                                localStorage.setItem("selectedFlow", JSON.stringify(row))
                            },
                        },
                    ],
                    pageSize: 10,
                }}
            />

            <Drawer anchor="right" open={open} onClose={() => setOpen(false)}>
    <div className="w-[350px] p-[10px] text-lg font-semibold">
        Assign Workflow
    </div>

    <Divider />

    <div className="w-[350px] p-[10px]">
        <form onSubmit={formik.handleSubmit} className="space-y-4">

            {/* Workflow */}
            <InputFields
                required
                label="Workflow"
                name="workflow_id"
                isSingle={true}
                options={workFlowList}
                value={formik.values.workflow_id}
                onChange={(e: any) => {
                    formik.setFieldValue("workflow_id", e.target.value);
                }}
                error={formik.touched.workflow_id && formik.errors.workflow_id}
                width="full"
            />

            {/* Process Type */}
            <InputFields
                required
                label="Process Type"
                name="process_type"
                isSingle={true}
                options={modulesList}
                value={formik.values.process_id}
                onChange={(e: any) => {
                    formik.setFieldValue("process_id", e.target.value);
                }}
                error={formik.touched.process_id && formik.errors.process_id}
                width="full"
            />

            {/* Process ID */}
            {/* <InputFields
                required
                label="Process ID"
                name="process_id"
                type="number"
                value={formik.values.process_id}
                onChange={(e: any) =>
                    formik.setFieldValue("process_id", e.target.value)
                }
                error={formik.touched.process_id && formik.errors.process_id}
                width="full"
            /> */}

            <SidebarBtn
                label={formik.isSubmitting ? "Submitting..." : "Submit"}
                isActive={!formik.isSubmitting}
                leadingIcon="mdi:check"
                type="submit"
                disabled={formik.isSubmitting}
            />
        </form>
    </div>
</Drawer>

        </div>
    );
}
