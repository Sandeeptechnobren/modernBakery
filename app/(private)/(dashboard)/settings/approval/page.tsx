"use client";

import Table, {
    listReturnType,
    searchReturnType,
    TableDataType,
} from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import StatusBtn from "@/app/components/statusBtn2";
import { workFlowList } from "@/app/services/allApi";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
    const router = useRouter();

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
        },
        {
            key: "is_active",
            label: "Status",
            render: (row: TableDataType) => (
                <StatusBtn isActive={row.is_active ? true : false} />
            ),
        },
        {
            key: "steps",
            label: "Total Steps",
            render: (data: TableDataType) => data.steps?.length || 0,
        },
        {
            key: "step_summary",
            label: "Step Details",
            width: 300,
            render: (data: any) => {
                const step = data.steps?.[0];
                if (!step) return "-";
                return (
                    <span className="text-sm text-gray-600">
                        {step.title} ({step.approval_type}) – {step.approvers.length} approvers
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
       const pageData:any =  await workFlowList()
       console.log(pageData,"pageData")
        return {
            data: pageData.data,
            currentPage: 1,
            pageSize:50,
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
                        title: "Workflows",
                        // searchBar: true,
                        columnFilter: true,
                        actions: [
                            <SidebarBtn
                                key={0}
                                href="/settings/approval/addWorkflow"
                                isActive={true}
                                leadingIcon="lucide:plus"
                                label="Add"
                                labelTw="hidden sm:block"
                            />,<SidebarBtn
                                key={1}
                                href="/settings/approval/assignworkflow"
                                isActive={true}
                                leadingIcon="lucide:plus"
                                label="Assign Workflow"
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
                                localStorage.setItem("selectedFlow",JSON.stringify(row))
                                router.push(`/settings/approval/${row.uuid}`);
                            },
                        },
                    ],
                    pageSize: 10,
                }}
            />
        </div>
    );
}
