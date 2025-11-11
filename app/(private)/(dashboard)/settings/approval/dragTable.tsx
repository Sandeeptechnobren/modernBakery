"use client";

import React, { useState } from "react";
import InputFields from "@/app/components/inputFields";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Button from "@mui/material/Button";
import { Icon } from "@iconify-icon/react";
import Toggle from "@/app/components/toggle";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import { customer } from "@/app/(private)/data/customerDetails";

type OptionType = { value: string; label: string };

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
  conditionType: string; // AND / OR
  relatedSteps: string[]; // multi-selection
  formType: string; // New field
  selectedRole?: any;
  selectedCustomer?: any;
}

const targetTypeOptions: OptionType[] = [
  { value: "1", label: "Role" },
  { value: "2", label: "Customer" },
];

const roleOptions: OptionType[] = [
  { value: "r1", label: "Admin" },
  { value: "r2", label: "Manager" },
  { value: "r3", label: "Employee" },
];

const customerOptions: OptionType[] = [
  { value: "c1", label: "Customer A" },
  { value: "c2", label: "Customer B" },
];

const conditionOptions: OptionType[] = [
  { value: "AND", label: "AND (All must approve)" },
  { value: "OR", label: "OR (Any one can approve)" },
];

const formTypeOptions: OptionType[] = [
  { value: "F1", label: "Sales Form" },
  { value: "F2", label: "Purchase Form" },
  { value: "F3", label: "Expense Form" },
];

export default function ApprovalFlowTable({roleListData,usersData,steps,setSteps}: {roleListData:OptionType[],usersData:OptionType[],steps:ApprovalStep[],setSteps:React.Dispatch<React.SetStateAction<ApprovalStep[]>>}) {
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState<any>({
    formType: "",
    targetType: "",
    role_id:"",
    selectedRole:{},
    selectedCustomer:{},
    customer_id:"",
    allowApproval: false,
    allowReject: false,
    returnToStepNo: false,
    canEditBeforeApproval: false,
    approvalMessage: "",
    notificationMessage: "",
    conditionType: "AND",
    relatedSteps: [],
  });

  const handleAddOrUpdate = () => {
    if (!form.targetType || !form.customer_id && !form.role_id)
      return alert("Please select target type and role/customer!");

    if (editingId) {
      setSteps((prev) =>
        prev.map((s) => (s.id === editingId ? { ...s, ...form } : s))
      );
      setEditingId(null);
    } else {
      const newStep: ApprovalStep = { id: Date.now().toString(), ...form };
      setSteps([...steps, newStep]);
    }

    setForm({
      formType: "",
      targetType: "",
      roleOrCustomer: "",
      allowApproval: false,
      allowReject: false,
      returnToStepNo: false,
      canEditBeforeApproval: false,
      approvalMessage: "",
      notificationMessage: "",
      conditionType: "AND",
      relatedSteps: [],
    });
  };

  const handleEdit = (id: string) => {
    const step = steps.find((s) => s.id === id);
    if (step) {
      setForm(step);
      setEditingId(id);
    }
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setSteps((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const updateCondition = (id: string, condition: string) => {
    setSteps((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, conditionType: condition } : s
      )
    );
  };

  const updateRelatedSteps = (id: string, selectedIds: string[]) => {
    setSteps((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, relatedSteps: selectedIds } : s
      )
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* === Form Section === */}
      <div className="bg-white shadow-md rounded-2xl p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          {/* New Form Type */}
          <InputFields
            required
            label="Form Type"
            name="formType"
            value={form.formType}
            isSingle={true}
            options={formTypeOptions}
            width="full"
            onChange={(e) =>
              setForm({ ...form, formType: e.target.value })
            }
          />

          <InputFields
            required
            label="Target Type"
            name="targetType"
            value={form.targetType}
            isSingle={true}
            options={targetTypeOptions}
            width="full"
            onChange={(e) =>
              setForm({
                ...form,
                targetType: e.target.value,
                roleOrCustomer: "",
              })
            }
          />
        </div>

        {/* Role / Customer */}
        {form.targetType && (
          <div className="grid grid-cols-2 gap-4 mt-2">
            {form.targetType === "1" && (
              <InputFields
                required
                label="Role"
                name="roleOrCustomer"
                value={form.role_id}
                isSingle={true}
                options={roleListData}
                width="full"
                onChange={(e) =>
                {
                  console.log("role id",e.target),
                  setForm({ ...form, role_id: e.target.value,selectedRole: e.target })
                  // setForm({ ...form, selectedRole: e.target })

                }
                }
              />
            )}
            {form.targetType === "2" && (
              <InputFields
                required
                label="Customer"
                name="customer_id"
                value={form.customer_id}
                isSingle={true}
                options={usersData}
                width="full"
                onChange={(e) =>
                {
                  console.log("role id",e),

                  setForm({ ...form, customer_id: e.target.value,selectedCustomer:e.target })
                  // setForm({ ...form, selectedCustomer: e.target })

                }
                }
              />
            )}
          </div>
        )}

        {/* Checkboxes */}
        <div className="grid grid-cols-4 gap-2 mt-3">
          {[
            "allowApproval",
            "allowReject",
            "returnToStepNo",
            "canEditBeforeApproval",
          ].map((key) => (
            <label
              key={key}
              className="flex items-center space-x-2 bg-white-50 p-2 rounded-md border border-gray-500"
            >
              <input
                type="checkbox"
                checked={form[key]}
                 className="appearance-none w-5 h-5 border-2 border-gray-400 rounded-md 
               checked:bg-[var(--primary-btn-color)] checked:border-[var(--primary-btn-color)] 
               cursor-pointer transition-all duration-200"
                onChange={(e) =>
                  setForm({ ...form, [key]: e.target.checked })
                }
              />
              <span className="capitalize text-sm text-gray-700">
                {key.replace(/([A-Z])/g, " $1")}
              </span>
            </label>
          ))}
        </div>

        {/* Messages */}
        <div className="grid grid-cols-2 gap-4">
          <InputFields
            required
            width="full"
            label="Approval Message"
            value={form.approvalMessage}
            onChange={(e) =>
              setForm({ ...form, approvalMessage: e.target.value })
            }
          />

          <InputFields
            required
            width="full"
            label="Notification Message"
            value={form.notificationMessage}
            onChange={(e) =>
              setForm({ ...form, notificationMessage: e.target.value })
            }
          />
        </div>

        <SidebarBtn
          onClick={handleAddOrUpdate}
          className="bg-[]-600 text-white"
          isActive={true}
         
        >
          {editingId ? "Update Step" : "Add Step"}
        </SidebarBtn>
      </div>

      {/* === Table === */}
      <div className="bg-white shadow rounded-2xl p-4 overflow-x-auto">
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext
            items={steps.map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            <table className="table-auto min-w-max w-full text-sm">
              <thead>
                <tr className="relative h-[44px] border-b-[1px] border-[#E9EAEB]">
                  <th className="p-2">Step</th>
                  <th className="p-2">Form Type</th>
                  <th className="p-2">Target Type</th>
                  <th className="p-2">Role/Customer</th>
                  <th className="p-2 text-center">Approval</th>
                  <th className="p-2 text-center">Reject</th>
                  <th className="p-2 text-center">Return</th>
                  <th className="p-2 text-center">Edit Before</th>
                  <th className="p-2">Condition</th>
                  <th className="p-2">Related Steps</th>
                  <th className="p-2">Approval Msg</th>
                  <th className="p-2">Notification Msg</th>
                  <th className="p-2 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {steps.map((step, idx) => (
                  <SortableRow
                    key={step.id}
                    step={step}
                    index={idx}
                    allSteps={steps}
                    onEdit={handleEdit}
                    onConditionChange={updateCondition}
                    onRelatedStepsChange={updateRelatedSteps}
                  />
                ))}
              </tbody>
            </table>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}

