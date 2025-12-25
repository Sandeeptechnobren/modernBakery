"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Draggable from "react-draggable";
import BorderIconButton from "@/app/components/borderIconButton";
import DeleteConfirmPopup from "@/app/components/deletePopUp";
import InputFields from "@/app/components/inputFields";
import { camelToTitleCase } from "@/app/(private)/utils/text";
import { approveWorkflow, editBeforeApprovalWorkflow, rejectWorkflow, returnBackWorkflow, workFlowRequest } from "@/app/services/allApi";
import { useSnackbar } from "@/app/services/snackbarContext";
import DeletePrompt from "./approvalPrompt";

interface ApprovalData {
  request_id?: number | null;
  permissions?: string[];
  message?: string;
  confirmationMessage?: string;
}

interface WorkflowApprovalActionsProps {
  requestStepId?: number | null;
  permissions?: string[];
  message?: string;
  confirmationMessage?: string;
  redirectPath?: string;
  model?: string;
  uuid?: string;
  onSuccess?: () => void;
  /**
   * Optional hook to intercept an approve click.
   * If it returns true, default approve confirmation + API call will be skipped.
   */
  onApproveIntercept?: () => boolean | Promise<boolean>;
  setIsUserHavePermission?: React.Dispatch<React.SetStateAction<boolean>>;
}

const requireCommentActions = ["reject", "returnBack"] as const;
type ActionType = "approve" | "reject" | "returnBack" | "editBeforeApproval";
type CommentRequiredAction = typeof requireCommentActions[number];

type LoadingState = Record<ActionType, boolean>;

const defaultLoading: LoadingState = {
  approve: false,
  reject: false,
  returnBack: false,
  editBeforeApproval: false,
};

