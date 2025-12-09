"use client";

import React, { useState, useEffect } from "react";
import InputFields from "@/app/components/inputFields";
import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Icon } from "@iconify-icon/react";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import { authUserList } from "@/app/services/allApi";

type OptionType = { value: string; label: string };

type SelectedOption = OptionType | null;

interface ApprovalStep {
  id: string;
  stepId:string;
  targetType: string;
  condition: string;
  roleOrCustomer: string;
  allowApproval: boolean;
  allowReject: boolean;
  returnToStepNo: boolean;
  canEditBeforeApproval: boolean;
  approvalMessage: string;
  notificationMessage: string;
  confirmationMessage: string;
  conditionType: string; // AND / OR
  relatedSteps: string[]; // multi-selection
  formType: string[] | string; // allow array or single value
  selectedRole?: SelectedOption[];
  selectedCustomer?: SelectedOption[];
}

interface User {
  id: string | number;
  name: string;
}


const targetTypeOptions: OptionType[] = [
  { value: "1", label: "Role" },
  { value: "2", label: "User" },
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
  { value: "AND", label: "AND" },
  { value: "OR", label: "OR" },
];

const formTypeOptions: OptionType[] = [
  { value: "ADD", label: "ADD" },
  { value: "APPROVE", label: "APPROVE" },
  { value: "REJECT", label: "REJECT" },
  { value: "UPDATE", label: "UPDATE" },
  { value: "RETURN_BACK", label: "RETURN_BACK" },
];