function SortableRow({
  step,
  index,
  allSteps,
  onEdit,
  onConditionChange,
  onRelatedStepsChange,
}: {
  step: ApprovalStep;
  index: number;
  allSteps: ApprovalStep[];
  onEdit: (id: string) => void;
  onConditionChange: (id: string, condition: string) => void;
  onRelatedStepsChange: (id: string, selected: string[]) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: step.id });

  const style = { transform: CSS.Transform.toString(transform), transition };

  const relatedOptions = allSteps
    .filter((s) => s.id !== step.id)
    .map((s, i) => ({
      value: s.id,
      label: `Step ${i + 1} - ${s.roleOrCustomer}`,
    }));

  return (
    <tr  className="text-[14px] bg-white text-[#535862]">
      <td ref={setNodeRef} style={style} {...attributes} {...listeners} className="p-2 text-center font-semibold">{index + 1}</td>
      <td className="px-[24px] py-[12px] bg-white   ">{step.formType}</td>
      <td className="px-[24px] py-[12px] bg-white   ">{step.targetType === "1" ? "Role" : "Customer"}</td>
      <td className="px-[24px] py-[12px] bg-white   ">{step?.selectedCustomer?.name || step?.selectedRole?.name}</td>
      <td className="px-[24px] py-[12px] bg-white    text-center">
        <Toggle isChecked={step.allowApproval} onChange={() => {}} disabled={true} />
      </td>
      <td className="px-[24px] py-[12px] bg-white    text-center">
        <Toggle isChecked={step.allowReject} onChange={() => {}} disabled={true} />
      </td>
      <td className="px-[24px] py-[12px] bg-white    text-center">
        <Toggle isChecked={step.returnToStepNo} onChange={() => {}} disabled={true} />
      </td>
      <td className="px-[24px] py-[12px] bg-white    text-center">
        <Toggle isChecked={step.canEditBeforeApproval} onChange={() => {}} disabled={true} />
      </td>

      {/* === Condition Select === */}
      <td className="px-[24px] py-[12px] bg-white   ">
        <select
          value={step.conditionType}
          onChange={(e) => onConditionChange(step.id, e.target.value)}
          className="border p-1 rounded w-full"
        >
          <option value="AND">AND</option>
          <option value="OR">OR</option>
        </select>
      </td>

      {/* === Related Steps Multi Select === */}
      <td className="px-[24px] py-[12px] bg-white   ">

        <InputFields
               
                name="roleOrCustomer"
                value={step.relatedSteps}
                isSingle={false}
                options={customerOptions}
                width="full"
                onChange={()=>{}}
                // onChange={(e:any) =>
            // onRelatedStepsChange(
            //   step.id,
            //   Array.from(e.target?.selectedOptions, (opt:any) => opt.value)
            // )
          // }
              />
      </td>

      <td className="px-[24px] py-[12px] bg-white   ">{step.approvalMessage}</td>
      <td className="px-[24px] py-[12px] bg-white   ">{step.notificationMessage}</td>
      <td className="px-[24px] py-[12px] bg-white    text-center">
        <SidebarBtn
          onClick={() => onEdit(step.id)}
          className="text-blue-600 hover:text-blue-800"
        >
          <Icon icon="mdi:pencil" width="20" height="20" />
        </SidebarBtn>
      </td>
    </tr>
  );
}