export default function WorkflowApprovalActions({
  requestStepId,
  permissions,
  message,
  confirmationMessage,
  redirectPath,
  onSuccess,
  model,
  uuid = "",
  onApproveIntercept,
  setIsUserHavePermission
}: WorkflowApprovalActionsProps) {
  const router = useRouter();
  const { showSnackbar } = useSnackbar();

  const [orderData, setOrderData] = useState<ApprovalData>({});
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [approvalName, setApprovalName] = useState<ActionType | "">("");
  const [comment, setComment] = useState<{ show: boolean; text: string; action?: ActionType }>(
    { show: false, text: "", action: undefined }
  );
  const commentRef = useRef(comment);
  const [loadingWorkflow, setLoadingWorkflow] = useState<LoadingState>(defaultLoading);
  const currentActionRef = useRef<ActionType | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const dragNodeRef = useRef<HTMLDivElement>(null);

  // Keep comment ref in sync
  useEffect(() => {
    commentRef.current = comment;
  }, [comment]);

  // Load persisted workflow data if caller didn't supply permissions/message
  useEffect(() => {
    // Only fetch if we don't have permissions passed as props and we have the required data
    if (permissions || !model || !requestStepId) return;
    
    (async () => {
      try {
        const res = await workFlowRequest({ model, request_step_id: requestStepId?.toString() });
        setOrderData(res.data[0]);
      } catch (e) {
        // ignore parse issues
    }})();
  }, [model, requestStepId, permissions]);
  const effectivePermissions = useMemo(
    () => permissions ?? orderData.permissions ?? [],
    [permissions, orderData?.permissions]
  );
  const effectiveRequestId = useMemo(
    () => requestStepId ?? orderData?.request_id ?? null,
    [requestStepId, orderData?.request_id]
  );
  const effectiveMessage = message ?? orderData?.message;
  const effectiveConfirmation = confirmationMessage ?? orderData?.confirmationMessage;

  const getCommentPrompt = (abortSignal?: AbortSignal) => {
    return new Promise<void>((resolve, reject) => {
      const check = () => {
        if (abortSignal?.aborted) {
          reject(new DOMException("Operation was aborted", "AbortError"));
          return;
        }
        if (!commentRef.current.show) {
          resolve();
        } else {
          setTimeout(check, 100);
        }
      };
      setTimeout(check, 50);
    });
  };

  const workflowAction = async (action: ActionType) => {
    setShowDeletePopup(false);
    if (!effectiveRequestId || effectivePermissions.length === 0) return;
    if (loadingWorkflow[action]) return;

    const isApiInProgress = Object.values(loadingWorkflow).some((l) => l) && !comment.show;
    if (isApiInProgress && currentActionRef.current !== action) {
      showSnackbar("Please wait for the current action to complete", "warning");
      return;
    }

    if (abortControllerRef.current && currentActionRef.current !== action) {
      abortControllerRef.current.abort();
      if (currentActionRef.current) {
        setLoadingWorkflow((prev) => ({ ...prev, [currentActionRef.current!]: false }));
      }
    }

    currentActionRef.current = action;
    abortControllerRef.current = new AbortController();
    const currentAbortController = abortControllerRef.current;
    setLoadingWorkflow((prev) => ({ ...prev, [action]: true }));

    if (comment.show && comment.action !== action) {
      setComment({ show: false, text: "", action: undefined });
      await new Promise((resolve) => setTimeout(resolve, 100));
      if (currentAbortController.signal.aborted || currentActionRef.current !== action) {
        setLoadingWorkflow((prev) => ({ ...prev, [action]: false }));
        return;
      }
    }

    if (requireCommentActions.includes(action as CommentRequiredAction)) {
      setComment({ show: true, text: "", action });
      await new Promise((resolve) => setTimeout(resolve, 100));

      if (currentAbortController.signal.aborted || currentActionRef.current !== action) {
        setComment({ show: false, text: "", action: undefined });
        return;
      }

      try {
        await getCommentPrompt(currentAbortController.signal);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          setComment({ show: false, text: "", action: undefined });
          return;
        }
        throw error;
      }

      if (currentAbortController.signal.aborted || currentActionRef.current !== action) {
        setComment({ show: false, text: "", action: undefined });
        return;
      }
    }

    try {
      const userId = localStorage.getItem("userId") || "";
      let res;

      switch (action) {
        case "approve":
          res = await approveWorkflow({ request_step_id: effectiveRequestId, approver_id: userId });
          break;
        case "reject":
          res = await rejectWorkflow({ request_step_id: effectiveRequestId, approver_id: userId, comment: commentRef.current.text });
          break;
        case "returnBack":
          res = await returnBackWorkflow({ request_step_id: effectiveRequestId, approver_id: userId, comment: commentRef.current.text });
          break;
        case "editBeforeApproval":
          res = await editBeforeApprovalWorkflow({ request_step_id: effectiveRequestId, approver_id: userId });
          break;
        default:
          res = null;
      }

      if (currentAbortController.signal.aborted || currentActionRef.current !== action) return;

      if (res && (res as any).error) {
        showSnackbar((res as any).data?.message || "Action failed", "error");
      } else {
        showSnackbar("Action performed successfully", "success");
        if (onSuccess) {
          onSuccess();
        } else if (redirectPath) {
          try {
            router.push(redirectPath);
          } catch (e) {
            // ignore navigation errors
          }
        }
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      showSnackbar("An error occurred while processing the action", "error");
    } finally {
      setLoadingWorkflow((prev) => ({ ...prev, [action]: false }));
      setComment({ show: false, text: "", action: undefined });
      if (currentActionRef.current === action) {
        currentActionRef.current = null;
        abortControllerRef.current = null;
      }
    }
  };

  const hasPermissions = effectivePermissions && effectivePermissions.length > 0;
  useEffect(() => {
    if (setIsUserHavePermission) {
      setIsUserHavePermission(hasPermissions);
    }
  }, [hasPermissions, setIsUserHavePermission]);

  if (!hasPermissions || !effectiveRequestId) {
    return null;
  }

  return (
    <Draggable nodeRef={dragNodeRef} cancel="button, input, textarea, select">
      <div
        ref={dragNodeRef}
        style={{ zIndex: 30 }}
        className="absolute bottom-20 left-1/2 -translate-x-1/2 backdrop-blur-xs bg-black/10 border border-white/30 shadow-lg rounded-xl p-8 text-black z-[60px] cursor-grab active:cursor-grabbing select-none"
      >
      {comment.show && (
        <div className="w-full p-5 bg-white rounded-lg mb-4 opacity-100">
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              setComment({ ...comment, show: false });
            }}
          >
            <span className="mb-5">{camelToTitleCase(comment.action || "")}</span>
            <InputFields
              type="textarea"
              label="Comment"
              width="100%"
              onChange={(e) => setComment({ ...comment, text: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  setComment({ ...comment, show: false });
                }
              }}
              value={comment.text}
            />
          </form>
        </div>
      )}

      {effectiveMessage && (
        <div className="text-gray-600 mb-4">
          <span className="font-medium">{effectiveMessage}</span>
        </div>
      )}

      <div className="flex gap-4 flex-wrap">
        {effectivePermissions.includes("APPROVE") && (
          <BorderIconButton
            icon={loadingWorkflow.approve ? "line-md:loading-loop" : "mdi:tick"}
            label={"Approve"}
            labelTw="font-medium text-[12px]"
            onClick={() => {
              (async () => {
                if (onApproveIntercept) {
                  const intercepted = await onApproveIntercept();
                  if (intercepted) return;
                }
                setApprovalName("approve");
                setShowDeletePopup(true);
              })();
            }}
            disabled={
              loadingWorkflow.approve ||
              (Object.values(loadingWorkflow).some((l) => l) && !comment.show)
            }
          />
        )}
        {effectivePermissions.includes("REJECT") && (
          <BorderIconButton
            icon={loadingWorkflow.reject ? "line-md:loading-loop" : "mdi:times"}
            label={"Reject"}
            labelTw="font-medium text-[12px]"
            onClick={() => {
              setApprovalName("reject");
              setShowDeletePopup(true);
            }}
            disabled={
              loadingWorkflow.reject ||
              (Object.values(loadingWorkflow).some((l) => l) && !comment.show)
            }
          />
        )}
        {effectivePermissions.includes("RETURN_BACK") && (
          <BorderIconButton
            icon={loadingWorkflow.returnBack ? "line-md:loading-loop" : "lets-icons:back"}
            label={"Return Back"}
            labelTw="font-medium text-[12px]"
            onClick={() => {
              setApprovalName("returnBack");
              setShowDeletePopup(true);
            }}
            disabled={
              loadingWorkflow.returnBack ||
              (Object.values(loadingWorkflow).some((l) => l) && !comment.show)
            }
          />
        )}
        {effectivePermissions.includes("EDIT_BEFORE_APPROVAL") && (
          <BorderIconButton
            icon={loadingWorkflow.editBeforeApproval ? "line-md:loading-loop" : "lucide:edit-2"}
            label={"Edit Before Approval"}
            labelTw="font-medium text-[12px]"
            onClick={() => {
              setApprovalName("editBeforeApproval");
              setShowDeletePopup(true);
            }}
            disabled={
              loadingWorkflow.editBeforeApproval ||
              (Object.values(loadingWorkflow).some((l) => l) && !comment.show)
            }
          />
        )}
      </div>

      {showDeletePopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <DeletePrompt
            message={"Are you sure you want to " + camelToTitleCase(approvalName || "") + "?"}
            title={effectiveConfirmation}
            onClose={() => setShowDeletePopup(false)}
            onConfirm={() => approvalName && workflowAction(approvalName as ActionType)}
          />
        </div>
      )}
      </div>
    </Draggable>
  );
}