export default function ApprovalFlowTable({ roleListData, usersData, steps, setSteps }: { roleListData: OptionType[], usersData: OptionType[], steps: ApprovalStep[], setSteps: React.Dispatch<React.SetStateAction<ApprovalStep[]>> }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [userOptions, setUserOptions] = useState<OptionType[]>([]);

  type FormState = {
    formType: string[];
    condition: string;
    targetType: string;
    role_id?: string;
    selectedRole?: SelectedOption[];
    selectedCustomer?: SelectedOption[];
    customer_id?: string;
    allowApproval: boolean;
    allowReject: boolean;
    returnToStepNo: boolean;
    canEditBeforeApproval: boolean;
    approvalMessage: string;
    notificationMessage: string;
    confirmationMessage: string;
    conditionType: string;
    relatedSteps: string[];
  };

  const [form, setForm] = useState<any>({
    formType: [],
    condition: "",
    targetType: "",
    role_id: undefined,
    selectedRole: [],
    selectedCustomer: [],
    customer_id: undefined,
    allowApproval: false,
    allowReject: false,
    returnToStepNo: false,
    canEditBeforeApproval: false,
    approvalMessage: "",
    notificationMessage: "",
    confirmationMessage: "",
    conditionType: "",
    relatedSteps: [],
  });

  const handleAddOrUpdate = () => {
    if (!form.targetType || (!form.customer_id && !form.role_id))
      return alert("Please select target type and role/customer!");

    if (editingId) {
      const flags = {
        allowApproval: (form.formType || []).includes("APPROVE"),
        allowReject: (form.formType || []).includes("REJECT"),
        returnToStepNo: (form.formType || []).includes("RETURN_BACK"),
        canEditBeforeApproval: (form.formType || []).includes("UPDATE"),
      };
      setSteps((prev) =>
        prev.map((s) => (s.id === editingId ? { ...s, ...form, ...flags } : s))
      );
      setEditingId(null);
    } else {
      // ensure boolean flags are set according to selected form types
      const flags = {
        allowApproval: (form.formType || []).includes("APPROVE"),
        allowReject: (form.formType || []).includes("REJECT"),
        returnToStepNo: (form.formType || []).includes("RETURN_BACK"),
        canEditBeforeApproval: (form.formType || []).includes("UPDATE"),
      };
      const newStep: ApprovalStep = { id: Date.now().toString(), ...form, ...flags } as ApprovalStep;
      setSteps([...steps, newStep]);
    }

    setForm({
      formType: [],
      condition: "",
      targetType: "",
      role_id: undefined,
      selectedRole: [],
      selectedCustomer: [],
      customer_id: undefined,
      allowApproval: false,
      allowReject: false,
      returnToStepNo: false,
      canEditBeforeApproval: false,
      approvalMessage: "",
      notificationMessage: "",
      confirmationMessage: "",
      conditionType: "",
      relatedSteps: [],
    });
  };

  const handleEdit = (id: string) => {
    const step = steps.find((s) => s.id === id);
    if (step) {
      // normalize formType to array and keep boolean flags
      setForm({
        ...step,
        formType: Array.isArray(step.formType) ? step.formType : step.formType ? [String(step.formType)] : [],
        selectedRole: step.selectedRole ?? [],
        selectedCustomer: step.selectedCustomer ?? [],
      } as FormState);
      setEditingId(id);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setSteps((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over?.id);
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

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await authUserList({});

        const usersData: OptionType[] = (res?.data ?? []).map((user: User) => ({
          value: String(user.id),
          label: user.name,
        }));
        setUserOptions(usersData);
      } catch (err) {
        console.error(err);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="p-6 space-y-6">
      {/* === Form Section === */}
      <div className="bg-white shadow-md rounded-2xl p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          {/* New Form Type */}
          <InputFields
            required
            label="Permissions"
            multiSelectChips={true}
            name="formType"
            value={form.formType}
            isSingle={false}
            options={formTypeOptions}
            width="full"
            onChange={(e: unknown) => {
              // Normalize InputFields output which may be an array of strings
              let selected: string[] = [];
              if (Array.isArray(e)) {
                selected = e as string[];
              } else if (typeof e === 'object' && e !== null && 'target' in e) {
                const target = (e as unknown as { target?: { value?: string | string[]; selectedOptions?: HTMLCollectionOf<HTMLOptionElement> } }).target;
                if (Array.isArray(target?.value)) {
                  selected = target.value as string[];
                } else if (target?.selectedOptions) {
                  selected = Array.from(target.selectedOptions as HTMLCollectionOf<HTMLOptionElement>).map((o) => o.value);
                } else if (typeof target?.value === 'string' && target.value !== '') {
                  selected = [target.value];
                }
              }
              const flags = {
                allowApproval: selected.includes("APPROVE"),
                allowReject: selected.includes("REJECT"),
                returnToStepNo: selected.includes("RETURN_BACK"),
                canEditBeforeApproval: selected.includes("UPDATE"),
              };
              setForm({ ...form, formType: selected, ...flags });
            }}
          />
          <InputFields
            required
            label="Target Type"
            name="targetType"
            value={form.targetType}
            isSingle={true}
            options={targetTypeOptions}
            width="full"
            onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
              setForm({
                ...form,
                targetType: e.target.value,
                role_id: undefined,
                customer_id: undefined,
                selectedRole: [],
                selectedCustomer: [],
              })
            }
          />
          {form.targetType && (
            <>
              {form.targetType === "1" && (
                <InputFields
                  required
                  label="Role"
                  name="roleOrCustomer"
                  value={form.role_id}
                  isSingle={false}
                  options={roleListData}
                  width="full"
                  onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
                    const val = e.target.value;
                    const selected = roleListData.find((r) => r.value === val) ?? null;
                    console.log(e.target.value, "mlk")

                    setForm({ ...form, role_id: val, selectedRole: e.target.value });
                  }}
                />
              )}
              {form.targetType === "2" && (
                <InputFields
                  required
                  label="User"
                  name="user_id"
                  value={form.customer_id}
                  isSingle={false}
                  options={userOptions}
                  width="full"
                  onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
                    const val = e.target.value;
                    const selected = userOptions.find((u) => u.value === val) ?? null;
                    console.log(e.target.value, "mlk")
                    setForm({ ...form, customer_id: val, selectedCustomer: e.target.value });
                  }}
                />
              )}

            </>
          )}
          {form.targetType ? <InputFields
            required
            label="Condition"
            name="condition"
            value={form.condition}
            isSingle={true}
            options={conditionOptions}
            width="full"
            onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
              setForm({ ...form, condition: e.target.value })
            }
          /> : ""}
        </div>
        {/* {form.targetType?   <div className="grid grid-cols-2 gap-4">

        <InputFields
                required
                label="Optional Approval Roles"
              
                name="roleOrCustomer"
                value={form.role_id}
                isSingle={false}
                options={roleListData}
                width="full"
                onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
                  const val = e.target.value;
                  const selected = roleListData.find((r) => r.value === val) ?? null;
                  setForm({ ...form, role_id: val, selectedRole: selected });
                }}
              />

               <InputFields
                required
                label="User"
                name="user_id"
                value={form.customer_id}
                isSingle={false}
                options={userOptions}
                width="full"
                onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
                  const val = e.target.value;
                  const selected = userOptions.find((u) => u.value === val) ?? null;
                  setForm({ ...form, customer_id: val, selectedCustomer: selected });
                }}
              />
              </div>:""} */}

        {/* Role / Customer */}


        {/* Checkboxes */}
        {/* <div className="grid grid-cols-4 gap-2 mt-3">
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
        </div> */}

        {/* Messages */}
        <div className="grid grid-cols-2 gap-4">
          <InputFields
            required
            width="full"
            label="Approval Status"
            value={form.approvalMessage}
            onChange={(e) =>
              setForm({ ...form, approvalMessage: (e as React.ChangeEvent<HTMLInputElement>).target.value })
            }
          />

          <InputFields
            required
            width="full"
            label="Notification Message"
            value={form.notificationMessage}
            onChange={(e) =>
              setForm({ ...form, notificationMessage: (e as React.ChangeEvent<HTMLInputElement>).target.value })
            }
          />
           <InputFields
            required
            width="full"
            label="Confirmation Message"
            value={form.confirmationMessage}
            onChange={(e) =>
              setForm({ ...form, confirmationMessage: (e as React.ChangeEvent<HTMLInputElement>).target.value })
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
            items={steps.map((s) => s.stepId)}
            strategy={verticalListSortingStrategy}
          >
            <table className="table-auto min-w-max w-full text-sm">
              <thead>
                <tr className="relative h-[44px] border-b-[1px] border-[#E9EAEB]">
                  <th className="p-2">Step</th>
                  <th className="p-2">Form Type</th>
                  <th className="p-2">Target Type</th>
                  <th className="p-2">Role</th>
                  <th className="p-2">User</th>

                  {/* <th className="p-2 text-center">Approval</th>
                  <th className="p-2 text-center">Reject</th>
                  <th className="p-2 text-center">Return</th>
                  <th className="p-2 text-center">Edit Before</th> */}
                  <th className="p-2 text-center">Condition</th>
                  {/* <th className="p-2">Related Steps</th> */}
                  <th className="p-2">Approval Msg</th>
                  <th className="p-2">Notification Msg</th>
                  <th className="p-2">Confirmation  Msg</th>
                  <th className="p-2 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {steps.map((step, idx) => {

                  console.log(step, "hii461")


                  return (
                    <SortableRow
                      key={step.id}
                      step={step}
                      index={idx}
                      allSteps={steps}
                      onEdit={handleEdit}
                      onConditionChange={updateCondition}
                      onRelatedStepsChange={updateRelatedSteps}
                      roleOptions={roleListData}
                      userOptions={userOptions}
                    />
                  )
                })}
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
  roleOptions,
  userOptions,
}: {
  step: any;
  index: number;
  allSteps: ApprovalStep[];
  onEdit: (id: string) => void;
  onConditionChange: (id: string, condition: string) => void;
  onRelatedStepsChange: (id: string, selected: string[]) => void;
  roleOptions: OptionType[];
  userOptions: OptionType[];
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
    <tr className="text-[14px] bg-white text-[#535862]">
      <td draggable={true} ref={setNodeRef} style={style} {...attributes} {...listeners} className="p-2 text-center font-semibold">{index + 1}</td>
      <td className="px-[24px] py-[12px] bg-white   ">{Array.isArray(step.formType) ? step.formType.join(", ") : step.formType}</td>
      <td className="px-[24px] py-[12px] bg-white   ">{step.targetType === "1" ? "Role" : "User"}</td>
      <td className="px-[24px] py-[12px] bg-white   ">{step.targetType === "1" ? <InputFields

        value={step.selectedRole}
        isSingle={false}
        options={roleOptions}
        width="full"
        onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => { }}
      /> : "-"}</td>
      <td className="px-[24px] py-[12px] bg-white   ">{step.targetType === "2" ? <InputFields

        value={step.selectedCustomer}
        isSingle={false}
        options={userOptions}
        width="full"
        onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => { }}
      /> : "-"}</td>

      <td className="px-[24px] py-[12px] bg-white   ">{step.condition}</td>
      {/* === Related Steps Multi Select === */}

      <td className="px-[24px] py-[12px] bg-white   ">{step.approvalMessage}</td>
      <td className="px-[24px] py-[12px] bg-white   ">{step.notificationMessage}</td>
      <td className="px-[24px] py-[12px] bg-white   ">{step.confirmationMessage}</td>
      <td className="px-[24px] py-[12px] bg-white    text-center">
        <SidebarBtn
          onClick={() => onEdit(step.id)}
          className="text-red-600 hover:text-red-800"
        >
          <Icon icon="mdi:pencil" width="20" height="20" />
        </SidebarBtn>
      </td>
    </tr>
  );
}
